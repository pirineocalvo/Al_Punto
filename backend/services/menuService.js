const repositorioMenu = require('../repositories/menuRepository');
const MenuItem = require('../clases/MenuItem');


exports.obtenerTodosItems = () => repositorioMenu.getAllItems();
exports.obtenerCategorias = () => repositorioMenu.getAllCategories();
exports.obtenerItemsPorCategoria = (idcategory) => repositorioMenu.getItemsByCategory(idcategory);

exports.crearItem = async (datos) => {
    if (!datos.name || !datos.price || !datos.id_category) {
        const error = new Error('Faltan campos obligatorios: name, price, id_category');
        error.status = 400;
        throw error;
    }

    const item = new MenuItem(datos);

    const id = await repositorioMenu.insertItem({
        name: item.name,
        ingredients: item.ingredients,
        description: item.description,
        img_src: item.imgSrc,
        available: item.available,
        price: item.price,
        id_category: item.idCategory,
    });

    return { id, message: 'Plato insertado correctamente' };
};


exports.crearCategoria = async (name) => {
    if (!name) {
        const error = new Error('El nombre de la categoria es obligatorio');
        error.status = 400;
        throw error;
    }
    const id = await repositorioMenu.insertCategory(name);
    return { id, message: 'Categoria insertada correctamente' };
};

exports.actualizarItem = async (datos) => {
    if (!datos.id) {
        const error = new Error('El id del plato es obligatorio');
        error.status = 400;
        throw error;
    }

    const item = new MenuItem(datos);

    const cambios = await repositorioMenu.updateItem({
        id: item.id,
        name: item.name,
        ingredients: item.ingredients,
        description: item.description,
        img_src: item.imgSrc,
        available: item.available,
        price: item.price,
        id_category: item.idCategory,
    });

    return { message: 'Plato actualizado correctamente', cambios };
};