class Nivel {
    constructor({ id = null, nombre, puntos_min, puntos_max } = {}) {
        this.id = id;
        this.nombre = nombre;
        this.puntosMin = Number(puntos_min);
        this.puntosMax = Number(puntos_max);
    }

    incluyePuntos(puntos) {
        return puntos >= this.puntosMin && puntos <= this.puntosMax;
    }

    puntosRestantes(puntosActuales) {
        return Math.max(0, this.puntosMax - puntosActuales);
    }

    toJSON() {
        return {
            id: this.id,
            nombre: this.nombre,
            puntos_min: this.puntosMin,
            puntos_max: this.puntosMax,
        };
    }
}

module.exports = Nivel;
