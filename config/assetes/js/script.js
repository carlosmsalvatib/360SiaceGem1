$(document).ready(function() {
    // Inicializar DataTables
    if ($('.datatable').length) {
        $('.datatable').DataTable({
            language: {
                url: '//cdn.datatables.net/plug-ins/1.13.6/i18n/es-ES.json'
            },
            responsive: true,
            pageLength: 10,
            lengthMenu: [[10, 25, 50, -1], [10, 25, 50, "Todos"]]
        });
    }
    
    // Inicializar Select2
    if ($('.select2').length) {
        $('.select2').select2({
            theme: 'bootstrap-5',
            placeholder: 'Seleccione...',
            allowClear: true
        });
    }
    
    // Máscara para teléfonos
    if ($('.telefono').length) {
        $('.telefono').mask('(0000) 000-0000');
    }
    
    // Máscara para montos
    if ($('.monto').length) {
        $('.monto').mask('000,000,000.00', {reverse: true});
    }
    
    // Confirmación de eliminación
    $('.btn-delete').on('click', function(e) {
        e.preventDefault();
        const href = $(this).attr('href');
        const message = $(this).data('message') || '¿Estás seguro de eliminar este registro?';
        
        Swal.fire({
            title: '¿Estás seguro?',
            text: message,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#dc3545',
            cancelButtonColor: '#6c757d',
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar'
        }).then((result) => {
            if (result.isConfirmed) {
                window.location.href = href;
            }
        });
    });
    
    // Auto-ocultar alertas
    setTimeout(function() {
        $('.alert').fadeOut('slow');
    }, 5000);
});

// Función para actualizar estados con AJAX
function updateStatus(id, table, field, value) {
    $.ajax({
        url: 'ajax/update_status.php',
        method: 'POST',
        data: {
            id: id,
            table: table,
            field: field,
            value: value
        },
        success: function(response) {
            if (response.success) {
                Swal.fire({
                    icon: 'success',
                    title: 'Actualizado',
                    text: 'Estado actualizado correctamente',
                    timer: 2000,
                    showConfirmButton: false
                });
            }
        },
        error: function() {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'No se pudo actualizar el estado'
            });
        }
    });
}

// Función para exportar a Excel
function exportToExcel(tableId, filename = 'reporte') {
    const table = document.getElementById(tableId);
    const wb = XLSX.utils.table_to_book(table);
    XLSX.writeFile(wb, filename + '.xlsx');
}

// Función para imprimir
function printTable(tableId) {
    const printContents = document.getElementById(tableId).outerHTML;
    const originalContents = document.body.innerHTML;
    
    document.body.innerHTML = printContents;
    window.print();
    document.body.innerHTML = originalContents;
    location.reload();
}