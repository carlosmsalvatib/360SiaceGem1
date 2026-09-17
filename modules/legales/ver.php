<?php
require_once '../../config/config.php';
require_once '../../config/database.php';

if (!isLoggedIn()) {
    redirect('login.php');
}

$db = Database::getInstance();
$proceso_id = intval($_GET['id'] ?? 0);

if ($proceso_id <= 0) {
    setFlash('danger', 'ID de proceso no válido');
    redirect('modules/legales/');
}

// Obtener información del proceso
$stmt = $db->prepare("
    SELECT p.*, 
           c.id as emprendedor_id,
           c.nombre_completo as emprendedor_nombre,
           c.nombre_empresa,
           c.email as emprendedor_email,
           c.telefono as emprendedor_telefono,
           c.direccion as emprendedor_direccion,
           u.nombre as gestor_nombre,
           u.email as gestor_email
    FROM procesos_legales p
    JOIN clientes c ON p.cliente_id = c.id
    JOIN usuarios u ON p.gestor_id = u.id
    WHERE p.id = ?
");
$stmt->bind_param("i", $proceso_id);
$stmt->execute();
$proceso = $stmt->get_result()->fetch_assoc();

if (!$proceso) {
    setFlash('danger', 'Expediente legal no encontrado');
    redirect('modules/legales/');
}

// Obtener documentos asociados
$documentos = [];
$stmtDocs = $db->prepare("
    SELECT d.*, u.nombre as usuario_subio_nombre
    FROM documentos_legales d
    LEFT JOIN usuarios u ON d.usuario_id_subio = u.id
    WHERE d.proceso_legal_id = ?
    ORDER BY d.fecha_subida DESC
");
$stmtDocs->bind_param("i", $proceso_id);
$stmtDocs->execute();
$resDocs = $stmtDocs->get_result();
while ($doc = $resDocs->fetch_assoc()) {
    $documentos[] = $doc;
}

include '../../includes/header.php';
?>

<div class="row justify-content-center">
    <div class="col-lg-10">
        <div class="card shadow-sm fade-in mb-4">
            <div class="card-header bg-white py-3 d-flex justify-content-between align-items-center">
                <div>
                    <span class="badge badge-c58-navy me-2">Expediente #<?php echo $proceso['id']; ?></span>
                    <h5 class="d-inline-block mb-0 fw-bold" style="color: var(--c58-navy);">
                        Ficha de Formalización y Proceso Legal
                    </h5>
                </div>
                <div class="d-flex gap-2">
                    <a href="index.php" class="btn btn-outline-secondary btn-sm">
                        <i class="fas fa-arrow-left"></i> Volver
                    </a>
                    <?php if ($proceso['status'] != 'completado' && $proceso['status'] != 'rechazado'): ?>
                    <a href="editar.php?id=<?php echo $proceso['id']; ?>" class="btn btn-outline-warning btn-sm">
                        <i class="fas fa-edit"></i> Editar
                    </a>
                    <a href="documentos.php?id=<?php echo $proceso['id']; ?>" class="btn btn-c58-teal btn-sm">
                        <i class="fas fa-file-upload"></i> Subir Documentos
                    </a>
                    <?php endif; ?>
                    <button class="btn btn-outline-dark btn-sm" onclick="printElement('ficha-legal', 'Expediente Legal #<?php echo $proceso['id']; ?>')">
                        <i class="fas fa-print"></i> Imprimir
                    </button>
                </div>
            </div>
            
            <div class="card-body p-4" id="ficha-legal">
                <!-- Estado del Trámite -->
                <div class="row pb-3 mb-4 border-bottom align-items-center">
                    <div class="col-md-6">
                        <small class="text-muted text-uppercase fw-bold">Tipo de Trámite Legal</small>
                        <h4 class="fw-bold mb-0 text-primary"><?php echo htmlspecialchars($proceso['tipo_proceso']); ?></h4>
                        <span class="text-secondary"><?php echo htmlspecialchars($proceso['nombre_comercial'] ?: 'Sin nombre asignado'); ?></span>
                    </div>
                    <div class="col-md-6 text-md-end mt-3 mt-md-0">
                        <small class="text-muted text-uppercase fw-bold d-block mb-1">Estado del Expediente</small>
                        <?php
                        $estados = [
                            'pendiente'  => ['class' => 'bg-warning text-dark', 'label' => 'Trámite Pendiente'],
                            'en_proceso' => ['class' => 'bg-info text-white', 'label' => 'En Trámite Legal'],
                            'completado' => ['class' => 'bg-success', 'label' => 'Formalizado y Completado'],
                            'rechazado'  => ['class' => 'bg-danger', 'label' => 'Expediente Rechazado']
                        ];
                        $est = $estados[$proceso['status']] ?? ['class' => 'bg-secondary', 'label' => ucfirst($proceso['status'])];
                        ?>
                        <span class="badge <?php echo $est['class']; ?> fs-6 py-2 px-3">
                            <?php echo $est['label']; ?>
                        </span>
                    </div>
                </div>

                <!-- Bloques Emprendedor y Gestor -->
                <div class="row g-4 mb-4">
                    <div class="col-md-6">
                        <div class="p-3 bg-light rounded-3 border h-100">
                            <h6 class="fw-bold text-primary mb-3">
                                <i class="fas fa-user-tie me-2"></i> Datos del Emprendedor
                            </h6>
                            <p class="mb-1"><strong>Emprendedor:</strong> <?php echo htmlspecialchars($proceso['emprendedor_nombre']); ?></p>
                            <p class="mb-1"><strong>Empresa / Razón Social:</strong> <?php echo htmlspecialchars($proceso['nombre_empresa'] ?? 'Persona Natural'); ?></p>
                            <p class="mb-1"><strong>Doc. Identidad / RIF:</strong> <?php echo htmlspecialchars($proceso['documento_identidad'] ?: 'Sin registrar'); ?></p>
                            <p class="mb-1"><strong>Teléfono:</strong> <?php echo htmlspecialchars($proceso['emprendedor_telefono'] ?: 'N/A'); ?></p>
                            <p class="mb-0"><strong>Email:</strong> <?php echo htmlspecialchars($proceso['emprendedor_email'] ?: 'N/A'); ?></p>
                            <div class="mt-3">
                                <a href="<?php echo SITE_URL; ?>modules/clientes/ver.php?id=<?php echo $proceso['emprendedor_id']; ?>" class="btn btn-sm btn-outline-primary">
                                    <i class="fas fa-external-link-alt"></i> Ver Ficha del Emprendedor
                                </a>
                            </div>
                        </div>
                    </div>
                    
                    <div class="col-md-6">
                        <div class="p-3 bg-light rounded-3 border h-100">
                            <h6 class="fw-bold text-success mb-3">
                                <i class="fas fa-user-shield me-2"></i> Gestor Legal Asignado
                            </h6>
                            <p class="mb-1"><strong>Abogado / Gestor:</strong> <?php echo htmlspecialchars($proceso['gestor_nombre']); ?></p>
                            <p class="mb-1"><strong>Email de Contacto:</strong> <?php echo htmlspecialchars($proceso['gestor_email']); ?></p>
                            <hr>
                            <p class="mb-1"><strong>Jurisdicción / Registro:</strong> <?php echo htmlspecialchars($proceso['estado'] ?: 'No especificado'); ?></p>
                            <p class="mb-1"><strong>Fecha de Inicio:</strong> <?php echo date('d/m/Y - h:i A', strtotime($proceso['fecha_inicio'])); ?></p>
                            <?php if ($proceso['fecha_finalizacion']): ?>
                            <p class="mb-0 text-success">
                                <strong>Fecha de Culminación:</strong> <?php echo date('d/m/Y - h:i A', strtotime($proceso['fecha_finalizacion'])); ?>
                            </p>
                            <?php endif; ?>
                        </div>
                    </div>
                </div>

                <!-- Observaciones -->
                <?php if (!empty($proceso['observaciones'])): ?>
                <div class="mb-4">
                    <h6 class="fw-bold text-secondary mb-2"><i class="fas fa-sticky-note me-1"></i> Observaciones y Notas Jurídicas</h6>
                    <div class="p-3 bg-white border rounded">
                        <?php echo nl2br(htmlspecialchars($proceso['observaciones'])); ?>
                    </div>
                </div>
                <?php endif; ?>

                <!-- Documentos Legales del Expediente -->
                <div class="mt-4">
                    <div class="d-flex justify-content-between align-items-center mb-3">
                        <h6 class="fw-bold text-secondary mb-0">
                            <i class="fas fa-folder-open me-1"></i> Expediente Documental Digital (<?php echo count($documentos); ?>)
                        </h6>
                        <a href="documentos.php?id=<?php echo $proceso['id']; ?>" class="btn btn-sm btn-c58-teal">
                            <i class="fas fa-upload"></i> Gestionar / Subir Documentos
                        </a>
                    </div>
                    
                    <div class="table-responsive">
                        <table class="table table-hover align-middle">
                            <thead class="table-light">
                                <tr>
                                    <th>#</th>
                                    <th>Tipo de Documento</th>
                                    <th>Nombre del Archivo</th>
                                    <th>Subido Por</th>
                                    <th>Fecha</th>
                                    <th>Estado</th>
                                    <th class="text-end">Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                <?php if (empty($documentos)): ?>
                                <tr>
                                    <td colspan="7" class="text-center text-muted py-3">
                                        No se han cargado documentos en este expediente legal todavía.
                                    </td>
                                </tr>
                                <?php else: ?>
                                <?php foreach ($documentos as $doc): ?>
                                <tr>
                                    <td>#<?php echo $doc['id']; ?></td>
                                    <td><span class="badge badge-c58-navy"><?php echo htmlspecialchars($doc['tipo_documento']); ?></span></td>
                                    <td><strong><?php echo htmlspecialchars($doc['nombre_archivo']); ?></strong></td>
                                    <td><small><?php echo htmlspecialchars($doc['usuario_subio_nombre'] ?: 'Sistema'); ?></small></td>
                                    <td><small><?php echo date('d/m/Y H:i', strtotime($doc['fecha_subida'])); ?></small></td>
                                    <td>
                                        <?php
                                        $dStatus = [
                                            'borrador' => 'bg-secondary',
                                            'pendiente_revision' => 'badge-c58-amber',
                                            'aprobado' => 'bg-success',
                                            'entregado' => 'badge-c58-teal'
                                        ];
                                        ?>
                                        <span class="badge <?php echo $dStatus[$doc['status']] ?? 'bg-secondary'; ?>">
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
                                            <a href="aprobar_documento.php?id=<?php echo $doc['id']; ?>&proceso=<?php echo $proceso_id; ?>" class="btn btn-outline-warning" title="Aprobar Documento" onclick="return confirm('¿Aprobar este documento legal?')">
                                                <i class="fas fa-check-circle"></i>
                                            </a>
                                            <?php endif; ?>
                                        </div>
                                    </td>
                                </tr>
                                <?php endforeach; ?>
                                <?php endif; ?>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>

<?php include '../../includes/footer.php'; ?>
