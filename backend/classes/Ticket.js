const ESTADOS_VALIDOS = ['ok', 'review', 'rejected'];

class Ticket {
    constructor({ id = null, id_usuario, image_url, ocr_content = null,
        points_granted = 0, status = 'ok', created_at = null } = {}) {
        this.id = id;
        this.idUsuario = id_usuario;
        this.imageUrl = image_url;
        this.ocrContent = ocr_content;
        this.pointsGranted = Number(points_granted);
        this.status = status;
        this.createdAt = created_at;
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
