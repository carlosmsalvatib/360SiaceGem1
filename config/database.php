<?php
// Configuración de la base de datos - Sistema Código-58

if (!defined('DB_HOST')) define('DB_HOST', getenv('DB_HOST') ?: (isset($_ENV['DB_HOST']) ? $_ENV['DB_HOST'] : 'localhost'));
if (!defined('DB_USER')) define('DB_USER', getenv('DB_USER') ?: (isset($_ENV['DB_USER']) ? $_ENV['DB_USER'] : 'root'));
if (!defined('DB_PASS')) define('DB_PASS', getenv('DB_PASS') !== false ? getenv('DB_PASS') : (isset($_ENV['DB_PASS']) ? $_ENV['DB_PASS'] : 'Yocs14870'));
if (!defined('DB_NAME')) define('DB_NAME', getenv('DB_NAME') ?: (isset($_ENV['DB_NAME']) ? $_ENV['DB_NAME'] : 'consultoria_mof'));
if (!defined('DB_PORT')) define('DB_PORT', intval(getenv('DB_PORT') ?: (isset($_ENV['DB_PORT']) ? $_ENV['DB_PORT'] : 3306)));

// Clase para manejar la conexión
class Database {
    private static $instance = null;
    private $connection;
    
    private function __construct() {
        // Suprimir warning nativo de mysqli para manejarlo con excepción limpia
        mysqli_report(MYSQLI_REPORT_OFF);
        
        $this->connection = @new mysqli(DB_HOST, DB_USER, DB_PASS, DB_NAME, DB_PORT);
        
        if ($this->connection->connect_error) {
            $this->renderDatabaseError($this->connection->connect_error);
            exit;
        }
        
        $this->connection->set_charset("utf8mb4");
    }
    
    private function renderDatabaseError($errorMsg) {
        $isVercel = !empty(getenv('VERCEL')) || !empty($_ENV['VERCEL']);
        http_response_code(503);
        ?>
        <!DOCTYPE html>
        <html lang="es">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Configuración de Base de Datos - Código-58</title>
            <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
            <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
            <style>
                body {
                    background: linear-gradient(135deg, #0F1126 0%, #161938 40%, #008080 100%);
                    min-height: 100vh;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-family: system-ui, -apple-system, sans-serif;
                    padding: 20px;
                }
                .setup-card {
                    background: #ffffff;
                    border-radius: 16px;
                    max-width: 620px;
                    width: 100%;
                    box-shadow: 0 25px 50px rgba(0,0,0,0.35);
                    overflow: hidden;
                    border-top: 5px solid #008080;
                }
                .card-header-c58 {
                    background: #161938;
                    color: white;
                    padding: 25px 30px;
                    text-align: center;
                }
                .code-box {
                    background: #0f172a;
                    color: #38bdf8;
                    padding: 15px;
                    border-radius: 8px;
                    font-family: monospace;
                    font-size: 0.85rem;
                }
            </style>
        </head>
        <body>
            <div class="setup-card">
                <div class="card-header-c58">
                    <h3 class="fw-bold mb-1"><i class="fas fa-database text-warning me-2"></i>Código-58</h3>
                    <p class="mb-0 text-light opacity-75">Configuración de Conexión a Base de Datos</p>
                </div>
                <div class="p-4 p-md-5">
                    <div class="alert alert-warning d-flex align-items-center mb-4">
                        <i class="fas fa-exclamation-triangle fs-4 me-3"></i>
                        <div>
                            <strong>No se pudo conectar a la base de datos MySQL</strong><br>
                            <small class="text-muted"><?php echo htmlspecialchars($errorMsg); ?> (Host intentado: <code><?php echo htmlspecialchars(DB_HOST); ?></code>)</small>
                        </div>
                    </div>

                    <?php if ($isVercel || DB_HOST !== 'localhost'): ?>
                    <h5 class="fw-bold text-dark mb-2"><i class="fas fa-cloud me-2 text-primary"></i>Configuración en Vercel</h5>
                    <p class="text-muted small">
                        Para habilitar la base de datos en la nube (ej. TiDB Serverless, Aiven, PlanetScale o cPanel MySQL), ingresa en tu panel de Vercel en <strong>Project Settings &rarr; Environment Variables</strong> y define:
                    </p>
                    <div class="code-box mb-4">
                        DB_HOST = [tu-servidor-mysql-en-la-nube]<br>
                        DB_USER = [tu-usuario-mysql]<br>
                        DB_PASS = [tu-contrasena-mysql]<br>
                        DB_NAME = [tu-base-de-datos]<br>
                        DB_PORT = 3306
                    </div>
                    <?php else: ?>
                    <h5 class="fw-bold text-dark mb-2"><i class="fas fa-server me-2 text-success"></i>Configuración Local</h5>
                    <p class="text-muted small">
                        Si estás en un entorno local, asegúrate de que MySQL / MariaDB esté iniciado en XAMPP o en tu servicio local.
                    </p>
                    <?php endif; ?>

                    <div class="d-grid gap-2">
                        <button onclick="location.reload()" class="btn btn-primary py-2 fw-semibold" style="background-color: #008080; border-color: #008080;">
                            <i class="fas fa-sync-alt me-2"></i> Reintentar Conexión
                        </button>
                    </div>
                </div>
            </div>
        </body>
        </html>
        <?php
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
}
?>