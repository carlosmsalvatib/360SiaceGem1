<?php
require_once '../../config/config.php';
require_once '../../config/database.php';
require_once '../../includes/auth.php';
require_once '../../includes/functions.php';

requireLogin();

// Validar que el módulo esté activo y accesible según rol
if (!isModuloActivo('reportes')) {
    setFlash('warning', 'El módulo de Reportes & Estadísticas no está disponible para su perfil.');
    redirect('index.php');
}

$db = Database::getInstance();
$conn = $db->getConnection();

// Filtro de rango de fechas
$fecha_desde = $_GET['fecha_desde'] ?? date('Y-01-01');
$fecha_hasta = $_GET['fecha_hasta'] ?? date('Y-m-d');

// Validar formato de fecha seguro
if (!preg_match('/^\d{4}-\d{2}-\d{2}$/', $fecha_desde)) $fecha_desde = date('Y-01-01');
if (!preg_match('/^\d{4}-\d{2}-\d{2}$/', $fecha_hasta)) $fecha_hasta = date('Y-m-d');

$fecha_hasta_full = $fecha_hasta . ' 23:59:59';
$fecha_desde_full = $fecha_desde . ' 00:00:00';

// -------------------------------------------------------------
// 1. KPIs CONSOLIDADOS
// -------------------------------------------------------------
// Emprendedores
$qEmpTotal = $conn->query("SELECT COUNT(*) as total FROM clientes");
$total_emprendedores = $qEmpTotal ? $qEmpTotal->fetch_assoc()['total'] : 0;

$qEmpRango = $conn->prepare("SELECT COUNT(*) as total FROM clientes WHERE fecha_registro BETWEEN ? AND ?");
$qEmpRango->bind_param("ss", $fecha_desde_full, $fecha_hasta_full);
$qEmpRango->execute();
$emprendedores_rango = $qEmpRango->get_result()->fetch_assoc()['total'];

// Asesorías
$qAseTotal = $conn->query("SELECT COUNT(*) as total FROM asesorias");
$total_asesorias = $qAseTotal ? $qAseTotal->fetch_assoc()['total'] : 0;

$qAseRealizadas = $conn->prepare("SELECT COUNT(*) as total FROM asesorias WHERE status = 'realizada' AND fecha_programada BETWEEN ? AND ?");
$qAseRealizadas->bind_param("ss", $fecha_desde_full, $fecha_hasta_full);
$qAseRealizadas->execute();
$asesorias_realizadas = $qAseRealizadas->get_result()->fetch_assoc()['total'];

// Contratos & Finanzas
$qContratos = $conn->prepare("
    SELECT 
        COUNT(*) as total_contratos,
        COALESCE(SUM(monto_total), 0) as total_facturado,
        COALESCE(SUM(anticipo), 0) as total_anticipos,
        COALESCE(SUM(saldo_pendiente), 0) as total_saldos
    FROM contratos 
    WHERE fecha_firma BETWEEN ? AND ?
");
$qContratos->bind_param("ss", $fecha_desde, $fecha_hasta);
$qContratos->execute();
$finanzas = $qContratos->get_result()->fetch_assoc();

$total_facturado = floatval($finanzas['total_facturado']);
$total_anticipos = floatval($finanzas['total_anticipos']);
$total_saldos    = floatval($finanzas['total_saldos']);
$total_cobrado   = max(0, $total_facturado - $total_saldos);
$tasa_cobro      = $total_facturado > 0 ? round(($total_cobrado / $total_facturado) * 100, 1) : 0;

// Procesos Legales
$qLegales = $conn->prepare("
    SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status = 'completado' THEN 1 ELSE 0 END) as completados,
        SUM(CASE WHEN status IN ('pendiente', 'en_proceso') THEN 1 ELSE 0 END) as en_proceso
    FROM procesos_legales 
    WHERE fecha_inicio BETWEEN ? AND ?
");
$qLegales->bind_param("ss", $fecha_desde, $fecha_hasta);
$qLegales->execute();
$legales_stats = $qLegales->get_result()->fetch_assoc();
$total_legales = intval($legales_stats['total']);
$legales_completados = intval($legales_stats['completados']);
$legales_en_proceso = intval($legales_stats['en_proceso']);

// -------------------------------------------------------------
// 2. DATOS PARA GRÁFICOS (CHART.JS)
// -------------------------------------------------------------

// Gráfico 1: Emprendedores por Industria
$qIndustrias = $conn->query("
    SELECT COALESCE(NULLIF(industria, ''), 'Otros / No especificado') as sector, COUNT(*) as cantidad 
    FROM clientes 
    GROUP BY sector 
    ORDER BY cantidad DESC 
    LIMIT 6
");
$indLabels = [];
$indValues = [];
while ($row = $qIndustrias->fetch_assoc()) {
    $indLabels[] = $row['sector'];
    $indValues[] = intval($row['cantidad']);
}

// Gráfico 2: Asesorías por Mes (Últimos 6 meses)
$qMeses = $conn->query("
    SELECT 
        DATE_FORMAT(fecha_programada, '%Y-%m') as mes,
        SUM(CASE WHEN status = 'realizada' THEN 1 ELSE 0 END) as realizadas,
        SUM(CASE WHEN status = 'programada' THEN 1 ELSE 0 END) as programadas,
        SUM(CASE WHEN status = 'cancelada' THEN 1 ELSE 0 END) as canceladas
    FROM asesorias
    WHERE fecha_programada >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
    GROUP BY mes
    ORDER BY mes ASC
");
$mesLabels = [];
$mesRealizadas = [];
$mesProgramadas = [];
$mesCanceladas = [];
while ($row = $qMeses->fetch_assoc()) {
    $mesLabels[] = date('M Y', strtotime($row['mes'] . '-01'));
    $mesRealizadas[] = intval($row['realizadas']);
    $mesProgramadas[] = intval($row['programadas']);
    $mesCanceladas[] = intval($row['canceladas']);
}

// Gráfico 3: Procesos Legales por Estatus
$qLegalStatus = $conn->query("
    SELECT status, COUNT(*) as total 
    FROM procesos_legales 
    GROUP BY status
");
$legalLabels = [];
$legalValues = [];
$mapStatus = [
    'pendiente' => 'Pendiente',
    'en_proceso' => 'En Trámite',
    'completado' => 'Completado',
    'cancelado' => 'Cancelado'
];
while ($row = $qLegalStatus->fetch_assoc()) {
    $legalLabels[] = $mapStatus[$row['status']] ?? ucfirst($row['status']);
    $legalValues[] = intval($row['total']);
}

// -------------------------------------------------------------
// 3. TABLAS RESUMEN
// -------------------------------------------------------------

// Rendimiento por Consultor
$qConsultores = $conn->query("
    SELECT 
        u.nombre,
        COUNT(a.id) as total_sesiones,
        SUM(CASE WHEN a.status = 'realizada' THEN 1 ELSE 0 END) as realizadas,
        COUNT(DISTINCT a.cliente_id) as emprendedores_atendidos
    FROM usuarios u
    JOIN asesorias a ON u.id = a.consultor_id
    GROUP BY u.id, u.nombre
    ORDER BY realizadas DESC
    LIMIT 5
");

// Rendimiento por Gestor Legal
$qGestores = $conn->query("
    SELECT 
        u.nombre,
        COUNT(p.id) as total_tramites,
        SUM(CASE WHEN p.status = 'completado' THEN 1 ELSE 0 END) as completados,
        SUM(CASE WHEN p.status IN ('pendiente', 'en_proceso') THEN 1 ELSE 0 END) as en_curso
    FROM usuarios u
    JOIN procesos_legales p ON u.id = p.gestor_id
    GROUP BY u.id, u.nombre
    ORDER BY total_tramites DESC
    LIMIT 5
");

// Top Emprendedores con mayor vinculación
$qTopEmp = $conn->query("
    SELECT 
        c.id, c.nombre_completo, c.nombre_empresa, c.identificacion, c.status,
        COUNT(DISTINCT a.id) as num_asesorias,
        COUNT(DISTINCT p.id) as num_tramites,
        COUNT(DISTINCT ct.id) as num_contratos
    FROM clientes c
    LEFT JOIN asesorias a ON c.id = a.cliente_id
    LEFT JOIN procesos_legales p ON c.id = p.cliente_id
    LEFT JOIN contratos ct ON c.id = ct.cliente_id
    GROUP BY c.id
    ORDER BY (COUNT(DISTINCT a.id) + COUNT(DISTINCT p.id) + COUNT(DISTINCT ct.id)) DESC
    LIMIT 6
");

$pageTitle = "Reportes & Estadísticas - Código-58";
include '../../includes/header.php';
?>

<!-- Encabezado de Página -->
<div class="row align-items-center mb-4">
    <div class="col-md-7">
        <div class="d-flex align-items-center gap-3">
            <div class="rounded-3 p-3 text-white" style="background: linear-gradient(135deg, var(--c58-navy), var(--c58-teal));">
                <i class="fas fa-chart-line fs-3"></i>
            </div>
            <div>
                <h2 class="fw-bold mb-1" style="color: var(--c58-navy);">Reportes & Analíticas de Gestión</h2>
                <p class="text-muted mb-0">Monitoreo de rendimiento para emprendedores, asesorías, contratos y procesos legales</p>
            </div>
        </div>
    </div>
    <div class="col-md-5 text-md-end mt-3 mt-md-0 d-flex flex-wrap justify-content-md-end gap-2">
        <a href="exportar.php?fecha_desde=<?php echo urlencode($fecha_desde); ?>&fecha_hasta=<?php echo urlencode($fecha_hasta); ?>" class="btn btn-outline-success">
            <i class="fas fa-file-excel me-1"></i> Exportar Informe (CSV)
        </a>
        <button onclick="window.print()" class="btn btn-outline-secondary">
            <i class="fas fa-print me-1"></i> Imprimir Reporte
        </button>
    </div>
</div>

<!-- Barra de Filtro de Período -->
<div class="card border-0 shadow-sm mb-4" style="border-radius: 12px; border-left: 4px solid var(--c58-teal) !important;">
    <div class="card-body p-3">
        <form method="GET" class="row g-3 align-items-center">
            <div class="col-12 col-md-auto">
                <span class="fw-bold text-secondary">
                    <i class="fas fa-calendar-alt text-teal me-1"></i> Filtrar Período:
                </span>
            </div>
            <div class="col-12 col-sm-6 col-md-3">
                <div class="input-group input-group-sm">
                    <span class="input-group-text bg-light text-muted">Desde</span>
                    <input type="date" name="fecha_desde" class="form-control" value="<?php echo htmlspecialchars($fecha_desde); ?>" required>
                </div>
            </div>
            <div class="col-12 col-sm-6 col-md-3">
                <div class="input-group input-group-sm">
                    <span class="input-group-text bg-light text-muted">Hasta</span>
                    <input type="date" name="fecha_hasta" class="form-control" value="<?php echo htmlspecialchars($fecha_hasta); ?>" required>
                </div>
            </div>
            <div class="col-12 col-md-auto d-flex gap-2">
                <button type="submit" class="btn btn-sm text-white" style="background-color: var(--c58-teal);">
                    <i class="fas fa-filter me-1"></i> Aplicar Filtro
                </button>
                <a href="index.php" class="btn btn-sm btn-outline-secondary">
                    <i class="fas fa-undo me-1"></i> Restablecer
                </a>
            </div>
            <div class="col-12 col-md text-md-end text-muted small">
                <span>Rango activo: <strong><?php echo date('d/m/Y', strtotime($fecha_desde)); ?></strong> al <strong><?php echo date('d/m/Y', strtotime($fecha_hasta)); ?></strong></span>
            </div>
        </form>
    </div>
</div>

<!-- ========================================================= -->
<!-- TARJETAS DE INDICADORES CLAVE (KPIs)                       -->
<!-- ========================================================= -->
<div class="row g-3 mb-4">
    <!-- Emprendedores Registrados -->
    <div class="col-12 col-sm-6 col-xl-3">
        <div class="card border-0 shadow-sm h-100 p-3" style="border-radius: 12px; border-top: 4px solid var(--c58-navy) !important;">
            <div class="d-flex justify-content-between align-items-center">
                <div>
                    <span class="text-muted small text-uppercase fw-bold">Emprendedores</span>
                    <h3 class="fw-bold my-1" style="color: var(--c58-navy);"><?php echo $total_emprendedores; ?></h3>
                    <span class="text-success small fw-semibold">
                        <i class="fas fa-arrow-up me-1"></i> +<?php echo $emprendedores_rango; ?> en el período
                    </span>
                </div>
                <div class="rounded-circle p-3 text-white" style="background-color: var(--c58-navy);">
                    <i class="fas fa-user-tie fs-4"></i>
                </div>
            </div>
        </div>
    </div>

    <!-- Asesorías Realizadas -->
    <div class="col-12 col-sm-6 col-xl-3">
        <div class="card border-0 shadow-sm h-100 p-3" style="border-radius: 12px; border-top: 4px solid var(--c58-teal) !important;">
            <div class="d-flex justify-content-between align-items-center">
                <div>
                    <span class="text-muted small text-uppercase fw-bold">Asesorías Realizadas</span>
                    <h3 class="fw-bold my-1" style="color: var(--c58-teal);"><?php echo $asesorias_realizadas; ?></h3>
                    <span class="text-muted small">
                        De <?php echo $total_asesorias; ?> registradas históricas
                    </span>
                </div>
                <div class="rounded-circle p-3 text-white" style="background-color: var(--c58-teal);">
                    <i class="fas fa-calendar-check fs-4"></i>
                </div>
            </div>
        </div>
    </div>

    <!-- Facturación y Cobranza -->
    <div class="col-12 col-sm-6 col-xl-3">
        <div class="card border-0 shadow-sm h-100 p-3" style="border-radius: 12px; border-top: 4px solid var(--c58-amber) !important;">
            <div class="d-flex justify-content-between align-items-center">
                <div>
                    <span class="text-muted small text-uppercase fw-bold">Total Facturado</span>
                    <h3 class="fw-bold my-1 text-truncate" style="color: var(--c58-amber); max-width: 170px;">
                        <?php echo formatearMonto($total_facturado); ?>
                    </h3>
                    <span class="text-success small fw-semibold">
                        <i class="fas fa-check-circle me-1"></i> Recaudado: <?php echo $tasa_cobro; ?>%
                    </span>
                </div>
                <div class="rounded-circle p-3 text-white" style="background-color: var(--c58-amber);">
                    <i class="fas fa-file-invoice-dollar fs-4"></i>
                </div>
            </div>
        </div>
    </div>

    <!-- Trámites Legales -->
    <div class="col-12 col-sm-6 col-xl-3">
        <div class="card border-0 shadow-sm h-100 p-3" style="border-radius: 12px; border-top: 4px solid var(--c58-violet) !important;">
            <div class="d-flex justify-content-between align-items-center">
                <div>
                    <span class="text-muted small text-uppercase fw-bold">Trámites Legales</span>
                    <h3 class="fw-bold my-1" style="color: var(--c58-violet);"><?php echo $total_legales; ?></h3>
                    <span class="text-info small fw-semibold">
                        <i class="fas fa-hourglass-half me-1"></i> <?php echo $legales_en_proceso; ?> en curso &bull; <?php echo $legales_completados; ?> listos
                    </span>
                </div>
                <div class="rounded-circle p-3 text-white" style="background-color: var(--c58-violet);">
                    <i class="fas fa-gavel fs-4"></i>
                </div>
            </div>
        </div>
    </div>
</div>

<!-- ========================================================= -->
<!-- GRÁFICOS INTERACTIVOS (CHART.JS)                          -->
<!-- ========================================================= -->
<div class="row g-4 mb-4">
    <!-- Gráfico 1: Emprendedores por Industria -->
    <div class="col-lg-6">
        <div class="card border-0 shadow-sm h-100" style="border-radius: 12px;">
            <div class="card-header bg-white py-3 border-0 d-flex justify-content-between align-items-center">
                <h5 class="fw-bold mb-0" style="color: var(--c58-navy);">
                    <i class="fas fa-industry text-teal me-2"></i> Emprendedores por Sector / Industria
                </h5>
                <span class="badge bg-light text-muted border">General</span>
            </div>
            <div class="card-body d-flex align-items-center justify-content-center p-3">
                <div style="position: relative; height: 280px; width: 100%;">
                    <canvas id="chartIndustrias"></canvas>
                </div>
            </div>
        </div>
    </div>

    <!-- Gráfico 2: Asesorías por Mes -->
    <div class="col-lg-6">
        <div class="card border-0 shadow-sm h-100" style="border-radius: 12px;">
            <div class="card-header bg-white py-3 border-0 d-flex justify-content-between align-items-center">
                <h5 class="fw-bold mb-0" style="color: var(--c58-navy);">
                    <i class="fas fa-chart-bar text-amber me-2"></i> Evolución Mensual de Asesorías
                </h5>
                <span class="badge bg-light text-muted border">Últimos 6 meses</span>
            </div>
            <div class="card-body p-3">
                <div style="position: relative; height: 280px; width: 100%;">
                    <canvas id="chartAsesorias"></canvas>
                </div>
            </div>
        </div>
    </div>

    <!-- Gráfico 3: Desglose Financiero de Contratos -->
    <div class="col-lg-6">
        <div class="card border-0 shadow-sm h-100" style="border-radius: 12px;">
            <div class="card-header bg-white py-3 border-0 d-flex justify-content-between align-items-center">
                <h5 class="fw-bold mb-0" style="color: var(--c58-navy);">
                    <i class="fas fa-wallet text-success me-2"></i> Balance Comercial de Contratos
                </h5>
                <span class="badge bg-light text-muted border">Período seleccionado</span>
            </div>
            <div class="card-body p-3">
                <div style="position: relative; height: 280px; width: 100%;">
                    <canvas id="chartFinanzas"></canvas>
                </div>
            </div>
        </div>
    </div>

    <!-- Gráfico 4: Estado de Procesos Legales -->
    <div class="col-lg-6">
        <div class="card border-0 shadow-sm h-100" style="border-radius: 12px;">
            <div class="card-header bg-white py-3 border-0 d-flex justify-content-between align-items-center">
                <h5 class="fw-bold mb-0" style="color: var(--c58-navy);">
                    <i class="fas fa-balance-scale text-info me-2"></i> Distribución de Trámites Legales
                </h5>
                <span class="badge bg-light text-muted border">Estatus Actual</span>
            </div>
            <div class="card-body d-flex align-items-center justify-content-center p-3">
                <div style="position: relative; height: 280px; width: 100%;">
                    <canvas id="chartLegales"></canvas>
                </div>
            </div>
        </div>
    </div>
</div>

<!-- ========================================================= -->
<!-- TABLAS DETALLADAS DE RENDIMIENTO                          -->
<!-- ========================================================= -->
<div class="row g-4 mb-4">
    <!-- Rendimiento Consultores -->
    <div class="col-lg-6">
        <div class="card border-0 shadow-sm h-100" style="border-radius: 12px; overflow: hidden;">
            <div class="card-header bg-white py-3 border-0 d-flex justify-content-between align-items-center">
                <h5 class="fw-bold mb-0" style="color: var(--c58-navy);">
                    <i class="fas fa-user-check text-teal me-2"></i> Desempeño del Equipo de Consultores
                </h5>
            </div>
            <div class="table-responsive">
                <table class="table table-hover align-middle mb-0">
                    <thead style="background-color: var(--c58-navy); color: #ffffff;">
                        <tr>
                            <th>Consultor</th>
                            <th class="text-center">Total Sesiones</th>
                            <th class="text-center">Realizadas</th>
                            <th class="text-center">Emprendedores</th>
                        </tr>
                    </thead>
                    <tbody>
                        <?php if ($qConsultores && $qConsultores->num_rows > 0): ?>
                            <?php while ($c = $qConsultores->fetch_assoc()): ?>
                            <tr>
                                <td class="fw-semibold text-dark">
                                    <i class="fas fa-user-circle text-teal me-2"></i> <?php echo htmlspecialchars($c['nombre']); ?>
                                </td>
                                <td class="text-center fw-bold"><?php echo $c['total_sesiones']; ?></td>
                                <td class="text-center">
                                    <span class="badge bg-success-subtle text-success px-2 py-1">
                                        <?php echo $c['realizadas']; ?> realizadas
                                    </span>
                                </td>
                                <td class="text-center">
                                    <span class="badge bg-primary-subtle text-primary px-2 py-1">
                                        <?php echo $c['emprendedores_atendidos']; ?> atendidos
                                    </span>
                                </td>
                            </tr>
                            <?php endwhile; ?>
                        <?php else: ?>
                            <tr>
                                <td colspan="4" class="text-center py-3 text-muted">No hay sesiones de consultoría registradas</td>
                            </tr>
                        <?php endif; ?>
                    </tbody>
                </table>
            </div>
        </div>
    </div>

    <!-- Rendimiento Gestores Legales -->
    <div class="col-lg-6">
        <div class="card border-0 shadow-sm h-100" style="border-radius: 12px; overflow: hidden;">
            <div class="card-header bg-white py-3 border-0 d-flex justify-content-between align-items-center">
                <h5 class="fw-bold mb-0" style="color: var(--c58-navy);">
                    <i class="fas fa-gavel text-amber me-2"></i> Desempeño de Gestores Legales
                </h5>
            </div>
            <div class="table-responsive">
                <table class="table table-hover align-middle mb-0">
                    <thead style="background-color: var(--c58-navy); color: #ffffff;">
                        <tr>
                            <th>Gestor Jurídico</th>
                            <th class="text-center">Trámites Totales</th>
                            <th class="text-center">En Curso</th>
                            <th class="text-center">Completados</th>
                        </tr>
                    </thead>
                    <tbody>
                        <?php if ($qGestores && $qGestores->num_rows > 0): ?>
                            <?php while ($g = $qGestores->fetch_assoc()): ?>
                            <tr>
                                <td class="fw-semibold text-dark">
                                    <i class="fas fa-balance-scale text-amber me-2"></i> <?php echo htmlspecialchars($g['nombre']); ?>
                                </td>
                                <td class="text-center fw-bold"><?php echo $g['total_tramites']; ?></td>
                                <td class="text-center">
                                    <span class="badge bg-warning-subtle text-warning-emphasis px-2 py-1">
                                        <?php echo $g['en_curso']; ?> activos
                                    </span>
                                </td>
                                <td class="text-center">
                                    <span class="badge bg-success-subtle text-success px-2 py-1">
                                        <?php echo $g['completados']; ?> formalizados
                                    </span>
                                </td>
                            </tr>
                            <?php endwhile; ?>
                        <?php else: ?>
                            <tr>
                                <td colspan="4" class="text-center py-3 text-muted">No hay trámites legales asignados</td>
                            </tr>
                        <?php endif; ?>
                    </tbody>
                </table>
            </div>
        </div>
    </div>
</div>

<!-- Tabla: Emprendedores Destacados -->
<div class="card border-0 shadow-sm mb-4" style="border-radius: 12px; overflow: hidden;">
    <div class="card-header bg-white py-3 border-0 d-flex justify-content-between align-items-center">
        <h5 class="fw-bold mb-0" style="color: var(--c58-navy);">
            <i class="fas fa-star text-warning me-2"></i> Emprendedores con Mayor Actividad
        </h5>
        <a href="../directorio/" class="btn btn-sm btn-outline-secondary">
            <i class="fas fa-address-book me-1"></i> Ir al Directorio Completo
        </a>
    </div>
    <div class="table-responsive">
        <table class="table table-hover align-middle mb-0">
            <thead style="background-color: var(--c58-navy); color: #ffffff;">
                <tr>
                    <th class="ps-3">Emprendedor / Empresa</th>
                    <th>Documento</th>
                    <th class="text-center">Asesorías</th>
                    <th class="text-center">Trámites Legales</th>
                    <th class="text-center">Contratos</th>
                    <th class="text-center">Estado</th>
                    <th class="text-end pe-3">Acción</th>
                </tr>
            </thead>
            <tbody>
                <?php if ($qTopEmp && $qTopEmp->num_rows > 0): ?>
                    <?php while ($te = $qTopEmp->fetch_assoc()): ?>
                    <tr>
                        <td class="ps-3">
                            <div class="fw-bold text-dark"><?php echo htmlspecialchars($te['nombre_completo']); ?></div>
                            <?php if (!empty($te['nombre_empresa'])): ?>
                                <small class="text-muted"><i class="fas fa-store me-1"></i><?php echo htmlspecialchars($te['nombre_empresa']); ?></small>
                            <?php endif; ?>
                        </td>
                        <td>
                            <span class="badge bg-light text-dark border">
                                <?php echo htmlspecialchars($te['identificacion'] ?: 'S/I'); ?>
                            </span>
                        </td>
                        <td class="text-center">
                            <span class="badge bg-teal-subtle text-teal fw-bold"><?php echo $te['num_asesorias']; ?></span>
                        </td>
                        <td class="text-center">
                            <span class="badge bg-primary-subtle text-primary fw-bold"><?php echo $te['num_tramites']; ?></span>
                        </td>
                        <td class="text-center">
                            <span class="badge bg-success-subtle text-success fw-bold"><?php echo $te['num_contratos']; ?></span>
                        </td>
                        <td class="text-center">
                            <?php echo renderBadgeEstadoEmprendedor($te['status']); ?>
                        </td>
                        <td class="text-end pe-3">
                            <a href="../clientes/ver.php?id=<?php echo $te['id']; ?>" class="btn btn-sm btn-outline-primary">
                                <i class="fas fa-eye me-1"></i> Ficha
                            </a>
                        </td>
                    </tr>
                    <?php endwhile; ?>
                <?php else: ?>
                    <tr>
                        <td colspan="7" class="text-center py-3 text-muted">No hay registros de actividad disponibles</td>
                    </tr>
                <?php endif; ?>
            </tbody>
        </table>
    </div>
</div>

<!-- ========================================================= -->
<!-- INICIALIZACIÓN DE GRÁFICOS CHART.JS                       -->
<!-- ========================================================= -->
<script>
document.addEventListener("DOMContentLoaded", function() {
    // Paleta Oficial Código-58
    const C58_PALETTE = {
        navy:   '#161938',
        teal:   '#008080',
        amber:  '#F59E0B',
        violet: '#4A154B',
        cyan:   '#0284C7',
        gray:   '#94A3B8'
    };

    // 1. Gráfico Doughnut: Emprendedores por Industria
    const ctxInd = document.getElementById('chartIndustrias');
    if (ctxInd) {
        new Chart(ctxInd, {
            type: 'doughnut',
            data: {
                labels: <?php echo json_encode($indLabels); ?>,
                datasets: [{
                    data: <?php echo json_encode($indValues); ?>,
                    backgroundColor: [
                        C58_PALETTE.teal,
                        C58_PALETTE.navy,
                        C58_PALETTE.amber,
                        C58_PALETTE.violet,
                        C58_PALETTE.cyan,
                        C58_PALETTE.gray
                    ],
                    borderWidth: 2,
                    borderColor: '#ffffff'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: { boxWidth: 12, font: { size: 11 } }
                    }
                },
                cutout: '65%'
            }
        });
    }

    // 2. Gráfico Barras: Asesorías por Mes
    const ctxAse = document.getElementById('chartAsesorias');
    if (ctxAse) {
        new Chart(ctxAse, {
            type: 'bar',
            data: {
                labels: <?php echo json_encode($mesLabels); ?>,
                datasets: [
                    {
                        label: 'Realizadas',
                        data: <?php echo json_encode($mesRealizadas); ?>,
                        backgroundColor: C58_PALETTE.teal,
                        borderRadius: 6
                    },
                    {
                        label: 'Programadas',
                        data: <?php echo json_encode($mesProgramadas); ?>,
                        backgroundColor: C58_PALETTE.amber,
                        borderRadius: 6
                    },
                    {
                        label: 'Canceladas',
                        data: <?php echo json_encode($mesCanceladas); ?>,
                        backgroundColor: '#EF4444',
                        borderRadius: 6
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: { beginAtZero: true, ticks: { stepSize: 1 } },
                    x: { grid: { display: false } }
                },
                plugins: {
                    legend: { position: 'top', labels: { boxWidth: 12 } }
                }
            }
        });
    }

    // 3. Gráfico Barras: Balance Financiero
    const ctxFin = document.getElementById('chartFinanzas');
    if (ctxFin) {
        new Chart(ctxFin, {
            type: 'bar',
            data: {
                labels: ['Total Facturado', 'Anticipos Cobrados', 'Total Recaudado', 'Saldo Pendiente'],
                datasets: [{
                    label: 'Monto ($ USD)',
                    data: [
                        <?php echo $total_facturado; ?>,
                        <?php echo $total_anticipos; ?>,
                        <?php echo $total_cobrado; ?>,
                        <?php echo $total_saldos; ?>
                    ],
                    backgroundColor: [
                        C58_PALETTE.navy,
                        C58_PALETTE.teal,
                        '#10B981',
                        C58_PALETTE.amber
                    ],
                    borderRadius: 6
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: { 
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) { return '$ ' + Number(value).toLocaleString(); }
                        }
                    },
                    x: { grid: { display: false } }
                },
                plugins: {
                    legend: { display: false }
                }
            }
        });
    }

    // 4. Gráfico Polar / Doughnut: Trámites Legales
    const ctxLeg = document.getElementById('chartLegales');
    if (ctxLeg) {
        new Chart(ctxLeg, {
            type: 'pie',
            data: {
                labels: <?php echo json_encode($legalLabels); ?>,
                datasets: [{
                    data: <?php echo json_encode($legalValues); ?>,
                    backgroundColor: [
                        C58_PALETTE.amber,
                        C58_PALETTE.teal,
                        '#10B981',
                        '#EF4444'
                    ],
                    borderWidth: 2,
                    borderColor: '#ffffff'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: { boxWidth: 12, font: { size: 11 } }
                    }
                }
            }
        });
    }
});
</script>

<?php include '../../includes/footer.php'; ?>
