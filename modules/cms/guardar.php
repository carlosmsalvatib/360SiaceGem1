<?php
require_once '../../config/config.php';
require_once '../../config/database.php';
require_once '../../includes/auth.php';
require_once '../../includes/functions.php';

requireRole(['direccion']);

$db = Database::getInstance();
$conn = $db->getConnection();

$action = $_POST['action'] ?? $_GET['action'] ?? '';
$tab = $_POST['tab'] ?? $_GET['tab'] ?? 'modulos';

switch ($action) {
    case 'guardar_modulos':
        if (isset($_POST['modulos']) && is_array($_POST['modulos'])) {
            $updateStmt = $conn->prepare("UPDATE modulos_sistema SET nombre = ?, icono = ?, descripcion = ?, activo = ?, orden = ?, roles_permitidos = ? WHERE id = ?");
            
            foreach ($_POST['modulos'] as $modId => $modData) {
                $modId = intval($modId);
                $nombre = trim($modData['nombre'] ?? '');
                $icono = trim($modData['icono'] ?? 'fas fa-cube');
                $descripcion = trim($modData['descripcion'] ?? '');
                $orden = intval($modData['orden'] ?? 0);
                $activo = isset($modData['activo']) ? 1 : 0;
                
                // Procesar roles permitidos
                $roles = $modData['roles'] ?? [];
                $rolesStr = is_array($roles) ? implode(',', $roles) : 'direccion';
                if (empty($rolesStr)) {
                    $rolesStr = 'direccion'; // Al menos dirección siempre debe tener acceso
                }

                $updateStmt->bind_param("sssiisi", $nombre, $icono, $descripcion, $activo, $orden, $rolesStr, $modId);
                $updateStmt->execute();
            }
            setFlash('success', 'La configuración de módulos del sistema ha sido actualizada exitosamente.');
        }
        break;

    case 'guardar_configuracion':
        if (isset($_POST['config']) && is_array($_POST['config'])) {
            $stmtCheck = $conn->prepare("SELECT id FROM configuracion_sistema WHERE clave = ?");
            $stmtUpdate = $conn->prepare("UPDATE configuracion_sistema SET valor = ? WHERE clave = ?");
            $stmtInsert = $conn->prepare("INSERT INTO configuracion_sistema (clave, valor) VALUES (?, ?)");

            foreach ($_POST['config'] as $clave => $valor) {
                $clave = trim($clave);
                $valor = trim($valor);

                $stmtCheck->bind_param("s", $clave);
                $stmtCheck->execute();
                $res = $stmtCheck->get_result();

                if ($res->num_rows > 0) {
                    $stmtUpdate->bind_param("ss", $valor, $clave);
                    $stmtUpdate->execute();
                } else {
                    $stmtInsert->bind_param("ss", $clave, $valor);
                    $stmtInsert->execute();
                }
            }
            setFlash('success', 'Los parámetros corporativos de Código-58 se guardaron correctamente.');
        }
        break;

    case 'agregar_servicio':
        $nombre = trim($_POST['nombre'] ?? '');
        $categoria = trim($_POST['categoria'] ?? 'General');
        $descripcion = trim($_POST['descripcion'] ?? '');

        if ($nombre !== '') {
            $stmt = $conn->prepare("INSERT INTO catalogo_servicios (nombre, categoria, descripcion, activo) VALUES (?, ?, ?, 1)");
            $stmt->bind_param("sss", $nombre, $categoria, $descripcion);
            if ($stmt->execute()) {
                setFlash('success', "Servicio '$nombre' agregado exitosamente al catálogo.");
            } else {
                setFlash('danger', 'Error al agregar el servicio: ' . $conn->error);
            }
        }
        break;

    case 'editar_servicio':
        $id = intval($_POST['id'] ?? 0);
        $nombre = trim($_POST['nombre'] ?? '');
        $categoria = trim($_POST['categoria'] ?? 'General');
        $descripcion = trim($_POST['descripcion'] ?? '');

        if ($id > 0 && $nombre !== '') {
            $stmt = $conn->prepare("UPDATE catalogo_servicios SET nombre = ?, categoria = ?, descripcion = ? WHERE id = ?");
            $stmt->bind_param("sssi", $nombre, $categoria, $descripcion, $id);
            if ($stmt->execute()) {
                setFlash('success', 'Servicio actualizado correctamente.');
            } else {
                setFlash('danger', 'Error al actualizar el servicio: ' . $conn->error);
            }
        }
        break;

    case 'toggle_servicio':
        $id = intval($_GET['id'] ?? 0);
        if ($id > 0) {
            $stmt = $conn->prepare("UPDATE catalogo_servicios SET activo = IF(activo = 1, 0, 1) WHERE id = ?");
            $stmt->bind_param("i", $id);
            $stmt->execute();
            setFlash('info', 'El estado del servicio ha sido modificado.');
        }
        $tab = 'servicios';
        break;

    case 'eliminar_servicio':
        $id = intval($_GET['id'] ?? 0);
        if ($id > 0) {
            $stmt = $conn->prepare("DELETE FROM catalogo_servicios WHERE id = ?");
            $stmt->bind_param("i", $id);
            if ($stmt->execute()) {
                setFlash('success', 'Servicio eliminado del catálogo.');
            } else {
                setFlash('danger', 'No se pudo eliminar el servicio.');
            }
        }
        $tab = 'servicios';
        break;

    default:
        setFlash('warning', 'Acción no reconocida.');
        break;
}

header("Location: index.php?tab=" . urlencode($tab));
exit;
