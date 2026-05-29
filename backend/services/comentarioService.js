const repositorioComentario = require('../repositories/comentarioRepository');
const Resenia = require('../classes/Resenia');
const PUNTOS_RESENIA = 5;

exports.crearResenia = async (idUsuario, id_plato, descripcion, puntuacion) => {
    if (!id_plato || puntuacion == null || !descripcion) {
        const error = new Error('Datos de la resenia incompletos');
        error.status = 400;
        throw error;
    }

    const resenia = new Resenia({ id_plato, id_usuario: idUsuario, descripcion, puntuacion });

    await repositorioComentario.insertResenia(
        resenia.idPlato, resenia.descripcion, resenia.puntuacion, resenia.idUsuario
    );

    const monedero = await repositorioComentario.getWalletByUser(idUsuario);
    if (!monedero) {
        const error = new Error('Monedero no encontrado');
        error.status = 404;
        throw error;
    }

    monedero.sumar(PUNTOS_RESENIA);

    await repositorioComentario.insertPointTransaction(idUsuario, monedero.id, PUNTOS_RESENIA);
    await repositorioComentario.addPoints(idUsuario, PUNTOS_RESENIA);

    return {
        message: 'Resenia agregada correctamente',
        reward: `Gracias! Has ganado ${PUNTOS_RESENIA} puntos por tu resenia.`,
    };
};


exports.obtenerMisResenias = (idUsuario) => repositorioComentario.getReviewsByUser(idUsuario);

exports.obtenerPorPlato = (id_plato) => repositorioComentario.getReviewsByPlato(id_plato);