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

exports.insertTicket = async (userId, fileName, ocrText, points, status) => {
    const result = await run(
        `INSERT INTO Tickets (user_id, image_url, json_content, points_awarded, status)
         VALUES (?, ?, ?, ?, ?)`,
        [userId, fileName, ocrText, points, status]
    );
    return result.lastID;
};

exports.getWalletByUser = (userId) =>
    queryOne('SELECT * FROM Wallet WHERE user_id = ?', [userId]);

exports.updateWalletPoints = (newPoints, userId) =>
    run('UPDATE Wallet SET points = ? WHERE user_id = ?', [newPoints, userId]);

exports.insertPointTransaction = (userId, walletId, points) =>
    run(
        `INSERT INTO Point_transactions (user_id, wallet_id, amount_transaction, type)
         VALUES (?, ?, ?, 'add ticket')`,
        [userId, walletId, points]
    );

exports.getLevels = () =>
    query('SELECT name, min_points, max_points FROM Levels ORDER BY min_points ASC');

exports.getTicketsByUser = (userId) =>
    query('SELECT * FROM Tickets WHERE user_id = ?', [userId]);