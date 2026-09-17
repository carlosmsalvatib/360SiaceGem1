<?php
require_once '../../config/config.php';
require_once '../../config/database.php';

if (!isLoggedIn() || !hasRole(['direccion'])) {
    redirect('login.php');
}

$db = Database::getInstance();
$pago_id = intval($_GET['id'] ?? 0);
$action = sanitize($_GET['action'] ?? '');

if ($pago_id <= 0 || !in_array($action, ['verificar', 'rechazar'])) {
    setFlash('danger', 'Acción o identificador de pago no válido');
    redirect('modules/contratos/comprobantes.php');
}

// Obtener información del pago y del contrato asociado (corregido: c.id en lugar de c.contrato_id)
$stmt = $db->prepare("
    SELECT p.*, c.id as contrato_id_real, c.saldo_pendiente, c.estado_pago, c.numero_contrato
    FROM pagos p
    JOIN contratos c ON p.contrato_id = c.id
    WHERE p.id = ?
");
$stmt->bind_param("i", $pago_id);
$stmt->execute();
$pago = $stmt->get_result()->fetch_assoc();

if (!$pago) {
    setFlash('danger', 'Comprobante de pago no encontrado');
    redirect('modules/contratos/comprobantes.php');
}

$contrato_id = $pago['contrato_id_real'];

if ($action == 'verificar') {
    // 1. Verificar el pago
    $stmt = $db->prepare("UPDATE pagos SET status = 'verificado' WHERE id = ?");
    $stmt->bind_param("i", $pago_id);
    
    if ($stmt->execute()) {
        // 2. Actualizar saldo y estado del contrato
        $nuevo_saldo = max(0, $pago['saldo_pendiente'] - $pago['monto']);
        $estado_pago = ($nuevo_saldo == 0) ? 'pagado' : 'parcial';
        
        $stmtContrato = $db->prepare("
            UPDATE contratos 
            SET saldo_pendiente = ?, estado_pago = ? 
            WHERE id = ?
        ");
        $stmtContrato->bind_param("dsi", $nuevo_saldo, $estado_pago, $contrato_id);
        $stmtContrato->execute();
        
        setFlash('success', 'Comprobante verificado con éxito. Se acreditó $' . number_format($pago['monto'], 2) . ' al contrato ' . $pago['numero_contrato']);
    } else {
        setFlash('danger', 'Error al verificar el comprobante: ' . $db->getConnection()->error);
    }
} elseif ($action == 'rechazar') {
    $stmt = $db->prepare("UPDATE pagos SET status = 'rechazado' WHERE id = ?");
    $stmt->bind_param("i", $pago_id);
    
    if ($stmt->execute()) {
        setFlash('warning', 'Comprobante de pago rechazado.');
    } else {
        setFlash('danger', 'Error al rechazar el comprobante');
    }
}

redirect('modules/contratos/comprobantes.php?contrato=' . $contrato_id);
exit();
?>