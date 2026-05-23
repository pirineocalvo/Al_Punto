const repositorioMercado = require('../repositories/mercadoRepository');

exports.obtenerProductosDisponibles = async (idUsuario) => {
    const niveles = await repositorioMercado.getLevelByUserPoints(idUsuario);
    if (!niveles || niveles.length === 0) {
        const error = new Error('Nivel no encontrado para el usuario');
        error.status = 404;
        throw error;
    }
    return repositorioMercado.getItemsByLevel(niveles[0].id);
};

exports.obtenerCarteraUsuario = (idUsuario) => repositorioMercado.getPocketByUser(idUsuario);

exports.comprarProducto = async (idUsuario, idProducto) => {
    const producto = await repositorioMercado.getProductById(idProducto);
    if (!producto) {
        const error = new Error('Producto no encontrado');
        error.status = 404;
        throw error;
    }

    const monedero = await repositorioMercado.getWalletByUser(idUsuario);
    if (monedero.points < producto.points_price) {
        const error = new Error('No tienes suficientes puntos');
        error.status = 400;
        throw error;
    }

    const tokenUrl = `${idUsuario}-${idProducto}-${Date.now()}`;
    await repositorioMercado.deductPoints(idUsuario, producto.points_price);
    await repositorioMercado.insertPocketItem(idUsuario, idProducto, tokenUrl);
    await repositorioMercado.insertPointTransaction(idUsuario, monedero.id, producto.points_price, 'buy market');
};

exports.obtenerTokenCartera = async (idUsuario, tokenUrl) => {
    validarFormatoToken(idUsuario, tokenUrl);

    const cartera = await repositorioMercado.getPocketByToken(tokenUrl, idUsuario);
    if (!cartera) {
        const error = new Error('Token no encontrado');
        error.status = 404;
        throw error;
    }
    if (cartera.expires_at && new Date(cartera.expires_at) < new Date()) {
        const error = new Error('Token expirado');
        error.status = 410;
        error.extra = { expired: true, expires_at: cartera.expires_at };
        throw error;
    }

    return {
        valid: cartera.is_used === 0,
        already_used: cartera.is_used === 1,
        used_at: cartera.used_at,
        pocket_id: cartera.pocket_id,
        product: {
            id: cartera.product_id,
            name: cartera.product_name,
            description: cartera.product_description,
            img_src: cartera.img_src,
        },
        user: {
            id: cartera.user_id,
            first_name: cartera.first_name,
            last_name: cartera.last_name,
            email: cartera.email,
        },
    };
};

exports.usarTokenCartera = async (idUsuario, tokenUrl) => {
    validarFormatoToken(idUsuario, tokenUrl);

    const cartera = await repositorioMercado.getPocketStatusByToken(tokenUrl, idUsuario);
    if (!cartera) {
        const error = new Error('Token no encontrado');
        error.status = 404;
        throw error;
    }
    if (cartera.is_used) {
        const error = new Error('Este articulo ya fue canjeado');
        error.status = 409;
        throw error;
    }
    if (cartera.expires_at && new Date(cartera.expires_at) < new Date()) {
        const error = new Error('Token expirado');
        error.status = 410;
        throw error;
    }

    const usadoEn = new Date().toISOString();
    const cambios = await repositorioMercado.markPocketAsUsed(cartera.id, usadoEn);
    if (cambios === 0) {
        const error = new Error('Este articulo ya fue canjeado');
        error.status = 409;
        throw error;
    }
    return { message: 'Articulo canjeado con exito', used_at: usadoEn };
};

function validarFormatoToken(idUsuario, tokenUrl) {
    const partes = tokenUrl.split('-');
    if (partes.length !== 3) {
        const error = new Error('Formato de token invalido');
        error.status = 400;
        throw error;
    }
    if (partes[0] !== String(idUsuario)) {
        const error = new Error('El token no corresponde a este usuario');
        error.status = 400;
        throw error;
    }
}