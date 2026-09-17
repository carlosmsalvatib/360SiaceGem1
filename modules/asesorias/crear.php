<?php
require_once '../../config/config.php';
require_once '../../config/database.php';

if (!isLoggedIn() || !hasRole(['direccion', 'consultor'])) {
    redirect('login.php');
}

$db = Database::getInstance();
$error = '';
$preselected_cliente = intval($_GET['cliente'] ?? $_GET['emprendedor'] ?? 0);

// Obtener lista de emprendedores
$emprendedores = [];
$result = $db->query("SELECT id, nombre_completo, nombre_empresa FROM clientes WHERE status != 'finalizado' ORDER BY nombre_completo");
if ($result) {
    while ($row = $result->fetch_assoc()) {
        $emprendedores[] = $row;
    }
}

// Obtener consultores
$consultores = [];
$result = $db->query("SELECT id, nombre FROM usuarios WHERE rol IN ('consultor', 'direccion') AND activo = 1 ORDER BY nombre");
if ($result) {
    while ($row = $result->fetch_assoc()) {
        $consultores[] = $row;
    }
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $cliente_id = intval($_POST['cliente_id'] ?? 0);
    $consultor_id = intval($_POST['consultor_id'] ?? 0);
    $tipo = sanitize($_POST['tipo'] ?? '');
    $fecha_programada = sanitize($_POST['fecha_programada'] ?? '');
    $duracion_minutos = intval($_POST['duracion_minutos'] ?? 60);
    $tema = sanitize($_POST['tema'] ?? '');
    $observaciones = sanitize($_POST['observaciones'] ?? '');
    
    $errors = [];
    
    if (empty($cliente_id)) $errors[] = "Seleccione un emprendedor";
    if (empty($consultor_id)) $errors[] = "Seleccione un consultor";
    if (empty($tipo)) $errors[] = "Seleccione el tipo de asesoría";
    if (empty($fecha_programada)) $errors[] = "Ingrese la fecha y hora programada";
    
    if (empty($errors)) {
        $stmt = $db->prepare("
            INSERT INTO asesorias (cliente_id, consultor_id, tipo, fecha_programada, duracion_minutos, tema, observaciones, status) 
            VALUES (?, ?, ?, ?, ?, ?, ?, 'programada')
        ");
        $stmt->bind_param("iississ", $cliente_id, $consultor_id, $tipo, $fecha_programada, $duracion_minutos, $tema, $observaciones);
        
        if ($stmt->execute()) {
            setFlash('success', 'Asesoría programada exitosamente');
            redirect('modules/asesorias/');
        } else {
            $error = "Error al crear la asesoría: " . $db->getConnection()->error;
        }
    } else {
        $error = implode("<br>", $errors);
    }
}

include '../../includes/header.php';
?>

<div class="row justify-content-center">
    <div class="col-lg-8">
        <div class="card fade-in shadow-sm">
            <div class="card-header bg-white py-3 d-flex justify-content-between align-items-center">
                <h5 class="mb-0 fw-bold" style="color: var(--c58-navy);">
                    <i class="fas fa-calendar-plus text-success me-2"></i> Programar Nueva Asesoría
                </h5>
                <a href="index.php" class="btn btn-outline-secondary btn-sm">
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
                                <option value="">Seleccionar emprendedor...</option>
                                <?php foreach ($emprendedores as $emp): ?>
                                <option value="<?php echo $emp['id']; ?>" <?php echo ($emp['id'] == $preselected_cliente) ? 'selected' : ''; ?>>
                                    <?php echo htmlspecialchars($emp['nombre_completo'] . ' - ' . ($emp['nombre_empresa'] ?? 'Sin empresa')); ?>
                                </option>
                                <?php endforeach; ?>
                            </select>
                        </div>
                        
                        <div class="col-md-6 mb-3">
                            <label class="form-label">Consultor Responsable <span class="text-danger">*</span></label>
                            <select name="consultor_id" class="form-select select2" required>
                                <option value="">Seleccionar consultor...</option>
                                <?php foreach ($consultores as $consultor): ?>
                                <option value="<?php echo $consultor['id']; ?>" <?php echo ($consultor['id'] == $_SESSION['usuario_id']) ? 'selected' : ''; ?>>
                                    <?php echo htmlspecialchars($consultor['nombre']); ?>
                                </option>
                                <?php endforeach; ?>
                            </select>
                        </div>
                    </div>
                    
                    <div class="row">
                        <div class="col-md-6 mb-3">
                            <label class="form-label">Tipo de Asesoría <span class="text-danger">*</span></label>
                            <select name="tipo" class="form-select" required>
                                <option value="">Seleccionar modalidad...</option>
                                <option value="diagnostico">Diagnóstico Inicial de Negocio</option>
                                <option value="seguimiento">Seguimiento y Acompañamiento</option>
                                <option value="cierre">Cierre y Formalización</option>
                            </select>
                        </div>
                        
                        <div class="col-md-3 mb-3">
                            <label class="form-label">Duración (minutos)</label>
                            <input type="number" name="duracion_minutos" class="form-control" value="60" min="15" max="240">
                        </div>
                        
                        <div class="col-md-3 mb-3">
                            <label class="form-label">Fecha y Hora <span class="text-danger">*</span></label>
                            <input type="datetime-local" name="fecha_programada" class="form-control" required 
                                   value="<?php echo date('Y-m-d\TH:i', strtotime('+1 day 09:00')); ?>">
                        </div>
                    </div>
                    
                    <div class="mb-3">
                        <label class="form-label">Tema Principal</label>
                        <input type="text" name="tema" class="form-control" placeholder="Ej: Estructuración del modelo de negocio y plan de ventas">
                    </div>
                    
                    <div class="mb-4">
                        <label class="form-label">Observaciones y Metas de la Sesión</label>
                        <textarea name="observaciones" class="form-control" rows="3" placeholder="Detalles previos, objetivos a cumplir, requerimientos del emprendedor..."></textarea>
                    </div>
                    
                    <div class="d-flex justify-content-end gap-2">
                        <a href="index.php" class="btn btn-secondary">
                            <i class="fas fa-times"></i> Cancelar
                        </a>
                        <button type="submit" class="btn btn-c58-teal">
                            <i class="fas fa-save"></i> Guardar Asesoría
                        </button>
                    </div>
                </form>
            </div>
        </div>
    </div>
</div>

<?php include '../../includes/footer.php'; ?>