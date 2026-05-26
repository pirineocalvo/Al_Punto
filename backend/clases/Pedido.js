const ESTADOS_VALIDOS = ['pendiente', 'en_preparacion', 'listo', 'entregado', 'cancelado'];

class Pedido {
    constructor({ id = null, id_usuario, total_price = 0, status = 'pendiente',
        is_picked_up = false, created_at = null, items = [] } = {}) {
        this.id = id;
        this.idUsuario = id_usuario;
        this.totalPrice = Number(total_price);
        this.status = status;
        this.isPickedUp = Boolean(is_picked_up);
        this.createdAt = created_at;
        this.items = items;
    }

    get cancelable() {
        return this.status === 'pendiente';
    }

    cambiarEstado(nuevoEstado) {
        if (!ESTADOS_VALIDOS.includes(nuevoEstado)) {
            const error = new Error(`Estado no válido: ${nuevoEstado}. Valores permitidos: ${ESTADOS_VALIDOS.join(', ')}`);
            error.status = 400;
            throw error;
        }
        this.status = nuevoEstado;
    }

    toJSON() {
        return {
            id: this.id,
            total_price: this.totalPrice,
            status: this.status,
            is_picked_up: this.isPickedUp ? 1 : 0,
            created_at: this.createdAt,
            items: this.items,
        };
    }
}

Pedido.ESTADOS_VALIDOS = ESTADOS_VALIDOS;

module.exports = Pedido;
