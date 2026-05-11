const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const jwtKey = process.env.SHARED_JWT_SECRET || process.env.JWT_SECRET_KEY;

/**
 * Verifica un token JWT emitido por el authService.
 * Devuelve el payload { id, email, nombre, apellido, ... } o null si inválido.
 */
function verifyToken(token) {
    try {
        return jwt.verify(token, jwtKey);
    } catch {
        return null;
    }
}

function hashPassword(password) {
    return bcrypt.hashSync(password, 10);
}

function comparePassword(password, hash) {
    return bcrypt.compareSync(password, hash);
}

module.exports = { verifyToken, hashPassword, comparePassword };
