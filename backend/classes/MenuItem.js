class MenuItem {
    constructor({ id = null, nombre, name, ingredientes, ingredients,
        descripcion = '', description = '', img_src = null, disponible = true,
        available, precio, price, id_categoria, id_category,
        nombre_categoria = null, category_name = null } = {}) {
        this.id = id;
        this.name = nombre ?? name;
        this.ingredients = ingredientes ?? ingredients ?? '';
        this.description = descripcion ?? description;
        this.imgSrc = img_src;
        this.available = Boolean(disponible ?? available);
        this.price = Number(precio ?? price);
        this.idCategory = id_categoria ?? id_category;
        this.categoryName = nombre_categoria ?? category_name;
    }

    get precioFormateado() {
        return `${this.price.toFixed(2)} €`;
    }

    toJSON() {
        return {
            id: this.id,
            name: this.name,
            ingredients: this.ingredients,
            description: this.description,
            img_src: this.imgSrc,
            available: this.available,
            price: this.price,
            id_category: this.idCategory,
            category_name: this.categoryName,
        };
    }
}

module.exports = MenuItem;