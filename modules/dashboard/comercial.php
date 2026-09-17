<?php
$db = Database::getInstance();
$usuario_id = intval($_SESSION['usuario_id']);

// Contratos del comercial
$query = "
    SELECT COUNT(*) as total 
    FROM contratos 
    WHERE comercial_id = $usuario_id AND estado_contrato = 'activo'
";
$result = $db->query($query);
$mis_contratos = $result ? $result->fetch_assoc()['total'] : 0;

// Emprendedores prospectos
$query = "
    SELECT COUNT(*) as total 
    FROM clientes 
    WHERE usuario_id_creacion = $usuario_id AND status = 'prospecto'
";
$result = $db->query($query);
$mis_prospectos = $result ? $result->fetch_assoc()['total'] : 0;

// Emprendedores activos del comercial
$query = "
    SELECT COUNT(*) as total 
    FROM clientes 
    WHERE usuario_id_creacion = $usuario_id AND status = 'activo'
";
$result = $db->query($query);
$mis_activos = $result ? $result->fetch_assoc()['total'] : 0;
?>

<div class="row g-4 mb-4">
    <div class="col-md-4">
        <div class="card h-100 border-0 shadow-sm" style="border-top: 4px solid var(--c58-teal) !important;">
            <div class="card-body text-center p-4">
                <div class="card-icon bg-success bg-opacity-10 text-success mx-auto mb-3">
                    <i class="fas fa-file-contract"></i>
                </div>
                <h5 class="card-title fw-bold text-secondary">Mis Contratos Activos</h5>
                <h2 class="display-6 fw-bold" style="color: var(--c58-teal);"><?php echo $mis_contratos; ?></h2>
                <span class="text-muted small">En ejecución comercial</span>
                <div class="mt-3">
                    <a href="<?php echo SITE_URL; ?>modules/contratos/crear.php" class="btn btn-sm btn-c58-teal">
                        <i class="fas fa-plus"></i> Nuevo Contrato
                    </a>
                </div>
            </div>
        </div>
    </div>
    
    <div class="col-md-4">
        <div class="card h-100 border-0 shadow-sm" style="border-top: 4px solid var(--c58-amber) !important;">
            <div class="card-body text-center p-4">
                <div class="card-icon bg-warning bg-opacity-10 text-warning mx-auto mb-3">
                    <i class="fas fa-user-clock"></i>
                </div>
                <h5 class="card-title fw-bold text-secondary">Prospectos por Convertir</h5>
                <h2 class="display-6 fw-bold" style="color: var(--c58-amber);"><?php echo $mis_prospectos; ?></h2>
                <span class="text-muted small">Oportunidades de cierre</span>
                <div class="mt-3">
                    <a href="<?php echo SITE_URL; ?>modules/clientes/crear.php" class="btn btn-sm btn-c58-amber">
                        <i class="fas fa-user-plus"></i> Registrar Prospecto
                    </a>
                </div>
            </div>
        </div>
    </div>

    <div class="col-md-4">
        <div class="card h-100 border-0 shadow-sm" style="border-top: 4px solid var(--c58-navy) !important;">
            <div class="card-body text-center p-4">
                <div class="card-icon bg-primary bg-opacity-10 text-primary mx-auto mb-3">
                    <i class="fas fa-handshake"></i>
                </div>
                <h5 class="card-title fw-bold text-secondary">Emprendedores Activos</h5>
                <h2 class="display-6 fw-bold" style="color: var(--c58-navy);"><?php echo $mis_activos; ?></h2>
                <span class="text-muted small">Cartera convertida</span>
                <div class="mt-3">
                    <a href="<?php echo SITE_URL; ?>modules/directorio/" class="btn btn-sm btn-c58-navy">
                        <i class="fas fa-search"></i> Explorar Cartera
                    </a>
                </div>
            </div>
        </div>
    </div>
</div>