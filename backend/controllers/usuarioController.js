const servicioUsuario = require('../services/usuarioService');

exports.iniciarSesion = async (req, res) => {
    const { email, password } = req.body;
    try {
        const resultado = await servicioUsuario.iniciarSesion(email, password, req.ip);
        res.json(resultado);
    } catch (error) {
        console.error('ERROR LOGIN:', error);
        res.status(error.status || 500).json({ error: error.message });
    }
};

exports.registrar = async (req, res) => {
    const { firstName, lastName, phone, email, password } = req.body;
    try {
        const resultado = await servicioUsuario.registrar({ firstName, lastName, phone, email, password });
        res.status(201).json(resultado);
    } catch (error) {
        res.status(error.status || 500).json({ error: error.message });
    }
};

exports.obtenerInformacion = async (req, res) => {
    try {
        const info = await servicioUsuario.obtenerInformacion(req.userId);
        res.json(info);
    } catch (error) {
        res.status(error.status || 500).json({ error: error.message });
    }
};

exports.obtenerTransacciones = async (req, res) => {
    try {
        const transacciones = await servicioUsuario.obtenerTransacciones(req.userId);
        res.json(transacciones);
    } catch (error) {
        res.status(error.status || 500).json({ error: error.message });
    }
};

exports.obtenerNiveles = async (req, res) => {
    try {
        const niveles = await servicioUsuario.obtenerNiveles();
        res.json(niveles);
    } catch (error) {
        res.status(error.status || 500).json({ error: error.message });
    }
};

exports.actualizarPerfil = async (req, res) => {
    const { first_name, last_name, phone } = req.body;
    try {
        const resultado = await servicioUsuario.actualizarPerfil(req.userId, first_name, last_name, phone);
        res.json(resultado);
    } catch (error) {
        res.status(error.status || 500).json({ error: error.message });
    }
};

exports.actualizarContrasena = async (req, res) => {
    const { password_actual, password_nueva } = req.body;
    try {
        const resultado = await servicioUsuario.actualizarContrasena(req.userId, password_actual, password_nueva);
        res.json(resultado);
    } catch (error) {
        res.status(error.status || 500).json({ error: error.message });
    }
};

exports.checkin = async (req, res) => {
    try {
        const usuario = await servicioUsuario.obtenerUsuarioPorId(req.params.id);
        if (!usuario) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }
        res.json({ nombre: `${usuario.nombre} ${usuario.apellido}` });
    } catch (error) {
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};