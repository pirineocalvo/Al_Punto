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

exports.getUserByEmail = (email) =>
    queryOne('SELECT * FROM Users WHERE email = ?', [email]);

exports.getUserById = (userId) =>
    queryOne('SELECT password_hash FROM Users WHERE id = ?', [userId]);

exports.insertLoginLog = (userId, success, ip) =>
    run(
        'INSERT INTO login_log (user_id, success, ip_address) VALUES (?, ?, ?)',
        [userId, success ? 1 : 0, ip]
    );

exports.insertUser = async ({ firstName, lastName, phone, email, passwordHash, birthDate }) => {
    const result = await run(
        `INSERT INTO Users (first_name, last_name, phone, email, password_hash, birth_date)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [firstName, lastName, phone, email, passwordHash, birthDate || null]
    );
    return result.lastID;
};

exports.insertWallet = (userId, points) =>
    run('INSERT INTO Wallet (user_id, points) VALUES (?, ?)', [userId, points]);

exports.getUserInfo = (userId) =>
    queryOne(
        `SELECT
             Users.first_name, Users.last_name, Users.phone, Users.email,
             Users.birth_date, Users.access_level,
             Wallet.points,
             (SELECT name       FROM Levels WHERE Wallet.points >= min_points AND Wallet.points <= max_points) AS levelName,
             (SELECT hex_bkg    FROM Levels WHERE Wallet.points >= min_points AND Wallet.points <= max_points) AS levelBkg,
             (SELECT hex_text   FROM Levels WHERE Wallet.points >= min_points AND Wallet.points <= max_points) AS levelText,
             (SELECT min_points FROM Levels WHERE Wallet.points >= min_points AND Wallet.points <= max_points) AS levelMin,
             (SELECT max_points FROM Levels WHERE Wallet.points >= min_points AND Wallet.points <= max_points) AS levelMax,
             (SELECT name FROM Levels
                 WHERE min_points > (SELECT max_points FROM Levels WHERE Wallet.points >= min_points AND Wallet.points <= max_points)
                 ORDER BY min_points ASC LIMIT 1) AS nextLevelName,
             (SELECT COUNT(*) FROM Tickets WHERE user_id = Users.id) AS ticket_count
         FROM Users
         LEFT JOIN Wallet ON Users.id = Wallet.user_id
         WHERE Users.id = ?`,
        [userId]
    );

exports.getTransactions = (userId) =>
    query(
        `SELECT * FROM Point_transactions
         WHERE user_id = ?
         ORDER BY id DESC
         LIMIT 50`,
        [userId]
    );

exports.getLevels = () =>
    query(
        'SELECT id, name, min_points, max_points, hex_bkg, hex_text FROM Levels ORDER BY min_points ASC'
    );

exports.updatePerfil = (userId, first_name, last_name, phone) =>
    run(
        'UPDATE Users SET first_name = ?, last_name = ?, phone = ? WHERE id = ?',
        [first_name, last_name, phone, userId]
    );

exports.updatePassword = (userId, newHash) =>
    run('UPDATE Users SET password_hash = ? WHERE id = ?', [newHash, userId]);