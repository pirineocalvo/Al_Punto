PRAGMA foreign_keys=OFF;
BEGIN TRANSACTION;
CREATE TABLE Levels (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    name       VARCHAR(50),
    min_points INTEGER,
    max_points INTEGER,
    hex_bkg    VARCHAR(7),
    hex_text   VARCHAR(7)
);
INSERT INTO Levels VALUES(1,'Bronce',0,1000,'#CD7F32','#FFFFFF');
INSERT INTO Levels VALUES(2,'Plata',1001,3000,'#C0C0C0','#000000');
INSERT INTO Levels VALUES(3,'Oro',3001,9999999,'#FFD700','#000000');
CREATE TABLE Users (
    id           INTEGER PRIMARY KEY AUTOINCREMENT,
    first_name   VARCHAR(50),
    last_name    VARCHAR(100),
    phone        VARCHAR(20),
    email        VARCHAR(100) UNIQUE,
    password_hash TEXT,
    active       BOOLEAN DEFAULT 1,
    created_at   DATETIME DEFAULT CURRENT_TIMESTAMP,
    access_level INTEGER DEFAULT 1,
    birth_date   DATE,
    auth_user_id INTEGER UNIQUE
);
INSERT INTO Users VALUES(9,'admin','test',NULL,'admin@t.com','sso-user',1,'2026-04-22 20:37:22',4,NULL,1);
CREATE TABLE Login_log (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id    INTEGER,
    success    BOOLEAN,
    tried_at   DATETIME DEFAULT CURRENT_TIMESTAMP,
    ip_address VARCHAR(45),
    FOREIGN KEY (user_id) REFERENCES Users(id)
);
CREATE TABLE Wallet (
    id       INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id  INTEGER UNIQUE,
    points   INTEGER DEFAULT 0,
    FOREIGN KEY (user_id) REFERENCES Users(id)
);
INSERT INTO Wallet VALUES(2,7,250);
INSERT INTO Wallet VALUES(3,8,500);
INSERT INTO Wallet VALUES(4,9,500);
CREATE TABLE Point_transactions (
    id                 INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id            INTEGER,
    wallet_id          INTEGER,
    amount_transaction INTEGER,
    type               VARCHAR(20),
    created_at         DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id)   REFERENCES Users(id),
    FOREIGN KEY (wallet_id) REFERENCES Wallet(id)
);
INSERT INTO Point_transactions VALUES(1,7,2,6400,'add ticket','2026-03-16 21:20:35');
INSERT INTO Point_transactions VALUES(2,7,2,5900,'add ticket','2026-03-16 21:26:42');
INSERT INTO Point_transactions VALUES(3,7,NULL,200,'buy market','2026-03-27 13:06:37');
INSERT INTO Point_transactions VALUES(4,7,NULL,200,'buy market','2026-03-27 13:06:48');
INSERT INTO Point_transactions VALUES(5,7,NULL,150,'buy market','2026-03-27 13:06:54');
INSERT INTO Point_transactions VALUES(6,7,2,10700,'add ticket','2026-03-27 14:51:08');
INSERT INTO Point_transactions VALUES(7,7,NULL,1800,'buy market','2026-03-28 12:21:25');
INSERT INTO Point_transactions VALUES(8,7,NULL,8000,'buy market','2026-03-28 12:21:31');
INSERT INTO Point_transactions VALUES(9,7,NULL,350,'buy market','2026-03-28 12:21:40');
INSERT INTO Point_transactions VALUES(10,7,NULL,350,'buy market','2026-03-28 12:21:41');
CREATE TABLE Menu_category (
    id   INTEGER PRIMARY KEY AUTOINCREMENT,
    name VARCHAR(100)
);
INSERT INTO Menu_category VALUES(1,'Entrante');
INSERT INTO Menu_category VALUES(2,'Principal');
INSERT INTO Menu_category VALUES(3,'Segundo');
INSERT INTO Menu_category VALUES(4,'Postre');
INSERT INTO Menu_category VALUES(5,'Para compartir');
CREATE TABLE Menu (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    name        VARCHAR(100),
    ingredients TEXT,
    description TEXT,
    img_src     VARCHAR(255),
    available   BOOLEAN DEFAULT 1,
    price       DECIMAL(10,2),
    created_at  DATETIME DEFAULT CURRENT_TIMESTAMP,
    id_category INTEGER,
    FOREIGN KEY (id_category) REFERENCES Menu_category(id)
);
INSERT INTO Menu VALUES(1,'Hamburguesa Clásica','Carne 200g, Queso Cheddar, Lechuga, Tomate','Nuestra burger más vendida con ingredientes frescos.','default.jpg',1,12.5,'2026-01-25 21:22:23',2);
INSERT INTO Menu VALUES(2,'Pizza Margherita','Masa artesanal, Tomate, Mozzarella, Albahaca','Sabor tradicional italiano cocinado en horno de piedra.','default.jpg',1,10,'2026-01-25 21:22:23',2);
INSERT INTO Menu VALUES(3,'Ensalada César','Pollo a la brasa, Lechuga romana, Croutons, Salsa César','Fresca y ligera, ideal para comenzar.','default.jpg',1,9.25,'2026-01-25 21:22:23',2);
INSERT INTO Menu VALUES(4,'Tarta de Queso','Queso crema, Base de galleta, Mermelada de frutos rojos','Casera y muy cremosa.','menuitemsimg/1776891415169-41471845.jpg',1,6.5,'2026-01-25 21:22:23',4);
CREATE TABLE Reservations (
    id           INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id      INTEGER,
    reserve_date DATE,
    reserve_hour TIME,
    guests       INTEGER,
    attended     BOOLEAN DEFAULT 0,
    created_at   DATETIME DEFAULT CURRENT_TIMESTAMP,
    status       INTEGER,
    FOREIGN KEY (user_id) REFERENCES Users(id)
);
INSERT INTO Reservations VALUES(1,7,'2026/03/11','15:15',2,0,'2026-03-10 20:50:06',NULL);
INSERT INTO Reservations VALUES(2,7,'2026/03/11','15:15',2,0,'2026-03-10 20:50:24',NULL);
INSERT INTO Reservations VALUES(3,7,'2026/03/19','21:45',2,0,'2026-03-24 23:08:07','cancel');
INSERT INTO Reservations VALUES(4,7,'2026/03/29','15:50',2,0,'2026-03-24 23:24:27','cancel');
CREATE TABLE Orders (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id     INTEGER,
    is_picked_up BOOLEAN DEFAULT 0,
    total_price DECIMAL(10,2),
    status      VARCHAR(20),
    created_at  DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES Users(id)
);
CREATE TABLE Order_items (
    id             INTEGER PRIMARY KEY AUTOINCREMENT,
    order_id       INTEGER,
    product_id     INTEGER,
    quantity       INTEGER DEFAULT 1,
    price_at_time  DECIMAL(10,2),
    FOREIGN KEY (order_id)   REFERENCES Orders(id),
    FOREIGN KEY (product_id) REFERENCES Menu(id)
);
CREATE TABLE Marketplace (
    id           INTEGER PRIMARY KEY AUTOINCREMENT,
    name         VARCHAR(100),
    description  TEXT,
    points_price INTEGER,
    min_level_id INTEGER,
    created_at   DATETIME DEFAULT CURRENT_TIMESTAMP,
    img_src      VARCHAR(255) DEFAULT NULL,
    FOREIGN KEY (min_level_id) REFERENCES Levels(id)
);
INSERT INTO Marketplace VALUES(1,'Bebida Gratis','Refresco, agua, cerveza o similar.',200,1,'2026-03-25 20:27:39',NULL);
INSERT INTO Marketplace VALUES(2,'Café Especialidad','Café de especialidad preparado por barista.',150,1,'2026-03-25 20:27:39',NULL);
INSERT INTO Marketplace VALUES(3,'Tapa de la Casa','Tapa exclusiva disponible solo para clientes fidelizados.',350,1,'2026-03-25 20:27:39',NULL);
INSERT INTO Marketplace VALUES(4,'Postre Casero','Cualquiera de nuestros postres artesanales.',400,1,'2026-03-25 20:27:39',NULL);
INSERT INTO Marketplace VALUES(5,'Plato Principal','Un plato principal del menú habitual.',1200,2,'2026-03-25 20:27:39',NULL);
INSERT INTO Marketplace VALUES(6,'Menú Completo','Incluye entrante, principal y bebida.',1800,2,'2026-03-25 20:27:39',NULL);
INSERT INTO Marketplace VALUES(7,'Botella de Vino','Selección especial de nuestro sumiller.',1500,2,'2026-03-25 20:27:39',NULL);
INSERT INTO Marketplace VALUES(8,'Cena para Dos','Menú degustación para dos personas.',4000,3,'2026-03-25 20:27:39',NULL);
INSERT INTO Marketplace VALUES(9,'Experiencia con el Chef','Cocina con nuestro chef y aprende un plato estrella.',8000,3,'2026-03-25 20:27:39',NULL);
CREATE TABLE Pocket (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id    INTEGER,
    product_id INTEGER,
    is_used    BOOLEAN DEFAULT 0,
    added_at   DATETIME DEFAULT CURRENT_TIMESTAMP,
    used_at    DATETIME,
    token_url  VARCHAR(255),
    expires_at DATETIME,
    FOREIGN KEY (user_id)    REFERENCES Users(id),
    FOREIGN KEY (product_id) REFERENCES Marketplace(id)
);
INSERT INTO Pocket VALUES(1,7,1,0,'2026-03-25 23:11:35',NULL,'7-1-1774480295431',NULL);
INSERT INTO Pocket VALUES(2,7,9,0,'2026-03-27 12:54:00',NULL,'7-9-1774616040517',NULL);
INSERT INTO Pocket VALUES(3,7,5,0,'2026-03-27 12:54:35',NULL,'7-5-1774616075280',NULL);
INSERT INTO Pocket VALUES(4,7,1,0,'2026-03-27 13:03:56',NULL,'7-1-1774616636520',NULL);
INSERT INTO Pocket VALUES(5,7,1,0,'2026-03-27 13:06:37',NULL,'7-1-1774616797859',NULL);
INSERT INTO Pocket VALUES(6,7,1,0,'2026-03-27 13:06:48',NULL,'7-1-1774616808391',NULL);
INSERT INTO Pocket VALUES(7,7,2,0,'2026-03-27 13:06:54',NULL,'7-2-1774616814617',NULL);
INSERT INTO Pocket VALUES(8,7,6,0,'2026-03-28 12:21:25',NULL,'7-6-1774700485504',NULL);
INSERT INTO Pocket VALUES(9,7,9,0,'2026-03-28 12:21:31',NULL,'7-9-1774700491415',NULL);
INSERT INTO Pocket VALUES(10,7,3,0,'2026-03-28 12:21:40',NULL,'7-3-1774700500880',NULL);
INSERT INTO Pocket VALUES(11,7,3,0,'2026-03-28 12:21:41',NULL,'7-3-1774700501724',NULL);
CREATE TABLE Tickets (
    id             INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id        INTEGER,
    image_url      TEXT,
    json_content   TEXT,
    points_awarded INTEGER,
    status         VARCHAR(20),
    created_at     DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES Users(id)
);
CREATE TABLE Mesas (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    name        VARCHAR(50),
    n_ocupantes INTEGER DEFAULT 2,
    activo      BOOLEAN DEFAULT 1
);
INSERT INTO Mesas VALUES(1,'Terraza 1 (T1)',4,1);
CREATE TABLE Mesas_reservadas (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    id_reservas INTEGER,
    id_mesa    INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE Resenias (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    id_plato    INTEGER,
    descripcion VARCHAR(50),
    puntuacion  INTEGER,
    created_at  DATETIME DEFAULT CURRENT_TIMESTAMP,
    user_id     INTEGER REFERENCES Users(id)
);
CREATE TABLE Notifications (
        id          INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id     INTEGER NOT NULL,
        message     TEXT    NOT NULL,
        type        VARCHAR(50) DEFAULT 'info',
        read        INTEGER DEFAULT 0,
        created_at  DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES Users(id)
    );
PRAGMA writable_schema=ON;
CREATE TABLE IF NOT EXISTS sqlite_sequence(name,seq);
DELETE FROM sqlite_sequence;
INSERT INTO sqlite_sequence VALUES('Levels',3);
INSERT INTO sqlite_sequence VALUES('Menu_category',5);
INSERT INTO sqlite_sequence VALUES('Menu',4);
INSERT INTO sqlite_sequence VALUES('Marketplace',9);
INSERT INTO sqlite_sequence VALUES('Users',9);
INSERT INTO sqlite_sequence VALUES('Wallet',4);
INSERT INTO sqlite_sequence VALUES('Point_transactions',10);
INSERT INTO sqlite_sequence VALUES('Reservations',4);
INSERT INTO sqlite_sequence VALUES('Pocket',11);
INSERT INTO sqlite_sequence VALUES('Mesas',1);
CREATE UNIQUE INDEX idx_users_auth_user_id ON Users(auth_user_id);
PRAGMA writable_schema=OFF;
COMMIT;
