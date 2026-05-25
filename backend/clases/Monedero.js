class Monedero {
    /**
     * @param {object} datos
     * @param {number} datos.id
     * @param {number} datos.id_usuario
     * @param {number} [datos.points=0]
     */
    constructor({ id = null, id_usuario, points = 0 } = {}) {
        this.id = id;
        this.idUsuario = id_usuario;
        this.points = points;
    }

    /**
     * @param {number} cantidad
     */
    sumar(cantidad) {
        if (cantidad < 0) throw new Error('La cantidad a sumar no puede ser negativa');
        this.points += cantidad;
    }

    /**
     * @param {number} cantidad
     */
    deducir(cantidad) {
        if (cantidad < 0) throw new Error('La cantidad a deducir no puede ser negativa');
        if (this.points < cantidad) throw new Error('Saldo de puntos insuficiente');
        this.points -= cantidad;
    }

    tieneSaldo(coste) {
        return this.points >= coste;
    }

    toJSON() {
        return {
            id: this.id,
            id_usuario: this.idUsuario,
            points: this.points,
        };
    }
}

module.exports = Monedero;
