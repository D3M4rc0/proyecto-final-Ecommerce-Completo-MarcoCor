document.addEventListener('DOMContentLoaded', async () => {
    console.log('Sistema de login - Versión Final Revisada');

    // Elementos del formu
    const formLogin = document.getElementById('form-login');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');

    // Verificación 
    if (!formLogin || !emailInput || !passwordInput) {
        console.error('Elementos del formulario no encontrados');
        return;
    }

    // Cargar usuarios al iniciar
    await loadInitialUsers();

    // Manejador de submit
    formLogin.addEventListener('submit', async (e) => {
        e.preventDefault();
        clearPreviousState();

        if (!validateForm()) return;

        try {
            const usuarios = JSON.parse(localStorage.getItem('usuarios')) || [];
            const usuario = usuarios.find(u => 
                u.email.toLowerCase() === emailInput.value.trim().toLowerCase() && 
                u.password === passwordInput.value
            );

            if (usuario) {
                handleSuccessfulLogin(usuario);
            } else {
                handleFailedLogin();
            }
        } catch (error) {
            console.error('Error durante el login:', error);
            showAlert('Error del sistema. Intente nuevamente.', 'error');
        }
    });

    // Funciones principales
    async function loadInitialUsers() {
        if (!localStorage.getItem('usuarios')) {
            try {
                const response = await fetch('/datos/usuarios.json');
                if (!response.ok) throw new Error('Error al cargar usuarios');
                const usuarios = await response.json();
                localStorage.setItem('usuarios', JSON.stringify(usuarios));
                console.log('Usuarios cargados:', usuarios);
            } catch (error) {
                console.error('Error:', error);
                localStorage.setItem('usuarios', JSON.stringify([]));
            }
        }
    }

    function validateForm() {
        let isValid = true;
        const email = emailInput.value.trim();
        const password = passwordInput.value;

        // Validación de email
        if (!email) {
            showError(emailInput, 'Email requerido');
            isValid = false;
        } else if (!isValidEmail(email)) {
            showError(emailInput, 'Email no válido');
            isValid = false;
        }

        // Validación de contraseña
        if (!password) {
            showError(passwordInput, 'Contraseña requerida');
            isValid = false;
        }

        return isValid;
    }

    function handleSuccessfulLogin(usuario) {
        console.log('Login exitoso para:', usuario.email);
        
        // Guardar sesin
        sessionStorage.setItem('usuarioLogueado', JSON.stringify({
            nombre: usuario.nombre,
            email: usuario.email,
            esAdmin: usuario.esAdmin
        }));

        // Mostrar feedback (verde)
        showAlert(`Bienvenido ${usuario.nombre}`, 'success');
        
        // Redirección
        setTimeout(() => {
            window.location.href = '../index.html';
        }, 1500);
    }

    function handleFailedLogin() {
        console.log('Intento fallido con:', emailInput.value.trim());
        showAlert('Credenciales incorrectas', 'error');
        passwordInput.value = '';
        passwordInput.focus();
    }

    // Funciones aux
    function isValidEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }

    function showError(input, message) {
        const grupo = input.closest('.form-group');
        const errorElement = document.createElement('div');
        errorElement.className = 'field-error';
        errorElement.textContent = message;
        grupo.appendChild(errorElement);
        input.style.borderColor = '#ff6b6b';
    }

   function showAlert(message, type) {
    // Eliminar alertas anteriores
    const oldAlert = document.querySelector('.login-alert');
    if (oldAlert) oldAlert.remove();

    // Crear alerta con estilos  (verde/rojo)
    const alert = document.createElement('div');
    alert.className = `login-alert ${type}`;
    
    // Aplicar estilos inline (como respaldo)
    alert.style.padding = '12px 15px';
    alert.style.margin = '0 auto 20px';
    alert.style.borderRadius = '6px';
    alert.style.width = '90%';
    alert.style.textAlign = 'center';
    alert.style.color = 'white';
    alert.style.display = 'flex';
    alert.style.alignItems = 'center';
    alert.style.justifyContent = 'center';
    alert.style.gap = '8px';
    alert.style.opacity = '0';
    alert.style.transform = 'translateY(-10px)';
    alert.style.transition = 'all 0.3s ease';
    
    // Estilos específicos por tipo (verde/rojo)
    if (type === 'success') {
        alert.style.backgroundColor = 'rgba(76, 175, 80, 0.9)';
        alert.style.borderLeft = '4px solid #388E3C';
    } else {
        alert.style.backgroundColor = 'rgba(220, 53, 69, 0.9)';
        alert.style.borderLeft = '4px solid #c82333';
    }

    // Contenido de la alerta
    alert.innerHTML = `
        <i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}"></i>
        <span>${message}</span>
    `;

    // Insertar en el formulario (posición mejorada)
    const titulo = formLogin.querySelector('h2');
    if (titulo) {
        titulo.insertAdjacentElement('afterend', alert);
    } else {
        formLogin.prepend(alert);
    }

    // Animación mejorada v2
    requestAnimationFrame(() => {
        alert.style.opacity = '1';
        alert.style.transform = 'translateY(0)';
    });

    // Auto-eliminación después de 4 segundos
    setTimeout(() => {
        alert.style.opacity = '0';
        setTimeout(() => {
            if (alert.parentNode) {
                alert.parentNode.removeChild(alert);
            }
        }, 300);
    }, 4000);
}
    function clearPreviousState() {
        // Limpiar errores
        document.querySelectorAll('.field-error').forEach(el => el.remove());
        
        // Resetear estilos
        emailInput.style.borderColor = '';
        passwordInput.style.borderColor = '';
    }
});

