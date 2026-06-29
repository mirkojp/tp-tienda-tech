# 📱 TP Tienda Tech

Este es un proyecto Full-Stack de comercio electrónico para una tienda de tecnología ("Tienda Tech"). Cuenta con un **Frontend** desarrollado en **React Native / Expo** con navegación basada en archivos (**Expo Router**) y un **Backend** autoadministrable desarrollado en **Strapi CMS (v5)**.

---

##  Arquitectura del Proyecto

El proyecto está organizado en un monorepo con dos directorios principales:
- **`backend/`**: Servidor de Strapi CMS encargado de la API REST, autenticación de usuarios, persistencia en base de datos y gestión del catálogo (productos, marcas, categorías y órdenes).
- **`frontend/`**: Aplicación móvil y web híbrida que consume la API del backend, ofreciendo una experiencia interactiva y fluida para el usuario.

---

## 🛠️ Tecnologías Utilizadas

### Frontend
- **React Native** con **Expo** (SDK 56+)
- **Expo Router** para la navegación por pestañas y rutas dinámicas de detalles.
- **Axios** para el consumo de servicios API.
- **TypeScript** para un tipado estático seguro.
- **Context API** para la gestión del estado global (Carrito, Favoritos y Autenticación).
- **Theme y Global Styles** personalizados en tonos Slate e Indigo.

### Backend
- **Strapi CMS (v5)** como gestor de contenido headless.
- Base de datos local (SQLite por defecto para entornos de desarrollo).
- **Node.js** con servicios REST estructurados.

---

## ✨ Características y Funcionalidades

1. **Catálogo de Productos**:
   - Visualización paginada (límite fijo de 10 productos por página).
   - Barra de búsqueda por título del producto con filtro de debounce.
   - Filtros de categorías y marcas mediante un sistema visual de píldoras deslizable.
   - Ordenamiento rápido por precio (Menor a Mayor y viceversa).
2. **Detalle del Producto**:
   - Ficha completa con marca, título, descripción y stock disponible.
   - Carrusel responsivo de imágenes con botones de navegación lateral y bullets indicativos.
   - Selector dinámico de cantidad limitado por el stock real disponible.
   - Botón de agregar al carrito y botón para guardar en Favoritos (corazón).
3. **Carrito de Compras**:
   - Resumen detallado con miniaturas de imágenes, título del producto y precio unitario.
   - Modificación de cantidad de ítems directamente en la lista.
   - Botón para vaciar todo el carrito.
   - Cálculo automático del monto total a pagar.
   - Botón de finalización de compra (Checkout) con validación de autenticación de usuario.
4. **Perfil y Gestión de Usuario**:
   - Formulario dinámico de **Iniciar Sesión** y **Crear Cuenta** con manejo de errores.
   - Panel de usuario autenticado con detalles de la cuenta.
   - Historial de Órdenes: muestra los pedidos realizados con ID, fecha, artículos comprados, totales y un badge de estado de la orden (Completado , Pendiente , Cancelado ).
   - Sección de favoritos interactiva para acceso directo a los productos preferidos.

---

## 🔧 Instrucciones de Instalación y Ejecución

### Requisitos Previos
- Tener instalado **Node.js** (versión 18 o superior recomendada).
- Tener instalado **npm** o **yarn**.

---

### 1. Configuración del Backend (Strapi)

1. Navega a la carpeta del backend:
   ```bash
   cd backend
   ```
2. Instala las dependencias del servidor:
   ```bash
   npm install
   ```
3. Configura las variables de entorno:
   - Duplica el archivo `.env.example` y renómbralo como `.env`.
   - Modifica las variables según tus preferencias o déjalas por defecto.
4. Inicia el servidor de desarrollo de Strapi:
   ```bash
   npm run dev
   ```
   *El panel de administración estará disponible en `http://localhost:1337/admin`.*

#### ⚡ Sembrado de Datos (Seed)
Para poblar la base de datos de Strapi con marcas, categorías y productos de demostración:
1. Asegúrate de que el servidor Strapi esté **corriendo** (`npm run dev`).
2. Abre otra terminal, navega a la carpeta `backend` y ejecuta el script de seed:
   ```bash
   node seed.js
   ```
   *Este comando creará automáticamente los registros en Strapi y los asociará correspondientemente.*

---

### 2. Configuración del Frontend (Expo)

1. Navega a la carpeta del frontend:
   ```bash
   cd frontend
   ```
2. Instala las dependencias del proyecto:
   ```bash
   npm install
   ```
3. Inicia la aplicación de Expo en el entorno que prefieras:
   - **Para iniciar en el navegador web** (recomendado para pruebas rápidas):
     ```bash
     npm run web
     ```
   - **Para iniciar la terminal interactiva de Expo** (e iniciar en emuladores o dispositivo real vía Expo Go):
     ```bash
     npm start
     ```
     *Escanea el código QR con la app **Expo Go** en tu dispositivo móvil (Android/iOS) para probar la versión móvil.*

---
