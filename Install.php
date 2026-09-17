<?php
// Script de instalación del sistema
echo "<h1>Instalación del Sistema Código-58</h1>";

// 1. Verificar conexión a base de datos
try {
    $conn = new mysqli('localhost', 'root', '');
    if ($conn->connect_error) {
        throw new Exception("Error de conexión: " . $conn->connect_error);
    }
    echo "<p style='color:green'>✅ Conexión a MySQL exitosa</p>";
    
    // 2. Crear base de datos
    $sql = file_get_contents('database.sql');
    if ($conn->multi_query($sql)) {
        do {
            // Consumir resultados
        } while ($conn->next_result());
        echo "<p style='color:green'>✅ Base de datos creada correctamente</p>";
    } else {
        echo "<p style='color:red'>❌ Error al crear base de datos: " . $conn->error . "</p>";
    }
    
    // 3. Crear directorios necesarios
    $dirs = [
        'uploads',
        'uploads/documentos',
        'uploads/comprobantes',
        'uploads/temporales'
    ];
    
    foreach ($dirs as $dir) {
        if (!is_dir($dir)) {
            mkdir($dir, 0777, true);
            echo "<p style='color:green'>✅ Directorio creado: $dir</p>";
        }
    }
    
    // 4. Verificar configuración
    echo "<h2>Verificación del sistema</h2>";
    echo "<ul>";
    echo "<li>PHP version: " . phpversion() . "</li>";
    echo "<li>MySQL version: " . $conn->server_info . "</li>";
    echo "<li>Servidor: " . $_SERVER['SERVER_SOFTWARE'] . "</li>";
    echo "</ul>";
    
    echo "<h2>¡Instalación completada!</h2>";
    echo "<p>Ahora puedes <a href='login.php'>iniciar sesión</a> con las siguientes credenciales:</p>";
    echo "<ul>";
    echo "<li>Email: admin@consultoria.com</li>";
    echo "<li>Contraseña: password</li>";
    echo "</ul>";
    
} catch (Exception $e) {
    echo "<p style='color:red'>❌ Error: " . $e->getMessage() . "</p>";
}

// Eliminar este archivo después de la instalación
echo "<p><small><strong>Importante:</strong> Elimina este archivo (install.php) por seguridad.</small></p>";
?>