const repositorioMesa = require('../repositories/mesaRepository');

const HORARIOS = [
    '13:30:00', '14:00:00', '14:30:00', '15:00:00', '15:30:00',
    '20:00:00', '20:30:00', '21:00:00', '21:30:00', '22:00:00', '22:30:00',
];

exports.obtenerDisponibilidadMes = async (anio, mes) => {
    if (!anio || !mes) {
        const error = new Error('Faltan los parametros anio y mes');
        error.status = 400;
        throw error;
    }

    const mesas = await repositorioMesa.getMesasActivas();
    if (!mesas.length) return {};

    const reservas = await repositorioMesa.getReservasPorMes(String(anio), String(mes).padStart(2, '0'));

    const ocupacion = {};
    for (const { reserve_date: fecha, id_mesa, reserve_hour: hora } of reservas) {
        if (!HORARIOS.includes(hora)) continue;
        if (!ocupacion[fecha]) ocupacion[fecha] = {};
        if (!ocupacion[fecha][id_mesa]) ocupacion[fecha][id_mesa] = [];
        if (!ocupacion[fecha][id_mesa].includes(hora)) {
            ocupacion[fecha][id_mesa].push(hora);
        }
    }

    const idsMesas = mesas.map(m => m.id);
    const disponibilidad = {};
    for (const fecha of Object.keys(ocupacion)) {
        disponibilidad[fecha] = idsMesas.every(id => {
            const horasOcupadas = ocupacion[fecha][id] || [];
            return HORARIOS.every(hora => horasOcupadas.includes(hora));
        });
    }

    return disponibilidad;
};

exports.obtenerDisponibilidadDia = async (fecha, ocupantes) => {
    if (!fecha) {
        const error = new Error('Falta el parametro fecha');
        error.status = 400;
        throw error;
    }

    const mesas = await repositorioMesa.getMesasActivasPorOcupantes(ocupantes);
    const reservas = await repositorioMesa.getReservasPorFecha(fecha);

    const horasOcupadas = {};
    for (const { id_mesa, reserve_hour: hora } of reservas) {
        if (!HORARIOS.includes(hora)) continue;
        if (!horasOcupadas[id_mesa]) horasOcupadas[id_mesa] = [];
        if (!horasOcupadas[id_mesa].includes(hora)) {
            horasOcupadas[id_mesa].push(hora);
        }
    }

    return mesas
        .map(mesa => ({
            id: mesa.id,
            name: mesa.name,
            n_ocupantes: mesa.n_ocupantes,
            horasDisponibles: HORARIOS.filter(hora => !(horasOcupadas[mesa.id] || []).includes(hora)),
        }))
        .filter(mesa => mesa.horasDisponibles.length > 0);
};

exports.reservarMesa = async (idUsuario, idReserva, idMesa) => {
    if (!idReserva || !idMesa) {
        const error = new Error('Faltan idReserva o idMesa');
        error.status = 400;
        throw error;
    }

    const reserva = await repositorioMesa.getReservaByIdAndUser(idReserva, idUsuario);
    if (!reserva) {
        const error = new Error('Reserva no encontrada o no pertenece al usuario');
        error.status = 404;
        throw error;
    }

    const mesa = await repositorioMesa.getMesaActivaById(idMesa);
    if (!mesa) {
        const error = new Error('Mesa no encontrada o inactiva');
        error.status = 404;
        throw error;
    }

    const conflicto = await repositorioMesa.getConflictoMesa(idMesa, reserva.reserve_date, reserva.reserve_hour);
    if (conflicto) {
        const error = new Error('Esa mesa ya esta reservada para esa fecha y hora. Por favor elige otra.');
        error.status = 409;
        throw error;
    }

    const id = await repositorioMesa.insertMesaReservada(idReserva, idMesa);
    return { message: 'Mesa vinculada correctamente', id };
};

exports.obtenerTodasMesas = () => repositorioMesa.getTodasMesas();

exports.crearMesa = async (name, nOcupantes) => {
    if (!name || !nOcupantes) {
        const error = new Error('Faltan name o n_ocupantes');
        error.status = 400;
        throw error;
    }
    const id = await repositorioMesa.insertMesa(name, Number(nOcupantes));
    return { message: 'Mesa creada correctamente', id };
};

exports.actualizarMesa = async (id, name, nOcupantes, activo) => {
    const cambios = await repositorioMesa.updateMesa(id, name, Number(nOcupantes), activo ? 1 : 0);
    if (cambios === 0) {
        const error = new Error('Mesa no encontrada');
        error.status = 404;
        throw error;
    }
    return { message: 'Mesa actualizada correctamente' };
};

exports.desactivarMesa = async (id) => {
    const cambios = await repositorioMesa.desactivarMesa(id);
    if (cambios === 0) {
        const error = new Error('Mesa no encontrada');
        error.status = 404;
        throw error;
    }
    return { message: 'Mesa desactivada correctamente' };
};