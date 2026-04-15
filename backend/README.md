# AL PUNTO — API Backend

Base URL: `http://localhost:5000`

Autenticación: los endpoints protegidos requieren el header:
```
Authorization: Bearer <token>
```
El token se obtiene al hacer login y se almacena en `localStorage` como `loginUserToken`.

---

## Usuarios — `/api/user`

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| POST | `/api/user/login` | No | Inicia sesión. Body: `{ email, password }`. Devuelve `{ token, userInfo }`. |
| POST | `/api/user/register` | No | Registra un nuevo usuario. Body: `{ firstName, lastName, phone, email, password, birthDate }`. Crea también una Wallet con 500 puntos iniciales. |
| GET | `/api/user/userInfo` | Sí | Devuelve los datos del usuario autenticado: nombre, email, puntos, nivel, color de nivel y total de tickets. |
| GET | `/api/user/transactions` | Sí | Devuelve las últimas 50 transacciones de puntos del usuario. |
| POST | `/api/user/claim-birthday` | Sí | Reclama la recompensa de cumpleaños (500 puntos). Solo funciona el día del cumpleaños y una vez por año. |

---

## Menú — `/api/menu`

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| GET | `/api/menu` | No | Devuelve todos los platos del menú con su categoría. |
| GET | `/api/menu/:idcategory` | No | Devuelve los platos filtrados por categoría. |
| POST | `/api/menu` | Sí (Admin) | Inserta un nuevo plato. Body: `{ name, ingredients, description, img_src, available, price, id_category }`. |
| POST | `/api/menu/addcategory` | Sí (Admin) | Crea una nueva categoría. Body: `{ name }`. |
| POST | `/api/menu/update` | Sí (Admin) | Actualiza un plato existente. Body: `{ id, name, ingredients, description, img_src, available, price, id_category }`. |

---

## Reservas — `/api/reservas`

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| POST | `/api/reservas/addreserve` | Sí | Crea una reserva. Body: `{ fecha, hora, comensales }`. |
| GET | `/api/reservas/userReserve` | Sí | Devuelve todas las reservas del usuario autenticado. |
| DELETE | `/api/reservas/cancelar/:id` | Sí | Cancela una reserva propia marcándola con `status = "cancel"`. Solo se puede cancelar si la reserva aún no ha pasado. |

---

## Tickets — `/api/tickets`

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| POST | `/api/tickets/upload` | Sí | Sube una imagen de ticket. Se procesa con OCR (Tesseract), se extrae el total y se asignan puntos equivalentes (1€ = 100 puntos). Body: `multipart/form-data`, campo `imagen`. |
| GET | `/api/tickets/mytickets` | Sí | Devuelve todos los tickets subidos por el usuario autenticado. |

---

## Marketplace — `/api/marketplace`

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| GET | `/api/marketplace/items` | Sí | Devuelve los artículos del marketplace disponibles según el nivel del usuario (Bronce, Plata, Oro). |
| GET | `/api/marketplace/mypocket` | Sí | Devuelve los artículos comprados por el usuario (su "mochila"), unidos con los datos del Marketplace. |
| POST | `/api/marketplace/comprar/:id` | Sí | Compra un artículo del marketplace. Descuenta los puntos del usuario, guarda el artículo en Pocket y registra la transacción. Devuelve error si no hay puntos suficientes. |

---

## Reseñas — `/api/resenias`

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| POST | `/api/resenias` | Sí | Crea una reseña para un plato. Body: `{ id_plato, descripcion, puntuacion }`. Otorga 5 puntos al usuario como recompensa. |
| GET | `/api/resenias/my-reviews` | Sí | Devuelve todas las reseñas escritas por el usuario autenticado, con nombre e imagen del plato. |
| GET | `/api/resenias/:id_plato` | No | Devuelve todas las reseñas de un plato concreto, con nombre y apellido del autor. |

---

## Pedidos para Recoger — `/api/orders`

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| POST | `/api/orders/create` | Sí | Crea un pedido para recoger en el local. Body: `{ items: [{ product_id, quantity, price_at_time }], total_price }`. El pedido se crea con `status = "pendiente"`. |
| GET | `/api/orders/mis-pedidos` | Sí | Devuelve todos los pedidos del usuario con sus items agrupados (nombre del plato, cantidad, precio unitario). |
| DELETE | `/api/orders/cancelar/:id` | Sí | Cancela un pedido propio. Solo funciona si el pedido está en estado `pendiente`. |
| GET | `/api/orders/admin/todos` | Sí (Admin) | Devuelve todos los pedidos de todos los usuarios con datos del cliente y sus items. |
| PATCH | `/api/orders/admin/:id/status` | Sí (Admin) | Actualiza el estado y la recogida de un pedido. Body: `{ status, is_picked_up }`. |

---

## Panel de Administración — `/api/admin`

> Todos los endpoints de este grupo requieren autenticación y `access_level > 3`.

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/admin/stats` | Estadísticas globales: total de usuarios, tickets del día y puntos acumulados del mes. |
| GET | `/api/admin/activity` | Últimas 10 transacciones de puntos de todos los usuarios. |
| GET | `/api/admin/users` | Lista todos los usuarios con sus puntos de wallet. |
| PUT | `/api/admin/users/:id` | Actualiza datos de un usuario: nombre, email, teléfono y nivel de acceso. |
| DELETE | `/api/admin/users/:id` | Elimina un usuario de la base de datos. |
| GET | `/api/admin/tickets` | Lista todos los tickets subidos por todos los usuarios. |
| GET | `/api/admin/reservas` | Lista todas las reservas con el nombre del cliente. |
| PATCH | `/api/admin/reservas/:id/attendance` | Actualiza la asistencia de una reserva. Body: `{ attended }`. |
| GET | `/api/admin/categories` | Lista todas las categorías del menú. |
| POST | `/api/admin/menu` | Crea un plato. Body: `multipart/form-data` con campos `name, ingredients, description, price, id_category, available` e imagen opcional. |
| PUT | `/api/admin/menu/:id` | Actualiza un plato existente. Mismos campos que el POST, imagen opcional. |
| DELETE | `/api/admin/menu/:id` | Elimina un plato del menú. |

---

## Niveles de acceso (`access_level`)

| Valor | Rol |
|-------|-----|
| 1 | Usuario estándar |
| > 3 | Staff / Administrador |

## Estados de un pedido

| Estado | Descripción |
|--------|-------------|
| `pendiente` | Pedido recibido, aún no procesado |
| `en preparacion` | El local está preparando el pedido |
| `listo` | Listo para recoger en el local |
| `cancelado` | Cancelado por el usuario o el sistema |
