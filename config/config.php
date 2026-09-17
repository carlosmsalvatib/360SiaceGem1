<?php
// Habilitar almacenamiento en buffer de salida para evitar "headers already sent"
if (!ob_get_level()) {
    ob_start();
}

$isVercel = !empty(getenv('VERCEL')) || !empty($_ENV['VERCEL']) || isset($_SERVER['LAMBDA_TASK_ROOT']) || isset($_SERVER['VERCEL']);

// En entornos serverless como Vercel, asegurar ruta de sesiones en /tmp y control de errores
if ($isVercel) {
    if (is_dir('/tmp')) {
        @ini_set('session.save_path', '/tmp');
    }
    error_reporting(E_ALL & ~E_NOTICE & ~E_DEPRECATED & ~E_WARNING);
    ini_set('display_errors', 0);
    ini_set('log_errors', 1);
} else {
    error_reporting(E_ALL);
    ini_set('display_errors', 1);
}

if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

// Configuración de zona horaria
date_default_timezone_set('America/Caracas');

// Detección dinámica de URL y directorio base
$protocol = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off' || ($_SERVER['SERVER_PORT'] ?? 80) == 443) ? "https://" : "http://";
$host = $_SERVER['HTTP_HOST'] ?? 'localhost';

// Determinar el path base relativo al documento raíz
$scriptName = str_replace('\\', '/', $_SERVER['SCRIPT_NAME'] ?? '');
$scriptDir = dirname($scriptName);

// Extraer el prefijo del proyecto (ej: /consultoria_mof/ o /C-58/ o /)
$baseFolder = '';
if (preg_match('#^/([^/]+)/#', $scriptName, $matches)) {
    // Si estamos dentro de una subcarpeta como /consultoria_mof/ o /C-58/
    $firstFolder = $matches[1];
    if (in_array(strtolower($firstFolder), ['consultoria_mof', 'c-58'])) {
        $baseFolder = '/' . $firstFolder . '/';
    }
}

if (empty($baseFolder)) {
    // Si se ejecuta en la raíz de un virtual host o servidor de pruebas
    $docRoot = rtrim(str_replace('\\', '/', $_SERVER['DOCUMENT_ROOT'] ?? ''), '/');
    if (file_exists($docRoot . '/Index.php') || file_exists($docRoot . '/index.php')) {
        $baseFolder = '/';
    } else {
        $baseFolder = '/consultoria_mof/';
    }
}

// Constantes del sistema Código-58
define('SITE_NAME', 'Sistema de Gestión Código-58');
define('SITE_VERSION', '2.0');
define('SITE_URL', $protocol . $host . $baseFolder);

// Directorios de uploads
$docRoot = rtrim(str_replace('\\', '/', $_SERVER['DOCUMENT_ROOT'] ?? __DIR__ . '/..'), '/');
if ($isVercel) {
    define('UPLOAD_DIR', '/tmp/uploads/');
} else {
    define('UPLOAD_DIR', $docRoot . $baseFolder . 'uploads/');
}
define('UPLOAD_URL', SITE_URL . 'uploads/');

// Incluir archivos de base de datos y utilidades
require_once __DIR__ . '/database.php';
require_once __DIR__ . '/uploads.php';
if (file_exists(__DIR__ . '/../includes/functions.php')) {
    require_once __DIR__ . '/../includes/functions.php';
}

// Verificar si el usuario está autenticado
function isLoggedIn() {
    return isset($_SESSION['usuario_id']) && isset($_SESSION['rol']);
}

// Función para verificar roles de acceso
function hasRole($roles) {
    if (!isLoggedIn()) return false;
    if (!is_array($roles)) $roles = [$roles];
    return in_array($_SESSION['rol'], $roles);
}

// Función para redirigir
function redirect($url) {
    if (strpos($url, 'http://') === 0 || strpos($url, 'https://') === 0) {
        header("Location: " . $url);
    } else {
        header("Location: " . SITE_URL . ltrim($url, '/'));
    }
    exit();
}

// Mensajes flash
function setFlash($tipo, $mensaje) {
    $validTipos = ['success', 'danger', 'warning', 'info', 'primary', 'secondary'];
    if (in_array($mensaje, $validTipos) && !in_array($tipo, $validTipos)) {
        $temp = $tipo;
        $tipo = $mensaje;
        $mensaje = $temp;
    }
    $_SESSION['flash'] = [
        'tipo' => $tipo,
        'mensaje' => $mensaje
    ];
}

function getFlash() {
    if (isset($_SESSION['flash'])) {
        $flash = $_SESSION['flash'];
        unset($_SESSION['flash']);
        return $flash;
    }
    return null;
}

// Sanitizar entradas
function sanitize($input) {
    if (is_array($input)) {
        return array_map('sanitize', $input);
    }
    return htmlspecialchars(strip_tags(trim($input ?? '')), ENT_QUOTES, 'UTF-8');
}

// Generar número de contrato único
function generarNumeroContrato() {
    return 'C58-' . date('Ymd') . '-' . rand(1000, 9999);
}
?>