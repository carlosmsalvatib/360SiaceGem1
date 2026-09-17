<?php
require_once '../../config/config.php';
require_once '../../config/database.php';

if (!isLoggedIn()) {
    redirect('login.php');
}

$db = Database::getInstance();
$error = '';

// Obtener lista de usuarios para asignar asesor
$usuarios = [];
$result = $db->query("SELECT id, nombre, rol FROM usuarios WHERE activo = 1 ORDER BY nombre");
if ($result) {
    while ($row = $result->fetch_assoc()) {
        $usuarios[] = $row;
    }
}

// Obtener catálogo de servicios para sugerencias
$serviciosCatalogo = [];
$resServ = $db->query("SELECT nombre FROM catalogo_servicios WHERE activo = 1 ORDER BY nombre");
if ($resServ) {
    while ($r = $resServ->fetch_assoc()) $serviciosCatalogo[] = $r['nombre'];
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $identificacion = sanitize($_POST['identificacion'] ?? '');
    $nombre_completo = sanitize($_POST['nombre_completo'] ?? '');
    $email = sanitize($_POST['email'] ?? '');
    $telefono = sanitize($_POST['telefono'] ?? '');
    $direccion = sanitize($_POST['direccion'] ?? '');
    $nombre_empresa = sanitize($_POST['nombre_empresa'] ?? '');
    $servicios_ofrecidos = sanitize($_POST['servicios_ofrecidos'] ?? '');
    $industria = sanitize($_POST['industria'] ?? '');
    $status = sanitize($_POST['status'] ?? 'prospecto');
    $usuario_id_creacion = intval($_POST['usuario_id_creacion'] ?? $_SESSION['usuario_id']);
    
    $errors = [];
    
    if (empty($nombre_completo)) $errors[] = "El nombre completo del emprendedor es obligatorio";
    if (empty($email)) $errors[] = "El correo electrónico es obligatorio";
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) $errors[] = "El correo electrónico no es válido";
    if (empty($status)) $errors[] = "El estado es obligatorio";
    
    // Verificar si el email ya existe
    if (empty($errors)) {
        $stmt = $db->prepare("SELECT id FROM clientes WHERE email = ?");
        $stmt->bind_param("s", $email);
        $stmt->execute();
        if ($stmt->get_result()->num_rows > 0) {
            $errors[] = "Ya existe un emprendedor registrado con este correo electrónico";
        }
    }
    
    if (empty($errors)) {
        $stmt = $db->prepare("
            INSERT INTO clientes (
                identificacion, nombre_completo, email, telefono, direccion, 
                nombre_empresa, servicios_ofrecidos, industria, status, usuario_id_creacion
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ");
        $stmt->bind_param("sssssssssi", 
            $identificacion, $nombre_completo, $email, $telefono, $direccion, 
            $nombre_empresa, $servicios_ofrecidos, $industria, $status, $usuario_id_creacion
        );
        
        if ($stmt->execute()) {
            $nuevo_id = $stmt->insert_id;
            setFlash('success', 'Emprendedor registrado exitosamente en el sistema.');
            redirect('modules/clientes/ver.php?id=' . $nuevo_id);
        } else {
            $error = "Error al registrar el emprendedor: " . $db->getConnection()->error;
        }
    } else {
        $error = implode("<br>", $errors);
    }
}

include '../../includes/header.php';
?>

<div class="row justify-content-center">
    <div class="col-lg-9">
        <div class="card shadow-sm fade-in">
            <div class="card-header bg-white py-3 d-flex justify-content-between align-items-center">
                <h5 class="mb-0 fw-bold" style="color: var(--c58-navy);">
                    <i class="fas fa-user-plus text-primary me-2"></i> Registrar Nuevo Emprendedor
                </h5>
                <a href="index.php" class="btn btn-outline-secondary btn-sm">
                    <i class="fas fa-arrow-left"></i> Volver a la Lista
                </a>
            </div>
            
            <div class="card-body p-4">
                <?php if ($error): ?>
                <div class="alert alert-danger alert-dismissible fade show">
                    <i class="fas fa-exclamation-circle me-1"></i> <?php echo $error; ?>
                    <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
                </div>
                <?php endif; ?>
                
                <form method="POST">
                    <div class="row">
                        <div class="col-md-4 mb-3">
                            <label class="form-label">Identificación (Cédula / RIF)</label>
                            <input type="text" name="identificacion" class="form-control" placeholder="Ej: V-18123456 ó J-40123456-0">
                        </div>
                        
                        <div class="col-md-8 mb-3">
                            <label class="form-label">Nombre Completo del Emprendedor <span class="text-danger">*</span></label>
                            <input type="text" name="nombre_completo" class="form-control" placeholder="Nombres y Apellidos" required>
                        </div>
                    </div>
                    
                    <div class="row">
                        <div class="col-md-6 mb-3">
                            <label class="form-label">Correo Electrónico <span class="text-danger">*</span></label>
                            <input type="email" name="email" class="form-control" placeholder="correo@ejemplo.com" required>
                        </div>
                        
                        <div class="col-md-6 mb-3">
                            <label class="form-label">Teléfono de Contacto / WhatsApp</label>
                            <input type="tel" name="telefono" class="form-control" placeholder="Ej: +58 (0414) 123-4567">
                        </div>
                    </div>
                    
                    <div class="row">
                        <div class="col-md-6 mb-3">
                            <label class="form-label">Nombre Comercial / Empresa / Marca</label>
                            <input type="text" name="nombre_empresa" class="form-control" placeholder="Nombre comercial del emprendimiento">
                        </div>
                        
                        <div class="col-md-6 mb-3">
                            <label class="form-label">Sector Industrial / Rubro</label>
                            <select name="industria" class="form-select">
                                <option value="">Seleccionar sector industrial...</option>
                                <option value="Tecnología">Tecnología & Software</option>
                                <option value="Comercio">Comercio & Retail</option>
                                <option value="Servicios">Servicios Profesionales</option>
                                <option value="Marketing">Marketing & Publicidad</option>
                                <option value="Alimentos">Alimentos & Gastronomía</option>
                                <option value="Salud">Salud & Bienestar</option>
                                <option value="Construcción">Construcción & Mantenimiento</option>
                                <option value="Educación">Educación & Formación</option>
                                <option value="Bienes Raíces">Bienes Raíces & Inmobiliario</option>
                                <option value="Otro">Otro Sector</option>
                            </select>
                        </div>
                    </div>
                    
                    <div class="mb-3">
                        <label class="form-label">Servicios y Productos que Ofrece (para el Directorio)</label>
                        <textarea name="servicios_ofrecidos" class="form-control" rows="2" 
                                  placeholder="Ej: Desarrollo de aplicaciones web, consultoría contable, diseño de marcas, suministro de alimentos..."></textarea>
                        <small class="text-muted">Esta información permitirá a clientes potenciales encontrar a este emprendedor en el Directorio.</small>
                    </div>
                    
                    <div class="row">
                        <div class="col-md-6 mb-3">
                            <label class="form-label">Estado Inicial del Emprendedor <span class="text-danger">*</span></label>
                            <select name="status" class="form-select" required>
                                <option value="prospecto">Prospecto (En evaluación)</option>
                                <option value="activo" selected>Activo (En gestión)</option>
                                <option value="en_consulta">En Consulta / Asesorías</option>
                                <option value="en_legalizacion">En Legalización / Formalización</option>
                                <option value="finalizado">Finalizado / Egresado</option>
                            </select>
                        </div>
                        
                        <div class="col-md-6 mb-3">
                            <label class="form-label">Asesor Asignado</label>
                            <select name="usuario_id_creacion" class="form-select select2">
                                <option value="">Sin asignar...</option>
                                <?php foreach ($usuarios as $usuario): ?>
                                <option value="<?php echo $usuario['id']; ?>" <?php echo ($usuario['id'] == $_SESSION['usuario_id']) ? 'selected' : ''; ?>>
                                    <?php echo htmlspecialchars($usuario['nombre'] . ' (' . ucfirst($usuario['rol']) . ')'); ?>
                                </option>
                                <?php endforeach; ?>
                            </select>
                        </div>
                    </div>
                    
                    <div class="mb-4">
                        <label class="form-label">Dirección Física / Ubicación Comercial</label>
                        <textarea name="direccion" class="form-control" rows="2" placeholder="Ciudad, municipio, dirección de oficina o taller..."></textarea>
                    </div>
                    
                    <div class="d-flex justify-content-end gap-2">
                        <a href="index.php" class="btn btn-secondary">
                            <i class="fas fa-times"></i> Cancelar
                        </a>
                        <button type="submit" class="btn btn-c58-teal">
                            <i class="fas fa-save"></i> Guardar Emprendedor
                        </button>
                    </div>
                </form>
            </div>
        </div>
    </div>
</div>

<?php include '../../includes/footer.php'; ?>