const db = require('./db');

// Crear la tabla si no existe al cargar el módulo
db.run(`
    CREATE TABLE IF NOT EXISTS Notifications (
        id          INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id     INTEGER NOT NULL,
        message     TEXT    NOT NULL,
        type        VARCHAR(50) DEFAULT 'info',
        read        INTEGER DEFAULT 0,
        created_at  DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES Users(id)
    )
`, (err) => {
    if (err) console.error('Error creando tabla Notifications:', err);
});

/**
 * Crea una notificación para un usuario. Fire-and-forget.
 * @param {number} userId
 * @param {string} message
 * @param {string} type  — 'order' | 'level' | 'reserva' | 'info'
 */
const createNotification = (userId, message, type = 'info') => {
    db.run(
        'INSERT INTO Notifications (user_id, message, type) VALUES (?, ?, ?)',
        [userId, message, type],
        (err) => { if (err) console.error('Error al crear notificación:', err); }
    );
};

module.exports = { createNotification };
