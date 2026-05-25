const bcrypt = require('bcrypt');
const jwt    = require('jsonwebtoken');

// FIX: NO capturar process.env en el top-level del módulo.
// Los módulos se evalúan ANTES de que dotenv cargue el .env del volumen.
// Leer la variable en cada llamada garantiza que siempre está disponible.
function getClaveJwt() {
    const clave = process.env.SHARED_JWT_SECRET || process.env.JWT_SECRET_KEY;
    if (!clave) {
        throw new Error('[crypto] JWT_SECRET_KEY no definida en variables de entorno');
    }
    return clave;
}

function verificarToken(token) {
    try {
        return jwt.verify(token, getClaveJwt());
    } catch (err) {
        // Solo logear si es un error de configuración, no de token inválido
        if (err.message.includes('JWT_SECRET_KEY')) {
            console.error('[crypto] ERROR CRÍTICO:', err.message);
        }
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
    const token   = cabeceraAutorizacion.split(' ')[1];
    const payload = verificarToken(token);
    if (!payload) {
        if (res) res.status(401).json({ error: 'Token inválido' });
        return null;
    }
    return payload.id ?? payload.userId ?? payload.sub;
}

module.exports = { verificarToken, cifrarContrasena, compararContrasena, obtenerIdUsuarioDesdeToken };