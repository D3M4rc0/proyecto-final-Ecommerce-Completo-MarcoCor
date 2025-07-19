document.addEventListener("DOMContentLoaded", async () => {
  // Detectar carpeta base según el path actual
  const basePath = window.location.pathname
    .split("/")
    .slice(0, -1)
    .join("/");

  // Función para construir la ruta relativa a parciales
  function construirRutaParcial(archivo) {
    if (basePath === "" || basePath === "/") {
      return `parciales/${archivo}`;
    } else {
      const niveles = basePath.split("/").filter(Boolean).length;
      let ruta = "";
      for (let i = 0; i < niveles; i++) {
        ruta += "../";
      }
      ruta += `parciales/${archivo}`;
      return ruta;
    }
  }

  async function cargarParcial(idElemento, archivo) {
    const ruta = construirRutaParcial(archivo);
    try {
      const respuesta = await fetch(ruta);
      if (!respuesta.ok)
        throw new Error(
          `No se pudo cargar ${archivo} (ruta: ${ruta}) - status: ${respuesta.status}`
        );
      const html = await respuesta.text();
      document.getElementById(idElemento).innerHTML = html;

      if (idElemento === "encabezado") {
        actualizarEstadoUsuario();
        setupEventListeners();
      }
    } catch (error) {
      console.error(error);
    }
  }

  // Cargar encabezado y pie
  await cargarParcial("encabezado", "encabezado.html");
  await cargarParcial("pie", "pie.html");
});

// Función para actualizar la UI según el usuario logueado
function actualizarEstadoUsuario() {
  const navUsuario = document.getElementById("nav-usuario");
  const navInvitado = document.getElementById("nav-invitado");
  const navAdmin = document.getElementById("nav-admin");
  const usuario = JSON.parse(sessionStorage.getItem("usuarioLogueado"));

  if (usuario) {
    if (navInvitado) navInvitado.style.display = "none";
    if (navUsuario) navUsuario.style.display = "flex";

    if (navAdmin) navAdmin.style.display = usuario.esAdmin ? "flex" : "none";

    const nombreUsuario = document.getElementById("nombre-usuario");
    if (nombreUsuario) nombreUsuario.textContent = usuario.nombre || "Usuario";

    const carrito = JSON.parse(localStorage.getItem("carrito")) || [];
    const carritoContador = document.getElementById("carrito-contador");
    if (carritoContador) carritoContador.textContent = carrito.length;
  } else {
    if (navUsuario) navUsuario.style.display = "none";
    if (navAdmin) navAdmin.style.display = "none";
    if (navInvitado) navInvitado.style.display = "flex";
  }
}

// Configurar eventos (logout y menú hamburguesa)
function setupEventListeners() {
  document.addEventListener("click", function (e) {
    if (
      e.target &&
      (e.target.id === "btn-logout" || e.target.closest("#btn-logout"))
    ) {
      const confirmarSalida = confirm("¿Estás seguro que deseas cerrar sesión?");
      if (confirmarSalida) {
        sessionStorage.removeItem("usuarioLogueado");
        // localStorage.removeItem("carrito"); // opcional

        actualizarEstadoUsuario();

        // Redirigir o recargar según ubicación
        const path = window.location.pathname;
        if (path.includes("/paginas/")) {
          window.location.href = "../index.html";
        } else {
          window.location.reload();
        }
      }
    }
  });

  const menuHamburguesa = document.querySelector(".menu-hamburguesa");
  if (menuHamburguesa) {
    menuHamburguesa.addEventListener("click", function () {
      const navLinks = document.querySelector(".nav-links");
      if (navLinks) {
        navLinks.classList.toggle("active");
        this.classList.toggle("active");
        document.body.classList.toggle("menu-open");
      }
    });
  }
}
