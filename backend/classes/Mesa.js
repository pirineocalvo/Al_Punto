class Mesa {
    constructor({ id = null, nombre, n_ocupantes, activo = true,
        horas_disponibles = [] } = {}) {
        this.id = id;
        this.nombre = nombre;
        this.nOcupantes = Number(n_ocupantes);
        this.activo = Boolean(activo);
        this.horasDisponibles = horas_disponibles;
    }

    admiteComensales(n) {
        return n >= 1 && n <= this.nOcupantes;
    }

    desactivar() {
        this.activo = false;
    }

    toJSON() {
        return {
            id: this.id,
            nombre: this.nombre,
            n_ocupantes: this.nOcupantes,
            activo: this.activo,
            horas_disponibles: this.horasDisponibles,
        };
    }
}

module.exports = Mesa;
