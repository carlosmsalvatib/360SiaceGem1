<?php
require_once '../../config/config.php';
require_once '../../config/database.php';

if (!isLoggedIn() || !hasRole(['direccion', 'gestor_legal'])) {
    redirect('login.php');
}

$db = Database::getInstance();
$error = '';
$preselected_cliente = intval($_GET['cliente'] ?? $_GET['emprendedor'] ?? 0);

// Obtener emprendedores activos
$emprendedores = [];
$result = $db->query("SELECT id, nombre_completo, nombre_empresa FROM clientes WHERE status IN ('activo', 'en_consulta', 'en_legalizacion', 'prospecto') ORDER BY nombre_completo");
if ($result) {
    while ($row = $result->fetch_assoc()) {
        $emprendedores[] = $row;
    }
}

// Obtener gestores legales
$gestores = [];
$result = $db->query("SELECT id, nombre FROM usuarios WHERE rol IN ('gestor_legal', 'direccion') AND activo = 1 ORDER BY nombre");
if ($result) {
    while ($row = $result->fetch_assoc()) {
        $gestores[] = $row;
    }
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $cliente_id = intval($_POST['cliente_id'] ?? 0);
    $gestor_id = intval($_POST['gestor_id'] ?? 0);
    $tipo_proceso = sanitize($_POST['tipo_proceso'] ?? '');
    $nombre_comercial = sanitize($_POST['nombre_comercial'] ?? '');
    $documento_identidad = sanitize($_POST['documento_identidad'] ?? '');
    $estado = sanitize($_POST['estado'] ?? '');
    $observaciones = sanitize($_POST['observaciones'] ?? '');
    
    $errors = [];
    
    if (empty($cliente_id)) $errors[] = "Seleccione un emprendedor";
    if (empty($gestor_id)) $errors[] = "Seleccione un gestor legal responsable";
    if (empty($tipo_proceso)) $errors[] = "Seleccione el tipo de trámite legal";
    if (empty($nombre_comercial)) $errors[] = "Ingrese la denominación o nombre comercial";
    
    if (empty($errors)) {
        $stmt = $db->prepare("
            INSERT INTO procesos_legales (cliente_id, gestor_id, tipo_proceso, nombre_comercial, documento_identidad, estado, observaciones, status) 
            VALUES (?, ?, ?, ?, ?, ?, ?, 'pendiente')
        ");
        $stmt->bind_param("iisssss", $cliente_id, $gestor_id, $tipo_proceso, $nombre_comercial, $documento_identidad, $estado, $observaciones);
        
        if ($stmt->execute()) {
            $nuevo_proceso_id = $stmt->insert_id;
            
            // Actualizar estado del emprendedor a 'en_legalizacion'
            $stmt2 = $db->prepare("UPDATE clientes SET status = 'en_legalizacion' WHERE id = ?");
            $stmt2->bind_param("i", $cliente_id);
            $stmt2->execute();
            
            setFlash('success', 'Trámite legal iniciado exitosamente.');
            redirect('modules/legales/ver.php?id=' . $nuevo_proceso_id);
        } else {
            $error = "Error al crear el trámite: " . $db->getConnection()->error;
        }
    } else {
        $error = implode("<br>", $errors);
    }
}

include '../../includes/header.php';
?>

<div class="row justify-content-center">
    <div class="col-lg-8">
        <div class="card shadow-sm fade-in">
            <div class="card-header bg-white py-3 d-flex justify-content-between align-items-center">
                <h5 class="mb-0 fw-bold" style="color: var(--c58-navy);">
                    <i class="fas fa-gavel text-warning me-2"></i> Iniciar Nuevo Trámite Legal
                </h5>
                <a href="index.php" class="btn btn-outline-secondary btn-sm">
                    <i class="fas fa-arrow-left"></i> Volver
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
                        <div class="col-md-6 mb-3">
                            <label class="form-label">Emprendedor <span class="text-danger">*</span></label>
                            <select name="cliente_id" class="form-select select2" required>
                                <option value="">Seleccionar emprendedor...</option>
                                <?php foreach ($emprendedores as $emp): ?>
                                <option value="<?php echo $emp['id']; ?>" <?php echo ($emp['id'] == $preselected_cliente) ? 'selected' : ''; ?>>
                                    <?php echo htmlspecialchars($emp['nombre_completo'] . ' - ' . ($emp['nombre_empresa'] ?? 'Sin empresa')); ?>
                                </option>
                                <?php endforeach; ?>
                            </select>
                        </div>
                        
                        <div class="col-md-6 mb-3">
                            <label class="form-label">Gestor Legal Responsable <span class="text-danger">*</span></label>
                            <select name="gestor_id" class="form-select select2" required>
                                <option value="">Seleccionar gestor...</option>
                                <?php foreach ($gestores as $gestor): ?>
                                <option value="<?php echo $gestor['id']; ?>" <?php echo ($gestor['id'] == $_SESSION['usuario_id']) ? 'selected' : ''; ?>>
                                    <?php echo htmlspecialchars($gestor['nombre']); ?>
                                </option>
                                <?php endforeach; ?>
                            </select>
                        </div>
                    </div>
                    
                    <div class="row">
                        <div class="col-md-6 mb-3">
                            <label class="form-label">Tipo de Proceso / Trámite <span class="text-danger">*</span></label>
                            <select name="tipo_proceso" class="form-select" required>
                                <option value="">Seleccionar tipo de trámite...</option>
                                <option value="Constitución de Empresa">Constitución de Empresa / Compañía Anónima</option>
                                <option value="Registro Mercantil">Registro Mercantil y Publicación</option>
                                <option value="Identificación Fiscal">Tramitación de RIF / Identificación Fiscal</option>
                                <option value="Licencia de Funcionamiento">Licencia de Actividades Económicas</option>
                                <option value="Modificación Estatutaria">Modificación de Estatutos / Asambleas</option>
                                <option value="Registro de Marca">Registro de Marca y Propiedad Intelectual</option>
                                <option value="Contrato Laboral / Mercantil">Contratos Laborales o Mercantiles</option>
                            </select>
                        </div>
                        
                        <div class="col-md-6 mb-3">
                            <label class="form-label">Denominación / Razón Comercial <span class="text-danger">*</span></label>
                            <input type="text" name="nombre_comercial" class="form-control" placeholder="Ej: Inversiones Código Cinco Ocho, C.A." required>
                        </div>
                    </div>
                    
                    <div class="row">
                        <div class="col-md-6 mb-3">
                            <label class="form-label">Documento de Identificación del Emprendedor</label>
                            <input type="text" name="documento_identidad" class="form-control" placeholder="RIF, Cédula de Identidad, Pasaporte">
                        </div>
                        
                        <div class="col-md-6 mb-3">
                            <label class="form-label">Jurisdicción / Registro Mercantil</label>
                            <input type="text" name="estado" class="form-control" placeholder="Ej: Registro Mercantil Primero de Caracas">
                        </div>
                    </div>
                    
                    <div class="mb-4">
                        <label class="form-label">Observaciones e Instrucciones Iniciales</label>
                        <textarea name="observaciones" class="form-control" rows="3" placeholder="Requisitos entregados, datos de los socios, capital social inicial..."></textarea>
                    </div>
                    
                    <div class="d-flex justify-content-end gap-2">
                        <a href="index.php" class="btn btn-secondary">
                            <i class="fas fa-times"></i> Cancelar
                        </a>
                        <button type="submit" class="btn btn-c58-teal">
                            <i class="fas fa-save"></i> Iniciar Proceso Legal
                        </button>
                    </div>
                </form>
            </div>
        </div>
    </div>
</div>

<?php include '../../includes/footer.php'; ?>