class CarteraItem {
    constructor({ id = null, pocket_id,
        id_usuario, user_id,
        id_producto, product_id,
        token_url,
        usado, is_used = false,
        anadido_en = null, added_at = null,
        usado_en = null, used_at = null,
        nombre = null, name = null,
        descripcion = null, description = null,
        img_src = null,
        precio_puntos = null, points_price = null,
        first_name = null, last_name = null, email = null } = {}) {

        this.id = id ?? pocket_id;
        this.idUsuario = id_usuario ?? user_id;
        this.productId = id_producto ?? product_id;
        this.token_url = token_url;
        this.is_used = Boolean(usado ?? is_used);
        this.added_at = anadido_en ?? added_at;
        this.used_at = usado_en ?? used_at;
        this.name = nombre ?? name;
        this.description = descripcion ?? description;
        this.imgSrc = img_src;
        this.points_price = precio_puntos ?? points_price;
        this.firstName = first_name;
        this.lastName = last_name;
        this.email = email;
    }

    get canjeable() {
        return !this.is_used;
    }

    get isUsed() {
        return this.is_used;
    }

    get pocketId() {
        return this.id;
    }

    get usedAt() {
        return this.used_at;
    }

    marcarUsado() {
        if (this.is_used) throw new Error('Este artículo ya fue canjeado');
        this.is_used = true;
        this.used_at = new Date().toISOString();
    }

    toJSON() {
        return {
            id: this.id,
            id_usuario: this.idUsuario,
            product_id: this.productId,
            token_url: this.token_url,
            is_used: this.is_used ? 1 : 0,
            added_at: this.added_at,
            used_at: this.used_at,
            name: this.name,
            description: this.description,
            img_src: this.imgSrc,
            points_price: this.points_price,
        };
    }
}

module.exports = CarteraItem;