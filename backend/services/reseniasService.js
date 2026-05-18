const reseniasRepo = require('../repositories/reseniasRepository');

const REVIEW_POINTS = 5;

exports.createResenia = async (userId, id_plato, descripcion, puntuacion) => {
    if (!id_plato || puntuacion == null || !descripcion) {
        const err = new Error('Datos de la reseña incompletos');
        err.status = 400;
        throw err;
    }

    await reseniasRepo.insertResenia(id_plato, descripcion, puntuacion, userId);

    const wallet = await reseniasRepo.getWalletByUser(userId);
    const walletId = wallet?.id ?? null;

    await reseniasRepo.insertPointTransaction(userId, walletId, REVIEW_POINTS);
    await reseniasRepo.addPoints(userId, REVIEW_POINTS);

    return {
        message: 'Reseña añadida correctamente',
        reward:  `¡Gracias! Has ganado ${REVIEW_POINTS} puntos por tu reseña.`,
    };
};

exports.getMyReviews = (userId) => reseniasRepo.getReviewsByUser(userId);

exports.getByPlato = (id_plato) => reseniasRepo.getReviewsByPlato(id_plato);