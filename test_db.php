<?php
$conn = new mysqli('localhost', 'root', 'Yocs14870', 'consultoria_mof');

if ($conn->connect_error) {
    die("❌ Error de conexión: " . $conn->connect_error);
}

echo "✅ Conexión exitosa a la base de datos!";
$conn->close();
?>