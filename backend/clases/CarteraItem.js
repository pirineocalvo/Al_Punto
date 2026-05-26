class CarteraItem {
    constructor({ pocket_id = null, id_usuario, product_id, token_url, is_used = false, added_at = null, used_at = null,
        expires_at = null, name = null, description = null, img_src = null, points_price = null } = {}) {
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

    get expirado() {
        if (!this.expiresAt) return false;
        return new Date(this.expiresAt) < new Date();
    }

    get canjeable() {
        return !this.isUsed && !this.expirado;
    }

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
