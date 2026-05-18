const mesasRepo = require('../repositories/mesasRepository');

const HORARIOS = [
    '13:30:00', '14:00:00', '14:30:00', '15:00:00', '15:30:00',
    '20:00:00', '20:30:00', '21:00:00', '21:30:00', '22:00:00', '22:30:00',
];

exports.getDisponibilidadMes = async (year, month) => {
    if (!year || !month) {
        const err = new Error('Faltan los parámetros year y month');
        err.status = 400;
        throw err;
    }

    const mesas = await mesasRepo.getMesasActivas();
    if (!mesas.length) return {};

    const reservas = await mesasRepo.getReservasPorMes(String(year), String(month).padStart(2, '0'));

    const ocupacion = {};
    for (const { reserve_date: fecha, id_mesa, reserve_hour: hora } of reservas) {
        if (!HORARIOS.includes(hora)) continue;
        if (!ocupacion[fecha])          ocupacion[fecha] = {};
        if (!ocupacion[fecha][id_mesa]) ocupacion[fecha][id_mesa] = [];
        if (!ocupacion[fecha][id_mesa].includes(hora))
            ocupacion[fecha][id_mesa].push(hora);
    }

    const mesaIds = mesas.map(m => m.id);
    const disponibilidad = {};
    for (const fecha of Object.keys(ocupacion)) {
        disponibilidad[fecha] = mesaIds.every(id => {
            const horasOcupadas = ocupacion[fecha][id] || [];
            return HORARIOS.every(hora => horasOcupadas.includes(hora));
        });
    }

    return disponibilidad;
};

exports.getDisponibilidadDia = async (fecha, ocupantes) => {
    if (!fecha) {
        const err = new Error('Falta el parámetro fecha');
        err.status = 400;
        throw err;
    }

    const mesas   = await mesasRepo.getMesasActivasPorOcupantes(ocupantes);
    const reservas = await mesasRepo.getReservasPorFecha(fecha);

    const horasOcupadas = {};
    for (const { id_mesa, reserve_hour: hora } of reservas) {
        if (!HORARIOS.includes(hora)) continue;
        if (!horasOcupadas[id_mesa]) horasOcupadas[id_mesa] = [];
        if (!horasOcupadas[id_mesa].includes(hora))
            horasOcupadas[id_mesa].push(hora);
    }

    return mesas
        .map(mesa => ({
            id:               mesa.id,
            name:             mesa.name,
            n_ocupantes:      mesa.n_ocupantes,
            horasDisponibles: HORARIOS.filter(hora => !(horasOcupadas[mesa.id] || []).includes(hora)),
        }))
        .filter(mesa => mesa.horasDisponibles.length > 0);
};

exports.reservarMesa = async (userId, idReserva, idMesa) => {
    if (!idReserva || !idMesa) {
        const err = new Error('Faltan idReserva o idMesa');
        err.status = 400;
        throw err;
    }

    const reserva = await mesasRepo.getReservaByIdAndUser(idReserva, userId);
    if (!reserva) {
        const err = new Error('Reserva no encontrada o no pertenece al usuario');
        err.status = 404;
        throw err;
    }

    const mesa = await mesasRepo.getMesaActivaById(idMesa);
    if (!mesa) {
        const err = new Error('Mesa no encontrada o inactiva');
        err.status = 404;
        throw err;
    }

    const conflicto = await mesasRepo.getConflictoMesa(idMesa, reserva.reserve_date, reserva.reserve_hour);
    if (conflicto) {
        const err = new Error('Esa mesa ya está reservada para esa fecha y hora. Por favor elige otra.');
        err.status = 409;
        throw err;
    }

    const id = await mesasRepo.insertMesaReservada(idReserva, idMesa);
    return { message: 'Mesa vinculada correctamente', id };
};

exports.getTodasMesas = () => mesasRepo.getTodasMesas();

exports.crearMesa = async (name, n_ocupantes) => {
    if (!name || !n_ocupantes) {
        const err = new Error('Faltan name o n_ocupantes');
        err.status = 400;
        throw err;
    }
    const id = await mesasRepo.insertMesa(name, Number(n_ocupantes));
    return { message: 'Mesa creada correctamente', id };
};

exports.actualizarMesa = async (id, name, n_ocupantes, activo) => {
    const changes = await mesasRepo.updateMesa(id, name, Number(n_ocupantes), activo ? 1 : 0);
    if (changes === 0) {
        const err = new Error('Mesa no encontrada');
        err.status = 404;
        throw err;
    }
    return { message: 'Mesa actualizada correctamente' };
};

exports.desactivarMesa = async (id) => {
    const changes = await mesasRepo.desactivarMesa(id);
    if (changes === 0) {
        const err = new Error('Mesa no encontrada');
        err.status = 404;
        throw err;
    }
    return { message: 'Mesa desactivada correctamente' };
};