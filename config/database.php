<?php
// Configuración de la base de datos - Sistema Código-58

$isVercelEnv = !empty(getenv('VERCEL')) || !empty($_ENV['VERCEL']);

if (!defined('DB_HOST')) define('DB_HOST', getenv('DB_HOST') ?: (isset($_ENV['DB_HOST']) ? $_ENV['DB_HOST'] : ($isVercelEnv ? '45.79.40.132' : 'localhost')));
if (!defined('DB_USER')) define('DB_USER', getenv('DB_USER') ?: (isset($_ENV['DB_USER']) ? $_ENV['DB_USER'] : ($isVercelEnv ? 'siacecom_c58admin' : 'root')));
if (!defined('DB_PASS')) define('DB_PASS', getenv('DB_PASS') !== false ? getenv('DB_PASS') : (isset($_ENV['DB_PASS']) ? $_ENV['DB_PASS'] : ($isVercelEnv ? 'C58admin..' : 'Yocs14870')));
if (!defined('DB_NAME')) define('DB_NAME', getenv('DB_NAME') ?: (isset($_ENV['DB_NAME']) ? $_ENV['DB_NAME'] : ($isVercelEnv ? 'siacecom_codigo58' : 'consultoria_mof')));
if (!defined('DB_PORT')) define('DB_PORT', intval(getenv('DB_PORT') ?: (isset($_ENV['DB_PORT']) ? $_ENV['DB_PORT'] : 3306)));

// Soporte SSL para bases de datos en la nube (TiDB Cloud, Aiven, AWS RDS, etc.)
if (!defined('DB_SSL')) {
    $envSsl = getenv('DB_SSL') !== false ? getenv('DB_SSL') : (isset($_ENV['DB_SSL']) ? $_ENV['DB_SSL'] : null);
    if ($envSsl !== null) {
        define('DB_SSL', filter_var($envSsl, FILTER_VALIDATE_BOOLEAN));
    } else {
        $host = DB_HOST;
        $isCloudHost = (strpos($host, 'tidbcloud') !== false || strpos($host, 'aivencloud') !== false || DB_PORT == 4000);
        define('DB_SSL', $isCloudHost);
    }
}

// Clase para manejar la conexión
class Database {
    private static $instance = null;
    private $connection;
    
    private function __construct() {
        // Suprimir warning nativo de mysqli para manejarlo limpiamente
        mysqli_report(MYSQLI_REPORT_OFF);
        
        $this->connection = mysqli_init();
        if (!$this->connection) {
            $this->renderDatabaseError('No se pudo inicializar el driver MySQLi en PHP.');
            exit;
        }
        
        $flags = 0;
        if (DB_SSL) {
            $this->connection->ssl_set(NULL, NULL, NULL, NULL, NULL);
            if (defined('MYSQLI_OPT_SSL_VERIFY_SERVER_CERT')) {
                $this->connection->options(MYSQLI_OPT_SSL_VERIFY_SERVER_CERT, false);
            }
            $flags = MYSQLI_CLIENT_SSL;
        }
        
        $this->connection->options(MYSQLI_OPT_CONNECT_TIMEOUT, 10);
        
        $success = @$this->connection->real_connect(DB_HOST, DB_USER, DB_PASS, DB_NAME, DB_PORT, NULL, $flags);
        
        if (!$success || $this->connection->connect_error) {
            $errorMsg = $this->connection->connect_error ?: 'No fue posible establecer conexión con el servidor MySQL.';
            $this->renderDatabaseError($errorMsg);
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
                    <div class="alert alert-warning d-flex align-items-center mb-3">
                        <i class="fas fa-exclamation-triangle fs-4 me-3 text-warning"></i>
                        <div>
                            <strong>No se pudo conectar al servidor MySQL</strong><br>
                            <small class="text-muted"><?php echo htmlspecialchars($errorMsg); ?></small>
                        </div>
                    </div>

                    <div class="card bg-light border-0 mb-4 p-3 rounded-3 small">
                        <div class="fw-bold mb-2 text-dark"><i class="fas fa-info-circle text-primary me-1"></i> Diagnóstico de Parámetros Actuales:</div>
                        <div class="row g-2">
                            <div class="col-6"><strong>DB_HOST:</strong> <code><?php echo htmlspecialchars(DB_HOST); ?></code></div>
                            <div class="col-6"><strong>DB_PORT:</strong> <code><?php echo htmlspecialchars(DB_PORT); ?></code></div>
                            <div class="col-6"><strong>DB_USER:</strong> <code><?php echo htmlspecialchars(DB_USER); ?></code></div>
                            <div class="col-6"><strong>DB_NAME:</strong> <code><?php echo htmlspecialchars(DB_NAME); ?></code></div>
                            <div class="col-12"><strong>SSL / TLS:</strong> <code><?php echo DB_SSL ? 'Activado (Requerido para Cloud)' : 'Desactivado'; ?></code></div>
                        </div>
                    </div>

                    <?php if (strpos($errorMsg, 'Access denied') !== false): ?>
                    <div class="alert alert-warning py-2 px-3 small mb-3">
                        <i class="fas fa-key me-1"></i> <strong>Acceso Denegado por MySQL:</strong><br>
                        El servidor respondió exitosamente en <code><?php echo htmlspecialchars(DB_HOST); ?>:<?php echo htmlspecialchars(DB_PORT); ?></code>, pero el motor MySQL denegó el acceso al usuario <code><?php echo htmlspecialchars(DB_USER); ?></code>.<br>
                        <strong class="d-block mt-2">Verifica en tu cPanel:</strong>
                        <ol class="mb-0 mt-1 ps-3">
                            <li>En <strong>MySQL Remoto (Remote MySQL)</strong>: Añade <code>%</code> en el campo de host para autorizar conexiones externas.</li>
                            <li>En <strong>Bases de Datos MySQL</strong>: En la sección "Añadir usuario a la base de datos", asegúrate de que el usuario esté vinculado y con <strong>Todos los Privilegios</strong> marcados.</li>
                            <li>Verifica que la contraseña del usuario de base de datos coincida con la configurada.</li>
                        </ol>
                    </div>
                    <?php endif; ?>

                    <?php if ($isVercel || DB_HOST !== 'localhost'): ?>
                    <h5 class="fw-bold text-dark mb-2"><i class="fas fa-cloud me-2 text-teal" style="color: #008080;"></i>Paso para conectar tu Base de Datos en la Nube</h5>
                    <p class="text-muted small mb-3">
                        Vercel ejecuta la aplicación de forma <em>serverless</em>, por lo que requiere una base de datos MySQL en la nube. Configura las siguientes variables en <strong>Vercel &rarr; Project Settings &rarr; Environment Variables</strong>:
                    </p>
                    
                    <div class="code-box mb-3">
                        DB_HOST = [tu-servidor-mysql-en-la-nube]<br>
                        DB_USER = [tu-usuario-mysql]<br>
                        DB_PASS = [tu-contrasena-mysql]<br>
                        DB_NAME = [tu-base-de-datos]<br>
                        DB_PORT = 3306 (o 4000 para TiDB)<br>
                        DB_SSL  = true
                    </div>

                    <div class="accordion mb-4" id="optionsAccordion">
                        <div class="accordion-item border rounded mb-2">
                            <h2 class="accordion-header">
                                <button class="accordion-button collapsed py-2 small fw-bold" type="button" data-bs-toggle="collapse" data-bs-target="#opt1">
                                    <i class="fab fa-github text-dark me-2"></i> Opción A: TiDB Cloud Serverless (Recomendada, Gratis)
                                </button>
                            </h2>
                            <div id="opt1" class="accordion-collapse collapse" data-bs-parent="#optionsAccordion">
                                <div class="accordion-body small text-muted">
                                    1. Regístrate gratis en <a href="https://tidbcloud.com" target="_blank">tidbcloud.com</a> con tu cuenta GitHub.<br>
                                    2. Crea un cluster <strong>Serverless</strong> (gratuito, sin tarjeta de crédito).<br>
                                    3. En la pestaña <strong>SQL Editor</strong>, ejecuta el archivo <code>database.sql</code> de tu repositorio.<br>
                                    4. Pulsa <strong>Connect</strong> y copia el Host, Puerto (4000), Usuario y Contraseña en las Environment Variables de Vercel.
                                </div>
                            </div>
                        </div>
                        <div class="accordion-item border rounded">
                            <h2 class="accordion-header">
                                <button class="accordion-button collapsed py-2 small fw-bold" type="button" data-bs-toggle="collapse" data-bs-target="#opt2">
                                    <i class="fas fa-server text-secondary me-2"></i> Opción B: cPanel / Hosting de 360siace.com
                                </button>
                            </h2>
                            <div id="opt2" class="accordion-collapse collapse" data-bs-parent="#optionsAccordion">
                                <div class="accordion-body small text-muted">
                                    1. Entra a tu cPanel de <code>360siace.com</code> &rarr; Bases de Datos MySQL.<br>
                                    2. Crea la base de datos y usuario, e importa <code>database.sql</code> en phpMyAdmin.<br>
                                    3. En cPanel &rarr; <strong>MySQL Remoto</strong>, autoriza <code>%</code> para permitir accesos externos.<br>
                                    4. Coloca el host de tu servidor, usuario, clave y base de datos en Vercel.
                                </div>
                            </div>
                        </div>
                    </div>
                    <?php else: ?>
                    <h5 class="fw-bold text-dark mb-2"><i class="fas fa-server me-2 text-success"></i>Configuración Local</h5>
                    <p class="text-muted small">
                        Si estás en tu equipo local, asegúrate de que Apache y MySQL / MariaDB estén iniciados en el panel de XAMPP.
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