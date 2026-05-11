const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Tesseract = require('tesseract.js');
const { verifyToken } = require('../utils/crypto');
const { authenticateWithLocal } = require('../middleware/auth');
const db = require('../utils/db.js');
const { createNotification } = require('../utils/notifications');

// ── Multer: nombre de archivo incluye localUserId ────────────────────────────
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const dir = path.join(__dirname, '../uploads/tickets');
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
        cb(null, dir);
    },
    filename: (req, file, cb) => {
        try {
            const authHeader = req.headers.authorization;
            const decoded = verifyToken(authHeader?.split(' ')[1]);
            const authUserId = decoded ? decoded.id : 'unknown';
            const now = new Date();
            const ts = `${now.getFullYear()}${String(now.getMonth()+1).padStart(2,'0')}${String(now.getDate()).padStart(2,'0')}${String(now.getHours()).padStart(2,'0')}${String(now.getMinutes()).padStart(2,'0')}${String(now.getSeconds()).padStart(2,'0')}`;
            req.generatedFileName = `${ts}_${authUserId}.jpg`;
            cb(null, req.generatedFileName);
        } catch (error) {
            cb(error);
        }
    }
});

const upload = multer({ storage });

// ── OCR ──────────────────────────────────────────────────────────────────────
const analyzeTicket = async (imagePath) => {
    const { data: { text } } = await Tesseract.recognize(imagePath, 'spa', { logger: m => console.log(m) });
    return text;
};

const calcularPuntos = (texto) => {
    const match = texto.match(/Total:\s*.*?(\d+(?:[.,]\d{1,2})?)\s*€/i);
    return match ? parseFloat(match[1]) * 100 : 0;
};

// POST /upload
router.post('/upload', authenticateWithLocal, upload.single('imagen'), async (req, res) => {
    if (!req.file) return res.status(400).json({ error: 'No se ha subido ninguna imagen' });

    const userId = req.localUserId;
    const fileName = req.generatedFileName;

    try {
        const text = await analyzeTicket(req.file.path);
        const ticket_points = calcularPuntos(text);
        const statusticket = ticket_points === 0 ? 'review' : 'ok';

        db.run(
            `INSERT INTO Tickets (user_id, image_url, json_content, points_awarded, status) VALUES (?, ?, ?, ?, ?)`,
            [userId, fileName, text, ticket_points, statusticket],
            function (err) {
                if (err) return res.status(500).json({ error: 'Error al insertar ticket' });
                const ticketId = this.lastID;

                db.get('SELECT * FROM Wallet WHERE user_id = ?', [userId], (err, wallet) => {
                    if (err) return res.status(500).json({ error: 'Error al obtener wallet' });
                    const newPoints = wallet.points + ticket_points;

                    db.run('UPDATE Wallet SET points = ? WHERE user_id = ?', [newPoints, userId], function (err) {
                        if (err) return res.status(500).json({ error: 'Error al actualizar wallet' });

                        db.run(
                            `INSERT INTO Point_transactions (user_id, wallet_id, amount_transaction, type) VALUES (?, ?, ?, ?)`,
                            [userId, wallet.id, ticket_points, 'add ticket'],
                            function (err) {
                                if (err) return res.status(500).json({ error: 'Error al insertar ticket history' });

                                if (ticket_points > 0) {
                                    createNotification(userId, `🎫 Ticket procesado: has ganado ${ticket_points} puntos`, 'info');
                                }

                                db.all('SELECT name, min_points, max_points FROM Levels ORDER BY min_points ASC', [], (err, levels) => {
                                    if (!err && levels.length) {
                                        const oldLevel = levels.find(l => wallet.points >= l.min_points && wallet.points <= l.max_points);
                                        const newLevel = levels.find(l => newPoints >= l.min_points && newPoints <= l.max_points);
                                        if (oldLevel && newLevel && oldLevel.name !== newLevel.name) {
                                            createNotification(userId, `🏆 ¡Has subido al nivel ${newLevel.name}! Sigue así.`, 'level');
                                        }
                                    }
                                });

                                res.json({ message: 'Ticket subido y procesado correctamente', fileName, text, points: ticket_points, status: statusticket, ticketId, walletId: wallet.id, newPoints });
                            }
                        );
                    });
                });
            }
        );
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// GET /mytickets
router.get('/mytickets', authenticateWithLocal, (req, res) => {
    db.all('SELECT * FROM Tickets WHERE user_id = ?', [req.localUserId], (err, tickets) => {
        if (err) return res.status(500).json({ error: 'Error al obtener tickets' });
        res.json(tickets);
    });
});

module.exports = router;
