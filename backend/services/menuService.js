const repositorioMenu = require('../repositories/menuRepository');

exports.obtenerTodosItems = () => repositorioMenu.getAllItems();

exports.obtenerCategorias = () => repositorioMenu.getAllCategories();

exports.obtenerItemsPorCategoria = (idcategory) => repositorioMenu.getItemsByCategory(idcategory);

exports.crearItem = async ({ name, ingredients, description, img_src, available, price, id_category }) => {
    if (!name || !price || !id_category) {
        const error = new Error('Faltan campos obligatorios: name, price, id_category');
        error.status = 400;
        throw error;
    }
    const id = await repositorioMenu.insertItem({ name, ingredients, description, img_src, available, price, id_category });
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

exports.actualizarItem = async ({ id, name, ingredients, description, img_src, available, price, id_category }) => {
    if (!id) {
        const error = new Error('El id del plato es obligatorio');
        error.status = 400;
        throw error;
    }
    const cambios = await repositorioMenu.updateItem({ id, name, ingredients, description, img_src, available, price, id_category });
    return { message: 'Plato actualizado correctamente', cambios };
};