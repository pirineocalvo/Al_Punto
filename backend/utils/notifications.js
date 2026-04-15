const db = require('./db');

// Crear la tabla si no existe
db.run(`
    CREATE TABLE IF NOT EXISTS Notifications (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        message TEXT NOT NULL,
        type TEXT,
        read INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
`);

function createNotification(userId, message, type = 'info') {
    const query = 'INSERT INTO Notifications (user_id, message, type) VALUES (?, ?, ?)';
    db.run(query, [userId, message, type], function(err) {
        if (err) {
            console.error('Error al crear notificación:', err);
        }
    });
}

module.exports = { createNotification };
