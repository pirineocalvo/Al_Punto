const bcrypt = require('bcrypt'), jwt = require('jsonwebtoken'), jwtKey = process.env.JWT_SECRET_KEY;
function encrypt(c) {
    const d = jwt['sign']({ 'data': c }, jwtKey, { 'expiresIn': '1h' });
    return d;
}
function decrypt(d) {
    try {
        const e = jwt['verify'](d, jwtKey);
        return e['data'];
    } catch (f) {
        return null;
    }
}
function hashPassword(b) {
    return bcrypt['hashSync'](b, 0xa);
}
function comparePassword(c, d) {
    return bcrypt['compareSync'](c, d);
}
module['exports'] = {
    'encrypt': encrypt,
    'decrypt': decrypt,
    'hashPassword': hashPassword,
    'comparePassword': comparePassword
};