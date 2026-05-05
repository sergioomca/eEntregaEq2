-- ============================================================
--  eEntregaEq - Script de Creación de Base de Datos MySQL
--  Fecha: 2026-05-01
--  Descripción: Crea la BD completa con todos los datos
--               iniciales equivalentes al modo TEST.
-- ============================================================

-- 1. CREAR Y SELECCIONAR BASE DE DATOS
-- ============================================================
CREATE DATABASE IF NOT EXISTS eentrega_eq
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

USE eentrega_eq;

-- ============================================================
-- 2. TABLAS PRINCIPALES
-- ============================================================

-- 2.1 USUARIOS
CREATE TABLE IF NOT EXISTS usuarios (
    legajo                VARCHAR(50)  NOT NULL,
    nombreCompleto        VARCHAR(200) NOT NULL,
    sector                VARCHAR(100),
    password              VARCHAR(200),
    huellaDigital         VARCHAR(500),
    mustChangePassword    BOOLEAN      NOT NULL DEFAULT FALSE,
    failedLoginAttempts   INT          NOT NULL DEFAULT 0,
    isAccountLocked       BOOLEAN      NOT NULL DEFAULT FALSE,
    PRIMARY KEY (legajo)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2.2 ROLES POR USUARIO (colección ElementCollection de usuarios)
CREATE TABLE IF NOT EXISTS usuario_roles (
    id     INT          NOT NULL AUTO_INCREMENT,
    legajo VARCHAR(50)  NOT NULL,
    rol    VARCHAR(50)  NOT NULL,
    PRIMARY KEY (id),
    UNIQUE KEY uq_legajo_rol (legajo, rol),
    CONSTRAINT fk_roles_usuario FOREIGN KEY (legajo)
        REFERENCES usuarios (legajo) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2.3 EQUIPOS
CREATE TABLE IF NOT EXISTS equipos (
    tag         VARCHAR(50)  NOT NULL,
    descripcion VARCHAR(200) NOT NULL,
    estadoDcs   VARCHAR(30)  COMMENT 'HABILITADO | DESHABILITADO | PARADO | EN_MARCHA',
    condicion   VARCHAR(30)  COMMENT 'BLOQUEADO | DESBLOQUEADO',
    PRIMARY KEY (tag)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2.4 PERMISOS DE TRABAJO SEGURO (PTS)
CREATE TABLE IF NOT EXISTS permisos_trabajo_seguro (
    id                              VARCHAR(50)   NOT NULL,
    equipoOInstalacion              VARCHAR(50),
    descripcionTrabajo              VARCHAR(500),
    solicitanteLegajo               VARCHAR(50),
    nombreSolicitante               VARCHAR(200),
    supervisorLegajo                VARCHAR(50),
    receptorLegajo                  VARCHAR(50),
    nombreReceptor                  VARCHAR(200),
    fechaInicio                     VARCHAR(20),
    fechaFin                        VARCHAR(20),
    horaInicio                      VARCHAR(10),
    horaFin                         VARCHAR(10),
    ubicacion                       VARCHAR(200),
    tareaDetallada                  LONGTEXT,
    tipoTrabajo                     VARCHAR(100),
    requiereAnalisisRiesgoAdicional  BOOLEAN NOT NULL DEFAULT FALSE,
    requiereRTO                     BOOLEAN NOT NULL DEFAULT FALSE,
    firmaSupervisorBase64           LONGTEXT,
    dniSupervisorFirmante           VARCHAR(50),
    fechaHoraFirmaSupervisor        DATETIME,
    rtoEstado                       VARCHAR(30)   COMMENT 'STANDBY | PENDIENTE | FIRMADO_PEND_CIERRE | CERRADO | CANCELADO',
    rtoObservaciones                VARCHAR(500),
    rtoResponsableCierreLegajo      VARCHAR(50),
    rtoFechaHoraCierre              DATETIME,
    rtoAsociadoId                   VARCHAR(50),
    PRIMARY KEY (id),
    CONSTRAINT fk_pts_equipo        FOREIGN KEY (equipoOInstalacion)         REFERENCES equipos  (tag)    ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT fk_pts_solicitante   FOREIGN KEY (solicitanteLegajo)          REFERENCES usuarios (legajo) ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT fk_pts_supervisor    FOREIGN KEY (supervisorLegajo)           REFERENCES usuarios (legajo) ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT fk_pts_receptor      FOREIGN KEY (receptorLegajo)             REFERENCES usuarios (legajo) ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT fk_pts_responsable   FOREIGN KEY (rtoResponsableCierreLegajo) REFERENCES usuarios (legajo) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2.5 RIESGOS Y CONTROLES POR PTS
CREATE TABLE IF NOT EXISTS pts_riesgos_controles (
    id               INT          NOT NULL AUTO_INCREMENT,
    pts_id           VARCHAR(50)  NOT NULL,
    peligro          VARCHAR(500),
    consecuencia     VARCHAR(500),
    controlRequerido VARCHAR(500),
    PRIMARY KEY (id),
    CONSTRAINT fk_rc_pts FOREIGN KEY (pts_id)
        REFERENCES permisos_trabajo_seguro (id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2.6 EQUIPOS DE SEGURIDAD POR PTS
CREATE TABLE IF NOT EXISTS pts_equipos_seguridad (
    id              INT          NOT NULL AUTO_INCREMENT,
    pts_id          VARCHAR(50)  NOT NULL,
    equipo          VARCHAR(200),
    esRequerido     BOOLEAN      NOT NULL DEFAULT FALSE,
    esProporcionado BOOLEAN      NOT NULL DEFAULT FALSE,
    observacion     VARCHAR(500),
    PRIMARY KEY (id),
    CONSTRAINT fk_es_pts FOREIGN KEY (pts_id)
        REFERENCES permisos_trabajo_seguro (id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2.7 RETORNO A OPERACIONES (RTO)
CREATE TABLE IF NOT EXISTS retorno_operaciones (
    id            VARCHAR(50) NOT NULL,
    equipoTag     VARCHAR(50),
    estado        VARCHAR(30),
    fechaCreacion DATETIME    NOT NULL,
    fechaCierre   DATETIME,
    observaciones LONGTEXT,
    PRIMARY KEY (id),
    CONSTRAINT fk_rto_equipo FOREIGN KEY (equipoTag)
        REFERENCES equipos (tag) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2.8 RELACIÓN RTO ↔ PTS (lista de PTS asociados a un RTO)
CREATE TABLE IF NOT EXISTS rto_pts_ids (
    id     INT         NOT NULL AUTO_INCREMENT,
    rto_id VARCHAR(50) NOT NULL,
    pts_id VARCHAR(50) NOT NULL,
    PRIMARY KEY (id),
    UNIQUE KEY uq_rto_pts (rto_id, pts_id),
    CONSTRAINT fk_rp_rto FOREIGN KEY (rto_id)
        REFERENCES retorno_operaciones (id) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_rp_pts FOREIGN KEY (pts_id)
        REFERENCES permisos_trabajo_seguro (id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2.9 ESPECIALIDADES POR RTO
CREATE TABLE IF NOT EXISTS rto_especialidades (
    id                 INT         NOT NULL AUTO_INCREMENT,
    rto_id             VARCHAR(50) NOT NULL,
    nombre             VARCHAR(100),
    responsableLegajo  VARCHAR(50),
    cerrada            BOOLEAN     NOT NULL DEFAULT FALSE,
    fechaCierre        DATETIME,
    observaciones      LONGTEXT,
    PRIMARY KEY (id),
    CONSTRAINT fk_re_rto          FOREIGN KEY (rto_id)            REFERENCES retorno_operaciones (id) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_re_responsable  FOREIGN KEY (responsableLegajo) REFERENCES usuarios (legajo)        ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;



-- ============================================================
-- 3. DATOS INICIALES
-- ============================================================

-- ============================================================
-- 3.1 USUARIOS
--     Contraseña por defecto = legajo (solo para seed inicial/local)
--     En el backend actual las contraseñas se persisten codificadas con PBKDF2.
-- ============================================================
INSERT INTO usuarios (legajo, nombreCompleto, sector, password, mustChangePassword, failedLoginAttempts, isAccountLocked) VALUES
('VINF011422', 'Sergio Capella',     'Control de Proceso',       'VINF011422', FALSE, 0, FALSE),
('SUP222',     'Carlos Supervisión', 'Supervisión de Planta',    'SUP222',     FALSE, 0, FALSE),
('EJE444',     'Ana Ejecutante',     'Mantenimiento Eléctrico',  'EJE444',     FALSE, 0, FALSE),
('ADM999',     'Admin Sistema',      'IT',                       'ADM999',     FALSE, 0, FALSE),
('RTO001',     'Pedro Mantenimiento','Mantenimiento Mecánico',   'RTO001',     FALSE, 0, FALSE),
('12345',      'Juan Pérez',         'Operaciones Planta',       '12345',      FALSE, 0, FALSE),
('54321',      'Ana Gómez',          'Mantenimiento Eléctrico',  '54321',      FALSE, 0, FALSE),
('98765',      'Carlos Sanchez',     'Seguridad e Higiene',      '98765',      FALSE, 0, FALSE),
('11111',      'María Rodriguez',    'Control de Calidad',       '11111',      FALSE, 0, FALSE),
('REC001',     'Luis Fernández',     'Operaciones Planta',       'REC001',     FALSE, 0, FALSE),
('REC002',     'Roberto Díaz',       'Mantenimiento Mecánico',   'REC002',     FALSE, 0, FALSE),
('REC003',     'Patricia Morales',   'Mantenimiento Eléctrico',  'REC003',     FALSE, 0, FALSE),
('REC004',     'Gabriel Torres',     'Producción',               'REC004',     FALSE, 0, FALSE),
('REC005',     'Sandra Vega',        'Control de Proceso',       'REC005',     FALSE, 0, FALSE);

-- 3.2 ROLES DE USUARIOS
INSERT INTO usuario_roles (legajo, rol) VALUES
('VINF011422', 'ROLE_EMISOR'),
('SUP222',     'ROLE_SUPERVISOR'),
('EJE444',     'ROLE_EJECUTANTE'),
('ADM999',     'ROLE_ADMIN'),
('RTO001',     'ROLE_RTO_MANT'),
('12345',      'ROLE_EMISOR'),
('54321',      'ROLE_EJECUTANTE'),
('98765',      'ROLE_SUPERVISOR'),
('98765',      'ROLE_EMISOR'),
('11111',      'ROLE_EMISOR'),
('REC001',     'ROLE_RECEPTOR'),
('REC002',     'ROLE_RECEPTOR'),
('REC003',     'ROLE_RECEPTOR'),
('REC004',     'ROLE_RECEPTOR'),
('REC005',     'ROLE_RECEPTOR');

-- ============================================================
-- 3.3 EQUIPOS
--     EstadoDcs:  HABILITADO | DESHABILITADO | PARADO | EN_MARCHA
--     Condicion:  BLOQUEADO  | DESBLOQUEADO
-- ============================================================
INSERT INTO equipos (tag, descripcion, estadoDcs, condicion) VALUES
('K7451',  'Compresor de aire de instrumentos',  'HABILITADO',   'DESBLOQUEADO'),
('F1002A', 'Bomba de refrigeración Torre 1',      'PARADO',       'DESBLOQUEADO'),
('R301',   'Reactor Principal Polietileno',        'EN_MARCHA',    'DESBLOQUEADO'),
('P5511',  'Bomba A de agua caliente',             'HABILITADO',   'DESBLOQUEADO'),
('P5512',  'Bomba B de agua caliente',             'HABILITADO',   'DESBLOQUEADO'),
('P22401', 'Bomba de inyeccion',                   'PARADO',       'DESBLOQUEADO'),
('V5533',  'Almacenamiento acido',                 'DESHABILITADO','DESBLOQUEADO'),
('V2633',  'Almacenamiento solvente',              'DESHABILITADO','DESBLOQUEADO'),
('MX2233', 'Mezclador en linea',                   'EN_MARCHA',    'DESBLOQUEADO'),
('V1231',  'Reservorio aceite',                    'HABILITADO',   'DESBLOQUEADO');

-- ============================================================
-- 3.4 PERMISOS DE TRABAJO SEGURO (PTS) - Datos de prueba iniciales
--     rtoEstado: STANDBY | PENDIENTE | FIRMADO_PEND_CIERRE | CERRADO | CANCELADO
-- ============================================================
INSERT INTO permisos_trabajo_seguro (
    id, equipoOInstalacion, descripcionTrabajo,
    solicitanteLegajo, nombreSolicitante,
    supervisorLegajo,
    fechaInicio, fechaFin, horaInicio, horaFin,
    ubicacion, tareaDetallada, tipoTrabajo,
    requiereAnalisisRiesgoAdicional, requiereRTO,
    rtoEstado
) VALUES
(
    'PTS-251107-001',
    'F1002A',
    'Mantenimiento de equipo eléctrico',
    '12345',  'Juan Pérez',
    'SUP222',
    '2025-11-07', '2025-11-07', '08:00', '12:00',
    'Sala de máquinas',
    'Revisión y mantenimiento preventivo del sistema eléctrico de la bomba de refrigeración. Incluye medición de aislamientos y limpieza de bornes.',
    'ELECTRICO',
    FALSE, FALSE,
    'PENDIENTE'
),
(
    'PTS-251108-001',
    'R301',
    'Reparación de tubería',
    '54321', 'Ana Gómez',
    'SUP222',
    '2025-11-08', '2025-11-08', '09:00', '17:00',
    'Área de producción',
    'Reemplazo de tramo de tubería de 2 pulgadas en línea de alimentación del reactor. Se requiere vaciado previo y liberación de presión.',
    'MECANICO',
    TRUE, FALSE,
    'CERRADO'
),
(
    'PTS-251107-002',
    'P5511',
    'Inspección de bomba secundaria',
    'VINF011422', 'Sergio Capella',
    'SUP222',
    '2025-11-07', '2025-11-07', '10:00', '13:00',
    'Planta de tratamiento',
    'Inspección visual y medición de vibraciones de la bomba A de agua caliente. Verificación de sellos y rodamientos.',
    'INSPECCION',
    FALSE, FALSE,
    'PENDIENTE'
);

-- ============================================================
-- 3.5 RIESGOS Y CONTROLES de los PTS de prueba
-- ============================================================
INSERT INTO pts_riesgos_controles (pts_id, peligro, consecuencia, controlRequerido) VALUES
('PTS-251107-001', 'Contacto con energía eléctrica', 'Electrocución / quemaduras', 'Bloqueo y etiquetado LOTO. Verificar ausencia de tensión con multímetro.'),
('PTS-251107-001', 'Trabajo en espacio confinado',   'Intoxicación / asfixia',     'Medición de gases previo ingreso. Ventilación forzada.'),
('PTS-251108-001', 'Fluido a presión',                'Golpe por proyección',       'Verificar presión cero en línea antes de intervenir. Uso de careta facial.'),
('PTS-251108-001', 'Trabajo en altura',               'Caída de personas/objetos',  'Uso de arnés y línea de vida. Delimitar zona inferior.'),
('PTS-251107-002', 'Temperatura superficial elevada', 'Quemadura por contacto',     'Uso de guantes de alta temperatura. Verificar temperatura con termómetro IR.');

-- ============================================================
-- 3.6 EQUIPOS DE SEGURIDAD de los PTS de prueba
-- ============================================================
INSERT INTO pts_equipos_seguridad (pts_id, equipo, esRequerido, esProporcionado, observacion) VALUES
('PTS-251107-001', 'Casco de seguridad',     TRUE,  TRUE,  NULL),
('PTS-251107-001', 'Guantes dieléctricos',   TRUE,  TRUE,  'Clase 00 mínimo'),
('PTS-251107-001', 'Zapatos de seguridad',   TRUE,  TRUE,  NULL),
('PTS-251107-001', 'Multímetro calibrado',   TRUE,  FALSE, 'Traer propio'),
('PTS-251108-001', 'Casco de seguridad',     TRUE,  TRUE,  NULL),
('PTS-251108-001', 'Careta facial',          TRUE,  TRUE,  NULL),
('PTS-251108-001', 'Arnés de seguridad',     TRUE,  FALSE, 'Verificar fecha de vencimiento'),
('PTS-251108-001', 'Guantes de nitrilo',     TRUE,  TRUE,  NULL),
('PTS-251107-002', 'Casco de seguridad',     TRUE,  TRUE,  NULL),
('PTS-251107-002', 'Guantes alta temperatura', TRUE, TRUE, 'Min 250°C'),
('PTS-251107-002', 'Termómetro IR',          TRUE,  FALSE, 'Traer del almacén');


-- ============================================================
-- FIN DEL SCRIPT
-- ============================================================
-- Para ejecutar desde línea de comandos:
--   mysql -u root -p < eentrega_eq.sql
--
-- Para ejecutar desde MySQL Workbench:
--   Archivo > Open SQL Script > seleccionar este .sql > ejecutar ▶
--
-- Verificar que se creó todo:
--   USE eentrega_eq;
--   SHOW TABLES;
--   SELECT * FROM usuarios;
--   SELECT * FROM equipos;
-- ============================================================
