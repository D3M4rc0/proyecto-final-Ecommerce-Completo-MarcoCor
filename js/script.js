// Menú hamburguesa
const menuHamburguesa = document.querySelector('.menu-hamburguesa');
const navLinks = document.querySelector('.nav-links');
const navLinksItems = document.querySelectorAll('.nav-link');

if (menuHamburguesa && navLinks) {
    menuHamburguesa.addEventListener('click', () => {
        navLinks.classList.toggle('active');
        menuHamburguesa.classList.toggle('active');
        document.body.classList.toggle('menu-open');
    });

    navLinksItems.forEach(link => {
        link.addEventListener('click', () => {
            navLinks.classList.remove('active');
            menuHamburguesa.classList.remove('active');
            document.body.classList.remove('menu-open');
        });
    });
}

// Mostrar/ocultar botón de volver arriba
window.addEventListener('scroll', () => {
    const scrollTop = document.querySelector('.scroll-top');
    if (scrollTop) {
        if (window.scrollY > 300) {
            scrollTop.classList.add('visible');
        } else {
            scrollTop.classList.remove('visible');
        }
    }
});

// Volver arriba botón (VERIFICACIÓN PREVIA)
const scrollTopButton = document.querySelector('.scroll-top');
if (scrollTopButton) {
    scrollTopButton.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
}


// Función para mostrar alertas
// function showAlert(message, type = 'success') {
//     const alert = document.createElement('div');
//     alert.style.cssText = `
//         position: fixed;
//         top: 20px;
//         right: 20px;
//         background: ${type === 'success' ? '#ff6f00' : '#dc3545'};
//         color: white;
//         padding: 15px 20px;
//         border-radius: 5px;
//         z-index: 10000;
//         font-weight: 600;
//         box-shadow: 0 4px 8px rgba(0,0,0,0.2);
//     `;
//     alert.textContent = message;
//     document.body.appendChild(alert);
//     setTimeout(() => alert.remove(), 3000);
// }
// Función para mostrar alertas globales
function showAlert(message, type = 'success') {
  // No mostrar si es el formulario de login
  if (event && event.target && event.target.id === 'form-login') return;

  const alert = document.createElement('div');
  alert.className = `global-alert ${type}`;
  alert.innerHTML = `
    <i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}"></i>
    <span>${message}</span>
  `;
  
  document.body.appendChild(alert);
  
  // Mostrar animación
  setTimeout(() => alert.classList.add('show'), 10);
  
  // Ocultar después de 3 segundos
  setTimeout(() => {
    alert.classList.remove('show');
    setTimeout(() => alert.remove(), 300);
  }, 3000);
}

// Validación y reset de formulario
const form = document.querySelector('form');
if (form) {
    form.addEventListener('submit', (e) => {
        showAlert('¡Mensaje enviado con éxito!', 'success');
        setTimeout(() => form.reset(), 500);
    });

    window.addEventListener('pageshow', () => {
        form.reset();
    });
}


document.addEventListener("DOMContentLoaded", () => {
  const menuBtn = document.querySelector(".menu-hamburguesa");
  const mobileMenu = document.querySelector(".mobile-nav");
  const closeBtn = document.querySelector(".mobile-close-btn");
  const overlay = document.querySelector(".mobile-nav-overlay");
  const navLinks = document.querySelectorAll(".nav-link");

  // Abrir menú
  if (menuBtn && mobileMenu && overlay) {
    menuBtn.addEventListener("click", () => {
      menuBtn.classList.toggle("active");
      mobileMenu.classList.add("active");
      overlay.classList.add("active");
      document.body.classList.add("no-scroll");
    });
  }

  // Cerrar menú
  const cerrarMenu = () => {
    menuBtn.classList.remove("active");
    mobileMenu.classList.remove("active");
    overlay.classList.remove("active");
    document.body.classList.remove("no-scroll");
  };

  if (closeBtn) closeBtn.addEventListener("click", cerrarMenu);
  if (overlay) overlay.addEventListener("click", cerrarMenu);

  // Cerrar al hacer clic en un link
  navLinks.forEach(link => {
    link.addEventListener("click", cerrarMenu);
  });
});
