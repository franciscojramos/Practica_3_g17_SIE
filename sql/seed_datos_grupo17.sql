-- Datos de identidad + catálogo oficial BookAR (Grupo 17)
-- Ejecutar con las tablas ya creadas (p. ej. tras CREATE del schema principal).
-- mysql -u USER -p DB_NAME < sql/seed_datos_grupo17.sql

SET NAMES utf8mb4;

TRUNCATE TABLE EMPLEADO;
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

INSERT INTO EMPLEADO (nombre, apellidos, foto_url, puesto, bio) VALUES
('Santiago',      'Pérez Delgado',  NULL, 'CEO & Co-fundador',  'Apasionado por transformar la educación mediante la tecnología. Lidero la visión estratégica de BookAR y las relaciones con centros educativos.'),
('Francisco José','Ramos Moya',     NULL, 'CTO & Co-fundador',  'Arquitecto del motor de realidad aumentada que da vida a nuestros libros. Experto en desarrollo de software e integración AR.'),
('Santiago',      'Díaz Sabio',     NULL, 'COO & Co-fundador',  'Gestiono las operaciones y los acuerdos con instituciones educativas. Mi misión: llevar BookAR a cada aula de España.'),
('Emilio Román',  'Nuñez Hurtado',  NULL, 'CMO & Co-fundador',  'Responsable de la estrategia de marca y la experiencia de cliente. Creo firmemente en el poder de la educación inmersiva.');

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
