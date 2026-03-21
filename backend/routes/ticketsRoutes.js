const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Tesseract = require('tesseract.js');
const { decrypt } = require('../utils/crypto');
const db = require('../utils/db.js');

// -----------------------------
//  CONFIGURACIÓN DE MULTER
// -----------------------------
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const dir = path.join(__dirname, '../uploads/tickets');
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        cb(null, dir);
    },

    filename: (req, file, cb) => {
        try {
            const authHeader = req.headers.authorization;
            const token = authHeader?.split(' ')[1];
            const userId = decrypt(token); // tu función existente

            const now = new Date();
            const year = now.getFullYear();
            const month = String(now.getMonth() + 1).padStart(2, '0');
            const day = String(now.getDate()).padStart(2, '0');
            const hour = String(now.getHours()).padStart(2, '0');
            const minute = String(now.getMinutes()).padStart(2, '0');
            const second = String(now.getSeconds()).padStart(2, '0');

            const timestamp = `${year}${month}${day}${hour}${minute}${second}`;

            const fileName = `${timestamp}_${userId}.jpg`;

            // Guardamos el nombre para usarlo luego en la respuesta
            req.generatedFileName = fileName;

            cb(null, fileName);

        } catch (error) {
            console.error("Error generando nombre de archivo:", error);
            cb(error);
        }
    }
});

const upload = multer({ storage: storage });

// -----------------------------
//  FUNCIÓN OCR
// -----------------------------
const analyzeTicket = async (imagePath) => {
    try {
        const { data: { text } } = await Tesseract.recognize(
            imagePath,
            'spa',
            { logger: m => console.log(m) }
        );
        return text;
    } catch (error) {
        console.error('Error en OCR:', error);
        throw new Error('Error al procesar la imagen con OCR');
    }
};

const calcularPuntos = (texto) => {
    let puntos = 0;
    const regex = /Total:\s*.*?(\d+(?:[.,]\d{1,2})?)\s*€/i;
    const match = texto.match(regex);
    if (match) {
        puntos = parseFloat(match[1]) * 100;
    } else {
        puntos = 0;
    }
    return puntos;
};

// -----------------------------
//  ENDPOINT /upload
// -----------------------------
router.post('/upload', upload.single('imagen'), async (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Token no proporcionado o formato inválido' });
    }

    const token = authHeader.split(' ')[1];
    const userId = decrypt(token);
    if (!userId) {
        return res.status(401).json({ error: 'Token inválido' });
    }

    if (!req.file) {
        return res.status(400).json({ error: 'No se ha subido ninguna imagen' });
    }

    const imagePath = req.file.path;
    const fileName = req.generatedFileName;

    try {
        const text = await analyzeTicket(imagePath);
        const ticket_points = calcularPuntos(text);

        let statusticket = 'ok';
        if (ticket_points === 0) statusticket = 'review';

        const ticket = {
            userId,
            fileName,
            text,
            points: ticket_points
        };

        db.run(
            `INSERT INTO Tickets (user_id, image_url, json_content, points_awarded, status)
             VALUES (?, ?, ?, ?, ?)`,
            [ticket.userId, ticket.fileName, ticket.text, ticket.points, statusticket],
            function (err) {
                if (err) return res.status(500).json({ error: 'Error al insertar ticket' });

                const ticketId = this.lastID;

                db.get('SELECT * FROM Wallet WHERE user_id = ?', [ticket.userId], (err, wallet) => {
                    if (err) return res.status(500).json({ error: 'Error al obtener wallet' });

                    const newPoints = wallet.points + ticket.points;

                    db.run(`UPDATE Wallet SET points = ? WHERE user_id = ?`,
                        [newPoints, ticket.userId],
                        function (err) {
                            if (err) return res.status(500).json({ error: 'Error al actualizar wallet' });

                            db.run(
                                `INSERT INTO Point_transactions (user_id, wallet_id, amount_transaction, type)
                                 VALUES (?, ?, ?, ?)`,
                                [ticket.userId, wallet.id, ticket.points, 'add ticket'],
                                function (err) {
                                    if (err) return res.status(500).json({ error: 'Error al insertar ticket history' });

                                    return res.json({
                                        message: 'Ticket subido y procesado correctamente',
                                        fileName,
                                        text,
                                        points: ticket_points,
                                        status: statusticket,
                                        ticketId,
                                        walletId: wallet.id,
                                        newPoints
                                    });
                                }
                            );
                        }
                    );
                });
            }
        );

    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
});

router.get('/mytickets', async (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Token no proporcionado o formato inválido' });
    }

    const token = authHeader.split(' ')[1];
    const userId = decrypt(token);
    if (!userId) {
        return res.status(401).json({ error: 'Token inválido' });
    }

    try {
        db.all(`SELECT * FROM Tickets WHERE user_id = ?`, [userId], (err, tickets) => {
            if (err) return res.status(500).json({ error: 'Error al obtener tickets' });
            return res.json(tickets);
        });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
});

module.exports = router;
