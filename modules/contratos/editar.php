<?php
require_once '../../config/config.php';
require_once '../../config/database.php';

if (!isLoggedIn() || !hasRole(['direccion', 'comercial'])) {
    redirect('login.php');
}

$db = Database::getInstance();
$contrato_id = intval($_GET['id'] ?? 0);

if ($contrato_id <= 0) {
    setFlash('danger', 'ID de contrato no válido');
    redirect('modules/contratos/');
}

// Obtener contrato
$stmt = $db->prepare("SELECT * FROM contratos WHERE id = ?");
$stmt->bind_param("i", $contrato_id);
$stmt->execute();
$contrato = $stmt->get_result()->fetch_assoc();

if (!$contrato) {
    setFlash('danger', 'Contrato no encontrado');
    redirect('modules/contratos/');
}

$error = '';

// Emprendedores y Comerciales
$emprendedores = [];
$resEmp = $db->query("SELECT id, nombre_completo, nombre_empresa FROM clientes ORDER BY nombre_completo");
if ($resEmp) while ($r = $resEmp->fetch_assoc()) $emprendedores[] = $r;

$comerciales = [];
$resCom = $db->query("SELECT id, nombre FROM usuarios WHERE rol IN ('comercial', 'direccion') AND activo = 1 ORDER BY nombre");
if ($resCom) while ($r = $resCom->fetch_assoc()) $comerciales[] = $r;

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $cliente_id = intval($_POST['cliente_id'] ?? 0);
    $comercial_id = intval($_POST['comercial_id'] ?? 0);
    $fecha_firma = sanitize($_POST['fecha_firma'] ?? '');
    $monto_total = floatval($_POST['monto_total'] ?? 0);
    $anticipo = floatval($_POST['anticipo'] ?? 0);
    $saldo_pendiente = floatval($_POST['saldo_pendiente'] ?? 0);
    $estado_pago = sanitize($_POST['estado_pago'] ?? 'pendiente');
    $estado_contrato = sanitize($_POST['estado_contrato'] ?? 'activo');
    $condiciones = sanitize($_POST['condiciones'] ?? '');
    $observaciones = sanitize($_POST['observaciones'] ?? '');
    $fecha_inicio_servicio = !empty($_POST['fecha_inicio_servicio']) ? sanitize($_POST['fecha_inicio_servicio']) : null;
    $fecha_fin_servicio = !empty($_POST['fecha_fin_servicio']) ? sanitize($_POST['fecha_fin_servicio']) : null;
    
    $errors = [];
    if (empty($cliente_id)) $errors[] = "Seleccione un emprendedor";
    if (empty($comercial_id)) $errors[] = "Seleccione un comercial";
    if (empty($fecha_firma)) $errors[] = "La fecha de firma es obligatoria";
    if ($monto_total <= 0) $errors[] = "El monto debe ser superior a 0";
    
    if (empty($errors)) {
        $stmt = $db->prepare("
            UPDATE contratos SET
                cliente_id = ?,
                comercial_id = ?,
                fecha_firma = ?,
                monto_total = ?,
                anticipo = ?,
                saldo_pendiente = ?,
                estado_pago = ?,
                estado_contrato = ?,
                condiciones = ?,
                observaciones = ?,
                fecha_inicio_servicio = ?,
                fecha_fin_servicio = ?
            WHERE id = ?
        ");
        $stmt->bind_param("iisdddssssssi",
            $cliente_id,
            $comercial_id,
            $fecha_firma,
            $monto_total,
            $anticipo,
            $saldo_pendiente,
            $estado_pago,
            $estado_contrato,
            $condiciones,
            $observaciones,
            $fecha_inicio_servicio,
            $fecha_fin_servicio,
            $contrato_id
        );
        
        if ($stmt->execute()) {
            setFlash('success', 'Contrato actualizado exitosamente');
            redirect('modules/contratos/ver.php?id=' . $contrato_id);
        } else {
            $error = "Error al actualizar contrato: " . $db->getConnection()->error;
        }
    } else {
        $error = implode("<br>", $errors);
    }
}

include '../../includes/header.php';
?>

<div class="row justify-content-center">
    <div class="col-lg-9">
        <div class="card shadow-sm fade-in">
            <div class="card-header bg-white py-3 d-flex justify-content-between align-items-center">
                <h5 class="mb-0 fw-bold" style="color: var(--c58-navy);">
                    <i class="fas fa-edit text-warning me-2"></i> Editar Contrato <?php echo htmlspecialchars($contrato['numero_contrato']); ?>
                </h5>
                <a href="ver.php?id=<?php echo $contrato_id; ?>" class="btn btn-outline-secondary btn-sm">
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
                                <option value="<?php echo $emp['id']; ?>" <?php echo ($emp['id'] == $contrato['cliente_id']) ? 'selected' : ''; ?>>
                                    <?php echo htmlspecialchars($emp['nombre_completo'] . ' - ' . ($emp['nombre_empresa'] ?? 'Sin empresa')); ?>
                                </option>
                                <?php endforeach; ?>
                            </select>
                        </div>
                        
                        <div class="col-md-6 mb-3">
                            <label class="form-label">Asesor Comercial <span class="text-danger">*</span></label>
                            <select name="comercial_id" class="form-select select2" required>
                                <?php foreach ($comerciales as $comercial): ?>
                                <option value="<?php echo $comercial['id']; ?>" <?php echo ($comercial['id'] == $contrato['comercial_id']) ? 'selected' : ''; ?>>
                                    <?php echo htmlspecialchars($comercial['nombre']); ?>
                                </option>
                                <?php endforeach; ?>
                            </select>
                        </div>
                    </div>
                    
                    <div class="row">
                        <div class="col-md-3 mb-3">
                            <label class="form-label">Fecha de Firma</label>
                            <input type="date" name="fecha_firma" class="form-control" required value="<?php echo htmlspecialchars($contrato['fecha_firma']); ?>">
                        </div>
                        
                        <div class="col-md-3 mb-3">
                            <label class="form-label">Monto Total ($)</label>
                            <input type="number" step="0.01" name="monto_total" class="form-control" required value="<?php echo htmlspecialchars($contrato['monto_total']); ?>">
                        </div>
                        
                        <div class="col-md-3 mb-3">
                            <label class="form-label">Anticipo ($)</label>
                            <input type="number" step="0.01" name="anticipo" class="form-control" value="<?php echo htmlspecialchars($contrato['anticipo']); ?>">
                        </div>
                        
                        <div class="col-md-3 mb-3">
                            <label class="form-label">Saldo Pendiente ($)</label>
                            <input type="number" step="0.01" name="saldo_pendiente" class="form-control" required value="<?php echo htmlspecialchars($contrato['saldo_pendiente']); ?>">
                        </div>
                    </div>
                    
                    <div class="row">
                        <div class="col-md-3 mb-3">
                            <label class="form-label">Estado de Pago</label>
                            <select name="estado_pago" class="form-select">
                                <option value="pendiente" <?php echo ($contrato['estado_pago'] == 'pendiente') ? 'selected' : ''; ?>>Pendiente</option>
                                <option value="parcial" <?php echo ($contrato['estado_pago'] == 'parcial') ? 'selected' : ''; ?>>Parcial</option>
                                <option value="pagado" <?php echo ($contrato['estado_pago'] == 'pagado') ? 'selected' : ''; ?>>Pagado</option>
                            </select>
                        </div>
                        
                        <div class="col-md-3 mb-3">
                            <label class="form-label">Estado del Contrato</label>
                            <select name="estado_contrato" class="form-select">
                                <option value="activo" <?php echo ($contrato['estado_contrato'] == 'activo') ? 'selected' : ''; ?>>Activo</option>
                                <option value="completado" <?php echo ($contrato['estado_contrato'] == 'completado') ? 'selected' : ''; ?>>Completado</option>
                                <option value="cancelado" <?php echo ($contrato['estado_contrato'] == 'cancelado') ? 'selected' : ''; ?>>Cancelado</option>
                            </select>
                        </div>
                        
                        <div class="col-md-3 mb-3">
                            <label class="form-label">Inicio Servicio</label>
                            <input type="date" name="fecha_inicio_servicio" class="form-control" value="<?php echo htmlspecialchars($contrato['fecha_inicio_servicio'] ?? ''); ?>">
                        </div>
                        
                        <div class="col-md-3 mb-3">
                            <label class="form-label">Fin Estimado</label>
                            <input type="date" name="fecha_fin_servicio" class="form-control" value="<?php echo htmlspecialchars($contrato['fecha_fin_servicio'] ?? ''); ?>">
                        </div>
                    </div>
                    
                    <div class="mb-3">
                        <label class="form-label">Condiciones del Contrato</label>
                        <textarea name="condiciones" class="form-control" rows="3"><?php echo htmlspecialchars($contrato['condiciones'] ?? ''); ?></textarea>
                    </div>
                    
                    <div class="mb-4">
                        <label class="form-label">Observaciones</label>
                        <textarea name="observaciones" class="form-control" rows="2"><?php echo htmlspecialchars($contrato['observaciones'] ?? ''); ?></textarea>
                    </div>
                    
                    <div class="d-flex justify-content-end gap-2">
                        <a href="ver.php?id=<?php echo $contrato_id; ?>" class="btn btn-secondary">
                            <i class="fas fa-times"></i> Cancelar
                        </a>
                        <button type="submit" class="btn btn-c58-teal">
                            <i class="fas fa-save"></i> Actualizar Contrato
                        </button>
                    </div>
                </form>
            </div>
        </div>
    </div>
</div>

<?php include '../../includes/footer.php'; ?>
