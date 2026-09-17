<?php
require_once '../../config/config.php';
require_once '../../config/database.php';

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

$stmt = $db->prepare("UPDATE documentos_legales SET status = 'aprobado' WHERE id = ?");
$stmt->bind_param("i", $doc_id);

if ($stmt->execute()) {
    setFlash('success', 'Documento aprobado exitosamente en el expediente.');
} else {
    setFlash('danger', 'Error al aprobar el documento: ' . $db->getConnection()->error);
}

if ($proceso_id > 0) {
    redirect('modules/legales/documentos.php?id=' . $proceso_id);
} else {
    redirect('modules/legales/');
}
exit();
?>
