class MenuItem {
    constructor({ id = null, nombre, ingredientes = '', descripcion = '',
        img_src = null, disponible = true, precio, id_categoria,
        nombre_categoria = null } = {}) {
        this.id = id;
        this.nombre = nombre;
        this.ingredientes = ingredientes;
        this.descripcion = descripcion;
        this.imgSrc = img_src;
        this.disponible = Boolean(disponible);
        this.precio = Number(precio);
        this.idCategoria = id_categoria;
        this.nombreCategoria = nombre_categoria;
    }

    get precioFormateado() {
        return `${this.precio.toFixed(2)} €`;
    }

    toJSON() {
        return {
            id: this.id,
            nombre: this.nombre,
            ingredientes: this.ingredientes,
            descripcion: this.descripcion,
            img_src: this.imgSrc,
            disponible: this.disponible,
            precio: this.precio,
            id_categoria: this.idCategoria,
            nombre_categoria: this.nombreCategoria,
        };
    }
}

module.exports = MenuItem;