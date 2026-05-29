const ESTADOS_VALIDOS = ['cancel'];

class Reserva {
    constructor({ id = null, id_usuario,
        fecha_reserva, reserve_date,
        hora_reserva, reserve_hour,
        comensales, guests,
        atendido = false, attended = false,
        estado = null, status = null,
        creado_en = null, created_at = null,
        id_mesa = null, table_id = null,
        nombre_mesa = null, mesa_name = null,
        nombre_usuario = null, user_name = null,
        email_usuario = null, user_email = null } = {}) {

        const fechaRaw = fecha_reserva ?? reserve_date;

        this.id = id;
        this.idUsuario = id_usuario;
        this.reserve_date = fechaRaw ? fechaRaw.replace(/\//g, '-') : fechaRaw;
        this.reserve_hour = hora_reserva ?? reserve_hour;
        this.guests = Number(comensales ?? guests);
        this.attended = Boolean(atendido ?? attended);
        this.status = estado ?? status;
        this.created_at = creado_en ?? created_at;
        this.id_mesa = id_mesa ?? table_id;
        this.mesa_name = nombre_mesa ?? mesa_name;
        this.user_name = nombre_usuario ?? user_name;
        this.user_email = email_usuario ?? user_email;
    }

    get activa() {
        return this.status !== 'cancel';
    }

    get fechaHora() {
        return new Date(`${this.reserve_date}T${this.reserve_hour}`);
    }

    cancelar() {
        if (!this.activa) throw new Error('La reserva ya está cancelada');
        this.status = 'cancel';
    }

    toJSON() {
        return {
            id: this.id,
            id_usuario: this.idUsuario,
            reserve_date: this.reserve_date,
            reserve_hour: this.reserve_hour,
            guests: this.guests,
            attended: this.attended,
            status: this.status,
            created_at: this.created_at,
            id_mesa: this.id_mesa,
            mesa_name: this.mesa_name,
            user_name: this.user_name,
            user_email: this.user_email,
        };
    }
}

Reserva.ESTADOS_VALIDOS = ESTADOS_VALIDOS;

module.exports = Reserva;