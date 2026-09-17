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
                // Verificar si tiene pagos asociados
                $checkPagos = $db->query("SELECT COUNT(*) as total FROM pagos WHERE contrato_id = $id");
                $totalPagos = $checkPagos ? $checkPagos->fetch_assoc()['total'] : 0;
                
                if ($totalPagos > 0) {
                    setFlash('danger', 'No se puede eliminar el contrato porque tiene comprobantes o pagos registrados');
                } else {
                    $stmt = $db->prepare("DELETE FROM contratos WHERE id = ?");
                    $stmt->bind_param("i", $id);
                    if ($stmt->execute()) {
                        setFlash('success', 'Contrato eliminado correctamente');
                    } else {
                        setFlash('danger', 'Error al eliminar el contrato: ' . $db->getConnection()->error);
                    }
                }
                redirect('modules/contratos/');
            }
            break;
    }
}

// Obtener contratos
$contratos = [];
$whereClause = "";

if ($_SESSION['rol'] == 'comercial') {
    $whereClause = "WHERE c.comercial_id = " . intval($_SESSION['usuario_id']);
}

$query = "
    SELECT c.*, 
           cl.nombre_completo as emprendedor_nombre,
           cl.nombre_empresa,
           u.nombre as comercial_nombre,
           (SELECT COUNT(*) FROM pagos WHERE contrato_id = c.id) as total_pagos
    FROM contratos c
    JOIN clientes cl ON c.cliente_id = cl.id
    JOIN usuarios u ON c.comercial_id = u.id
    $whereClause
    ORDER BY c.id DESC
";

$result = $db->query($query);
if ($result) {
    while ($row = $result->fetch_assoc()) {
        $contratos[] = $row;
    }
}

include '../../includes/header.php';
?>

<div class="row">
    <div class="col-12">
        <div class="card fade-in">
            <div class="card-header bg-white d-flex justify-content-between align-items-center py-3">
                <h5 class="mb-0 fw-bold" style="color: var(--c58-navy);">
                    <i class="fas fa-file-contract text-primary me-2"></i> Gestión de Contratos Comerciales
                </h5>
                <div class="d-flex gap-2">
                    <a href="comprobantes.php" class="btn btn-outline-warning btn-sm">
                        <i class="fas fa-receipt"></i> Comprobantes de Pago
                    </a>
                    <a href="pagos.php" class="btn btn-outline-info btn-sm">
                        <i class="fas fa-money-bill-wave"></i> Registro de Pagos
                    </a>
                    <?php if (hasRole(['direccion', 'comercial'])): ?>
                    <a href="crear.php" class="btn btn-c58-teal btn-sm">
                        <i class="fas fa-plus"></i> Nuevo Contrato
                    </a>
                    <?php endif; ?>
                </div>
            </div>
            
            <div class="card-body">
                <div class="table-responsive">
                    <table class="table table-hover datatable align-middle">
                        <thead>
                            <tr>
                                <th>Nº Contrato</th>
                                <th>Emprendedor / Empresa</th>
                                <th>Asesor Comercial</th>
                                <th>Monto Total</th>
                                <th>Anticipo</th>
                                <th>Saldo Pendiente</th>
                                <th>Estado Pago</th>
                                <th>Estado</th>
                                <th class="text-end">Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            <?php foreach ($contratos as $contrato): ?>
                            <tr>
                                <td>
                                    <strong class="text-primary"><?php echo htmlspecialchars($contrato['numero_contrato']); ?></strong><br>
                                    <small class="text-muted"><i class="far fa-calendar-alt me-1"></i><?php echo date('d/m/Y', strtotime($contrato['fecha_firma'])); ?></small>
                                </td>
                                <td>
                                    <strong><?php echo htmlspecialchars($contrato['emprendedor_nombre']); ?></strong><br>
                                    <small class="text-muted"><i class="fas fa-building me-1"></i><?php echo htmlspecialchars($contrato['nombre_empresa'] ?? 'N/A'); ?></small>
                                </td>
                                <td><?php echo htmlspecialchars($contrato['comercial_nombre']); ?></td>
                                <td><strong>$<?php echo number_format($contrato['monto_total'], 2); ?></strong></td>
                                <td>$<?php echo number_format($contrato['anticipo'], 2); ?></td>
                                <td>
                                    <span class="fw-bold <?php echo $contrato['saldo_pendiente'] > 0 ? 'text-danger' : 'text-success'; ?>">
                                        $<?php echo number_format($contrato['saldo_pendiente'], 2); ?>
                                    </span>
                                </td>
                                <td>
                                    <?php echo renderBadgeEstadoPago($contrato['estado_pago']); ?>
                                </td>
                                <td>
                                    <?php echo renderBadgeEstadoContrato($contrato['estado_contrato']); ?>
                                </td>
                                <td class="text-end">
                                    <div class="btn-group btn-group-sm">
                                        <a href="ver.php?id=<?php echo $contrato['id']; ?>" class="btn btn-outline-info" title="Ver Detalles">
                                            <i class="fas fa-eye"></i>
                                        </a>
                                        <?php if ($contrato['estado_contrato'] == 'activo'): ?>
                                        <a href="editar.php?id=<?php echo $contrato['id']; ?>" class="btn btn-outline-warning" title="Editar">
                                            <i class="fas fa-edit"></i>
                                        </a>
                                        <a href="pagos.php?contrato=<?php echo $contrato['id']; ?>" class="btn btn-outline-success" title="Registrar Pago">
                                            <i class="fas fa-dollar-sign"></i>
                                        </a>
                                        <a href="comprobantes.php?contrato=<?php echo $contrato['id']; ?>" class="btn btn-outline-secondary" title="Subir Comprobante">
                                            <i class="fas fa-upload"></i>
                                        </a>
                                        <?php endif; ?>
                                        <a href="?action=delete&id=<?php echo $contrato['id']; ?>" class="btn btn-outline-danger btn-delete" 
                                           data-message="¿Está seguro de eliminar este contrato comercial?">
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