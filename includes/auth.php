<?php
// Capa de control de acceso y autenticación - Sistema Código-58
require_once __DIR__ . '/../config/config.php';

if (!function_exists('requireLogin')) {
    function requireLogin() {
        if (!isLoggedIn()) {
            setFlash('danger', 'Debe iniciar sesión para acceder al sistema.');
            redirect('login.php');
        }
    }
}

if (!function_exists('requireRole')) {
    function requireRole($roles) {
        requireLogin();
        if (!hasRole($roles)) {
            setFlash('danger', 'No tiene permisos autorizados para acceder a esta sección.');
            redirect('index.php');
        }
    }
}
?>
