const menuRepo = require('../repositories/menuRepository');

exports.getAllItems = () => menuRepo.getAllItems();

exports.getCategories = () => menuRepo.getAllCategories();

exports.getItemsByCategory = (idcategory) => menuRepo.getItemsByCategory(idcategory);

exports.createItem = async ({ name, ingredients, description, img_src, available, price, id_category }) => {
    if (!name || !price || !id_category) {
        const err = new Error('Faltan campos obligatorios: name, price, id_category');
        err.status = 400;
        throw err;
    }
    const id = await menuRepo.insertItem({ name, ingredients, description, img_src, available, price, id_category });
    return { id, message: 'Plato insertado correctamente' };
};

exports.createCategory = async (name) => {
    if (!name) {
        const err = new Error('El nombre de la categoría es obligatorio');
        err.status = 400;
        throw err;
    }
    const id = await menuRepo.insertCategory(name);
    return { id, message: 'Categoría insertada correctamente' };
};

exports.updateItem = async ({ id, name, ingredients, description, img_src, available, price, id_category }) => {
    if (!id) {
        const err = new Error('El id del plato es obligatorio');
        err.status = 400;
        throw err;
    }
    const changes = await menuRepo.updateItem({ id, name, ingredients, description, img_src, available, price, id_category });
    return { message: 'Plato actualizado correctamente', changes };
};