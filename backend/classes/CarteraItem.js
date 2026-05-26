class CarteraItem {
    constructor({ id = null, id_usuario, id_producto, token_url, usado = false,
        anadido_en = null, usado_en = null, nombre = null,
        descripcion = null, img_src = null, precio_puntos = null } = {}) {
        this.id = id;
        this.idUsuario = id_usuario;
        this.idProducto = id_producto;
        this.tokenUrl = token_url;
        this.usado = Boolean(usado);
        this.anadidoEn = anadido_en;
        this.usadoEn = usado_en;
        this.nombre = nombre;
        this.descripcion = descripcion;
        this.imgSrc = img_src;
        this.precioPuntos = precio_puntos;
    }

    get canjeable() {
        return !this.usado;
    }

    marcarUsado() {
        if (this.usado) throw new Error('Este artículo ya fue canjeado');
        this.usado = true;
        this.usadoEn = new Date().toISOString();
    }

    toJSON() {
        return {
            id: this.id,
            id_usuario: this.idUsuario,
            id_producto: this.idProducto,
            token_url: this.tokenUrl,
            usado: this.usado,
            anadido_en: this.anadidoEn,
            usado_en: this.usadoEn,
            nombre: this.nombre,
            descripcion: this.descripcion,
            img_src: this.imgSrc,
            precio_puntos: this.precioPuntos,
        };
    }
}

module.exports = CarteraItem;