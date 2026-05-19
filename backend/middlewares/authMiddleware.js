const { verifyToken } = require('../utils/crypto');
const db = require('../utils/db');
const { getUserIdFromToken } = require('../utils/crypto');

exports.getTokenUserId = (req, res) => {
    const authHeader = req.headers['authorization'];
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        res.status(401).json({ error: 'Token no proporcionado o formato inválido' });
        return null;
    }
    const token = authHeader.split(' ')[1];
    const payload = verifyToken(token);
    if (!payload) {
        res.status(401).json({ error: 'Token inválido' });
        return null;
    }
    return payload.id ?? payload.userId ?? payload.sub;
};

exports.waiterMiddleware = (req, res, next) => {
    const userId = exports.getTokenUserId(req, res);
    if (!userId) return;
    req.userId = userId;
    db.get('SELECT nivel_acceso FROM usuarios WHERE id = ?', [userId], (err, user) => {
        if (err)
            return res.status(500).json({ error: 'Error de base de datos' });
        if (!user || user.nivel_acceso < 3)
            return res.status(403).json({ error: 'Acceso denegado: se requiere nivel Camarero o superior' });
        next();
    });
};

exports.adminMiddleware = (req, res, next) => {
    const userId = exports.getTokenUserId(req, res);
    if (!userId) return;
    req.userId = userId;
    db.get('SELECT nivel_acceso FROM usuarios WHERE id = ?', [userId], (err, user) => {
        if (err)
            return res.status(500).json({ error: 'Error de base de datos' });
        if (!user || user.nivel_acceso < 5)
            return res.status(403).json({ error: 'Acceso denegado: se requiere nivel Administrador' });
        next();
    });
};

exports.authMiddleware = (req, res, next) => {
    const userId = getUserIdFromToken(req, res);
    if (!userId) return;
    req.userId = userId;
    next();
};