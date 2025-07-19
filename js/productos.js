document.addEventListener('DOMContentLoaded', iniciarProductos);

async function iniciarProductos() {
    const contenedor = document.getElementById('contenedor-productos');
    // Botón para actualizar productos desde fuentes externas (solo admins)
    const usuario = JSON.parse(sessionStorage.getItem('usuarioLogueado'));
    if (usuario && usuario.esAdmin) {
        let btnActualizar = document.getElementById('btn-actualizar-productos');
        if (!btnActualizar) {
            btnActualizar = document.createElement('button');
            btnActualizar.id = 'btn-actualizar-productos';
            btnActualizar.textContent = 'Actualizar productos desde fuentes externas';
            btnActualizar.style = 'margin:1rem 0;display:block;background:#007bff;color:#fff;padding:0.5rem 1rem;border:none;border-radius:4px;cursor:pointer;';
            contenedor.parentNode.insertBefore(btnActualizar, contenedor);
            btnActualizar.addEventListener('click', () => {
                if (confirm('¿Seguro que deseas actualizar el catálogo? Se perderán los productos ocultos y deberás ocultarlos nuevamente.')) {
                    localStorage.removeItem('productos');
                    location.reload();
                }
            });
        }
    }
    const inputBusqueda = document.getElementById('busqueda-productos');
    const btnAnterior = document.getElementById('btn-anterior');
    const btnSiguiente = document.getElementById('btn-siguiente');
    const paginacionContenedor = document.querySelector('.paginacion');

    const URL_LOCAL = 'datos/productos-locales.json';
    const URL_REPO = 'https://d3m4rc0.github.io/API-Productos-Resto/productos.json';
    const URL_FAKE = 'https://fakestoreapi.com/products';
    const URL_IMG_REPO = 'https://d3m4rc0.github.io/API-Productos-Resto/img/productos/';
    const PLACEHOLDER = 'img/productos/placeholder.webp';

    let productosLocales = [], productosRepo = [], productosFakestore = [];
    let productosTodos = [], productosFiltrados = [];

    const productosPorPagina = 6;
    let paginaActual = 1, totalPaginas = 1;

    // Si ya hay productos en localStorage, usarlos y respetar el campo oculto
    let productosLS = JSON.parse(localStorage.getItem('productos'));
    if (Array.isArray(productosLS) && productosLS.length > 0) {
        productosTodos = productosLS.filter(p => !p.oculto);
    } else {
        // Cargar datos de las 3 fuentes solo si no hay productos en localStorag
        try { productosLocales = await (await fetch(URL_LOCAL)).json(); } catch (e) { console.error('Locales:', e); }
        try { productosRepo = await (await fetch(URL_REPO)).json(); } catch (e) { console.error('Repo:', e); }
        try { productosFakestore = await (await fetch(URL_FAKE)).json(); } catch (e) { console.error('FakeStore:', e); }
        productosTodos = [
            ...productosLocales.map(p => ({
                ...p,
                id: 'local-' + (p.id || p.idProducto),
                origen: 'local',
                stock: p.stock ?? Math.floor(Math.random() * 6)
            })),
            ...productosRepo.map(p => ({
                ...p,
                id: 'repo-' + (p.id || p.idProducto),
                origen: 'repo',
                stock: p.stock ?? Math.floor(Math.random() * 6)
            })),
            ...productosFakestore.map(p => ({
                ...p,
                id: 'api-' + (p.id || p.idProducto),
                origen: 'api',
                nombre: p.title,
                descripcion: p.description,
                precio: p.price,
                imagen: p.image,
                stock: p.stock ?? Math.floor(Math.random() * 6)
            }))
        ];
        localStorage.setItem('productos', JSON.stringify(productosTodos));
        productosTodos = productosTodos.filter(p => !p.oculto);
    }
    productosFiltrados = [...productosTodos];
    totalPaginas = Math.ceil(productosFiltrados.length / productosPorPagina);

    function renderizarPagina(pagina) {
        paginaActual = pagina;
        const inicio = (pagina - 1) * productosPorPagina;
        const fin = inicio + productosPorPagina;
        const productosAMostrar = productosFiltrados.slice(inicio, fin);

        contenedor.innerHTML = '';

        // Si no hay resultados
        if (productosFiltrados.length === 0) {
            contenedor.innerHTML = `<p class="mensaje-no-resultados" data-aos="fade-in">No se encontraron productos.</p>`;
            paginacionContenedor.style.display = 'none';
            return;
        } else {
            paginacionContenedor.style.display = 'flex';
        }

        // Crear tarjetas de producto
        productosAMostrar.forEach(p => {
            let ruta = PLACEHOLDER;
            let id = p.id;
            let origen = p.origen;
            if (origen === 'repo' && p.imagen) {
                if (p.imagen.startsWith('http')) {
                    ruta = p.imagen;
                } else if (p.imagen.includes('productos/')) {
                    ruta = 'https://d3m4rc0.github.io/API-Productos-Resto/img/' + p.imagen;
                } else {
                    ruta = URL_IMG_REPO + p.imagen;
                }
            } else if (origen === 'local' && p.imagen) {
                if (p.imagen.startsWith('http')) {
                    ruta = p.imagen;
                } else if (p.imagen.startsWith('img/')) {
                    ruta = p.imagen;
                } else if (p.imagen.startsWith('productos/')) {
                    ruta = 'img/' + p.imagen;
                } else {
                    ruta = 'img/productos/' + p.imagen;
                }
            } else if (p.imagen) {
                if (p.imagen.startsWith('http')) {
                    ruta = p.imagen;
                } else if (p.imagen.startsWith('img/')) {
                    ruta = p.imagen;
                } else if (p.imagen.startsWith('productos/')) {
                    ruta = 'img/' + p.imagen;
                } else {
                    ruta = p.imagen;
                }
            } else if (p.image) {
                ruta = p.image;
            }
            const nombre = p.nombre || p.title || 'Sin nombre';
            const desc = p.descripcion || p.description || '';
            const precio = p.precio || p.price || '';
            const agotado = p.stock !== undefined && p.stock <= 0;
            const art = document.createElement('article');
            art.classList.add('producto-card');
            if (agotado) art.classList.add('agotado');
            art.innerHTML = `
                <img src="${ruta}" alt="${nombre}" onerror="this.src='${PLACEHOLDER}'">
                <h3>${nombre}</h3>
                <p class="descripcion" title="${desc}">${desc}</p>
                <span class="precio">$${precio}</span>
                <div style="display: flex; justify-content: space-between; align-items: center; margin: 0 1rem 1rem 1rem;">
                    ${agotado ? '<span class="agotado-label">Agotado</span>' : `<button class="btn-agregar" data-id="${id}" data-origen="${origen}">Agregar al carrito</button>`}
                </div>
            `;
            contenedor.appendChild(art);
        });

        actualizarPaginacion();
    }

    function actualizarPaginacion() {
        const botonesViejos = Array.from(paginacionContenedor.querySelectorAll('.pagina-btn'))
            .filter(b => !['btn-anterior', 'btn-siguiente'].includes(b.id));
        botonesViejos.forEach(b => b.remove());

        let paginasVisibles = [];
        if (totalPaginas <= 3) {
            paginasVisibles = Array.from({ length: totalPaginas }, (_, i) => i + 1);
        } else if (paginaActual === 1) {
            paginasVisibles = [1, 2, 3];
        } else if (paginaActual === totalPaginas) {
            paginasVisibles = [totalPaginas - 2, totalPaginas - 1, totalPaginas];
        } else {
            paginasVisibles = [paginaActual - 1, paginaActual, paginaActual + 1];
        }

        paginasVisibles.forEach(num => {
            const btn = document.createElement('button');
            btn.textContent = num;
            btn.classList.add('pagina-btn');
            if (num === paginaActual) btn.classList.add('active');
            btn.addEventListener('click', () => renderizarPagina(num));
            paginacionContenedor.insertBefore(btn, btnSiguiente);
        });

        btnAnterior.disabled = paginaActual === 1;
        btnSiguiente.disabled = paginaActual === totalPaginas;
        btnAnterior.style.visibility = paginaActual === 1 ? 'hidden' : 'visible';
        btnSiguiente.style.visibility = paginaActual === totalPaginas ? 'hidden' : 'visible';
    }

    // Event listeners para navegación
    btnAnterior.addEventListener('click', () => {
        if (paginaActual > 1) renderizarPagina(paginaActual - 1);
    });
    
    btnSiguiente.addEventListener('click', () => {
        if (paginaActual < totalPaginas) renderizarPagina(paginaActual + 1);
    });

    // Búsqueda en vivo, en tiempo real
    inputBusqueda.addEventListener('input', () => {
        const texto = inputBusqueda.value.trim().toLowerCase();
        productosFiltrados = productosTodos.filter(producto => {
            // Solo productos no ocultos
            if (producto.oculto) return false;
            const nombre = (producto.nombre || producto.title || '').toLowerCase();
            const descripcion = (producto.descripcion || producto.description || '').toLowerCase();
            const categoria = (producto.categoria || producto.category || '').toLowerCase();
            return nombre.includes(texto) || descripcion.includes(texto) || categoria.includes(texto);
        });
        totalPaginas = Math.ceil(productosFiltrados.length / productosPorPagina);
        renderizarPagina(1);
    });

    // Render inicial
    renderizarPagina(1);
}