const reserveRepo = require('../repositories/reserveRepository');

exports.addReserve = async (userId, fecha, hora, comensales) => {
    if (!fecha || !hora || !comensales) {
        const err = new Error('Faltan campos obligatorios: fecha, hora, comensales');
        err.status = 400;
        throw err;
    }

    const reservationId = await reserveRepo.insertReserva(userId, fecha, hora, comensales);
    return { message: 'Reserva realizada con éxito', reservationId };
};

exports.getUserReserves = (userId) => reserveRepo.getReservasByUser(userId);

exports.cancelarReserva = async (userId, reservaId) => {
    const changes = await reserveRepo.cancelarReserva(reservaId, userId);
    if (changes === 0) {
        const err = new Error('Reserva no encontrada');
        err.status = 404;
        throw err;
    }
    return { message: 'Reserva cancelada con éxito' };
};

exports.getAllReservesAdmin = () => reserveRepo.getAllPendingReservas();

exports.updateStatusAdmin = async (reservaId, status) => {
    if (!status) {
        const err = new Error('El campo status es obligatorio');
        err.status = 400;
        throw err;
    }

    const attended = status === 'confirmed' ? 1 : 0;
    const changes  = await reserveRepo.updateReservaStatus(reservaId, status, attended);

    if (changes === 0) {
        const err = new Error('Reserva no encontrada');
        err.status = 404;
        throw err;
    }
    return { message: `Reserva #${reservaId} actualizada correctamente` };
};