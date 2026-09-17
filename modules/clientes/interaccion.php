<?php
require_once '../../config/config.php';
require_once '../../config/database.php';

if (!isLoggedIn()) {
    redirect('login.php');
}

$db = Database::getInstance();
$cliente_id = intval($_GET['id'] ?? 0);

if ($cliente_id == 0) {
    setFlash('danger', 'ID de emprendedor no válido');
    redirect('modules/clientes/');
}

// Verificar que el emprendedor existe
$stmt = $db->prepare("SELECT id, nombre_completo FROM clientes WHERE id = ?");
$stmt->bind_param("i", $cliente_id);
$stmt->execute();
$cliente = $stmt->get_result()->fetch_assoc();

if (!$cliente) {
    setFlash('danger', 'Emprendedor no encontrado');
    redirect('modules/clientes/');
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $tipo = sanitize($_POST['tipo']);
    $canal = sanitize($_POST['canal']);
    $descripcion = sanitize($_POST['descripcion']);
    $seguimiento = isset($_POST['seguimiento']) ? 1 : 0;
    
    $errors = [];
    
    if (empty($tipo)) $errors[] = "El tipo de interacción es obligatorio";
    if (empty($descripcion)) $errors[] = "La descripción es obligatoria";
    
    if (empty($errors)) {
        $stmt = $db->prepare("
            INSERT INTO interacciones (cliente_id, usuario_id, tipo, canal, descripcion, seguimiento) 
            VALUES (?, ?, ?, ?, ?, ?)
        ");
        $stmt->bind_param("iisssi", $cliente_id, $_SESSION['usuario_id'], $tipo, $canal, $descripcion, $seguimiento);
        
        if ($stmt->execute()) {
            setFlash('success', 'Interacción registrada exitosamente');
            redirect('modules/clientes/ver.php?id=' . $cliente_id);
        } else {
            $error = "Error al registrar la interacción: " . $db->getConnection()->error;
        }
    } else {
        $error = implode("<br>", $errors);
    }
}

include '../../includes/header.php';
?>

<div class="row justify-content-center">
    <div class="col-lg-8">
        <div class="card fade-in">
            <div class="card-header">
                <h5 class="mb-0">
                    <i class="fas fa-comment-plus me-2"></i> Registrar Interacción
                    <small class="text-muted ms-2">Emprendedor: <?php echo htmlspecialchars($cliente['nombre_completo']); ?></small>
                </h5>
            </div>
            <div class="card-body">
                <?php if (isset($error)): ?>
                <div class="alert alert-danger">
                    <i class="fas fa-exclamation-circle"></i> <?php echo $error; ?>
                </div>
                <?php endif; ?>
                
                <form method="POST">
                    <div class="row">
                        <div class="col-md-6 mb-3">
                            <label class="form-label fw-bold">Tipo de Interacción <span class="text-danger">*</span></label>
                            <select name="tipo" class="form-select" required>
                                <option value="">Seleccionar tipo...</option>
                                <option value="Llamada Telefónica">📞 Llamada Telefónica</option>
                                <option value="Correo Electrónico">📧 Correo Electrónico</option>
                                <option value="Reunión Presencial">🤝 Reunión Presencial</option>
                                <option value="Mensaje WhatsApp">💬 Mensaje WhatsApp</option>
                                <option value="Visita a Oficina">🏢 Visita a Oficina</option>
                                <option value="Otro">📝 Otro</option>
                            </select>
                        </div>
                        
                        <div class="col-md-6 mb-3">
                            <label class="form-label fw-bold">Canal de Comunicación</label>
                            <select name="canal" class="form-select">
                                <option value="">Seleccionar canal...</option>
                                <option value="Teléfono">Teléfono</option>
                                <option value="Email">Email</option>
                                <option value="WhatsApp">WhatsApp</option>
                                <option value="Presencial">Presencial</option>
                                <option value="Video Llamada">Video Llamada</option>
                                <option value="Otro">Otro</option>
                            </select>
                        </div>
                    </div>
                    
                    <div class="mb-3">
                        <label class="form-label fw-bold">Descripción de la Interacción <span class="text-danger">*</span></label>
                        <textarea name="descripcion" class="form-control" rows="4" 
                                  placeholder="Detalle de la conversación, acuerdos, compromisos, etc." required></textarea>
                    </div>
                    
                    <div class="mb-3 form-check">
                        <input type="checkbox" name="seguimiento" class="form-check-input" id="seguimiento">
                        <label class="form-check-label" for="seguimiento">
                            <i class="fas fa-bell"></i> Requiere seguimiento
                        </label>
                    </div>
                    
                    <div class="d-flex justify-content-end gap-2">
                        <a href="ver.php?id=<?php echo $cliente_id; ?>" class="btn btn-secondary">
                            <i class="fas fa-times"></i> Cancelar
                        </a>
                        <button type="submit" class="btn btn-c58-teal">
                            <i class="fas fa-save"></i> Guardar Interacción
                        </button>
                    </div>
                </form>
            </div>
        </div>
    </div>
</div>

<?php include '../../includes/footer.php'; ?>