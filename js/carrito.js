// Función para mostrar alertas
function showAlert(message, type = 'success') {
    // Eliminar alertas anteriores
    const oldAlert = document.querySelector('.global-alert');
    if (oldAlert) oldAlert.remove();

    // Crear alerta
    const alert = document.createElement('div');
    alert.className = `global-alert ${type}`;
    alert.innerHTML = `
        <i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}"></i>
        <span>${message}</span>
    `;
    
    // Estilos de alerta
    alert.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 12px 15px;
        border-radius: 6px;
        background: ${type === 'success' ? '#4CAF50' : '#F44336'};
        color: white;
        display: flex;
        align-items: center;
        gap: 8px;
        z-index: 1000;
        box-shadow: 0 4px 8px rgba(0,0,0,0.2);
    `;
    
    document.body.appendChild(alert);
    
    // Auto-eliminación después de 3 segundos
    setTimeout(() => {
        alert.remove();
    }, 3000);
}

// Función para mostrar el modal de checkout
function mostrarModalCheckout() {
    const modal = document.getElementById('modal-checkout');
    if (modal) {
        modal.style.display = 'block';
    }
}

// Función para cerrar el modal de checkout
function cerrarModalCheckout() {
    const modal = document.getElementById('modal-checkout');
    if (modal) {
        modal.style.display = 'none';
    }
}

// Función para validar el formulario de checkout
function validarFormularioCheckout(formData) {
    let isValid = true;
    const errors = {};

    // Validar dirección (Comentada para dejar vacio, se retira por local)
    // if (!formData.direccion || formData.direccion.trim() === '') {
    //     errors.direccion = 'Por favor ingrese una dirección';
    //     isValid = false;
    // }

    // Validar método de pago
    if (!formData.metodoPago) {
        errors.metodoPago = 'Seleccione un método de pago';
        isValid = false;
    }

    // Validar detalles de tarjeta 
    if (formData.metodoPago === 'tarjeta') {
        if (!formData.numeroTarjeta || !/^\d{16}$/.test(formData.numeroTarjeta)) {
            errors.numeroTarjeta = 'Ingrese un número de tarjeta válido (16 dígitos)';
            isValid = false;
        }
        if (!formData.vencimiento || !/^(0[1-9]|1[0-2])\/?([0-9]{2})$/.test(formData.vencimiento)) {
            errors.vencimiento = 'Ingrese una fecha de vencimiento válida (MM/YY)';
            isValid = false;
        }
        if (!formData.cvv || !/^\d{3,4}$/.test(formData.cvv)) {
            errors.cvv = 'Ingrese un CVV válido (3 o 4 dígitos)';
            isValid = false;
        }
    }

    return { isValid, errors };
}

// Función para mostrar errores en el formulario
function mostrarErroresFormulario(errors) {
    for (const [field, message] of Object.entries(errors)) {
        const errorElement = document.getElementById(`error-${field}`);
        if (errorElement) {
            errorElement.textContent = message;
            errorElement.style.display = 'block';
        }
    }
}

// Función para limpiar errores del formulario
function limpiarErroresFormulario() {
    document.querySelectorAll('.error-message').forEach(el => {
        el.textContent = '';
        el.style.display = 'none';
    });
}

// // Función para procesar el pago
// function procesarPago(formData) {
//     const usuario = JSON.parse(sessionStorage.getItem('usuarioLogueado'));
//     const carrito = JSON.parse(localStorage.getItem('carrito')) || [];
//     const total = carrito.reduce((sum, item) => {
//         const producto = obtenerProductoPorId(item.id);
//         return sum + (producto?.precio || producto?.price || 0) * item.cantidad;
//     }, 0);

//     const pedido = {
//         id: generarIdPedido(),
//         fecha: new Date().toISOString(),
//         usuario: {
//             email: usuario.email,
//             nombre: usuario.nombre
//         },
//         items: [...carrito],
//         subtotal: total,
//         envio: formData.direccion ? 500 : 0,
//         total: total + (formData.direccion ? 500 : 0),
//         metodoPago: formData.metodoPago,
//         direccion: formData.direccion || 'Retiro en local',
//         notas: formData.comentarios || 'Ninguna',
//         estado: 'pendiente',
//         fechaEntrega: new Date(Date.now() + 3600000).toISOString()
//     };

//     // Guardar pedido
//     const pedidos = JSON.parse(localStorage.getItem('pedidos')) || [];
//     pedidos.push(pedido);
//     localStorage.setItem('pedidos', JSON.stringify(pedidos));
//     sessionStorage.setItem('ultimoPedido', JSON.stringify(pedido));

//     // Limpiar carrito
//     localStorage.removeItem('carrito');
    
//     return pedido;
// }
// Función para procesar el pago v2
function procesarPago(formData) {
    const usuario = JSON.parse(sessionStorage.getItem('usuarioLogueado'));
    const carrito = JSON.parse(localStorage.getItem('carrito')) || [];
    
    // Mapeo de métodos de pago
    const metodosPago = {
        '1': 'Efectivo',
        '2': 'Tarjeta de crédito',
        '3': 'Tarjeta de débito', 
        '4': 'Transferencia bancaria',
        '5': 'Mercado Pago'
    };

    const total = carrito.reduce((sum, item) => {
        const producto = obtenerProductoPorId(item.id);
        return sum + (producto?.precio || producto?.price || 0) * item.cantidad;
    }, 0);

    const pedido = {
        id: generarIdPedido(),
        fecha: new Date().toISOString(),
        usuario: {
            email: usuario.email,
            nombre: usuario.nombre
        },
        items: [...carrito],
        subtotal: total,
        envio: formData.direccion ? 500 : 0,
        total: total + (formData.direccion ? 500 : 0),
        metodoPago: metodosPago[formData.metodoPago] || formData.metodoPago, // Usamos el mapeo 
        metodoPagoCodigo: formData.metodoPago, // Guardamos también el código original
        direccion: formData.direccion || 'Retiro en local',
        notas: formData.comentarios || 'Ninguna',
        estado: 'pendiente',
        fechaEntrega: new Date(Date.now() + 3600000).toISOString()
    };

    // Guardar pedido
    const pedidos = JSON.parse(localStorage.getItem('pedidos')) || [];
    pedidos.push(pedido);
    localStorage.setItem('pedidos', JSON.stringify(pedidos));
    sessionStorage.setItem('ultimoPedido', JSON.stringify(pedido));

    // Limpiar carrito
    localStorage.removeItem('carrito');
    
    return pedido;
}

document.addEventListener('DOMContentLoaded', function() {
    // eventos para agregar productos al carrito
    document.body.addEventListener('click', function(e) {
        const btn = e.target.closest('.btn-agregar');
        if (btn) {
            const id = btn.getAttribute('data-id');
            const origen = btn.getAttribute('data-origen');
            if (id) {
                agregarAlCarrito(id, origen);
            }
        }
    });

    // Elementos del DOM del carrito
    const listaCarrito = document.getElementById('lista-carrito');
    if (!listaCarrito) return;

    const totalMonto = document.getElementById('total-monto');
    const btnVaciar = document.getElementById('vaciar-carrito');
    const btnFinalizar = document.getElementById('finalizar-compra');
    
    // Cargar carrito desde localStorage
    let carrito = JSON.parse(localStorage.getItem('carrito')) || [];
    
    // Renderizar carrito al cargar la página
    renderizarCarrito();
    
    // Event Listeners
    if (btnVaciar) btnVaciar.addEventListener('click', vaciarCarrito);
    if (btnFinalizar) btnFinalizar.addEventListener('click', mostrarModalCheckout);
    
    // Configurar eventos del modal de checkout
    const modal = document.getElementById('modal-checkout');
    if (modal) {
        // Cerrar modal al hacer clic en la X
        const spanCerrar = modal.querySelector('.cerrar-modal');
        if (spanCerrar) {
            spanCerrar.addEventListener('click', cerrarModalCheckout);
        }

        // Cerrar modal al hacer clic fuera del contenido
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                cerrarModalCheckout();
            }
        });

        // Manejar cambio de método de pago
        const metodoPagoSelect = modal.querySelector('#metodo-pago');
        if (metodoPagoSelect) {
            metodoPagoSelect.addEventListener('change', function() {
                const detallesTarjeta = modal.querySelector('#detalles-tarjeta');
                if (detallesTarjeta) {
                    detallesTarjeta.style.display = this.value === 'tarjeta' ? 'block' : 'none';
                }
            });
        }

        // Manejar envío del formulario
        const formularioCheckout = modal.querySelector('#formulario-checkout');
        if (formularioCheckout) {
            formularioCheckout.addEventListener('submit', function(e) {
                e.preventDefault();
                limpiarErroresFormulario();

                const formData = {
                    direccion: this.direccion.value.trim(),
                    metodoPago: this['metodo-pago'].value,
                    numeroTarjeta: this['numero-tarjeta']?.value.trim(),
                    vencimiento: this['vencimiento-tarjeta']?.value.trim(),
                    cvv: this['cvv-tarjeta']?.value.trim(),
                    comentarios: this.comentarios.value.trim()
                };

                const { isValid, errors } = validarFormularioCheckout(formData);

                if (isValid) {
                    const pedido = procesarPago(formData);
                    cerrarModalCheckout();
                    
                    if (confirm(`Pedido #${pedido.id} creado con éxito. ¿Desea ver el comprobante?`)) {
                        window.location.href = `/paginas/comprobante.html?id=${pedido.id}`;
                    } else {
                        window.location.href = '/index.html';
                    }
                } else {
                    mostrarErroresFormulario(errors);
                }
            });
        }
    }

    // Función para renderizar el carrito
    function renderizarCarrito() {
        listaCarrito.innerHTML = '';
        
        if (carrito.length === 0) {
            listaCarrito.innerHTML = '<li class="carrito-vacio">Tu carrito está vacío</li>';
            totalMonto.textContent = '0.00';
            if (btnFinalizar) btnFinalizar.disabled = true;
            if (btnVaciar) btnVaciar.disabled = true;
            return;
        }
        
        if (btnFinalizar) btnFinalizar.disabled = false;
        if (btnVaciar) btnVaciar.disabled = false;
        
        let total = 0;
        
        carrito.forEach((item, index) => {
            const producto = obtenerProductoPorId(item.id);
            if (!producto) return;

            const subtotal = (producto.precio || producto.price) * item.cantidad;
            total += subtotal;

            let imagen = '../img/productos/placeholder.webp';
            const origen = producto.origen;
            if (origen === 'repo' && producto.imagen) {
                if (producto.imagen.startsWith('http')) {
                    imagen = producto.imagen;
                } else if (producto.imagen.includes('productos/')) {
                    imagen = 'https://d3m4rc0.github.io/API-Productos-Resto/img/' + producto.imagen;
                } else {
                    imagen = 'https://d3m4rc0.github.io/API-Productos-Resto/img/productos/' + producto.imagen;
                }
            } else if (origen === 'local' && producto.imagen) {
                if (producto.imagen.startsWith('http')) {
                    imagen = producto.imagen;
                } else if (producto.imagen.startsWith('img/')) {
                    imagen = '../' + producto.imagen;
                } else {
                    imagen = '../img/productos/' + producto.imagen;
                }
            } else if (producto.imagen) {
                if (producto.imagen.startsWith('http')) {
                    imagen = producto.imagen;
                } else if (producto.imagen.startsWith('img/')) {
                    imagen = '../' + producto.imagen;
                } else {
                    imagen = producto.imagen;
                }
            } else if (producto.image) {
                imagen = producto.image;
            }

            const li = document.createElement('li');
            li.className = 'item-carrito';
            li.innerHTML = `
                <img src="${imagen}"
                     alt="${producto.nombre || producto.title}"
                     onerror="this.onerror=null;this.src='../img/productos/placeholder.webp';">
                <div class="item-info">
                    <h3>${producto.nombre || producto.title}</h3>
                    <p class="item-precio">$${(producto.precio || producto.price).toFixed(2)}</p>
                    <div class="item-controls">
                        <div class="item-cantidad">
                            <button class="btn-cantidad disminuir" data-index="${index}">-</button>
                            <span>${item.cantidad}</span>
                            <button class="btn-cantidad aumentar" data-index="${index}">+</button>
                        </div>
                        <button class="btn-eliminar" data-index="${index}">
                            <i class="fas fa-trash-alt"></i>
                        </button>
                    </div>
                    <p class="item-subtotal">Subtotal: $${subtotal.toFixed(2)}</p>
                </div>
            `;

            listaCarrito.appendChild(li);
        });
        
        totalMonto.textContent = total.toFixed(2);
        
        // Agregar eventos a los botones de cantidad y eliminar
        document.querySelectorAll('.disminuir').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                modificarCantidad(parseInt(btn.dataset.index), -1);
            });
        });
        
        document.querySelectorAll('.aumentar').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                modificarCantidad(parseInt(btn.dataset.index), 1);
            });
        });
        
        document.querySelectorAll('.btn-eliminar').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                eliminarDelCarrito(parseInt(btn.dataset.index));
            });
        });
        
        actualizarContadorCarrito();
    }
    
    // Función para modificar cantidad de un producto
    function modificarCantidad(index, cambio) {
        const nuevaCantidad = carrito[index].cantidad + cambio;
        
        if (nuevaCantidad < 1) {
            if (confirm('¿Desea eliminar este producto del carrito?')) {
                eliminarDelCarrito(index);
            }
            return;
        }
        
        carrito[index].cantidad = nuevaCantidad;
        guardarCarrito();
        renderizarCarrito();
    }
    
    // Función para eliminar producto del carrito
    function eliminarDelCarrito(index) {
        carrito.splice(index, 1);
        guardarCarrito();
        renderizarCarrito();
        showAlert('Producto eliminado del carrito');
    }
    
    // Función para vaciar el carrito
    function vaciarCarrito() {
        if (confirm('¿Estás seguro que deseas vaciar el carrito?')) {
            carrito = [];
            guardarCarrito();
            renderizarCarrito();
            showAlert('Carrito vaciado');
        }
    }
    
    // Función para guardar carrito en localStorage
    function guardarCarrito() {
        localStorage.setItem('carrito', JSON.stringify(carrito));
        actualizarContadorCarrito();
    }
    
    // Función para actualizar contador en el nav
    function actualizarContadorCarrito() {
        const contador = document.getElementById('carrito-contador');
        if (contador) {
            contador.textContent = carrito.reduce((total, item) => total + item.cantidad, 0);
        }
    }
});

// Función global para agregar productos al carrito
function agregarAlCarrito(productoId, origen = null) {
    const usuario = JSON.parse(sessionStorage.getItem('usuarioLogueado'));
    if (!usuario) {
        if (confirm('Para agregar productos al carrito necesitas iniciar sesión. ¿Deseas ir al login?')) {
            window.location.href = '/paginas/login.html';
        }
        return;
    }

    let idFinal = productoId;
    if (origen === 'api' && !String(productoId).startsWith('api-')) {
        idFinal = 'api-' + productoId;
    } else if (origen === 'local' && !String(productoId).startsWith('local-')) {
        idFinal = 'local-' + productoId;
    }

    let carrito = JSON.parse(localStorage.getItem('carrito')) || [];
    const productoExistente = carrito.find(item => item.id == idFinal);

    if (productoExistente) {
        productoExistente.cantidad += 1;
    } else {
        carrito.push({
            id: idFinal,
            cantidad: 1
        });
    }

    localStorage.setItem('carrito', JSON.stringify(carrito));

    const producto = obtenerProductoPorId(idFinal);
    if (producto) {
        showAlert(`¡${producto.nombre || producto.title} agregado al carrito!`);
    }

    const contador = document.getElementById('carrito-contador');
    if (contador) {
        contador.textContent = carrito.reduce((total, item) => total + item.cantidad, 0);
    }
}

// Función para obtener producto por ID
function obtenerProductoPorId(id) {
    // Buscar en productos locales
    const productosLocales = JSON.parse(localStorage.getItem('productos')) || [];
    let producto = productosLocales.find(p => {
        const pid = p.id || p.idProducto;
        return pid == id || 'local-' + pid == id;
    });
    if (producto) return producto;

    // Buscar en productos de la API
    const productosApi = JSON.parse(localStorage.getItem('productosApi')) || [];
    producto = productosApi.find(p => {
        const pid = p.id || p.idProducto;
        return pid == id || 'api-' + pid == id;
    });
    if (producto) return producto;

    // Buscar en productos de la API global
    if (window.productosApi && Array.isArray(window.productosApi)) {
        producto = window.productosApi.find(p => {
            const pid = p.id || p.idProducto;
            return pid == id || 'api-' + pid == id;
        });
        if (producto) return producto;
    }

    return null;
}

// Normalizar y guardar productos de la API
function guardarProductosApiNormalizados(productosApi) {
    const normalizados = productosApi.map(p => ({
        id: 'api-' + (p.id || p.idProducto),
        nombre: p.title || p.nombre || '',
        descripcion: p.description || p.descripcion || '',
        precio: p.price || p.precio || 0,
        imagen: p.image || p.imagen || '',
        categoria: p.category || p.categoria || '',
        stock: p.stock !== undefined ? p.stock : 10
    }));
    localStorage.setItem('productosApi', JSON.stringify(normalizados));
}

// para generar ID de pedido
function generarIdPedido() {
    return 'PED-' + Date.now().toString(36).toUpperCase();
}