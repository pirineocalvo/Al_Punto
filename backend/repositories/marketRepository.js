const db = require('../utils/db');

const query = (sql, params) => new Promise((resolve, reject) =>
    db.all(sql, params, (err, rows) => err ? reject(err) : resolve(rows))
);
const queryOne = (sql, params) => new Promise((resolve, reject) =>
    db.get(sql, params, (err, row) => err ? reject(err) : resolve(row))
);
const run = (sql, params) => new Promise((resolve, reject) =>
    db.run(sql, params, function (err) { err ? reject(err) : resolve(this.changes); })
);

exports.getLevelByUserPoints = (userId) => query(
    `SELECT id FROM Levels
     WHERE min_points <= (SELECT points FROM Wallet WHERE user_id = ?)
       AND max_points >= (SELECT points FROM Wallet WHERE user_id = ?)`,
    [userId, userId]
);

exports.getItemsByLevel = (levelId) => query(
    'SELECT * FROM Marketplace WHERE min_level_id <= ?',
    [levelId]
);

exports.getPocketByUser = (userId) => query(
    `SELECT p.id AS pocket_id, p.is_used, p.added_at, p.used_at, p.token_url,
            m.id AS product_id, m.name, m.description, m.img_src, m.points_price
     FROM Pocket p
     INNER JOIN Marketplace m ON p.product_id = m.id
     WHERE p.user_id = ?
     ORDER BY p.is_used ASC, p.added_at DESC`,
    [userId]
);

exports.getProductById = (productId) => queryOne(
    'SELECT points_price FROM Marketplace WHERE id = ?',
    [productId]
);

exports.getWalletByUser = (userId) => queryOne(
    'SELECT id, points FROM Wallet WHERE user_id = ?',
    [userId]
);

exports.deductPoints = (userId, amount) => run(
    'UPDATE Wallet SET points = points - ? WHERE user_id = ?',
    [amount, userId]
);

exports.insertPocketItem = (userId, productId, tokenUrl) => run(
    'INSERT INTO Pocket (user_id, product_id, token_url) VALUES (?, ?, ?)',
    [userId, productId, tokenUrl]
);

exports.insertPointTransaction = (userId, walletId, amount, type) => run(
    `INSERT INTO Point_transactions (user_id, wallet_id, amount_transaction, type) VALUES (?, ?, ?, ?)`,
    [userId, walletId, amount, type]
);

exports.getPocketByToken = (tokenUrl, userId) => queryOne(
    `SELECT p.id AS pocket_id, p.is_used, p.used_at, p.expires_at, p.added_at,
            m.id AS product_id, m.name AS product_name, m.description AS product_description, m.img_src,
            u.id AS user_id, u.first_name, u.last_name, u.email
     FROM Pocket p
     INNER JOIN Marketplace m ON p.product_id = m.id
     INNER JOIN Users u ON p.user_id = u.id
     WHERE p.token_url = ? AND p.user_id = ?`,
    [tokenUrl, userId]
);

exports.getPocketStatusByToken = (tokenUrl, userId) => queryOne(
    'SELECT id, is_used, expires_at FROM Pocket WHERE token_url = ? AND user_id = ?',
    [tokenUrl, userId]
);

exports.markPocketAsUsed = (pocketId, usedAt) => run(
    'UPDATE Pocket SET is_used = 1, used_at = ? WHERE id = ? AND is_used = 0',
    [usedAt, pocketId]
);