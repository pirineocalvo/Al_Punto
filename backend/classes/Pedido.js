const ESTADOS_VALIDOS = ['pendiente', 'en_preparacion', 'listo', 'entregado', 'cancelado'];

class Pedido {
    constructor({ id = null, id_usuario, precio_total = 0, estado = 'pendiente',
        recogido = false, creado_en = null, items = [] } = {}) {
        this.id = id;
        this.idUsuario = id_usuario;
        this.precioTotal = Number(precio_total);
        this.estado = estado;
        this.recogido = Boolean(recogido);
        this.creadoEn = creado_en;
        this.items = items;
    }

    get cancelable() {
        return this.estado === 'pendiente';
    }

    cambiarEstado(nuevoEstado) {
        if (!ESTADOS_VALIDOS.includes(nuevoEstado)) {
            const error = new Error(`Estado no válido: ${nuevoEstado}. Valores permitidos: ${ESTADOS_VALIDOS.join(', ')}`);
            error.status = 400;
            throw error;
        }
        this.estado = nuevoEstado;
    }

    toJSON() {
        return {
            id: this.id,
            id_usuario: this.idUsuario,
            precio_total: this.precioTotal,
            estado: this.estado,
            recogido: this.recogido ? 1 : 0,
            creado_en: this.creadoEn,
            items: this.items,
        };
    }
}

Pedido.ESTADOS_VALIDOS = ESTADOS_VALIDOS;

module.exports = Pedido;
