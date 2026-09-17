<?php
// Funciones para gestión de documentos legales
require_once 'upload.php';

// Función para subir documento legal
function uploadDocumentoLegal($file, $cliente_id, $tipo_documento, $descripcion = '') {
    $db = Database::getInstance();
    
    // Crear subdirectorio por cliente
    $subDir = "clientes/{$cliente_id}/";
    $targetDir = UPLOAD_DOCUMENTOS . $subDir;
    
    // Subir archivo
    $result = uploadFile($file, $targetDir, '', ['pdf', 'doc', 'docx', 'jpg', 'png']);
    
    if ($result['success']) {
        // Guardar en base de datos
        $stmt = $db->prepare("
            INSERT INTO documentos_legales (
                cliente_id, tipo_documento, nombre_archivo, 
                ruta_archivo, descripcion, usuario_id_subio, status
            ) VALUES (?, ?, ?, ?, ?, ?, 'pendiente_revision')
        ");
        $stmt->bind_param("issssi", 
            $cliente_id, 
            $tipo_documento, 
            $result['original_name'],
            $result['relative_path'],
            $descripcion,
            $_SESSION['usuario_id']
        );
        
        if ($stmt->execute()) {
            return [
                'success' => true,
                'documento_id' => $db->getLastInsertId(),
                'message' => 'Documento subido exitosamente'
            ];
        } else {
            // Eliminar archivo si falló la base de datos
            deleteFile($result['path']);
            return ['success' => false, 'error' => 'Error al guardar en la base de datos'];
        }
    }
    
    return $result;
}

// Función para obtener documentos de un cliente
function getDocumentosCliente($cliente_id, $status = null) {
    $db = Database::getInstance();
    
    $query = "
        SELECT d.*, u.nombre as usuario_nombre
        FROM documentos_legales d
        LEFT JOIN usuarios u ON d.usuario_id_subio = u.id
        WHERE d.cliente_id = ?
    ";
    
    if ($status) {
        $query .= " AND d.status = ?";
        $stmt = $db->prepare($query);
        $stmt->bind_param("is", $cliente_id, $status);
    } else {
        $stmt = $db->prepare($query);
        $stmt->bind_param("i", $cliente_id);
    }
    
    $stmt->execute();
    $result = $stmt->get_result();
    
    $documentos = [];
    while ($row = $result->fetch_assoc()) {
        $documentos[] = $row;
    }
    
    return $documentos;
}

// Función para obtener el tamaño total de documentos de un cliente
function getTotalDocumentosSize($cliente_id) {
    $db = Database::getInstance();
    
    $stmt = $db->prepare("
        SELECT SUM(f.size) as total_size
        FROM documentos_legales d
        JOIN files f ON d.archivo_id = f.id
        WHERE d.cliente_id = ?
    ");
    $stmt->bind_param("i", $cliente_id);
    $stmt->execute();
    $result = $stmt->get_result()->fetch_assoc();
    
    return $result['total_size'] ?? 0;
}
?>