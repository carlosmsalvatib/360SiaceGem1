<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><?php echo defined('SITE_NAME') ? SITE_NAME : 'Sistema de Gestión Código-58'; ?></title>
    
    <!-- Favicon Oficial Código-58 -->
    <link rel="icon" type="image/png" href="<?php echo SITE_URL; ?>assets/img/favicon.png">
    
    <!-- Bootstrap 5 CSS -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    
    <!-- Font Awesome 6 -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    
    <!-- DataTables CSS -->
    <link rel="stylesheet" href="https://cdn.datatables.net/1.13.6/css/dataTables.bootstrap5.min.css">
    <link rel="stylesheet" href="https://cdn.datatables.net/responsive/2.5.0/css/responsive.bootstrap5.min.css">
    
    <!-- Select2 CSS -->
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/select2@4.1.0-rc.0/dist/css/select2.min.css">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/select2-bootstrap-5-theme@1.3.0/dist/select2-bootstrap-5-theme.min.css">
    
    <!-- SweetAlert2 -->
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/sweetalert2@11/dist/sweetalert2.min.css">
    
    <!-- Estilos Corporativos Oficiales Código-58 -->
    <link rel="stylesheet" href="<?php echo SITE_URL; ?>assets/css/style.css">
</head>
<body>
    <?php if (isLoggedIn()): ?>
    <!-- Barra de navegación Corporativa Código-58 -->
    <nav class="navbar navbar-expand-xl navbar-dark navbar-c58 mb-4">
        <div class="container-fluid">
            <!-- Brand & Logotipo Oficial -->
            <a class="navbar-brand" href="<?php echo SITE_URL; ?>">
                <img src="<?php echo SITE_URL; ?>assets/img/logo.png" alt="Código-58 Logo" class="logo-img">
                <div class="brand-title">
                    <span class="brand-main">CÓDIGO<span class="brand-accent">-58</span></span>
                    <span class="brand-sub">Gestión para Emprendedores</span>
                </div>
            </a>
            
            <button class="navbar-toggler border-0" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
                <span class="navbar-toggler-icon"></span>
            </button>
            
            <div class="collapse navbar-collapse" id="navbarNav">
                <ul class="navbar-nav me-auto mb-2 mb-xl-0">
                    <li class="nav-item">
                        <a class="nav-link" href="<?php echo SITE_URL; ?>">
                            <i class="fas fa-chart-pie text-info"></i> Dashboard
                        </a>
                    </li>
                    
                    <?php if (isModuloActivo('directorio')): ?>
                    <!-- Módulo Destacado: Directorio de Emprendedores -->
                    <li class="nav-item">
                        <a class="nav-link nav-directorio" href="<?php echo SITE_URL; ?>modules/directorio/">
                            <i class="fas fa-address-book"></i> Directorio
                        </a>
                    </li>
                    <?php endif; ?>
                    
                    <?php if (isModuloActivo('clientes')): ?>
                    <li class="nav-item">
                        <a class="nav-link" href="<?php echo SITE_URL; ?>modules/clientes/">
                            <i class="fas fa-user-tie"></i> Emprendedores
                        </a>
                    </li>
                    <?php endif; ?>
                    
                    <?php if (isModuloActivo('asesorias')): ?>
                    <li class="nav-item">
                        <a class="nav-link" href="<?php echo SITE_URL; ?>modules/asesorias/">
                            <i class="fas fa-calendar-alt"></i> Asesorías
                        </a>
                    </li>
                    <?php endif; ?>
                    
                    <?php if (isModuloActivo('legales')): ?>
                    <li class="nav-item">
                        <a class="nav-link" href="<?php echo SITE_URL; ?>modules/legales/">
                            <i class="fas fa-gavel"></i> Procesos Legales
                        </a>
                    </li>
                    <?php endif; ?>
                    
                    <?php if (isModuloActivo('contratos')): ?>
                    <li class="nav-item">
                        <a class="nav-link" href="<?php echo SITE_URL; ?>modules/contratos/">
                            <i class="fas fa-file-contract"></i> Contratos
                        </a>
                    </li>
                    <?php endif; ?>
                    
                    <?php if (isModuloActivo('reportes')): ?>
                    <li class="nav-item">
                        <a class="nav-link" href="<?php echo SITE_URL; ?>modules/reportes/">
                            <i class="fas fa-chart-bar"></i> Reportes
                        </a>
                    </li>
                    <?php endif; ?>
                    
                    <?php if (hasRole(['direccion'])): ?>
                    <li class="nav-item">
                        <a class="nav-link nav-cms" href="<?php echo SITE_URL; ?>modules/cms/">
                            <i class="fas fa-sliders-h"></i> CMS
                        </a>
                    </li>
                    <?php endif; ?>
                </ul>
                
                <!-- Usuario y Perfil -->
                <ul class="navbar-nav align-items-center">
                    <li class="nav-item dropdown">
                        <a class="nav-link dropdown-toggle user-badge-nav text-white" href="#" id="navbarDropdown" role="button" data-bs-toggle="dropdown">
                            <i class="fas fa-user-circle text-warning fs-5"></i> 
                            <span><?php echo htmlspecialchars($_SESSION['nombre'] ?? 'Usuario'); ?></span>
                            <span class="badge bg-light text-dark ms-1 text-uppercase" style="font-size:0.65rem;">
                                <?php echo htmlspecialchars($_SESSION['rol'] ?? ''); ?>
                            </span>
                        </a>
                        <ul class="dropdown-menu dropdown-menu-end shadow-sm">
                            <li class="dropdown-header text-muted">Sesión iniciada</li>
                            <li><span class="dropdown-item-text fw-bold"><?php echo htmlspecialchars($_SESSION['email'] ?? ''); ?></span></li>
                            <li><hr class="dropdown-divider"></li>
                            <?php if (hasRole(['direccion'])): ?>
                            <li>
                                <a class="dropdown-item" href="<?php echo SITE_URL; ?>modules/cms/">
                                    <i class="fas fa-cogs text-primary me-2"></i> CMS & Configuración
                                </a>
                            </li>
                            <li><hr class="dropdown-divider"></li>
                            <?php endif; ?>
                            <li>
                                <a class="dropdown-item text-danger fw-semibold" href="<?php echo SITE_URL; ?>logout.php">
                                    <i class="fas fa-sign-out-alt me-2"></i> Cerrar Sesión
                                </a>
                            </li>
                        </ul>
                    </li>
                </ul>
            </div>
        </div>
    </nav>
    <?php endif; ?>
    
    <div class="container-fluid px-3 px-md-4">
        <?php if ($flash = getFlash()): ?>
        <div class="alert alert-<?php echo $flash['tipo']; ?> alert-dismissible fade show shadow-sm" role="alert">
            <div class="d-flex align-items-center">
                <i class="fas <?php echo $flash['tipo'] == 'success' ? 'fa-check-circle' : ($flash['tipo'] == 'warning' ? 'fa-exclamation-triangle' : 'fa-info-circle'); ?> me-2 fs-5"></i>
                <div><?php echo $flash['mensaje']; ?></div>
            </div>
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        </div>
        <?php endif; ?>