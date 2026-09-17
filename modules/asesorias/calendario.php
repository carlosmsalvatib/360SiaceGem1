<?php
require_once '../../config/config.php';
require_once '../../config/database.php';

if (!isLoggedIn()) {
    redirect('login.php');
}

$db = Database::getInstance();

// Obtener asesorías para el calendario
$asesorias = [];
$query = "
    SELECT a.*, 
           c.nombre_completo as emprendedor_nombre,
           c.nombre_empresa,
           u.nombre as consultor_nombre,
           CASE 
               WHEN a.status = 'programada' THEN '#F59E0B'
               WHEN a.status = 'realizada' THEN '#008080'
               WHEN a.status = 'cancelada' THEN '#EF4444'
           END as color
    FROM asesorias a
    JOIN clientes c ON a.cliente_id = c.id
    JOIN usuarios u ON a.consultor_id = u.id
    WHERE a.status != 'cancelada'
";

if ($_SESSION['rol'] == 'consultor') {
    $query .= " AND a.consultor_id = " . intval($_SESSION['usuario_id']);
}

$result = $db->query($query);
if ($result) {
    while ($row = $result->fetch_assoc()) {
        $asesorias[] = [
            'id' => $row['id'],
            'title' => $row['emprendedor_nombre'] . ' (' . ucfirst($row['tipo']) . ')',
            'start' => $row['fecha_programada'],
            'end' => date('Y-m-d H:i:s', strtotime($row['fecha_programada'] . ' + ' . $row['duracion_minutos'] . ' minutes')),
            'color' => $row['color'],
            'extendedProps' => [
                'consultor' => $row['consultor_nombre'],
                'tipo' => ucfirst($row['tipo']),
                'status' => ucfirst($row['status']),
                'tema' => $row['tema'],
                'empresa' => $row['nombre_empresa'] ?? 'Sin empresa'
            ]
        ];
    }
}

include '../../includes/header.php';
?>

<div class="row">
    <div class="col-12">
        <div class="card shadow-sm fade-in">
            <div class="card-header bg-white py-3 d-flex justify-content-between align-items-center">
                <h5 class="mb-0 fw-bold" style="color: var(--c58-navy);">
                    <i class="fas fa-calendar-alt text-warning me-2"></i> Calendario de Asesorías Código-58
                </h5>
                <div class="d-flex gap-2">
                    <a href="index.php" class="btn btn-outline-secondary btn-sm">
                        <i class="fas fa-list"></i> Ver Lista
                    </a>
                    <?php if (hasRole(['direccion', 'consultor'])): ?>
                    <a href="crear.php" class="btn btn-c58-teal btn-sm">
                        <i class="fas fa-plus"></i> Nueva Asesoría
                    </a>
                    <?php endif; ?>
                </div>
            </div>
            
            <div class="card-body p-4">
                <div class="d-flex gap-3 mb-3">
                    <span class="badge" style="background:#F59E0B;">● Programada</span>
                    <span class="badge" style="background:#008080;">● Realizada</span>
                    <span class="badge" style="background:#EF4444;">● Cancelada</span>
                </div>
                <div id="calendar"></div>
            </div>
        </div>
    </div>
</div>

<!-- FullCalendar CSS y JS -->
<link href='https://cdn.jsdelivr.net/npm/fullcalendar@5.11.3/main.min.css' rel='stylesheet' />
<script src='https://cdn.jsdelivr.net/npm/fullcalendar@5.11.3/main.min.js'></script>
<script src='https://cdn.jsdelivr.net/npm/fullcalendar@5.11.3/locales/es.js'></script>

<script>
document.addEventListener('DOMContentLoaded', function() {
    var calendarEl = document.getElementById('calendar');
    var calendar = new FullCalendar.Calendar(calendarEl, {
        locale: 'es',
        headerToolbar: {
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,timeGridDay'
        },
        buttonText: {
            today: 'Hoy',
            month: 'Mes',
            week: 'Semana',
            day: 'Día'
        },
        events: <?php echo json_encode($asesorias); ?>,
        eventClick: function(info) {
            Swal.fire({
                title: info.event.title,
                html: `
                    <div class="text-start p-2">
                        <p class="mb-1"><strong>Consultor:</strong> ${info.event.extendedProps.consultor}</p>
                        <p class="mb-1"><strong>Empresa:</strong> ${info.event.extendedProps.empresa}</p>
                        <p class="mb-1"><strong>Tipo:</strong> ${info.event.extendedProps.tipo}</p>
                        <p class="mb-1"><strong>Estado:</strong> ${info.event.extendedProps.status}</p>
                        <p class="mb-1"><strong>Tema:</strong> ${info.event.extendedProps.tema || 'No especificado'}</p>
                    </div>
                `,
                icon: 'info',
                showCancelButton: true,
                confirmButtonColor: '#008080',
                cancelButtonColor: '#64748B',
                confirmButtonText: '<i class="fas fa-eye"></i> Ver Ficha Completa',
                cancelButtonText: 'Cerrar'
            }).then((result) => {
                if (result.isConfirmed) {
                    window.location.href = `ver.php?id=${info.event.id}`;
                }
            });
        },
        eventTimeFormat: {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        }
    });
    calendar.render();
});
</script>

<style>
#calendar {
    max-width: 100%;
    margin: 0 auto;
}
.fc-event {
    cursor: pointer;
    border: none;
    padding: 3px 6px;
    font-size: 0.85rem;
    font-weight: 600;
}
.fc .fc-toolbar-title {
    font-size: 1.25rem;
    font-weight: 700;
    color: var(--c58-navy);
}
.fc-button-primary {
    background-color: var(--c58-navy) !important;
    border-color: var(--c58-navy) !important;
}
</style>

<?php include '../../includes/footer.php'; ?>