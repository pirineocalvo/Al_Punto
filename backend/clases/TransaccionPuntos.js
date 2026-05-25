const TIPOS_VALIDOS = ['add resenia', 'add ticket', 'buy market'];

class TransaccionPuntos {
    /**
     * @param {object} datos
     * @param {number} datos.id
     * @param {number} datos.id_usuario
     * @param {number} datos.id_monedero
     * @param {number} datos.cantidad_transaccion
     * @param {string} datos.tipo
     * @param {string} [datos.creado_en]
     */
    constructor({ id = null, id_usuario, id_monedero, cantidad_transaccion,
        tipo, creado_en = null } = {}) {
        this.id = id;
        this.idUsuario = id_usuario;
        this.idMonedero = id_monedero;
        this.cantidad = Number(cantidad_transaccion);
        this.tipo = tipo;
        this.creadoEn = creado_en;
    }

    get esCredito() {
        return this.cantidad >= 0;
    }

    get esDebito() {
        return this.cantidad < 0;
    }

    toJSON() {
        return {
            id: this.id,
            id_usuario: this.idUsuario,
            id_monedero: this.idMonedero,
            cantidad_transaccion: this.cantidad,
            tipo: this.tipo,
            creado_en: this.creadoEn,
        };
    }
}

TransaccionPuntos.TIPOS_VALIDOS = TIPOS_VALIDOS;

module.exports = TransaccionPuntos;
