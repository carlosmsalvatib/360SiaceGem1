<?php
require_once 'config/config.php';
require_once 'config/database.php';

if (isLoggedIn()) {
    redirect('index.php');
}

$error = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $email = sanitize($_POST['email'] ?? '');
    $password = $_POST['password'] ?? '';
    
    if (empty($email) || empty($password)) {
        $error = 'Todos los campos son obligatorios';
    } else {
        $db = Database::getInstance();
        $stmt = $db->prepare("SELECT id, nombre, email, password, rol FROM usuarios WHERE email = ? AND activo = 1");
        $stmt->bind_param("s", $email);
        $stmt->execute();
        $result = $stmt->get_result();
        
        if ($user = $result->fetch_assoc()) {
            if (password_verify($password, $user['password'])) {
                $_SESSION['usuario_id'] = $user['id'];
                $_SESSION['nombre'] = $user['nombre'];
                $_SESSION['email'] = $user['email'];
                $_SESSION['rol'] = $user['rol'];
                
                // Actualizar último acceso
                $stmt = $db->prepare("UPDATE usuarios SET ultimo_acceso = NOW() WHERE id = ?");
                $stmt->bind_param("i", $user['id']);
                $stmt->execute();
                
                redirect('index.php');
            } else {
                $error = 'Contraseña incorrecta';
            }
        } else {
            $error = 'Usuario no encontrado o inactivo';
        }
    }
}
?>
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Acceso al Sistema - Código-58</title>
    
    <!-- Favicon Oficial Código-58 -->
    <link rel="icon" type="image/png" href="<?php echo SITE_URL; ?>assets/img/favicon.png">
    
    <!-- Bootstrap 5 CSS -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <!-- Font Awesome 6 -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    
    <style>
        :root {
            --c58-navy: #161938;
            --c58-teal: #008080;
            --c58-amber: #F59E0B;
            --c58-violet: #4A154B;
        }
        
        body {
            background: linear-gradient(135deg, #0F1126 0%, #161938 35%, #0B4B4B 75%, #008080 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
            padding: 20px;
        }
        
        .login-card {
            background: #FFFFFF;
            border-radius: 20px;
            box-shadow: 0 25px 50px -12px rgba(15, 17, 38, 0.45);
            padding: 40px 35px;
            width: 100%;
            max-width: 440px;
            border-top: 5px solid var(--c58-teal);
            position: relative;
        }
        
        .login-header {
            text-align: center;
            margin-bottom: 25px;
        }
        
        .login-logo {
            max-height: 85px;
            width: auto;
            margin-bottom: 12px;
            filter: drop-shadow(0 3px 6px rgba(0,0,0,0.12));
        }
        
        .login-header h2 {
            color: var(--c58-navy);
            font-weight: 800;
            font-size: 1.6rem;
            letter-spacing: -0.5px;
            margin-bottom: 4px;
        }
        
        .login-header p {
            color: #64748B;
            font-size: 0.9rem;
            margin-bottom: 0;
        }
        
        .form-control {
            border-radius: 10px;
            padding: 12px 15px;
            border: 1px solid #CBD5E1;
        }
        
        .form-control:focus {
            border-color: var(--c58-teal);
            box-shadow: 0 0 0 3px rgba(0, 128, 128, 0.2);
        }
        
        .input-group-text {
            border-radius: 10px 0 0 10px;
            border: 1px solid #CBD5E1;
            background-color: #F8FAFC;
            color: #64748B;
        }
        
        .btn-login {
            background: linear-gradient(135deg, var(--c58-teal) 0%, #006666 100%);
            border: none;
            border-radius: 10px;
            padding: 12px;
            font-weight: 700;
            font-size: 1rem;
            width: 100%;
            color: white;
            transition: all 0.3s ease;
            box-shadow: 0 4px 12px rgba(0, 128, 128, 0.3);
        }
        
        .btn-login:hover {
            background: linear-gradient(135deg, #009999 0%, var(--c58-teal) 100%);
            transform: translateY(-2px);
            box-shadow: 0 6px 18px rgba(0, 128, 128, 0.4);
            color: white;
        }
        
        .credentials {
            background: #F1F5F9;
            border-radius: 12px;
            padding: 14px 16px;
            margin-top: 25px;
            font-size: 13px;
            border: 1px solid #E2E8F0;
        }
    </style>
</head>
<body>
    <div class="login-card">
        <div class="login-header">
            <img src="<?php echo SITE_URL; ?>assets/img/logo.png" alt="Código-58" class="login-logo">
            <h2>Código-58</h2>
            <p>Sistema de Gestión para Emprendedores</p>
        </div>
        
        <?php if ($flash = getFlash()): ?>
        <div class="alert alert-<?php echo $flash['tipo']; ?> alert-dismissible fade show mb-3">
            <i class="fas fa-info-circle me-1"></i> <?php echo $flash['mensaje']; ?>
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        </div>
        <?php endif; ?>
        
        <?php if ($error): ?>
        <div class="alert alert-danger alert-dismissible fade show mb-3">
            <i class="fas fa-exclamation-circle me-1"></i> <?php echo $error; ?>
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        </div>
        <?php endif; ?>
        
        <form method="POST">
            <div class="mb-3">
                <label class="form-label fw-bold small text-secondary">Correo Electrónico</label>
                <div class="input-group">
                    <span class="input-group-text"><i class="fas fa-envelope"></i></span>
                    <input type="email" name="email" class="form-control" placeholder="admin@consultoria.com" required autofocus>
                </div>
            </div>
            
            <div class="mb-4">
                <label class="form-label fw-bold small text-secondary">Contraseña</label>
                <div class="input-group">
                    <span class="input-group-text"><i class="fas fa-lock"></i></span>
                    <input type="password" name="password" class="form-control" placeholder="••••••••" required>
                </div>
            </div>
            
            <button type="submit" class="btn btn-login">
                <i class="fas fa-sign-in-alt me-2"></i> Iniciar Sesión
            </button>
        </form>
        
        <div class="credentials">
            <div class="text-muted text-center mb-2 fw-semibold">
                <i class="fas fa-key text-warning me-1"></i> Credenciales de demostración:
            </div>
            <div class="row g-1 text-center">
                <div class="col-12 mb-1">
                    <span class="badge bg-light text-dark border">admin@consultoria.com</span>
                </div>
                <div class="col-12">
                    <span class="badge bg-light text-muted border">password</span>
                </div>
            </div>
        </div>
    </div>
    
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
</body>
</html>