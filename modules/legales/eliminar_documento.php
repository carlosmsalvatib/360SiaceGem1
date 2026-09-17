<?php
require_once '../../config/config.php';
require_once '../../config/database.php';
require_once '../../config/upload.php';

if (!isLoggedIn() || !hasRole(['direccion', 'gestor_legal'])) {
    redirect('login.php');
}

$db = Database::getInstance();
$doc_id = intval($_GET['id'] ?? 0);
$proceso_id = intval($_GET['proceso'] ?? 0);

if ($doc_id <= 0) {
    setFlash('danger', 'ID de documento no válido');
    redirect('modules/legales/');
}

// Obtener ruta del archivo
$stmt = $db->prepare("SELECT ruta_archivo, proceso_legal_id FROM documentos_legales WHERE id = ?");
$stmt->bind_param("i", $doc_id);
$stmt->execute();
$doc = $stmt->get_result()->fetch_assoc();

if (!$doc) {
    setFlash('danger', 'Documento no encontrado');
    redirect('modules/legales/');
}

$proceso_target = $proceso_id > 0 ? $proceso_id : $doc['proceso_legal_id'];

// Eliminar archivo físico
if (!empty($doc['ruta_archivo'])) {
    $filePath = rtrim($_SERVER['DOCUMENT_ROOT'], '/') . '/' . ltrim($doc['ruta_archivo'], '/');
    deleteFile($filePath);
}

// Eliminar de base de datos
$stmtDel = $db->prepare("DELETE FROM documentos_legales WHERE id = ?");
$stmtDel->bind_param("i", $doc_id);

if ($stmtDel->execute()) {
    setFlash('success', 'Documento legal eliminado correctamente');
} else {
    setFlash('danger', 'Error al eliminar el documento: ' . $db->getConnection()->error);
}

redirect('modules/legales/documentos.php?id=' . $proceso_target);
exit();
?>
