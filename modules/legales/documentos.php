<?php
require_once '../../config/config.php';
require_once '../../config/database.php';
require_once '../../config/upload.php';

if (!isLoggedIn()) {
    redirect('login.php');
}

$db = Database::getInstance();
$proceso_id = intval($_GET['id'] ?? 0);

if ($proceso_id <= 0) {
    redirect('modules/legales/');
}

// Obtener información del proceso
$stmt = $db->prepare("
    SELECT p.*, c.nombre_completo as emprendedor_nombre, c.nombre_empresa 
    FROM procesos_legales p
    JOIN clientes c ON p.cliente_id = c.id
    WHERE p.id = ?
");
$stmt->bind_param("i", $proceso_id);
$stmt->execute();
$proceso = $stmt->get_result()->fetch_assoc();

if (!$proceso) {
    setFlash('danger', 'Proceso legal no encontrado');
    redirect('modules/legales/');
}

// Procesar subida de documentos
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_FILES['documento'])) {
    $tipo_documento = sanitize($_POST['tipo_documento'] ?? '');
    $observaciones = sanitize($_POST['observaciones'] ?? '');
    
    if ($tipo_documento && $_FILES['documento']['error'] == UPLOAD_ERR_OK) {
        $result = uploadFile($_FILES['documento'], UPLOAD_DOCUMENTOS, 'procesos/' . $proceso_id, ['pdf', 'doc', 'docx', 'jpg', 'png', 'txt']);
        
        if ($result['success']) {
            $stmt = $db->prepare("
                INSERT INTO documentos_legales (proceso_legal_id, tipo_documento, nombre_archivo, ruta_archivo, usuario_id_subio, status) 
                VALUES (?, ?, ?, ?, ?, 'pendiente_revision')
            ");
            $nombre_archivo = $_FILES['documento']['name'];
            $stmt->bind_param("isssi", $proceso_id, $tipo_documento, $nombre_archivo, $result['relative_path'], $_SESSION['usuario_id']);
            
            if ($stmt->execute()) {
                setFlash('success', 'Documento subido exitosamente al expediente');
            } else {
                setFlash('danger', 'Error al guardar el documento en la base de datos');
                deleteFile($result['path']);
            }
        } else {
            setFlash('danger', $result['error']);
        }
    } else {
        setFlash('danger', 'Por favor seleccione un archivo válido');
    }
    redirect("modules/legales/documentos.php?id=$proceso_id");
}

// Obtener documentos del proceso
$documentos = [];
$stmt = $db->prepare("
    SELECT d.*, u.nombre as usuario_nombre 
    FROM documentos_legales d
    LEFT JOIN usuarios u ON d.usuario_id_subio = u.id
    WHERE d.proceso_legal_id = ?
    ORDER BY d.fecha_subida DESC
");
$stmt->bind_param("i", $proceso_id);
$stmt->execute();
$result = $stmt->get_result();
while ($row = $result->fetch_assoc()) {
    $documentos[] = $row;
}

include '../../includes/header.php';
?>

<div class="row">
    <div class="col-12">
        <div class="card shadow-sm fade-in">
            <div class="card-header bg-white py-3 d-flex justify-content-between align-items-center">
                <h5 class="mb-0 fw-bold" style="color: var(--c58-navy);">
                    <i class="fas fa-folder-open text-warning me-2"></i> Gestión Documental del Trámite #<?php echo $proceso_id; ?>
                    <span class="text-muted fw-normal fs-6 ms-2">&bull; <?php echo htmlspecialchars($proceso['emprendedor_nombre']); ?> (<?php echo htmlspecialchars($proceso['nombre_comercial'] ?: 'Sin nombre'); ?>)</span>
                </h5>
                <div>
                    <a href="ver.php?id=<?php echo $proceso_id; ?>" class="btn btn-outline-secondary btn-sm">
                        <i class="fas fa-arrow-left"></i> Volver a la Ficha
                    </a>
                </div>
            </div>
            <div class="card-body p-4">
                <!-- Formulario de subida -->
                <div class="p-3 bg-light rounded border mb-4">
                    <h6 class="fw-bold mb-3 text-secondary"><i class="fas fa-upload me-1"></i> Subir Nuevo Documento al Expediente</h6>
                    <form method="POST" enctype="multipart/form-data" class="row g-3">
                        <div class="col-md-4">
                            <label class="form-label small fw-bold">Tipo de Documento <span class="text-danger">*</span></label>
                            <select name="tipo_documento" class="form-select" required>
                                <option value="">Seleccionar tipo...</option>
                                <option value="Acta Constitutiva">Acta Constitutiva</option>
                                <option value="Estatutos Sociales">Estatutos Sociales</option>
                                <option value="Registro Mercantil">Publicación / Registro Mercantil</option>
                                <option value="RIF / Identificación Fiscal">RIF / Identificación Fiscal</option>
                                <option value="Licencia / Patente">Licencia / Patente Comercial</option>
                                <option value="Cédula / Documento Identidad">Cédula / Documento de Identidad</option>
                                <option value="Contrato de Arrendamiento">Contrato de Arrendamiento</option>
                                <option value="Poder Notariado">Poder Notariado</option>
                                <option value="Otro Recaudo">Otro Recaudo</option>
                            </select>
                        </div>
                        <div class="col-md-5">
                            <label class="form-label small fw-bold">Archivo (PDF, DOCX, JPG, PNG)</label>
                            <input type="file" name="documento" class="form-control" required accept=".pdf,.doc,.docx,.jpg,.png,.txt">
                        </div>
                        <div class="col-md-3 d-flex align-items-end">
                            <button type="submit" class="btn btn-c58-teal w-100">
                                <i class="fas fa-upload"></i> Subir Archivo
                            </button>
                        </div>
                    </form>
                </div>
                
                <!-- Lista de documentos -->
                <h6 class="fw-bold text-secondary mb-3"><i class="fas fa-file-alt me-1"></i> Documentos Cargados en el Expediente</h6>
                <div class="table-responsive">
                    <table class="table table-hover datatable align-middle">
                        <thead>
                            <tr>
                                <th># ID</th>
                                <th>Tipo de Documento</th>
                                <th>Nombre del Archivo</th>
                                <th>Subido Por</th>
                                <th>Fecha de Carga</th>
                                <th>Estado</th>
                                <th class="text-end">Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            <?php foreach ($documentos as $doc): ?>
                            <tr>
                                <td>#<?php echo $doc['id']; ?></td>
                                <td>
                                    <span class="badge badge-c58-navy"><?php echo htmlspecialchars($doc['tipo_documento']); ?></span>
                                </td>
                                <td><strong><?php echo htmlspecialchars($doc['nombre_archivo']); ?></strong></td>
                                <td><?php echo htmlspecialchars($doc['usuario_nombre'] ?? 'Sistema'); ?></td>
                                <td><?php echo date('d/m/Y H:i', strtotime($doc['fecha_subida'])); ?></td>
                                <td>
                                    <?php
                                    $estados = [
                                        'borrador'           => 'bg-secondary',
                                        'pendiente_revision' => 'badge-c58-amber',
                                        'aprobado'           => 'bg-success',
                                        'entregado'          => 'badge-c58-teal'
                                    ];
                                    ?>
                                    <span class="badge <?php echo $estados[$doc['status']] ?? 'bg-secondary'; ?>">
                                        <?php echo ucfirst(str_replace('_', ' ', $doc['status'])); ?>
                                    </span>
                                </td>
                                <td class="text-end">
                                    <div class="btn-group btn-group-sm">
                                        <a href="<?php echo SITE_URL . ltrim($doc['ruta_archivo'], '/'); ?>" target="_blank" class="btn btn-outline-info" title="Ver Documento">
                                            <i class="fas fa-eye"></i>
                                        </a>
                                        <a href="<?php echo SITE_URL . ltrim($doc['ruta_archivo'], '/'); ?>" download class="btn btn-outline-success" title="Descargar">
                                            <i class="fas fa-download"></i>
                                        </a>
                                        <?php if ($doc['status'] == 'pendiente_revision' && hasRole(['direccion', 'gestor_legal'])): ?>
                                        <a href="aprobar_documento.php?id=<?php echo $doc['id']; ?>&proceso=<?php echo $proceso_id; ?>" 
                                           class="btn btn-outline-warning" title="Aprobar" 
                                           onclick="return confirm('¿Aprobar este documento legal?')">
                                            <i class="fas fa-check-circle"></i> Aprobar
                                        </a>
                                        <?php endif; ?>
                                        <a href="eliminar_documento.php?id=<?php echo $doc['id']; ?>&proceso=<?php echo $proceso_id; ?>" 
                                           class="btn btn-outline-danger btn-delete" 
                                           data-message="¿Está seguro de eliminar este documento del expediente?">
                                            <i class="fas fa-trash"></i>
                                        </a>
                                    </div>
                                </td>
                            </tr>
                            <?php endforeach; ?>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    </div>
</div>

<?php include '../../includes/footer.php'; ?>