<?php
require_once 'config/config.php';

// Limpiar todas las variables de sesión
$_SESSION = [];

// Destruir la cookie de sesión si existe
if (ini_get("session.use_cookies")) {
    $params = session_get_cookie_params();
    setcookie(session_name(), '', time() - 42000,
        $params["path"], $params["domain"],
        $params["secure"], $params["httponly"]
    );
}

// Destruir sesión
session_destroy();

// Iniciar nueva sesión temporal para mensaje flash de salida
session_start();
setFlash('info', 'Ha cerrado sesión exitosamente.');

// Redirigir al login
redirect('login.php');
exit();
?>
