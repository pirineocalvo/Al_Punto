const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const db = new sqlite3.Database(path.resolve(__dirname,'db/db.db'), err => {
    if (err) {
        console.error('Error al cargar la base de datos SQLite ', err);
    } else {
        console.log('Base de datos activa');
    }
});
module.exports = db;