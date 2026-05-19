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
    queryOne('SELECT * FROM usuarios WHERE email = ?', [email]);

exports.getUserById = (userId) =>
    queryOne('SELECT hash_contrasena FROM usuarios WHERE id = ?', [userId]);

exports.insertLoginLog = (userId, success, ip) =>
    run(
        'INSERT INTO registro_accesos (id_usuario, exitoso, ip_address) VALUES (?, ?, ?)',
        [userId, success ? 1 : 0, ip]
    );

exports.insertUser = async ({ firstName, lastName, phone, email, passwordHash, birthDate }) => {
    const result = await run(
        `INSERT INTO usuarios (nombre, apellido, telefono, email, hash_contrasena, fecha_nacimiento)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [firstName, lastName, phone, email, passwordHash, birthDate || null]
    );
    return result.lastID;
};

exports.insertWallet = (userId, points) =>
    run('INSERT INTO monedero (id_usuario, puntos) VALUES (?, ?)', [userId, points]);

exports.getUserInfo = (userId) =>
    queryOne(
        `SELECT
             u.nombre        AS first_name,
             u.apellido      AS last_name,
             u.telefono      AS phone,
             u.email,
             u.fecha_nacimiento AS birth_date,
             u.nivel_acceso  AS access_level,
             m.puntos        AS points,
             (SELECT nombre     FROM niveles WHERE m.puntos >= puntos_min AND m.puntos <= puntos_max) AS levelName,
             (SELECT hex_bkg    FROM niveles WHERE m.puntos >= puntos_min AND m.puntos <= puntos_max) AS levelBkg,
             (SELECT hex_text   FROM niveles WHERE m.puntos >= puntos_min AND m.puntos <= puntos_max) AS levelText,
             (SELECT puntos_min FROM niveles WHERE m.puntos >= puntos_min AND m.puntos <= puntos_max) AS levelMin,
             (SELECT puntos_max FROM niveles WHERE m.puntos >= puntos_min AND m.puntos <= puntos_max) AS levelMax,
             (SELECT nombre FROM niveles
                 WHERE puntos_min > (SELECT puntos_max FROM niveles WHERE m.puntos >= puntos_min AND m.puntos <= puntos_max)
                 ORDER BY puntos_min ASC LIMIT 1) AS nextLevelName,
             (SELECT COUNT(*) FROM tickets WHERE id_usuario = u.id) AS ticket_count
         FROM usuarios u
         LEFT JOIN monedero m ON u.id = m.id_usuario
         WHERE u.id = ?`,
        [userId]
    );

exports.getTransactions = (userId) =>
    query(
        `SELECT * FROM transacciones_puntos
         WHERE id_usuario = ?
         ORDER BY id DESC
         LIMIT 50`,
        [userId]
    );

exports.getLevels = () =>
    query(
        'SELECT id, nombre, puntos_min, puntos_max, hex_bkg, hex_text FROM niveles ORDER BY puntos_min ASC'
    );

exports.updatePerfil = (userId, first_name, last_name, phone) =>
    run(
        'UPDATE usuarios SET nombre = ?, apellido = ?, telefono = ? WHERE id = ?',
        [first_name, last_name, phone, userId]
    );

exports.updatePassword = (userId, newHash) =>
    run('UPDATE usuarios SET hash_contrasena = ? WHERE id = ?', [newHash, userId]);