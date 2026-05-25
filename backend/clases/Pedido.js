/** @typedef {{ id: number, product_id: number, product_name: string, quantity: number, price_at_time: number, img_src?: string }} ItemPedido */

const ESTADOS_VALIDOS = ['pendiente', 'en_preparacion', 'listo', 'entregado', 'cancelado'];

class Pedido {
    /**
     * @param {object}        datos
     * @param {number}        datos.id
     * @param {number}        datos.id_usuario
     * @param {number}        [datos.total_price=0]
     * @param {string}        [datos.status='pendiente']
     * @param {boolean}       [datos.is_picked_up=false]
     * @param {string}        [datos.created_at]
     * @param {ItemPedido[]}  [datos.items=[]]
     */
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

    /**
     * @param {string} nuevoEstado
     */
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
