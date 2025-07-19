document.addEventListener('DOMContentLoaded', function() {
    // Verificar si es admin
    const usuario = JSON.parse(sessionStorage.getItem('usuarioLogueado'));
    if (!usuario || !usuario.esAdmin) {
        window.location.href = '/index.html';
        return;
    }

    // Elements del DOM
    const listaPedidos = document.getElementById('lista-pedidos');
    const listaProductos = document.getElementById('lista-productos-admin');
    const btnAgregarProducto = document.getElementById('btn-agregar-producto');
    const modal = document.getElementById('modal-producto');
    const closeModal = document.querySelector('.close-modal');
    const formProducto = document.getElementById('form-producto');
    const filtroEstado = document.getElementById('filtro-estado');
    // Filtro por fecha para pedidos
    let filtroFecha = document.getElementById('filtro-fecha-pedidos');
    if (!filtroFecha && listaPedidos && listaPedidos.parentNode) {
        filtroFecha = document.createElement('input');
        filtroFecha.type = 'date';
        filtroFecha.id = 'filtro-fecha-pedidos';
        filtroFecha.style.margin = '0 0.5rem 0.5rem 0';
        listaPedidos.parentNode.insertBefore(filtroFecha, listaPedidos);
    }
    // Botón eliminar todos los pedidos
    let btnEliminarTodos = document.getElementById('btn-eliminar-todos-pedidos');
    if (!btnEliminarTodos && listaPedidos && listaPedidos.parentNode) {
        btnEliminarTodos = document.createElement('button');
        btnEliminarTodos.id = 'btn-eliminar-todos-pedidos';
        btnEliminarTodos.textContent = 'Eliminar TODOS los pedidos';
        btnEliminarTodos.style.margin = '0 0.5rem 0.5rem 0';
        btnEliminarTodos.className = 'btn-eliminar-todos';
        listaPedidos.parentNode.insertBefore(btnEliminarTodos, listaPedidos);
    }
    // Agregar opción 'archivados' al filtro si no existe
    if (filtroEstado && !Array.from(filtroEstado.options).some(opt => opt.value === 'archivado')) {
        const optArch = document.createElement('option');
        optArch.value = 'archivado';
        optArch.textContent = 'Archivados';
        filtroEstado.appendChild(optArch);
    }

    // Cargar datos iniciales
    cargarPedidos();
    cargarProductos();
    cargarEstadisticas();

    // Event Listeners
    btnAgregarProducto.addEventListener('click', abrirModalProducto);
    closeModal.addEventListener('click', cerrarModal);
    filtroEstado.addEventListener('change', cargarPedidos);
    formProducto.addEventListener('submit', guardarProducto);
    if (filtroFecha) filtroFecha.addEventListener('change', cargarPedidos);
    if (btnEliminarTodos) btnEliminarTodos.addEventListener('click', function() {
        if (confirm('¿Seguro que deseas eliminar TODOS los pedidos? Esta acción no se puede deshacer.')) {
            localStorage.removeItem('pedidos');
            cargarPedidos();
            cargarEstadisticas();
            showAlert('Todos los pedidos han sido eliminados', 'danger');
        }
    });

    // Cerrar modal al hacer clic fuera
    window.addEventListener('click', function(event) {
        if (event.target === modal) {
            cerrarModal();
        }
    });

    function cargarPedidos() {
        const estado = filtroEstado.value;
        const pedidos = JSON.parse(localStorage.getItem('pedidos')) || [];
        let pedidosFiltrados = pedidos;
        // Filtro por fecha (si está seleccionado)
        const filtroFecha = document.getElementById('filtro-fecha-pedidos');
        let fechaSeleccionada = filtroFecha && filtroFecha.value ? filtroFecha.value : null;
        if (fechaSeleccionada) {
            pedidosFiltrados = pedidosFiltrados.filter(p => p.fecha && p.fecha.startsWith(fechaSeleccionada));
        }
        // Filtro por estado
        if (estado === 'archivado') {
            pedidosFiltrados = pedidosFiltrados.filter(p => p.estado === 'archivado');
        } else if (estado !== 'todos') {
            pedidosFiltrados = pedidosFiltrados.filter(p => p.estado === estado && p.estado !== 'archivado');
        } else {
            // 'todos' muestra todos menos los archivados xd
            pedidosFiltrados = pedidosFiltrados.filter(p => p.estado !== 'archivado');
        }
        
        listaPedidos.innerHTML = '';
        
        if (pedidosFiltrados.length === 0) {
            listaPedidos.innerHTML = '<p class="sin-resultados">No hay pedidos</p>';
            return;
        }
        
        // Ordena por fecha (más recientes primero)
        pedidosFiltrados.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
        
        pedidosFiltrados.forEach(pedido => {
            const pedidoElement = document.createElement('div');
            pedidoElement.className = 'pedido-item';
            pedidoElement.innerHTML = `
                <div class="pedido-header">
                    <span class="pedido-id">#${pedido.id}</span>
                    <span class="pedido-fecha">${formatearFecha(pedido.fecha)}</span>
                    <span class="pedido-estado ${pedido.estado}">${pedido.estado}</span>
                </div>
                <div class="pedido-cliente">
                    <span><i class="fas fa-user"></i> ${pedido.usuario.nombre}</span>
                    <span><i class="fas fa-dollar-sign"></i> $${pedido.total.toFixed(2)}</span>
                </div>
                <div class="pedido-acciones">
                    <button class="btn-ver" data-id="${pedido.id}">
                        <i class="fas fa-eye"></i> Ver
                    </button>
                    <select class="cambiar-estado" data-id="${pedido.id}">
                        <option value="pendiente" ${pedido.estado === 'pendiente' ? 'selected' : ''}>Pendiente</option>
                        <option value="preparacion" ${pedido.estado === 'preparacion' ? 'selected' : ''}>En preparación</option>
                        <option value="enviado" ${pedido.estado === 'enviado' ? 'selected' : ''}>Enviado</option>
                        <option value="completado" ${pedido.estado === 'completado' ? 'selected' : ''}>Completado</option>
                    </select>
                    <button class="btn-cancelar" data-id="${pedido.id}" title="Cancelar"><i class="fas fa-ban"></i></button>
                    <button class="btn-archivar" data-id="${pedido.id}" title="Archivar"><i class="fas fa-archive"></i></button>
                    <button class="btn-eliminar-pedido" data-id="${pedido.id}" title="Eliminar"><i class="fas fa-trash"></i></button>
                </div>
            `;
            listaPedidos.appendChild(pedidoElement);
        });
        
        // Agregar eventos a los botones
        document.querySelectorAll('.btn-ver').forEach(btn => {
            btn.addEventListener('click', function() {
                const pedidoId = this.dataset.id;
                verPedido(pedidoId);
            });
        });
        document.querySelectorAll('.cambiar-estado').forEach(select => {
            select.addEventListener('change', function() {
                const pedidoId = this.dataset.id;
                const nuevoEstado = this.value;
                actualizarEstadoPedido(pedidoId, nuevoEstado);
            });
        });
        document.querySelectorAll('.btn-cancelar').forEach(btn => {
            btn.addEventListener('click', function() {
                const pedidoId = this.dataset.id;
                cancelarPedido(pedidoId);
            });
        });
        document.querySelectorAll('.btn-archivar').forEach(btn => {
            btn.addEventListener('click', function() {
                const pedidoId = this.dataset.id;
                archivarPedido(pedidoId);
            });
        });
        document.querySelectorAll('.btn-eliminar-pedido').forEach(btn => {
            btn.addEventListener('click', function() {
                const pedidoId = this.dataset.id;
                eliminarPedido(pedidoId);
            });
        });
    // Cancelar pedido (marca como cancelado, no elimina)
    function cancelarPedido(id) {
        const pedidos = JSON.parse(localStorage.getItem('pedidos')) || [];
        const pedido = pedidos.find(p => p.id === id);
        if (pedido && pedido.estado !== 'cancelado') {
            pedido.estado = 'cancelado';
            localStorage.setItem('pedidos', JSON.stringify(pedidos));
            cargarPedidos();
            showAlert(`Pedido #${id} cancelado`, 'warning');
        }
    }

    // Archivar pedido (marca como archivado, no elimina - reversible desde combobox)
    function archivarPedido(id) {
        const pedidos = JSON.parse(localStorage.getItem('pedidos')) || [];
        const pedido = pedidos.find(p => p.id === id);
        if (pedido && pedido.estado !== 'archivado') {
            pedido.estado = 'archivado';
            localStorage.setItem('pedidos', JSON.stringify(pedidos));
            cargarPedidos();
            showAlert(`Pedido #${id} archivado`, 'info');
        }
    }

    // Eliminar pedido (borrado 'físico')
    function eliminarPedido(id) {
        if (confirm('¿Seguro que deseas eliminar este pedido? Esta acción no se puede deshacer.')) {
            let pedidos = JSON.parse(localStorage.getItem('pedidos')) || [];
            pedidos = pedidos.filter(p => p.id !== id);
            localStorage.setItem('pedidos', JSON.stringify(pedidos));
            cargarPedidos();
            showAlert(`Pedido #${id} eliminado`, 'danger');
        }
    }
    }
    
    function cargarProductos() {
        const productos = JSON.parse(localStorage.getItem('productos')) || [];
        listaProductos.innerHTML = '';
        // Filtro para mostrar productos ocultos
        let filtroOcultos = document.getElementById('filtro-productos');
        if (!filtroOcultos) {
            filtroOcultos = document.createElement('select');
            filtroOcultos.id = 'filtro-productos';
            filtroOcultos.innerHTML = `
                <option value="visibles">Visibles</option>
                <option value="ocultos">Ocultos</option>
                <option value="todos">Todos</option>
            `;
            listaProductos.parentNode.insertBefore(filtroOcultos, listaProductos);
            filtroOcultos.addEventListener('change', cargarProductos);
        }
        const modo = filtroOcultos.value || 'visibles';
        let productosFiltrados = productos;
        if (modo === 'visibles') {
            productosFiltrados = productos.filter(p => !p.oculto);
        } else if (modo === 'ocultos') {
            productosFiltrados = productos.filter(p => p.oculto);
        }
        if (productosFiltrados.length === 0) {
            listaProductos.innerHTML = '<p class="sin-resultados">No hay productos</p>';
            return;
        }
        productosFiltrados.forEach(producto => {
            let imagen = '/img/productos/placeholder.webp';
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
                    imagen = '/' + producto.imagen;
                } else {
                    imagen = '/img/productos/' + producto.imagen;
                }
            } else if (origen === 'api' && producto.imagen) {
                if (producto.imagen.startsWith('http')) {
                    imagen = producto.imagen;
                } else {
                    imagen = producto.imagen;
                }
            } else if (producto.imagen) {
                if (producto.imagen.startsWith('http')) {
                    imagen = producto.imagen;
                } else if (producto.imagen.startsWith('img/')) {
                    imagen = '/' + producto.imagen;
                } else {
                    imagen = producto.imagen;
                }
            } else if (producto.image) {
                imagen = producto.image;
            }
            const productoElement = document.createElement('div');
            productoElement.className = 'producto-item';
            productoElement.innerHTML = `
                <div class="producto-imagen">
                    <img src="${imagen}" 
                         alt="${producto.nombre || producto.title}" 
                         onerror="this.src='/img/productos/placeholder.webp'">
                </div>
                <div class="producto-info">
                    <h3>${producto.nombre || producto.title}</h3>
                    <p class="producto-precio">$${(producto.precio || producto.price).toFixed(2)}</p>
                    <p class="producto-stock ${producto.stock <= 0 ? 'agotado' : ''}">Stock: ${producto.stock}</p>
                </div>
                <div class="producto-acciones">
                    <button class="btn-editar" data-id="${producto.id}"><i class="fas fa-edit"></i></button>
                    <button class="btn-eliminar" data-id="${producto.id}"><i class="fas fa-trash"></i></button>
                    ${producto.oculto ? `<button class="btn-restaurar" data-id="${producto.id}"><i class="fas fa-eye"></i> Restaurar</button>` : `<button class="btn-ocultar" data-id="${producto.id}"><i class="fas fa-eye-slash"></i> Ocultar</button>`}
                </div>
            `;
            listaProductos.appendChild(productoElement);
        });

        if (!document.getElementById('modal-json-repo')) {
            const modalJson = document.createElement('div');
            modalJson.id = 'modal-json-repo';
            modalJson.className = 'modal';
            modalJson.style.display = 'none';
            modalJson.innerHTML = `
                <div class="modal-content" style="max-width:600px;">
                    <span class="close-modal" id="close-json-modal" style="cursor:pointer;">&times;</span>
                    <h3>JSON generado para repo/API</h3>
                    <textarea id="json-repo-textarea" style="width:100%;height:200px;"></textarea>
                    <button id="copiar-json-repo">Copiar</button>
                    <button id="descargar-json-repo">Descargar</button>
                </div>
            `;
            document.body.appendChild(modalJson);
        }

        let clickCount = 0;
        let lastClickTime = 0;
        document.querySelectorAll('.btn-editar').forEach(btn => {
            btn.addEventListener('click', function(e) {
                const now = Date.now();
                if (now - lastClickTime < 500) {
                    clickCount++;
                } else {
                    clickCount = 1;
                }
                lastClickTime = now;
                if (clickCount === 5) {
                    clickCount = 0;
                    const json = sessionStorage.getItem('jsonProductoRepo');
                    if (json) {
                        document.getElementById('json-repo-textarea').value = json;
                        document.getElementById('modal-json-repo').style.display = 'block';
                    } else {
                        alert('No hay JSON generado. Marca "Guardar en repo/API" al agregar o editar un producto.');
                    }
                }
            });
        });
        // Cerrar modal
        document.getElementById('close-json-modal').onclick = function() {
            document.getElementById('modal-json-repo').style.display = 'none';
        };
        document.getElementById('copiar-json-repo').onclick = function() {
            const txt = document.getElementById('json-repo-textarea');
            txt.select();
            document.execCommand('copy');
            showAlert('JSON copiado al portapapeles');
        };
        document.getElementById('descargar-json-repo').onclick = function() {
            const txt = document.getElementById('json-repo-textarea').value;
            const blob = new Blob([txt], {type: 'application/json'});
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'producto-repo.json';
            a.click();
            URL.revokeObjectURL(url);
        };
        
        // Agregar eventos a los botones
        document.querySelectorAll('.btn-editar').forEach(btn => {
            btn.addEventListener('click', function() {
                const productoId = this.dataset.id;
                editarProducto(productoId);
            });
        });
        document.querySelectorAll('.btn-eliminar').forEach(btn => {
            btn.addEventListener('click', function() {
                const productoId = this.dataset.id;
                eliminarProducto(productoId);
            });
        });
        document.querySelectorAll('.btn-ocultar').forEach(btn => {
            btn.addEventListener('click', function() {
                const productoId = this.dataset.id;
                ocultarProducto(productoId);
            });
        });
        document.querySelectorAll('.btn-restaurar').forEach(btn => {
            btn.addEventListener('click', function() {
                const productoId = this.dataset.id;
                restaurarProducto(productoId);
            });
        });
    // Ocultar producto (borrado lógico - no borra 'fisicamente')
    function ocultarProducto(id) {
        const productos = JSON.parse(localStorage.getItem('productos')) || [];
        const producto = productos.find(p => p.id === id);
        if (producto && !producto.oculto) {
            producto.oculto = true;
            localStorage.setItem('productos', JSON.stringify(productos));
            cargarProductos();
            cargarEstadisticas();
            showAlert('Producto ocultado', 'warning');
        }
    }

    // Restaurar producto oculto
    function restaurarProducto(id) {
        const productos = JSON.parse(localStorage.getItem('productos')) || [];
        const producto = productos.find(p => p.id === id);
        if (producto && producto.oculto) {
            producto.oculto = false;
            localStorage.setItem('productos', JSON.stringify(productos));
            cargarProductos();
            cargarEstadisticas();
            showAlert('Producto restaurado', 'success');
        }
    }
    }
    
    function cargarEstadisticas() {
        const pedidos = JSON.parse(localStorage.getItem('pedidos')) || [];
        const productos = JSON.parse(localStorage.getItem('productos')) || [];
        
        // Pedidos de hoy
        const hoy = new Date().toISOString().split('T')[0];
        const pedidosHoy = pedidos.filter(p => p.fecha.split('T')[0] === hoy).length;
        
        // Ganancias de hoy
        const gananciasHoy = pedidos
            .filter(p => p.fecha.split('T')[0] === hoy)
            .reduce((total, p) => total + p.total, 0);
        
        // Productos activos (con stock)
        const productosActivos = productos.filter(p => p.stock > 0).length;
        
        // Actualizar Uui
        document.getElementById('pedidos-hoy').textContent = pedidosHoy;
        document.getElementById('ganancias-hoy').textContent = `$${gananciasHoy.toFixed(2)}`;
        document.getElementById('productos-activos').textContent = productosActivos;
    }
    
    function abrirModalProducto(producto = null) {
        const modalTitulo = document.getElementById('modal-titulo');
        const form = document.getElementById('form-producto');
        
        // // Agregar checkbox para guardar en repo/API si no existe
        // let checkRepo = document.getElementById('guardar-en-repo');
        // if (!checkRepo) {
        //     const div = document.createElement('div');
        //     div.className = 'form-group';
        //     // div.style.display = 'flex';
        //     // div.style.alignItems = 'center';
        //     // div.style.marginTop = '0.5rem';
        //     div.innerHTML = `<input type="checkbox" id="guardar-en-repo""> <label for="guardar-en-repo" >Guardar en repo/API</label>`;
        //     // Insertar después del botón guardar producto
        //     const btnGuardar = form.querySelector('.btn-guardar');
        //     if (btnGuardar && btnGuardar.nextSibling) {
        //         form.insertBefore(div, btnGuardar.nextSibling);
        //     } else {
        //         form.appendChild(div);
        //     }
        // }
        // Agregar checkbox para guardar en repo/API si no existe
    let checkRepo = document.getElementById('guardar-en-repo');
    if (!checkRepo) {
        const div = document.createElement('div');
        div.className = 'form-group checkbox-group'; // Agrega la clase checkbox-group
        div.innerHTML = `<input type="checkbox" id="guardar-en-repo"> <label for="guardar-en-repo">Guardar en repo/API</label>`;
        
        // Insertar después del botón guardar producto
        const btnGuardar = form.querySelector('.btn-guardar');
        if (btnGuardar && btnGuardar.nextSibling) {
            form.insertBefore(div, btnGuardar.nextSibling);
        } else {
            form.appendChild(div);
        }
    }
        if (producto) {
            modalTitulo.textContent = 'Editar Producto';
            document.getElementById('producto-id').value = producto.id;
            document.getElementById('producto-nombre').value = producto.nombre;
            document.getElementById('producto-precio').value = producto.precio;
            document.getElementById('producto-stock').value = producto.stock;
            document.getElementById('producto-categoria').value = producto.categoria || 'comida';
            document.getElementById('producto-descripcion').value = producto.descripcion || '';
            document.getElementById('producto-imagen').value = producto.imagen || '';
            document.getElementById('guardar-en-repo').checked = false;
        } else {
            modalTitulo.textContent = 'Nuevo Producto';
            form.reset();
            document.getElementById('guardar-en-repo').checked = false;
        }
        modal.style.display = 'block';
    }
    
    function cerrarModal() {
        modal.style.display = 'none';
    }
    
    function guardarProducto(e) {
        e.preventDefault();
        
        const productos = JSON.parse(localStorage.getItem('productos')) || [];
        const productoId = document.getElementById('producto-id').value;
        
        // Generar id único.
        let nuevoId;
        if (productoId && productoId !== 'undefined') {
            nuevoId = Number(productoId);
        } else {
            nuevoId = Date.now();
        }
        const producto = {
            id: nuevoId,
            nombre: document.getElementById('producto-nombre').value,
            precio: parseFloat(document.getElementById('producto-precio').value),
            stock: parseInt(document.getElementById('producto-stock').value),
            categoria: document.getElementById('producto-categoria').value,
            descripcion: document.getElementById('producto-descripcion').value,
            imagen: document.getElementById('producto-imagen').value || 'placeholder.webp'
        };
        const guardarEnRepo = document.getElementById('guardar-en-repo')?.checked;
        if (guardarEnRepo) {
            let imagenRepo = producto.imagen;
            if (imagenRepo.startsWith('img/productos/')) {
                imagenRepo = 'productos/' + imagenRepo.split('img/productos/')[1];
            } else if (imagenRepo.startsWith('/img/productos/')) {
                imagenRepo = 'productos/' + imagenRepo.split('/img/productos/')[1];
            } else if (imagenRepo.startsWith('productos/')) {
            } else if (!imagenRepo.startsWith('http') && !imagenRepo.includes('/')) {
                imagenRepo = 'productos/' + imagenRepo;
            }
            const jsonRepo = {
                id: producto.id,
                nombre: producto.nombre,
                precio: producto.precio,
                stock: producto.stock,
                categoria: producto.categoria,
                descripcion: producto.descripcion,
                imagen: imagenRepo
            };
            sessionStorage.setItem('jsonProductoRepo', JSON.stringify(jsonRepo, null, 2));
        }
        
        // Actualizar o agregar producto
        const index = productos.findIndex(p => String(p.id) === String(nuevoId));
        if (index !== -1) {
            productos[index] = producto;
        } else {
            productos.push(producto);
        }
        
        localStorage.setItem('productos', JSON.stringify(productos));
        cerrarModal();
        cargarProductos();
        cargarEstadisticas();
        
        showAlert(`Producto ${productoId && productoId !== 'undefined' ? 'actualizado' : 'agregado'} correctamente`);
    }
    
    function editarProducto(id) {
        const productos = JSON.parse(localStorage.getItem('productos')) || [];
        const producto = productos.find(p => String(p.id) === String(id));
        if (producto) {
            abrirModalProducto(producto);
        }
    }
    
    function eliminarProducto(id) {
        if (confirm('¿Estás seguro de eliminar este producto?')) {
            const productos = JSON.parse(localStorage.getItem('productos')) || [];
            const nuevosProductos = productos.filter(p => String(p.id) !== String(id));
            localStorage.setItem('productos', JSON.stringify(nuevosProductos));
            cargarProductos();
            cargarEstadisticas();
            showAlert('Producto eliminado');
        }
    }
    
    function verPedido(id) {
        const pedidos = JSON.parse(localStorage.getItem('pedidos')) || [];
        const pedido = pedidos.find(p => p.id === id);
        
        if (pedido) {
            let mensaje = `Pedido #${pedido.id}\n`;
            mensaje += `Cliente: ${pedido.usuario.nombre}\n`;
            mensaje += `Fecha: ${formatearFecha(pedido.fecha)}\n`;
            mensaje += `Estado: ${pedido.estado}\n`;
            mensaje += `Dirección: ${pedido.direccion}\n`;
            mensaje += `Método de pago: ${pedido.metodoPago}\n`;
            mensaje += `Notas: ${pedido.notas}\n\n`;
            mensaje += 'Productos:\n';
            
            pedido.items.forEach(item => {
                const producto = obtenerProductoPorId(item.id);
                mensaje += `- ${producto.nombre} x${item.cantidad} $${(producto.precio * item.cantidad).toFixed(2)}\n`;
            });
            
            mensaje += `\nTotal: $${pedido.total.toFixed(2)}`;
            
            alert(mensaje);
        }
    }
    
    function actualizarEstadoPedido(id, nuevoEstado) {
        const pedidos = JSON.parse(localStorage.getItem('pedidos')) || [];
        const pedido = pedidos.find(p => p.id === id);
        
        if (pedido) {
            pedido.estado = nuevoEstado;
            localStorage.setItem('pedidos', JSON.stringify(pedidos));
            cargarPedidos();
            
            if (nuevoEstado === 'completado') {
                showAlert(`Pedido #${id} marcado como completado`);
            }
        }
    }
    
    function formatearFecha(fechaISO) {
        const fecha = new Date(fechaISO);
        return fecha.toLocaleDateString('es-AR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }
    
    function obtenerProductoPorId(id) {
        const productos = JSON.parse(localStorage.getItem('productos')) || [];
        return productos.find(p => p.id == id || p.idProducto == id);
    }
    
    function showAlert(message, type = 'success') {
        const alert = document.createElement('div');
        alert.className = `panel-alert ${type}`;
        alert.innerHTML = `
            <i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}"></i>
            <span>${message}</span>
        `;
        
        document.body.appendChild(alert);
        
        setTimeout(() => {
            alert.remove();
        }, 3000);
    }
});