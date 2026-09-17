<?php
require_once '../../config/config.php';
require_once '../../config/database.php';

if (!isLoggedIn()) {
    redirect('login.php');
}

$db = Database::getInstance();

// Procesar eliminación segura
if (isset($_GET['action']) && $_GET['action'] === 'delete' && isset($_GET['id'])) {
    $cliente_id = intval($_GET['id']);
    
    // Verificar si tiene relaciones
    $hasRelations = false;
    $tables = ['asesorias', 'procesos_legales', 'contratos', 'interacciones'];
    foreach ($tables as $table) {
        $stmtCheck = $db->prepare("SELECT COUNT(*) as total FROM $table WHERE cliente_id = ?");
        $stmtCheck->bind_param("i", $cliente_id);
        $stmtCheck->execute();
        if ($stmtCheck->get_result()->fetch_assoc()['total'] > 0) {
            $hasRelations = true;
            break;
        }
    }
    
    if ($hasRelations) {
        setFlash('danger', 'No se puede eliminar el emprendedor porque tiene registros vinculados (asesorías, trámites legales, contratos o interacciones). Cambie su estatus a finalizado.');
    } else {
        $stmt = $db->prepare("DELETE FROM clientes WHERE id = ?");
        $stmt->bind_param("i", $cliente_id);
        if ($stmt->execute()) {
            setFlash('success', 'Emprendedor eliminado correctamente');
        } else {
            setFlash('danger', 'Error al eliminar el emprendedor: ' . $db->getConnection()->error);
        }
    }
    redirect('modules/clientes/');
}

// Obtener lista de emprendedores
$emprendedores = [];
$result = $db->query("
    SELECT c.*, u.nombre as asesor 
    FROM clientes c
    LEFT JOIN usuarios u ON c.usuario_id_creacion = u.id
    ORDER BY c.fecha_registro DESC
");

if ($result) {
    while ($row = $result->fetch_assoc()) {
        $emprendedores[] = $row;
    }
}

include '../../includes/header.php';
?>

<div class="row">
    <div class="col-12">
        <div class="card fade-in shadow-sm">
            <div class="card-header bg-white py-3 d-flex justify-content-between align-items-center">
                <h5 class="mb-0 fw-bold" style="color: var(--c58-navy);">
                    <i class="fas fa-user-tie text-primary me-2"></i> Gestión de Emprendedores
                </h5>
                <div class="d-flex gap-2">
                    <a href="<?php echo SITE_URL; ?>modules/directorio/" class="btn btn-outline-warning btn-sm">
                        <i class="fas fa-search"></i> Ver en Directorio
                    </a>
                    <a href="crear.php" class="btn btn-c58-teal btn-sm">
                        <i class="fas fa-plus"></i> Nuevo Emprendedor
                    </a>
                </div>
            </div>
            
            <div class="card-body p-4">
                <div class="table-responsive">
                    <table class="table table-hover datatable align-middle">
                        <thead>
                            <tr>
                                <th># ID</th>
                                <th>Identificación</th>
                                <th>Nombre del Emprendedor</th>
                                <th>Empresa / Negocio</th>
                                <th>Servicios que Ofrece</th>
                                <th>Contacto</th>
                                <th>Estado</th>
                                <th>Asesor</th>
                                <th class="text-end">Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            <?php foreach ($emprendedores as $emp): ?>
                            <tr>
                                <td><span class="text-muted fw-bold">#<?php echo $emp['id']; ?></span></td>
                                <td>
                                    <?php if (!empty($emp['identificacion'])): ?>
                                        <span class="badge bg-light text-dark border"><?php echo htmlspecialchars($emp['identificacion']); ?></span>
                                    <?php else: ?>
                                        <span class="text-muted small">Sin RIF</span>
                                    <?php endif; ?>
                                </td>
                                <td>
                                    <strong><?php echo htmlspecialchars($emp['nombre_completo']); ?></strong><br>
                                    <small class="text-muted"><?php echo htmlspecialchars($emp['industria'] ?: 'Sector no especificado'); ?></small>
                                </td>
                                <td>
                                    <strong><?php echo htmlspecialchars($emp['nombre_empresa'] ?: 'Persona Natural'); ?></strong>
                                </td>
                                <td>
                                    <?php if (!empty($emp['servicios_ofrecidos'])): ?>
                                        <small class="text-secondary d-block" style="max-width: 220px; white-space: normal;">
                                            <?php echo htmlspecialchars(substr($emp['servicios_ofrecidos'], 0, 75)) . (strlen($emp['servicios_ofrecidos']) > 75 ? '...' : ''); ?>
                                        </small>
                                    <?php else: ?>
                                        <span class="text-muted small">Pendiente de registro</span>
                                    <?php endif; ?>
                                </td>
                                <td>
                                    <small>
                                        <i class="fas fa-envelope text-muted me-1"></i> <?php echo htmlspecialchars($emp['email']); ?><br>
                                        <i class="fas fa-phone text-muted me-1"></i> <?php echo htmlspecialchars($emp['telefono'] ?: 'N/A'); ?>
                                    </small>
                                </td>
                                <td>
                                    <?php echo renderBadgeEstadoEmprendedor($emp['status']); ?>
                                </td>
                                <td>
                                    <small class="text-muted"><?php echo htmlspecialchars($emp['asesor'] ?: 'Sin asignar'); ?></small>
                                </td>
                                <td class="text-end">
                                    <div class="btn-group btn-group-sm">
                                        <a href="ver.php?id=<?php echo $emp['id']; ?>" class="btn btn-outline-info" title="Ver Ficha">
                                            <i class="fas fa-eye"></i>
                                        </a>
                                        <a href="editar.php?id=<?php echo $emp['id']; ?>" class="btn btn-outline-warning" title="Editar">
                                            <i class="fas fa-edit"></i>
                                        </a>
                                        <a href="?action=delete&id=<?php echo $emp['id']; ?>" class="btn btn-outline-danger btn-delete" 
                                           data-message="¿Está seguro de eliminar este emprendedor?">
                                            <i class="fas fa-trash"></i>
                                        </a>
                                    </div>
                                </td>
                            </tr>
                            <?php endforeach; ?>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    </div>
</div>

<?php include '../../includes/footer.php'; ?>