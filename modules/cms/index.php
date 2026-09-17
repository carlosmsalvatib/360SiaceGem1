<?php
require_once '../../config/config.php';
require_once '../../config/database.php';
require_once '../../includes/auth.php';
require_once '../../includes/functions.php';

requireRole(['direccion']);

$db = Database::getInstance();
$conn = $db->getConnection();

$activeTab = $_GET['tab'] ?? 'modulos';

// 1. Obtener módulos del sistema
$resModulos = $conn->query("SELECT * FROM modulos_sistema ORDER BY orden ASC, id ASC");
$modulos = [];
while ($m = $resModulos->fetch_assoc()) {
    $modulos[] = $m;
}

// 2. Obtener parámetros de configuración
$resConfig = $conn->query("SELECT * FROM configuracion_sistema ORDER BY id ASC");
$configs = [];
while ($c = $resConfig->fetch_assoc()) {
    $configs[$c['clave']] = $c;
}

// 3. Obtener catálogo de servicios
$resServicios = $conn->query("SELECT * FROM catalogo_servicios ORDER BY categoria ASC, nombre ASC");
$servicios = [];
while ($s = $resServicios->fetch_assoc()) {
    $servicios[] = $s;
}

$pageTitle = "CMS - Gestión de Módulos y Sistema";
require_once '../../includes/header.php';
?>

<div class="row align-items-center mb-4">
    <div class="col-md-8">
        <div class="d-flex align-items-center gap-3">
            <div class="rounded-3 p-3 text-white" style="background: linear-gradient(135deg, var(--c58-navy), var(--c58-teal));">
                <i class="fas fa-sliders-h fs-3"></i>
            </div>
            <div>
                <h2 class="fw-bold mb-1" style="color: var(--c58-navy);">CMS & Configuración del Sistema</h2>
                <p class="text-muted mb-0">Administración de módulos principales, parámetros de identidad Código-58 y catálogo de servicios</p>
            </div>
        </div>
    </div>
    <div class="col-md-4 text-md-end mt-3 mt-md-0">
        <span class="badge bg-danger-subtle text-danger px-3 py-2 border border-danger-subtle">
            <i class="fas fa-shield-alt me-1"></i> Acceso Exclusivo Dirección
        </span>
    </div>
</div>

<!-- Pestañas de Navegación del CMS -->
<ul class="nav nav-pills mb-4 nav-justified bg-white p-2 rounded-3 shadow-sm border" id="cmsTabs" role="tablist">
    <li class="nav-item" role="presentation">
        <button class="nav-link fw-semibold <?php echo $activeTab === 'modulos' ? 'active' : ''; ?>" id="modulos-tab" data-bs-toggle="tab" data-bs-target="#tab-modulos" type="button" role="tab" style="<?php echo $activeTab === 'modulos' ? 'background-color: var(--c58-teal);' : ''; ?>">
            <i class="fas fa-cubes me-2"></i> Módulos del Sistema
        </button>
    </li>
    <li class="nav-item" role="presentation">
        <button class="nav-link fw-semibold <?php echo $activeTab === 'configuracion' ? 'active' : ''; ?>" id="configuracion-tab" data-bs-toggle="tab" data-bs-target="#tab-configuracion" type="button" role="tab" style="<?php echo $activeTab === 'configuracion' ? 'background-color: var(--c58-teal);' : ''; ?>">
            <i class="fas fa-tools me-2"></i> Configuración Corporativa
        </button>
    </li>
    <li class="nav-item" role="presentation">
        <button class="nav-link fw-semibold <?php echo $activeTab === 'servicios' ? 'active' : ''; ?>" id="servicios-tab" data-bs-toggle="tab" data-bs-target="#tab-servicios" type="button" role="tab" style="<?php echo $activeTab === 'servicios' ? 'background-color: var(--c58-teal);' : ''; ?>">
            <i class="fas fa-tags me-2"></i> Catálogo de Servicios
        </button>
    </li>
</ul>

<div class="tab-content" id="cmsTabsContent">
    
    <!-- ========================================== -->
    <!-- TAB 1: MÓDULOS PRINCIPALES DEL SISTEMA      -->
    <!-- ========================================== -->
    <div class="tab-pane fade <?php echo $activeTab === 'modulos' ? 'show active' : ''; ?>" id="tab-modulos" role="tabpanel">
        <div class="card border-0 shadow-sm" style="border-radius: 12px;">
            <div class="card-header bg-white py-3 border-0 d-flex justify-content-between align-items-center">
                <div>
                    <h5 class="fw-bold mb-0" style="color: var(--c58-navy);">Control de Módulos del Menú y Navegación</h5>
                    <small class="text-muted">Activa o desactiva módulos, redefine etiquetas, orden y niveles de acceso por rol</small>
                </div>
            </div>
            
            <form action="guardar.php" method="POST">
                <input type="hidden" name="action" value="guardar_modulos">
                <input type="hidden" name="tab" value="modulos">
                
                <div class="table-responsive">
                    <table class="table table-hover align-middle mb-0">
                        <thead style="background-color: var(--c58-navy); color: #ffffff;">
                            <tr>
                                <th style="width: 70px;" class="text-center">Orden</th>
                                <th style="width: 80px;" class="text-center">Estado</th>
                                <th style="width: 200px;">Nombre del Módulo</th>
                                <th style="width: 140px;">Identificador / Slug</th>
                                <th style="width: 140px;">Icono</th>
                                <th>Roles Permitidos</th>
                                <th style="width: 220px;">Descripción</th>
                            </tr>
                        </thead>
                        <tbody>
                            <?php foreach ($modulos as $mod): 
                                $modId = $mod['id'];
                                $rolesPermitidos = explode(',', $mod['roles_permitidos'] ?? '');
                            ?>
                            <tr>
                                <!-- Orden -->
                                <td class="text-center">
                                    <input type="number" name="modulos[<?php echo $modId; ?>][orden]" 
                                           value="<?php echo intval($mod['orden']); ?>" 
                                           class="form-control form-control-sm text-center fw-bold" style="width: 60px; margin: 0 auto;">
                                </td>
                                
                                <!-- Activo / Inactivo -->
                                <td class="text-center">
                                    <div class="form-check form-switch d-inline-block">
                                        <input class="form-check-input" type="checkbox" role="switch" 
                                               name="modulos[<?php echo $modId; ?>][activo]" value="1" 
                                               <?php echo $mod['activo'] ? 'checked' : ''; ?>
                                               <?php echo $mod['slug'] === 'dashboard' ? 'disabled title="El panel principal no puede desactivarse"' : ''; ?>>
                                        <?php if ($mod['slug'] === 'dashboard'): ?>
                                            <input type="hidden" name="modulos[<?php echo $modId; ?>][activo]" value="1">
                                        <?php endif; ?>
                                    </div>
                                </td>
                                
                                <!-- Nombre -->
                                <td>
                                    <div class="input-group input-group-sm">
                                        <span class="input-group-text bg-light"><i class="<?php echo htmlspecialchars($mod['icono']); ?> text-teal"></i></span>
                                        <input type="text" name="modulos[<?php echo $modId; ?>][nombre]" 
                                               value="<?php echo htmlspecialchars($mod['nombre']); ?>" 
                                               class="form-control fw-semibold" required>
                                    </div>
                                </td>

                                <!-- Slug (fijo) -->
                                <td>
                                    <code><?php echo htmlspecialchars($mod['slug']); ?></code>
                                </td>

                                <!-- Icono FontAwesome -->
                                <td>
                                    <input type="text" name="modulos[<?php echo $modId; ?>][icono]" 
                                           value="<?php echo htmlspecialchars($mod['icono']); ?>" 
                                           class="form-control form-control-sm font-monospace" placeholder="fas fa-...">
                                </td>

                                <!-- Roles -->
                                <td>
                                    <div class="d-flex flex-wrap gap-2">
                                        <?php 
                                        $availableRoles = [
                                            'direccion' => 'Dirección',
                                            'consultor' => 'Consultor',
                                            'gestor_legal' => 'Legal',
                                            'comercial' => 'Comercial'
                                        ];
                                        foreach ($availableRoles as $roleKey => $roleLabel): 
                                            $isChecked = in_array($roleKey, $rolesPermitidos);
                                        ?>
                                        <div class="form-check form-check-inline mb-0">
                                            <input class="form-check-input" type="checkbox" 
                                                   name="modulos[<?php echo $modId; ?>][roles][]" 
                                                   value="<?php echo $roleKey; ?>" 
                                                   id="role_<?php echo $modId . '_' . $roleKey; ?>"
                                                   <?php echo $isChecked ? 'checked' : ''; ?>>
                                            <label class="form-check-label small" for="role_<?php echo $modId . '_' . $roleKey; ?>">
                                                <?php echo $roleLabel; ?>
                                            </label>
                                        </div>
                                        <?php endforeach; ?>
                                    </div>
                                </td>

                                <!-- Descripción -->
                                <td>
                                    <input type="text" name="modulos[<?php echo $modId; ?>][descripcion]" 
                                           value="<?php echo htmlspecialchars($mod['descripcion'] ?? ''); ?>" 
                                           class="form-control form-control-sm text-muted">
                                </td>
                            </tr>
                            <?php endforeach; ?>
                        </tbody>
                    </table>
                </div>

                <div class="card-footer bg-light border-0 py-3 d-flex justify-content-between align-items-center">
                    <span class="text-muted small">
                        <i class="fas fa-info-circle me-1"></i> Los cambios aplicados se reflejan inmediatamente en la barra de navegación y en las políticas de seguridad.
                    </span>
                    <button type="submit" class="btn text-white px-4" style="background-color: var(--c58-navy);">
                        <i class="fas fa-save me-1"></i> Guardar Configuración de Módulos
                    </button>
                </div>
            </form>
        </div>
    </div>

    <!-- ========================================== -->
    <!-- TAB 2: CONFIGURACIÓN CORPORATIVA CÓDIGO-58 -->
    <!-- ========================================== -->
    <div class="tab-pane fade <?php echo $activeTab === 'configuracion' ? 'show active' : ''; ?>" id="tab-configuracion" role="tabpanel">
        <div class="card border-0 shadow-sm" style="border-radius: 12px;">
            <div class="card-header bg-white py-3 border-0">
                <h5 class="fw-bold mb-0" style="color: var(--c58-navy);">Parámetros Globales e Identidad Institucional</h5>
                <small class="text-muted">Personaliza la información de la empresa, datos de contacto oficial y directrices de contratos</small>
            </div>
            
            <form action="guardar.php" method="POST">
                <input type="hidden" name="action" value="guardar_configuracion">
                <input type="hidden" name="tab" value="configuracion">

                <div class="card-body p-4">
                    <div class="row g-4">
                        <div class="col-md-6">
                            <label class="form-label fw-bold text-secondary">Nombre Oficial de la Organización</label>
                            <input type="text" name="config[nombre_empresa]" 
                                   value="<?php echo htmlspecialchars($configs['nombre_empresa']['valor'] ?? 'Código-58'); ?>" 
                                   class="form-control" required>
                            <small class="text-muted">Nombre corporativo que figura en membretes y encabezados.</small>
                        </div>

                        <div class="col-md-6">
                            <label class="form-label fw-bold text-secondary">Título de la Plataforma Web</label>
                            <input type="text" name="config[sistema_titulo]" 
                                   value="<?php echo htmlspecialchars($configs['sistema_titulo']['valor'] ?? 'Sistema de Gestión Código-58'); ?>" 
                                   class="form-control" required>
                            <small class="text-muted">Texto del título en pestañas del navegador y cabecera.</small>
                        </div>

                        <div class="col-12">
                            <label class="form-label fw-bold text-secondary">Lema / Slogan Corporativo</label>
                            <input type="text" name="config[lema]" 
                                   value="<?php echo htmlspecialchars($configs['lema']['valor'] ?? 'Soluciones Estratégicas y Gestión para Emprendedores'); ?>" 
                                   class="form-control">
                            <small class="text-muted">Frase distintiva visible en el login, dashboard y reportes impresos.</small>
                        </div>

                        <div class="col-md-4">
                            <label class="form-label fw-bold text-secondary">Correo de Contacto Institucional</label>
                            <div class="input-group">
                                <span class="input-group-text bg-light"><i class="fas fa-envelope text-teal"></i></span>
                                <input type="email" name="config[email_contacto]" 
                                       value="<?php echo htmlspecialchars($configs['email_contacto']['valor'] ?? 'contacto@codigo58.com'); ?>" 
                                       class="form-control" required>
                            </div>
                        </div>

                        <div class="col-md-4">
                            <label class="form-label fw-bold text-secondary">Teléfono Oficial de Soporte</label>
                            <div class="input-group">
                                <span class="input-group-text bg-light"><i class="fas fa-phone text-teal"></i></span>
                                <input type="text" name="config[telefono_contacto]" 
                                       value="<?php echo htmlspecialchars($configs['telefono_contacto']['valor'] ?? '+58 (0212) 555-0158'); ?>" 
                                       class="form-control" required>
                            </div>
                        </div>

                        <div class="col-md-4">
                            <label class="form-label fw-bold text-secondary">Versión de la Plataforma</label>
                            <div class="input-group">
                                <span class="input-group-text bg-light"><i class="fas fa-code-branch text-teal"></i></span>
                                <input type="text" name="config[version_sistema]" 
                                       value="<?php echo htmlspecialchars($configs['version_sistema']['valor'] ?? '2.0'); ?>" 
                                       class="form-control" required>
                            </div>
                        </div>

                        <div class="col-12">
                            <label class="form-label fw-bold text-secondary">Dirección Física de la Oficina Principal</label>
                            <textarea name="config[direccion_oficina]" rows="2" class="form-control"><?php echo htmlspecialchars($configs['direccion_oficina']['valor'] ?? 'Av. Francisco de Miranda, Centro Empresarial Código-58'); ?></textarea>
                        </div>

                        <div class="col-md-6">
                            <div class="p-3 bg-light rounded-3 border">
                                <label class="form-label fw-bold text-secondary mb-1">Porcentaje de Anticipo Recomendado (%)</label>
                                <div class="input-group" style="max-width: 200px;">
                                    <input type="number" step="1" min="0" max="100" name="config[porcentaje_anticipo]" 
                                           value="<?php echo htmlspecialchars($configs['porcentaje_anticipo']['valor'] ?? '50'); ?>" 
                                           class="form-control fw-bold">
                                    <span class="input-group-text fw-bold">%</span>
                                </div>
                                <small class="text-muted d-block mt-1">Porcentaje sugerido automáticamente al generar nuevos contratos.</small>
                            </div>
                        </div>

                        <div class="col-md-6">
                            <div class="p-3 bg-light rounded-3 border">
                                <label class="form-label fw-bold text-secondary mb-1">Días Plazo para Trámites Legales</label>
                                <div class="input-group" style="max-width: 200px;">
                                    <input type="number" step="1" min="1" max="180" name="config[dias_plazo_legal]" 
                                           value="<?php echo htmlspecialchars($configs['dias_plazo_legal']['valor'] ?? '15'); ?>" 
                                           class="form-control fw-bold">
                                    <span class="input-group-text">días</span>
                                </div>
                                <small class="text-muted d-block mt-1">Tiempo de alerta estándar para el seguimiento de procesos legales.</small>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="card-footer bg-light border-0 py-3 text-end">
                    <button type="submit" class="btn text-white px-4" style="background-color: var(--c58-navy);">
                        <i class="fas fa-save me-1"></i> Actualizar Parámetros Corporativos
                    </button>
                </div>
            </form>
        </div>
    </div>

    <!-- ========================================== -->
    <!-- TAB 3: CATÁLOGO DE SERVICIOS                -->
    <!-- ========================================== -->
    <div class="tab-pane fade <?php echo $activeTab === 'servicios' ? 'show active' : ''; ?>" id="tab-servicios" role="tabpanel">
        <div class="card border-0 shadow-sm" style="border-radius: 12px;">
            <div class="card-header bg-white py-3 border-0 d-flex justify-content-between align-items-center flex-wrap gap-2">
                <div>
                    <h5 class="fw-bold mb-0" style="color: var(--c58-navy);">Catálogo Maestro de Servicios para Emprendedores</h5>
                    <small class="text-muted">Servicios disponibles para clasificación, búsqueda en Directorio y etiquetas de perfil</small>
                </div>
                <button type="button" class="btn text-white btn-sm" style="background-color: var(--c58-teal);" data-bs-toggle="modal" data-bs-target="#modalNuevoServicio">
                    <i class="fas fa-plus me-1"></i> Nuevo Servicio
                </button>
            </div>

            <div class="table-responsive">
                <table class="table table-hover align-middle mb-0">
                    <thead style="background-color: var(--c58-navy); color: #ffffff;">
                        <tr>
                            <th class="ps-3" style="width: 280px;">Nombre del Servicio</th>
                            <th style="width: 160px;">Categoría</th>
                            <th>Descripción</th>
                            <th class="text-center" style="width: 120px;">Estado</th>
                            <th class="text-end pe-3" style="width: 140px;">Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        <?php if (empty($servicios)): ?>
                            <tr>
                                <td colspan="5" class="text-center py-4 text-muted">No hay servicios registrados en el catálogo.</td>
                            </tr>
                        <?php else: ?>
                            <?php foreach ($servicios as $serv): ?>
                            <tr>
                                <td class="ps-3 fw-bold text-dark">
                                    <i class="fas fa-check-circle text-teal me-2"></i><?php echo htmlspecialchars($serv['nombre']); ?>
                                </td>
                                <td>
                                    <span class="badge bg-light text-dark border px-2 py-1">
                                        <?php echo htmlspecialchars($serv['categoria'] ?? 'General'); ?>
                                    </span>
                                </td>
                                <td class="small text-secondary">
                                    <?php echo htmlspecialchars($serv['descripcion'] ?? 'Sin descripción'); ?>
                                </td>
                                <td class="text-center">
                                    <?php if ($serv['activo']): ?>
                                        <span class="badge bg-success-subtle text-success border border-success-subtle">Activo</span>
                                    <?php else: ?>
                                        <span class="badge bg-secondary-subtle text-secondary border border-secondary-subtle">Inactivo</span>
                                    <?php endif; ?>
                                </td>
                                <td class="text-end pe-3">
                                    <a href="guardar.php?action=toggle_servicio&id=<?php echo $serv['id']; ?>" class="btn btn-sm <?php echo $serv['activo'] ? 'btn-outline-warning' : 'btn-outline-success'; ?>" title="<?php echo $serv['activo'] ? 'Desactivar' : 'Activar'; ?>">
                                        <i class="fas <?php echo $serv['activo'] ? 'fa-eye-slash' : 'fa-check'; ?>"></i>
                                    </a>
                                    <button type="button" class="btn btn-sm btn-outline-primary" data-bs-toggle="modal" data-bs-target="#modalEditarServicio<?php echo $serv['id']; ?>" title="Editar">
                                        <i class="fas fa-edit"></i>
                                    </button>
                                    <a href="guardar.php?action=eliminar_servicio&id=<?php echo $serv['id']; ?>" class="btn btn-sm btn-outline-danger btn-delete" data-mensaje="¿Eliminar este servicio del catálogo?" title="Eliminar">
                                        <i class="fas fa-trash"></i>
                                    </a>

                                    <!-- Modal Editar Servicio -->
                                    <div class="modal fade text-start" id="modalEditarServicio<?php echo $serv['id']; ?>" tabindex="-1">
                                        <div class="modal-dialog">
                                            <div class="modal-content">
                                                <form action="guardar.php" method="POST">
                                                    <input type="hidden" name="action" value="editar_servicio">
                                                    <input type="hidden" name="id" value="<?php echo $serv['id']; ?>">
                                                    <input type="hidden" name="tab" value="servicios">
                                                    
                                                    <div class="modal-header">
                                                        <h5 class="modal-title fw-bold">Editar Servicio</h5>
                                                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                                                    </div>
                                                    <div class="modal-body">
                                                        <div class="mb-3">
                                                            <label class="form-label fw-semibold">Nombre del Servicio</label>
                                                            <input type="text" name="nombre" value="<?php echo htmlspecialchars($serv['nombre']); ?>" class="form-control" required>
                                                        </div>
                                                        <div class="mb-3">
                                                            <label class="form-label fw-semibold">Categoría</label>
                                                            <input type="text" name="categoria" value="<?php echo htmlspecialchars($serv['categoria']); ?>" class="form-control" placeholder="Ej. Tecnología, Marketing, Legal...">
                                                        </div>
                                                        <div class="mb-3">
                                                            <label class="form-label fw-semibold">Descripción</label>
                                                            <textarea name="descripcion" class="form-control" rows="3"><?php echo htmlspecialchars($serv['descripcion']); ?></textarea>
                                                        </div>
                                                    </div>
                                                    <div class="modal-footer">
                                                        <button type="button" class="btn btn-light" data-bs-dismiss="modal">Cancelar</button>
                                                        <button type="submit" class="btn text-white" style="background-color: var(--c58-navy);">Guardar Cambios</button>
                                                    </div>
                                                </form>
                                            </div>
                                        </div>
                                    </div>
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

<!-- Modal Nuevo Servicio -->
<div class="modal fade" id="modalNuevoServicio" tabindex="-1">
    <div class="modal-dialog">
        <div class="modal-content">
            <form action="guardar.php" method="POST">
                <input type="hidden" name="action" value="agregar_servicio">
                <input type="hidden" name="tab" value="servicios">
                
                <div class="modal-header">
                    <h5 class="modal-title fw-bold">Nuevo Servicio en el Catálogo</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                </div>
                <div class="modal-body">
                    <div class="mb-3">
                        <label class="form-label fw-semibold">Nombre del Servicio *</label>
                        <input type="text" name="nombre" class="form-control" placeholder="Ej. Ciberseguridad y Redes" required>
                    </div>
                    <div class="mb-3">
                        <label class="form-label fw-semibold">Categoría</label>
                        <input type="text" name="categoria" class="form-control" placeholder="Ej. Tecnología, Finanzas, etc.">
                    </div>
                    <div class="mb-3">
                        <label class="form-label fw-semibold">Descripción</label>
                        <textarea name="descripcion" class="form-control" rows="3" placeholder="Detalles de lo que comprende este servicio..."></textarea>
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-light" data-bs-dismiss="modal">Cancelar</button>
                    <button type="submit" class="btn text-white" style="background-color: var(--c58-teal);">Registrar Servicio</button>
                </div>
            </form>
        </div>
    </div>
</div>

<?php require_once '../../includes/footer.php'; ?>
