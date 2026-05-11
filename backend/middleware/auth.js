const { verifyToken } = require('../utils/crypto');
const db = require('../utils/db');

/**
 * Verifica el token JWT del authService.
 * Añade req.user = { id (authUserId), email, nombre, apellido }
 */
const authenticate = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer '))
        return res.status(401).json({ error: 'Token no proporcionado o formato inválido' });
    const decoded = verifyToken(authHeader.split(' ')[1]);
    if (!decoded) return res.status(401).json({ error: 'Token inválido o expirado' });
    req.user = decoded;
    next();
};

/**
 * Igual que authenticate pero además resuelve el ID local del usuario
 * y lo adjunta como req.localUserId. Falla con 401 si el usuario no
 * existe localmente (no ha hecho auto-provision aún).
 */
const authenticateWithLocal = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer '))
        return res.status(401).json({ error: 'Token no proporcionado o formato inválido' });
    const decoded = verifyToken(authHeader.split(' ')[1]);
    if (!decoded) return res.status(401).json({ error: 'Token inválido o expirado' });
    req.user = decoded;

    db.get('SELECT id FROM Users WHERE auth_user_id = ?', [decoded.id], (err, row) => {
        if (err) return res.status(500).json({ error: 'Error de base de datos' });
        if (!row) return res.status(401).json({ error: 'Usuario no encontrado localmente. Inicia sesión en el Restaurante primero.' });
        req.localUserId = row.id;
        next();
    });
};

/**
 * Requiere camarero (access_level >= 3) o superior.
 */
const requireWaiter = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer '))
        return res.status(401).json({ error: 'Token no proporcionado o formato inválido' });
    const decoded = verifyToken(authHeader.split(' ')[1]);
    if (!decoded) return res.status(401).json({ error: 'Token inválido o expirado' });
    req.user = decoded;

    db.get('SELECT id, access_level FROM Users WHERE auth_user_id = ?', [decoded.id], (err, user) => {
        if (err) return res.status(500).json({ error: 'Error de base de datos' });
        if (!user || user.access_level < 3)
            return res.status(403).json({ error: 'Acceso denegado: se requiere nivel Camarero o superior' });
        req.localUserId = user.id;
        next();
    });
};

/**
 * Requiere admin (access_level >= 4).
 */
const requireAdmin = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer '))
        return res.status(401).json({ error: 'Token no proporcionado o formato inválido' });
    const decoded = verifyToken(authHeader.split(' ')[1]);
    if (!decoded) return res.status(401).json({ error: 'Token inválido o expirado' });
    req.user = decoded;

    db.get('SELECT id, access_level FROM Users WHERE auth_user_id = ?', [decoded.id], (err, user) => {
        if (err) return res.status(500).json({ error: 'Error de base de datos' });
        if (!user || user.access_level < 4)
            return res.status(403).json({ error: 'Acceso denegado: se requiere nivel Administrador' });
        req.localUserId = user.id;
        next();
    });
};

module.exports = { authenticate, authenticateWithLocal, requireWaiter, requireAdmin };
