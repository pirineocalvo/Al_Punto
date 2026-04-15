const sqlite3 = require('sqlite3')['verbose'](), path = require('path'), db = new sqlite3['Database'](path['resolve'](__dirname, 'db/db.db'), b => {
        b ? console['error']('Error\x20al\x20cargar\x20la\x20base\x20de\x20datos\x20SQLite\x20', b) : console['log']('Base\x20de\x20datos\x20activa');
    });
module['exports'] = db;