const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const jwtKey = process.env.JWT_SECRET_KEY;

// Encripta un texto simple en un JWT
function encrypt(text) {
  // El payload almacena el texto original
  const token = jwt.sign({ data: text }, jwtKey, { expiresIn: '1h' });
  return token;
}

// Descifra (verifica y extrae) el texto de un JWT si el token es válido
function decrypt(token) {
  try {
    const decoded = jwt.verify(token, jwtKey);
    return decoded.data;
  } catch (err) {
    return null;
  }
}
function hashPassword(password) {
  return bcrypt.hashSync(password, 10);
}
function comparePassword(password, hash) {
  return bcrypt.compareSync(password, hash);
}

module.exports = { encrypt, decrypt, hashPassword, comparePassword };