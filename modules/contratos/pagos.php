<?php
require_once '../../config/config.php';
require_once '../../config/database.php';

if (!isLoggedIn()) {
    redirect('login.php');
}

$db = Database::getInstance();
$contrato_id = intval($_GET['contrato'] ?? 0);
$error = '';

// Procesar registro de pago
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $contrato_id = intval($_POST['contrato_id'] ?? 0);
    $monto = floatval($_POST['monto'] ?? 0);
    $metodo_pago = sanitize($_POST['metodo_pago'] ?? 'transferencia');
    $referencia = sanitize($_POST['referencia'] ?? '');
    $fecha_pago = sanitize($_POST['fecha_pago'] ?? date('Y-m-d'));
    
    if ($contrato_id > 0 && $monto > 0) {
        // Verificar que el contrato existe y está activo
        $stmt = $db->prepare("SELECT id, saldo_pendiente, numero_contrato FROM contratos WHERE id = ? AND estado_contrato = 'activo'");
        $stmt->bind_param("i", $contrato_id);
        $stmt->execute();
        $contrato = $stmt->get_result()->fetch_assoc();
        
        if ($contrato) {
            if ($monto <= $contrato['saldo_pendiente']) {
                // Insertar pago
                $stmt = $db->prepare("
                    INSERT INTO pagos (contrato_id, monto, fecha_pago, metodo_pago, referencia, status) 
                    VALUES (?, ?, ?, ?, ?, 'verificado')
                ");
                $stmt->bind_param("idsss", $contrato_id, $monto, $fecha_pago, $metodo_pago, $referencia);
                
                if ($stmt->execute()) {
                    // Actualizar saldo del contrato
                    $nuevo_saldo = max(0, $contrato['saldo_pendiente'] - $monto);
                    $estado_pago = ($nuevo_saldo == 0) ? 'pagado' : 'parcial';
                    
                    $stmtUpdate = $db->prepare("
                        UPDATE contratos 
                        SET saldo_pendiente = ?, estado_pago = ? 
                        WHERE id = ?
                    ");
                    $stmtUpdate->bind_param("dsi", $nuevo_saldo, $estado_pago, $contrato_id);
                    $stmtUpdate->execute();
                    
                    setFlash('success', 'Pago de $' . number_format($monto, 2) . ' registrado exitosamente para el contrato ' . $contrato['numero_contrato']);
                    redirect('modules/contratos/pagos.php?contrato=' . $contrato_id);
                } else {
                    $error = 'Error al registrar el pago: ' . $db->getConnection()->error;
                }
            } else {
                $error = 'El monto no puede exceder el saldo pendiente actual ($' . number_format($contrato['saldo_pendiente'], 2) . ')';
            }
        } else {
            $error = 'El contrato no existe o se encuentra inactivo';
        }
    } else {
        $error = 'Por favor indique un contrato válido y un monto mayor a 0';
    }
}

// Obtener información del contrato si se seleccionó uno
$contrato = null;
if ($contrato_id > 0) {
    $stmt = $db->prepare("
        SELECT c.*, cl.nombre_completo as emprendedor_nombre, cl.nombre_empresa, u.nombre as comercial_nombre
        FROM contratos c
        JOIN clientes cl ON c.cliente_id = cl.id
        JOIN usuarios u ON c.comercial_id = u.id
        WHERE c.id = ?
    ");
    $stmt->bind_param("i", $contrato_id);
    $stmt->execute();
    $contrato = $stmt->get_result()->fetch_assoc();
}

// Obtener historial de pagos
$pagos = [];
$whereClause = ($contrato_id > 0) ? "WHERE p.contrato_id = $contrato_id" : "";

$query = "
    SELECT p.*, c.numero_contrato, cl.nombre_completo as emprendedor_nombre,
           CASE p.metodo_pago
               WHEN 'efectivo' THEN 'Efectivo'
               WHEN 'transferencia' THEN 'Transferencia Bancaria'
               WHEN 'tarjeta' THEN 'Tarjeta'
               ELSE 'Otros'
           END as metodo_nombre
    FROM pagos p
    JOIN contratos c ON p.contrato_id = c.id
    JOIN clientes cl ON c.cliente_id = cl.id
    $whereClause
    ORDER BY p.fecha_pago DESC
";

$result = $db->query($query);
if ($result) {
    while ($row = $result->fetch_assoc()) {
        $pagos[] = $row;
    }
}

include '../../includes/header.php';
?>

<div class="row">
    <div class="col-12">
        <div class="card shadow-sm fade-in">
            <div class="card-header bg-white py-3 d-flex justify-content-between align-items-center">
                <h5 class="mb-0 fw-bold" style="color: var(--c58-navy);">
                    <i class="fas fa-money-bill-wave text-success me-2"></i> Gestión y Registro de Pagos
                </h5>
                <div>
                    <a href="index.php" class="btn btn-outline-secondary btn-sm">
                        <i class="fas fa-arrow-left"></i> Volver a Contratos
                    </a>
                </div>
            </div>
            <div class="card-body p-4">
                <?php if ($error): ?>
                <div class="alert alert-danger alert-dismissible fade show">
                    <i class="fas fa-exclamation-circle me-1"></i> <?php echo $error; ?>
                    <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
                </div>
                <?php endif; ?>
                
                <?php if ($contrato): ?>
                <!-- Información del contrato seleccionado -->
                <div class="row g-3 mb-4">
                    <div class="col-md-3">
                        <div class="p-3 bg-light rounded border">
                            <span class="text-muted small text-uppercase">Emprendedor</span>
                            <h6 class="mb-0 fw-bold"><?php echo htmlspecialchars($contrato['emprendedor_nombre']); ?></h6>
                            <small class="text-muted"><?php echo htmlspecialchars($contrato['nombre_empresa'] ?? 'N/A'); ?></small>
                        </div>
                    </div>
                    <div class="col-md-3">
                        <div class="p-3 bg-light rounded border">
                            <span class="text-muted small text-uppercase">Nº Contrato</span>
                            <h6 class="mb-0 fw-bold text-primary"><?php echo htmlspecialchars($contrato['numero_contrato']); ?></h6>
                            <small class="text-muted">Asesor: <?php echo htmlspecialchars($contrato['comercial_nombre']); ?></small>
                        </div>
                    </div>
                    <div class="col-md-3">
                        <div class="p-3 bg-light rounded border">
                            <span class="text-muted small text-uppercase">Monto Contrato</span>
                            <h6 class="mb-0 fw-bold">$<?php echo number_format($contrato['monto_total'], 2); ?></h6>
                            <small class="text-muted">Anticipo: $<?php echo number_format($contrato['anticipo'], 2); ?></small>
                        </div>
                    </div>
                    <div class="col-md-3">
                        <div class="p-3 bg-light rounded border">
                            <span class="text-muted small text-uppercase">Saldo Pendiente</span>
                            <h6 class="mb-0 fw-bold <?php echo $contrato['saldo_pendiente'] > 0 ? 'text-danger' : 'text-success'; ?>">
                                $<?php echo number_format($contrato['saldo_pendiente'], 2); ?>
                            </h6>
                            <?php echo renderBadgeEstadoPago($contrato['estado_pago']); ?>
                        </div>
                    </div>
                </div>
                
                <!-- Formulario de nuevo pago -->
                <?php if ($contrato['saldo_pendiente'] > 0 && $contrato['estado_contrato'] == 'activo'): ?>
                <div class="card p-3 mb-4 border" style="background-color: #F8FAFC;">
                    <h6 class="fw-bold mb-3 text-secondary"><i class="fas fa-plus-circle me-1"></i> Registrar Nuevo Pago Directo</h6>
                    <form method="POST" class="row g-3">
                        <input type="hidden" name="contrato_id" value="<?php echo $contrato['id']; ?>">
                        
                        <div class="col-md-3">
                            <label class="form-label small fw-bold">Monto a Abonar ($)</label>
                            <input type="number" step="0.01" name="monto" class="form-control fw-bold text-success" 
                                   required max="<?php echo $contrato['saldo_pendiente']; ?>" placeholder="0.00">
                        </div>
                        <div class="col-md-3">
                            <label class="form-label small fw-bold">Método de Pago</label>
                            <select name="metodo_pago" class="form-select" required>
                                <option value="transferencia">Transferencia Bancaria</option>
                                <option value="efectivo">Efectivo / Caja</option>
                                <option value="tarjeta">Tarjeta de Débito / Crédito</option>
                                <option value="otros">Pago Móvil / Otro</option>
                            </select>
                        </div>
                        <div class="col-md-3">
                            <label class="form-label small fw-bold">Número de Referencia</label>
                            <input type="text" name="referencia" class="form-control" placeholder="Nº Confirmación">
                        </div>
                        <div class="col-md-3">
                            <label class="form-label small fw-bold">Fecha de Pago</label>
                            <div class="input-group">
                                <input type="date" name="fecha_pago" class="form-control" value="<?php echo date('Y-m-d'); ?>" required>
                                <button type="submit" class="btn btn-c58-teal">
                                    <i class="fas fa-check"></i> Registrar
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
                <?php endif; ?>
                
                <?php else: ?>
                <!-- Selección de contrato activo -->
                <div class="row mb-4">
                    <div class="col-md-8 mx-auto">
                        <div class="card border">
                            <div class="card-header bg-light fw-bold text-secondary">
                                <i class="fas fa-file-invoice me-1"></i> Selecciona un Contrato para Registrar Pagos
                            </div>
                            <div class="list-group list-group-flush">
                                <?php
                                $queryC = "
                                    SELECT c.*, cl.nombre_completo as emprendedor_nombre, cl.nombre_empresa
                                    FROM contratos c
                                    JOIN clientes cl ON c.cliente_id = cl.id
                                    WHERE c.estado_contrato = 'activo' AND c.saldo_pendiente > 0
                                    ORDER BY c.id DESC
                                ";
                                $resC = $db->query($queryC);
                                if ($resC && $resC->num_rows > 0):
                                    while ($r = $resC->fetch_assoc()):
                                ?>
                                <a href="pagos.php?contrato=<?php echo $r['id']; ?>" class="list-group-item list-group-item-action d-flex justify-content-between align-items-center">
                                    <div>
                                        <strong class="text-primary"><?php echo htmlspecialchars($r['numero_contrato']); ?></strong> &bull; <?php echo htmlspecialchars($r['emprendedor_nombre']); ?>
                                        <br>
                                        <small class="text-muted"><?php echo htmlspecialchars($r['nombre_empresa'] ?: 'Sin empresa'); ?></small>
                                    </div>
                                    <div class="text-end">
                                        <span class="badge bg-danger">Saldo: $<?php echo number_format($r['saldo_pendiente'], 2); ?></span>
                                    </div>
                                </a>
                                <?php
                                    endwhile;
                                else:
                                ?>
                                <div class="p-4 text-center text-muted">
                                    <i class="fas fa-check-circle text-success fs-3 mb-2 d-block"></i>
                                    No hay contratos activos con saldos pendientes por cobrar.
                                </div>
                                <?php endif; ?>
                            </div>
                        </div>
                    </div>
                </div>
                <?php endif; ?>
                
                <!-- Historial general o específico de pagos -->
                <h6 class="fw-bold text-secondary mb-3"><i class="fas fa-history me-1"></i> Historial de Pagos Verificados</h6>
                <div class="table-responsive">
                    <table class="table table-hover datatable align-middle">
                        <thead>
                            <tr>
                                <th># ID</th>
                                <th>Fecha</th>
                                <th>Contrato</th>
                                <th>Emprendedor</th>
                                <th>Monto</th>
                                <th>Método</th>
                                <th>Referencia</th>
                                <th>Estado</th>
                            </tr>
                        </thead>
                        <tbody>
                            <?php foreach ($pagos as $p): ?>
                            <tr>
                                <td>#<?php echo $p['id']; ?></td>
                                <td><?php echo date('d/m/Y', strtotime($p['fecha_pago'])); ?></td>
                                <td><span class="badge bg-light text-primary border"><?php echo htmlspecialchars($p['numero_contrato']); ?></span></td>
                                <td><strong><?php echo htmlspecialchars($p['emprendedor_nombre']); ?></strong></td>
                                <td><strong class="text-success">$<?php echo number_format($p['monto'], 2); ?></strong></td>
                                <td><?php echo htmlspecialchars($p['metodo_nombre']); ?></td>
                                <td><?php echo htmlspecialchars($p['referencia'] ?: 'N/A'); ?></td>
                                <td>
                                    <span class="badge bg-success"><i class="fas fa-check-circle me-1"></i>Verificado</span>
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