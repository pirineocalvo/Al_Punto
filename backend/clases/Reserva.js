class Reserva {
    /**
     * @param {object}  datos
     * @param {number}  datos.id
     * @param {number}  datos.id_usuario
     * @param {string}  datos.reserve_date
     * @param {string}  datos.reserve_hour
     * @param {number}  datos.guests
     * @param {boolean} [datos.attended=false]
     * @param {string}  [datos.status=null]
     * @param {string}  [datos.created_at]
     * @param {number}  [datos.table_id]
     * @param {string}  [datos.mesa_name]
     */
constructor({ id = null, id_usuario, reserve_date, reserve_hour,
    guests, attended = false, status = null,
    created_at = null, table_id = null, mesa_name = null,
    user_name = null, user_email = null } = {}) {
    this.id = id;
    this.idUsuario = id_usuario;
    this.reserveDate = reserve_date;
    this.reserveHour = reserve_hour;
    this.guests = Number(guests);
    this.attended = Boolean(attended);
    this.status = status;
    this.createdAt = created_at;
    this.tableId = table_id;
    this.mesaName = mesa_name;
    this.userName = user_name;
    this.userEmail = user_email; 
}

    get activa() {
        return this.status !== 'cancel';
    }

    get fechaHora() {
        return new Date(`${this.reserveDate}T${this.reserveHour}`);
    }

    cancelar() {
        if (!this.activa) throw new Error('La reserva ya está cancelada');
        this.status = 'cancel';
    }

    toJSON() {
        return {
            id: this.id,
            id_usuario: this.idUsuario,
            reserve_date: this.reserveDate,
            reserve_hour: this.reserveHour,
            guests: this.guests,
            attended: this.attended,
            status: this.status,
            created_at: this.createdAt,
            table_id: this.tableId,
            mesa_name: this.mesaName,
            user_name: this.userName,
            user_email: this.userEmail,
        };
    }
}

module.exports = Reserva;
