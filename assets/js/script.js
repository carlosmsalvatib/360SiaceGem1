// ===================================================
// SISTEMA DE GESTIÓN CÓDIGO-58 - SCRIPTS FRONTEND
// ===================================================

$(document).ready(function() {
    // 1. Inicializar DataTables con localización en Español
    if ($('.datatable').length) {
        $('.datatable').DataTable({
            language: {
                processing:     "Procesando...",
                search:         "<i class='fas fa-search'></i> Buscar:",
                lengthMenu:     "Mostrar _MENU_ registros",
                info:           "Mostrando de _START_ a _END_ de _TOTAL_ registros",
                infoEmpty:      "Mostrando 0 a 0 de 0 registros",
                infoFiltered:   "(filtrado de _MAX_ registros en total)",
                infoPostFix:    "",
                loadingRecords: "Cargando registros...",
                zeroRecords:    "No se encontraron resultados coincidentes",
                emptyTable:     "No hay datos disponibles en esta tabla",
                paginate: {
                    first:      "<i class='fas fa-angle-double-left'></i>",
                    previous:   "<i class='fas fa-angle-left'></i>",
                    next:       "<i class='fas fa-angle-right'></i>",
                    last:       "<i class='fas fa-angle-double-right'></i>"
                }
            },
            responsive: true,
            pageLength: 10,
            lengthMenu: [[10, 25, 50, 100, -1], [10, 25, 50, 100, "Todos"]],
            dom: "<'row mb-3'<'col-sm-12 col-md-6'l><'col-sm-12 col-md-6'f>>" +
                 "<'row'<'col-sm-12'tr>>" +
                 "<'row mt-3'<'col-sm-12 col-md-5'i><'col-sm-12 col-md-7'p>>"
        });
    }

    // 2. Inicializar Select2
    if ($('.select2').length) {
        $('.select2').select2({
            theme: 'bootstrap-5',
            placeholder: 'Seleccione una opción...',
            allowClear: true,
            width: '100%'
        });
    }

    // 3. Confirmación de eliminación estilizada con SweetAlert2
    $(document).on('click', '.btn-delete', function(e) {
        e.preventDefault();
        const href = $(this).attr('href');
        const message = $(this).data('message') || '¿Está seguro de eliminar este registro? Esta acción no se puede deshacer.';

        Swal.fire({
            title: '¿Confirmar eliminación?',
            text: message,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#EF4444',
            cancelButtonColor: '#64748B',
            confirmButtonText: '<i class="fas fa-trash"></i> Sí, eliminar',
            cancelButtonText: '<i class="fas fa-times"></i> Cancelar',
            reverseButtons: true,
            focusCancel: true
        }).then((result) => {
            if (result.isConfirmed) {
                window.location.href = href;
            }
        });
    });

    // 4. Auto-ocultar alertas flash después de 6 segundos
    setTimeout(function() {
        $('.alert.fade.show').fadeOut('slow');
    }, 6000);
});

// Función para imprimir una tabla o elemento específico
function printElement(elementId, title = 'Código-58 - Reporte') {
    const el = document.getElementById(elementId);
    if (!el) return;

    const printWin = window.open('', '', 'height=700,width=900');
    printWin.document.write('<html><head><title>' + title + '</title>');
    printWin.document.write('<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">');
    printWin.document.write('<style>body{padding:20px;font-family:sans-serif;} table{width:100%;} .btn, .dataTables_filter, .dataTables_length, .dataTables_paginate, .dataTables_info{display:none !important;}</style>');
    printWin.document.write('</head><body>');
    printWin.document.write('<div style="text-align:center;margin-bottom:20px;"><h2>' + title + '</h2><small>' + new Date().toLocaleString() + '</small></div>');
    printWin.document.write(el.outerHTML);
    printWin.document.write('</body></html>');
    printWin.document.close();
    printWin.focus();
    setTimeout(() => {
        printWin.print();
        printWin.close();
    }, 500);
}
