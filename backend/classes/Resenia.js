class Resenia {
    constructor({ id = null, id_plato, id_usuario, descripcion, puntuacion,
        creado_en = null, plato_name = null, plato_img = null,
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
        this.platoName = plato_name;
        this.platoImg = plato_img;
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
            plato_name: this.platoName,
            plato_img: this.platoImg,
            nombre: this.nombre,
            apellido: this.apellido,
        };
    }
}

module.exports = Resenia;