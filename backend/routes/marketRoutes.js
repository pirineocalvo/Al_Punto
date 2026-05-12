const express = require('express');
const router  = express.Router();
const { decrypt } = require('../utils/crypto');
const db          = require('../utils/db');

//Middlewares
function getTokenUserId(req, res) {
    const authHeader = req.headers['authorization'];
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        res.status(401).json({ error: 'Token no proporcionado o formato inválido' });
        return null;
    }
    const token  = authHeader.split(' ')[1];
    const userId = decrypt(token);
    if (!userId) {
        res.status(401).json({ error: 'Token inválido' });
        return null;
    }
    return userId;
}

const waiterMiddleware = (req, res, next) => {
    const userId = getTokenUserId(req, res);
    if (!userId) return;

    req.userId = userId;

    db.get('SELECT access_level FROM Users WHERE id = ?', [userId], (err, user) => {
        if (err)
            return res.status(500).json({ error: 'Error de base de datos' });
        if (!user || user.access_level < 3)
            return res.status(403).json({ error: 'Acceso denegado: se requiere nivel Camarero o superior' });
        next();
    });
};

//GET /items

router.get('/items', (req, res) => {
    const userId = getTokenUserId(req, res);
    if (!userId) return;

    db.all(
        `SELECT id FROM Levels
         WHERE min_points <= (SELECT points FROM Wallet WHERE user_id = ?)
           AND max_points >= (SELECT points FROM Wallet WHERE user_id = ?)`,
        [userId, userId],
        (err, levels) => {
            if (err)
                return res.status(500).json({ error: 'Error al consultar la base de datos' });
            if (!levels || levels.length === 0)
                return res.status(404).json({ error: 'Nivel no encontrado para el usuario' });

            const levelId = levels[0].id;

            db.all(
                'SELECT * FROM Marketplace WHERE min_level_id <= ?',
                [levelId],
                (err, items) => {
                    if (err)
                        return res.status(500).json({ error: 'Error al consultar la base de datos' });
                    res.json(items);
                }
            );
        }
    );
});

//GET /mypocket
router.get('/mypocket', (req, res) => {
    const userId = getTokenUserId(req, res);
    if (!userId) return;

    const query = `
        SELECT p.id AS pocket_id, p.is_used, p.added_at, p.used_at, p.token_url,
               m.id AS product_id, m.name, m.description, m.img_src, m.points_price
        FROM Pocket p
        INNER JOIN Marketplace m ON p.product_id = m.id
        WHERE p.user_id = ?
        ORDER BY p.is_used ASC, p.added_at DESC
    `;

    db.all(query, [userId], (err, rows) => {
        if (err)
            return res.status(500).json({ error: 'Error al consultar la base de datos' });
        res.json(rows);
    });
});

//POST /comprar/:id
router.post('/comprar/:id', (req, res) => {
    const userId = getTokenUserId(req, res);
    if (!userId) return;

    const { id: productId } = req.params;

    db.all('SELECT points_price FROM Marketplace WHERE id = ?', [productId], (err, product) => {
        if (err)
            return res.status(500).json({ error: 'Error al consultar la base de datos' });

        const pointsPrice = product[0].points_price;

        db.all('SELECT id, points FROM Wallet WHERE user_id = ?', [userId], (err, walletRows) => {
            if (err)
                return res.status(500).json({ error: 'Error al consultar la base de datos' });

            const walletPoints = walletRows[0].points;
            const walletId     = walletRows[0].id;

            if (walletPoints < pointsPrice)
                return res.status(400).json({ error: 'No tienes suficientes puntos' });

            db.run(
                'UPDATE Wallet SET points = points - ? WHERE user_id = ?',
                [pointsPrice, userId],
                function (err) {
                    if (err)
                        return res.status(500).json({ error: 'Error al actualizar wallet' });

                    const tokenUrl = `${userId}-${productId}-${Date.now()}`;

                    db.run(
                        'INSERT INTO Pocket (user_id, product_id, token_url) VALUES (?, ?, ?)',
                        [userId, productId, tokenUrl],
                        function (err) {
                            if (err)
                                return res.status(500).json({ error: 'Error al insertar en pocket' });

                            db.run(
                                `INSERT INTO Point_transactions (user_id, wallet_id, amount_transaction, type)
                                 VALUES (?, ?, ?, ?)`,
                                [userId, walletId, pointsPrice, 'buy market'],
                                function (err) {
                                    if (err)
                                        return res.status(500).json({ error: 'Error al insertar en point_transactions' });
                                    res.status(200).json({ message: 'Item comprado con exito' });
                                }
                            );
                        }
                    );
                }
            );
        });
    });
});

//GET /pocket/:userId/use/:tokenUrl
router.get('/pocket/:userId/use/:tokenUrl', waiterMiddleware, (req, res) => {
    const { userId, tokenUrl } = req.params;
    const tokenParts = tokenUrl.split('-');

    if (tokenParts.length !== 3)
        return res.status(400).json({ error: 'Formato de token inválido' });
    if (tokenParts[0] !== String(userId))
        return res.status(400).json({ error: 'El token no corresponde a este usuario' });

    const query = `
        SELECT
            p.id AS pocket_id, p.is_used, p.used_at, p.expires_at, p.added_at,
            m.id AS product_id, m.name AS product_name, m.description AS product_description, m.img_src,
            u.id AS user_id, u.first_name, u.last_name, u.email
        FROM Pocket p
        INNER JOIN Marketplace m ON p.product_id = m.id
        INNER JOIN Users u ON p.user_id = u.id
        WHERE p.token_url = ? AND p.user_id = ?
    `;

    db.get(query, [tokenUrl, userId], (err, pocket) => {
        if (err)
            return res.status(500).json({ error: 'Error al consultar la base de datos' });
        if (!pocket)
            return res.status(404).json({ error: 'Token no encontrado' });
        if (pocket.expires_at && new Date(pocket.expires_at) < new Date())
            return res.status(410).json({
                error:      'Token expirado',
                expired:    true,
                expires_at: pocket.expires_at,
            });

        res.json({
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
        });
    });
});

//POST /pocket/:userId/use/:tokenUrl
router.post('/pocket/:userId/use/:tokenUrl', waiterMiddleware, (req, res) => {
    const { userId, tokenUrl } = req.params;
    const tokenParts = tokenUrl.split('-');

    if (tokenParts.length !== 3)
        return res.status(400).json({ error: 'Formato de token inválido' });
    if (tokenParts[0] !== String(userId))
        return res.status(400).json({ error: 'El token no corresponde a este usuario' });

    db.get(
        'SELECT id, is_used, expires_at FROM Pocket WHERE token_url = ? AND user_id = ?',
        [tokenUrl, userId],
        (err, pocket) => {
            if (err)
                return res.status(500).json({ error: 'Error al consultar la base de datos' });
            if (!pocket)
                return res.status(404).json({ error: 'Token no encontrado' });
            if (pocket.is_used)
                return res.status(409).json({ error: 'Este artículo ya fue canjeado' });
            if (pocket.expires_at && new Date(pocket.expires_at) < new Date())
                return res.status(410).json({ error: 'Token expirado' });

            const usedAt = new Date().toISOString();

            db.run(
                'UPDATE Pocket SET is_used = 1, used_at = ? WHERE id = ? AND is_used = 0',
                [usedAt, pocket.id],
                function (err) {
                    if (err)
                        return res.status(500).json({ error: 'Error al canjear artículo' });
                    if (this.changes === 0)
                        return res.status(409).json({ error: 'Este artículo ya fue canjeado' });
                    res.json({ message: 'Artículo canjeado con éxito', used_at: usedAt });
                }
            );
        }
    );
});

module.exports = router;
