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
    SELECT Menu.id, Menu_category.name AS category_name, Menu.id_category,
           Menu.name, Menu.ingredients, Menu.description,
           Menu.img_src, Menu.available, Menu.price
    FROM Menu
    LEFT JOIN Menu_category ON Menu.id_category = Menu_category.id
`;

exports.getAllItems = () => query(MENU_SELECT);

exports.getAllCategories = () => query('SELECT * FROM Menu_category ORDER BY id');

exports.getItemsByCategory = (idcategory) => query(
    `${MENU_SELECT} WHERE Menu.id_category = ?`,
    [idcategory]
);

exports.insertItem = async ({ name, ingredients, description, img_src, available, price, id_category }) => {
    const result = await run(
        `INSERT INTO Menu (name, ingredients, description, img_src, available, price, id_category)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [name, ingredients, description, img_src, available, price, id_category]
    );
    return result.lastID;
};

exports.insertCategory = async (name) => {
    const result = await run(
        'INSERT INTO Menu_category (name) VALUES (?)',
        [name]
    );
    return result.lastID;
};

exports.updateItem = async ({ id, name, ingredients, description, img_src, available, price, id_category }) => {
    const result = await run(
        `UPDATE Menu
         SET name = ?, ingredients = ?, description = ?, img_src = ?,
             available = ?, price = ?, id_category = ?
         WHERE id = ?`,
        [name, ingredients, description, img_src, available, price, id_category, id]
    );
    return result.changes;
};