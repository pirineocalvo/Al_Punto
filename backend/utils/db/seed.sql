PRAGMA foreign_keys=OFF;
BEGIN TRANSACTION;

CREATE TABLE niveles (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre     VARCHAR(50),
    puntos_min INTEGER,
    puntos_max INTEGER,
    hex_bkg    VARCHAR(7),
    hex_text   VARCHAR(7)
);
INSERT INTO niveles VALUES(1,'Bronce',0,1000,'#CD7F32','#FFFFFF');
INSERT INTO niveles VALUES(2,'Plata',1001,3000,'#C0C0C0','#000000');
INSERT INTO niveles VALUES(3,'Oro',3001,9999999,'#FFD700','#000000');

CREATE TABLE usuarios (
    id               INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre           VARCHAR(50),
    apellido         VARCHAR(100),
    telefono         VARCHAR(20),
    email            VARCHAR(100) UNIQUE,
    hash_contrasena  TEXT,
    activo           BOOLEAN DEFAULT 1,
    creado_en        DATETIME DEFAULT CURRENT_TIMESTAMP,
    nivel_acceso     INTEGER DEFAULT 1,
    fecha_nacimiento DATE,
    id_usuario_auth  INTEGER UNIQUE
);
INSERT INTO usuarios VALUES(9,'admin','test',NULL,'admin@t.com','sso-user',1,'2026-04-22 20:37:22',4,NULL,1);

CREATE TABLE registro_accesos (
    id           INTEGER PRIMARY KEY AUTOINCREMENT,
    id_usuario   INTEGER,
    exitoso      BOOLEAN,
    intentado_en DATETIME DEFAULT CURRENT_TIMESTAMP,
    ip_address   VARCHAR(45),
    FOREIGN KEY (id_usuario) REFERENCES usuarios(id)
);

CREATE TABLE monedero (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    id_usuario INTEGER UNIQUE,
    puntos     INTEGER DEFAULT 0,
    FOREIGN KEY (id_usuario) REFERENCES usuarios(id)
);
INSERT INTO monedero VALUES(4,9,500);

CREATE TABLE transacciones_puntos (
    id                   INTEGER PRIMARY KEY AUTOINCREMENT,
    id_usuario           INTEGER,
    id_monedero          INTEGER,
    cantidad_transaccion INTEGER,
    tipo                 VARCHAR(20),
    creado_en            DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_usuario)  REFERENCES usuarios(id),
    FOREIGN KEY (id_monedero) REFERENCES monedero(id)
);
INSERT INTO transacciones_puntos VALUES(1,7,2,6400,'add ticket','2026-03-16 21:20:35');
INSERT INTO transacciones_puntos VALUES(2,7,2,5900,'add ticket','2026-03-16 21:26:42');
INSERT INTO transacciones_puntos VALUES(3,7,NULL,200,'buy market','2026-03-27 13:06:37');
INSERT INTO transacciones_puntos VALUES(4,7,NULL,200,'buy market','2026-03-27 13:06:48');
INSERT INTO transacciones_puntos VALUES(5,7,NULL,150,'buy market','2026-03-27 13:06:54');
INSERT INTO transacciones_puntos VALUES(6,7,2,10700,'add ticket','2026-03-27 14:51:08');
INSERT INTO transacciones_puntos VALUES(7,7,NULL,1800,'buy market','2026-03-28 12:21:25');
INSERT INTO transacciones_puntos VALUES(8,7,NULL,8000,'buy market','2026-03-28 12:21:31');
INSERT INTO transacciones_puntos VALUES(9,7,NULL,350,'buy market','2026-03-28 12:21:40');
INSERT INTO transacciones_puntos VALUES(10,7,NULL,350,'buy market','2026-03-28 12:21:41');

CREATE TABLE categorias_menu (
    id     INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre VARCHAR(100)
);
INSERT INTO categorias_menu VALUES(1,'Entrante');
INSERT INTO categorias_menu VALUES(2,'Principal');
INSERT INTO categorias_menu VALUES(3,'Segundo');
INSERT INTO categorias_menu VALUES(4,'Postre');
INSERT INTO categorias_menu VALUES(5,'Para compartir');

CREATE TABLE menu (
    id           INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre       VARCHAR(100),
    ingredientes TEXT,
    descripcion  TEXT,
    img_src      VARCHAR(255),
    disponible   BOOLEAN DEFAULT 1,
    precio       DECIMAL(10,2),
    creado_en    DATETIME DEFAULT CURRENT_TIMESTAMP,
    id_categoria INTEGER,
    FOREIGN KEY (id_categoria) REFERENCES categorias_menu(id)
);
INSERT INTO menu VALUES(1,'Hamburguesa Clásica','Carne 200g, Queso Cheddar, Lechuga, Tomate','Nuestra burger más vendida con ingredientes frescos.','default.jpg',1,12.5,'2026-01-25 21:22:23',2);
INSERT INTO menu VALUES(2,'Pizza Margherita','Masa artesanal, Tomate, Mozzarella, Albahaca','Sabor tradicional italiano cocinado en horno de piedra.','default.jpg',1,10,'2026-01-25 21:22:23',2);
INSERT INTO menu VALUES(3,'Ensalada César','Pollo a la brasa, Lechuga romana, Croutons, Salsa César','Fresca y ligera, ideal para comenzar.','default.jpg',1,9.25,'2026-01-25 21:22:23',2);
INSERT INTO menu VALUES(4,'Tarta de Queso','Queso crema, Base de galleta, Mermelada de frutos rojos','Casera y muy cremosa.','menuitemsimg/1776891415169-41471845.jpg',1,6.5,'2026-01-25 21:22:23',4);

CREATE TABLE reservas (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    id_usuario    INTEGER,
    fecha_reserva DATE,
    hora_reserva  TIME,
    comensales    INTEGER,
    atendido      BOOLEAN DEFAULT 0,
    creado_en     DATETIME DEFAULT CURRENT_TIMESTAMP,
    estado        VARCHAR(20),
    FOREIGN KEY (id_usuario) REFERENCES usuarios(id)
);
INSERT INTO reservas VALUES(1,7,'2026/03/11','15:15',2,0,'2026-03-10 20:50:06',NULL);
INSERT INTO reservas VALUES(2,7,'2026/03/11','15:15',2,0,'2026-03-10 20:50:24',NULL);
INSERT INTO reservas VALUES(3,7,'2026/03/19','21:45',2,0,'2026-03-24 23:08:07','cancel');
INSERT INTO reservas VALUES(4,7,'2026/03/29','15:50',2,0,'2026-03-24 23:24:27','cancel');

CREATE TABLE pedidos (
    id           INTEGER PRIMARY KEY AUTOINCREMENT,
    id_usuario   INTEGER,
    recogido     BOOLEAN DEFAULT 0,
    precio_total DECIMAL(10,2),
    estado       VARCHAR(20),
    creado_en    DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_usuario) REFERENCES usuarios(id)
);

CREATE TABLE items_pedido (
    id               INTEGER PRIMARY KEY AUTOINCREMENT,
    id_pedido        INTEGER,
    id_producto      INTEGER,
    cantidad         INTEGER DEFAULT 1,
    precio_en_compra DECIMAL(10,2),
    FOREIGN KEY (id_pedido)   REFERENCES pedidos(id),
    FOREIGN KEY (id_producto) REFERENCES menu(id)
);

CREATE TABLE mercado (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre        VARCHAR(100),
    descripcion   TEXT,
    precio_puntos INTEGER,
    id_nivel_min  INTEGER,
    creado_en     DATETIME DEFAULT CURRENT_TIMESTAMP,
    img_src       VARCHAR(255) DEFAULT NULL,
    FOREIGN KEY (id_nivel_min) REFERENCES niveles(id)
);
INSERT INTO mercado VALUES(1,'Bebida Gratis','Refresco, agua, cerveza o similar.',200,1,'2026-03-25 20:27:39',NULL);
INSERT INTO mercado VALUES(2,'Café Especialidad','Café de especialidad preparado por barista.',150,1,'2026-03-25 20:27:39',NULL);
INSERT INTO mercado VALUES(3,'Tapa de la Casa','Tapa exclusiva disponible solo para clientes fidelizados.',350,1,'2026-03-25 20:27:39',NULL);
INSERT INTO mercado VALUES(4,'Postre Casero','Cualquiera de nuestros postres artesanales.',400,1,'2026-03-25 20:27:39',NULL);
INSERT INTO mercado VALUES(5,'Plato Principal','Un plato principal del menú habitual.',1200,2,'2026-03-25 20:27:39',NULL);
INSERT INTO mercado VALUES(6,'Menú Completo','Incluye entrante, principal y bebida.',1800,2,'2026-03-25 20:27:39',NULL);
INSERT INTO mercado VALUES(7,'Botella de Vino','Selección especial de nuestro sumiller.',1500,2,'2026-03-25 20:27:39',NULL);
INSERT INTO mercado VALUES(8,'Cena para Dos','Menú degustación para dos personas.',4000,3,'2026-03-25 20:27:39',NULL);
INSERT INTO mercado VALUES(9,'Experiencia con el Chef','Cocina con nuestro chef y aprende un plato estrella.',8000,3,'2026-03-25 20:27:39',NULL);

CREATE TABLE cartera (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    id_usuario  INTEGER,
    id_producto INTEGER,
    usado       BOOLEAN DEFAULT 0,
    anadido_en  DATETIME DEFAULT CURRENT_TIMESTAMP,
    usado_en    DATETIME,
    token_url   VARCHAR(255),
    expira_en   DATETIME,
    FOREIGN KEY (id_usuario)  REFERENCES usuarios(id),
    FOREIGN KEY (id_producto) REFERENCES mercado(id)
);
INSERT INTO cartera VALUES(1,7,1,0,'2026-03-25 23:11:35',NULL,'7-1-1774480295431',NULL);
INSERT INTO cartera VALUES(2,7,9,0,'2026-03-27 12:54:00',NULL,'7-9-1774616040517',NULL);
INSERT INTO cartera VALUES(3,7,5,0,'2026-03-27 12:54:35',NULL,'7-5-1774616075280',NULL);
INSERT INTO cartera VALUES(4,7,1,0,'2026-03-27 13:03:56',NULL,'7-1-1774616636520',NULL);
INSERT INTO cartera VALUES(5,7,1,0,'2026-03-27 13:06:37',NULL,'7-1-1774616797859',NULL);
INSERT INTO cartera VALUES(6,7,1,0,'2026-03-27 13:06:48',NULL,'7-1-1774616808391',NULL);
INSERT INTO cartera VALUES(7,7,2,0,'2026-03-27 13:06:54',NULL,'7-2-1774616814617',NULL);
INSERT INTO cartera VALUES(8,7,6,0,'2026-03-28 12:21:25',NULL,'7-6-1774700485504',NULL);
INSERT INTO cartera VALUES(9,7,9,0,'2026-03-28 12:21:31',NULL,'7-9-1774700491415',NULL);
INSERT INTO cartera VALUES(10,7,3,0,'2026-03-28 12:21:40',NULL,'7-3-1774700500880',NULL);
INSERT INTO cartera VALUES(11,7,3,0,'2026-03-28 12:21:41',NULL,'7-3-1774700501724',NULL);

CREATE TABLE tickets (
    id               INTEGER PRIMARY KEY AUTOINCREMENT,
    id_usuario       INTEGER,
    url_imagen       TEXT,
    contenido_json   TEXT,
    puntos_otorgados INTEGER,
    estado           VARCHAR(20),
    creado_en        DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_usuario) REFERENCES usuarios(id)
);

CREATE TABLE mesas (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre      VARCHAR(50),
    n_ocupantes INTEGER DEFAULT 2,
    activo      BOOLEAN DEFAULT 1
);
INSERT INTO mesas VALUES(1,'Terraza 1 (T1)',4,1);

CREATE TABLE mesas_reservadas (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    id_reserva INTEGER,
    id_mesa    INTEGER,
    creado_en  DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE resenas (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    id_plato    INTEGER,
    descripcion VARCHAR(50),
    puntuacion  INTEGER,
    creado_en   DATETIME DEFAULT CURRENT_TIMESTAMP,
    id_usuario  INTEGER REFERENCES usuarios(id)
);

PRAGMA writable_schema=ON;
CREATE TABLE IF NOT EXISTS sqlite_sequence(name,seq);
DELETE FROM sqlite_sequence;
INSERT INTO sqlite_sequence VALUES('niveles',3);
INSERT INTO sqlite_sequence VALUES('usuarios',9);
INSERT INTO sqlite_sequence VALUES('monedero',4);
INSERT INTO sqlite_sequence VALUES('transacciones_puntos',10);
INSERT INTO sqlite_sequence VALUES('categorias_menu',5);
INSERT INTO sqlite_sequence VALUES('menu',4);
INSERT INTO sqlite_sequence VALUES('reservas',4);
INSERT INTO sqlite_sequence VALUES('mercado',9);
INSERT INTO sqlite_sequence VALUES('cartera',11);
INSERT INTO sqlite_sequence VALUES('mesas',1);
PRAGMA writable_schema=OFF;

CREATE UNIQUE INDEX idx_usuarios_auth ON usuarios(id_usuario_auth);

COMMIT;