const { verificarToken, obtenerIdUsuarioDesdeToken } = require('../utils/crypto');
const db = require('../utils/db');

exports.getTokenUserId = (req, res) => {
    const cabeceraAutorizacion = req.headers['authorization'];
    if (!cabeceraAutorizacion || !cabeceraAutorizacion.startsWith('Bearer ')) {
        res.status(401).json({ error: 'Token no proporcionado o formato invalido' });
        return null;
    }
    const token = cabeceraAutorizacion.split(' ')[1];
    const payload = verificarToken(token);
    if (!payload) {
        res.status(401).json({ error: 'Token invalido' });
        return null;
    }
    return payload.id ?? payload.userId ?? payload.sub;
};

exports.waiterMiddleware = (req, res, next) => {
    const idUsuario = exports.getTokenUserId(req, res);
    if (!idUsuario) return;
    req.userId = idUsuario;
    db.get('SELECT nivel_acceso FROM usuarios WHERE id = ?', [idUsuario], (err, usuario) => {
        if (err) {
            return res.status(500).json({ error: 'Error de base de datos' });
        }
        if (!usuario || usuario.nivel_acceso < 3) {
            return res.status(403).json({ error: 'Acceso denegado: se requiere nivel Camarero o superior' });
        }
        next();
    });
};

exports.adminMiddleware = (req, res, next) => {
    const idUsuario = exports.getTokenUserId(req, res);
    if (!idUsuario) return;
    req.userId = idUsuario;
    db.get('SELECT nivel_acceso FROM usuarios WHERE id = ?', [idUsuario], (err, usuario) => {
        if (err) return res.status(500).json({ error: 'Error de base de datos' });
        if (!usuario || usuario.nivel_acceso < 5) {
            return res.status(403).json({ error: 'Acceso denegado: se requiere nivel Administrador' });
        }
        next();
    });
};

exports.authMiddleware = (req, res, next) => {
    const idUsuario = obtenerIdUsuarioDesdeToken(req, res);
    if (!idUsuario) return;
    req.userId = idUsuario;
    next();
};