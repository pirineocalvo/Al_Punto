class ProductoMercado {
    constructor({ id = null, name, description = '', points_price,
        min_level_id, img_src = null, created_at = null } = {}) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.pointsPrice = Number(points_price);
        this.minLevelId = min_level_id;
        this.imgSrc = img_src;
        this.createdAt = created_at;
    }

    disponiblePara(points, levelId) {
        return points >= this.pointsPrice && levelId >= this.minLevelId;
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
