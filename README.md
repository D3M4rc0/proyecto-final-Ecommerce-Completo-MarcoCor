# 🍽️ Restaurante Web - Entrega final v1 ICP

# 🎯 Proyecto Final – E-commerce Interactivo

## 📝 Descripción del Proyecto
Este proyecto es una entrega final parcial Frond-End_JS para el curso de Full Stack con Node.js TT. Tiene como objetivo desarrollar una página web completa de comercio electrónico (eCommerce) que integre todos los conocimientos adquiridos durante el curso, incluyendo HTML semántico, CSS moderno, JavaScript, consumo de API REST, almacenamiento local, manejo de carrito de compras, sistema de pedido y buenas prácticas de accesibilidad y SEO.

Este proyecto consiste en el desarrollo de un sitio web de comercio electrónico funcional, combinando conocimientos de frontend, integración de APIs, manejo de carrito, sistema de pedidos, login de administrador y un panel de control simulado.
Además de cumplir con todos los requerimientos, se añadieron funcionalidades extra que simulan un entorno más realista, incluyendo una API propia, generación de comprobantes de compra y un panel administrativo (dashboard) que simula un 'backend' (No real) para cargar y gestionar productos, ademas de un login administrador/cliente.




#### 1. OBJETIVOS INICIALES

- Crear un e-commerce.
- Utilizar HTML semántico, CSS moderno y JS nativo.
- Consumir una API externa pública.
- Implementar carrito de compras con localStorage.
- Validar formularios y aplicar buenas prácticas de accesibilidad y SEO.
- Hacer deploy del proyecto en GitHub Pages o Netlify.

#### 2. MEJORAS Y FUNCIONALIDADES ADICIONALES

- Se integró una API pública (FakeStore) + una API propia con productos reales (usando productos.json desde GitHub Pages).
- Se desarrolló un sistema de paginación que permite cargar más productos desde las API, manteniendo los 6 primeros productos hardcodeados como fallback por si no tenemos conexión a internet.
- Un buscador en tiempo real que permite buscar productos por nombre, descripción, etc.
- Se implementó un carrito de compras funcional que persiste en localStorage, permite editar cantidad de productos, medios de pagos, con control de stock, botones desactivados para productos agotados y cálculo del total, confirmación de compra y datos extras para mas realismo.
- Se agregó sistema de pedidos con generación de comprobante (formato ticket o factura ).
- Se creó un login básico para el cliente y usuario administrador, lo cual habilita el acceso a un Dashboard.
- El Dashboard permite agregar, editar o eliminar productos de la API propia y local y gestión de pedidos, simulando una administración real, con autocompletado de imágenes desde carpeta y/o api json.
- El nav se adapta según el tipo de usuario (cliente o administrador).
- Se aplicó diseño responsivo para celulares, tablets y escritorio.
- Se incluyeron mejoras visuales y usabilidad (Menú hamburguesa, alertas, validaciones, botón de WhatsApp, etc).

---

## 3. 🛠️ Tecnologías Utilizadas

- **HTML5** (estructura semántica)
- **CSS3** (con Flexbox, Grid, media queries, css variables, etc)
- **JavaScript ES6+** (modularizado)
- **Formspree** (formulario de contacto)
- **Google Maps Embed** (Dirección del local físiico)
- **GitHub Pages** (para alojamiento del codigo y la API pública personalizada)
- **API Publica Fakestore** (para la API pública tienda falsa)
- **Netlify** (para desplegar el proyecto)

---

## 4. 📸 Capturas de Pantalla

### Página Principal
![Página Principal](caps/Pag-Completa.png)  
<!--URL:  
![Página Principal](https://github.com/D3M4rc0/proyecto-final-Ecommerce-Completo-MarcoCor/blob/main/caps/Pag-Completa.pngg)-->

### Sección de Productos Desktop y Móvil, responsive design 
![Sección de Productos](caps/Responsivo-1.png)  
<!--URL:  
![Sección de Productos](https://github.com/D3M4rc0/proyecto-final-Ecommerce-Completo-MarcoCor/blob/main/caps/Responsivo-1.png)-->

### Formulario de Contacto
![Alerta Mensaje Enviado](caps/Alerta-Mensaje-enviado.png)  

### Confirmación en Formspree
![Confirmación Formspree](caps/Confirmacion-Formspree.png)  

<!--URL:  
![Alerta Mensaje Enviado](https://github.com/D3M4rc0/proyecto-final-Ecommerce-Completo-MarcoCor/blob/main/caps/Alerta-Mensaje-enviado.png)  
![Confirmación Formspree](https://github.com/D3M4rc0/proyecto-final-Ecommerce-Completo-MarcoCor/blob/main/caps/Confirmacion-Formspree.png)-->

### 5. USO Y FUNCIONAMIENTO

- El sitio muestra productos iniciales hardcodeados, y luego mediante paginación carga los de las APIs pública y personalizada.
- Los productos se pueden agregar al carrito (con opción de modificar las cantidades, ingresar nombre, pago y comentario).
- Al comprar se genera un comprobante con código único (ej: PED-XXXXXXXXX) y opción de imprimir.
- Si hay conexión, se consumen productos desde JSON público. Si no hay conexión, se muestran los 6 productos locales.
- Solo el admin puede acceder al dashboard y modificar los productos.
- Se usa localStorage para persistir el carrito, los pedidos y la sesión del usuario.

### 6. 🌐 DEPLOY

🌐 Netlify - LaRestoseria2: 
   (**https://larestoseria2.netlify.app/**)

## 7. 💻 Instalación y Uso
1. Clona este repositorio
```bash
git clone https://github.com/D3M4rc0/proyecto-final-Ecommerce-Completo-MarcoCor.git 
```
