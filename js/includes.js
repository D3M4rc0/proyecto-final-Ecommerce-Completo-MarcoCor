// Maneja carga dinámica de nav y footer
function cargarIncludes() {
  // Detecta si la página está dentro de /paginas/ para ajustar ruta
  const basePath = window.location.pathname.includes('/paginas/') ? '../' : '';

  fetch(basePath + 'parciales/encabezado.html')
    .then(response => {
      if (!response.ok) throw new Error('No se pudo cargar encabezado.html');
      return response.text();
    })
    .then(data => {
      document.getElementById('encabezado').innerHTML = data;
      actualizarEstadoUsuario();
      setupEventListeners();
    })
    .catch(error => console.error(error));

  fetch(basePath + 'parciales/pie.html')
    .then(response => {
      if (!response.ok) throw new Error('No se pudo cargar pie.html');
      return response.text();
    })
    .then(data => {
      document.getElementById('pie').innerHTML = data;
    })
    .catch(error => console.error(error));
}

function actualizarEstadoUsuario() {
  const navUsuario = document.getElementById('nav-usuario');
  const navInvitado = document.getElementById('nav-invitado');
  const navAdmin = document.getElementById('nav-admin');
  const usuario = JSON.parse(sessionStorage.getItem('usuarioLogueado'));

  if (usuario) {
    if(navInvitado) navInvitado.style.display = 'none';
    if(navUsuario) navUsuario.style.display = 'flex';

    // Mostrar dashboard solo si es admin
    if (navAdmin) {
      navAdmin.style.display = usuario.esAdmin ? 'flex' : 'none';
    }

    if(document.getElementById('nombre-usuario')) {
      document.getElementById('nombre-usuario').textContent = usuario.nombre;
    }

    // Actualizar contador del carrito
    const carrito = JSON.parse(localStorage.getItem('carrito')) || [];
    if(document.getElementById('carrito-contador')) {
      document.getElementById('carrito-contador').textContent = carrito.length;
    }
  } else {
    if (navUsuario) navUsuario.style.display = 'none';
    if (navAdmin) navAdmin.style.display = 'none';
    if (navInvitado) navInvitado.style.display = 'flex';
  }
}

function setupEventListeners() {
  document.addEventListener('click', function(e) {
    if (e.target && (e.target.id === 'btn-logout' || e.target.closest('#btn-logout'))) {
      const confirmarSalida = confirm('¿Estás seguro que deseas cerrar sesión?');

      if (confirmarSalida) {
        sessionStorage.removeItem('usuarioLogueado');
        actualizarEstadoUsuario();

        const path = window.location.pathname;
        if (path.includes('/paginas/')) {
          window.location.href = '../index.html';
        } else {
          window.location.reload();
        }
      }
    }
  });

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

document.addEventListener('DOMContentLoaded', cargarIncludes);
