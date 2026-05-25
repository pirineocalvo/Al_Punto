class Resenia {
    /**
     * @param {object} datos
     * @param {number} datos.id
     * @param {number} datos.id_plato
     * @param {number} datos.id_usuario
     * @param {string} datos.descripcion
     * @param {number} datos.puntuacion   - Valor entre 1 y 5
     * @param {string} [datos.creado_en]
     * @param {string} [datos.plato_name]
     * @param {string} [datos.plato_img]
     * @param {string} [datos.first_name]
     * @param {string} [datos.last_name]
     */
    constructor({ id = null, id_plato, id_usuario, descripcion, puntuacion,
        creado_en = null, plato_name = null, plato_img = null,
        first_name = null, last_name = null } = {}) {
        if (puntuacion < 1 || puntuacion > 5) {
            throw new RangeError('La puntuación debe estar entre 1 y 5');
        }
        this.id = id;
        this.idPlato = id_plato;
        this.idUsuario = id_usuario;
        this.descripcion = descripcion;
        this.puntuacion = Number(puntuacion);
        this.creadoEn = creado_en;
        this.platoName = plato_name;
        this.platoImg = plato_img;
        this.firstName = first_name;
        this.lastName = last_name;
    }

    /** Nombre completo del autor (disponible en consultas JOIN con usuarios) */
    get autor() {
        if (!this.firstName) return null;
        return `${this.firstName} ${this.lastName ?? ''}`.trim();
    }

    toJSON() {
        return {
            id: this.id,
            id_plato: this.idPlato,
            id_usuario: this.idUsuario,
            descripcion: this.descripcion,
            puntuacion: this.puntuacion,
            creado_en: this.creadoEn,
            plato_name: this.platoName,
            plato_img: this.platoImg,
            first_name: this.firstName,
            last_name: this.lastName,
        };
    }
}

module.exports = Resenia;
