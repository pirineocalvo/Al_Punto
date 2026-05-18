const marketRepo = require('../repositories/marketRepository');

exports.getAvailableItems = async (userId) => {
    const levels = await marketRepo.getLevelByUserPoints(userId);
    if (!levels || levels.length === 0) {
        const err = new Error('Nivel no encontrado para el usuario');
        err.status = 404;
        throw err;
    }
    return marketRepo.getItemsByLevel(levels[0].id);
};

exports.getUserPocket = async (userId) => {
    return marketRepo.getPocketByUser(userId);
};

exports.buyItem = async (userId, productId) => {
    const product = await marketRepo.getProductById(productId);
    if (!product) {
        const err = new Error('Producto no encontrado');
        err.status = 404;
        throw err;
    }

    const wallet = await marketRepo.getWalletByUser(userId);
    if (wallet.points < product.points_price) {
        const err = new Error('No tienes suficientes puntos');
        err.status = 400;
        throw err;
    }

    const tokenUrl = `${userId}-${productId}-${Date.now()}`;
    await marketRepo.deductPoints(userId, product.points_price);
    await marketRepo.insertPocketItem(userId, productId, tokenUrl);
    await marketRepo.insertPointTransaction(userId, wallet.id, product.points_price, 'buy market');
};

exports.getPocketToken = async (userId, tokenUrl) => {
    validateTokenFormat(userId, tokenUrl);

    const pocket = await marketRepo.getPocketByToken(tokenUrl, userId);
    if (!pocket) {
        const err = new Error('Token no encontrado');
        err.status = 404;
        throw err;
    }
    if (pocket.expires_at && new Date(pocket.expires_at) < new Date()) {
        const err = new Error('Token expirado');
        err.status = 410;
        err.extra = { expired: true, expires_at: pocket.expires_at };
        throw err;
    }

    return {
        valid:        pocket.is_used === 0,
        already_used: pocket.is_used === 1,
        used_at:      pocket.used_at,
        pocket_id:    pocket.pocket_id,
        product: {
            id:          pocket.product_id,
            name:        pocket.product_name,
            description: pocket.product_description,
            img_src:     pocket.img_src,
        },
        user: {
            id:         pocket.user_id,
            first_name: pocket.first_name,
            last_name:  pocket.last_name,
            email:      pocket.email,
        },
    };
};

exports.usePocketToken = async (userId, tokenUrl) => {
    validateTokenFormat(userId, tokenUrl);

    const pocket = await marketRepo.getPocketStatusByToken(tokenUrl, userId);
    if (!pocket) {
        const err = new Error('Token no encontrado');
        err.status = 404;
        throw err;
    }
    if (pocket.is_used) {
        const err = new Error('Este artículo ya fue canjeado');
        err.status = 409;
        throw err;
    }
    if (pocket.expires_at && new Date(pocket.expires_at) < new Date()) {
        const err = new Error('Token expirado');
        err.status = 410;
        throw err;
    }

    const usedAt = new Date().toISOString();
    const changes = await marketRepo.markPocketAsUsed(pocket.id, usedAt);
    if (changes === 0) {
        const err = new Error('Este artículo ya fue canjeado');
        err.status = 409;
        throw err;
    }
    return { message: 'Artículo canjeado con éxito', used_at: usedAt };
};

function validateTokenFormat(userId, tokenUrl) {
    const parts = tokenUrl.split('-');
    if (parts.length !== 3) {
        const err = new Error('Formato de token inválido');
        err.status = 400;
        throw err;
    }
    if (parts[0] !== String(userId)) {
        const err = new Error('El token no corresponde a este usuario');
        err.status = 400;
        throw err;
    }
}