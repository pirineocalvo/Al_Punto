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

exports.insertResenia = (id_plato, descripcion, puntuacion, userId) =>
    run(
        'INSERT INTO Resenias (id_plato, descripcion, puntuacion, user_id) VALUES (?, ?, ?, ?)',
        [id_plato, descripcion, puntuacion, userId]
    );

exports.getWalletByUser = (userId) =>
    queryOne('SELECT id FROM Wallet WHERE user_id = ?', [userId]);

exports.insertPointTransaction = (userId, walletId, amount) =>
    run(
        `INSERT INTO Point_transactions (user_id, wallet_id, amount_transaction, type)
         VALUES (?, ?, ?, 'add resenia')`,
        [userId, walletId, amount]
    );

exports.addPoints = (userId, amount) =>
    run(
        'UPDATE Wallet SET points = points + ? WHERE user_id = ?',
        [amount, userId]
    );

exports.getReviewsByUser = (userId) =>
    query(
        `SELECT r.*, m.name AS plato_name, m.img_src AS plato_img
         FROM Resenias r
         LEFT JOIN Menu m ON r.id_plato = m.id
         WHERE r.user_id = ?
         ORDER BY r.created_at DESC`,
        [userId]
    );

exports.getReviewsByPlato = (id_plato) =>
    query(
        `SELECT r.*, u.first_name, u.last_name
         FROM Resenias r
         LEFT JOIN Users u ON r.user_id = u.id
         WHERE r.id_plato = ?
         ORDER BY r.created_at DESC`,
        [id_plato]
    );