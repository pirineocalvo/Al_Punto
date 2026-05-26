const ESTADOS_VALIDOS = ['ok', 'review', 'rejected'];

class Ticket {
    constructor({ id = null, id_usuario, url_imagen, contenido_json = null,
        puntos_otorgados = 0, estado = 'review', creado_en = null } = {}) {
        if (!ESTADOS_VALIDOS.includes(estado)) {
            throw new Error(`Estado no válido: ${estado}. Valores permitidos: ${ESTADOS_VALIDOS.join(', ')}`);
        }
        this.id = id;
        this.idUsuario = id_usuario;
        this.urlImagen = url_imagen;
        this.contenidoJson = contenido_json;
        this.puntosOtorgados = Number(puntos_otorgados);
        this.estado = estado;
        this.creadoEn = creado_en;
    }

    get procesado() {
        return this.estado === 'ok';
    }

    get necesitaRevision() {
        return this.estado === 'review';
    }

    toJSON() {
        return {
            id: this.id,
            id_usuario: this.idUsuario,
            url_imagen: this.urlImagen,
            contenido_json: this.contenidoJson,
            puntos_otorgados: this.puntosOtorgados,
            estado: this.estado,
            creado_en: this.creadoEn,
        };
    }
}

Ticket.ESTADOS_VALIDOS = ESTADOS_VALIDOS;

module.exports = Ticket;
