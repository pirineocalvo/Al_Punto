class ProductoMercado {
    constructor({ id = null, nombre, name, descripcion = '', description = '',
        precio_puntos, points_price, id_nivel_min, min_level_id,
        img_src = null, creado_en = null, created_at = null } = {}) {
        this.id = id;
        this.name = nombre ?? name;
        this.description = descripcion ?? description;
        this.pointsPrice = Number(precio_puntos ?? points_price);
        this.minLevelId = id_nivel_min ?? min_level_id;
        this.imgSrc = img_src;
        this.createdAt = creado_en ?? created_at;
    }

    disponiblePara(puntos, idNivel) {
        return puntos >= this.pointsPrice && idNivel >= this.minLevelId;
    }

    toJSON() {
        return {
            id: this.id,
            name: this.name,
            description: this.description,
            points_price: this.pointsPrice,
            min_level_id: this.minLevelId,
            img_src: this.imgSrc,
            created_at: this.createdAt,
        };
    }
}

module.exports = ProductoMercado;