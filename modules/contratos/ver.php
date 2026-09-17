<?php
require_once '../../config/config.php';
require_once '../../config/database.php';

if (!isLoggedIn()) {
    redirect('login.php');
}

$db = Database::getInstance();
$contrato_id = intval($_GET['id'] ?? 0);

if ($contrato_id <= 0) {
    setFlash('danger', 'ID de contrato no válido');
    redirect('modules/contratos/');
}

// Obtener información del contrato
$stmt = $db->prepare("
    SELECT c.*, 
           cl.id as emprendedor_id,
           cl.nombre_completo as emprendedor_nombre,
           cl.identificacion as emprendedor_rif,
           cl.nombre_empresa,
           cl.email as emprendedor_email,
           cl.telefono as emprendedor_telefono,
           cl.direccion as emprendedor_direccion,
           u.nombre as comercial_nombre,
           u.email as comercial_email
    FROM contratos c
    JOIN clientes cl ON c.cliente_id = cl.id
    JOIN usuarios u ON c.comercial_id = u.id
    WHERE c.id = ?
");
$stmt->bind_param("i", $contrato_id);
$stmt->execute();
$contrato = $stmt->get_result()->fetch_assoc();

if (!$contrato) {
    setFlash('danger', 'Contrato no encontrado');
    redirect('modules/contratos/');
}

// Obtener pagos y comprobantes asociados al contrato
$pagos = [];
$stmtPagos = $db->prepare("
    SELECT p.*,
           CASE p.metodo_pago
               WHEN 'efectivo' THEN 'Efectivo'
               WHEN 'transferencia' THEN 'Transferencia Bancaria'
               WHEN 'tarjeta' THEN 'Tarjeta'
               ELSE 'Otro'
           END as metodo_nombre
    FROM pagos p
    WHERE p.contrato_id = ?
    ORDER BY p.fecha_pago DESC
");
$stmtPagos->bind_param("i", $contrato_id);
$stmtPagos->execute();
$resPagos = $stmtPagos->get_result();
while ($p = $resPagos->fetch_assoc()) {
    $pagos[] = $p;
}

$total_pagado = $contrato['monto_total'] - $contrato['saldo_pendiente'];

include '../../includes/header.php';
?>

<div class="row justify-content-center">
    <div class="col-lg-10">
        <div class="card shadow-sm fade-in mb-4">
            <div class="card-header bg-white py-3 d-flex justify-content-between align-items-center">
                <div>
                    <span class="badge badge-c58-navy me-2"><?php echo htmlspecialchars($contrato['numero_contrato']); ?></span>
                    <h5 class="d-inline-block mb-0 fw-bold" style="color: var(--c58-navy);">
                        Ficha Oficial de Contrato Comercial
                    </h5>
                </div>
                <div class="d-flex gap-2">
                    <a href="index.php" class="btn btn-outline-secondary btn-sm">
                        <i class="fas fa-arrow-left"></i> Volver
                    </a>
                    <?php if ($contrato['estado_contrato'] == 'activo'): ?>
                    <a href="editar.php?id=<?php echo $contrato['id']; ?>" class="btn btn-outline-warning btn-sm">
                        <i class="fas fa-edit"></i> Editar
                    </a>
                    <a href="pagos.php?contrato=<?php echo $contrato['id']; ?>" class="btn btn-c58-teal btn-sm">
                        <i class="fas fa-dollar-sign"></i> Registrar Pago
                    </a>
                    <a href="comprobantes.php?contrato=<?php echo $contrato['id']; ?>" class="btn btn-outline-primary btn-sm">
                        <i class="fas fa-receipt"></i> Comprobantes
                    </a>
                    <?php endif; ?>
                    <button class="btn btn-outline-dark btn-sm" onclick="printElement('ficha-contrato', 'Contrato <?php echo $contrato['numero_contrato']; ?>')">
                        <i class="fas fa-print"></i> Imprimir
                    </button>
                </div>
            </div>
            
            <div class="card-body p-4" id="ficha-contrato">
                <!-- Resumen Financiero Superior -->
                <div class="row g-3 mb-4">
                    <div class="col-md-3">
                        <div class="p-3 bg-light rounded text-center border">
                            <span class="text-muted small text-uppercase fw-bold">Monto Contratado</span>
                            <h4 class="fw-bold mb-0 text-dark">$<?php echo number_format($contrato['monto_total'], 2); ?></h4>
                        </div>
                    </div>
                    <div class="col-md-3">
                        <div class="p-3 bg-light rounded text-center border">
                            <span class="text-muted small text-uppercase fw-bold">Anticipo Pactado</span>
                            <h4 class="fw-bold mb-0 text-secondary">$<?php echo number_format($contrato['anticipo'], 2); ?></h4>
                        </div>
                    </div>
                    <div class="col-md-3">
                        <div class="p-3 bg-light rounded text-center border">
                            <span class="text-muted small text-uppercase fw-bold">Total Recaudado</span>
                            <h4 class="fw-bold mb-0 text-success">$<?php echo number_format($total_pagado, 2); ?></h4>
                        </div>
                    </div>
                    <div class="col-md-3">
                        <div class="p-3 bg-light rounded text-center border">
                            <span class="text-muted small text-uppercase fw-bold">Saldo Pendiente</span>
                            <h4 class="fw-bold mb-0 <?php echo $contrato['saldo_pendiente'] > 0 ? 'text-danger' : 'text-success'; ?>">
                                $<?php echo number_format($contrato['saldo_pendiente'], 2); ?>
                            </h4>
                        </div>
                    </div>
                </div>

                <!-- Partes del Contrato -->
                <div class="row g-4 mb-4">
                    <div class="col-md-6">
                        <div class="p-3 border rounded-3 bg-light h-100">
                            <h6 class="fw-bold text-primary mb-3">
                                <i class="fas fa-user-tie me-2"></i> Datos del Emprendedor Contratante
                            </h6>
                            <p class="mb-1"><strong>Nombre:</strong> <?php echo htmlspecialchars($contrato['emprendedor_nombre']); ?></p>
                            <?php if (!empty($contrato['emprendedor_rif'])): ?>
                            <p class="mb-1"><strong>Cédula / RIF:</strong> <?php echo htmlspecialchars($contrato['emprendedor_rif']); ?></p>
                            <?php endif; ?>
                            <p class="mb-1"><strong>Empresa / Razón Social:</strong> <?php echo htmlspecialchars($contrato['nombre_empresa'] ?? 'Persona Natural'); ?></p>
                            <p class="mb-1"><strong>Teléfono:</strong> <?php echo htmlspecialchars($contrato['emprendedor_telefono'] ?? 'N/A'); ?></p>
                            <p class="mb-1"><strong>Email:</strong> <?php echo htmlspecialchars($contrato['emprendedor_email'] ?? 'N/A'); ?></p>
                            <p class="mb-0"><strong>Dirección:</strong> <?php echo htmlspecialchars($contrato['emprendedor_direccion'] ?? 'N/A'); ?></p>
                        </div>
                    </div>
                    
                    <div class="col-md-6">
                        <div class="p-3 border rounded-3 bg-light h-100">
                            <h6 class="fw-bold text-success mb-3">
                                <i class="fas fa-calendar-alt me-2"></i> Términos & Fechas de Ejecución
                            </h6>
                            <p class="mb-1"><strong>Asesor Comercial:</strong> <?php echo htmlspecialchars($contrato['comercial_nombre']); ?> (<?php echo htmlspecialchars($contrato['comercial_email']); ?>)</p>
                            <p class="mb-1"><strong>Fecha de Firma:</strong> <?php echo date('d/m/Y', strtotime($contrato['fecha_firma'])); ?></p>
                            <p class="mb-1"><strong>Inicio de Servicios:</strong> <?php echo $contrato['fecha_inicio_servicio'] ? date('d/m/Y', strtotime($contrato['fecha_inicio_servicio'])) : 'Inmediato'; ?></p>
                            <p class="mb-1"><strong>Fin Estimado:</strong> <?php echo $contrato['fecha_fin_servicio'] ? date('d/m/Y', strtotime($contrato['fecha_fin_servicio'])) : 'Según avance'; ?></p>
                            <p class="mb-1"><strong>Estado del Contrato:</strong> <?php echo renderBadgeEstadoContrato($contrato['estado_contrato']); ?></p>
                            <p class="mb-0"><strong>Estado del Pago:</strong> <?php echo renderBadgeEstadoPago($contrato['estado_pago']); ?></p>
                        </div>
                    </div>
                </div>

                <!-- Condiciones y Observaciones -->
                <div class="mb-4">
                    <h6 class="fw-bold text-secondary mb-2"><i class="fas fa-file-alt me-1"></i> Condiciones Pactadas y Alcance</h6>
                    <div class="p-3 bg-white border rounded">
                        <?php echo nl2br(htmlspecialchars($contrato['condiciones'] ?: 'Términos estándar según catálogo de servicios Código-58.')); ?>
                    </div>
                </div>

                <?php if (!empty($contrato['observaciones'])): ?>
                <div class="mb-4">
                    <h6 class="fw-bold text-secondary mb-2"><i class="fas fa-sticky-note me-1"></i> Observaciones</h6>
                    <div class="p-3 bg-white border rounded">
                        <?php echo nl2br(htmlspecialchars($contrato['observaciones'])); ?>
                    </div>
                </div>
                <?php endif; ?>

                <!-- Historial de Pagos y Comprobantes -->
                <div class="mt-4">
                    <h6 class="fw-bold text-secondary mb-3">
                        <i class="fas fa-history me-1"></i> Historial de Abonos y Comprobantes
                    </h6>
                    <div class="table-responsive">
                        <table class="table table-hover align-middle">
                            <thead class="table-light">
                                <tr>
                                    <th># ID</th>
                                    <th>Fecha</th>
                                    <th>Monto</th>
                                    <th>Método</th>
                                    <th>Referencia</th>
                                    <th>Comprobante</th>
                                    <th>Estado</th>
                                </tr>
                            </thead>
                            <tbody>
                                <?php if (empty($pagos)): ?>
                                <tr><td colspan="7" class="text-center text-muted py-3">No hay pagos o comprobantes registrados</td></tr>
                                <?php else: ?>
                                <?php foreach ($pagos as $pg): ?>
                                <tr>
                                    <td>#<?php echo $pg['id']; ?></td>
                                    <td><?php echo date('d/m/Y', strtotime($pg['fecha_pago'])); ?></td>
                                    <td><strong class="text-success">$<?php echo number_format($pg['monto'], 2); ?></strong></td>
                                    <td><?php echo htmlspecialchars($pg['metodo_nombre']); ?></td>
                                    <td><?php echo htmlspecialchars($pg['referencia'] ?: 'N/A'); ?></td>
                                    <td>
                                        <?php if (!empty($pg['comprobante'])): ?>
                                        <a href="<?php echo SITE_URL . ltrim($pg['comprobante'], '/'); ?>" target="_blank" class="btn btn-sm btn-outline-info">
                                            <i class="fas fa-file-download"></i> Ver Archivo
                                        </a>
                                        <?php else: ?>
                                        <span class="text-muted small">Sin archivo adjunto</span>
                                        <?php endif; ?>
                                    </td>
                                    <td>
                                        <?php
                                        $pStatus = [
                                            'pendiente' => 'badge-c58-amber',
                                            'verificado' => 'bg-success',
                                            'rechazado' => 'bg-danger'
                                        ];
                                        ?>
                                        <span class="badge <?php echo $pStatus[$pg['status']] ?? 'bg-secondary'; ?>">
                                            <?php echo ucfirst($pg['status']); ?>
                                        </span>
                                    </td>
                                </tr>
                                <?php endforeach; ?>
                                <?php endif; ?>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>

<?php include '../../includes/footer.php'; ?>
