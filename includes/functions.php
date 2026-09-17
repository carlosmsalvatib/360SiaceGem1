<?php
// Funciones de utilidad para el Sistema Código-58

// Formatear montos monetarios
function formatearMonto($monto, $simbolo = '$') {
    return $simbolo . ' ' . number_format(floatval($monto), 2, ',', '.');
}

// Renderizar badge de estado de emprendedor
function renderBadgeEstadoEmprendedor($status) {
    $estados = [
        'prospecto' => ['class' => 'bg-secondary', 'label' => 'Prospecto'],
        'activo' => ['class' => 'bg-success', 'label' => 'Activo'],
        'en_consulta' => ['class' => 'badge-c58-teal', 'label' => 'En Consulta'],
        'en_legalizacion' => ['class' => 'badge-c58-amber', 'label' => 'En Legalización'],
        'finalizado' => ['class' => 'badge-c58-navy', 'label' => 'Finalizado']
    ];
    $info = $estados[$status] ?? ['class' => 'bg-secondary', 'label' => ucfirst($status)];
    return '<span class="badge ' . $info['class'] . '">' . htmlspecialchars($info['label']) . '</span>';
}

// Renderizar badge de estado de contrato
function renderBadgeEstadoContrato($status) {
    $estados = [
        'activo' => ['class' => 'bg-success', 'label' => 'Activo'],
        'completado' => ['class' => 'badge-c58-teal', 'label' => 'Completado'],
        'cancelado' => ['class' => 'bg-danger', 'label' => 'Cancelado']
    ];
    $info = $estados[$status] ?? ['class' => 'bg-secondary', 'label' => ucfirst($status)];
    return '<span class="badge ' . $info['class'] . '">' . htmlspecialchars($info['label']) . '</span>';
}

// Renderizar badge de estado de pago
function renderBadgeEstadoPago($status) {
    $estados = [
        'pendiente' => ['class' => 'bg-danger', 'label' => 'Pendiente'],
        'parcial' => ['class' => 'badge-c58-amber', 'label' => 'Abono Parcial'],
        'pagado' => ['class' => 'bg-success', 'label' => 'Totalmente Pagado']
    ];
    $info = $estados[$status] ?? ['class' => 'bg-secondary', 'label' => ucfirst($status)];
    return '<span class="badge ' . $info['class'] . '">' . htmlspecialchars($info['label']) . '</span>';
}

// Obtener valor de configuración del sistema
function getConfigValue($clave, $default = '') {
    $db = Database::getInstance();
    $stmt = $db->prepare("SELECT valor FROM configuracion_sistema WHERE clave = ?");
    if ($stmt) {
        $stmt->bind_param("s", $clave);
        $stmt->execute();
        $res = $stmt->get_result();
        if ($row = $res->fetch_assoc()) {
            return $row['valor'];
        }
    }
    return $default;
}

// Verificar si un módulo está activo en el CMS
function isModuloActivo($slug) {
    $db = Database::getInstance();
    $stmt = $db->prepare("SELECT activo, roles_permitidos FROM modulos_sistema WHERE slug = ?");
    if ($stmt) {
        $stmt->bind_param("s", $slug);
        $stmt->execute();
        $res = $stmt->get_result();
        if ($row = $res->fetch_assoc()) {
            if (!$row['activo']) return false;
            if (!empty($_SESSION['rol'])) {
                $roles = explode(',', $row['roles_permitidos']);
                return in_array($_SESSION['rol'], $roles);
            }
            return true;
        }
    }
    return true; // Por defecto activo si no está en la tabla
}
?>
