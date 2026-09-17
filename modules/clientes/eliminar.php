<?php
require_once '../../config/config.php';
require_once '../../config/database.php';

if (!isLoggedIn() || !hasRole(['direccion'])) {
    redirect('login.php');
}

$db = Database::getInstance();
$cliente_id = intval($_GET['id'] ?? 0);

if ($cliente_id == 0) {
    setFlash('danger', 'ID de emprendedor no válido');
    redirect('modules/clientes/');
}

// Verificar que el emprendedor existe
$stmt = $db->prepare("SELECT id, nombre_completo FROM clientes WHERE id = ?");
$stmt->bind_param("i", $cliente_id);
$stmt->execute();
$cliente = $stmt->get_result()->fetch_assoc();

if (!$cliente) {
    setFlash('danger', 'Emprendedor no encontrado');
    redirect('modules/clientes/');
}

// Verificar que no tenga datos relacionados
$hasRelations = false;
$tables = ['asesorias', 'procesos_legales', 'contratos', 'interacciones'];
foreach ($tables as $table) {
    $stmt = $db->prepare("SELECT COUNT(*) as total FROM $table WHERE cliente_id = ?");
    $stmt->bind_param("i", $cliente_id);
    $stmt->execute();
    $result = $stmt->get_result()->fetch_assoc();
    if ($result['total'] > 0) {
        $hasRelations = true;
        break;
    }
}

if ($hasRelations) {
    setFlash('danger', 'No se puede eliminar el emprendedor porque tiene datos relacionados (asesorías, procesos legales, contratos o interacciones)');
    redirect('modules/clientes/ver.php?id=' . $cliente_id);
}

// Eliminar emprendedor
$stmt = $db->prepare("DELETE FROM clientes WHERE id = ?");
$stmt->bind_param("i", $cliente_id);

if ($stmt->execute()) {
    setFlash('success', 'Emprendedor eliminado exitosamente');
} else {
    setFlash('danger', 'Error al eliminar el emprendedor');
}

redirect('modules/clientes/');
?>