<?php
require_once '../../config/config.php';
require_once '../../config/database.php';
require_once '../../includes/auth.php';

requireLogin();

if (!isModuloActivo('reportes')) {
    setFlash('warning', 'Acceso no autorizado.');
    redirect('index.php');
}

$db = Database::getInstance();
$conn = $db->getConnection();

$fecha_desde = $_GET['fecha_desde'] ?? date('Y-01-01');
$fecha_hasta = $_GET['fecha_hasta'] ?? date('Y-m-d');

if (!preg_match('/^\d{4}-\d{2}-\d{2}$/', $fecha_desde)) $fecha_desde = date('Y-01-01');
if (!preg_match('/^\d{4}-\d{2}-\d{2}$/', $fecha_hasta)) $fecha_hasta = date('Y-m-d');

$filename = "reporte_general_codigo58_" . date('Y-m-d_His') . ".csv";

// Encabezados HTTP
header('Content-Type: text/csv; charset=UTF-8');
header('Content-Disposition: attachment; filename="' . $filename . '"');
header('Pragma: no-cache');
header('Expires: 0');

$output = fopen('php://output', 'w');

// BOM UTF-8 para Excel
fprintf($output, chr(0xEF).chr(0xBB).chr(0xBF));

// Encabezado del reporte
fputcsv($output, ['SISTEMA DE GESTION CODIGO-58 - REPORTE EJECUTIVO'], ';');
fputcsv($output, ['Fecha de Generacion:', date('d/m/Y H:i:s')], ';');
fputcsv($output, ['Periodo Evaluado:', "Desde: $fecha_desde | Hasta: $fecha_hasta"], ';');
fputcsv($output, [], ';');

// 1. SECCIÓN CONTRATOS
fputcsv($output, ['--- CONTRATOS Y BALANCE FINANCIERO ---'], ';');
fputcsv($output, ['Numero Contrato', 'Emprendedor', 'Comercial', 'Monto Total ($)', 'Anticipo ($)', 'Saldo ($)', 'Estado Pago', 'Estado Contrato', 'Fecha Firma'], ';');

$qContratos = $conn->prepare("
    SELECT c.numero_contrato, emp.nombre_completo as emprendedor, u.nombre as comercial,
           c.monto_total, c.anticipo, c.saldo_pendiente, c.estado_pago, c.estado_contrato, c.fecha_firma
    FROM contratos c
    JOIN clientes emp ON c.cliente_id = emp.id
    LEFT JOIN usuarios u ON c.comercial_id = u.id
    WHERE c.fecha_firma BETWEEN ? AND ?
    ORDER BY c.fecha_firma DESC
");
$qContratos->bind_param("ss", $fecha_desde, $fecha_hasta);
$qContratos->execute();
$resContratos = $qContratos->get_result();

$totMonto = 0; $totAnticipo = 0; $totSaldo = 0;
while ($r = $resContratos->fetch_assoc()) {
    $totMonto += floatval($r['monto_total']);
    $totAnticipo += floatval($r['anticipo']);
    $totSaldo += floatval($r['saldo_pendiente']);
    fputcsv($output, [
        $r['numero_contrato'],
        $r['emprendedor'],
        $r['comercial'] ?: 'Sin asignar',
        number_format($r['monto_total'], 2, ',', '.'),
        number_format($r['anticipo'], 2, ',', '.'),
        number_format($r['saldo_pendiente'], 2, ',', '.'),
        ucfirst($r['estado_pago']),
        ucfirst($r['estado_contrato']),
        $r['fecha_firma']
    ], ';');
}
fputcsv($output, ['TOTALES', '', '', number_format($totMonto, 2, ',', '.'), number_format($totAnticipo, 2, ',', '.'), number_format($totSaldo, 2, ',', '.'), '', '', ''], ';');
fputcsv($output, [], ';');

// 2. SECCIÓN ASESORÍAS
fputcsv($output, ['--- SESIONES DE ASESORIA ---'], ';');
fputcsv($output, ['ID', 'Emprendedor', 'Consultor', 'Tipo de Asesoria', 'Estado', 'Fecha Programada', 'Fecha Realizada'], ';');

$qAse = $conn->prepare("
    SELECT a.id, emp.nombre_completo as emprendedor, u.nombre as consultor, a.tipo, a.status, a.fecha_programada, a.fecha_realizada
    FROM asesorias a
    JOIN clientes emp ON a.cliente_id = emp.id
    JOIN usuarios u ON a.consultor_id = u.id
    WHERE a.fecha_programada BETWEEN ? AND ?
    ORDER BY a.fecha_programada DESC
");
$fDesdeFull = $fecha_desde . ' 00:00:00';
$fHastaFull = $fecha_hasta . ' 23:59:59';
$qAse->bind_param("ss", $fDesdeFull, $fHastaFull);
$qAse->execute();
$resAse = $qAse->get_result();

while ($r = $resAse->fetch_assoc()) {
    fputcsv($output, [
        $r['id'],
        $r['emprendedor'],
        $r['consultor'],
        $r['tipo'],
        ucfirst($r['status']),
        $r['fecha_programada'],
        $r['fecha_realizada'] ?: 'N/A'
    ], ';');
}
fputcsv($output, [], ';');

// 3. SECCIÓN PROCESOS LEGALES
fputcsv($output, ['--- TRAMITES Y PROCESOS LEGALES ---'], ';');
fputcsv($output, ['ID', 'Numero Expediente', 'Emprendedor', 'Gestor Juridico', 'Tipo de Tramite', 'Estado', 'Fecha Inicio', 'Fecha Finalizacion'], ';');

$qLeg = $conn->prepare("
    SELECT p.id, p.numero_expediente, emp.nombre_completo as emprendedor, u.nombre as gestor, p.tipo_tramite, p.status, p.fecha_inicio, p.fecha_finalizacion
    FROM procesos_legales p
    JOIN clientes emp ON p.cliente_id = emp.id
    LEFT JOIN usuarios u ON p.gestor_id = u.id
    WHERE p.fecha_inicio BETWEEN ? AND ?
    ORDER BY p.fecha_inicio DESC
");
$qLeg->bind_param("ss", $fecha_desde, $fecha_hasta);
$qLeg->execute();
$resLeg = $qLeg->get_result();

while ($r = $resLeg->fetch_assoc()) {
    fputcsv($output, [
        $r['id'],
        $r['numero_expediente'] ?: 'S/N',
        $r['emprendedor'],
        $r['gestor'] ?: 'Sin asignar',
        $r['tipo_tramite'],
        ucfirst($r['status']),
        $r['fecha_inicio'],
        $r['fecha_finalizacion'] ?: 'En curso'
    ], ';');
}

fclose($output);
exit;
