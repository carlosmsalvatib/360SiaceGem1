<?php
$db = Database::getInstance();
$usuario_id = intval($_SESSION['usuario_id']);

// Asesorías del consultor
$query = "
    SELECT COUNT(*) as total 
    FROM asesorias 
    WHERE consultor_id = $usuario_id AND status = 'programada'
";
$result = $db->query($query);
$mis_asesorias = $result ? $result->fetch_assoc()['total'] : 0;

// Asesorías realizadas
$query = "
    SELECT COUNT(*) as total 
    FROM asesorias 
    WHERE consultor_id = $usuario_id AND status = 'realizada'
";
$result = $db->query($query);
$mis_realizadas = $result ? $result->fetch_assoc()['total'] : 0;

// Emprendedores atendidos por el consultor
$query = "
    SELECT COUNT(DISTINCT cliente_id) as total 
    FROM asesorias 
    WHERE consultor_id = $usuario_id
";
$result = $db->query($query);
$mis_emprendedores = $result ? $result->fetch_assoc()['total'] : 0;

// Próximas sesiones del consultor
$sesiones = [];
$res = $db->query("
    SELECT a.*, c.nombre_completo as emprendedor_nombre, c.nombre_empresa, c.telefono
    FROM asesorias a
    JOIN clientes c ON a.cliente_id = c.id
    WHERE a.consultor_id = $usuario_id AND a.status = 'programada'
    ORDER BY a.fecha_programada ASC LIMIT 5
");
if ($res) {
    while ($r = $res->fetch_assoc()) $sesiones[] = $r;
}
?>

<div class="row g-4 mb-4">
    <div class="col-md-4">
        <div class="card h-100 border-0 shadow-sm" style="border-top: 4px solid var(--c58-teal) !important;">
            <div class="card-body text-center p-4">
                <div class="card-icon bg-success bg-opacity-10 text-success mx-auto mb-3">
                    <i class="fas fa-calendar-alt"></i>
                </div>
                <h5 class="card-title fw-bold text-secondary">Mis Asesorías Programadas</h5>
                <h2 class="display-6 fw-bold" style="color: var(--c58-teal);"><?php echo $mis_asesorias; ?></h2>
                <span class="text-muted small">Pendientes de atención</span>
                <div class="mt-3">
                    <a href="<?php echo SITE_URL; ?>modules/asesorias/crear.php" class="btn btn-sm btn-c58-teal">
                        <i class="fas fa-plus"></i> Nueva Asesoría
                    </a>
                </div>
            </div>
        </div>
    </div>
    
    <div class="col-md-4">
        <div class="card h-100 border-0 shadow-sm" style="border-top: 4px solid var(--c58-navy) !important;">
            <div class="card-body text-center p-4">
                <div class="card-icon bg-primary bg-opacity-10 text-primary mx-auto mb-3">
                    <i class="fas fa-user-check"></i>
                </div>
                <h5 class="card-title fw-bold text-secondary">Emprendedores Atendidos</h5>
                <h2 class="display-6 fw-bold" style="color: var(--c58-navy);"><?php echo $mis_emprendedores; ?></h2>
                <span class="text-muted small">Bajo tu acompañamiento</span>
                <div class="mt-3">
                    <a href="<?php echo SITE_URL; ?>modules/directorio/" class="btn btn-sm btn-c58-navy">
                        <i class="fas fa-search"></i> Ver Directorio
                    </a>
                </div>
            </div>
        </div>
    </div>
    
    <div class="col-md-4">
        <div class="card h-100 border-0 shadow-sm" style="border-top: 4px solid var(--c58-amber) !important;">
            <div class="card-body text-center p-4">
                <div class="card-icon bg-warning bg-opacity-10 text-warning mx-auto mb-3">
                    <i class="fas fa-check-double"></i>
                </div>
                <h5 class="card-title fw-bold text-secondary">Sesiones Realizadas</h5>
                <h2 class="display-6 fw-bold" style="color: var(--c58-amber);"><?php echo $mis_realizadas; ?></h2>
                <span class="text-muted small">Completadas con éxito</span>
                <div class="mt-3">
                    <a href="<?php echo SITE_URL; ?>modules/asesorias/calendario.php" class="btn btn-sm btn-c58-amber">
                        <i class="fas fa-calendar"></i> Calendario
                    </a>
                </div>
            </div>
        </div>
    </div>
</div>

<div class="row">
    <div class="col-12">
        <div class="card shadow-sm">
            <div class="card-header bg-white d-flex justify-content-between align-items-center">
                <h6 class="mb-0 fw-bold">
                    <i class="fas fa-clock text-primary me-2"></i> Mi Agenda de Consultoría Próxima
                </h6>
                <a href="<?php echo SITE_URL; ?>modules/asesorias/" class="btn btn-sm btn-outline-secondary">Ver Todas</a>
            </div>
            <div class="card-body p-0">
                <div class="table-responsive">
                    <table class="table table-hover mb-0">
                        <thead class="table-light">
                            <tr>
                                <th>Fecha & Hora</th>
                                <th>Emprendedor</th>
                                <th>Empresa</th>
                                <th>Tipo</th>
                                <th>Contacto</th>
                                <th>Acción</th>
                            </tr>
                        </thead>
                        <tbody>
                            <?php if (empty($sesiones)): ?>
                            <tr><td colspan="6" class="text-center text-muted py-4">No tienes asesorías pendientes agendadas</td></tr>
                            <?php else: ?>
                            <?php foreach ($sesiones as $s): ?>
                            <tr>
                                <td><strong><?php echo date('d/m/Y H:i', strtotime($s['fecha_programada'])); ?></strong></td>
                                <td><?php echo htmlspecialchars($s['emprendedor_nombre']); ?></td>
                                <td><?php echo htmlspecialchars($s['nombre_empresa'] ?? 'N/A'); ?></td>
                                <td><span class="badge badge-c58-teal"><?php echo ucfirst($s['tipo']); ?></span></td>
                                <td><i class="fas fa-phone me-1 text-muted"></i><?php echo htmlspecialchars($s['telefono'] ?? 'Sin tel.'); ?></td>
                                <td>
                                    <a href="<?php echo SITE_URL; ?>modules/asesorias/ver.php?id=<?php echo $s['id']; ?>" class="btn btn-sm btn-c58-teal">
                                        <i class="fas fa-eye"></i> Atender
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
</div>
