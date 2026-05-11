const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const dbDir = path.resolve(__dirname, 'db');
const dbPath = path.join(dbDir, 'db.db');
const seedPath = path.join(dbDir, 'seed.sql');
const schemaPath = path.join(dbDir, 'restaurante_schema_completo.sql');

if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
}

const dbExistedBefore = fs.existsSync(dbPath);

const db = new sqlite3.Database(dbPath, err => {
    if (err) {
        console.error('Error al cargar la base de datos SQLite ', err);
        return;
    }
    console.log('Base de datos activa');

    db.get(
        "SELECT COUNT(*) AS n FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'",
        (countErr, row) => {
            const tableCount = Number(row?.n) || 0;
            const isEmpty = !dbExistedBefore || tableCount === 0;

            // Si la BD está vacía o es nueva, importa seed.sql (con datos reales).
            // Si no existe seed.sql, cae al schema vacío como fallback.
            // Si la BD ya tenía tablas y datos, NO sobrescribe nada.
            if (isEmpty && fs.existsSync(seedPath)) {
                const seed = fs.readFileSync(seedPath, 'utf8');
                db.exec(seed, (execErr) => {
                    if (execErr) console.error('Error importando seed.sql:', execErr);
                    else console.log('seed.sql importado correctamente');
                    applyMigrations();
                });
            } else if (isEmpty && fs.existsSync(schemaPath)) {
                const schema = fs.readFileSync(schemaPath, 'utf8');
                db.exec(schema, (execErr) => {
                    if (execErr) console.error('Error inicializando schema:', execErr);
                    else console.log('Esquema SQLite inicializado desde restaurante_schema_completo.sql');
                    applyMigrations();
                });
            } else {
                applyMigrations();
            }
        }
    );
});

// Migraciones idempotentes (siempre se aplican; los CREATE/ALTER ignoran errores si ya existen)
function applyMigrations() {
    db.run("ALTER TABLE Users ADD COLUMN auth_user_id INTEGER", () => {});
    db.run("CREATE UNIQUE INDEX IF NOT EXISTS idx_users_auth_user_id ON Users(auth_user_id)", () => {});
}

module.exports = db;
