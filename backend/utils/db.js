const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const dbDir = path.resolve(__dirname, 'db');
const dbPath = path.join(dbDir, 'restaurante.db');
const seedPath = path.join(dbDir, 'seed.sql');

if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
}

const dbExistedBefore = fs.existsSync(dbPath);

const db = new sqlite3.Database(dbPath, err => {
    if (err) {
        console.error('Error al cargar la base de datos SQLite:', err);
        return;
    }
    console.log('Base de datos activa');

    db.get(
        "SELECT COUNT(*) AS n FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'",
        (countErr, row) => {
            const tableCount = Number(row?.n) || 0;
            const isEmpty = !dbExistedBefore || tableCount === 0;

            if (isEmpty && fs.existsSync(seedPath)) {
                const seed = fs.readFileSync(seedPath, 'utf8');
                db.exec(seed, (execErr) => {
                    if (execErr) console.error('Error importando seed.sql:', execErr);
                    else console.log('seed.sql importado correctamente');
                    applyMigrations();
                });
            } else {
                applyMigrations();
            }
        }
    );
});

function applyMigrations() {
    db.run(
        "CREATE UNIQUE INDEX IF NOT EXISTS idx_usuarios_auth ON usuarios(id_usuario_auth)",
        () => {}
    );
}

module.exports = db;