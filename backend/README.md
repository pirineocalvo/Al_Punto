# Explicación sencilla del backend

Este backend está construido con **Node.js** utilizando el framework **Express** y se conecta a una base de datos **SQLite**. Su propósito es gestionar usuarios y sus datos de manera básica.

### Estructura principal

- `server.js`: Es el punto de entrada de la aplicación. Aquí se configura el servidor Express y las rutas disponibles.
- `routes/accountRoutes.js`: Define las rutas relacionadas con las cuentas de usuario. Por ejemplo, una ruta para listar todos los usuarios.
- `db.js` o `utils/db.js`: Se encarga de la conexión, creación y gestión de la base de datos SQLite donde se almacenan los datos de los usuarios.

### ¿Cómo funciona?

1. **Levantamiento del servidor**  
   Al iniciar (`node server.js`), el servidor escucha peticiones HTTP en un puerto definido.

2. **Rutas de la API**  
   La ruta principal expuesta es `/api/account/`:
   - Por ejemplo, el endpoint `/api/account/users` te permite obtener todos los usuarios registrados en la base de datos.

3. **Base de datos**  
   Se usa SQLite, una base de datos ligera que guarda los datos en archivos. Al iniciar, se aseguran de que la tabla `users` exista, con campos como nombre, email, tipo de usuario y plan.

4. **Ejemplo de consulta**  
   Cuando accedes a `/api/account/users`, el backend consulta la tabla de usuarios y devuelve los resultados en formato JSON.

### Cosas a tener en cuenta

- Actualmente no hay autenticación ni validaciones de seguridad implementadas: **esto es solo un ejemplo funcional** para mostrar cómo conectar y consultar usuarios.
- Se usan funciones para encriptar contraseñas y verificar usuarios, aunque aún no están plenamente desarrolladas en las rutas de este ejemplo.

### ¿Cómo probarlo?

1. Instala las dependencias:  
   ```
   npm install
   ```

2. Ejecuta el servidor:  
   ```
   node server.js
   ```

3. Accede a las rutas usando Postman, Insomnia, o desde el navegador:
   ```
   GET http://localhost:{PUERTO}/api/account/users
   ```

---

**En resumen**: este backend expone endpoints para gestionar usuarios guardados en una base de datos local SQLite, usando Express y NodeJS. Es muy útil como base para desarrollos futuros, añadiendo autenticación, seguridad y más funcionalidades según se necesite.
