const ESTADOS_VALIDOS = ['cancel'];  

class Reserva {
    constructor({ id = null, id_usuario, fecha_reserva, hora_reserva,
        comensales, atendido = false, estado = null,
        creado_en = null, id_mesa = null, nombre_mesa = null,
        nombre_usuario = null, email_usuario = null } = {}) {
        this.id = id;
        this.idUsuario = id_usuario;
        this.fechaReserva = fecha_reserva ? fecha_reserva.replace(/\//g, '-') : fecha_reserva;
        this.horaReserva = hora_reserva;
        this.comensales = Number(comensales);
        this.atendido = Boolean(atendido);
        this.estado = estado;
        this.creadoEn = creado_en;
        this.idMesa = id_mesa;
        this.nombreMesa = nombre_mesa;
        this.nombreUsuario = nombre_usuario;
        this.emailUsuario = email_usuario;
    }

    get activa() {
        return this.estado !== 'cancel';
    }

    get fechaHora() {
        return new Date(`${this.fechaReserva}T${this.horaReserva}`);
    }

    cancelar() {
        if (!this.activa) throw new Error('La reserva ya está cancelada');
        this.estado = 'cancel';
    }

    toJSON() {
        return {
            id: this.id,
            id_usuario: this.idUsuario,
            fecha_reserva: this.fechaReserva,
            hora_reserva: this.horaReserva,
            comensales: this.comensales,
            atendido: this.atendido,
            estado: this.estado,
            creado_en: this.creadoEn,
            id_mesa: this.idMesa,
            nombre_mesa: this.nombreMesa,
            nombre_usuario: this.nombreUsuario,
            email_usuario: this.emailUsuario,
        };
    }
}

Reserva.ESTADOS_VALIDOS = ESTADOS_VALIDOS;

module.exports = Reserva;
