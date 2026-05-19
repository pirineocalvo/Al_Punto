const userRepo = require('../repositories/userRepository');
const { hashPassword, comparePassword } = require('../utils/crypto');
const jwt = require('jsonwebtoken');

const jwtKey = process.env.SHARED_JWT_SECRET || process.env.JWT_SECRET_KEY;
const WALLET_INITIAL_POINTS = 500;

exports.login = async (email, password, ip) => {
    if (!email || !password) {
        const err = new Error('Email y contraseña son obligatorios');
        err.status = 400;
        throw err;
    }

    const user = await userRepo.getUserByEmail(email);
    const isValid = user ? comparePassword(password, user.hash_contrasena) : false;

    if (user) await userRepo.insertLoginLog(user.id, isValid, ip);

    if (!user) {
        const err = new Error('Usuario no encontrado');
        err.status = 401;
        throw err;
    }
    if (!isValid) {
        const err = new Error('Contraseña incorrecta');
        err.status = 401;
        throw err;
    }

    const token = jwt.sign(
        { id: user.id, email: user.email },
        jwtKey,
        { expiresIn: '7d' }
    );

    return {
        token,
        userInfo: {
            first_name: user.nombre,
            last_name: user.apellido,
            phone: user.telefono,
            email: user.email,
        },
    };
};

exports.register = async ({ firstName, lastName, phone, email, password, birthDate }) => {
    if (!firstName || !lastName || !email || !password) {
        const err = new Error('Faltan campos obligatorios');
        err.status = 400;
        throw err;
    }

    const existing = await userRepo.getUserByEmail(email);
    if (existing) {
        const err = new Error('Usuario ya registrado');
        err.status = 409;
        throw err;
    }

    const passwordHash = hashPassword(password);
    const newUserId = await userRepo.insertUser({ firstName, lastName, phone, email, passwordHash, birthDate });

    await userRepo.insertWallet(newUserId, WALLET_INITIAL_POINTS);

    return { message: 'Usuario registrado correctamente' };
};

exports.getUserInfo = async (userId) => {
    const info = await userRepo.getUserInfo(userId);
    if (!info) {
        const err = new Error('Usuario no encontrado');
        err.status = 404;
        throw err;
    }
    return info;
};

exports.getTransactions = (userId) => userRepo.getTransactions(userId);

exports.getLevels = () => userRepo.getLevels();

exports.updatePerfil = async (userId, first_name, last_name, phone) => {
    if (!first_name || !last_name) {
        const err = new Error('Nombre y apellidos son obligatorios');
        err.status = 400;
        throw err;
    }
    await userRepo.updatePerfil(userId, first_name, last_name, phone || null);
    return { message: 'Perfil actualizado correctamente' };
};

exports.updatePassword = async (userId, password_actual, password_nueva) => {
    if (!password_actual || !password_nueva) {
        const err = new Error('Faltan campos obligatorios');
        err.status = 400;
        throw err;
    }
    if (password_nueva.length < 6) {
        const err = new Error('La nueva contraseña debe tener al menos 6 caracteres');
        err.status = 400;
        throw err;
    }

    const user = await userRepo.getUserById(userId);
    if (!user) {
        const err = new Error('Usuario no encontrado');
        err.status = 404;
        throw err;
    }
    if (!comparePassword(password_actual, user.hash_contrasena)) {
        const err = new Error('La contraseña actual no es correcta');
        err.status = 401;
        throw err;
    }

    await userRepo.updatePassword(userId, hashPassword(password_nueva));
    return { message: 'Contraseña actualizada correctamente' };
};