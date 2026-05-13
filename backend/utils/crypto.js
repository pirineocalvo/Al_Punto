const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const jwtKey = process.env.SHARED_JWT_SECRET || process.env.JWT_SECRET_KEY;

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

function getUserIdFromToken(req, res) {
    const authHeader = req.headers['authorization'];
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        if (res) res.status(401).json({ error: 'Token no proporcionado o formato inválido' });
        return null;
    }
    const token   = authHeader.split(' ')[1];
    const payload = verifyToken(token);
    if (!payload) {
        if (res) res.status(401).json({ error: 'Token inválido' });
        return null;
    }
    return payload.id ?? payload.userId ?? payload.sub;
}

module.exports = { verifyToken, hashPassword, comparePassword, getUserIdFromToken };