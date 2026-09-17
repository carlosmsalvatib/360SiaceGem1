<?php
// Universal Serverless Router para Vercel - Sistema Código-58
if (!ob_get_level()) {
    ob_start();
}

$requestUri = $_SERVER['REQUEST_URI'] ?? '/';
$parsedUrl  = parse_url($requestUri);
$path       = $parsedUrl['path'] ?? '/';

if (!isset($_SERVER['REQUEST_METHOD'])) {
    $_SERVER['REQUEST_METHOD'] = 'GET';
}

$projectRoot = realpath(__DIR__ . '/..');
$path = ltrim($path, '/');

// Enrutamiento de archivo objetivo
if (empty($path) || $path === 'index.php') {
    $targetFile = $projectRoot . '/Index.php';
} else {
    if (is_dir($projectRoot . '/' . $path)) {
        $targetFile = $projectRoot . '/' . rtrim($path, '/') . '/index.php';
    } else {
        $targetFile = $projectRoot . '/' . $path;
    }
}

// Manejo de recursos estáticos si se solicitan a través del router
if (file_exists($targetFile) && !is_dir($targetFile)) {
    $ext = strtolower(pathinfo($targetFile, PATHINFO_EXTENSION));
    $mimeTypes = [
        'css'   => 'text/css; charset=UTF-8',
        'js'    => 'application/javascript; charset=UTF-8',
        'png'   => 'image/png',
        'jpg'   => 'image/jpeg',
        'jpeg'  => 'image/jpeg',
        'gif'   => 'image/gif',
        'svg'   => 'image/svg+xml',
        'ico'   => 'image/x-icon',
        'woff'  => 'font/woff',
        'woff2' => 'font/woff2',
        'ttf'   => 'font/ttf',
        'pdf'   => 'application/pdf',
        'csv'   => 'text/csv; charset=UTF-8'
    ];

    if (isset($mimeTypes[$ext])) {
        header('Content-Type: ' . $mimeTypes[$ext]);
        header('Cache-Control: public, max-age=86400');
        readfile($targetFile);
        exit;
    }
}

// Ejecución del script PHP objetivo
if (file_exists($targetFile) && is_file($targetFile)) {
    $_SERVER['SCRIPT_FILENAME'] = $targetFile;
    $_SERVER['SCRIPT_NAME'] = '/' . ltrim(str_replace('\\', '/', str_replace($projectRoot, '', $targetFile)), '/');
    $_SERVER['PHP_SELF'] = $_SERVER['SCRIPT_NAME'];
    $_SERVER['DOCUMENT_ROOT'] = $projectRoot;

    // Cambiar al directorio del script para compatibilidad total con includes relativos
    chdir(dirname($targetFile));

    require $targetFile;
    exit;
}

// Recurso 404 amigable
http_response_code(404);
?>
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Recurso no encontrado - Código-58</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <style>
        body {
            background: linear-gradient(135deg, #0F1126 0%, #161938 50%, #008080 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            font-family: system-ui, -apple-system, sans-serif;
            padding: 20px;
        }
        .error-card {
            background: #ffffff;
            border-radius: 16px;
            padding: 40px;
            max-width: 480px;
            width: 100%;
            text-align: center;
            box-shadow: 0 20px 40px rgba(0,0,0,0.3);
            border-top: 4px solid #008080;
        }
    </style>
</head>
<body>
    <div class="error-card">
        <h1 class="display-3 fw-bold text-danger mb-0">404</h1>
        <h4 class="fw-bold text-dark mt-2">Página no encontrada</h4>
        <p class="text-muted small mb-4">El recurso solicitado no existe o fue reubicado en el sistema Código-58.</p>
        <a href="/" class="btn text-white w-100 py-2 fw-semibold" style="background-color: #008080;">
            Volver al Panel Principal
        </a>
    </div>
</body>
</html>
