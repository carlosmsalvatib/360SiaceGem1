<?php
$db = Database::getInstance();
$usuario_id = $_SESSION['usuario_id'];

// Asesorías del consultor
$query = "
    SELECT COUNT(*) as total 
    FROM asesorias 
    WHERE consultor_id = $usuario_id AND status = 'programada'
";
$result = $db->query($query);
$mis_asesorias = $result->fetch_assoc()['total'];

// Clientes activos del consultor
$query = "
    SELECT COUNT(DISTINCT cliente_id) as total 
    FROM asesorias 
    WHERE consultor_id = $usuario_id
";
$result = $db->query($query);
$mis_clientes = $result->fetch_assoc()['total'];
?>

<div class="row">
    <div class="col-md-6">
        <div class="card">
            <div class="card-body text-center">
                <h5 class="card-title">Mis Asesorías</h5>
                <h2 class="text-primary"><?php echo $mis_asesorias; ?></h2>
                <small class="text-muted">Programadas</small>
            </div>
        </div>
    </div>
    <div class="col-md-6">
        <div class="card">
            <div class="card-body text-center">
                <h5 class="card-title">Mis Clientes</h5>
                <h2 class="text-success"><?php echo $mis_clientes; ?></h2>
                <small class="text-muted">Atendidos</small>
            </div>
        </div>
    </div>
</div>