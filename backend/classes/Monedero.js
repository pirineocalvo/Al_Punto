class Monedero {
    constructor({ id = null, id_usuario, puntos = 0 } = {}) {
        this.id = id;
        this.idUsuario = id_usuario;
        this.puntos = puntos;
    }

    sumar(cantidad) {
        if (cantidad < 0) throw new Error('La cantidad a sumar no puede ser negativa');
        this.puntos += cantidad;
    }

    deducir(cantidad) {
        if (cantidad < 0) throw new Error('La cantidad a deducir no puede ser negativa');
        if (this.puntos < cantidad) throw new Error('Saldo de puntos insuficiente');
        this.puntos -= cantidad;
    }

    toJSON() {
        return {
            id: this.id,
            id_usuario: this.idUsuario,
            puntos: this.puntos,
        };
    }
}

module.exports = Monedero;