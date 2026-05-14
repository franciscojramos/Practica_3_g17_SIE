-- Modelo físico BookAR (Grupo 17) — MariaDB / MySQL

SET NAMES utf8mb4;

-- 1. IDENTIDAD CORPORATIVA
CREATE TABLE IF NOT EXISTS EMPRESA (
    id_empresa INT PRIMARY KEY,
    nombre VARCHAR(100),
    mision TEXT,
    vision TEXT,
    socios TEXT,
    color_primario VARCHAR(7),
    color_secundario VARCHAR(7)
);

-- 2. GESTIÓN DE CLIENTES
CREATE TABLE IF NOT EXISTS CLIENTE (
    id_cliente INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    nif_cif VARCHAR(15)
);

-- 3. CATÁLOGO E INVENTARIO
CREATE TABLE IF NOT EXISTS PRODUCTO (
    gtin VARCHAR(14) PRIMARY KEY,
    nombre_producto VARCHAR(100) NOT NULL,
    asignatura VARCHAR(50),
    precio DECIMAL(10, 2) NOT NULL,
    stock_actual INT NOT NULL CHECK (stock_actual >= 0),
    imagen_url VARCHAR(255)
);

-- 4. TRANSACCIONES Y CIERRE DE CICLO
CREATE TABLE IF NOT EXISTS VENTA (
    id_venta INT AUTO_INCREMENT PRIMARY KEY,
    id_cliente INT,
    fecha DATETIME DEFAULT CURRENT_TIMESTAMP,
    total DECIMAL(10, 2),
    FOREIGN KEY (id_cliente) REFERENCES CLIENTE (id_cliente)
);

CREATE TABLE IF NOT EXISTS DETALLE_VENTA (
    id_detalle INT AUTO_INCREMENT PRIMARY KEY,
    id_venta INT,
    gtin_producto VARCHAR(14),
    cantidad INT NOT NULL,
    precio_unitario DECIMAL(10, 2),
    FOREIGN KEY (id_venta) REFERENCES VENTA (id_venta),
    FOREIGN KEY (gtin_producto) REFERENCES PRODUCTO (gtin)
);

-- Datos iniciales — identidad (Grupo 17)
-- Limpiamos si hubiera datos previos
TRUNCATE TABLE EMPRESA;

INSERT INTO EMPRESA (id_empresa, nombre, mision, vision, socios, color_primario, color_secundario)
VALUES (
    1,
    'BookAR S.L.',
    'Fabricamos libros con realidad aumentada para estudiantes y centros educativos, mediante la integración de software propio, fusionando un producto tangible con tecnología interactiva, proporcionando a estudiantes y docentes herramientas educativas innovadoras que transforman el estudio tradicional en una experiencia inmersiva y dinámica.',
    'Ser la empresa que lidere la transición global hacia la educación híbrida, posicionándonos como la editorial tecnológica referente para el mundo educativo.',
    'Santiago Perez Delgado, Francisco José Ramos Moya, Santiago Díaz Sabio, Emilio Román Nuñez Hurtado',
    '#004B7A', -- Azul Corporativo
    '#F58220' -- Naranja AR
);

-- Catálogo oficial (12 SKUs). TRUNCATE de PRODUCTO requiere vaciar antes ventas que referencian GTIN.
SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE DETALLE_VENTA;
TRUNCATE TABLE VENTA;
TRUNCATE TABLE PRODUCTO;
SET FOREIGN_KEY_CHECKS = 1;

INSERT INTO PRODUCTO (gtin, nombre_producto, asignatura, precio, stock_actual, imagen_url) VALUES
('8412345671012', 'Anatomía - Individual', 'Anatomía', 25.00, 50, NULL),
('8412345672019', 'Anatomía - Pack Escolar', 'Anatomía', 550.00, 10, NULL),
('8412345671029', 'Historia - Individual', 'Historia', 25.00, 45, NULL),
('8412345672026', 'Historia - Pack Escolar', 'Historia', 550.00, 8, NULL),
('8412345671036', 'Nat. Animal - Individual', 'Biología', 25.00, 60, NULL),
('8412345672033', 'Nat. Animal - Pack Escolar', 'Biología', 550.00, 12, NULL),
('8412345671043', 'Química - Individual', 'Química', 25.00, 40, NULL),
('8412345672040', 'Química - Pack Escolar', 'Química', 550.00, 5, NULL),
('8412345671050', 'Nat. Vegetal - Individual', 'Biología', 25.00, 55, NULL),
('8412345672057', 'Nat. Vegetal - Pack Escolar', 'Biología', 550.00, 9, NULL),
('8412345671067', 'Deportes - Individual', 'Ed. Física', 25.00, 70, NULL),
('8412345672064', 'Deportes - Pack Escolar', 'Ed. Física', 550.00, 15, NULL);
