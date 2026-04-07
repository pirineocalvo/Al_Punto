PRAGMA foreign_keys=OFF;
BEGIN TRANSACTION;
CREATE TABLE Levels (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name VARCHAR(50),
    min_points INTEGER,
    max_points INTEGER,
    hex_bkg VARCHAR(7),
    hex_text VARCHAR(7)
);
INSERT INTO Levels VALUES(1,'Bronce',0,1000,'#CD7F32','#FFFFFF');
INSERT INTO Levels VALUES(2,'Plata',1001,3000,'#C0C0C0','#000000');
INSERT INTO Levels VALUES(3,'Oro',3001,9999999,'#FFD700','#000000');
CREATE TABLE Users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    first_name VARCHAR(50),
    last_name VARCHAR(100),
    phone VARCHAR(20),
    email VARCHAR(100) UNIQUE,
    password_hash TEXT,
    active BOOLEAN DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
, access_level INTEGER DEFAULT 1, birth_date DATE);
INSERT INTO Users VALUES(7,'test','test','123','test@t.com','$2b$10$kUHfmvVh/b1bA63sygS34Oku9wwJUONL9diSe./Ob2rxnfrm10Y6e',1,'2026-02-11 08:09:54',1);
INSERT INTO Users VALUES(8,'Sergio','Salinas Sierra','111111111','trosqui.job@gmail.com','$2b$10$3jUzfjRPqYOV20/4ckuOru63Cp4LX9000YVT1Ce8ubx.mh4WAFjbW',1,'2026-03-09 10:42:57',1);
CREATE TABLE Login_log (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    success BOOLEAN,
    tried_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    ip_address VARCHAR(45),
    FOREIGN KEY (user_id) REFERENCES Users(id)
);
INSERT INTO Login_log VALUES(1,4,0,'2026-02-01 22:25:33','::1');
INSERT INTO Login_log VALUES(2,4,1,'2026-02-01 22:25:38','::1');
INSERT INTO Login_log VALUES(3,4,1,'2026-02-02 10:38:38','::1');
INSERT INTO Login_log VALUES(4,6,1,'2026-02-02 11:16:27','::1');
INSERT INTO Login_log VALUES(5,7,1,'2026-02-11 08:10:08','::1');
INSERT INTO Login_log VALUES(6,7,0,'2026-02-25 08:56:29','::1');
INSERT INTO Login_log VALUES(7,7,1,'2026-02-25 08:56:38','::1');
INSERT INTO Login_log VALUES(8,7,1,'2026-02-25 09:57:03','::1');
INSERT INTO Login_log VALUES(9,7,1,'2026-02-25 10:37:01','::1');
INSERT INTO Login_log VALUES(10,7,1,'2026-02-25 10:38:31','::1');
INSERT INTO Login_log VALUES(11,7,1,'2026-02-25 10:39:41','::1');
INSERT INTO Login_log VALUES(12,7,1,'2026-02-25 11:50:43','::1');
INSERT INTO Login_log VALUES(13,7,1,'2026-03-05 06:04:52','::1');
INSERT INTO Login_log VALUES(14,7,1,'2026-03-05 07:09:31','::1');
INSERT INTO Login_log VALUES(15,8,0,'2026-03-09 10:43:15','::1');
INSERT INTO Login_log VALUES(16,8,0,'2026-03-09 10:43:27','::1');
INSERT INTO Login_log VALUES(17,8,1,'2026-03-09 10:43:36','::1');
INSERT INTO Login_log VALUES(18,8,0,'2026-03-09 12:05:18','::1');
INSERT INTO Login_log VALUES(19,8,1,'2026-03-09 12:05:28','::1');
INSERT INTO Login_log VALUES(20,8,0,'2026-03-09 12:07:20','::1');
INSERT INTO Login_log VALUES(21,8,1,'2026-03-09 12:07:26','::1');
INSERT INTO Login_log VALUES(22,7,1,'2026-03-10 10:28:29','::1');
INSERT INTO Login_log VALUES(23,7,1,'2026-03-10 13:08:47','::1');
INSERT INTO Login_log VALUES(24,7,1,'2026-03-10 16:29:18','::1');
INSERT INTO Login_log VALUES(25,7,1,'2026-03-10 20:39:53','::1');
INSERT INTO Login_log VALUES(26,7,1,'2026-03-10 21:23:39','::1');
INSERT INTO Login_log VALUES(27,7,1,'2026-03-10 21:30:31','::1');
INSERT INTO Login_log VALUES(28,7,1,'2026-03-11 12:31:40','::1');
INSERT INTO Login_log VALUES(29,8,1,'2026-03-12 21:50:55','::1');
INSERT INTO Login_log VALUES(30,7,1,'2026-03-16 20:29:48','::1');
INSERT INTO Login_log VALUES(31,7,1,'2026-03-16 20:56:50','::1');
INSERT INTO Login_log VALUES(32,7,1,'2026-03-16 22:47:54','::1');
INSERT INTO Login_log VALUES(33,7,1,'2026-03-17 15:20:46','::1');
INSERT INTO Login_log VALUES(34,7,1,'2026-03-21 08:41:54','::1');
INSERT INTO Login_log VALUES(35,7,1,'2026-03-21 09:54:23','::1');
INSERT INTO Login_log VALUES(36,7,1,'2026-03-24 21:49:57','::1');
INSERT INTO Login_log VALUES(37,7,1,'2026-03-24 22:59:56','::1');
INSERT INTO Login_log VALUES(38,7,1,'2026-03-25 20:17:36','::1');
INSERT INTO Login_log VALUES(39,7,1,'2026-03-25 23:10:34','::1');
INSERT INTO Login_log VALUES(40,7,1,'2026-03-27 12:31:33','::1');
INSERT INTO Login_log VALUES(41,7,1,'2026-03-27 12:37:50','::1');
INSERT INTO Login_log VALUES(42,7,1,'2026-03-27 14:49:05','::1');
INSERT INTO Login_log VALUES(43,7,1,'2026-03-28 12:19:42','::1');
CREATE TABLE Wallet (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER UNIQUE,
    points INTEGER DEFAULT 0,
    FOREIGN KEY (user_id) REFERENCES Users(id)
);
INSERT INTO Wallet VALUES(2,7,250);
INSERT INTO Wallet VALUES(3,8,500);
CREATE TABLE Point_transactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    wallet_id INTEGER,
    amount_transaction INTEGER,
    type VARCHAR(20),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES Users(id),
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
CREATE TABLE Menu (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name VARCHAR(100),
    ingredients TEXT,
    description TEXT,
    img_src VARCHAR(255),
    available BOOLEAN DEFAULT 1,
    price DECIMAL(10,2),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
, id_category id_menu_category INTEGER);
INSERT INTO Menu VALUES(1,'Hamburguesa Clásica','Carne 200g, Queso Cheddar, Lechuga, Tomate','Nuestra burger más vendida con ingredientes frescos.','default.jpg',1,12.5,'2026-01-25 21:22:23',2);
INSERT INTO Menu VALUES(2,'Pizza Margherita','Masa artesanal, Tomate, Mozzarella, Albahaca','Sabor tradicional italiano cocinado en horno de piedra.','default.jpg',1,10,'2026-01-25 21:22:23',2);
INSERT INTO Menu VALUES(3,'Ensalada César','Pollo a la brasa, Lechuga romana, Croutons, Salsa César','Fresca y ligera, ideal para comenzar.','default.jpg',1,9.25,'2026-01-25 21:22:23',2);
INSERT INTO Menu VALUES(4,'Tarta de Queso','Queso crema, Base de galleta, Mermelada de frutos rojos','Casera y muy cremosa.','default.jpg',1,6.5,'2026-01-25 21:22:23',2);
CREATE TABLE Reservations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    reserve_date DATE,
    reserve_hour TIME,
    guests INTEGER,
    attended BOOLEAN DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP, status INTEGER,
    FOREIGN KEY (user_id) REFERENCES Users(id)
);
INSERT INTO Reservations VALUES(1,7,'2026/03/11','15:15',2,0,'2026-03-10 20:50:06',NULL);
INSERT INTO Reservations VALUES(2,7,'2026/03/11','15:15',2,0,'2026-03-10 20:50:24',NULL);
INSERT INTO Reservations VALUES(3,7,'2026/03/19','21:45',2,0,'2026-03-24 23:08:07','cancel');
INSERT INTO Reservations VALUES(4,7,'2026/03/29','15:50',2,0,'2026-03-24 23:24:27','cancel');
CREATE TABLE Orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    is_picked_up BOOLEAN DEFAULT 0,
    total_price DECIMAL(10,2),
    status VARCHAR(20),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES Users(id)
);
CREATE TABLE Order_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_id INTEGER,
    product_id INTEGER,
    quantity INTEGER DEFAULT 1,
    price_at_time DECIMAL(10,2),
    FOREIGN KEY (order_id) REFERENCES Orders(id),
    FOREIGN KEY (product_id) REFERENCES Menu(id)
);
CREATE TABLE Marketplace (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name VARCHAR(100),
    description TEXT,
    points_price INTEGER,
    min_level_id INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP, img_src VARCHAR(255) DEFAULT NULL,
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
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    product_id INTEGER,
    is_used BOOLEAN DEFAULT 0,
    added_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    used_at DATETIME,
    token_url VARCHAR(255),
    expires_at DATETIME,
    FOREIGN KEY (user_id) REFERENCES Users(id),
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
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    image_url TEXT,
    json_content TEXT,
    points_awarded INTEGER,
    status VARCHAR(20),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES Users(id)
);
INSERT INTO Tickets VALUES(1,7,'20260316215720_7.jpg',unistr('ñ " - or r\u000af ELA\u000a! E E\u000aa ([ELCHIRINGUTO] >\u000aL a dirección :\u000a\u000a, E — Paseo Marítimo, 45, 08003 Barcelona 7 - —\u000aA Ve Fecha: 23-07-2024 | Hora: 20:15 o e\u000a5 y a —_\u000a\u000aE —- <<. > 2 -\u000ay Dato del Producto IMPORTE , " —\u000a/ LA Mist E - ==.\u000aA Pizza Margarita (3 uds) 36,00 € >\u000año Pizza Prosciutto (1 ud) 14,50 € <a ES a\u000aCoca-Cola (2 uds) 6,00 € S AE e o\u000aFanta Naranja (1 ud) 3,00 € e a\u000aSubtotal: 59,50 € >\u000aEZ MNOA ZN. . — — —— Ea a 2 o\u000aTotal: 59,50 € Ta\u000aIVA Incluido\u000a'),5900,'ok','2026-03-16 20:57:21');
INSERT INTO Tickets VALUES(2,7,'20260316222033_7.jpg',unistr('ñ " - or r\u000af ELA\u000a! E E\u000aa ([ELCHIRINGUTO] >\u000aL a dirección :\u000a\u000a, E — Paseo Marítimo, 45, 08003 Barcelona 7 - —\u000aA Ve Fecha: 23-07-2024 | Hora: 20:15 o e\u000a5 y a —_\u000a\u000aE —- <<. > 2 -\u000ay Dato del Producto IMPORTE , " —\u000a/ LA Mist E - ==.\u000aA Pizza Margarita (3 uds) 36,00 € >\u000año Pizza Prosciutto (1 ud) 14,50 € <a ES a\u000aCoca-Cola (2 uds) 6,00 € S AE e o\u000aFanta Naranja (1 ud) 3,00 € e a\u000aSubtotal: 59,50 € >\u000aEZ MNOA ZN. . — — —— Ea a 2 o\u000aTotal: 59,50 € Ta\u000aIVA Incluido\u000a'),5900,'ok','2026-03-16 21:20:35');
INSERT INTO Tickets VALUES(3,7,'20260316222640_7.jpg',unistr('ñ " - or r\u000af ELA\u000a! E E\u000aa ([ELCHIRINGUTO] >\u000aL a dirección :\u000a\u000a, E — Paseo Marítimo, 45, 08003 Barcelona 7 - —\u000aA Ve Fecha: 23-07-2024 | Hora: 20:15 o e\u000a5 y a —_\u000a\u000aE —- <<. > 2 -\u000ay Dato del Producto IMPORTE , " —\u000a/ LA Mist E - ==.\u000aA Pizza Margarita (3 uds) 36,00 € >\u000año Pizza Prosciutto (1 ud) 14,50 € <a ES a\u000aCoca-Cola (2 uds) 6,00 € S AE e o\u000aFanta Naranja (1 ud) 3,00 € e a\u000aSubtotal: 59,50 € >\u000aEZ MNOA ZN. . — — —— Ea a 2 o\u000aTotal: 59,50 € Ta\u000aIVA Incluido\u000a'),5900,'ok','2026-03-16 21:26:42');
INSERT INTO Tickets VALUES(4,7,'20260327155107_7.jpg',unistr('A " 2 La -\u000aLEA A\u000a: [ EL CHIRINGUITO] “<< >\u000a! a dirección : -\u000a\u000ay E Paseo Marítimo, 45, 08003 Barcelona - - Zo\u000a7 7 Fecha: 22-07-2024 | Hora: 19:30 aa\u000a/ >"\u000a/ ———————ooo y E\u000aha Dato del Producto ———— IMPORTE E a\u000aÁ Paella de Mariscos (2 pers.) 52,00 € -— ==\u000aA Ensalada Mixta 14,50 € yu A\u000aJarra Sangría (1L) 19,00 € *. ETA ==\u000aCroquetas de Jamón (6uds) 10,00 € y. A 7\u000aAgua con Gas 4,00 € Ea\u000aPostre: Crema Catalana 7,50 € Za\u000aO SN a EY\u000aTotal: 107,00 € TA\u000a\u000aIVA Incluido\u000a'),10700,'ok','2026-03-27 14:51:08');
CREATE TABLE Menu_category (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name VARCHAR(100)
);
INSERT INTO Menu_category VALUES(1,'Entrante');
INSERT INTO Menu_category VALUES(2,'Principal');
INSERT INTO Menu_category VALUES(3,'Segundo');
INSERT INTO Menu_category VALUES(4,'Postre');
INSERT INTO Menu_category VALUES(5,'Para compartir');
CREATE TABLE Mesas (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
name VARCHAR(50),
n_ocupantes INTEGER DEFAULT 2,
activo BOOLEAN DEFAULT 1
);
CREATE TABLE Mesas_reservadas (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    id_reservas INTEGER,
    id_mesa INTEGER
, created_at DATETIME DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE Resenias (

    id INTEGER PRIMARY KEY AUTOINCREMENT,
    id_plato INTEGER,
descripcion VARCHAR(50),
puntuacion INTEGER,
created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
user_id INTEGER REFERENCES Users(id));
PRAGMA writable_schema=ON;
CREATE TABLE IF NOT EXISTS sqlite_sequence(name,seq);
DELETE FROM sqlite_sequence;
INSERT INTO sqlite_sequence VALUES('Levels',3);
INSERT INTO sqlite_sequence VALUES('Menu',4);
INSERT INTO sqlite_sequence VALUES('Users',8);
INSERT INTO sqlite_sequence VALUES('Login_log',43);
INSERT INTO sqlite_sequence VALUES('Wallet',3);
INSERT INTO sqlite_sequence VALUES('Menu_category',5);
INSERT INTO sqlite_sequence VALUES('Reservations',4);
INSERT INTO sqlite_sequence VALUES('Tickets',4);
INSERT INTO sqlite_sequence VALUES('Point_transactions',10);
INSERT INTO sqlite_sequence VALUES('Marketplace',9);
INSERT INTO sqlite_sequence VALUES('Pocket',11);
PRAGMA writable_schema=OFF;
COMMIT;
