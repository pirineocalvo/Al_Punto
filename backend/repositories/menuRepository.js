const db = require('../utils/db');
const MenuItem = require('../clases/MenuItem')

const consulta = (sql, params = []) => new Promise((resolve, reject) =>
    db.all(sql, params, (err, filas) => err ? reject(err) : resolve(filas))
);
const consultaUno = (sql, params = []) => new Promise((resolve, reject) =>
    db.get(sql, params, (err, fila) => err ? reject(err) : resolve(fila))
);
const ejecutar = (sql, params = []) => new Promise((resolve, reject) =>
    db.run(sql, params, function (err) { err ? reject(err) : resolve(this); })
);

const SELECCION_MENU = `
    SELECT m.id, c.nombre AS category_name, m.id_categoria AS id_category,
           m.nombre AS name, m.ingredientes AS ingredients, m.descripcion AS description,
           m.img_src, m.disponible AS available, m.precio AS price
    FROM menu m
    LEFT JOIN categorias_menu c ON m.id_categoria = c.id
`;

exports.getAllItems = async () => {
    const filas = await consulta(SELECCION_MENU);
    return filas.map(f => new MenuItem(f));
};


exports.getAllCategories = () => consulta('SELECT id, nombre AS name FROM categorias_menu ORDER BY id');

exports.getItemsByCategory = async (idcategory) => {
    const filas = await consulta(
        `${SELECCION_MENU} WHERE m.id_categoria = ?`,
        [idcategory]
    );
    return filas.map(f => new MenuItem(f));
};

exports.insertItem = async ({ name, ingredients, description, img_src, available, price, id_category }) => {
    const resultado = await ejecutar(
        `INSERT INTO menu (nombre, ingredientes, descripcion, img_src, disponible, precio, id_categoria)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [name, ingredients, description, img_src, available, price, id_category]
    );
    return resultado.lastID;
};

exports.insertCategory = async (name) => {
    const resultado = await ejecutar(
        'INSERT INTO categorias_menu (nombre) VALUES (?)',
        [name]
    );
    return resultado.lastID;
};

exports.updateItem = async ({ id, name, ingredients, description, img_src, available, price, id_category }) => {
    const resultado = await ejecutar(
        `UPDATE menu
         SET nombre = ?, ingredientes = ?, descripcion = ?, img_src = ?,
             disponible = ?, precio = ?, id_categoria = ?
         WHERE id = ?`,
        [name, ingredients, description, img_src, available, price, id_category, id]
    );
    return resultado.changes;
};