document.addEventListener('DOMContentLoaded', () => {
  const formRegistro = document.getElementById('form-registro');
  const modalTerminos = document.getElementById('modal-terminos');
  const btnVerTerminos = document.getElementById('ver-terminos');
  const btnCerrarModal = document.querySelector('.cerrar-modal');
  const btnAceptarTerminos = document.getElementById('aceptar-terminos');

  // Mostrar modal de términos
  btnVerTerminos.addEventListener('click', (e) => {
    e.preventDefault();
    modalTerminos.style.display = 'block';
  });

  // Cerrar modal
  btnCerrarModal.addEventListener('click', () => {
    modalTerminos.style.display = 'none';
  });

  // Aceptar términos
  btnAceptarTerminos.addEventListener('click', () => {
    document.getElementById('terminos').checked = true;
    modalTerminos.style.display = 'none';
    document.getElementById('error-terminos').style.display = 'none';
  });

  // Validación del formulario
  formRegistro.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const nombre = document.getElementById('nombre').value.trim();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirm-password').value;
    const terminos = document.getElementById('terminos').checked;
    
    // Resetear errores
    document.querySelectorAll('.error-msg').forEach(el => {
      el.style.display = 'none';
    });
    
    let valido = true;
    
    // Validaciones
    if (nombre.length < 3) {
      mostrarError('error-nombre', 'El nombre debe tener al menos 3 caracteres');
      valido = false;
    }
    
    if (!validarEmail(email)) {
      mostrarError('error-email', 'Ingrese un email válido');
      valido = false;
    }
    
    if (password.length < 6) {
      mostrarError('error-password', 'La contraseña debe tener al menos 6 caracteres');
      valido = false;
    }
    
    if (password !== confirmPassword) {
      mostrarError('error-confirm', 'Las contraseñas no coinciden');
      valido = false;
    }
    
    if (!terminos) {
      mostrarError('error-terminos', 'Debes aceptar los términos y condiciones');
      valido = false;
    }
    
    if (valido) {
      registrarUsuario(nombre, email, password);
    }
  });

  function mostrarError(id, mensaje) {
    const elemento = document.getElementById(id);
    elemento.textContent = mensaje;
    elemento.style.display = 'block';
  }

  function validarEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  }

  function registrarUsuario(nombre, email, password) {
    const usuarios = JSON.parse(localStorage.getItem('usuarios')) || [];
    
    // Verificar si el email ya existe
    if (usuarios.some(u => u.email === email)) {
      mostrarError('error-email', 'Este email ya está registrado');
      return;
    }
    
    // Crear nuevo usuario
    const nuevoUsuario = {
      nombre,
      email,
      password,
      esAdmin: email === 'admin@restoseria.com' /// PaRa pruebas 
    };
    
    usuarios.push(nuevoUsuario);
    localStorage.setItem('usuarios', JSON.stringify(usuarios));
    
    alert('Registro exitoso. Por favor inicia sesión.');
    window.location.href = 'login.html';
  }
});