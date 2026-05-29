class Mesa {
    constructor({ id = null, nombre, name, n_ocupantes,
        activo = true, horas_disponibles, horasDisponibles } = {}) {
        this.id = id;
        this.name = nombre ?? name;
        this.n_ocupantes = Number(n_ocupantes);
        this.activo = Boolean(activo);
        this.horasDisponibles = horas_disponibles ?? horasDisponibles ?? [];
    }

    admiteComensales(n) {
        return n >= 1 && n <= this.n_ocupantes;
    }

    desactivar() {
        this.activo = false;
    }

    toJSON() {
        return {
            id: this.id,
            name: this.name,
            n_ocupantes: this.n_ocupantes,
            activo: this.activo,
            horasDisponibles: this.horasDisponibles,
        };
    }
}

module.exports = Mesa;