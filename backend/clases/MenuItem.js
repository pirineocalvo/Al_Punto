class MenuItem {

    constructor({ id = null, name, ingredients = '', description = '',
        img_src = null, available = true, price, id_category,
        category_name = null } = {}) {
        this.id = id;
        this.name = name;
        this.ingredients = ingredients;
        this.description = description;
        this.imgSrc = img_src;
        this.available = Boolean(available);
        this.price = Number(price);
        this.idCategory = id_category;
        this.categoryName = category_name;
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
