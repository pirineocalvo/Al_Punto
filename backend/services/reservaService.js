const repositorioReserva = require('../repositories/reservaRepository');

exports.crearReserva = async (idUsuario, fecha, hora, comensales) => {
    if (!fecha || !hora || !comensales) {
        const error = new Error('Faltan campos obligatorios: fecha, hora, comensales');
        error.status = 400;
        throw error;
    }
    const idReserva = await repositorioReserva.insertReserva(idUsuario, fecha, hora, comensales);
    return { message: 'Reserva realizada con éxito', idReserva };
};

exports.obtenerMisReservas = async (idUsuario) => {
    const reservas = await repositorioReserva.getReservasByUser(idUsuario);
    return reservas.map(r => r.toJSON());
};

exports.cancelarReserva = async (idUsuario, idReserva) => {
    const cambios = await repositorioReserva.cancelarReserva(idReserva, idUsuario);
    if (cambios === 0) {
        const error = new Error('Reserva no encontrada');
        error.status = 404;
        throw error;
    }
    return { message: 'Reserva cancelada con éxito' };
};

exports.obtenerTodasAdmin = async () => {
    const reservas = await repositorioReserva.getAllPendingReservas();
    return reservas.map(r => r.toJSON());
};

exports.actualizarEstadoAdmin = async (idReserva, estado, atendido) => {
    if (!estado) {
        const error = new Error('El campo estado es obligatorio');
        error.status = 400;
        throw error;
    }
    const cambios = await repositorioReserva.updateReservaStatus(idReserva, estado, atendido ? 1 : 0);
    if (cambios === 0) {
        const error = new Error('Reserva no encontrada');
        error.status = 404;
        throw error;
    }
    return { message: `Reserva #${idReserva} actualizada correctamente` };
};