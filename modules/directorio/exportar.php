<?php
require_once '../../config/config.php';
require_once '../../config/database.php';
require_once '../../includes/auth.php';

requireLogin();

$db = Database::getInstance();
$conn = $db->getConnection();

$search_nombre    = trim($_GET['nombre'] ?? '');
$search_servicio  = trim($_GET['servicio'] ?? '');
$search_industria = trim($_GET['industria'] ?? '');
$search_status    = trim($_GET['status'] ?? '');

$sql = "SELECT id, identificacion, nombre_completo, email, telefono, direccion, nombre_empresa, servicios_ofrecidos, industria, status, fecha_registro 
        FROM clientes 
        WHERE 1=1";
$params = [];
$types  = "";

if ($search_nombre !== '') {
    $sql .= " AND (nombre_completo LIKE ? OR nombre_empresa LIKE ? OR identificacion LIKE ?)";
    $term = "%" . $search_nombre . "%";
    $params[] = $term;
    $params[] = $term;
    $params[] = $term;
    $types .= "sss";
}

if ($search_servicio !== '') {
    $sql .= " AND servicios_ofrecidos LIKE ?";
    $termServ = "%" . $search_servicio . "%";
    $params[] = $termServ;
    $types .= "s";
}

if ($search_industria !== '') {
    $sql .= " AND industria = ?";
    $params[] = $search_industria;
    $types .= "s";
}

if ($search_status !== '') {
    $sql .= " AND status = ?";
    $params[] = $search_status;
    $types .= "s";
}

$sql .= " ORDER BY nombre_completo ASC";

$stmt = $conn->prepare($sql);
if (!empty($params)) {
    $stmt->bind_param($types, ...$params);
}
$stmt->execute();
$result = $stmt->get_result();

$filename = "directorio_emprendedores_codigo58_" . date('Y-m-d_His') . ".csv";

// Configurar encabezados HTTP para descarga directa
header('Content-Type: text/csv; charset=UTF-8');
header('Content-Disposition: attachment; filename="' . $filename . '"');
header('Pragma: no-cache');
header('Expires: 0');

// Abrir stream de salida
$output = fopen('php://output', 'w');

// Escribir BOM UTF-8 para compatibilidad perfecta con Microsoft Excel
fprintf($output, chr(0xEF).chr(0xBB).chr(0xBF));

// Encabezados de columnas
fputcsv($output, [
    'ID',
    'Documento / Identificación',
    'Nombre del Emprendedor',
    'Razón Social / Empresa',
    'Servicios que Ofrece',
    'Teléfono',
    'Correo Electrónico',
    'Dirección Física',
    'Sector / Industria',
    'Estado',
    'Fecha de Registro'
], ';');

// Filas de datos
while ($row = $result->fetch_assoc()) {
    fputcsv($output, [
        $row['id'],
        $row['identificacion'] ?: 'S/I',
        $row['nombre_completo'],
        $row['nombre_empresa'] ?: 'N/A',
        $row['servicios_ofrecidos'] ?: 'No especificados',
        $row['telefono'] ?: 'N/A',
        $row['email'] ?: 'N/A',
        $row['direccion'] ?: 'N/A',
        $row['industria'] ?: 'N/A',
        ucfirst($row['status']),
        $row['fecha_registro']
    ], ';');
}

fclose($output);
exit;
