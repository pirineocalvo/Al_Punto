const ticketsRepo            = require('../repositories/ticketsRepository');
const { createNotification } = require('../utils/notifications');
const Tesseract              = require('tesseract.js');

const RESTAURANTES_CONOCIDOS = ['Al Punto'];

// — Helpers privados —

async function analyzeTicket(imagePath) {
    const { data: { text } } = await Tesseract.recognize(imagePath, 'spa');
    return text;
}

function calcularPuntos(text) {
    const match = text.match(/Total:\s*.*?(\d+(?:[.,]\d{1,2})?)\s*€/i);
    return match ? parseFloat(match[1]) * 100 : 0;
}

function extraerNombreRestaurante(text) {
    const limpio = text
        .toUpperCase()
        .replace(/[\[\](){}|<>*#@!¡?¿"'\\\/\-_=+~^]/g, ' ')
        .replace(/\s+/g, ' ');
    return RESTAURANTES_CONOCIDOS.find(n => limpio.includes(n.toUpperCase())) ?? null;
}

function detectarSubidaNivel(levels, puntosAntes, puntosDespues) {
    const prevLevel = levels.find(l => puntosAntes  >= l.min_points && puntosAntes  <= l.max_points);
    const newLevel  = levels.find(l => puntosDespues >= l.min_points && puntosDespues <= l.max_points);
    if (prevLevel && newLevel && prevLevel.name !== newLevel.name)
        return newLevel.name;
    return null;
}

// — Casos de uso —

exports.uploadTicket = async (userId, file, fileName) => {
    if (!file) {
        const err = new Error('No se ha subido ninguna imagen');
        err.status = 400;
        throw err;
    }

    const ocrText     = await analyzeTicket(file.path);
    const restaurante = extraerNombreRestaurante(ocrText);

    if (!restaurante) {
        const err = new Error('El ticket no pertenece a Al Punto');
        err.status = 400;
        throw err;
    }

    const points  = calcularPuntos(ocrText);
    const status  = points === 0 ? 'review' : 'ok';

    const ticketId = await ticketsRepo.insertTicket(userId, fileName, ocrText, points, status);

    const wallet    = await ticketsRepo.getWalletByUser(userId);
    const newPoints = wallet.points + points;

    await ticketsRepo.updateWalletPoints(newPoints, userId);
    await ticketsRepo.insertPointTransaction(userId, wallet.id, points);

    if (points > 0)
        createNotification(userId, `🎫 Ticket procesado: has ganado ${points} puntos`, 'info');

    const levels    = await ticketsRepo.getLevels();
    const nuevoNivel = detectarSubidaNivel(levels, wallet.points, newPoints);
    if (nuevoNivel)
        createNotification(userId, `🏆 ¡Has subido al nivel ${nuevoNivel}! Sigue así.`, 'level');

    return {
        message:  'Ticket subido y procesado correctamente',
        fileName,
        text:     ocrText,
        points,
        status,
        ticketId,
        walletId: wallet.id,
        newPoints,
    };
};

exports.getMyTickets = (userId) => ticketsRepo.getTicketsByUser(userId);