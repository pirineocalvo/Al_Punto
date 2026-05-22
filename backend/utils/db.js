const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const directorioDb = path.resolve(__dirname, 'db');
const rutaDb = path.join(directorioDb, 'restaurante.db');
const rutaSeed = path.join(directorioDb, 'seed.sql');

if (!fs.existsSync(directorioDb)) {
    fs.mkdirSync(directorioDb, { recursive: true });
}

const dbExistiaAntes = fs.existsSync(rutaDb);

const db = new sqlite3.Database(rutaDb, err => {
    if (err) {
        console.error('Error al cargar la base de datos SQLite:', err);
        return;
    }
    console.log('Base de datos activa');

    db.get(
        "SELECT COUNT(*) AS n FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'",
        (errConteo, fila) => {
            const totalTablas = Number(fila?.n) || 0;
            const estaVacia = !dbExistiaAntes || totalTablas === 0;

            if (estaVacia && fs.existsSync(rutaSeed)) {
                const seed = fs.readFileSync(rutaSeed, 'utf8');
                db.exec(seed, (errEjecucion) => {
                    if (errEjecucion) console.error('Error importando seed.sql:', errEjecucion);
                    else console.log('seed.sql importado correctamente');
                    aplicarMigraciones();
                });
            } else {
                aplicarMigraciones();
            }
        }
    );
});

function aplicarMigraciones() {
    db.run(
        "CREATE UNIQUE INDEX IF NOT EXISTS idx_usuarios_auth ON usuarios(id_usuario_auth)",
        () => { }
    );
}

module.exports = db;