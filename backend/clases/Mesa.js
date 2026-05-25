class Mesa {
    /**
     * @param {object}   datos
     * @param {number}   datos.id
     * @param {string}   datos.name
     * @param {number}   datos.n_ocupantes
     * @param {boolean}  [datos.activo=true]
     * @param {string[]} [datos.horasDisponibles=[]]
     */
    constructor({ id = null, name, n_ocupantes, activo = true,
        horasDisponibles = [] } = {}) {
        this.id = id;
        this.name = name;
        this.nOcupantes = Number(n_ocupantes);
        this.activo = Boolean(activo);
        this.horasDisponibles = horasDisponibles;
    }


    admiteComensales(n) {
        return n >= this.nOcupantes && n <= this.nOcupantes + 2;
    }

    desactivar() {
        this.activo = false;
    }

    toJSON() {
        return {
            id: this.id,
            name: this.name,
            n_ocupantes: this.nOcupantes,
            activo: this.activo,
            horasDisponibles: this.horasDisponibles,
        };
    }
}

module.exports = Mesa;
