const express = require('express');
const router = express.Router();
const { verifyToken } = require('../utils/crypto');
const db = require('../utils/db');

// ── Middleware de autenticación ──────────────────────────────────────────────
const authMiddleware = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer '))
        return res.status(401).json({ error: 'Token no proporcionado o formato inválido' });
    const decoded = verifyToken(authHeader.split(' ')[1]);
    if (!decoded) return res.status(401).json({ error: 'Token inválido' });
    req.user = decoded;
    next();
};

// Middleware: camarero o superior (access_level >= 3)
const waiterMiddleware = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer '))
        return res.status(401).json({ error: 'Token no proporcionado o formato inválido' });
    const decoded = verifyToken(authHeader.split(' ')[1]);
    if (!decoded) return res.status(401).json({ error: 'Token inválido' });
    req.user = decoded;
    db.get('SELECT id, access_level FROM Users WHERE auth_user_id = ?', [decoded.id], (err, user) => {
        if (err) return res.status(500).json({ error: 'Error de base de datos' });
        if (!user || user.access_level < 3)
            return res.status(403).json({ error: 'Acceso denegado: se requiere nivel Camarero o superior' });
        req.localUserId = user.id;
        next();
    });
};

// ── Helper: obtiene el ID local del usuario por auth_user_id ─────────────────
const getLocalUserId = (authUserId) => new Promise((resolve, reject) => {
    db.get('SELECT id FROM Users WHERE auth_user_id = ?', [authUserId], (err, row) => {
        if (err) return reject(err);
        if (!row) return reject(new Error('Usuario local no encontrado'));
        resolve(row.id);
    });
});

// OBTENER ITEMS DEL MARKETPLACE
router.get('/items', authMiddleware, async (req, res) => {
    try {
        const userId = await getLocalUserId(req.user.id);
        db.all(
            'SELECT id FROM Levels WHERE min_points <= (SELECT points FROM Wallet WHERE user_id = ?) AND max_points >= (SELECT points FROM Wallet WHERE user_id = ?)',
            [userId, userId],
            (err, rows) => {
                if (err) return res.status(500).json({ error: 'Error al consultar la base de datos' });
                if (!rows || rows.length === 0) return res.status(404).json({ error: 'Nivel no encontrado para el usuario' });
                const levelId = rows[0].id;
                db.all('SELECT * FROM Marketplace WHERE min_level_id <= ?', [levelId], (err, marketRows) => {
                    if (err) return res.status(500).json({ error: 'Error al consultar la base de datos' });
                    res.json(marketRows);
                });
            }
        );
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ARTÍCULOS DEL USUARIO (pocket)
router.get('/mypocket', authMiddleware, async (req, res) => {
    try {
        const userId = await getLocalUserId(req.user.id);
        db.all(`
            SELECT p.id as pocket_id, p.is_used, p.added_at, p.used_at, p.token_url,
                   m.id as product_id, m.name, m.description, m.img_src, m.points_price
            FROM Pocket p
            INNER JOIN Marketplace m ON p.product_id = m.id
            WHERE p.user_id = ?
            ORDER BY p.is_used ASC, p.added_at DESC
        `, [userId], (err, rows) => {
            if (err) return res.status(500).json({ error: 'Error al consultar la base de datos' });
            res.json(rows);
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// COMPRAR ITEM
router.post('/comprar/:id', authMiddleware, async (req, res) => {
    try {
        const userId = await getLocalUserId(req.user.id);
        const { id } = req.params;
        db.all('SELECT points_price FROM Marketplace WHERE id = ?', [id], (err, rows) => {
            if (err) return res.status(500).json({ error: 'Error al consultar la base de datos' });
            const price = rows[0].points_price;
            db.all('SELECT id, points FROM Wallet WHERE user_id = ?', [userId], (err, rows) => {
                if (err) return res.status(500).json({ error: 'Error al consultar la base de datos' });
                const points = rows[0].points;
                const walletId = rows[0].id;
                if (points < price) {
                    return res.status(400).json({ error: 'No tienes suficientes puntos' });
                }
                db.run('UPDATE Wallet SET points = points - ? WHERE user_id = ?', [price, userId], function (err) {
                    if (err) return res.status(500).json({ error: 'Error al actualizar wallet' });
                    const tokenUrl = userId + '-' + id + '-' + Date.now();
                    db.run('INSERT INTO Pocket (user_id, product_id, token_url) VALUES (?,?, ?)', [userId, id, tokenUrl], function (err) {
                        if (err) return res.status(500).json({ error: 'Error al insertar en pocket' });
                        db.run('INSERT INTO Point_transactions (user_id, wallet_id, amount_transaction, type) VALUES (?,?, ?, ?)', [userId, walletId, price, 'buy market'], function (err) {
                            if (err) return res.status(500).json({ error: 'Error al insertar en point_transactions' });
                            res.status(200).json({ message: 'Item comprado con exito' });
                        });
                    });
                });
            });
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// VALIDAR TOKEN DE POCKET (requiere camarero)
router.get('/pocket/:userId/use/:tokenUrl', waiterMiddleware, (req, res) => {
    const { userId, tokenUrl } = req.params;

    const parts = tokenUrl.split('-');
    if (parts.length !== 3) return res.status(400).json({ error: 'Formato de token inválido' });
    if (parts[0] !== String(userId)) return res.status(400).json({ error: 'El token no corresponde a este usuario' });

    const sql = `
        SELECT
            p.id as pocket_id, p.is_used, p.used_at, p.expires_at, p.added_at,
            m.id as product_id, m.name as product_name, m.description as product_description, m.img_src,
            u.id as user_id, u.first_name, u.last_name, u.email
        FROM Pocket p
        INNER JOIN Marketplace m ON p.product_id = m.id
        INNER JOIN Users u ON p.user_id = u.id
        WHERE p.token_url = ? AND p.user_id = ?
    `;

    db.get(sql, [tokenUrl, userId], (err, row) => {
        if (err) return res.status(500).json({ error: 'Error al consultar la base de datos' });
        if (!row) return res.status(404).json({ error: 'Token no encontrado' });
        if (row.expires_at && new Date(row.expires_at) < new Date()) {
            return res.status(410).json({ error: 'Token expirado', expired: true });
        }
        res.json({
            valid: row.is_used === 0,
            already_used: row.is_used === 1,
            used_at: row.used_at,
            pocket_id: row.pocket_id,
            product: { id: row.product_id, name: row.product_name, description: row.product_description, img_src: row.img_src },
            user: { id: row.user_id, first_name: row.first_name, last_name: row.last_name, email: row.email }
        });
    });
});

// CANJEAR TOKEN DE POCKET (requiere camarero)
router.post('/pocket/:userId/use/:tokenUrl', waiterMiddleware, (req, res) => {
    const { userId, tokenUrl } = req.params;

    const parts = tokenUrl.split('-');
    if (parts.length !== 3) return res.status(400).json({ error: 'Formato de token inválido' });
    if (parts[0] !== String(userId)) return res.status(400).json({ error: 'El token no corresponde a este usuario' });

    db.get('SELECT id, is_used, expires_at FROM Pocket WHERE token_url = ? AND user_id = ?', [tokenUrl, userId], (err, pocket) => {
        if (err) return res.status(500).json({ error: 'Error al consultar la base de datos' });
        if (!pocket) return res.status(404).json({ error: 'Token no encontrado' });
        if (pocket.is_used) return res.status(409).json({ error: 'Este artículo ya fue canjeado' });
        if (pocket.expires_at && new Date(pocket.expires_at) < new Date()) {
            return res.status(410).json({ error: 'Token expirado' });
        }
        const now = new Date().toISOString();
        db.run('UPDATE Pocket SET is_used = 1, used_at = ? WHERE id = ? AND is_used = 0', [now, pocket.id], function (err) {
            if (err) return res.status(500).json({ error: 'Error al canjear artículo' });
            if (this.changes === 0) return res.status(409).json({ error: 'Este artículo ya fue canjeado' });
            res.json({ message: 'Artículo canjeado con éxito', used_at: now });
        });
    });
});

module.exports = router;
