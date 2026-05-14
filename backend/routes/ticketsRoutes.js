const express  = require('express');
const router   = express.Router();
const multer   = require('multer');
const path     = require('path');
const fs       = require('fs');
const Tesseract = require('tesseract.js');
const { verifyToken, getUserIdFromToken } = require('../utils/crypto');
const db                      = require('../utils/db.js');
const { createNotification }  = require('../utils/notifications');

//Almacenamiento
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = path.join(__dirname, '../uploads/tickets');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        try {
            const token   = req.headers['authorization'];
            const payload = verifyToken(token?.split(' ')[1]);
            const userId  = payload?.id ?? payload?.userId ?? payload?.sub;
            const now     = new Date();

            const yyyy = now.getFullYear();
            const MM   = String(now.getMonth() + 1).padStart(2, '0');
            const dd   = String(now.getDate()).padStart(2, '0');
            const HH   = String(now.getHours()).padStart(2, '0');
            const mm   = String(now.getMinutes()).padStart(2, '0');
            const ss   = String(now.getSeconds()).padStart(2, '0');

            const timestamp = `${yyyy}${MM}${dd}${HH}${mm}${ss}`;
            const fileName  = `${timestamp}_${userId}.jpg`;

            req.generatedFileName = fileName;
            cb(null, fileName);
        } catch (err) {
            console.error('Error generando nombre de archivo:', err);
            cb(err);
        }
    },
});

const upload = multer({ storage });

//Funciones específicas de ayuda
async function analyzeTicket(imagePath) {
    try {
        const { data: { text } } = await Tesseract.recognize(imagePath, 'spa', {
            logger: msg => console.log(msg),
        });
        return text;
    } catch (err) {
        console.error('Error en OCR:', err);
        throw new Error('Error al procesar la imagen con OCR');
    }
}

function calcularPuntos(text) {
    const totalRegex = /Total:\s*.*?(\d+(?:[.,]\d{1,2})?)\s*€/i;
    const match = text.match(totalRegex);
    return match ? parseFloat(match[1]) * 100 : 0;
}

function extraerNombreRestaurante(text) {
    const conocidos = ['Al Punto'];
    const limpio = text
        .toUpperCase()
        .replace(/[\[\](){}|<>*#@!¡?¿"'\\\/\-_=+~^]/g, ' ')
        .replace(/\s+/g, ' ');
    
    return conocidos.find(n => limpio.includes(n.toUpperCase())) ?? null;
}
//Post Upload
router.post('/upload', upload.single('imagen'), async (req, res) => {
    const userId = getUserIdFromToken(req, res);
    if (!userId) return;

    if (!req.file)
        return res.status(400).json({ error: 'No se ha subido ninguna imagen' });

    const imagePath = req.file.path;
    const fileName  = req.generatedFileName;

    try {
        const ocrText = await analyzeTicket(imagePath);
        const restaurante = extraerNombreRestaurante(ocrText); 
        if (!restaurante) {
            return res.status(400).json({ error: 'El ticket no pertenece a Al Punto' });
}
        const points  = calcularPuntos(ocrText);
        const status  = points === 0 ? 'review' : 'ok';

        const ticketData = { userId, fileName, text: ocrText, points };

        db.run(
            `INSERT INTO Tickets (user_id, image_url, json_content, points_awarded, status)
            VALUES (?, ?, ?, ?, ?)`,
            [ticketData.userId, ticketData.fileName, ticketData.text, ticketData.points, status],
            function (err) {
                if (err)
                    return res.status(500).json({ error: 'Error al insertar ticket' });

                const ticketId = this.lastID;

                db.get('SELECT * FROM Wallet WHERE user_id = ?', [ticketData.userId], (err, wallet) => {
                    if (err)
                        return res.status(500).json({ error: 'Error al obtener wallet' });

                    const newPoints = wallet.points + ticketData.points;

                    db.run(
                        'UPDATE Wallet SET points = ? WHERE user_id = ?',
                        [newPoints, ticketData.userId],
                        function (err) {
                            if (err)
                                return res.status(500).json({ error: 'Error al actualizar wallet' });

                            db.run(
                                `INSERT INTO Point_transactions (user_id, wallet_id, amount_transaction, type)
                                VALUES (?, ?, ?, ?)`,
                                [ticketData.userId, wallet.id, ticketData.points, 'add ticket'],
                                function (err) {
                                    if (err)
                                        return res.status(500).json({ error: 'Error al insertar ticket history' });

                                    if (ticketData.points > 0) {
                                        createNotification(
                                            ticketData.userId,
                                            `🎫 Ticket procesado: has ganado ${ticketData.points} puntos`,
                                            'info'
                                        );
                                    }

                                    db.all(
                                        'SELECT name, min_points, max_points FROM Levels ORDER BY min_points ASC',
                                        [],
                                        (err, levels) => {
                                            if (!err && levels.length) {
                                                const prevLevel = levels.find(l => wallet.points >= l.min_points && wallet.points <= l.max_points);
                                                const newLevel  = levels.find(l => newPoints  >= l.min_points && newPoints  <= l.max_points);
                                                if (prevLevel && newLevel && prevLevel.name !== newLevel.name) {
                                                    createNotification(
                                                        ticketData.userId,
                                                        `🏆 ¡Has subido al nivel ${newLevel.name}! Sigue así.`,
                                                        'level'
                                                    );
                                                }
                                            }
                                        }
                                    );

                                    res.json({
                                        message:  'Ticket subido y procesado correctamente',
                                        fileName,
                                        text:     ocrText,
                                        points,
                                        status,
                                        ticketId,
                                        walletId: wallet.id,
                                        newPoints,
                                    });
                                }
                            );
                        }
                    );
                });
            }
        );
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
});

//Get tickets
router.get('/mytickets', async (req, res) => {
    const userId = getUserIdFromToken(req, res);
    if (!userId) return;

    try {
        db.all('SELECT * FROM Tickets WHERE user_id = ?', [userId], (err, tickets) => {
            if (err)
                return res.status(500).json({ error: 'Error al obtener tickets' });
            res.json(tickets);
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;