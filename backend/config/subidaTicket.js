const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { verificarToken } = require('../utils/crypto');

const almacenamiento = multer.diskStorage({
    destination: (req, archivo, cb) => {
        const directorioSubida = path.join(__dirname, '../uploads/tickets');
        if (!fs.existsSync(directorioSubida)) {
            fs.mkdirSync(directorioSubida, { recursive: true });
        }
        cb(null, directorioSubida);
    },
    filename: (req, archivo, cb) => {
        try {
            const token = req.headers['authorization'];
            const payload = verificarToken(token?.split(' ')[1]);
            const idUsuario = payload?.id ?? payload?.userId ?? payload?.sub;

            const ahora = new Date();
            const marcaTiempo = [
                ahora.getFullYear(),
                String(ahora.getMonth() + 1).padStart(2, '0'),
                String(ahora.getDate()).padStart(2, '00'),
                String(ahora.getHours()).padStart(2, '00'),
                String(ahora.getMinutes()).padStart(2, '00'),
                String(ahora.getSeconds()).padStart(2, '00'),
            ].join('');

            const nombreArchivo = `${marcaTiempo}_${idUsuario}.jpg`;
            req.nombreArchivoGenerado = nombreArchivo;
            cb(null, nombreArchivo);
        } catch (error) {
            cb(error);
        }
    },
});

module.exports = multer({ storage: almacenamiento });