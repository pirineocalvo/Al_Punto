const db = require('../utils/db');

const query = (sql, params = []) => new Promise((resolve, reject) =>
    db.all(sql, params, (err, rows) => err ? reject(err) : resolve(rows))
);
const queryOne = (sql, params = []) => new Promise((resolve, reject) =>
    db.get(sql, params, (err, row) => err ? reject(err) : resolve(row))
);
const run = (sql, params = []) => new Promise((resolve, reject) =>
    db.run(sql, params, function (err) { err ? reject(err) : resolve(this) })
);

const MENU_SELECT = `
    SELECT m.id, c.nombre AS category_name, m.id_categoria AS id_category,
           m.nombre AS name, m.ingredientes AS ingredients, m.descripcion AS description,
           m.img_src, m.disponible AS available, m.precio AS price
    FROM menu m
    LEFT JOIN categorias_menu c ON m.id_categoria = c.id
`;

exports.getAllItems = () => query(MENU_SELECT);

exports.getAllCategories = () => query('SELECT id, nombre AS name FROM categorias_menu ORDER BY id');

exports.getItemsByCategory = (idcategory) => query(
    `${MENU_SELECT} WHERE m.id_categoria = ?`,
    [idcategory]
);

exports.insertItem = async ({ name, ingredients, description, img_src, available, price, id_category }) => {
    const result = await run(
        `INSERT INTO menu (nombre, ingredientes, descripcion, img_src, disponible, precio, id_categoria)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [name, ingredients, description, img_src, available, price, id_category]
    );
    return result.lastID;
};

exports.insertCategory = async (name) => {
    const result = await run(
        'INSERT INTO categorias_menu (nombre) VALUES (?)',
        [name]
    );
    return result.lastID;
};

exports.updateItem = async ({ id, name, ingredients, description, img_src, available, price, id_category }) => {
    const result = await run(
        `UPDATE menu
         SET nombre = ?, ingredientes = ?, descripcion = ?, img_src = ?,
             disponible = ?, precio = ?, id_categoria = ?
         WHERE id = ?`,
        [name, ingredients, description, img_src, available, price, id_category, id]
    );
    return result.changes;
};