class Resenia {
    constructor({ id = null, id_plato, id_usuario, descripcion, puntuacion,
        creado_en = null, nombre_plato = null, img_plato = null,
        nombre = null, apellido = null } = {}) {
        const puntuacionNum = Number(puntuacion);
        if (puntuacionNum < 1 || puntuacionNum > 5) {
            throw new RangeError('La puntuación debe estar entre 1 y 5');
        }
        this.id = id;
        this.idPlato = id_plato;
        this.idUsuario = id_usuario;
        this.descripcion = descripcion;
        this.puntuacion = puntuacionNum;
        this.creadoEn = creado_en;
        this.nombrePlato = nombre_plato;
        this.imgPlato = img_plato;
        this.nombre = nombre;
        this.apellido = apellido;
    }

    get autor() {
        if (!this.nombre) return null;
        return `${this.nombre} ${this.apellido ?? ''}`.trim();
    }

    toJSON() {
        return {
            id: this.id,
            id_plato: this.idPlato,
            id_usuario: this.idUsuario,
            descripcion: this.descripcion,
            puntuacion: this.puntuacion,
            creado_en: this.creadoEn,
            nombre_plato: this.nombrePlato,
            img_plato: this.imgPlato,
            nombre: this.nombre,
            apellido: this.apellido,
        };
    }
}

module.exports = Resenia;