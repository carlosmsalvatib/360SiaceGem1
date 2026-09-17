<?php
require_once '../../config/config.php';
require_once '../../config/database.php';

if (!isLoggedIn()) {
    redirect('login.php');
}

$db = Database::getInstance();
$asesoria_id = intval($_GET['id'] ?? 0);

if ($asesoria_id <= 0) {
    setFlash('danger', 'ID de asesoría no válido');
    redirect('modules/asesorias/');
}

$stmt = $db->prepare("
    SELECT a.*, 
           c.id as cliente_id,
           c.nombre_completo as emprendedor_nombre,
           c.nombre_empresa,
           c.email as emprendedor_email,
           c.telefono as emprendedor_telefono,
           c.direccion as emprendedor_direccion,
           c.servicios_ofrecidos,
           u.nombre as consultor_nombre,
           u.email as consultor_email
    FROM asesorias a
    JOIN clientes c ON a.cliente_id = c.id
    JOIN usuarios u ON a.consultor_id = u.id
    WHERE a.id = ?
");
$stmt->bind_param("i", $asesoria_id);
$stmt->execute();
$asesoria = $stmt->get_result()->fetch_assoc();

if (!$asesoria) {
    setFlash('danger', 'Asesoría no encontrada');
    redirect('modules/asesorias/');
}

include '../../includes/header.php';
?>

<div class="row justify-content-center">
    <div class="col-lg-9">
        <div class="card shadow-sm fade-in">
            <div class="card-header bg-white py-3 d-flex justify-content-between align-items-center">
                <div>
                    <span class="badge badge-c58-navy me-2">Asesoría #<?php echo $asesoria['id']; ?></span>
                    <h5 class="d-inline-block mb-0 fw-bold" style="color: var(--c58-navy);">
                        Detalles de la Sesión de Consultoría
                    </h5>
                </div>
                <div class="d-flex gap-2">
                    <a href="index.php" class="btn btn-outline-secondary btn-sm">
                        <i class="fas fa-arrow-left"></i> Volver
                    </a>
                    <?php if ($asesoria['status'] == 'programada'): ?>
                    <a href="editar.php?id=<?php echo $asesoria['id']; ?>" class="btn btn-outline-warning btn-sm">
                        <i class="fas fa-edit"></i> Editar
                    </a>
                    <a href="index.php?action=completar&id=<?php echo $asesoria['id']; ?>" class="btn btn-success btn-sm" onclick="return confirm('¿Marcar esta asesoría como realizada?')">
                        <i class="fas fa-check"></i> Marcar Realizada
                    </a>
                    <?php endif; ?>
                    <button class="btn btn-outline-dark btn-sm" onclick="printElement('ficha-asesoria', 'Ficha de Asesoría #<?php echo $asesoria['id']; ?>')">
                        <i class="fas fa-print"></i> Imprimir
                    </button>
                </div>
            </div>
            
            <div class="card-body p-4" id="ficha-asesoria">
                <!-- Estado y Datos Generales -->
                <div class="row mb-4 pb-3 border-bottom">
                    <div class="col-md-6">
                        <small class="text-muted text-uppercase fw-bold">Estado de la Sesión</small>
                        <div class="mt-1">
                            <?php
                            $estados = [
                                'programada' => ['class' => 'bg-warning text-dark', 'label' => 'Sesión Programada'],
                                'realizada'  => ['class' => 'bg-success', 'label' => 'Sesión Realizada con Éxito'],
                                'cancelada'  => ['class' => 'bg-danger', 'label' => 'Sesión Cancelada']
                            ];
                            $estInfo = $estados[$asesoria['status']] ?? ['class' => 'bg-secondary', 'label' => ucfirst($asesoria['status'])];
                            ?>
                            <span class="badge <?php echo $estInfo['class']; ?> fs-6 py-2 px-3">
                                <?php echo $estInfo['label']; ?>
                            </span>
                        </div>
                    </div>
                    <div class="col-md-6 text-md-end mt-3 mt-md-0">
                        <small class="text-muted text-uppercase fw-bold">Modalidad / Tipo</small>
                        <div class="mt-1">
                            <span class="badge badge-c58-teal fs-6 py-2 px-3">
                                <?php echo ucfirst($asesoria['tipo']); ?>
                            </span>
                        </div>
                    </div>
                </div>

                <!-- Bloques Emprendedor y Consultor -->
                <div class="row g-4 mb-4">
                    <div class="col-md-6">
                        <div class="p-3 bg-light rounded-3 h-100 border">
                            <h6 class="fw-bold text-primary mb-3">
                                <i class="fas fa-user-tie me-2"></i> Datos del Emprendedor
                            </h6>
                            <p class="mb-1"><strong>Nombre:</strong> <?php echo htmlspecialchars($asesoria['emprendedor_nombre']); ?></p>
                            <p class="mb-1"><strong>Empresa / Negocio:</strong> <?php echo htmlspecialchars($asesoria['nombre_empresa'] ?? 'N/A'); ?></p>
                            <p class="mb-1"><strong>Teléfono:</strong> <?php echo htmlspecialchars($asesoria['emprendedor_telefono'] ?? 'N/A'); ?></p>
                            <p class="mb-1"><strong>Email:</strong> <?php echo htmlspecialchars($asesoria['emprendedor_email'] ?? 'N/A'); ?></p>
                            <?php if (!empty($asesoria['servicios_ofrecidos'])): ?>
                            <p class="mb-0 mt-2">
                                <strong>Servicios que ofrece:</strong><br>
                                <span class="badge bg-white text-dark border"><?php echo htmlspecialchars($asesoria['servicios_ofrecidos']); ?></span>
                            </p>
                            <?php endif; ?>
                            <div class="mt-3">
                                <a href="<?php echo SITE_URL; ?>modules/clientes/ver.php?id=<?php echo $asesoria['cliente_id']; ?>" class="btn btn-sm btn-outline-primary">
                                    <i class="fas fa-external-link-alt"></i> Ver Ficha Completa
                                </a>
                            </div>
                        </div>
                    </div>
                    
                    <div class="col-md-6">
                        <div class="p-3 bg-light rounded-3 h-100 border">
                            <h6 class="fw-bold text-success mb-3">
                                <i class="fas fa-user-check me-2"></i> Consultor Asignado
                            </h6>
                            <p class="mb-1"><strong>Consultor:</strong> <?php echo htmlspecialchars($asesoria['consultor_nombre']); ?></p>
                            <p class="mb-1"><strong>Email de Contacto:</strong> <?php echo htmlspecialchars($asesoria['consultor_email']); ?></p>
                            <hr>
                            <p class="mb-1"><strong>Fecha Programada:</strong> <?php echo date('d/m/Y - h:i A', strtotime($asesoria['fecha_programada'])); ?></p>
                            <p class="mb-1"><strong>Duración Estimada:</strong> <?php echo $asesoria['duracion_minutos']; ?> minutos</p>
                            <?php if ($asesoria['fecha_realizada']): ?>
                            <p class="mb-0 text-success">
                                <strong>Fecha de Ejecución:</strong> <?php echo date('d/m/Y - h:i A', strtotime($asesoria['fecha_realizada'])); ?>
                            </p>
                            <?php endif; ?>
                        </div>
                    </div>
                </div>

                <!-- Tema y Observaciones -->
                <div class="mb-4">
                    <h6 class="fw-bold text-secondary mb-2"><i class="fas fa-heading me-1"></i> Tema de la Sesión</h6>
                    <div class="p-3 bg-white border rounded">
                        <?php echo nl2br(htmlspecialchars($asesoria['tema'] ?: 'Sin tema específico registrado.')); ?>
                    </div>
                </div>

                <div class="mb-2">
                    <h6 class="fw-bold text-secondary mb-2"><i class="fas fa-clipboard-list me-1"></i> Observaciones y Notas Técnicas</h6>
                    <div class="p-3 bg-white border rounded" style="min-height: 90px;">
                        <?php echo nl2br(htmlspecialchars($asesoria['observaciones'] ?: 'No se han registrado observaciones adicionales.')); ?>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>

<?php include '../../includes/footer.php'; ?>
