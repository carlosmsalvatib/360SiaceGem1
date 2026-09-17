<?php
// Script para limpiar archivos temporales (ejecutar vía cron)
require_once '../config/config.php';
require_once '../config/upload.php';

// Limpiar archivos temporales de más de 24 horas
$tempDir = UPLOAD_TEMPORALES;
$hours = 24;

if (is_dir($tempDir)) {
    $files = glob($tempDir . '*');
    $now = time();
    $deleted = 0;
    $totalSize = 0;
    
    foreach ($files as $file) {
        if (is_file($file)) {
            $fileAge = ($now - filemtime($file)) / 3600;
            if ($fileAge > $hours) {
                $totalSize += filesize($file);
                if (unlink($file)) {
                    $deleted++;
                }
            }
        }
    }
    
    echo "Limpieza completada:\n";
    echo "Archivos eliminados: $deleted\n";
    echo "Espacio liberado: " . formatFileSize($totalSize) . "\n";
} else {
    echo "Directorio temporal no encontrado\n";
}
?>