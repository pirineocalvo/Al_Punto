const db = require('../utils/db');
const Usuario = require('../classes/Usuario');

const consulta = (sql, params = []) => new Promise((resolve, reject) =>
    db.all(sql, params, (err, filas) => err ? reject(err) : resolve(filas))
);
const consultaUno = (sql, params = []) => new Promise((resolve, reject) =>
    db.get(sql, params, (err, fila) => err ? reject(err) : resolve(fila))
);
const ejecutar = (sql, params = []) => new Promise((resolve, reject) =>
    db.run(sql, params, function (err) { err ? reject(err) : resolve(this); })
);

exports.getUserByEmail = async (email) => {
    const fila = await consultaUno('SELECT * FROM usuarios WHERE email = ?', [email]);
    if (!fila) return null;
    return new Usuario({
        id: fila.id,
        nombre: fila.nombre,
        apellido: fila.apellido,
        email: fila.email,
        telefono: fila.telefono,
        nivel_acceso: fila.nivel_acceso,
        activo: fila.activo,
        creado_en: fila.creado_en,
        hash_contrasena: fila.hash_contrasena,
    });
};

exports.getUserById = async (idUsuario) => {
    const fila = await consultaUno('SELECT * FROM usuarios WHERE id = ?', [idUsuario]);
    if (!fila) return null;
    return new Usuario({
        id: fila.id,
        nombre: fila.nombre,
        apellido: fila.apellido,
        email: fila.email,
        telefono: fila.telefono,
        nivel_acceso: fila.nivel_acceso,
        activo: fila.activo,
        creado_en: fila.creado_en,
        hash_contrasena: fila.hash_contrasena,
    });
};

exports.insertLoginLog = (idUsuario, exitoso, ip) =>
    ejecutar(
        'INSERT INTO registro_accesos (id_usuario, exitoso, ip_address) VALUES (?, ?, ?)',
        [idUsuario, exitoso ? 1 : 0, ip]
    );

exports.insertUser = async ({ firstName, lastName, phone, email, passwordHash }) => {
    const resultado = await ejecutar(
        `INSERT INTO usuarios (nombre, apellido, telefono, email, hash_contrasena)
         VALUES (?, ?, ?, ?, ?)`,
        [firstName, lastName, phone, email, passwordHash || null]
    );
    return resultado.lastID;
};

exports.insertWallet = (idUsuario, puntos) =>
    ejecutar('INSERT INTO monedero (id_usuario, puntos) VALUES (?, ?)', [idUsuario, puntos]);

exports.getUserInfo = (idUsuario) =>
    consultaUno(
        `SELECT
             u.id,
             u.nombre        AS first_name,
             u.apellido      AS last_name,
             u.telefono      AS phone,
             u.email,
             u.nivel_acceso  AS access_level,
             m.puntos        AS points,
             (SELECT nombre     FROM niveles WHERE m.puntos >= puntos_min AND m.puntos <= puntos_max) AS levelName,
             (SELECT puntos_min FROM niveles WHERE m.puntos >= puntos_min AND m.puntos <= puntos_max) AS levelMin,
             (SELECT puntos_max FROM niveles WHERE m.puntos >= puntos_min AND m.puntos <= puntos_max) AS levelMax,
             (SELECT nombre FROM niveles
                 WHERE puntos_min > (SELECT puntos_max FROM niveles WHERE m.puntos >= puntos_min AND m.puntos <= puntos_max)
                 ORDER BY puntos_min ASC LIMIT 1) AS nextLevelName,
             (SELECT COUNT(*) FROM tickets WHERE id_usuario = u.id) AS ticket_count
         FROM usuarios u
         LEFT JOIN monedero m ON u.id = m.id_usuario
         WHERE u.id = ?`,
        [idUsuario]
    );

exports.getTransactions = (idUsuario) =>
    consulta(
        `SELECT * FROM transacciones_puntos
         WHERE id_usuario = ?
         ORDER BY id DESC
         LIMIT 50`,
        [idUsuario]
    );

exports.getLevels = () =>
    consulta(
        'SELECT id, nombre, puntos_min, puntos_max FROM niveles ORDER BY puntos_min ASC'
    );

exports.updatePerfil = (idUsuario, first_name, last_name, phone) =>
    ejecutar(
        'UPDATE usuarios SET nombre = ?, apellido = ?, telefono = ? WHERE id = ?',
        [first_name, last_name, phone, idUsuario]
    );

exports.updatePassword = (idUsuario, nuevoHash) =>
    ejecutar('UPDATE usuarios SET hash_contrasena = ? WHERE id = ?', [nuevoHash, idUsuario]);

exports.obtenerUsuarioPorId = async (id) => {
    const fila = await consultaUno('SELECT nombre, apellido FROM usuarios WHERE id = ?', [id]);
    if (!fila) return null;
    return new Usuario({ id, nombre: fila.nombre, apellido: fila.apellido });
};