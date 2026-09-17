<?php
require_once '../../config/config.php';
require_once '../../config/database.php';
require_once '../../config/upload.php';

if (!isLoggedIn()) {
    redirect('login.php');
}

$db = Database::getInstance();
$pago_id = intval($_GET['id'] ?? 0);
$contrato_id = intval($_GET['contrato'] ?? 0);

if ($pago_id <= 0) {
    setFlash('danger', 'ID de pago no válido');
    redirect('modules/contratos/comprobantes.php');
}

// Obtener información del pago
$stmt = $db->prepare("SELECT comprobante, contrato_id FROM pagos WHERE id = ? AND status = 'pendiente'");
$stmt->bind_param("i", $pago_id);
$stmt->execute();
$pago = $stmt->get_result()->fetch_assoc();

if (!$pago) {
    setFlash('danger', 'No se puede eliminar este comprobante o ya fue procesado');
    redirect('modules/contratos/comprobantes.php' . ($contrato_id > 0 ? '?contrato=' . $contrato_id : ''));
}

// Eliminar archivo físico si existe
if (!empty($pago['comprobante'])) {
    $filePath = rtrim($_SERVER['DOCUMENT_ROOT'], '/') . '/' . ltrim($pago['comprobante'], '/');
    deleteFile($filePath);
}

// Eliminar registro de la base de datos
$stmt = $db->prepare("DELETE FROM pagos WHERE id = ?");
$stmt->bind_param("i", $pago_id);

if ($stmt->execute()) {
    setFlash('success', 'Comprobante eliminado correctamente');
} else {
    setFlash('danger', 'Error al eliminar el comprobante: ' . $db->getConnection()->error);
}

redirect('modules/contratos/comprobantes.php' . ($contrato_id > 0 ? '?contrato=' . $contrato_id : ''));
exit();
?>