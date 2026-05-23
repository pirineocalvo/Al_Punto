const repositorioComentario = require('../repositories/comentarioRepository');

const PUNTOS_RESENIA = 5;

exports.crearResenia = async (idUsuario, id_plato, descripcion, puntuacion) => {
    if (!id_plato || puntuacion == null || !descripcion) {
        const error = new Error('Datos de la resenia incompletos');
        error.status = 400;
        throw error;
    }

    await repositorioComentario.insertResenia(id_plato, descripcion, puntuacion, idUsuario);

    const monedero = await repositorioComentario.getWalletByUser(idUsuario);
    const idMonedero = monedero?.id ?? null;

    await repositorioComentario.insertPointTransaction(idUsuario, idMonedero, PUNTOS_RESENIA);
    await repositorioComentario.addPoints(idUsuario, PUNTOS_RESENIA);

    return {
        message: 'Resenia agregada correctamente',
        reward: `Gracias! Has ganado ${PUNTOS_RESENIA} puntos por tu resenia.`,
    };
};

exports.obtenerMisResenias = (idUsuario) => repositorioComentario.getReviewsByUser(idUsuario);

exports.obtenerPorPlato = (id_plato) => repositorioComentario.getReviewsByPlato(id_plato);