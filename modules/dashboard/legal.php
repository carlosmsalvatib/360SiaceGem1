<?php
$db = Database::getInstance();
$usuario_id = intval($_SESSION['usuario_id']);

// Procesos del gestor
$query = "
    SELECT COUNT(*) as total 
    FROM procesos_legales 
    WHERE gestor_id = $usuario_id AND status IN ('pendiente', 'en_proceso')
";
$result = $db->query($query);
$mis_procesos = $result ? $result->fetch_assoc()['total'] : 0;

// Documentos pendientes
$query = "
    SELECT COUNT(*) as total 
    FROM documentos_legales d
    JOIN procesos_legales p ON d.proceso_legal_id = p.id
    WHERE p.gestor_id = $usuario_id AND d.status = 'pendiente_revision'
";
$result = $db->query($query);
$documentos_pendientes = $result ? $result->fetch_assoc()['total'] : 0;

// Trámites completados
$query = "
    SELECT COUNT(*) as total 
    FROM procesos_legales 
    WHERE gestor_id = $usuario_id AND status = 'completado'
";
$result = $db->query($query);
$mis_completados = $result ? $result->fetch_assoc()['total'] : 0;
?>

<div class="row g-4 mb-4">
    <div class="col-md-4">
        <div class="card h-100 border-0 shadow-sm" style="border-top: 4px solid var(--c58-amber) !important;">
            <div class="card-body text-center p-4">
                <div class="card-icon bg-warning bg-opacity-10 text-warning mx-auto mb-3">
                    <i class="fas fa-gavel"></i>
                </div>
                <h5 class="card-title fw-bold text-secondary">Mis Trámites en Curso</h5>
                <h2 class="display-6 fw-bold" style="color: var(--c58-amber);"><?php echo $mis_procesos; ?></h2>
                <span class="text-muted small">Expedientes activos</span>
                <div class="mt-3">
                    <a href="<?php echo SITE_URL; ?>modules/legales/crear.php" class="btn btn-sm btn-c58-amber">
                        <i class="fas fa-plus"></i> Iniciar Trámite
                    </a>
                </div>
            </div>
        </div>
    </div>
    
    <div class="col-md-4">
        <div class="card h-100 border-0 shadow-sm" style="border-top: 4px solid var(--c58-navy) !important;">
            <div class="card-body text-center p-4">
                <div class="card-icon bg-info bg-opacity-10 text-info mx-auto mb-3">
                    <i class="fas fa-file-alt"></i>
                </div>
                <h5 class="card-title fw-bold text-secondary">Documentos por Revisar</h5>
                <h2 class="display-6 fw-bold" style="color: var(--c58-navy);"><?php echo $documentos_pendientes; ?></h2>
                <span class="text-muted small">Esperando aprobación</span>
                <div class="mt-3">
                    <a href="<?php echo SITE_URL; ?>modules/legales/" class="btn btn-sm btn-c58-navy">
                        <i class="fas fa-search"></i> Revisar Expedientes
                    </a>
                </div>
            </div>
        </div>
    </div>

    <div class="col-md-4">
        <div class="card h-100 border-0 shadow-sm" style="border-top: 4px solid var(--c58-teal) !important;">
            <div class="card-body text-center p-4">
                <div class="card-icon bg-success bg-opacity-10 text-success mx-auto mb-3">
                    <i class="fas fa-certificate"></i>
                </div>
                <h5 class="card-title fw-bold text-secondary">Trámites Formalizados</h5>
                <h2 class="display-6 fw-bold" style="color: var(--c58-teal);"><?php echo $mis_completados; ?></h2>
                <span class="text-muted small">Completados con éxito</span>
                <div class="mt-3">
                    <a href="<?php echo SITE_URL; ?>modules/directorio/" class="btn btn-sm btn-c58-teal">
                        <i class="fas fa-address-book"></i> Ver Directorio
                    </a>
                </div>
            </div>
        </div>
    </div>
</div>