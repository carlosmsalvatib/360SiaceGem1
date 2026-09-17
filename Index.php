<?php
require_once 'config/config.php';
require_once 'config/database.php';

if (!isLoggedIn()) {
    redirect('login.php');
}

$db = Database::getInstance();

// Estadísticas generales del sistema Código-58
$stats = [];

// Total de Emprendedores
$result = $db->query("SELECT COUNT(*) as total FROM clientes");
$stats['total_emprendedores'] = $result ? $result->fetch_assoc()['total'] : 0;

// Emprendedores activos
$result = $db->query("SELECT COUNT(*) as total FROM clientes WHERE status IN ('activo', 'en_consulta', 'en_legalizacion')");
$stats['emprendedores_activos'] = $result ? $result->fetch_assoc()['total'] : 0;

// Asesorías realizadas (últimos 30 días)
$result = $db->query("SELECT COUNT(*) as total FROM asesorias WHERE status = 'realizada' AND fecha_realizada >= DATE_SUB(NOW(), INTERVAL 30 DAY)");
$stats['asesorias_mes'] = $result ? $result->fetch_assoc()['total'] : 0;

// Contratos activos pendientes de cobro
$result = $db->query("SELECT COUNT(*) as total FROM contratos WHERE estado_contrato = 'activo' AND saldo_pendiente > 0");
$stats['contratos_pendientes'] = $result ? $result->fetch_assoc()['total'] : 0;

// Procesos legales en curso
$result = $db->query("SELECT COUNT(*) as total FROM procesos_legales WHERE status IN ('pendiente', 'en_proceso')");
$stats['procesos_legales'] = $result ? $result->fetch_assoc()['total'] : 0;

// Total en directorio de servicios
$result = $db->query("SELECT COUNT(*) as total FROM catalogo_servicios WHERE activo = 1");
$stats['total_servicios'] = $result ? $result->fetch_assoc()['total'] : 0;

// Dashboard según rol de usuario
$dashboards = [
    'direccion'    => 'modules/dashboard/direccion.php',
    'consultor'    => 'modules/dashboard/consultor.php',
    'gestor_legal' => 'modules/dashboard/legal.php',
    'comercial'    => 'modules/dashboard/comercial.php'
];

$dashboard_file = isset($dashboards[$_SESSION['rol']]) ? $dashboards[$_SESSION['rol']] : 'modules/dashboard/default.php';

include 'includes/header.php';
?>

<!-- Banner de Bienvenida Oficial -->
<div class="row mb-4">
    <div class="col-12">
        <div class="card bg-c58-navy text-white p-4 shadow-sm">
            <div class="d-flex flex-column flex-md-row justify-content-between align-items-md-center">
                <div>
                    <h3 class="fw-bold mb-1">
                        <i class="fas fa-cubes text-warning me-2"></i>Bienvenido a Código-58
                    </h3>
                    <p class="mb-0 text-light opacity-75">
                        Plataforma de consultoría integral, formalización y aceleración para emprendedores.
                    </p>
                </div>
                <div class="mt-3 mt-md-0 d-flex gap-2">
                    <a href="<?php echo SITE_URL; ?>modules/directorio/" class="btn btn-warning">
                        <i class="fas fa-search"></i> Explorar Directorio
                    </a>
                    <a href="<?php echo SITE_URL; ?>modules/clientes/crear.php" class="btn btn-c58-teal">
                        <i class="fas fa-plus-circle"></i> Nuevo Emprendedor
                    </a>
                </div>
            </div>
        </div>
    </div>
</div>

<!-- Tarjetas de Estadísticas Principales -->
<div class="row g-3 mb-4">
    <div class="col-6 col-md-4 col-xl-2">
        <div class="card stats-card navy h-100">
            <div class="d-flex align-items-center">
                <div class="card-icon bg-primary bg-opacity-10 text-primary me-3">
                    <i class="fas fa-user-tie"></i>
                </div>
                <div>
                    <span class="text-muted small d-block">Emprendedores</span>
                    <span class="stat-value"><?php echo $stats['total_emprendedores']; ?></span>
                </div>
            </div>
        </div>
    </div>
    
    <div class="col-6 col-md-4 col-xl-2">
        <div class="card stats-card teal h-100">
            <div class="d-flex align-items-center">
                <div class="card-icon bg-success bg-opacity-10 text-success me-3">
                    <i class="fas fa-user-check"></i>
                </div>
                <div>
                    <span class="text-muted small d-block">Activos</span>
                    <span class="stat-value text-success"><?php echo $stats['emprendedores_activos']; ?></span>
                </div>
            </div>
        </div>
    </div>
    
    <div class="col-6 col-md-4 col-xl-2">
        <div class="card stats-card amber h-100">
            <div class="d-flex align-items-center">
                <div class="card-icon bg-warning bg-opacity-10 text-warning me-3">
                    <i class="fas fa-calendar-check"></i>
                </div>
                <div>
                    <span class="text-muted small d-block">Asesorías (Mes)</span>
                    <span class="stat-value text-warning"><?php echo $stats['asesorias_mes']; ?></span>
                </div>
            </div>
        </div>
    </div>
    
    <div class="col-6 col-md-4 col-xl-2">
        <div class="card stats-card danger h-100">
            <div class="d-flex align-items-center">
                <div class="card-icon bg-danger bg-opacity-10 text-danger me-3">
                    <i class="fas fa-file-invoice-dollar"></i>
                </div>
                <div>
                    <span class="text-muted small d-block">Cobros Pend.</span>
                    <span class="stat-value text-danger"><?php echo $stats['contratos_pendientes']; ?></span>
                </div>
            </div>
        </div>
    </div>
    
    <div class="col-6 col-md-4 col-xl-2">
        <div class="card stats-card violet h-100">
            <div class="d-flex align-items-center">
                <div class="card-icon bg-info bg-opacity-10 text-info me-3">
                    <i class="fas fa-gavel"></i>
                </div>
                <div>
                    <span class="text-muted small d-block">Trámites Legales</span>
                    <span class="stat-value" style="color: var(--c58-violet);"><?php echo $stats['procesos_legales']; ?></span>
                </div>
            </div>
        </div>
    </div>
    
    <div class="col-6 col-md-4 col-xl-2">
        <div class="card stats-card h-100" style="border-left-color: #0284C7;">
            <div class="d-flex align-items-center">
                <div class="card-icon bg-secondary bg-opacity-10 text-secondary me-3">
                    <i class="fas fa-concierge-bell"></i>
                </div>
                <div>
                    <span class="text-muted small d-block">Servicios Catálogo</span>
                    <span class="stat-value" style="color: #0284C7;"><?php echo $stats['total_servicios']; ?></span>
                </div>
            </div>
        </div>
    </div>
</div>

<!-- Dashboard Específico según Rol -->
<?php
if (file_exists($dashboard_file)) {
    include $dashboard_file;
} else {
    include 'modules/dashboard/default.php';
}
?>

<?php include 'includes/footer.php'; ?>