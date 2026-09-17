<?php
require_once '../../config/config.php';
require_once '../../config/database.php';

if (!isLoggedIn() || !hasRole(['direccion', 'gestor_legal'])) {
    redirect('login.php');
}

$db = Database::getInstance();
$proceso_id = intval($_GET['id'] ?? 0);

if ($proceso_id <= 0) {
    setFlash('danger', 'ID de proceso no válido');
    redirect('modules/legales/');
}

// Obtener proceso legal
$stmt = $db->prepare("SELECT * FROM procesos_legales WHERE id = ?");
$stmt->bind_param("i", $proceso_id);
$stmt->execute();
$proceso = $stmt->get_result()->fetch_assoc();

if (!$proceso) {
    setFlash('danger', 'Expediente no encontrado');
    redirect('modules/legales/');
}

$error = '';

// Emprendedores y Gestores
$emprendedores = [];
$resEmp = $db->query("SELECT id, nombre_completo, nombre_empresa FROM clientes ORDER BY nombre_completo");
if ($resEmp) while ($r = $resEmp->fetch_assoc()) $emprendedores[] = $r;

$gestores = [];
$resGest = $db->query("SELECT id, nombre FROM usuarios WHERE rol IN ('gestor_legal', 'direccion') AND activo = 1 ORDER BY nombre");
if ($resGest) while ($r = $resGest->fetch_assoc()) $gestores[] = $r;

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $cliente_id = intval($_POST['cliente_id'] ?? 0);
    $gestor_id = intval($_POST['gestor_id'] ?? 0);
    $tipo_proceso = sanitize($_POST['tipo_proceso'] ?? '');
    $nombre_comercial = sanitize($_POST['nombre_comercial'] ?? '');
    $documento_identidad = sanitize($_POST['documento_identidad'] ?? '');
    $estado = sanitize($_POST['estado'] ?? '');
    $status = sanitize($_POST['status'] ?? 'pendiente');
    $observaciones = sanitize($_POST['observaciones'] ?? '');
    
    $errors = [];
    if (empty($cliente_id)) $errors[] = "Seleccione un emprendedor";
    if (empty($gestor_id)) $errors[] = "Seleccione un gestor legal";
    if (empty($tipo_proceso)) $errors[] = "Seleccione el tipo de trámite";
    if (empty($nombre_comercial)) $errors[] = "La denominación comercial es obligatoria";
    
    if (empty($errors)) {
        $fecha_finalizacion = ($status == 'completado' && empty($proceso['fecha_finalizacion'])) ? date('Y-m-d H:i:s') : $proceso['fecha_finalizacion'];
        
        $stmt = $db->prepare("
            UPDATE procesos_legales SET
                cliente_id = ?,
                gestor_id = ?,
                tipo_proceso = ?,
                nombre_comercial = ?,
                documento_identidad = ?,
                estado = ?,
                status = ?,
                fecha_finalizacion = ?,
                observaciones = ?
            WHERE id = ?
        ");
        $stmt->bind_param("iisssssssi",
            $cliente_id,
            $gestor_id,
            $tipo_proceso,
            $nombre_comercial,
            $documento_identidad,
            $estado,
            $status,
            $fecha_finalizacion,
            $observaciones,
            $proceso_id
        );
        
        if ($stmt->execute()) {
            setFlash('success', 'Expediente legal actualizado correctamente');
            redirect('modules/legales/ver.php?id=' . $proceso_id);
        } else {
            $error = "Error al actualizar trámite: " . $db->getConnection()->error;
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
                    <i class="fas fa-edit text-warning me-2"></i> Editar Expediente Legal #<?php echo $proceso_id; ?>
                </h5>
                <a href="ver.php?id=<?php echo $proceso_id; ?>" class="btn btn-outline-secondary btn-sm">
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
                                <option value="<?php echo $emp['id']; ?>" <?php echo ($emp['id'] == $proceso['cliente_id']) ? 'selected' : ''; ?>>
                                    <?php echo htmlspecialchars($emp['nombre_completo'] . ' - ' . ($emp['nombre_empresa'] ?? 'Sin empresa')); ?>
                                </option>
                                <?php endforeach; ?>
                            </select>
                        </div>
                        
                        <div class="col-md-6 mb-3">
                            <label class="form-label">Gestor Legal Responsable <span class="text-danger">*</span></label>
                            <select name="gestor_id" class="form-select select2" required>
                                <?php foreach ($gestores as $gestor): ?>
                                <option value="<?php echo $gestor['id']; ?>" <?php echo ($gestor['id'] == $proceso['gestor_id']) ? 'selected' : ''; ?>>
                                    <?php echo htmlspecialchars($gestor['nombre']); ?>
                                </option>
                                <?php endforeach; ?>
                            </select>
                        </div>
                    </div>
                    
                    <div class="row">
                        <div class="col-md-6 mb-3">
                            <label class="form-label">Tipo de Proceso</label>
                            <select name="tipo_proceso" class="form-select" required>
                                <option value="Constitución de Empresa" <?php echo ($proceso['tipo_proceso'] == 'Constitución de Empresa') ? 'selected' : ''; ?>>Constitución de Empresa</option>
                                <option value="Registro Mercantil" <?php echo ($proceso['tipo_proceso'] == 'Registro Mercantil') ? 'selected' : ''; ?>>Registro Mercantil</option>
                                <option value="Identificación Fiscal" <?php echo ($proceso['tipo_proceso'] == 'Identificación Fiscal') ? 'selected' : ''; ?>>Identificación Fiscal</option>
                                <option value="Licencia de Funcionamiento" <?php echo ($proceso['tipo_proceso'] == 'Licencia de Funcionamiento') ? 'selected' : ''; ?>>Licencia de Funcionamiento</option>
                                <option value="Modificación Estatutaria" <?php echo ($proceso['tipo_proceso'] == 'Modificación Estatutaria') ? 'selected' : ''; ?>>Modificación Estatutaria</option>
                                <option value="Registro de Marca" <?php echo ($proceso['tipo_proceso'] == 'Registro de Marca') ? 'selected' : ''; ?>>Registro de Marca</option>
                                <option value="Contrato Laboral / Mercantil" <?php echo ($proceso['tipo_proceso'] == 'Contrato Laboral / Mercantil') ? 'selected' : ''; ?>>Contrato Laboral / Mercantil</option>
                            </select>
                        </div>
                        
                        <div class="col-md-6 mb-3">
                            <label class="form-label">Denominación / Nombre Comercial</label>
                            <input type="text" name="nombre_comercial" class="form-control" required value="<?php echo htmlspecialchars($proceso['nombre_comercial']); ?>">
                        </div>
                    </div>
                    
                    <div class="row">
                        <div class="col-md-4 mb-3">
                            <label class="form-label">Doc. Identidad / RIF</label>
                            <input type="text" name="documento_identidad" class="form-control" value="<?php echo htmlspecialchars($proceso['documento_identidad'] ?? ''); ?>">
                        </div>
                        
                        <div class="col-md-4 mb-3">
                            <label class="form-label">Jurisdicción / Registro</label>
                            <input type="text" name="estado" class="form-control" value="<?php echo htmlspecialchars($proceso['estado'] ?? ''); ?>">
                        </div>
                        
                        <div class="col-md-4 mb-3">
                            <label class="form-label">Estado del Trámite</label>
                            <select name="status" class="form-select" required>
                                <option value="pendiente" <?php echo ($proceso['status'] == 'pendiente') ? 'selected' : ''; ?>>Pendiente</option>
                                <option value="en_proceso" <?php echo ($proceso['status'] == 'en_proceso') ? 'selected' : ''; ?>>En Trámite</option>
                                <option value="completado" <?php echo ($proceso['status'] == 'completado') ? 'selected' : ''; ?>>Completado / Formalizado</option>
                                <option value="rechazado" <?php echo ($proceso['status'] == 'rechazado') ? 'selected' : ''; ?>>Rechazado</option>
                            </select>
                        </div>
                    </div>
                    
                    <div class="mb-4">
                        <label class="form-label">Observaciones e Instrucciones</label>
                        <textarea name="observaciones" class="form-control" rows="3"><?php echo htmlspecialchars($proceso['observaciones'] ?? ''); ?></textarea>
                    </div>
                    
                    <div class="d-flex justify-content-end gap-2">
                        <a href="ver.php?id=<?php echo $proceso_id; ?>" class="btn btn-secondary">
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
