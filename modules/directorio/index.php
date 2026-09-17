<?php
require_once '../../config/config.php';
require_once '../../config/database.php';
require_once '../../includes/auth.php';
require_once '../../includes/functions.php';

requireLogin();

$db = Database::getInstance();
$conn = $db->getConnection();

// Capturar parámetros de búsqueda
$search_nombre    = trim($_GET['nombre'] ?? '');
$search_servicio  = trim($_GET['servicio'] ?? '');
$search_industria = trim($_GET['industria'] ?? '');
$search_status    = trim($_GET['status'] ?? '');
$vista            = trim($_GET['vista'] ?? 'tabla'); // 'tabla' o 'tarjetas'

// Construir consulta SQL con filtros dinámicos
$sql = "SELECT id, identificacion, nombre_completo, email, telefono, direccion, nombre_empresa, servicios_ofrecidos, industria, status, fecha_registro 
        FROM clientes 
        WHERE 1=1";
$params = [];
$types  = "";

if ($search_nombre !== '') {
    $sql .= " AND (nombre_completo LIKE ? OR nombre_empresa LIKE ? OR identificacion LIKE ?)";
    $term = "%" . $search_nombre . "%";
    $params[] = $term;
    $params[] = $term;
    $params[] = $term;
    $types .= "sss";
}

if ($search_servicio !== '') {
    $sql .= " AND servicios_ofrecidos LIKE ?";
    $termServ = "%" . $search_servicio . "%";
    $params[] = $termServ;
    $types .= "s";
}

if ($search_industria !== '') {
    $sql .= " AND industria = ?";
    $params[] = $search_industria;
    $types .= "s";
}

if ($search_status !== '') {
    $sql .= " AND status = ?";
    $params[] = $search_status;
    $types .= "s";
}

$sql .= " ORDER BY nombre_completo ASC";

$stmt = $conn->prepare($sql);
if (!empty($params)) {
    $stmt->bind_param($types, ...$params);
}
$stmt->execute();
$result = $stmt->get_result();
$total_resultados = $result->num_rows;

// Obtener industrias únicas para el filtro
$resIndustrias = $conn->query("SELECT DISTINCT industria FROM clientes WHERE industria IS NOT NULL AND industria != '' ORDER BY industria ASC");
$industrias = [];
while ($rowInd = $resIndustrias->fetch_assoc()) {
    $industrias[] = $rowInd['industria'];
}

// Obtener catálogo de servicios populares para chips de filtrado rápido
$resCatalogo = $conn->query("SELECT nombre FROM catalogo_servicios WHERE activo = 1 ORDER BY nombre ASC LIMIT 10");
$servicios_populares = [];
if ($resCatalogo) {
    while ($rowCat = $resCatalogo->fetch_assoc()) {
        $servicios_populares[] = $rowCat['nombre'];
    }
}

// Parámetros para exportar manteniendo los filtros actuales
$export_query = http_build_query([
    'nombre' => $search_nombre,
    'servicio' => $search_servicio,
    'industria' => $search_industria,
    'status' => $search_status
]);

$pageTitle = "Directorio de Emprendedores";
require_once '../../includes/header.php';
?>

<div class="row align-items-center mb-4">
    <div class="col-md-7">
        <div class="d-flex align-items-center gap-3">
            <div class="rounded-3 p-3 text-white" style="background: linear-gradient(135deg, var(--c58-navy), var(--c58-teal));">
                <i class="fas fa-address-book fs-3"></i>
            </div>
            <div>
                <h2 class="fw-bold mb-1" style="color: var(--c58-navy);">Directorio de Emprendedores</h2>
                <p class="text-muted mb-0">Red comercial, consulta de servicios y datos de contacto directo de la comunidad Código-58</p>
            </div>
        </div>
    </div>
    <div class="col-md-5 text-md-end mt-3 mt-md-0 d-flex flex-wrap justify-content-md-end gap-2">
        <a href="exportar.php?<?php echo $export_query; ?>" class="btn btn-outline-success">
            <i class="fas fa-file-excel me-1"></i> Exportar Excel / CSV
        </a>
        <button onclick="window.print()" class="btn btn-outline-secondary">
            <i class="fas fa-print me-1"></i> Imprimir
        </button>
        <?php if (hasRole(['direccion', 'comercial'])): ?>
        <a href="../clientes/crear.php" class="btn text-white" style="background-color: var(--c58-teal);">
            <i class="fas fa-user-plus me-1"></i> Nuevo Emprendedor
        </a>
        <?php endif; ?>
    </div>
</div>

<!-- Panel de Búsqueda Avanzada -->
<div class="card border-0 shadow-sm mb-4" style="border-radius: 12px; border-left: 4px solid var(--c58-teal) !important;">
    <div class="card-body p-4">
        <form method="GET" action="" class="row g-3">
            <input type="hidden" name="vista" value="<?php echo htmlspecialchars($vista); ?>">
            
            <div class="col-md-4">
                <label class="form-label fw-semibold text-secondary small">
                    <i class="fas fa-search me-1 text-teal"></i> Buscar por Nombre, Empresa o Identificación
                </label>
                <div class="input-group">
                    <span class="input-group-text bg-light border-end-0"><i class="fas fa-user text-muted"></i></span>
                    <input type="text" name="nombre" class="form-control border-start-0" 
                           placeholder="Ej. Yamileth, J-50123456-7, Soluciones..." 
                           value="<?php echo htmlspecialchars($search_nombre); ?>">
                </div>
            </div>

            <div class="col-md-4">
                <label class="form-label fw-semibold text-secondary small">
                    <i class="fas fa-briefcase me-1 text-teal"></i> Servicio Ofrecido
                </label>
                <div class="input-group">
                    <span class="input-group-text bg-light border-end-0"><i class="fas fa-tag text-muted"></i></span>
                    <input type="text" name="servicio" class="form-control border-start-0" 
                           placeholder="Ej. Software, Marketing, Legal, Repostería..." 
                           value="<?php echo htmlspecialchars($search_servicio); ?>">
                </div>
            </div>

            <div class="col-md-2">
                <label class="form-label fw-semibold text-secondary small">
                    <i class="fas fa-industry me-1 text-teal"></i> Sector / Industria
                </label>
                <select name="industria" class="form-select">
                    <option value="">Todos los sectores</option>
                    <?php foreach ($industrias as $ind): ?>
                        <option value="<?php echo htmlspecialchars($ind); ?>" <?php echo $search_industria === $ind ? 'selected' : ''; ?>>
                            <?php echo htmlspecialchars($ind); ?>
                        </option>
                    <?php endforeach; ?>
                </select>
            </div>

            <div class="col-md-2">
                <label class="form-label fw-semibold text-secondary small">
                    <i class="fas fa-toggle-on me-1 text-teal"></i> Estado
                </label>
                <select name="status" class="form-select">
                    <option value="">Todos los estados</option>
                    <option value="activo" <?php echo $search_status === 'activo' ? 'selected' : ''; ?>>Activo</option>
                    <option value="prospecto" <?php echo $search_status === 'prospecto' ? 'selected' : ''; ?>>Prospecto</option>
                    <option value="en_consulta" <?php echo $search_status === 'en_consulta' ? 'selected' : ''; ?>>En Consulta</option>
                    <option value="en_legalizacion" <?php echo $search_status === 'en_legalizacion' ? 'selected' : ''; ?>>En Legalización</option>
                    <option value="finalizado" <?php echo $search_status === 'finalizado' ? 'selected' : ''; ?>>Finalizado</option>
                </select>
            </div>

            <div class="col-12 d-flex justify-content-between align-items-center flex-wrap gap-2 pt-2 border-top">
                <!-- Chips de Servicios Populares para filtro en 1 clic -->
                <div class="d-flex flex-wrap align-items-center gap-1">
                    <span class="small text-muted me-1"><i class="fas fa-fire text-warning me-1"></i>Servicios frecuentes:</span>
                    <?php foreach ($servicios_populares as $servPop): 
                        $isActiveChip = (strcasecmp($search_servicio, $servPop) === 0);
                    ?>
                        <a href="?nombre=<?php echo urlencode($search_nombre); ?>&servicio=<?php echo urlencode($servPop); ?>&industria=<?php echo urlencode($search_industria); ?>&status=<?php echo urlencode($search_status); ?>&vista=<?php echo urlencode($vista); ?>" 
                           class="badge <?php echo $isActiveChip ? 'bg-primary text-white' : 'bg-light text-dark border'; ?> text-decoration-none py-2 px-2 small">
                            <?php echo htmlspecialchars($servPop); ?>
                        </a>
                    <?php endforeach; ?>
                </div>

                <div class="d-flex gap-2">
                    <?php if ($search_nombre !== '' || $search_servicio !== '' || $search_industria !== '' || $search_status !== ''): ?>
                        <a href="index.php" class="btn btn-outline-secondary">
                            <i class="fas fa-undo me-1"></i> Limpiar Filtros
                        </a>
                    <?php endif; ?>
                    <button type="submit" class="btn text-white px-4" style="background-color: var(--c58-navy);">
                        <i class="fas fa-search me-1"></i> Buscar
                    </button>
                </div>
            </div>
        </form>
    </div>
</div>

<!-- Barra de Resumen y Selector de Vista -->
<div class="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3">
    <div>
        <span class="fs-6 fw-semibold text-dark">
            <i class="fas fa-users text-teal me-1"></i> 
            Resultados encontrados: <span class="badge bg-dark rounded-pill px-2 py-1"><?php echo $total_resultados; ?></span>
        </span>
        <?php if ($search_nombre || $search_servicio || $search_industria || $search_status): ?>
            <span class="text-muted small ms-2">(filtrado por criterios seleccionados)</span>
        <?php endif; ?>
    </div>

    <!-- Toggle Vista Tabla / Vista Tarjetas -->
    <div class="btn-group btn-group-sm" role="group">
        <a href="?<?php echo $export_query; ?>&vista=tabla" class="btn <?php echo $vista === 'tabla' ? 'btn-primary' : 'btn-outline-secondary'; ?>">
            <i class="fas fa-table me-1"></i> Vista Tabla
        </a>
        <a href="?<?php echo $export_query; ?>&vista=tarjetas" class="btn <?php echo $vista === 'tarjetas' ? 'btn-primary' : 'btn-outline-secondary'; ?>">
            <i class="fas fa-th-large me-1"></i> Vista Tarjetas
        </a>
    </div>
</div>

<?php if ($total_resultados === 0): ?>
    <div class="card border-0 shadow-sm text-center py-5">
        <div class="card-body">
            <i class="fas fa-search fa-3x text-muted mb-3"></i>
            <h4 class="text-secondary fw-bold">No se encontraron emprendedores</h4>
            <p class="text-muted mb-4">No hay emprendedores registrados que coincidan con los criterios de búsqueda actuales.</p>
            <a href="index.php" class="btn text-white" style="background-color: var(--c58-teal);">
                <i class="fas fa-undo me-1"></i> Ver Todos los Emprendedores
            </a>
        </div>
    </div>
<?php elseif ($vista === 'tarjetas'): ?>
    <!-- VISTA EN TARJETAS / CARDS -->
    <div class="row g-4">
        <?php while ($emp = $result->fetch_assoc()): 
            // Limpiar teléfono para enlace directo a WhatsApp
            $cleanPhone = preg_replace('/[^0-9]/', '', $emp['telefono'] ?? '');
            if (strlen($cleanPhone) == 11 && substr($cleanPhone, 0, 1) === '0') {
                $waPhone = '58' . substr($cleanPhone, 1);
            } else {
                $waPhone = $cleanPhone;
            }
        ?>
        <div class="col-md-6 col-lg-4">
            <div class="card h-100 border-0 shadow-sm directory-card" style="border-radius: 12px; transition: transform 0.2s, box-shadow 0.2s;">
                <div class="card-header bg-white border-bottom-0 pt-3 pb-0 d-flex justify-content-between align-items-start">
                    <span class="badge bg-light text-dark border">
                        <i class="fas fa-id-card text-muted me-1"></i> <?php echo htmlspecialchars($emp['identificacion'] ?: 'S/I'); ?>
                    </span>
                    <?php echo renderBadgeEstadoEmprendedor($emp['status']); ?>
                </div>
                
                <div class="card-body">
                    <div class="d-flex align-items-center mb-3">
                        <div class="rounded-circle d-flex align-items-center justify-content-center text-white me-3" 
                             style="width: 48px; height: 48px; background: linear-gradient(135deg, var(--c58-teal), var(--c58-navy)); font-size: 1.2rem; font-weight: bold; flex-shrink: 0;">
                            <?php echo strtoupper(substr($emp['nombre_completo'], 0, 1)); ?>
                        </div>
                        <div>
                            <h5 class="card-title fw-bold mb-0 text-truncate" style="max-width: 200px;">
                                <a href="../clientes/ver.php?id=<?php echo $emp['id']; ?>" class="text-decoration-none text-dark">
                                    <?php echo htmlspecialchars($emp['nombre_completo']); ?>
                                </a>
                            </h5>
                            <?php if (!empty($emp['nombre_empresa'])): ?>
                                <p class="text-muted small mb-0"><i class="fas fa-store text-muted me-1"></i><?php echo htmlspecialchars($emp['nombre_empresa']); ?></p>
                            <?php endif; ?>
                            <?php if (!empty($emp['industria'])): ?>
                                <span class="badge bg-secondary-subtle text-secondary small"><?php echo htmlspecialchars($emp['industria']); ?></span>
                            <?php endif; ?>
                        </div>
                    </div>

                    <!-- Servicios ofrecidos -->
                    <div class="mb-3">
                        <label class="small text-muted fw-bold d-block mb-1">
                            <i class="fas fa-cogs text-teal me-1"></i> Servicios que Ofrece:
                        </label>
                        <?php if (!empty($emp['servicios_ofrecidos'])): ?>
                            <div class="d-flex flex-wrap gap-1">
                                <?php 
                                $servArray = explode(',', $emp['servicios_ofrecidos']);
                                foreach ($servArray as $s): 
                                    $s = trim($s);
                                    if (!empty($s)):
                                ?>
                                    <span class="badge bg-teal-subtle text-teal border border-teal-subtle small fw-normal">
                                        <?php echo htmlspecialchars($s); ?>
                                    </span>
                                <?php 
                                    endif;
                                endforeach; 
                                ?>
                            </div>
                        <?php else: ?>
                            <span class="text-muted small fst-italic">No especificados</span>
                        <?php endif; ?>
                    </div>

                    <!-- Dirección física -->
                    <div class="mb-3 small">
                        <span class="text-muted fw-bold d-block mb-1">
                            <i class="fas fa-map-marker-alt text-danger me-1"></i> Dirección Física:
                        </span>
                        <p class="mb-0 text-secondary">
                            <?php echo !empty($emp['direccion']) ? nl2br(htmlspecialchars($emp['direccion'])) : '<span class="text-muted fst-italic">Sin dirección registrada</span>'; ?>
                        </p>
                    </div>

                    <!-- Canales de Contacto Directo -->
                    <div class="border-top pt-3">
                        <span class="small text-muted fw-bold d-block mb-2">Contacto Directo:</span>
                        <div class="d-flex flex-wrap gap-2">
                            <?php if (!empty($emp['telefono'])): ?>
                                <a href="tel:<?php echo htmlspecialchars($emp['telefono']); ?>" class="btn btn-sm btn-outline-secondary" title="Llamar">
                                    <i class="fas fa-phone-alt me-1 text-primary"></i> <?php echo htmlspecialchars($emp['telefono']); ?>
                                </a>
                                <?php if (!empty($waPhone)): ?>
                                    <a href="https://wa.me/<?php echo $waPhone; ?>" target="_blank" class="btn btn-sm btn-outline-success" title="Escribir al WhatsApp">
                                        <i class="fab fa-whatsapp me-1"></i> WhatsApp
                                    </a>
                                <?php endif; ?>
                            <?php endif; ?>

                            <?php if (!empty($emp['email'])): ?>
                                <a href="mailto:<?php echo htmlspecialchars($emp['email']); ?>" class="btn btn-sm btn-outline-dark" title="Enviar correo">
                                    <i class="fas fa-envelope me-1"></i> Correo
                                </a>
                            <?php endif; ?>
                        </div>
                    </div>
                </div>

                <div class="card-footer bg-light border-0 d-flex justify-content-between align-items-center">
                    <a href="../clientes/ver.php?id=<?php echo $emp['id']; ?>" class="btn btn-sm text-white px-3" style="background-color: var(--c58-teal);">
                        <i class="fas fa-eye me-1"></i> Ver Ficha Completa
                    </a>
                    <div class="dropdown">
                        <button class="btn btn-sm btn-light dropdown-toggle" data-bs-toggle="dropdown">
                            Acciones
                        </button>
                        <ul class="dropdown-menu dropdown-menu-end shadow-sm">
                            <li>
                                <a class="dropdown-item" href="../asesorias/crear.php?cliente_id=<?php echo $emp['id']; ?>">
                                    <i class="fas fa-calendar-plus text-info me-2"></i> Agendar Asesoría
                                </a>
                            </li>
                            <li>
                                <a class="dropdown-item" href="../contratos/crear.php?cliente_id=<?php echo $emp['id']; ?>">
                                    <i class="fas fa-file-signature text-success me-2"></i> Redactar Contrato
                                </a>
                            </li>
                            <?php if (hasRole(['direccion', 'comercial'])): ?>
                            <li><hr class="dropdown-divider"></li>
                            <li>
                                <a class="dropdown-item" href="../clientes/editar.php?id=<?php echo $emp['id']; ?>">
                                    <i class="fas fa-edit text-warning me-2"></i> Editar Datos
                                </a>
                            </li>
                            <?php endif; ?>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
        <?php endwhile; ?>
    </div>

<?php else: ?>
    <!-- VISTA EN TABLA (Cumple con requerimiento explícito: "tabla con los emprendedores que reúnan las condiciones...") -->
    <div class="card border-0 shadow-sm" style="border-radius: 12px; overflow: hidden;">
        <div class="card-body p-0">
            <div class="table-responsive">
                <table class="table table-hover align-middle mb-0" id="tablaDirectorio">
                    <thead style="background-color: var(--c58-navy); color: #ffffff;">
                        <tr>
                            <th class="ps-3" style="width: 220px;">Datos de Identificación</th>
                            <th style="width: 280px;">Servicios que Ofrece</th>
                            <th style="width: 240px;">Dirección Física</th>
                            <th style="width: 260px;">Datos de Contacto</th>
                            <th class="text-center" style="width: 100px;">Estado</th>
                            <th class="text-end pe-3" style="width: 130px;">Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        <?php 
                        while ($emp = $result->fetch_assoc()): 
                            $cleanPhone = preg_replace('/[^0-9]/', '', $emp['telefono'] ?? '');
                            if (strlen($cleanPhone) == 11 && substr($cleanPhone, 0, 1) === '0') {
                                $waPhone = '58' . substr($cleanPhone, 1);
                            } else {
                                $waPhone = $cleanPhone;
                            }
                        ?>
                        <tr>
                            <!-- 1. DATOS DE IDENTIFICACIÓN -->
                            <td class="ps-3">
                                <div class="fw-bold text-dark fs-6">
                                    <a href="../clientes/ver.php?id=<?php echo $emp['id']; ?>" class="text-decoration-none text-dark hover-teal">
                                        <?php echo htmlspecialchars($emp['nombre_completo']); ?>
                                    </a>
                                </div>
                                <?php if (!empty($emp['nombre_empresa'])): ?>
                                    <div class="text-muted small">
                                        <i class="fas fa-building text-secondary me-1"></i> <?php echo htmlspecialchars($emp['nombre_empresa']); ?>
                                    </div>
                                <?php endif; ?>
                                <div class="mt-1">
                                    <span class="badge bg-light text-dark border">
                                        <i class="fas fa-id-card text-muted me-1"></i> <?php echo htmlspecialchars($emp['identificacion'] ?: 'S/I'); ?>
                                    </span>
                                    <?php if (!empty($emp['industria'])): ?>
                                        <span class="badge bg-secondary-subtle text-secondary ms-1">
                                            <?php echo htmlspecialchars($emp['industria']); ?>
                                        </span>
                                    <?php endif; ?>
                                </div>
                            </td>

                            <!-- 2. SERVICIOS QUE OFRECE -->
                            <td>
                                <?php if (!empty($emp['servicios_ofrecidos'])): ?>
                                    <div class="d-flex flex-wrap gap-1">
                                        <?php 
                                        $servArray = explode(',', $emp['servicios_ofrecidos']);
                                        foreach ($servArray as $s): 
                                            $s = trim($s);
                                            if (!empty($s)):
                                        ?>
                                            <span class="badge bg-teal-subtle text-teal border border-teal-subtle py-1 px-2 fw-normal">
                                                <?php echo htmlspecialchars($s); ?>
                                            </span>
                                        <?php 
                                            endif;
                                        endforeach; 
                                        ?>
                                    </div>
                                <?php else: ?>
                                    <span class="text-muted small fst-italic">No registrados</span>
                                <?php endif; ?>
                            </td>

                            <!-- 3. DIRECCIÓN -->
                            <td>
                                <?php if (!empty($emp['direccion'])): ?>
                                    <div class="small text-secondary">
                                        <i class="fas fa-map-marker-alt text-danger me-1"></i>
                                        <?php echo nl2br(htmlspecialchars($emp['direccion'])); ?>
                                    </div>
                                <?php else: ?>
                                    <span class="text-muted small fst-italic">Sin dirección</span>
                                <?php endif; ?>
                            </td>

                            <!-- 4. DATOS DE CONTACTO -->
                            <td>
                                <?php if (!empty($emp['telefono'])): ?>
                                    <div class="mb-1">
                                        <a href="tel:<?php echo htmlspecialchars($emp['telefono']); ?>" class="text-decoration-none text-dark small fw-semibold">
                                            <i class="fas fa-phone-alt text-primary me-1"></i> <?php echo htmlspecialchars($emp['telefono']); ?>
                                        </a>
                                        <?php if (!empty($waPhone)): ?>
                                            <a href="https://wa.me/<?php echo $waPhone; ?>" target="_blank" class="badge bg-success text-white text-decoration-none ms-1" title="Chatear por WhatsApp">
                                                <i class="fab fa-whatsapp me-1"></i> WA
                                            </a>
                                        <?php endif; ?>
                                    </div>
                                <?php endif; ?>

                                <?php if (!empty($emp['email'])): ?>
                                    <div>
                                        <a href="mailto:<?php echo htmlspecialchars($emp['email']); ?>" class="text-decoration-none text-muted small text-truncate d-inline-block" style="max-width: 220px;" title="<?php echo htmlspecialchars($emp['email']); ?>">
                                            <i class="fas fa-envelope text-secondary me-1"></i> <?php echo htmlspecialchars($emp['email']); ?>
                                        </a>
                                    </div>
                                <?php endif; ?>
                            </td>

                            <!-- 5. ESTADO -->
                            <td class="text-center">
                                <?php echo renderBadgeEstadoEmprendedor($emp['status']); ?>
                            </td>

                            <!-- 6. ACCIONES -->
                            <td class="text-end pe-3">
                                <div class="btn-group btn-group-sm">
                                    <a href="../clientes/ver.php?id=<?php echo $emp['id']; ?>" class="btn btn-outline-primary" title="Ver Perfil Completo">
                                        <i class="fas fa-eye"></i>
                                    </a>
                                    <a href="../asesorias/crear.php?cliente_id=<?php echo $emp['id']; ?>" class="btn btn-outline-info" title="Agendar Asesoría">
                                        <i class="fas fa-calendar-plus"></i>
                                    </a>
                                    <?php if (hasRole(['direccion', 'comercial'])): ?>
                                    <a href="../clientes/editar.php?id=<?php echo $emp['id']; ?>" class="btn btn-outline-secondary" title="Editar">
                                        <i class="fas fa-edit"></i>
                                    </a>
                                    <?php endif; ?>
                                </div>
                            </td>
                        </tr>
                        <?php endwhile; ?>
                    </tbody>
                </table>
            </div>
        </div>
    </div>
<?php endif; ?>

<?php require_once '../../includes/footer.php'; ?>
