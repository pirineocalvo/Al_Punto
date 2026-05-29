const db = require('../utils/db');
const Ticket = require('../classes/Ticket');

const consulta = (sql, params = []) => new Promise((resolve, reject) =>
    db.all(sql, params, (err, filas) => err ? reject(err) : resolve(filas))
);
const consultaUno = (sql, params = []) => new Promise((resolve, reject) =>
    db.get(sql, params, (err, fila) => err ? reject(err) : resolve(fila))
);
const ejecutar = (sql, params = []) => new Promise((resolve, reject) =>
    db.run(sql, params, function (err) { err ? reject(err) : resolve(this); })
);

exports.insertTicket = async (idUsuario, nombreArchivo, textoOcr, puntos, estado) => {
    const resultado = await ejecutar(
        `INSERT INTO tickets (id_usuario, url_imagen, contenido_json, puntos_otorgados, estado)
         VALUES (?, ?, ?, ?, ?)`,
        [idUsuario, nombreArchivo, textoOcr, puntos, estado]
    );
    return resultado.lastID;
};

exports.getWalletByUser = (idUsuario) =>
    consultaUno(
        'SELECT id, puntos AS points FROM monedero WHERE id_usuario = ?',
        [idUsuario]
    );

exports.updateWalletPoints = (puntosTras, idUsuario) =>
    ejecutar('UPDATE monedero SET puntos = ? WHERE id_usuario = ?', [puntosTras, idUsuario]);

exports.insertPointTransaction = (idUsuario, idMonedero, puntos) =>
    ejecutar(
        `INSERT INTO transacciones_puntos (id_usuario, id_monedero, cantidad_transaccion, tipo)
         VALUES (?, ?, ?, 'add ticket')`,
        [idUsuario, idMonedero, puntos]
    );

exports.getLevels = () =>
    consulta('SELECT nombre AS name, puntos_min AS min_points, puntos_max AS max_points FROM niveles ORDER BY puntos_min ASC');

exports.getTicketsByUser = async (idUsuario) =>{
     const fila = await consulta(
        `SELECT id, url_imagen AS image_url, contenido_json AS ocr_content,
                puntos_otorgados AS points_granted, estado AS status,
                creado_en AS created_at
         FROM tickets WHERE id_usuario = ?
         ORDER BY creado_en DESC`,
        [idUsuario]
    );
    
        return fila.map(f => new Ticket(f));
};