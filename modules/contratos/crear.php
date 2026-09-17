<?php
require_once '../../config/config.php';
require_once '../../config/database.php';

if (!isLoggedIn() || !hasRole(['direccion', 'comercial'])) {
    redirect('login.php');
}

$db = Database::getInstance();
$error = '';
$preselected_cliente = intval($_GET['cliente'] ?? $_GET['emprendedor'] ?? 0);

// Obtener emprendedores activos
$emprendedores = [];
$result = $db->query("SELECT id, nombre_completo, nombre_empresa FROM clientes WHERE status IN ('activo', 'en_consulta', 'en_legalizacion') ORDER BY nombre_completo");
if ($result) {
    while ($row = $result->fetch_assoc()) {
        $emprendedores[] = $row;
    }
}

// Obtener comerciales
$comerciales = [];
$result = $db->query("SELECT id, nombre FROM usuarios WHERE rol IN ('comercial', 'direccion') AND activo = 1 ORDER BY nombre");
if ($result) {
    while ($row = $result->fetch_assoc()) {
        $comerciales[] = $row;
    }
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $cliente_id = intval($_POST['cliente_id'] ?? 0);
    $comercial_id = intval($_POST['comercial_id'] ?? 0);
    $fecha_firma = sanitize($_POST['fecha_firma'] ?? date('Y-m-d'));
    $monto_total = floatval($_POST['monto_total'] ?? 0);
    $anticipo = floatval($_POST['anticipo'] ?? 0);
    $condiciones = sanitize($_POST['condiciones'] ?? '');
    $observaciones = sanitize($_POST['observaciones'] ?? '');
    $fecha_inicio_servicio = !empty($_POST['fecha_inicio_servicio']) ? sanitize($_POST['fecha_inicio_servicio']) : null;
    $fecha_fin_servicio = !empty($_POST['fecha_fin_servicio']) ? sanitize($_POST['fecha_fin_servicio']) : null;
    
    $errors = [];
    
    if (empty($cliente_id)) $errors[] = "Seleccione un emprendedor";
    if (empty($comercial_id)) $errors[] = "Seleccione un asesor comercial";
    if (empty($fecha_firma)) $errors[] = "La fecha de firma es obligatoria";
    if ($monto_total <= 0) $errors[] = "El monto total debe ser mayor a 0";
    if ($anticipo < 0) $errors[] = "El anticipo debe ser mayor o igual a 0";
    if ($anticipo > $monto_total) $errors[] = "El anticipo no puede ser mayor al monto total";
    
    if (empty($errors)) {
        $numero_contrato = generarNumeroContrato();
        $saldo_pendiente = $monto_total - $anticipo;
        $estado_pago = ($saldo_pendiente == 0) ? 'pagado' : (($anticipo > 0) ? 'parcial' : 'pendiente');
        $fecha_anticipo = ($anticipo > 0) ? $fecha_firma : null;
        
        // Query corregida con fecha_firma (NOT NULL) y parámetros correctamente emparejados
        $stmt = $db->prepare("
            INSERT INTO contratos (
                cliente_id, comercial_id, numero_contrato, fecha_firma, monto_total, 
                anticipo, saldo_pendiente, fecha_anticipo, estado_pago, condiciones, 
                observaciones, fecha_inicio_servicio, fecha_fin_servicio, estado_contrato
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'activo')
        ");
        
        // 13 parámetros: i (cliente_id), i (comercial_id), s (numero_contrato), s (fecha_firma),
        // d (monto_total), d (anticipo), d (saldo_pendiente), s (fecha_anticipo),
        // s (estado_pago), s (condiciones), s (observaciones), s (fecha_inicio_servicio), s (fecha_fin_servicio)
        // Tipos: "iissdddssssss" (13 letras correspondientes a los 13 argumentos)
        $stmt->bind_param("iissdddssssss", 
            $cliente_id, 
            $comercial_id, 
            $numero_contrato, 
            $fecha_firma, 
            $monto_total, 
            $anticipo, 
            $saldo_pendiente, 
            $fecha_anticipo, 
            $estado_pago, 
            $condiciones, 
            $observaciones, 
            $fecha_inicio_servicio, 
            $fecha_fin_servicio
        );
        
        if ($stmt->execute()) {
            $nuevo_contrato_id = $stmt->insert_id;
            
            // Si hubo anticipo inicial, registrar automáticamente el pago correspondiente
            if ($anticipo > 0) {
                $stmtPago = $db->prepare("
                    INSERT INTO pagos (contrato_id, monto, fecha_pago, metodo_pago, referencia, status)
                    VALUES (?, ?, ?, 'transferencia', 'Anticipo inicial firma contrato', 'verificado')
                ");
                $stmtPago->bind_param("ids", $nuevo_contrato_id, $anticipo, $fecha_firma);
                $stmtPago->execute();
            }
            
            setFlash('success', 'Contrato ' . $numero_contrato . ' creado exitosamente');
            redirect('modules/contratos/ver.php?id=' . $nuevo_contrato_id);
        } else {
            $error = "Error al crear el contrato: " . $db->getConnection()->error;
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
                    <i class="fas fa-file-signature text-success me-2"></i> Generar Nuevo Contrato Comercial
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
                            <label class="form-label">Asesor Comercial <span class="text-danger">*</span></label>
                            <select name="comercial_id" class="form-select select2" required>
                                <option value="">Seleccionar asesor...</option>
                                <?php foreach ($comerciales as $comercial): ?>
                                <option value="<?php echo $comercial['id']; ?>" <?php echo ($comercial['id'] == $_SESSION['usuario_id']) ? 'selected' : ''; ?>>
                                    <?php echo htmlspecialchars($comercial['nombre']); ?>
                                </option>
                                <?php endforeach; ?>
                            </select>
                        </div>
                    </div>
                    
                    <div class="row">
                        <div class="col-md-4 mb-3">
                            <label class="form-label">Fecha de Firma <span class="text-danger">*</span></label>
                            <input type="date" name="fecha_firma" class="form-control" required value="<?php echo date('Y-m-d'); ?>">
                        </div>
                        
                        <div class="col-md-4 mb-3">
                            <label class="form-label">Monto Total ($ USD) <span class="text-danger">*</span></label>
                            <input type="number" step="0.01" name="monto_total" id="monto_total" class="form-control fw-bold" required placeholder="0.00">
                        </div>
                        
                        <div class="col-md-4 mb-3">
                            <label class="form-label">Anticipo Inicial ($ USD)</label>
                            <input type="number" step="0.01" name="anticipo" id="anticipo" class="form-control" value="0.00" placeholder="0.00">
                            <small class="text-muted">Monto cancelado al momento de firmar</small>
                        </div>
                    </div>
                    
                    <div class="row mb-3">
                        <div class="col-md-4">
                            <label class="form-label">Saldo Pendiente Calculado</label>
                            <div class="input-group">
                                <span class="input-group-text">$</span>
                                <input type="text" class="form-control bg-light fw-bold text-danger" id="saldo_pendiente" value="0.00" readonly>
                            </div>
                        </div>
                        
                        <div class="col-md-4">
                            <label class="form-label">Fecha Inicio de Servicio</label>
                            <input type="date" name="fecha_inicio_servicio" class="form-control" value="<?php echo date('Y-m-d'); ?>">
                        </div>
                        
                        <div class="col-md-4">
                            <label class="form-label">Fecha Estimada de Finalización</label>
                            <input type="date" name="fecha_fin_servicio" class="form-control" value="<?php echo date('Y-m-d', strtotime('+30 days')); ?>">
                        </div>
                    </div>
                    
                    <div class="mb-3">
                        <label class="form-label">Condiciones y Alcance del Contrato</label>
                        <textarea name="condiciones" class="form-control" rows="3" placeholder="Descripción de los servicios pactados, entregables, etapas de pago y compromisos mutuos..."></textarea>
                    </div>
                    
                    <div class="mb-4">
                        <label class="form-label">Observaciones Internas</label>
                        <textarea name="observaciones" class="form-control" rows="2" placeholder="Notas de uso comercial o administrativo..."></textarea>
                    </div>
                    
                    <div class="d-flex justify-content-end gap-2">
                        <a href="index.php" class="btn btn-secondary">
                            <i class="fas fa-times"></i> Cancelar
                        </a>
                        <button type="submit" class="btn btn-c58-teal">
                            <i class="fas fa-save"></i> Generar y Guardar Contrato
                        </button>
                    </div>
                </form>
            </div>
        </div>
    </div>
</div>

<script>
document.addEventListener('DOMContentLoaded', function() {
    const totalEl = document.getElementById('monto_total');
    const anticipoEl = document.getElementById('anticipo');
    const saldoEl = document.getElementById('saldo_pendiente');
    
    function calcularSaldo() {
        const total = parseFloat(totalEl.value) || 0;
        const anticipo = parseFloat(anticipoEl.value) || 0;
        const saldo = Math.max(0, total - anticipo);
        saldoEl.value = saldo.toFixed(2);
        
        if (saldo === 0 && total > 0) {
            saldoEl.classList.remove('text-danger');
            saldoEl.classList.add('text-success');
        } else {
            saldoEl.classList.remove('text-success');
            saldoEl.classList.add('text-danger');
        }
    }
    
    totalEl.addEventListener('input', calcularSaldo);
    anticipoEl.addEventListener('input', calcularSaldo);
});
</script>

<?php include '../../includes/footer.php'; ?>