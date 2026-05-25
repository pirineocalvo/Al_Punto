class CarteraItem {
    /**
     * @param {object}  datos
     * @param {number}  datos.pocket_id
     * @param {number}  datos.id_usuario
     * @param {number}  datos.product_id
     * @param {string}  datos.token_url
     * @param {boolean} [datos.is_used=false]
     * @param {string}  [datos.added_at]
     * @param {string}  [datos.used_at]
     * @param {string}  [datos.expires_at]
     * @param {string}  [datos.name]
     * @param {string}  [datos.description]
     * @param {string}  [datos.img_src]
     * @param {number}  [datos.points_price]
     */
    constructor({ pocket_id = null, id_usuario, product_id, token_url,
        is_used = false, added_at = null, used_at = null,
        expires_at = null, name = null, description = null,
        img_src = null, points_price = null } = {}) {
        this.pocketId = pocket_id;
        this.idUsuario = id_usuario;
        this.productId = product_id;
        this.tokenUrl = token_url;
        this.isUsed = Boolean(is_used);
        this.addedAt = added_at;
        this.usedAt = used_at;
        this.expiresAt = expires_at;
        this.name = name;
        this.description = description;
        this.imgSrc = img_src;
        this.pointsPrice = points_price;
    }

    /** Indica si el token ha expirado */
    get expirado() {
        if (!this.expiresAt) return false;
        return new Date(this.expiresAt) < new Date();
    }

    /** Indica si el artículo todavía es canjeable */
    get canjeable() {
        return !this.isUsed && !this.expirado;
    }

    /** Marca el artículo como usado en el momento actual */
    marcarUsado() {
        if (this.isUsed) throw new Error('Este artículo ya fue canjeado');
        if (this.expirado) throw new Error('El token ha expirado');
        this.isUsed = true;
        this.usedAt = new Date().toISOString();
    }

    toJSON() {
        return {
            pocket_id: this.pocketId,
            id_usuario: this.idUsuario,
            product_id: this.productId,
            token_url: this.tokenUrl,
            is_used: this.isUsed,
            added_at: this.addedAt,
            used_at: this.usedAt,
            expires_at: this.expiresAt,
            name: this.name,
            description: this.description,
            img_src: this.imgSrc,
            points_price: this.pointsPrice,
        };
    }
}

module.exports = CarteraItem;
