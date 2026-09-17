<?php
// Script para crear la estructura de directorios de uploads
// Ejecutar una sola vez

$base_dir = __DIR__ . '/uploads/';

$directories = [
    'documentos/',
    'documentos/actas/',
    'documentos/estatutos/',
    'documentos/registros/',
    'documentos/otros/',
    'comprobantes/',
    'comprobantes/transferencias/',
    'comprobantes/facturas/',
    'comprobantes/recibos/',
    'temporales/',
    'perfiles/',
    'perfiles/clientes/'
];

echo "<h1>Creando estructura de directorios uploads</h1>";

foreach ($directories as $dir) {
    $full_path = $base_dir . $dir;
    if (!is_dir($full_path)) {
        if (mkdir($full_path, 0755, true)) {
            echo "<p style='color:green'>✅ Directorio creado: $dir</p>";
            
            // Crear archivo index.php en cada directorio
            $index_file = $full_path . 'index.php';
            if (!file_exists($index_file)) {
                file_put_contents($index_file, "<?php header('Location: ../index.php'); exit; ?>");
                echo "<p style='color:green'>✅ Archivo de seguridad creado: $dir/index.php</p>";
            }
        } else {
            echo "<p style='color:red'>❌ Error al crear directorio: $dir</p>";
        }
    } else {
        echo "<p style='color:blue'>ℹ️ Directorio ya existe: $dir</p>";
    }
}

// Crear archivo .htaccess para seguridad
$htaccess_content = "
# Prevenir listado de directorios
Options -Indexes

# Prevenir acceso a archivos PHP
<Files *.php>
    Order Deny,Allow
    Deny from all
</Files>

# Permitir acceso a archivos específicos
<FilesMatch \.(jpg|jpeg|png|gif|pdf|doc|docx|xls|xlsx|txt|zip|rar)$>
    Order Allow,Deny
    Allow from all
</FilesMatch>
";

$htaccess_file = $base_dir . '.htaccess';
if (!file_exists($htaccess_file)) {
    file_put_contents($htaccess_file, $htaccess_content);
    echo "<p style='color:green'>✅ Archivo .htaccess creado</p>";
}

echo "<h2>¡Estructura completada!</h2>";
echo "<p><a href='../index.php'>Volver al inicio</a></p>";
?>