document.addEventListener('DOMContentLoaded', function() {
    // Obtener pedido de sessionStorage
    const pedido = JSON.parse(sessionStorage.getItem('ultimoPedido'));
    const usuario = JSON.parse(sessionStorage.getItem('usuarioLogueado'));
    
    if (!pedido) {
        mostrarError('No se encontró información del pedido');
        return;
    }
    
    // Elementos del DOM
    const btnVerFactura = document.getElementById('btn-ver-factura');
    const btnVerTicket = document.getElementById('btn-ver-ticket');
    const btnImprimir = document.getElementById('btn-imprimir');
    const formatoFactura = document.getElementById('formato-factura');
    const formatoTicket = document.getElementById('formato-ticket');
    const opcionesComprobante = document.querySelector('.opciones-comprobante');

    // Variable para controlar si ya se imprimió
    let yaImprimio = false;

    // Renderizar comprobante
    renderizarComprobante(pedido, usuario);
    
    // Estado actual
    let formatoActual = 'factura';
    
    // Mostrar formato seleccionado
    function mostrarFormato(formato) {
        // Resetear estilos
        btnVerFactura.classList.remove('activo');
        btnVerTicket.classList.remove('activo');
        formatoFactura.classList.remove('activa');
        formatoTicket.classList.remove('activa');
        
        // Mostrar formato seleccionado
        if (formato === 'factura') {
            formatoFactura.classList.add('activa');
            btnVerFactura.classList.add('activo');
            formatoActual = 'factura';
        } else {
            formatoTicket.classList.add('activa');
            btnVerTicket.classList.add('activo');
            formatoActual = 'ticket';
        }
        
        btnImprimir.disabled = false;
    }
    
    // Manejar impresión
    function manejarImpresion() {
        if (!formatoActual || yaImprimio) return;
        
        // Marcar que ya se imprimió
        yaImprimio = true;
        
        // Feedback visual (preparando impresión...)
        btnImprimir.textContent = 'Preparando impresión...';
        btnImprimir.disabled = true;
        
        // Deshabilitar otros botones
        if (btnVerFactura) btnVerFactura.disabled = true;
        if (btnVerTicket) btnVerTicket.disabled = true;
        
        // Ocultar elementos no necesitos
        if (opcionesComprobante) opcionesComprobante.style.display = 'none';
        if (document.querySelector('nav')) document.querySelector('nav').style.display = 'none';
        if (document.querySelector('footer')) document.querySelector('footer').style.display = 'none';
        
        setTimeout(() => {
            window.print();
            
            // Redirigir después de imprimir
            setTimeout(() => {
                // Mostrar mensaje de redir
                const mensajeRedireccion = document.createElement('div');
                mensajeRedireccion.textContent = 'Redirigiendo al inicio...';
                mensajeRedireccion.style.cssText = `
                    position: fixed;
                    bottom: 20px;
                    left: 50%;
                    transform: translateX(-50%);
                    background: rgba(0,0,0,0.8);
                    color: white;
                    padding: 10px 20px;
                    border-radius: 5px;
                    z-index: 1000;
                `;
                document.body.appendChild(mensajeRedireccion);
                
                // Redirigi después de 2 segundos
                setTimeout(() => {
                    // Limpiar el pedido de sessionStorage para evitar reimpresión
                    sessionStorage.removeItem('ultimoPedido');
                    window.location.href = '/index.html';
                }, 2000);
                
            }, 500);
        }, 100);
    }
    
    
    // Event listeners
    if (btnVerFactura) btnVerFactura.addEventListener('click', () => mostrarFormato('factura'));
    if (btnVerTicket) btnVerTicket.addEventListener('click', () => mostrarFormato('ticket'));
    if (btnImprimir) btnImprimir.addEventListener('click', manejarImpresion);
});

function renderizarComprobante(pedido, usuario) {
    const fecha = new Date(pedido.fecha);
    const fechaFormateada = fecha.toLocaleDateString('es-AR', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
    
    // Factura -Cabecera
    const fechaFactura = document.querySelector('.fecha-factura');
    const numeroPedido = document.querySelector('.numero-pedido');
    if (fechaFactura) fechaFactura.textContent = `Fecha: ${fechaFormateada}`;
    if (numeroPedido) numeroPedido.textContent = `N° Pedido: ${pedido.id}`;
    
    // Factura-Datos cliente
    const datosCliente = document.querySelector('.datos-cliente-contenido');
    if (datosCliente) {
        datosCliente.innerHTML = `
            <p><strong>Nombre:</strong> ${usuario.nombre}</p>
            <p><strong>Email:</strong> ${usuario.email}</p>
            <p><strong>Método Pago:</strong> ${pedido.metodoPago || 'Efectivo'}</p>
        `;
    }
    
    // Factura-Tabla Productos
    const tbody = document.querySelector('.tabla-productos tbody');
    const totalFactura = document.querySelector('.total-factura');
    if (tbody && totalFactura) {
        let tablaHTML = '';
        let total = 0;
        
        pedido.items.forEach(item => {
            const producto = obtenerProductoPorId(item.id);
            const precio = producto?.precio || producto?.price || 0;
            const subtotal = precio * item.cantidad;
            total += subtotal;
            
            tablaHTML += `
                <tr>
                    <td>${producto?.nombre || producto?.title || 'Producto no encontrado'}</td>
                    <td class="text-right">$${precio.toFixed(2)}</td>
                    <td class="text-center">${item.cantidad}</td>
                    <td class="text-right">$${subtotal.toFixed(2)}</td>
                </tr>
            `;
        });
        
        tbody.innerHTML = tablaHTML;
        totalFactura.textContent = `$${total.toFixed(2)}`;
    }
    
    // Factura-Footer
    const estadoPedido = document.querySelector('.estado-pedido');
    const notasPedido = document.querySelector('.notas-pedido');
    if (estadoPedido) estadoPedido.textContent = `Estado: ${pedido.estado || 'Pendiente'}`;
    if (notasPedido) notasPedido.innerHTML = pedido.notas ? `<strong>Notas:</strong> ${pedido.notas}` : '';
    
    // Ticket-Contenido
    const fechaTicket = document.querySelector('.fecha-ticket');
    const numeroPedidoTicket = document.querySelector('.numero-pedido-ticket');
    const ticketProductos = document.querySelector('.ticket-productos');
    const ticketTotal = document.querySelector('.ticket-total');
    
    if (fechaTicket) fechaTicket.textContent = fechaFormateada;
    if (numeroPedidoTicket) numeroPedidoTicket.textContent = `N° Pedido: ${pedido.id}`;

    if (ticketProductos && ticketTotal) {
        let productosHTML = '';
        let total = 0;
        
        pedido.items.forEach(item => {
            const producto = obtenerProductoPorId(item.id);
            const precio = producto?.precio || producto?.price || 0;
            const subtotal = precio * item.cantidad;
            total += subtotal;
            
            productosHTML += `
                <div class="ticket-item">
                    <span>${producto?.nombre || producto?.title || 'Producto'} x${item.cantidad}</span>
                    <span>$${subtotal.toFixed(2)}</span>
                </div>
            `;
        });
        
        ticketProductos.innerHTML = productosHTML;
        ticketTotal.innerHTML = `
            <div class="total-ticket">Total: $${total.toFixed(2)}</div>
        `;
    }
}

function obtenerProductoPorId(id) {
    const productos = JSON.parse(localStorage.getItem('productos')) || [];
    return productos.find(p => p.id == id || p.idProducto == id);
}

function mostrarError(mensaje) {
    const main = document.querySelector('.comprobante-main');
    if (main) {
        main.innerHTML = `
            <div class="error-comprobante">
                <i class="fas fa-exclamation-circle"></i>
                <h2>${mensaje}</h2>
                <button onclick="volverInicio()">Volver al inicio</button>
            </div>
        `;
    }
}

function volverInicio() {
    window.location.href = '/index.html';
}