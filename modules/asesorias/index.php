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
                $stmt = $db->prepare("DELETE FROM asesorias WHERE id = ?");
                $stmt->bind_param("i", $id);
                if ($stmt->execute()) {
                    setFlash('success', 'Asesoría eliminada correctamente');
                } else {
                    setFlash('danger', 'Error al eliminar la asesoría');
                }
                redirect('modules/asesorias/');
            }
            break;
            
        case 'completar':
            if ($id > 0) {
                $stmt = $db->prepare("UPDATE asesorias SET status = 'realizada', fecha_realizada = NOW() WHERE id = ?");
                $stmt->bind_param("i", $id);
                if ($stmt->execute()) {
                    setFlash('success', 'Asesoría marcada como realizada');
                } else {
                    setFlash('danger', 'Error al actualizar la asesoría');
                }
                redirect('modules/asesorias/');
            }
            break;
    }
}

// Obtener lista de asesorías según rol
$asesorias = [];
$whereClause = "";

if ($_SESSION['rol'] == 'consultor') {
    $whereClause = "WHERE a.consultor_id = " . intval($_SESSION['usuario_id']);
} elseif ($_SESSION['rol'] == 'comercial') {
    $whereClause = "WHERE c.usuario_id_creacion = " . intval($_SESSION['usuario_id']);
}

// Consulta corregida: sin 'a.usuario_id_creacion' que no existe en el esquema
$query = "
    SELECT a.*, 
           c.nombre_completo as emprendedor_nombre,
           c.nombre_empresa,
           c.telefono,
           u.nombre as consultor_nombre
    FROM asesorias a
    JOIN clientes c ON a.cliente_id = c.id
    JOIN usuarios u ON a.consultor_id = u.id
    $whereClause
    ORDER BY a.fecha_programada DESC
";

$result = $db->query($query);
if ($result) {
    while ($row = $result->fetch_assoc()) {
        $asesorias[] = $row;
    }
}

include '../../includes/header.php';
?>

<div class="row">
    <div class="col-12">
        <div class="card fade-in">
            <div class="card-header bg-white d-flex justify-content-between align-items-center py-3">
                <h5 class="mb-0 fw-bold" style="color: var(--c58-navy);">
                    <i class="fas fa-calendar-alt text-warning me-2"></i> Gestión de Asesorías y Consultorías
                </h5>
                <div class="d-flex gap-2">
                    <a href="calendario.php" class="btn btn-outline-secondary btn-sm">
                        <i class="fas fa-calendar"></i> Ver Calendario
                    </a>
                    <?php if (hasRole(['direccion', 'consultor'])): ?>
                    <a href="crear.php" class="btn btn-c58-teal btn-sm">
                        <i class="fas fa-plus"></i> Nueva Asesoría
                    </a>
                    <?php endif; ?>
                </div>
            </div>
            
            <div class="card-body">
                <div class="table-responsive">
                    <table class="table table-hover datatable align-middle">
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Emprendedor / Negocio</th>
                                <th>Consultor Asignado</th>
                                <th>Tipo de Asesoría</th>
                                <th>Fecha Programada</th>
                                <th>Fecha Realizada</th>
                                <th>Estado</th>
                                <th class="text-end">Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            <?php foreach ($asesorias as $asesoria): ?>
                            <tr>
                                <td><span class="text-muted fw-bold">#<?php echo $asesoria['id']; ?></span></td>
                                <td>
                                    <strong><?php echo htmlspecialchars($asesoria['emprendedor_nombre']); ?></strong><br>
                                    <small class="text-muted"><i class="fas fa-briefcase me-1"></i><?php echo htmlspecialchars($asesoria['nombre_empresa'] ?? 'Sin razón social'); ?></small>
                                </td>
                                <td>
                                    <i class="fas fa-user-tie text-secondary me-1"></i>
                                    <?php echo htmlspecialchars($asesoria['consultor_nombre']); ?>
                                </td>
                                <td>
                                    <?php
                                    $tipos = [
                                        'diagnostico' => ['class' => 'badge-c58-teal', 'label' => 'Diagnóstico'],
                                        'seguimiento' => ['class' => 'badge-c58-amber', 'label' => 'Seguimiento'],
                                        'cierre'      => ['class' => 'bg-success', 'label' => 'Cierre']
                                    ];
                                    $tipoInfo = $tipos[$asesoria['tipo']] ?? ['class' => 'bg-secondary', 'label' => ucfirst($asesoria['tipo'])];
                                    ?>
                                    <span class="badge <?php echo $tipoInfo['class']; ?>">
                                        <?php echo $tipoInfo['label']; ?>
                                    </span>
                                </td>
                                <td>
                                    <small class="fw-semibold">
                                        <i class="far fa-clock me-1 text-muted"></i>
                                        <?php echo date('d/m/Y H:i', strtotime($asesoria['fecha_programada'])); ?>
                                    </small>
                                </td>
                                <td>
                                    <?php if ($asesoria['fecha_realizada']): ?>
                                        <small class="text-success fw-semibold">
                                            <i class="fas fa-check-circle me-1"></i>
                                            <?php echo date('d/m/Y H:i', strtotime($asesoria['fecha_realizada'])); ?>
                                        </small>
                                    <?php else: ?>
                                        <span class="badge bg-light text-muted border">Pendiente</span>
                                    <?php endif; ?>
                                </td>
                                <td>
                                    <?php
                                    $estados = [
                                        'programada' => ['class' => 'bg-warning text-dark', 'label' => 'Programada'],
                                        'realizada'  => ['class' => 'bg-success', 'label' => 'Realizada'],
                                        'cancelada'  => ['class' => 'bg-danger', 'label' => 'Cancelada']
                                    ];
                                    $estInfo = $estados[$asesoria['status']] ?? ['class' => 'bg-secondary', 'label' => ucfirst($asesoria['status'])];
                                    ?>
                                    <span class="badge <?php echo $estInfo['class']; ?>">
                                        <?php echo $estInfo['label']; ?>
                                    </span>
                                </td>
                                <td class="text-end">
                                    <div class="btn-group btn-group-sm">
                                        <a href="ver.php?id=<?php echo $asesoria['id']; ?>" class="btn btn-outline-info" title="Ver Detalles">
                                            <i class="fas fa-eye"></i>
                                        </a>
                                        <?php if ($asesoria['status'] == 'programada'): ?>
                                        <a href="editar.php?id=<?php echo $asesoria['id']; ?>" class="btn btn-outline-warning" title="Editar">
                                            <i class="fas fa-edit"></i>
                                        </a>
                                        <a href="?action=completar&id=<?php echo $asesoria['id']; ?>" class="btn btn-outline-success" title="Marcar como realizada" onclick="return confirm('¿Marcar esta asesoría como completada con éxito?')">
                                            <i class="fas fa-check"></i>
                                        </a>
                                        <?php endif; ?>
                                        <a href="?action=delete&id=<?php echo $asesoria['id']; ?>" class="btn btn-outline-danger btn-delete" 
                                           data-message="¿Está seguro de eliminar esta sesión de asesoría?">
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