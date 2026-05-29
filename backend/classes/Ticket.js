const ESTADOS_VALIDOS = ['ok', 'review', 'rejected'];

class Ticket {
    constructor({ id = null, id_usuario, url_imagen, image_url,
        contenido_json, ocr_content, puntos_otorgados, points_granted = 0,
        estado, status = 'review', creado_en = null, created_at = null } = {}) {
        
        const estadoFinal = estado ?? status;
        if (!ESTADOS_VALIDOS.includes(estadoFinal)) {
            throw new Error(`Estado no válido: ${estadoFinal}. Valores permitidos: ${ESTADOS_VALIDOS.join(', ')}`);
        }
        this.id = id;
        this.idUsuario = id_usuario;
        this.imageUrl = url_imagen ?? image_url;
        this.ocrContent = contenido_json ?? ocr_content;
        this.pointsGranted = Number(puntos_otorgados ?? points_granted);
        this.status = estadoFinal;
        this.createdAt = creado_en ?? created_at;
    }

    get procesado() {
        return this.status === 'ok';
    }

    get necesitaRevision() {
        return this.status === 'review';
    }

    toJSON() {
        return {
            id: this.id,
            id_usuario: this.idUsuario,
            image_url: this.imageUrl,
            ocr_content: this.ocrContent,
            points_granted: this.pointsGranted,
            status: this.status,
            created_at: this.createdAt,
        };
    }
}

Ticket.ESTADOS_VALIDOS = ESTADOS_VALIDOS;

module.exports = Ticket;