<?php
$db = Database::getInstance();

// Datos específicos para dirección
$query = "SELECT COUNT(*) as total FROM contratos WHERE estado_contrato = 'activo' AND saldo_pendiente > 0";
$result = $db->query($query);
$contratos_activos = $result ? $result->fetch_assoc()['total'] : 0;

$query = "SELECT COUNT(*) as total FROM procesos_legales WHERE status IN ('pendiente', 'en_proceso')";
$result = $db->query($query);
$procesos_pendientes = $result ? $result->fetch_assoc()['total'] : 0;

$query = "SELECT COUNT(*) as total FROM asesorias WHERE status = 'programada' AND fecha_programada <= DATE_ADD(NOW(), INTERVAL 7 DAY)";
$result = $db->query($query);
$proximas_asesorias = $result ? $result->fetch_assoc()['total'] : 0;

// Últimos emprendedores registrados
$ultimos_emprendedores = [];
$resEmp = $db->query("SELECT id, nombre_completo, nombre_empresa, status, fecha_registro FROM clientes ORDER BY fecha_registro DESC LIMIT 5");
if ($resEmp) {
    while ($r = $resEmp->fetch_assoc()) $ultimos_emprendedores[] = $r;
}

// Próximas asesorías
$proximas_lista = [];
$resAse = $db->query("
    SELECT a.id, a.fecha_programada, a.tipo, c.nombre_completo as emprendedor, u.nombre as consultor
    FROM asesorias a
    JOIN clientes c ON a.cliente_id = c.id
    JOIN usuarios u ON a.consultor_id = u.id
    WHERE a.status = 'programada'
    ORDER BY a.fecha_programada ASC LIMIT 5
");
if ($resAse) {
    while ($r = $resAse->fetch_assoc()) $proximas_lista[] = $r;
}
?>

<div class="row g-4 mb-4">
    <div class="col-md-4">
        <div class="card h-100 border-0 shadow-sm" style="border-top: 4px solid var(--c58-navy) !important;">
            <div class="card-body text-center p-4">
                <div class="card-icon bg-primary bg-opacity-10 text-primary mx-auto mb-3">
                    <i class="fas fa-file-contract"></i>
                </div>
                <h5 class="card-title fw-bold text-secondary">Contratos con Saldo</h5>
                <h2 class="display-6 fw-bold" style="color: var(--c58-navy);"><?php echo $contratos_activos; ?></h2>
                <span class="text-muted small">Pendientes por recaudación</span>
                <div class="mt-3">
                    <a href="<?php echo SITE_URL; ?>modules/contratos/pagos.php" class="btn btn-sm btn-c58-navy">
                        <i class="fas fa-money-bill-wave"></i> Gestionar Pagos
                    </a>
                </div>
            </div>
        </div>
    </div>
    
    <div class="col-md-4">
        <div class="card h-100 border-0 shadow-sm" style="border-top: 4px solid var(--c58-amber) !important;">
            <div class="card-body text-center p-4">
                <div class="card-icon bg-warning bg-opacity-10 text-warning mx-auto mb-3">
                    <i class="fas fa-gavel"></i>
                </div>
                <h5 class="card-title fw-bold text-secondary">Procesos Legales Activos</h5>
                <h2 class="display-6 fw-bold" style="color: var(--c58-amber);"><?php echo $procesos_pendientes; ?></h2>
                <span class="text-muted small">Trámites y registros en curso</span>
                <div class="mt-3">
                    <a href="<?php echo SITE_URL; ?>modules/legales/" class="btn btn-sm btn-c58-amber">
                        <i class="fas fa-search"></i> Ver Trámites
                    </a>
                </div>
            </div>
        </div>
    </div>
    
    <div class="col-md-4">
        <div class="card h-100 border-0 shadow-sm" style="border-top: 4px solid var(--c58-teal) !important;">
            <div class="card-body text-center p-4">
                <div class="card-icon bg-success bg-opacity-10 text-success mx-auto mb-3">
                    <i class="fas fa-calendar-check"></i>
                </div>
                <h5 class="card-title fw-bold text-secondary">Asesorías Próximos 7 Días</h5>
                <h2 class="display-6 fw-bold" style="color: var(--c58-teal);"><?php echo $proximas_asesorias; ?></h2>
                <span class="text-muted small">Consultorías agendadas</span>
                <div class="mt-3">
                    <a href="<?php echo SITE_URL; ?>modules/asesorias/calendario.php" class="btn btn-sm btn-c58-teal">
                        <i class="fas fa-calendar-alt"></i> Ver Calendario
                    </a>
                </div>
            </div>
        </div>
    </div>
</div>

<div class="row g-4">
    <!-- Emprendedores Recientes -->
    <div class="col-lg-6">
        <div class="card h-100 shadow-sm">
            <div class="card-header d-flex justify-content-between align-items-center">
                <h6 class="mb-0 fw-bold">
                    <i class="fas fa-user-tie text-primary me-2"></i> Emprendedores Recientes
                </h6>
                <a href="<?php echo SITE_URL; ?>modules/clientes/" class="btn btn-sm btn-outline-secondary">Ver Todos</a>
            </div>
            <div class="card-body p-0">
                <div class="table-responsive">
                    <table class="table table-hover mb-0">
                        <thead class="table-light">
                            <tr>
                                <th>Emprendedor</th>
                                <th>Empresa</th>
                                <th>Estado</th>
                                <th>Acción</th>
                            </tr>
                        </thead>
                        <tbody>
                            <?php if (empty($ultimos_emprendedores)): ?>
                            <tr><td colspan="4" class="text-center text-muted py-3">No hay emprendedores registrados</td></tr>
                            <?php else: ?>
                            <?php foreach ($ultimos_emprendedores as $emp): ?>
                            <tr>
                                <td><strong><?php echo htmlspecialchars($emp['nombre_completo']); ?></strong></td>
                                <td><?php echo htmlspecialchars($emp['nombre_empresa'] ?? 'N/A'); ?></td>
                                <td><?php echo renderBadgeEstadoEmprendedor($emp['status']); ?></td>
                                <td>
                                    <a href="<?php echo SITE_URL; ?>modules/clientes/ver.php?id=<?php echo $emp['id']; ?>" class="btn btn-sm btn-light border" title="Ver ficha">
                                        <i class="fas fa-eye text-primary"></i>
                                    </a>
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

    <!-- Próximas Asesorías -->
    <div class="col-lg-6">
        <div class="card h-100 shadow-sm">
            <div class="card-header d-flex justify-content-between align-items-center">
                <h6 class="mb-0 fw-bold">
                    <i class="fas fa-calendar-alt text-warning me-2"></i> Próximas Asesorías Agendadas
                </h6>
                <a href="<?php echo SITE_URL; ?>modules/asesorias/" class="btn btn-sm btn-outline-secondary">Ver Todas</a>
            </div>
            <div class="card-body p-0">
                <div class="table-responsive">
                    <table class="table table-hover mb-0">
                        <thead class="table-light">
                            <tr>
                                <th>Fecha</th>
                                <th>Emprendedor</th>
                                <th>Consultor</th>
                                <th>Tipo</th>
                            </tr>
                        </thead>
                        <tbody>
                            <?php if (empty($proximas_lista)): ?>
                            <tr><td colspan="4" class="text-center text-muted py-3">No hay asesorías programadas</td></tr>
                            <?php else: ?>
                            <?php foreach ($proximas_lista as $ase): ?>
                            <tr>
                                <td><small class="fw-bold"><?php echo date('d/m/Y H:i', strtotime($ase['fecha_programada'])); ?></small></td>
                                <td><?php echo htmlspecialchars($ase['emprendedor']); ?></td>
                                <td><?php echo htmlspecialchars($ase['consultor']); ?></td>
                                <td><span class="badge bg-info"><?php echo ucfirst($ase['tipo']); ?></span></td>
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