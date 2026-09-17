<?php
require_once '../../config/config.php';
require_once '../../config/database.php';

if (!isLoggedIn()) {
    redirect('login.php');
}

$db = Database::getInstance();
$cliente_id = intval($_GET['id'] ?? 0);

if ($cliente_id <= 0) {
    setFlash('danger', 'ID de emprendedor no válido');
    redirect('modules/clientes/');
}

// Obtener información del emprendedor
$stmt = $db->prepare("
    SELECT c.*, u.nombre as asesor_nombre, u.email as asesor_email
    FROM clientes c
    LEFT JOIN usuarios u ON c.usuario_id_creacion = u.id
    WHERE c.id = ?
");
$stmt->bind_param("i", $cliente_id);
$stmt->execute();
$cliente = $stmt->get_result()->fetch_assoc();

if (!$cliente) {
    setFlash('danger', 'Emprendedor no encontrado');
    redirect('modules/clientes/');
}

// Obtener asesorías del emprendedor
$asesorias = [];
$stmt = $db->prepare("
    SELECT a.*, u.nombre as consultor_nombre
    FROM asesorias a
    LEFT JOIN usuarios u ON a.consultor_id = u.id
    WHERE a.cliente_id = ?
    ORDER BY a.fecha_programada DESC
");
$stmt->bind_param("i", $cliente_id);
$stmt->execute();
$result = $stmt->get_result();
while ($row = $result->fetch_assoc()) {
    $asesorias[] = $row;
}

// Obtener procesos legales
$procesos = [];
$stmt = $db->prepare("
    SELECT p.*, u.nombre as gestor_nombre,
           COUNT(d.id) as total_documentos
    FROM procesos_legales p
    LEFT JOIN usuarios u ON p.gestor_id = u.id
    LEFT JOIN documentos_legales d ON p.id = d.proceso_legal_id
    WHERE p.cliente_id = ?
    GROUP BY p.id
    ORDER BY p.fecha_inicio DESC
");
$stmt->bind_param("i", $cliente_id);
$stmt->execute();
$result = $stmt->get_result();
while ($row = $result->fetch_assoc()) {
    $procesos[] = $row;
}

// Obtener contratos
$contratos = [];
$stmt = $db->prepare("
    SELECT c.*, u.nombre as comercial_nombre
    FROM contratos c
    LEFT JOIN usuarios u ON c.comercial_id = u.id
    WHERE c.cliente_id = ?
    ORDER BY c.id DESC
");
$stmt->bind_param("i", $cliente_id);
$stmt->execute();
$result = $stmt->get_result();
while ($row = $result->fetch_assoc()) {
    $contratos[] = $row;
}

// Obtener interacciones
$interacciones = [];
$stmt = $db->prepare("
    SELECT i.*, u.nombre as usuario_nombre
    FROM interacciones i
    LEFT JOIN usuarios u ON i.usuario_id = u.id
    WHERE i.cliente_id = ?
    ORDER BY i.fecha_hora DESC
    LIMIT 15
");
$stmt->bind_param("i", $cliente_id);
$stmt->execute();
$result = $stmt->get_result();
while ($row = $result->fetch_assoc()) {
    $interacciones[] = $row;
}

// Teléfono limpio para WhatsApp
$whatsapp_clean = preg_replace('/[^0-9]/', '', $cliente['telefono'] ?? '');
if (!empty($whatsapp_clean) && substr($whatsapp_clean, 0, 1) === '0') {
    $whatsapp_clean = '58' . substr($whatsapp_clean, 1);
}

include '../../includes/header.php';
?>

<div class="row">
    <div class="col-12">
        <div class="card shadow-sm fade-in">
            <div class="card-header bg-white py-3 d-flex justify-content-between align-items-center">
                <div>
                    <span class="badge badge-c58-navy me-2">ID #<?php echo $cliente['id']; ?></span>
                    <h5 class="d-inline-block mb-0 fw-bold" style="color: var(--c58-navy);">
                        Ficha Integral del Emprendedor
                    </h5>
                </div>
                <div class="d-flex gap-2">
                    <a href="editar.php?id=<?php echo $cliente_id; ?>" class="btn btn-outline-warning btn-sm">
                        <i class="fas fa-edit"></i> Editar
                    </a>
                    <a href="<?php echo SITE_URL; ?>modules/directorio/" class="btn btn-outline-primary btn-sm">
                        <i class="fas fa-address-book"></i> Ver en Directorio
                    </a>
                    <a href="index.php" class="btn btn-outline-secondary btn-sm">
                        <i class="fas fa-arrow-left"></i> Volver a la Lista
                    </a>
                </div>
            </div>
            
            <div class="card-body p-4">
                <!-- Información personal y Resumen -->
                <div class="row g-4 mb-4">
                    <div class="col-lg-8">
                        <div class="p-3 bg-light rounded-3 border h-100">
                            <div class="d-flex justify-content-between align-items-start mb-3">
                                <div>
                                    <h4 class="fw-bold mb-1" style="color: var(--c58-navy);">
                                        <?php echo htmlspecialchars($cliente['nombre_completo']); ?>
                                    </h4>
                                    <span class="text-secondary fw-semibold">
                                        <i class="fas fa-building me-1"></i><?php echo htmlspecialchars($cliente['nombre_empresa'] ?: 'Persona Natural'); ?>
                                    </span>
                                </div>
                                <div>
                                    <?php echo renderBadgeEstadoEmprendedor($cliente['status']); ?>
                                </div>
                            </div>
                            
                            <table class="table table-sm table-borderless mb-0">
                                <tr>
                                    <td style="width: 140px;" class="text-muted fw-bold">Identificación:</td>
                                    <td><strong><?php echo htmlspecialchars($cliente['identificacion'] ?: 'Sin RIF / Cédula'); ?></strong></td>
                                    <td style="width: 120px;" class="text-muted fw-bold">Sector:</td>
                                    <td><span class="badge bg-secondary"><?php echo htmlspecialchars($cliente['industria'] ?: 'General'); ?></span></td>
                                </tr>
                                <tr>
                                    <td class="text-muted fw-bold">Correo:</td>
                                    <td><a href="mailto:<?php echo htmlspecialchars($cliente['email']); ?>"><?php echo htmlspecialchars($cliente['email']); ?></a></td>
                                    <td class="text-muted fw-bold">Teléfono:</td>
                                    <td>
                                        <?php echo htmlspecialchars($cliente['telefono'] ?: 'N/A'); ?>
                                        <?php if (!empty($whatsapp_clean)): ?>
                                        <a href="https://wa.me/<?php echo $whatsapp_clean; ?>?text=Hola%20<?php echo urlencode($cliente['nombre_completo']); ?>,%20te%20contactamos%20de%20C%C3%B3digo-58" target="_blank" class="contact-btn-whatsapp ms-2">
                                            <i class="fab fa-whatsapp"></i> WhatsApp
                                        </a>
                                        <?php endif; ?>
                                    </td>
                                </tr>
                                <tr>
                                    <td class="text-muted fw-bold">Dirección:</td>
                                    <td colspan="3"><?php echo htmlspecialchars($cliente['direccion'] ?: 'No registrada'); ?></td>
                                </tr>
                                <tr>
                                    <td class="text-muted fw-bold">Servicios:</td>
                                    <td colspan="3">
                                        <?php if (!empty($cliente['servicios_ofrecidos'])): ?>
                                            <span class="badge badge-c58-teal py-1 px-2"><?php echo htmlspecialchars($cliente['servicios_ofrecidos']); ?></span>
                                        <?php else: ?>
                                            <span class="text-muted small">No ha registrado catálogo de servicios todavía.</span>
                                        <?php endif; ?>
                                    </td>
                                </tr>
                                <tr>
                                    <td class="text-muted fw-bold">Asesor Asignado:</td>
                                    <td colspan="3">
                                        <?php if ($cliente['asesor_nombre']): ?>
                                            <span class="text-primary fw-semibold"><?php echo htmlspecialchars($cliente['asesor_nombre']); ?></span> 
                                            <small class="text-muted">(<?php echo htmlspecialchars($cliente['asesor_email']); ?>)</small>
                                        <?php else: ?>
                                            <span class="text-muted">Sin asesor asignado</span>
                                        <?php endif; ?>
                                    </td>
                                </tr>
                            </table>
                        </div>
                    </div>
                    
                    <div class="col-lg-4">
                        <div class="p-3 bg-white rounded-3 border h-100 shadow-sm">
                            <h6 class="fw-bold text-secondary mb-3">
                                <i class="fas fa-tachometer-alt me-1"></i> Resumen de Expediente
                            </h6>
                            <div class="d-flex justify-content-between mb-2 pb-2 border-bottom">
                                <span><i class="fas fa-calendar-alt text-warning me-2"></i>Asesorías:</span>
                                <span class="badge bg-light text-dark border"><?php echo count($asesorias); ?></span>
                            </div>
                            <div class="d-flex justify-content-between mb-2 pb-2 border-bottom">
                                <span><i class="fas fa-gavel text-info me-2"></i>Trámites Legales:</span>
                                <span class="badge bg-light text-dark border"><?php echo count($procesos); ?></span>
                            </div>
                            <div class="d-flex justify-content-between mb-2 pb-2 border-bottom">
                                <span><i class="fas fa-file-contract text-success me-2"></i>Contratos:</span>
                                <span class="badge bg-light text-dark border"><?php echo count($contratos); ?></span>
                            </div>
                            <div class="d-flex justify-content-between mb-3 pb-2 border-bottom">
                                <span><i class="fas fa-comments text-primary me-2"></i>Interacciones:</span>
                                <span class="badge bg-light text-dark border"><?php echo count($interacciones); ?></span>
                            </div>
                            
                            <div class="d-grid gap-2">
                                <a href="<?php echo SITE_URL; ?>modules/asesorias/crear.php?cliente=<?php echo $cliente_id; ?>" class="btn btn-c58-teal btn-sm">
                                    <i class="fas fa-calendar-plus"></i> Nueva Asesoría
                                </a>
                                <a href="<?php echo SITE_URL; ?>modules/legales/crear.php?cliente=<?php echo $cliente_id; ?>" class="btn btn-c58-amber btn-sm">
                                    <i class="fas fa-gavel"></i> Nuevo Trámite Legal
                                </a>
                                <a href="<?php echo SITE_URL; ?>modules/contratos/crear.php?cliente=<?php echo $cliente_id; ?>" class="btn btn-c58-navy btn-sm">
                                    <i class="fas fa-file-signature"></i> Nuevo Contrato
                                </a>
                                <a href="interaccion.php?id=<?php echo $cliente_id; ?>" class="btn btn-outline-secondary btn-sm">
                                    <i class="fas fa-comment-alt"></i> Registrar Nota / Interacción
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- Pestañas Operativas -->
                <ul class="nav nav-tabs" id="clientTabs" role="tablist">
                    <li class="nav-item">
                        <a class="nav-link active fw-semibold" id="asesorias-tab" data-bs-toggle="tab" href="#asesorias">
                            <i class="fas fa-calendar-alt me-1 text-warning"></i> Asesorías (<?php echo count($asesorias); ?>)
                        </a>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link fw-semibold" id="legales-tab" data-bs-toggle="tab" href="#legales">
                            <i class="fas fa-gavel me-1 text-info"></i> Procesos Legales (<?php echo count($procesos); ?>)
                        </a>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link fw-semibold" id="contratos-tab" data-bs-toggle="tab" href="#contratos">
                            <i class="fas fa-file-contract me-1 text-success"></i> Contratos (<?php echo count($contratos); ?>)
                        </a>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link fw-semibold" id="interacciones-tab" data-bs-toggle="tab" href="#interacciones">
                            <i class="fas fa-comments me-1 text-primary"></i> Bitácora de Interacciones (<?php echo count($interacciones); ?>)
                        </a>
                    </li>
                </ul>
                
                <div class="tab-content mt-3">
                    <!-- Tab Asesorías -->
                    <div class="tab-pane fade show active" id="asesorias">
                        <div class="table-responsive">
                            <table class="table table-hover align-middle">
                                <thead class="table-light">
                                    <tr>
                                        <th># ID</th>
                                        <th>Modalidad</th>
                                        <th>Consultor</th>
                                        <th>Fecha Programada</th>
                                        <th>Estado</th>
                                        <th class="text-end">Acción</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <?php if (empty($asesorias)): ?>
                                    <tr><td colspan="6" class="text-center text-muted py-3">No hay asesorías registradas</td></tr>
                                    <?php else: ?>
                                    <?php foreach ($asesorias as $as): ?>
                                    <tr>
                                        <td>#<?php echo $as['id']; ?></td>
                                        <td><span class="badge badge-c58-teal"><?php echo ucfirst($as['tipo']); ?></span></td>
                                        <td><?php echo htmlspecialchars($as['consultor_nombre'] ?: 'N/A'); ?></td>
                                        <td><?php echo date('d/m/Y H:i', strtotime($as['fecha_programada'])); ?></td>
                                        <td>
                                            <span class="badge <?php echo $as['status'] == 'realizada' ? 'bg-success' : 'bg-warning text-dark'; ?>">
                                                <?php echo ucfirst($as['status']); ?>
                                            </span>
                                        </td>
                                        <td class="text-end">
                                            <a href="<?php echo SITE_URL; ?>modules/asesorias/ver.php?id=<?php echo $as['id']; ?>" class="btn btn-sm btn-outline-info">
                                                <i class="fas fa-eye"></i> Ver
                                            </a>
                                        </td>
                                    </tr>
                                    <?php endforeach; ?>
                                    <?php endif; ?>
                                </tbody>
                            </table>
                        </div>
                    </div>
                    
                    <!-- Tab Procesos Legales -->
                    <div class="tab-pane fade" id="legales">
                        <div class="table-responsive">
                            <table class="table table-hover align-middle">
                                <thead class="table-light">
                                    <tr>
                                        <th># ID</th>
                                        <th>Tipo de Trámite</th>
                                        <th>Denominación Comercial</th>
                                        <th>Gestor Legal</th>
                                        <th>Estado</th>
                                        <th>Documentos</th>
                                        <th class="text-end">Acción</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <?php if (empty($procesos)): ?>
                                    <tr><td colspan="7" class="text-center text-muted py-3">No hay trámites legales registrados</td></tr>
                                    <?php else: ?>
                                    <?php foreach ($procesos as $pr): ?>
                                    <tr>
                                        <td>#<?php echo $pr['id']; ?></td>
                                        <td><span class="badge badge-c58-navy"><?php echo htmlspecialchars($pr['tipo_proceso']); ?></span></td>
                                        <td><?php echo htmlspecialchars($pr['nombre_comercial'] ?: 'Sin asignar'); ?></td>
                                        <td><?php echo htmlspecialchars($pr['gestor_nombre'] ?: 'N/A'); ?></td>
                                        <td>
                                            <span class="badge <?php echo $pr['status'] == 'completado' ? 'bg-success' : 'bg-info'; ?>">
                                                <?php echo ucfirst(str_replace('_', ' ', $pr['status'])); ?>
                                            </span>
                                        </td>
                                        <td><?php echo $pr['total_documentos']; ?> archivos</td>
                                        <td class="text-end">
                                            <a href="<?php echo SITE_URL; ?>modules/legales/ver.php?id=<?php echo $pr['id']; ?>" class="btn btn-sm btn-outline-info">
                                                <i class="fas fa-eye"></i> Ver
                                            </a>
                                        </td>
                                    </tr>
                                    <?php endforeach; ?>
                                    <?php endif; ?>
                                </tbody>
                            </table>
                        </div>
                    </div>
                    
                    <!-- Tab Contratos -->
                    <div class="tab-pane fade" id="contratos">
                        <div class="table-responsive">
                            <table class="table table-hover align-middle">
                                <thead class="table-light">
                                    <tr>
                                        <th>Nº Contrato</th>
                                        <th>Monto Total</th>
                                        <th>Saldo Pendiente</th>
                                        <th>Estado de Pago</th>
                                        <th>Estado Contrato</th>
                                        <th class="text-end">Acción</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <?php if (empty($contratos)): ?>
                                    <tr><td colspan="6" class="text-center text-muted py-3">No hay contratos registrados</td></tr>
                                    <?php else: ?>
                                    <?php foreach ($contratos as $ct): ?>
                                    <tr>
                                        <td><strong class="text-primary"><?php echo htmlspecialchars($ct['numero_contrato']); ?></strong></td>
                                        <td>$<?php echo number_format($ct['monto_total'], 2); ?></td>
                                        <td>
                                            <span class="<?php echo $ct['saldo_pendiente'] > 0 ? 'text-danger fw-bold' : 'text-success'; ?>">
                                                $<?php echo number_format($ct['saldo_pendiente'], 2); ?>
                                            </span>
                                        </td>
                                        <td><?php echo renderBadgeEstadoPago($ct['estado_pago']); ?></td>
                                        <td><?php echo renderBadgeEstadoContrato($ct['estado_contrato']); ?></td>
                                        <td class="text-end">
                                            <a href="<?php echo SITE_URL; ?>modules/contratos/ver.php?id=<?php echo $ct['id']; ?>" class="btn btn-sm btn-outline-info">
                                                <i class="fas fa-eye"></i> Ver
                                            </a>
                                        </td>
                                    </tr>
                                    <?php endforeach; ?>
                                    <?php endif; ?>
                                </tbody>
                            </table>
                        </div>
                    </div>
                    
                    <!-- Tab Interacciones -->
                    <div class="tab-pane fade" id="interacciones">
                        <div class="table-responsive">
                            <table class="table table-hover align-middle">
                                <thead class="table-light">
                                    <tr>
                                        <th>Fecha/Hora</th>
                                        <th>Registrado Por</th>
                                        <th>Tipo</th>
                                        <th>Canal</th>
                                        <th>Descripción</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <?php if (empty($interacciones)): ?>
                                    <tr><td colspan="5" class="text-center text-muted py-3">No hay notas o interacciones registradas</td></tr>
                                    <?php else: ?>
                                    <?php foreach ($interacciones as $it): ?>
                                    <tr>
                                        <td><small><?php echo date('d/m/Y H:i', strtotime($it['fecha_hora'])); ?></small></td>
                                        <td><?php echo htmlspecialchars($it['usuario_nombre'] ?: 'Sistema'); ?></td>
                                        <td><span class="badge badge-c58-teal"><?php echo htmlspecialchars($it['tipo']); ?></span></td>
                                        <td><?php echo htmlspecialchars($it['canal'] ?: 'Presencial'); ?></td>
                                        <td><?php echo htmlspecialchars($it['descripcion']); ?></td>
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
</div>

<?php include '../../includes/footer.php'; ?>