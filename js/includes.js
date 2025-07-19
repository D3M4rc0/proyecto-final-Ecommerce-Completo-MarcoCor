async function cargarParcial(idContenedor, rutaRelativa) {
  try {
    const response = await fetch(rutaRelativa);
    if (!response.ok) {
      throw new Error(`No se pudo cargar ${rutaRelativa} - status: ${response.status}`);
    }
    const data = await response.text();
    document.getElementById(idContenedor).innerHTML = data;
  } catch (error) {
    console.error(`Error al cargar parcial: ${error.message}`);
  }
}

function detectarBasePath() {
  // Ruta absoluta del archivo actual
  const path = window.location.pathname.toLowerCase();
  
  // Si la URL contiene "/paginas/" asumimos que hay que subir un nivel
  if (path.includes('/paginas/')) {
    console.log('Ruta base detectada: ../');
    return '../';
  }
  // Si estás en root o en otro lado
  console.log('Ruta base detectada: ./');
  return './';
}

async function cargarIncludes() {
  const basePath = detectarBasePath();

  await cargarParcial('encabezado', basePath + 'parciales/encabezado.html');
  actualizarEstadoUsuario();
  setupEventListeners();
  await cargarParcial('pie', basePath + 'parciales/pie.html');
}

function actualizarEstadoUsuario() {
  const navUsuario = document.getElementById('nav-usuario');
  const navInvitado = document.getElementById('nav-invitado');
  const navAdmin = document.getElementById('nav-admin');
  const usuario = JSON.parse(sessionStorage.getItem('usuarioLogueado'));

  if (usuario) {
    if(navInvitado) navInvitado.style.display = 'none';
    if(navUsuario) navUsuario.style.display = 'flex';

    if (navAdmin) {
      navAdmin.style.display = usuario.esAdmin ? 'flex' : 'none';
    }

    if(document.getElementById('nombre-usuario')) {
      document.getElementById('nombre-usuario').textContent = usuario.nombre;
    }

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
