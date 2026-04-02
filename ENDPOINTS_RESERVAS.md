# Endpoints de Reservas y Mesas

Guía para el equipo de frontend sobre cómo funciona el sistema de reservas en el backend.

---

## Índice

1. [Autenticación](#autenticación)
2. [Flujo completo de una reserva](#flujo-completo-de-una-reserva)
3. [Endpoints de Reservas](#endpoints-de-reservas-apireservas)
4. [Endpoints de Mesas](#endpoints-de-mesas-apimesas)
5. [Endpoints de Admin — Mesas](#endpoints-de-admin--mesas)
6. [Tablas implicadas en la BD](#tablas-implicadas-en-la-bd)
7. [Horarios disponibles](#horarios-disponibles)
8. [Códigos de error comunes](#códigos-de-error-comunes)

---

## Autenticación

Todos los endpoints requieren un **token JWT** en la cabecera:

```
Authorization: Bearer <token>
```

El token se obtiene al hacer login y se guarda en `localStorage` bajo la clave `loginUserToken`.

Los endpoints de administrador además comprueban que el usuario tenga `access_level > 3`.

---

## Flujo completo de una reserva

El proceso para que un usuario reserve una mesa tiene **3 pasos**, en este orden obligatorio:

```
1. GET /api/mesas/disponibilidad-mes   → saber qué días tienen hueco
2. GET /api/mesas/disponibilidad-dia   → obtener mesas y horas disponibles ese día
3. POST /api/reservas/addreserve       → crear la reserva (sin mesa aún)
4. POST /api/mesas/reservar            → vincular la mesa a la reserva recién creada
```

> **Importante:** la reserva y la mesa se guardan en tablas separadas (`Reservations` y `Mesas_reservadas`). Siempre hay que hacer los dos últimos pasos en ese orden.

---

## Endpoints de Reservas `/api/reservas`

### `POST /api/reservas/addreserve`
Crea una nueva reserva para el usuario autenticado.

**Body (JSON):**
```json
{
  "fecha": "2026/05/10",
  "hora": "21:00:00",
  "comensales": 3
}
```

> El formato de fecha es `YYYY/MM/DD` con barras, no guiones.  
> El formato de hora es `HH:MM:SS` con segundos.

**Respuesta 200:**
```json
{
  "message": "Reserva realizada con exito",
  "reservationId": 42
}
```

Guarda el `reservationId` devuelto — lo necesitas para el siguiente paso (`POST /api/mesas/reservar`).

---

### `GET /api/reservas/userReserve`
Devuelve todas las reservas del usuario autenticado, ordenadas de más reciente a más antigua.

**Respuesta 200** — array de objetos:
```json
[
  {
    "id": 42,
    "user_id": 7,
    "reserve_date": "2026/05/10",
    "reserve_hour": "21:00:00",
    "guests": 3,
    "status": null,
    "created_at": "2026-04-01 18:00:00",
    "id_mesa": 2,
    "mesa_name": "Mesa Jardín",
    "mesa_n_ocupantes": 4
  }
]
```

**Valores posibles de `status`:**

| Valor | Significado |
|---|---|
| `null` | Confirmada / pendiente de asistir |
| `"cancel"` | Cancelada por el usuario |
| `"attended"` | El cliente asistió |
| `"no-show"` | El cliente no se presentó |

`id_mesa`, `mesa_name` y `mesa_n_ocupantes` pueden ser `null` si la reserva no tiene mesa asignada todavía.

---

### `DELETE /api/reservas/cancelar/:id`
Cancela una reserva del usuario autenticado.

**Parámetro URL:** `id` — el id de la reserva.

**Respuesta 200:**
```json
{ "message": "Reserva cancelada con exito" }
```

**Error 404** si la reserva no existe o no pertenece al usuario.

---

## Endpoints de Mesas `/api/mesas`

### `GET /api/mesas/disponibilidad-mes`
Devuelve qué días del mes están **completamente llenos** (todas las mesas ocupadas en todos los horarios). Úsalo para deshabilitar días en el calendario.

**Query params:**
```
?year=2026&month=04
```

**Respuesta 200** — objeto con fechas como clave y booleano como valor:
```json
{
  "2026/04/15": true,
  "2026/04/20": true
}
```

- `true` → día completo, no se puede reservar.
- Si una fecha no aparece en el objeto → tiene huecos disponibles.

---

### `GET /api/mesas/disponibilidad-dia`
Devuelve las mesas disponibles en una fecha concreta, filtradas por número de comensales, con sus horas libres.

**Query params:**
```
?fecha=2026/05/10&ocupantes=3
```

- `fecha` — formato `YYYY/MM/DD`.
- `ocupantes` — filtra mesas con capacidad entre `ocupantes` y `ocupantes + 2`. Opcional.

**Respuesta 200** — array de mesas con sus horas disponibles:
```json
[
  {
    "id": 2,
    "name": "Mesa Jardín",
    "n_ocupantes": 4,
    "horasDisponibles": ["13:30:00", "14:00:00", "20:00:00", "21:00:00"]
  },
  {
    "id": 5,
    "name": "Mesa Interior 3",
    "n_ocupantes": 4,
    "horasDisponibles": ["21:30:00", "22:00:00"]
  }
]
```

Solo devuelve mesas activas que tengan al menos una hora libre. Si el array llega vacío, ese día no hay disponibilidad para ese número de comensales.

---

### `POST /api/mesas/reservar`
Vincula una mesa a una reserva existente del usuario. **Llámalo justo después de crear la reserva con `/addreserve`.**

**Body (JSON):**
```json
{
  "idReserva": 42,
  "idMesa": 2
}
```

**Respuesta 200:**
```json
{ "message": "Mesa vinculada correctamente", "id": 15 }
```

**Error 409** — la mesa ya estaba reservada para esa fecha y hora por otro usuario:
```json
{ "error": "Esa mesa ya está reservada para esa fecha y hora. Por favor elige otra." }
```

> Esto puede ocurrir por condición de carrera (dos usuarios eligiendo la misma mesa a la vez). En ese caso hay que volver al paso 2 y mostrar de nuevo la disponibilidad actualizada para que el usuario elija otra mesa u hora.

---

## Endpoints de Admin — Mesas

Todos requieren `access_level > 3`.

### `GET /api/mesas/admin/todas`
Devuelve todas las mesas (activas e inactivas).

**Respuesta 200:**
```json
[
  { "id": 1, "name": "Mesa 1", "n_ocupantes": 2, "activo": 1 },
  { "id": 2, "name": "Mesa Jardín", "n_ocupantes": 4, "activo": 1 },
  { "id": 3, "name": "Mesa Vieja", "n_ocupantes": 6, "activo": 0 }
]
```

---

### `POST /api/mesas/admin/crear`
Crea una nueva mesa.

**Body (JSON):**
```json
{ "name": "Mesa Terraza", "n_ocupantes": 6 }
```

**Respuesta 200:**
```json
{ "message": "Mesa creada correctamente", "id": 4 }
```

---

### `PUT /api/mesas/admin/:id`
Actualiza los datos de una mesa.

**Body (JSON):**
```json
{ "name": "Mesa Terraza Renovada", "n_ocupantes": 8, "activo": true }
```

**Respuesta 200:**
```json
{ "message": "Mesa actualizada correctamente" }
```

---

### `DELETE /api/mesas/admin/:id`
**Baja lógica** — no elimina la mesa, solo la marca como inactiva (`activo = 0`). Las reservas existentes no se ven afectadas.

**Respuesta 200:**
```json
{ "message": "Mesa desactivada correctamente" }
```

---

## Tablas implicadas en la BD

```
Reservations
├── id
├── user_id          → FK Users
├── reserve_date     → formato "YYYY/MM/DD"
├── reserve_hour     → formato "HH:MM:SS"
├── guests           → número de comensales
├── status           → null | "cancel" | "attended" | "no-show"
└── created_at

Mesas
├── id
├── name
├── n_ocupantes
└── activo           → 1 activa, 0 desactivada

Mesas_reservadas     → tabla de relación Reservations ↔ Mesas
├── id
├── id_reservas      → FK Reservations
└── id_mesa          → FK Mesas
```

---

## Horarios disponibles

El sistema solo acepta reservas en los siguientes horarios (formato `HH:MM:SS`):

| Turno comida | Turno cena |
|---|---|
| 13:30:00 | 20:00:00 |
| 14:00:00 | 20:30:00 |
| 14:30:00 | 21:00:00 |
| 15:00:00 | 21:30:00 |
| 15:30:00 | 22:00:00 |
| | 22:30:00 |

Cualquier hora fuera de esta lista es ignorada por el sistema de disponibilidad.

---

## Códigos de error comunes

| Código | Significado |
|---|---|
| `401` | Token ausente, malformado o inválido |
| `403` | El usuario no tiene permisos de administrador |
| `400` | Faltan parámetros obligatorios en el body o query |
| `404` | El recurso no existe o no pertenece al usuario |
| `409` | Conflicto: la mesa ya está reservada para ese slot |
| `500` | Error interno de base de datos |
