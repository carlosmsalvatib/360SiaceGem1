<?php
require_once '../../config/config.php';
require_once '../../config/database.php';

if (!isLoggedIn() || !hasRole(['direccion', 'consultor'])) {
    redirect('login.php');
}

$db = Database::getInstance();
$asesoria_id = intval($_GET['id'] ?? 0);

if ($asesoria_id <= 0) {
    setFlash('danger', 'ID de asesoría no válido');
    redirect('modules/asesorias/');
}

// Obtener la asesoría actual
$stmt = $db->prepare("SELECT * FROM asesorias WHERE id = ?");
$stmt->bind_param("i", $asesoria_id);
$stmt->execute();
$asesoria = $stmt->get_result()->fetch_assoc();

if (!$asesoria) {
    setFlash('danger', 'Asesoría no encontrada');
    redirect('modules/asesorias/');
}

$error = '';

// Emprendedores y Consultores
$emprendedores = [];
$resEmp = $db->query("SELECT id, nombre_completo, nombre_empresa FROM clientes ORDER BY nombre_completo");
if ($resEmp) while ($r = $resEmp->fetch_assoc()) $emprendedores[] = $r;

$consultores = [];
$resCons = $db->query("SELECT id, nombre FROM usuarios WHERE rol IN ('consultor', 'direccion') AND activo = 1 ORDER BY nombre");
if ($resCons) while ($r = $resCons->fetch_assoc()) $consultores[] = $r;

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $cliente_id = intval($_POST['cliente_id'] ?? 0);
    $consultor_id = intval($_POST['consultor_id'] ?? 0);
    $tipo = sanitize($_POST['tipo'] ?? '');
    $fecha_programada = sanitize($_POST['fecha_programada'] ?? '');
    $duracion_minutos = intval($_POST['duracion_minutos'] ?? 60);
    $tema = sanitize($_POST['tema'] ?? '');
    $observaciones = sanitize($_POST['observaciones'] ?? '');
    $status = sanitize($_POST['status'] ?? 'programada');
    
    $errors = [];
    if (empty($cliente_id)) $errors[] = "Seleccione un emprendedor";
    if (empty($consultor_id)) $errors[] = "Seleccione un consultor";
    if (empty($tipo)) $errors[] = "Seleccione el tipo de asesoría";
    if (empty($fecha_programada)) $errors[] = "Ingrese la fecha programada";
    
    if (empty($errors)) {
        $fecha_realizada = ($status == 'realizada' && empty($asesoria['fecha_realizada'])) ? date('Y-m-d H:i:s') : $asesoria['fecha_realizada'];
        
        $stmt = $db->prepare("
            UPDATE asesorias SET 
                cliente_id = ?, 
                consultor_id = ?, 
                tipo = ?, 
                fecha_programada = ?, 
                duracion_minutos = ?, 
                tema = ?, 
                observaciones = ?, 
                status = ?,
                fecha_realizada = ?
            WHERE id = ?
        ");
        $stmt->bind_param("iississssi", $cliente_id, $consultor_id, $tipo, $fecha_programada, $duracion_minutos, $tema, $observaciones, $status, $fecha_realizada, $asesoria_id);
        
        if ($stmt->execute()) {
            setFlash('success', 'Asesoría actualizada exitosamente');
            redirect('modules/asesorias/ver.php?id=' . $asesoria_id);
        } else {
            $error = "Error al actualizar: " . $db->getConnection()->error;
        }
    } else {
        $error = implode("<br>", $errors);
    }
}

include '../../includes/header.php';
?>

<div class="row justify-content-center">
    <div class="col-lg-8">
        <div class="card shadow-sm fade-in">
            <div class="card-header bg-white py-3 d-flex justify-content-between align-items-center">
                <h5 class="mb-0 fw-bold" style="color: var(--c58-navy);">
                    <i class="fas fa-edit text-warning me-2"></i> Editar Asesoría #<?php echo $asesoria_id; ?>
                </h5>
                <a href="ver.php?id=<?php echo $asesoria_id; ?>" class="btn btn-outline-secondary btn-sm">
                    <i class="fas fa-arrow-left"></i> Volver
                </a>
            </div>
            <div class="card-body p-4">
                <?php if ($error): ?>
                <div class="alert alert-danger alert-dismissible fade show">
                    <i class="fas fa-exclamation-circle me-1"></i> <?php echo $error; ?>
                    <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
                </div>
                <?php endif; ?>
                
                <form method="POST">
                    <div class="row">
                        <div class="col-md-6 mb-3">
                            <label class="form-label">Emprendedor <span class="text-danger">*</span></label>
                            <select name="cliente_id" class="form-select select2" required>
                                <?php foreach ($emprendedores as $emp): ?>
                                <option value="<?php echo $emp['id']; ?>" <?php echo ($emp['id'] == $asesoria['cliente_id']) ? 'selected' : ''; ?>>
                                    <?php echo htmlspecialchars($emp['nombre_completo'] . ' - ' . ($emp['nombre_empresa'] ?? 'Sin empresa')); ?>
                                </option>
                                <?php endforeach; ?>
                            </select>
                        </div>
                        
                        <div class="col-md-6 mb-3">
                            <label class="form-label">Consultor Asignado <span class="text-danger">*</span></label>
                            <select name="consultor_id" class="form-select select2" required>
                                <?php foreach ($consultores as $consultor): ?>
                                <option value="<?php echo $consultor['id']; ?>" <?php echo ($consultor['id'] == $asesoria['consultor_id']) ? 'selected' : ''; ?>>
                                    <?php echo htmlspecialchars($consultor['nombre']); ?>
                                </option>
                                <?php endforeach; ?>
                            </select>
                        </div>
                    </div>
                    
                    <div class="row">
                        <div class="col-md-4 mb-3">
                            <label class="form-label">Tipo de Asesoría</label>
                            <select name="tipo" class="form-select" required>
                                <option value="diagnostico" <?php echo ($asesoria['tipo'] == 'diagnostico') ? 'selected' : ''; ?>>Diagnóstico</option>
                                <option value="seguimiento" <?php echo ($asesoria['tipo'] == 'seguimiento') ? 'selected' : ''; ?>>Seguimiento</option>
                                <option value="cierre" <?php echo ($asesoria['tipo'] == 'cierre') ? 'selected' : ''; ?>>Cierre</option>
                            </select>
                        </div>
                        
                        <div class="col-md-4 mb-3">
                            <label class="form-label">Estado de la Sesión</label>
                            <select name="status" class="form-select" required>
                                <option value="programada" <?php echo ($asesoria['status'] == 'programada') ? 'selected' : ''; ?>>Programada</option>
                                <option value="realizada" <?php echo ($asesoria['status'] == 'realizada') ? 'selected' : ''; ?>>Realizada</option>
                                <option value="cancelada" <?php echo ($asesoria['status'] == 'cancelada') ? 'selected' : ''; ?>>Cancelada</option>
                            </select>
                        </div>
                        
                        <div class="col-md-4 mb-3">
                            <label class="form-label">Duración (minutos)</label>
                            <input type="number" name="duracion_minutos" class="form-control" value="<?php echo $asesoria['duracion_minutos']; ?>" min="15" max="240">
                        </div>
                    </div>
                    
                    <div class="row">
                        <div class="col-md-6 mb-3">
                            <label class="form-label">Fecha y Hora Programada</label>
                            <input type="datetime-local" name="fecha_programada" class="form-control" required
                                   value="<?php echo date('Y-m-d\TH:i', strtotime($asesoria['fecha_programada'])); ?>">
                        </div>
                        
                        <div class="col-md-6 mb-3">
                            <label class="form-label">Tema Principal</label>
                            <input type="text" name="tema" class="form-control" value="<?php echo htmlspecialchars($asesoria['tema'] ?? ''); ?>">
                        </div>
                    </div>
                    
                    <div class="mb-4">
                        <label class="form-label">Observaciones y Notas</label>
                        <textarea name="observaciones" class="form-control" rows="4"><?php echo htmlspecialchars($asesoria['observaciones'] ?? ''); ?></textarea>
                    </div>
                    
                    <div class="d-flex justify-content-end gap-2">
                        <a href="ver.php?id=<?php echo $asesoria_id; ?>" class="btn btn-secondary">
                            <i class="fas fa-times"></i> Cancelar
                        </a>
                        <button type="submit" class="btn btn-c58-teal">
                            <i class="fas fa-save"></i> Guardar Cambios
                        </button>
                    </div>
                </form>
            </div>
        </div>
    </div>
</div>

<?php include '../../includes/footer.php'; ?>
