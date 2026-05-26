class ProductoMercado {
    constructor({ id = null, nombre, descripcion = '', precio_puntos,
        id_nivel_min, img_src = null, creado_en = null } = {}) {
        this.id = id;
        this.nombre = nombre;
        this.descripcion = descripcion;
        this.precioPuntos = Number(precio_puntos);
        this.idNivelMin = id_nivel_min;
        this.imgSrc = img_src;
        this.creadoEn = creado_en;
    }

    disponiblePara(puntos, idNivel) {
        return puntos >= this.precioPuntos && idNivel >= this.idNivelMin;
    }

    toJSON() {
        return {
            id: this.id,
            nombre: this.nombre,
            descripcion: this.descripcion,
            precio_puntos: this.precioPuntos,
            id_nivel_min: this.idNivelMin,
            img_src: this.imgSrc,
            creado_en: this.creadoEn,
        };
    }
}

module.exports = ProductoMercado;