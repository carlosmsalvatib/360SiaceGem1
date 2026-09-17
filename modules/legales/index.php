<?php
require_once '../../config/config.php';
require_once '../../config/database.php';

if (!isLoggedIn()) {
    redirect('login.php');
}

$db = Database::getInstance();

// Procesar acciones
if (isset($_GET['action'])) {
    $id = intval($_GET['id'] ?? 0);
    switch ($_GET['action']) {
        case 'delete':
            if ($id > 0) {
                // Eliminar documentos primero
                $db->query("DELETE FROM documentos_legales WHERE proceso_legal_id = $id");
                $stmt = $db->prepare("DELETE FROM procesos_legales WHERE id = ?");
                $stmt->bind_param("i", $id);
                if ($stmt->execute()) {
                    setFlash('success', 'Proceso legal eliminado correctamente');
                } else {
                    setFlash('danger', 'Error al eliminar el proceso: ' . $db->getConnection()->error);
                }
                redirect('modules/legales/');
            }
            break;
            
        case 'completar':
            if ($id > 0) {
                $stmt = $db->prepare("UPDATE procesos_legales SET status = 'completado', fecha_finalizacion = NOW() WHERE id = ?");
                $stmt->bind_param("i", $id);
                if ($stmt->execute()) {
                    setFlash('success', 'Trámite legal completado exitosamente');
                } else {
                    setFlash('danger', 'Error al completar el proceso');
                }
                redirect('modules/legales/');
            }
            break;
    }
}

// Obtener procesos legales
$procesos = [];
$whereClause = "";

if ($_SESSION['rol'] == 'gestor_legal') {
    $whereClause = "WHERE p.gestor_id = " . intval($_SESSION['usuario_id']);
}

$query = "
    SELECT p.*, 
           c.nombre_completo as emprendedor_nombre,
           c.nombre_empresa,
           c.telefono,
           u.nombre as gestor_nombre,
           COUNT(d.id) as total_documentos
    FROM procesos_legales p
    JOIN clientes c ON p.cliente_id = c.id
    JOIN usuarios u ON p.gestor_id = u.id
    LEFT JOIN documentos_legales d ON p.id = d.proceso_legal_id
    $whereClause
    GROUP BY p.id
    ORDER BY p.fecha_inicio DESC
";

$result = $db->query($query);
if ($result) {
    while ($row = $result->fetch_assoc()) {
        $procesos[] = $row;
    }
}

include '../../includes/header.php';
?>

<div class="row">
    <div class="col-12">
        <div class="card fade-in shadow-sm">
            <div class="card-header bg-white py-3 d-flex justify-content-between align-items-center">
                <h5 class="mb-0 fw-bold" style="color: var(--c58-navy);">
                    <i class="fas fa-gavel text-warning me-2"></i> Gestión de Procesos Legales y Formalización
                </h5>
                <?php if (hasRole(['direccion', 'gestor_legal'])): ?>
                <a href="crear.php" class="btn btn-c58-teal btn-sm">
                    <i class="fas fa-plus"></i> Nuevo Proceso Legal
                </a>
                <?php endif; ?>
            </div>
            
            <div class="card-body p-4">
                <div class="table-responsive">
                    <table class="table table-hover datatable align-middle">
                        <thead>
                            <tr>
                                <th># ID</th>
                                <th>Emprendedor / Razón Social</th>
                                <th>Gestor Legal</th>
                                <th>Tipo de Trámite</th>
                                <th>Nombre Comercial</th>
                                <th>Documentos</th>
                                <th>Estado</th>
                                <th>Fecha Inicio</th>
                                <th class="text-end">Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            <?php foreach ($procesos as $proceso): ?>
                            <tr>
                                <td><span class="text-muted fw-bold">#<?php echo $proceso['id']; ?></span></td>
                                <td>
                                    <strong><?php echo htmlspecialchars($proceso['emprendedor_nombre']); ?></strong><br>
                                    <small class="text-muted"><i class="fas fa-building me-1"></i><?php echo htmlspecialchars($proceso['nombre_empresa'] ?? 'Persona Natural'); ?></small>
                                </td>
                                <td>
                                    <i class="fas fa-user-shield text-secondary me-1"></i>
                                    <?php echo htmlspecialchars($proceso['gestor_nombre']); ?>
                                </td>
                                <td>
                                    <span class="badge badge-c58-navy">
                                        <?php echo htmlspecialchars($proceso['tipo_proceso']); ?>
                                    </span>
                                </td>
                                <td>
                                    <strong><?php echo htmlspecialchars($proceso['nombre_comercial'] ?: 'Sin asignar'); ?></strong><br>
                                    <small class="text-muted"><?php echo htmlspecialchars($proceso['documento_identidad'] ?: ''); ?></small>
                                </td>
                                <td>
                                    <a href="documentos.php?id=<?php echo $proceso['id']; ?>" class="badge badge-c58-teal text-decoration-none">
                                        <i class="fas fa-file-alt me-1"></i> <?php echo $proceso['total_documentos']; ?> archivos
                                    </a>
                                </td>
                                <td>
                                    <?php
                                    $estados = [
                                        'pendiente'  => ['class' => 'bg-warning text-dark', 'label' => 'Pendiente'],
                                        'en_proceso' => ['class' => 'bg-info text-white', 'label' => 'En Trámite'],
                                        'completado' => ['class' => 'bg-success', 'label' => 'Formalizado'],
                                        'rechazado'  => ['class' => 'bg-danger', 'label' => 'Rechazado']
                                    ];
                                    $est = $estados[$proceso['status']] ?? ['class' => 'bg-secondary', 'label' => ucfirst($proceso['status'])];
                                    ?>
                                    <span class="badge <?php echo $est['class']; ?>">
                                        <?php echo $est['label']; ?>
                                    </span>
                                </td>
                                <td><small><?php echo date('d/m/Y', strtotime($proceso['fecha_inicio'])); ?></small></td>
                                <td class="text-end">
                                    <div class="btn-group btn-group-sm">
                                        <a href="ver.php?id=<?php echo $proceso['id']; ?>" class="btn btn-outline-info" title="Ver Expediente">
                                            <i class="fas fa-eye"></i>
                                        </a>
                                        <?php if ($proceso['status'] != 'completado' && $proceso['status'] != 'rechazado'): ?>
                                        <a href="editar.php?id=<?php echo $proceso['id']; ?>" class="btn btn-outline-warning" title="Editar Trámite">
                                            <i class="fas fa-edit"></i>
                                        </a>
                                        <a href="documentos.php?id=<?php echo $proceso['id']; ?>" class="btn btn-outline-secondary" title="Expediente Digital">
                                            <i class="fas fa-folder-open"></i>
                                        </a>
                                        <a href="?action=completar&id=<?php echo $proceso['id']; ?>" class="btn btn-outline-success" title="Completar" onclick="return confirm('¿Marcar este trámite legal como formalizado con éxito?')">
                                            <i class="fas fa-check"></i>
                                        </a>
                                        <?php endif; ?>
                                        <a href="?action=delete&id=<?php echo $proceso['id']; ?>" class="btn btn-outline-danger btn-delete" 
                                           data-message="¿Está seguro de eliminar este proceso legal y todos sus documentos vinculados?">
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