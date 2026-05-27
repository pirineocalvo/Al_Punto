const repositorioTickets = require('../repositories/ticketsRepository');
const Tesseract = require('tesseract.js');

const RESTAURANTES_CONOCIDOS = ['Al Punto'];

async function analizarTicket(rutaImagen) {
    const { data: { text } } = await Tesseract.recognize(rutaImagen, 'spa');
    return text;
}

function calcularPuntos(texto) {
    const coincidencia = texto.match(/Total:\s*.*?(\d+(?:[.,]\d{1,2})?)\s*€/i);
    return coincidencia ? parseFloat(coincidencia[1]) * 100 : 0;
}

function extraerNombreRestaurante(texto) {
    const limpio = texto
        .toUpperCase()
        .replace(/[\[\](){}|<>*#@!¡?¿"'\\\/\-_=+~^]/g, ' ')
        .replace(/\s+/g, ' ');
    return RESTAURANTES_CONOCIDOS.find(n => limpio.includes(n.toUpperCase())) ?? null;
}

function detectarSubidaNivel(niveles, puntosAntes, puntosDespues) {
    const nivelAnterior = niveles.find(n => puntosAntes >= n.min_points && puntosAntes <= n.max_points);
    const nivelNuevo = niveles.find(n => puntosDespues >= n.min_points && puntosDespues <= n.max_points);
    if (nivelAnterior && nivelNuevo && nivelAnterior.name !== nivelNuevo.name) {
        return nivelNuevo.name;
    }
    return null;
}

exports.subirTicket = async (idUsuario, archivo, nombreArchivo) => {
    if (!archivo) {
        const error = new Error('No se ha subido ninguna imagen');
        error.status = 400;
        throw error;
    }

    const textoOcr = await analizarTicket(archivo.path);
    const restaurante = extraerNombreRestaurante(textoOcr);

    if (!restaurante) {
        const error = new Error('El ticket no pertenece a Al Punto');
        error.status = 400;
        throw error;
    }

    const puntos = calcularPuntos(textoOcr);
    const estado = puntos === 0 ? 'review' : 'ok';

    const idTicket = await repositorioTickets.insertTicket(idUsuario, nombreArchivo, textoOcr, puntos, estado);
    const monedero = await repositorioTickets.getWalletByUser(idUsuario);
    const puntosTras = monedero.points + puntos;

    await repositorioTickets.updateWalletPoints(puntosTras, idUsuario);
    await repositorioTickets.insertPointTransaction(idUsuario, monedero.id, puntos);

    const niveles = await repositorioTickets.getLevels();
    const nuevoNivel = detectarSubidaNivel(niveles, monedero.points, puntosTras);

    return {
        message: 'Ticket subido y procesado correctamente',
        nombreArchivo,
        texto: textoOcr,
        puntos,
        estado,
        idTicket,
        idMonedero: monedero.id,
        puntosTras,
        ...(nuevoNivel && { nuevoNivel }),
    };
};

exports.obtenerMisTickets = async (idUsuario) => {
    const tickets = await repositorioTickets.getTicketsByUser(idUsuario);
    return tickets.map(t => t.toJSON());
};