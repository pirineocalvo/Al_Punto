const multer     = require('multer');
const path       = require('path');
const fs         = require('fs');
const { verifyToken } = require('../utils/crypto');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = path.join(__dirname, '../uploads/tickets');
        if (!fs.existsSync(uploadDir))
            fs.mkdirSync(uploadDir, { recursive: true });
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        try {
            const token   = req.headers['authorization'];
            const payload = verifyToken(token?.split(' ')[1]);
            const userId  = payload?.id ?? payload?.userId ?? payload?.sub;

            const now       = new Date();
            const timestamp = [
                now.getFullYear(),
                String(now.getMonth() + 1).padStart(2, '0'),
                String(now.getDate()).padStart(2, '0'),
                String(now.getHours()).padStart(2, '0'),
                String(now.getMinutes()).padStart(2, '0'),
                String(now.getSeconds()).padStart(2, '0'),
            ].join('');

            const fileName          = `${timestamp}_${userId}.jpg`;
            req.generatedFileName   = fileName;
            cb(null, fileName);
        } catch (err) {
            cb(err);
        }
    },
});

module.exports = multer({ storage });