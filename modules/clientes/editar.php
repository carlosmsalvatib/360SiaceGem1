<?php
require_once '../../config/config.php';
require_once '../../config/database.php';

if (!isLoggedIn()) {
    redirect('login.php');
}

$db = Database::getInstance();
$cliente_id = intval($_GET['id'] ?? 0);

if ($cliente_id <= 0) {
    setFlash('danger', 'ID de emprendedor no válido');
    redirect('modules/clientes/');
}

// Obtener información del emprendedor
$stmt = $db->prepare("SELECT * FROM clientes WHERE id = ?");
$stmt->bind_param("i", $cliente_id);
$stmt->execute();
$cliente = $stmt->get_result()->fetch_assoc();

if (!$cliente) {
    setFlash('danger', 'Emprendedor no encontrado');
    redirect('modules/clientes/');
}

// Obtener lista de usuarios
$usuarios = [];
$result = $db->query("SELECT id, nombre, rol FROM usuarios WHERE activo = 1 ORDER BY nombre");
if ($result) {
    while ($row = $result->fetch_assoc()) {
        $usuarios[] = $row;
    }
}

$error = '';

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
    $usuario_id_creacion = intval($_POST['usuario_id_creacion'] ?? $cliente['usuario_id_creacion']);
    
    $errors = [];
    
    if (empty($nombre_completo)) $errors[] = "El nombre completo del emprendedor es obligatorio";
    if (empty($email)) $errors[] = "El correo electrónico es obligatorio";
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) $errors[] = "El correo electrónico no es válido";
    if (empty($status)) $errors[] = "El estado es obligatorio";
    
    // Verificar si el email ya existe en otro registro
    if (empty($errors)) {
        $stmt = $db->prepare("SELECT id FROM clientes WHERE email = ? AND id != ?");
        $stmt->bind_param("si", $email, $cliente_id);
        $stmt->execute();
        if ($stmt->get_result()->num_rows > 0) {
            $errors[] = "Ya existe otro emprendedor registrado con este correo electrónico";
        }
    }
    
    if (empty($errors)) {
        $stmt = $db->prepare("
            UPDATE clientes SET
                identificacion = ?,
                nombre_completo = ?,
                email = ?,
                telefono = ?,
                direccion = ?,
                nombre_empresa = ?,
                servicios_ofrecidos = ?,
                industria = ?,
                status = ?,
                usuario_id_creacion = ?
            WHERE id = ?
        ");
        $stmt->bind_param("sssssssssii", 
            $identificacion, $nombre_completo, $email, $telefono, $direccion, 
            $nombre_empresa, $servicios_ofrecidos, $industria, $status, $usuario_id_creacion, $cliente_id
        );
        
        if ($stmt->execute()) {
            setFlash('success', 'Datos del emprendedor actualizados exitosamente');
            redirect('modules/clientes/ver.php?id=' . $cliente_id);
        } else {
            $error = "Error al actualizar: " . $db->getConnection()->error;
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
                    <i class="fas fa-user-edit text-warning me-2"></i> Editar Emprendedor #<?php echo $cliente_id; ?>
                </h5>
                <a href="ver.php?id=<?php echo $cliente_id; ?>" class="btn btn-outline-secondary btn-sm">
                    <i class="fas fa-arrow-left"></i> Volver a la Ficha
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
                            <input type="text" name="identificacion" class="form-control" 
                                   value="<?php echo htmlspecialchars($cliente['identificacion'] ?? ''); ?>" placeholder="Ej: V-18123456 ó J-40123456-0">
                        </div>
                        
                        <div class="col-md-8 mb-3">
                            <label class="form-label">Nombre Completo del Emprendedor <span class="text-danger">*</span></label>
                            <input type="text" name="nombre_completo" class="form-control" 
                                   value="<?php echo htmlspecialchars($cliente['nombre_completo']); ?>" required>
                        </div>
                    </div>
                    
                    <div class="row">
                        <div class="col-md-6 mb-3">
                            <label class="form-label">Correo Electrónico <span class="text-danger">*</span></label>
                            <input type="email" name="email" class="form-control" 
                                   value="<?php echo htmlspecialchars($cliente['email']); ?>" required>
                        </div>
                        
                        <div class="col-md-6 mb-3">
                            <label class="form-label">Teléfono de Contacto / WhatsApp</label>
                            <input type="tel" name="telefono" class="form-control" 
                                   value="<?php echo htmlspecialchars($cliente['telefono'] ?? ''); ?>">
                        </div>
                    </div>
                    
                    <div class="row">
                        <div class="col-md-6 mb-3">
                            <label class="form-label">Nombre Comercial / Empresa / Marca</label>
                            <input type="text" name="nombre_empresa" class="form-control" 
                                   value="<?php echo htmlspecialchars($cliente['nombre_empresa'] ?? ''); ?>">
                        </div>
                        
                        <div class="col-md-6 mb-3">
                            <label class="form-label">Sector Industrial / Rubro</label>
                            <select name="industria" class="form-select">
                                <option value="">Seleccionar sector industrial...</option>
                                <?php
                                $industrias = [
                                    'Tecnología', 'Comercio', 'Servicios', 'Marketing', 'Alimentos',
                                    'Salud', 'Construcción', 'Educación', 'Bienes Raíces', 'Otro'
                                ];
                                foreach ($industrias as $ind):
                                ?>
                                <option value="<?php echo $ind; ?>" <?php echo ($cliente['industria'] == $ind) ? 'selected' : ''; ?>>
                                    <?php echo $ind; ?>
                                </option>
                                <?php endforeach; ?>
                            </select>
                        </div>
                    </div>
                    
                    <div class="mb-3">
                        <label class="form-label">Servicios y Productos que Ofrece (para el Directorio)</label>
                        <textarea name="servicios_ofrecidos" class="form-control" rows="2"><?php echo htmlspecialchars($cliente['servicios_ofrecidos'] ?? ''); ?></textarea>
                    </div>
                    
                    <div class="row">
                        <div class="col-md-6 mb-3">
                            <label class="form-label">Estado del Emprendedor <span class="text-danger">*</span></label>
                            <select name="status" class="form-select" required>
                                <option value="prospecto" <?php echo ($cliente['status'] == 'prospecto') ? 'selected' : ''; ?>>Prospecto</option>
                                <option value="activo" <?php echo ($cliente['status'] == 'activo') ? 'selected' : ''; ?>>Activo</option>
                                <option value="en_consulta" <?php echo ($cliente['status'] == 'en_consulta') ? 'selected' : ''; ?>>En Consulta</option>
                                <option value="en_legalizacion" <?php echo ($cliente['status'] == 'en_legalizacion') ? 'selected' : ''; ?>>En Legalización</option>
                                <option value="finalizado" <?php echo ($cliente['status'] == 'finalizado') ? 'selected' : ''; ?>>Finalizado</option>
                            </select>
                        </div>
                        
                        <div class="col-md-6 mb-3">
                            <label class="form-label">Asesor Asignado</label>
                            <select name="usuario_id_creacion" class="form-select select2">
                                <option value="">Sin asignar...</option>
                                <?php foreach ($usuarios as $usuario): ?>
                                <option value="<?php echo $usuario['id']; ?>" <?php echo ($usuario['id'] == $cliente['usuario_id_creacion']) ? 'selected' : ''; ?>>
                                    <?php echo htmlspecialchars($usuario['nombre'] . ' (' . ucfirst($usuario['rol']) . ')'); ?>
                                </option>
                                <?php endforeach; ?>
                            </select>
                        </div>
                    </div>
                    
                    <div class="mb-4">
                        <label class="form-label">Dirección Física</label>
                        <textarea name="direccion" class="form-control" rows="2"><?php echo htmlspecialchars($cliente['direccion'] ?? ''); ?></textarea>
                    </div>
                    
                    <div class="d-flex justify-content-end gap-2">
                        <a href="ver.php?id=<?php echo $cliente_id; ?>" class="btn btn-secondary">
                            <i class="fas fa-times"></i> Cancelar
                        </a>
                        <button type="submit" class="btn btn-c58-teal">
                            <i class="fas fa-save"></i> Actualizar Emprendedor
                        </button>
                    </div>
                </form>
            </div>
        </div>
    </div>
</div>

<?php include '../../includes/footer.php'; ?>