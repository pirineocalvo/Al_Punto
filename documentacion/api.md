# Documentación del API - Al Punto

Este documento detalla los endpoints disponibles en el backend actualmente activo del proyecto Al Punto.

## Base URL: `http://localhost:5000`

---

## 👤 Gestión de Usuarios (`/api/user`)

| Método | Endpoint | Descripción | Requiere Token | Body de ejemplo |
| :--- | :--- | :--- | :---: | :--- |
| POST | `/login` | Inicia sesión y devuelve un token JWT. | No | `{"email": "user@example.com", "password": "123"}` |
| POST | `/register` | Registra un nuevo usuario en el sistema. | No | `{"firstName": "Juan", "lastName": "Perez", "phone": "600111222", "email": "juan@example.com", "password": "...", "birthDate": "1990-01-01"}` |
| GET | `/userInfo` | Obtiene la información completa del perfil del usuario. | Sí | - |

---

## 🍴 Menú y Platos (`/api/menu`)

| Método | Endpoint | Descripción | Requiere Token | Body de ejemplo |
| :--- | :--- | :--- | :---: | :--- |
| GET | `/` | Lista todos los platos del menú con sus categorías. | No | - |
| GET | `/categorias` | Lista todas las categorías de la carta. | No | - |
| GET | `/:idcategory` | Lista los platos de una categoría específica. | No | - |
| POST | `/update` | Actualiza la información de un plato existente. | Sí (Admin) | `{"id": 1, "name": "...", "price": 12.5, "id_category": 2, ...}` |
| POST | `/addcategory`| Crea una nueva categoría en el menú. | Sí (Admin) | `{"name": "Postres"}` |

---

## 📅 Reservas (`/api/reservas`)

| Método | Endpoint | Descripción | Requiere Token | Body de ejemplo |
| :--- | :--- | :--- | :---: | :--- |
| POST | `/addreserve` | Crea una nueva reserva (fecha, hora, comensales). | Sí | `{"fecha": "2026-04-15", "hora": "14:00", "comensales": 2}` |
| GET | `/userReserve` | Lista todas las reservas realizadas por el usuario activo. | Sí | - |
| DELETE| `/cancelar/:id`| Cancela una reserva pendiente del usuario. | Sí | - |

---

## 🪑 Mesas (`/api/mesas`)

| Método | Endpoint | Descripción | Requiere Token | Body de ejemplo |
| :--- | :--- | :--- | :---: | :--- |
| GET | `/disponibilidad-mes`| Consulta qué días de un mes están completos. | Sí | - |
| GET | `/disponibilidad-dia`| Consulta mesas y horas libres para un día concreto. | Sí | - |
| POST | `/reservar` | Vincula una mesa física a una reserva ya creada. | Sí | `{"idReserva": 10, "idMesa": 3}` |

---

## 🎫 Tickets y OCR (`/api/tickets`)

| Método | Endpoint | Descripción | Requiere Token | Body de ejemplo |
| :--- | :--- | :--- | :---: | :--- |
| POST | `/upload` | Sube una imagen de ticket para procesar puntos vía OCR. | Sí | `FormData: { "imagen": [fichero] }` |
| GET | `/mytickets` | Lista los tickets subidos y su estado de procesamiento. | Sí | - |

---

## 🛒 Pedidos / Take Away (`/api/orders`)

| Método | Endpoint | Descripción | Requiere Token | Body de ejemplo |
| :--- | :--- | :--- | :---: | :--- |
| POST | `/create` | Crea un nuevo pedido para recoger. | Sí | `{"total_price": 25.0, "items": [{"product_id": 1, "quantity": 2, "price_at_time": 12.5}]}` |
| GET | `/mis-pedidos` | Lista el historial de pedidos del usuario. | Sí | - |
| DELETE| `/cancelar/:id`| Cancela un pedido (solo si está en estado 'pendiente'). | Sí | - |

---

## 🏪 Marketplace (`/api/marketplace`)
*(Actualmente funcional en backend, no visible en frontend)*

| Método | Endpoint | Descripción | Requiere Token | Body de ejemplo |
| :--- | :--- | :--- | :---: | :--- |
| GET | `/items` | Lista los productos disponibles según el nivel del usuario. | Sí | - |
| GET | `/mypocket` | Lista los artículos comprados por el usuario. | Sí | - |
| POST | `/comprar/:id` | Canjea puntos por un artículo del marketplace. | Sí | (Ninguno) |

---

## ⭐ Reseñas (`/api/resenias`)
*(Actualmente funcional en backend, no visible en frontend)*

| Método | Endpoint | Descripción | Requiere Token | Body de ejemplo |
| :--- | :--- | :--- | :---: | :--- |
| POST | `/` | Añade una valoración a un plato (+5 puntos de regalo). | Sí | `{"id_plato": 5, "descripcion": "Excelente", "puntuacion": 5}` |
| GET | `/my-reviews` | Lista las reseñas escritas por el usuario. | Sí | - |
| GET | `/:id_plato` | Lista todas las reseñas públicas de un plato. | No | - |
