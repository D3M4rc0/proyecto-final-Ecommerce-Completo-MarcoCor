// maneja Carga nav y footer
function cargarIncludes() {
  fetch('/parciales/encabezado.html')
    .then(response => response.text())
    .then(data => {
      document.getElementById('nav-dinamico').innerHTML = data;
      actualizarEstadoUsuario();
      setupEventListeners();
    });
  
  fetch('/parciales/pie.html')
    .then(response => response.text())
    .then(data => {
      document.getElementById('footer-dinamico').innerHTML = data;
    });
}

function actualizarEstadoUsuario() {
    const navUsuario = document.getElementById('nav-usuario');
    const navInvitado = document.getElementById('nav-invitado');
    const navAdmin = document.getElementById('nav-admin');
    const usuario = JSON.parse(sessionStorage.getItem('usuarioLogueado'));
    
    if (usuario) {
        navInvitado.style.display = 'none';
        navUsuario.style.display = 'flex';
        
        // Mostrar dashboard solo si es admin
        if (navAdmin) {
            navAdmin.style.display = usuario.esAdmin ? 'flex' : 'none'; // Cambiado a flex
        }
        
        document.getElementById('nombre-usuario').textContent = usuario.nombre;
        
        // Actualizar contador del carrito
        const carrito = JSON.parse(localStorage.getItem('carrito')) || [];
        document.getElementById('carrito-contador').textContent = carrito.length;
    } else {
        if (navUsuario) navUsuario.style.display = 'none';
        if (navAdmin) navAdmin.style.display = 'none';
        if (navInvitado) navInvitado.style.display = 'flex';
    }
}

function setupEventListeners() {
    // Delegación de eventos mejorada v2
    document.addEventListener('click', function(e) {
        if (e.target && (e.target.id === 'btn-logout' || e.target.closest('#btn-logout'))) {
            // Mostrar confirmación
            const confirmarSalida = confirm('¿Estás seguro que deseas cerrar sesión?');
            
            if (confirmarSalida) {
                // Limpiar la sesión
                sessionStorage.removeItem('usuarioLogueado');
                
                // Opcional: Limpiar carrito al cerrar sesión
                // localStorage.removeItem('carrito');
                
                // Actualizar UI
                actualizarEstadoUsuario();
                
                // Redirigir a inicio indes
                // window.location.href = 'index.html';
                // Redirigir correctamente según la ubicación
                const path = window.location.pathname;
                if (path.includes('/paginas/')) {
                    window.location.href = '/index.html';
                } else {
                    window.location.reload();
                }
            }
        }
    });
    
    // Menú hamburgues
    const menuHamburguesa = document.querySelector('.menu-hamburguesa');
    if (menuHamburguesa) {
        menuHamburguesa.addEventListener('click', function() {
            const navLinks = document.querySelector('.nav-links');
            if (navLinks) {
                navLinks.classList.toggle('active');
                this.classList.toggle('active');
                document.body.classList.toggle('menu-open');
            }
        });
    }
}

// Inic
document.addEventListener('DOMContentLoaded', cargarIncludes);