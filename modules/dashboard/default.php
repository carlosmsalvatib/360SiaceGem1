<?php
// Dashboard predeterminado con accesos rápidos para cualquier usuario
?>
<div class="row g-4 mb-4">
    <div class="col-md-6 col-lg-3">
        <div class="card h-100 p-3 text-center border-0 shadow-sm">
            <div class="card-body">
                <div class="card-icon bg-primary bg-opacity-10 text-primary mx-auto mb-3">
                    <i class="fas fa-address-book"></i>
                </div>
                <h5 class="fw-bold">Directorio</h5>
                <p class="text-muted small">Buscar emprendedores y consultar catálogo de servicios.</p>
                <a href="<?php echo SITE_URL; ?>modules/directorio/" class="btn btn-sm btn-c58-navy w-100">
                    Ir al Directorio
                </a>
            </div>
        </div>
    </div>
    
    <div class="col-md-6 col-lg-3">
        <div class="card h-100 p-3 text-center border-0 shadow-sm">
            <div class="card-body">
                <div class="card-icon bg-success bg-opacity-10 text-success mx-auto mb-3">
                    <i class="fas fa-user-tie"></i>
                </div>
                <h5 class="fw-bold">Emprendedores</h5>
                <p class="text-muted small">Registrar nuevos emprendedores y consultar expedientes.</p>
                <a href="<?php echo SITE_URL; ?>modules/clientes/" class="btn btn-sm btn-c58-teal w-100">
                    Ver Emprendedores
                </a>
            </div>
        </div>
    </div>
    
    <div class="col-md-6 col-lg-3">
        <div class="card h-100 p-3 text-center border-0 shadow-sm">
            <div class="card-body">
                <div class="card-icon bg-warning bg-opacity-10 text-warning mx-auto mb-3">
                    <i class="fas fa-calendar-alt"></i>
                </div>
                <h5 class="fw-bold">Asesorías</h5>
                <p class="text-muted small">Consultar sesiones programadas y calendario general.</p>
                <a href="<?php echo SITE_URL; ?>modules/asesorias/" class="btn btn-sm btn-c58-amber w-100">
                    Ver Asesorías
                </a>
            </div>
        </div>
    </div>
    
    <div class="col-md-6 col-lg-3">
        <div class="card h-100 p-3 text-center border-0 shadow-sm">
            <div class="card-body">
                <div class="card-icon bg-info bg-opacity-10 text-info mx-auto mb-3">
                    <i class="fas fa-chart-bar"></i>
                </div>
                <h5 class="fw-bold">Reportes</h5>
                <p class="text-muted small">Visualizar gráficos e indicadores de desempeño del sistema.</p>
                <a href="<?php echo SITE_URL; ?>modules/reportes/" class="btn btn-sm btn-outline-secondary w-100">
                    Ver Reportes
                </a>
            </div>
        </div>
    </div>
</div>
