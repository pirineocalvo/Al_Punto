const ESTADOS_VALIDOS = ['pendiente', 'en_preparacion', 'listo', 'entregado', 'cancelado'];

class Pedido {
    constructor({ id = null, id_usuario,
        precio_total, total_price,
        estado, status = 'pendiente',
        recogido, is_picked_up = false,
        creado_en = null, created_at = null,
        items = [] } = {}) {
        this.id = id;
        this.idUsuario = id_usuario;
        this.total_price = Number(precio_total ?? total_price ?? 0);
        this.status = estado ?? status;
        this.is_picked_up = Boolean(recogido ?? is_picked_up);
        this.created_at = creado_en ?? created_at;
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
            id_usuario: this.idUsuario,
            total_price: this.total_price,
            status: this.status,
            is_picked_up: this.is_picked_up ? 1 : 0,
            created_at: this.created_at,
            items: this.items,
        };
    }
}

Pedido.ESTADOS_VALIDOS = ESTADOS_VALIDOS;

module.exports = Pedido;