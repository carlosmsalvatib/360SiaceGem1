<?php
// Configuración de la base de datos
define('DB_HOST', 'localhost');
define('DB_USER', 'root');
define('DB_PASS', '');
define('DB_NAME', 'consultoria_mof');

// Clase para manejar la conexión
class Database {
    private static $instance = null;
    private $connection;
    
    private function __construct() {
        try {
            // Usar mysqli con opciones adicionales
            $this->connection = new mysqli(DB_HOST, DB_USER, DB_PASS, DB_NAME);
            
            // Verificar conexión
            if ($this->connection->connect_error) {
                throw new Exception("Error de conexión: " . $this->connection->connect_error);
            }
            
            // Configurar charset
            $this->connection->set_charset("utf8mb4");
            
            // Configurar opciones adicionales para evitar errores de autenticación
            $this->connection->options(MYSQLI_OPT_CONNECT_TIMEOUT, 5);
            
        } catch (Exception $e) {
            // Mostrar error más descriptivo
            die("Error de base de datos: " . $e->getMessage() . 
                "<br><br>Posibles soluciones:<br>
                1. Verifica que MySQL/MariaDB esté corriendo en XAMPP<br>
                2. En phpMyAdmin, ejecuta: ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY '';<br>
                3. Reinicia MySQL en XAMPP");
        }
    }
    
    public static function getInstance() {
        if (self::$instance == null) {
            self::$instance = new Database();
        }
        return self::$instance;
    }
    
    public function getConnection() {
        return $this->connection;
    }
    
    public function prepare($sql) {
        return $this->connection->prepare($sql);
    }
    
    public function query($sql) {
        return $this->connection->query($sql);
    }
    
    public function escapeString($str) {
        return $this->connection->real_escape_string($str);
    }
    
    public function getLastInsertId() {
        return $this->connection->insert_id;
    }
    
    public function close() {
        if ($this->connection) {
            $this->connection->close();
        }
    }
}
?>