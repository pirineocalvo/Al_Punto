class Monedero {
    constructor({ id = null, id_usuario, puntos, points } = {}) {
        this.id = id;
        this.idUsuario = id_usuario;
        this.points = puntos ?? points ?? 0;
    }

    sumar(cantidad) {
        if (cantidad < 0) throw new Error('La cantidad a sumar no puede ser negativa');
        this.points += cantidad;
    }

    deducir(cantidad) {
        if (cantidad < 0) throw new Error('La cantidad a deducir no puede ser negativa');
        if (this.points < cantidad) throw new Error('Saldo de puntos insuficiente');
        this.points -= cantidad;
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