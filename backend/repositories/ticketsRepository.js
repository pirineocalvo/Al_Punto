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
        `INSERT INTO tickets (id_usuario, url_imagen, contenido_json, puntos_otorgados, estado)
         VALUES (?, ?, ?, ?, ?)`,
        [userId, fileName, ocrText, points, status]
    );
    return result.lastID;
};

exports.getWalletByUser = (userId) =>
    queryOne(
        'SELECT id, puntos AS points FROM monedero WHERE id_usuario = ?',
        [userId]
    );

exports.updateWalletPoints = (newPoints, userId) =>
    run('UPDATE monedero SET puntos = ? WHERE id_usuario = ?', [newPoints, userId]);

exports.insertPointTransaction = (userId, walletId, points) =>
    run(
        `INSERT INTO transacciones_puntos (id_usuario, id_monedero, cantidad_transaccion, tipo)
         VALUES (?, ?, ?, 'add ticket')`,
        [userId, walletId, points]
    );

exports.getLevels = () =>
    query('SELECT nombre AS name, puntos_min AS min_points, puntos_max AS max_points FROM niveles ORDER BY puntos_min ASC');

exports.getTicketsByUser = (userId) =>
    query(
        `SELECT id, url_imagen AS image_url, contenido_json AS ocr_content,
                puntos_otorgados AS points_granted, estado AS status,
                creado_en AS created_at
         FROM tickets WHERE id_usuario = ?
         ORDER BY creado_en DESC`,
        [userId]
    );