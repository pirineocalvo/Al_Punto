const bcrypt = require('bcrypt');
const jwt    = require('jsonwebtoken');

const claveJwt = process.env.SHARED_JWT_SECRET || process.env.JWT_SECRET_KEY;

function verificarToken(token) {
    try {
        return jwt.verify(token, claveJwt);
    } catch {
        return null;
    }
}

function cifrarContrasena(contrasena) {
    return bcrypt.hashSync(contrasena, 10);
}

function compararContrasena(contrasena, hash) {
    return bcrypt.compareSync(contrasena, hash);
}

function obtenerIdUsuarioDesdeToken(req, res) {
    const cabeceraAutorizacion = req.headers['authorization'];
    if (!cabeceraAutorizacion || !cabeceraAutorizacion.startsWith('Bearer ')) {
        if (res) res.status(401).json({ error: 'Token no proporcionado o formato inválido' });
        return null;
    }
    const token    = cabeceraAutorizacion.split(' ')[1];
    const payload  = verificarToken(token);
    if (!payload) {
        if (res) res.status(401).json({ error: 'Token inválido' });
        return null;
    }
    return payload.id ?? payload.userId ?? payload.sub;
}

module.exports = { verificarToken, cifrarContrasena, compararContrasena, obtenerIdUsuarioDesdeToken };