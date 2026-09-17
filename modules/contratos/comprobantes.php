<?php
require_once '../../config/config.php';
require_once '../../config/database.php';
require_once '../../config/upload.php';

if (!isLoggedIn()) {
    redirect('login.php');
}

$db = Database::getInstance();
$contrato_id = intval($_GET['contrato'] ?? 0);
$error = '';

// Procesar subida de comprobante
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_FILES['comprobante'])) {
    $contrato_id = intval($_POST['contrato_id'] ?? 0);
    $fecha_pago = sanitize($_POST['fecha_pago'] ?? date('Y-m-d'));
    $monto = floatval($_POST['monto'] ?? 0);
    $metodo_pago = sanitize($_POST['metodo_pago'] ?? 'transferencia');
    $referencia = sanitize($_POST['referencia'] ?? '');
    
    // Verificar contrato
    $stmt = $db->prepare("SELECT id, saldo_pendiente FROM contratos WHERE id = ? AND estado_contrato = 'activo'");
    $stmt->bind_param("i", $contrato_id);
    $stmt->execute();
    $cRow = $stmt->get_result()->fetch_assoc();
    
    if (!$cRow) {
        setFlash('danger', 'El contrato indicado no es válido o está inactivo');
        redirect('modules/contratos/comprobantes.php');
    }
    
    if ($monto <= 0) {
        setFlash('danger', 'El monto debe ser superior a 0');
        redirect('modules/contratos/comprobantes.php?contrato=' . $contrato_id);
    }
    
    // Subir archivo a comprobantes
    $upload_result = uploadFile(
        $_FILES['comprobante'],
        UPLOAD_COMPROBANTES,
        'transferencias/',
        ['pdf', 'jpg', 'jpeg', 'png', 'gif']
    );
    
    if ($upload_result['success']) {
        $stmt = $db->prepare("
            INSERT INTO pagos (contrato_id, monto, fecha_pago, metodo_pago, referencia, comprobante, status) 
            VALUES (?, ?, ?, ?, ?, ?, 'pendiente')
        ");
        $stmt->bind_param("idssss", 
            $contrato_id, 
            $monto, 
            $fecha_pago, 
            $metodo_pago, 
            $referencia, 
            $upload_result['relative_path']
        );
        
        if ($stmt->execute()) {
            setFlash('success', 'Comprobante de pago subido exitosamente. En espera de verificación por Dirección.');
        } else {
            setFlash('danger', 'Error al guardar el comprobante en la base de datos');
            deleteFile($upload_result['path']);
        }
    } else {
        setFlash('danger', $upload_result['error']);
    }
    
    redirect('modules/contratos/comprobantes.php?contrato=' . $contrato_id);
}

// Obtener información del contrato si fue seleccionado
$contrato = null;
if ($contrato_id > 0) {
    $stmt = $db->prepare("
        SELECT c.*, cl.nombre_completo as emprendedor_nombre, cl.nombre_empresa
        FROM contratos c
        JOIN clientes cl ON c.cliente_id = cl.id
        WHERE c.id = ?
    ");
    $stmt->bind_param("i", $contrato_id);
    $stmt->execute();
    $contrato = $stmt->get_result()->fetch_assoc();
}

// Obtener comprobantes del contrato o generales
$comprobantes = [];
$whereClause = ($contrato_id > 0) ? "WHERE p.contrato_id = $contrato_id" : "";

$stmt = $db->prepare("
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
");
$stmt->execute();
$result = $stmt->get_result();
while ($row = $result->fetch_assoc()) {
    $comprobantes[] = $row;
}

include '../../includes/header.php';
?>

<div class="row">
    <div class="col-12">
        <div class="card shadow-sm fade-in">
            <div class="card-header bg-white py-3 d-flex justify-content-between align-items-center">
                <h5 class="mb-0 fw-bold" style="color: var(--c58-navy);">
                    <i class="fas fa-receipt text-warning me-2"></i> Gestión de Comprobantes de Pago
                </h5>
                <div class="d-flex gap-2">
                    <a href="index.php" class="btn btn-outline-secondary btn-sm">
                        <i class="fas fa-arrow-left"></i> Volver a Contratos
                    </a>
                </div>
            </div>
            <div class="card-body p-4">
                <?php if ($contrato): ?>
                <!-- Información del contrato -->
                <div class="row g-3 mb-4">
                    <div class="col-md-6">
                        <div class="p-3 bg-light rounded border h-100">
                            <h6 class="fw-bold text-primary mb-2">Contrato Seleccionado</h6>
                            <p class="mb-1"><strong>Nº:</strong> <span class="badge badge-c58-navy"><?php echo htmlspecialchars($contrato['numero_contrato']); ?></span></p>
                            <p class="mb-1"><strong>Emprendedor:</strong> <?php echo htmlspecialchars($contrato['emprendedor_nombre']); ?></p>
                            <p class="mb-0"><strong>Empresa:</strong> <?php echo htmlspecialchars($contrato['nombre_empresa'] ?? 'N/A'); ?></p>
                        </div>
                    </div>
                    <div class="col-md-6">
                        <div class="p-3 bg-light rounded border h-100">
                            <h6 class="fw-bold text-success mb-2">Estado Financiero</h6>
                            <p class="mb-1"><strong>Monto Total:</strong> $<?php echo number_format($contrato['monto_total'], 2); ?></p>
                            <p class="mb-1"><strong>Saldo Pendiente:</strong> 
                                <span class="fw-bold <?php echo $contrato['saldo_pendiente'] > 0 ? 'text-danger' : 'text-success'; ?>">
                                    $<?php echo number_format($contrato['saldo_pendiente'], 2); ?>
                                </span>
                            </p>
                            <p class="mb-0"><strong>Estado Pago:</strong> <?php echo renderBadgeEstadoPago($contrato['estado_pago']); ?></p>
                        </div>
                    </div>
                </div>
                
                <!-- Subida de comprobante -->
                <?php if ($contrato['saldo_pendiente'] > 0 && $contrato['estado_contrato'] == 'activo'): ?>
                <div class="card p-3 bg-light border mb-4">
                    <h6 class="fw-bold mb-3 text-secondary"><i class="fas fa-upload me-1"></i> Subir Nuevo Comprobante Digital</h6>
                    <form method="POST" enctype="multipart/form-data" class="row g-3">
                        <input type="hidden" name="contrato_id" value="<?php echo $contrato['id']; ?>">
                        
                        <div class="col-md-3">
                            <label class="form-label small fw-bold">Monto ($)</label>
                            <input type="number" step="0.01" name="monto" class="form-control fw-bold" required max="<?php echo $contrato['saldo_pendiente']; ?>" placeholder="0.00">
                        </div>
                        <div class="col-md-3">
                            <label class="form-label small fw-bold">Método</label>
                            <select name="metodo_pago" class="form-select" required>
                                <option value="transferencia">Transferencia Bancaria</option>
                                <option value="efectivo">Efectivo / Caja</option>
                                <option value="tarjeta">Tarjeta</option>
                                <option value="otros">Pago Móvil / Otro</option>
                            </select>
                        </div>
                        <div class="col-md-3">
                            <label class="form-label small fw-bold">Fecha Pago</label>
                            <input type="date" name="fecha_pago" class="form-control" value="<?php echo date('Y-m-d'); ?>" required>
                        </div>
                        <div class="col-md-3">
                            <label class="form-label small fw-bold">Referencia / Voucher</label>
                            <input type="text" name="referencia" class="form-control" placeholder="Nº Confirmación">
                        </div>
                        <div class="col-md-9">
                            <label class="form-label small fw-bold">Archivo del Comprobante (PDF, JPG, PNG)</label>
                            <input type="file" name="comprobante" class="form-control" accept=".pdf,.jpg,.jpeg,.png,.gif" required>
                        </div>
                        <div class="col-md-3 d-flex align-items-end">
                            <button type="submit" class="btn btn-c58-teal w-100">
                                <i class="fas fa-upload"></i> Subir Comprobante
                            </button>
                        </div>
                    </form>
                </div>
                <?php endif; ?>
                
                <?php else: ?>
                <!-- Selección de contrato -->
                <div class="alert alert-info shadow-sm mb-4">
                    <i class="fas fa-info-circle me-1"></i> Selecciona un contrato activo para cargar o revisar comprobantes específicos.
                </div>
                
                <div class="row mb-4">
                    <div class="col-md-8 mx-auto">
                        <div class="card border shadow-sm">
                            <div class="card-header bg-light fw-bold text-secondary">
                                <i class="fas fa-file-contract me-1"></i> Contratos con Saldo Pendiente
                            </div>
                            <div class="list-group list-group-flush">
                                <?php
                                $queryActivos = "
                                    SELECT c.*, cl.nombre_completo as emprendedor_nombre, cl.nombre_empresa
                                    FROM contratos c
                                    JOIN clientes cl ON c.cliente_id = cl.id
                                    WHERE c.estado_contrato = 'activo' AND c.saldo_pendiente > 0
                                    ORDER BY c.id DESC
                                ";
                                $resAct = $db->query($queryActivos);
                                if ($resAct && $resAct->num_rows > 0):
                                    while ($r = $resAct->fetch_assoc()):
                                ?>
                                <a href="comprobantes.php?contrato=<?php echo $r['id']; ?>" class="list-group-item list-group-item-action d-flex justify-content-between align-items-center">
                                    <div>
                                        <strong class="text-primary"><?php echo htmlspecialchars($r['numero_contrato']); ?></strong> &bull; <?php echo htmlspecialchars($r['emprendedor_nombre']); ?>
                                        <br>
                                        <small class="text-muted"><?php echo htmlspecialchars($r['nombre_empresa'] ?: 'Persona Natural'); ?></small>
                                    </div>
                                    <div class="text-end">
                                        <span class="badge bg-danger">Saldo: $<?php echo number_format($r['saldo_pendiente'], 2); ?></span>
                                    </div>
                                </a>
                                <?php
                                    endwhile;
                                else:
                                ?>
                                <div class="p-4 text-center text-muted">Todos los contratos se encuentran solventes</div>
                                <?php endif; ?>
                            </div>
                        </div>
                    </div>
                </div>
                <?php endif; ?>
                
                <!-- Tabla de Comprobantes -->
                <h6 class="fw-bold text-secondary mb-3"><i class="fas fa-list me-1"></i> Listado de Comprobantes Registrados</h6>
                <div class="table-responsive">
                    <table class="table table-hover datatable align-middle">
                        <thead>
                            <tr>
                                <th>Fecha</th>
                                <th>Contrato</th>
                                <th>Emprendedor</th>
                                <th>Monto</th>
                                <th>Método</th>
                                <th>Referencia</th>
                                <th>Archivo</th>
                                <th>Estado</th>
                                <th class="text-end">Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            <?php foreach ($comprobantes as $cp): ?>
                            <tr>
                                <td><?php echo date('d/m/Y', strtotime($cp['fecha_pago'])); ?></td>
                                <td><span class="badge bg-light text-dark border"><?php echo htmlspecialchars($cp['numero_contrato']); ?></span></td>
                                <td><strong><?php echo htmlspecialchars($cp['emprendedor_nombre']); ?></strong></td>
                                <td><strong class="text-success">$<?php echo number_format($cp['monto'], 2); ?></strong></td>
                                <td><?php echo htmlspecialchars($cp['metodo_nombre']); ?></td>
                                <td><?php echo htmlspecialchars($cp['referencia'] ?: 'N/A'); ?></td>
                                <td>
                                    <?php if (!empty($cp['comprobante'])): ?>
                                    <a href="<?php echo SITE_URL . ltrim($cp['comprobante'], '/'); ?>" target="_blank" class="btn btn-sm btn-outline-info">
                                        <i class="fas fa-file-alt"></i> Ver
                                    </a>
                                    <?php else: ?>
                                    <span class="text-muted small">Sin adjunto</span>
                                    <?php endif; ?>
                                </td>
                                <td>
                                    <?php
                                    $stClass = [
                                        'pendiente' => 'badge-c58-amber',
                                        'verificado' => 'bg-success',
                                        'rechazado' => 'bg-danger'
                                    ];
                                    ?>
                                    <span class="badge <?php echo $stClass[$cp['status']] ?? 'bg-secondary'; ?>">
                                        <?php echo ucfirst($cp['status']); ?>
                                    </span>
                                </td>
                                <td class="text-end">
                                    <div class="btn-group btn-group-sm">
                                        <?php if ($cp['status'] == 'pendiente' && hasRole(['direccion'])): ?>
                                        <a href="verificar_comprobante.php?id=<?php echo $cp['id']; ?>&action=verificar" 
                                           class="btn btn-outline-success" title="Verificar y acreditar saldo" 
                                           onclick="return confirm('¿Aprobar comprobante y acreditar saldo al contrato?')">
                                            <i class="fas fa-check-circle"></i> Aprobar
                                        </a>
                                        <a href="verificar_comprobante.php?id=<?php echo $cp['id']; ?>&action=rechazar" 
                                           class="btn btn-outline-warning" title="Rechazar comprobante"
                                           onclick="return confirm('¿Rechazar este comprobante?')">
                                            <i class="fas fa-times-circle"></i>
                                        </a>
                                        <?php endif; ?>
                                        
                                        <?php if ($cp['status'] == 'pendiente'): ?>
                                        <a href="eliminar_comprobante.php?id=<?php echo $cp['id']; ?>&contrato=<?php echo $contrato_id; ?>" 
                                           class="btn btn-outline-danger btn-delete" 
                                           data-message="¿Está seguro de eliminar este comprobante?">
                                            <i class="fas fa-trash"></i>
                                        </a>
                                        <?php endif; ?>
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