const repositorioMercado = require('../repositories/mercadoRepository');

exports.obtenerProductosDisponibles = async (idUsuario) => {
    const nivel = await repositorioMercado.getLevelByUserPoints(idUsuario);
    if (!nivel) {
        const error = new Error('Nivel no encontrado para el usuario');
        error.status = 404;
        throw error;
    }
    return repositorioMercado.getItemsByLevel(nivel.id);
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
    if (!monedero) {
        const error = new Error('Monedero no encontrado');
        error.status = 404;
        throw error;
    }

    monedero.deducir(producto.pointsPrice);

    const tokenUrl = `${idUsuario}-${idProducto}-${Date.now()}`;
    await repositorioMercado.deductPoints(idUsuario, producto.pointsPrice);
    await repositorioMercado.insertPocketItem(idUsuario, idProducto, tokenUrl);
    await repositorioMercado.insertPointTransaction(
        idUsuario, monedero.id, -producto.pointsPrice, 'buy market'
    );
};

exports.obtenerTokenCartera = async (idUsuario, tokenUrl) => {
    validarFormatoToken(idUsuario, tokenUrl);

    const item = await repositorioMercado.getPocketByToken(tokenUrl, idUsuario);
    if (!item) {
        const error = new Error('Token no encontrado');
        error.status = 404;
        throw error;
    }
    if (item.expirado) {
        const error = new Error('Token expirado');
        error.status = 410;
        throw error;
    }

    return {
        valid:        item.canjeable,
        already_used: item.isUsed,
        used_at:      item.usedAt,
        pocket_id:    item.pocketId,
        product: {
            id:          item.productId,
            name:        item.name,
            description: item.description,
            img_src:     item.imgSrc,
        },
        user: {
            id:         item.idUsuario,
            first_name: item.firstName,
            last_name:  item.lastName,
            email:      item.email,
        },
    };
};

exports.usarTokenCartera = async (idUsuario, tokenUrl) => {
    validarFormatoToken(idUsuario, tokenUrl);

    const item = await repositorioMercado.getPocketStatusByToken(tokenUrl, idUsuario);
    if (!item) {
        const error = new Error('Token no encontrado');
        error.status = 404;
        throw error;
    }
    if (item.isUsed) {
        const error = new Error('Este articulo ya fue canjeado');
        error.status = 409;
        throw error;
    }
    if (item.expirado) {
        const error = new Error('Token expirado');
        error.status = 410;
        throw error;
    }

    item.marcarUsado();

    const cambios = await repositorioMercado.markPocketAsUsed(item.pocketId, item.usedAt);
    if (cambios === 0) {
        const error = new Error('Este articulo ya fue canjeado');
        error.status = 409;
        throw error;
    }
    return { message: 'Articulo canjeado con exito', used_at: item.usedAt };
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