<?php
// Configuración de subida de archivos

// Directorios base
if (!defined('UPLOAD_DIR')) {
    define('UPLOAD_DIR', ($_SERVER['DOCUMENT_ROOT'] ?? '') . '/consultoria_mof/uploads/');
}
if (!defined('UPLOAD_URL')) {
    define('UPLOAD_URL', '/consultoria_mof/uploads/');
}

// Subdirectorios
define('UPLOAD_DOCUMENTOS', UPLOAD_DIR . 'documentos/');
define('UPLOAD_COMPROBANTES', UPLOAD_DIR . 'comprobantes/');
define('UPLOAD_TEMPORALES', UPLOAD_DIR . 'temporales/');
define('UPLOAD_PERFILES', UPLOAD_DIR . 'perfiles/');

// Tipos de archivo permitidos
define('ALLOWED_EXTENSIONS', ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'jpg', 'jpeg', 'png', 'gif', 'txt', 'zip', 'rar']);
define('ALLOWED_MIME_TYPES', [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'image/jpeg',
    'image/png',
    'image/gif',
    'text/plain',
    'application/zip',
    'application/x-rar-compressed'
]);

// Tamaño máximo de archivo (10MB)
define('MAX_FILE_SIZE', 10485760);

// Función para crear directorios si no existen
function createUploadDirectories() {
    $dirs = [
        UPLOAD_DIR,
        UPLOAD_DOCUMENTOS,
        UPLOAD_COMPROBANTES,
        UPLOAD_TEMPORALES,
        UPLOAD_PERFILES
    ];
    
    foreach ($dirs as $dir) {
        if (!is_dir($dir)) {
            @mkdir($dir, 0755, true);
        }
    }
}

// Función para subir archivo
function uploadFile($file, $targetDir, $subDir = '', $allowedTypes = null, $maxSize = MAX_FILE_SIZE) {
    // Crear directorios si no existen
    createUploadDirectories();
    
    // Verificar errores
    if ($file['error'] !== UPLOAD_ERR_OK) {
        $errors = [
            UPLOAD_ERR_INI_SIZE => 'El archivo excede el tamaño máximo permitido por el servidor',
            UPLOAD_ERR_FORM_SIZE => 'El archivo excede el tamaño máximo permitido por el formulario',
            UPLOAD_ERR_PARTIAL => 'El archivo fue subido parcialmente',
            UPLOAD_ERR_NO_FILE => 'No se seleccionó ningún archivo',
            UPLOAD_ERR_NO_TMP_DIR => 'Falta la carpeta temporal',
            UPLOAD_ERR_CANT_WRITE => 'Error al escribir el archivo en el disco',
            UPLOAD_ERR_EXTENSION => 'Una extensión de PHP detuvo la subida del archivo'
        ];
        return ['success' => false, 'error' => $errors[$file['error']] ?? 'Error desconocido'];
    }
    
    // Verificar tamaño
    if ($file['size'] > $maxSize) {
        return ['success' => false, 'error' => 'El archivo excede el tamaño máximo permitido (' . formatFileSize($maxSize) . ')'];
    }
    
    // Obtener extensión
    $extension = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
    
    // Verificar extensión
    if ($allowedTypes === null) {
        $allowedTypes = ALLOWED_EXTENSIONS;
    }
    if (!in_array($extension, $allowedTypes)) {
        return ['success' => false, 'error' => 'Tipo de archivo no permitido. Extensiones permitidas: ' . implode(', ', $allowedTypes)];
    }
    
    // Verificar MIME type
    $finfo = finfo_open(FILEINFO_MIME_TYPE);
    $mimeType = finfo_file($finfo, $file['tmp_name']);
    finfo_close($finfo);
    
    if (!in_array($mimeType, ALLOWED_MIME_TYPES)) {
        return ['success' => false, 'error' => 'Tipo de archivo no permitido (MIME: ' . $mimeType . ')'];
    }
    
    // Generar nombre único
    $filename = date('Ymd_His') . '_' . uniqid() . '.' . $extension;
    
    // Crear directorio destino
    $targetPath = $targetDir;
    if ($subDir) {
        $targetPath .= $subDir . '/';
        if (!is_dir($targetPath)) {
            mkdir($targetPath, 0755, true);
        }
    }
    
    // Mover archivo
    $destination = $targetPath . $filename;
    if (move_uploaded_file($file['tmp_name'], $destination)) {
        // Obtener ruta relativa para la base de datos
        $relativePath = str_replace($_SERVER['DOCUMENT_ROOT'], '', $destination);
        
        return [
            'success' => true,
            'filename' => $filename,
            'original_name' => $file['name'],
            'path' => $destination,
            'relative_path' => $relativePath,
            'size' => $file['size'],
            'extension' => $extension,
            'mime_type' => $mimeType
        ];
    }
    
    return ['success' => false, 'error' => 'Error al mover el archivo al destino'];
}

// Función para eliminar archivo
function deleteFile($filePath) {
    if (file_exists($filePath) && is_file($filePath)) {
        return unlink($filePath);
    }
    return false;
}

// Función para formatear tamaño de archivo
function formatFileSize($bytes) {
    if ($bytes >= 1073741824) {
        return number_format($bytes / 1073741824, 2) . ' GB';
    } elseif ($bytes >= 1048576) {
        return number_format($bytes / 1048576, 2) . ' MB';
    } elseif ($bytes >= 1024) {
        return number_format($bytes / 1024, 2) . ' KB';
    } elseif ($bytes > 1) {
        return $bytes . ' bytes';
    } elseif ($bytes == 1) {
        return $bytes . ' byte';
    } else {
        return '0 bytes';
    }
}

// Función para obtener icono según tipo de archivo
function getFileIcon($extension) {
    $icons = [
        'pdf' => 'fa-file-pdf text-danger',
        'doc' => 'fa-file-word text-primary',
        'docx' => 'fa-file-word text-primary',
        'xls' => 'fa-file-excel text-success',
        'xlsx' => 'fa-file-excel text-success',
        'jpg' => 'fa-file-image text-info',
        'jpeg' => 'fa-file-image text-info',
        'png' => 'fa-file-image text-info',
        'gif' => 'fa-file-image text-info',
        'txt' => 'fa-file-alt text-secondary',
        'zip' => 'fa-file-archive text-warning',
        'rar' => 'fa-file-archive text-warning'
    ];
    
    return $icons[strtolower($extension)] ?? 'fa-file text-secondary';
}

// Función para limpiar archivos temporales antiguos (más de 24 horas)
function cleanTempFiles($hours = 24) {
    $tempDir = UPLOAD_TEMPORALES;
    if (is_dir($tempDir)) {
        $files = @glob($tempDir . '*');
        if ($files) {
            $now = time();
            foreach ($files as $file) {
                if (is_file($file) && ($now - filemtime($file)) > ($hours * 3600)) {
                    @unlink($file);
                }
            }
        }
    }
}
?>