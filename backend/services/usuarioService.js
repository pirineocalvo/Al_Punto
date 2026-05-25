const repositorioUsuario = require('../repositories/usuarioRepository');
const { cifrarContrasena, compararContrasena } = require('../utils/crypto');
const jwt = require('jsonwebtoken');

const PUNTOS_INICIALES_MONEDERO = 500;

exports.iniciarSesion = async (email, contrasena, ip) => {
    if (!email || !contrasena) {
        const error = new Error('Email y contraseña son obligatorios');
        error.status = 400;
        throw error;
    }

    const usuario = await repositorioUsuario.getUserByEmail(email);
    const esValido = usuario ? compararContrasena(contrasena, usuario.hash_contrasena) : false;

    if (usuario) await repositorioUsuario.insertLoginLog(usuario.id, esValido, ip);

    if (!usuario) {
        const error = new Error('Usuario no encontrado');
        error.status = 401;
        throw error;
    }
    if (!esValido) {
        const error = new Error('Contraseña incorrecta');
        error.status = 401;
        throw error;
    }

    const token = jwt.sign(
        { id: usuario.id, email: usuario.email },
        process.env.SHARED_JWT_SECRET || process.env.JWT_SECRET_KEY,
        { expiresIn: '7d' }
    );

    return {
        token,
        userInfo: {
            first_name: usuario.nombre,
            last_name: usuario.apellido,
            phone: usuario.telefono,
            email: usuario.email,
        },
    };
};

exports.registrar = async ({ firstName, lastName, phone, email, password, birthDate }) => {
    if (!firstName || !lastName || !email || !password) {
        const error = new Error('Faltan campos obligatorios');
        error.status = 400;
        throw error;
    }

    const usuarioExistente = await repositorioUsuario.getUserByEmail(email);
    if (usuarioExistente) {
        const error = new Error('Usuario ya registrado');
        error.status = 409;
        throw error;
    }

    const passwordHash = cifrarContrasena(password);
    const idNuevoUsuario = await repositorioUsuario.insertUser({ firstName, lastName, phone, email, passwordHash, birthDate });

    await repositorioUsuario.insertWallet(idNuevoUsuario, PUNTOS_INICIALES_MONEDERO);

    return { message: 'Usuario registrado correctamente' };
};

exports.obtenerInformacion = async (idUsuario) => {
    const info = await repositorioUsuario.getUserInfo(idUsuario);
    if (!info) {
        const error = new Error('Usuario no encontrado');
        error.status = 404;
        throw error;
    }
    return info;
};

exports.obtenerTransacciones = (idUsuario) => repositorioUsuario.getTransactions(idUsuario);

exports.obtenerNiveles = () => repositorioUsuario.getLevels();

exports.actualizarPerfil = async (idUsuario, first_name, last_name, phone) => {
    if (!first_name || !last_name) {
        const error = new Error('Nombre y apellidos son obligatorios');
        error.status = 400;
        throw error;
    }
    await repositorioUsuario.updatePerfil(idUsuario, first_name, last_name, phone || null);
    return { message: 'Perfil actualizado correctamente' };
};

exports.actualizarContrasena = async (idUsuario, password_actual, password_nueva) => {
    if (!password_actual || !password_nueva) {
        const error = new Error('Faltan campos obligatorios');
        error.status = 400;
        throw error;
    }
    if (password_nueva.length < 6) {
        const error = new Error('La nueva contraseña debe tener al menos 6 caracteres');
        error.status = 400;
        throw error;
    }

    const usuario = await repositorioUsuario.getUserById(idUsuario);
    if (!usuario) {
        const error = new Error('Usuario no encontrado');
        error.status = 404;
        throw error;
    }
    if (!compararContrasena(password_actual, usuario.hash_contrasena)) {
        const error = new Error('La contraseña actual no es correcta');
        error.status = 401;
        throw error;
    }

    await repositorioUsuario.updatePassword(idUsuario, cifrarContrasena(password_nueva));
    return { message: 'Contraseña actualizada correctamente' };
};

exports.obtenerUsuarioPorId = async (id) => {
    return await repositorioUsuario.obtenerUsuarioPorId(id);
};