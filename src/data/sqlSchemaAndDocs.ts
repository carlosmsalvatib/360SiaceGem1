/**
 * Script SQL para MariaDB 10.5+ / 10.11+ y Documentación de Arquitectura
 * Base de Datos: db_360siace (Modelo SIAH)
 */

export const MARIADB_SQL_SCRIPT = `-- =========================================================================
-- ORGANIZACIÓN 360 SIACE (MODELO SIAH)
-- ESQUEMA DE BASE DE DATOS EMPRESARIAL PARA MARIADB
-- Dominio: www.360siace.com
-- Codificación: utf8mb4_unicode_ci | Motor: InnoDB | Concurrencia ACID
-- =========================================================================

CREATE DATABASE IF NOT EXISTS \`db_360siace\`
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE \`db_360siace\`;

-- Desactivar temporalmente revisión de claves foráneas para creación limpia
SET FOREIGN_KEY_CHECKS = 0;

-- -------------------------------------------------------------------------
-- 1. TABLA: roles
-- Define los niveles de acceso del personal y cooperantes al back-office SIAH
-- -------------------------------------------------------------------------
DROP TABLE IF EXISTS \`roles\`;
CREATE TABLE \`roles\` (
  \`id\` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  \`codigo\` VARCHAR(50) NOT NULL UNIQUE COMMENT 'SUPERADMIN, ADMIN, AUDITOR, EDITOR, CONSULTOR',
  \`nombre\` VARCHAR(100) NOT NULL,
  \`descripcion\` TEXT NULL,
  \`permisos_json\` JSON NOT NULL COMMENT 'Array JSON con códigos de permisos granulares',
  \`creado_en\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  \`actualizado_en\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -------------------------------------------------------------------------
-- 2. TABLA: usuarios
-- Cuentas de acceso al sistema con hash Argon2id / bcrypt y token de sesión
-- -------------------------------------------------------------------------
DROP TABLE IF EXISTS \`usuarios\`;
CREATE TABLE \`usuarios\` (
  \`id\` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  \`rol_id\` INT UNSIGNED NOT NULL,
  \`nombre\` VARCHAR(150) NOT NULL,
  \`email\` VARCHAR(191) NOT NULL UNIQUE,
  \`password_hash\` VARCHAR(255) NOT NULL COMMENT 'Argon2id o bcrypt hash seguro',
  \`avatar_url\` VARCHAR(255) NULL,
  \`estado\` ENUM('ACTIVO', 'INACTIVO', 'SUSPENDIDO') DEFAULT 'ACTIVO',
  \`ultimo_acceso\` DATETIME NULL,
  \`token_recuperacion\` VARCHAR(100) NULL,
  \`token_expiracion\` DATETIME NULL,
  \`intentos_fallidos\` TINYINT UNSIGNED DEFAULT 0,
  \`bloqueado_hasta\` DATETIME NULL,
  \`creado_en\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  \`actualizado_en\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT \`fk_usuarios_roles\` FOREIGN KEY (\`rol_id\`)
    REFERENCES \`roles\` (\`id\`) ON DELETE RESTRICT ON UPDATE CASCADE,
  INDEX \`idx_usuarios_email_estado\` (\`email\`, \`estado\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -------------------------------------------------------------------------
-- 3. TABLA: config_cms
-- Parámetros, copys y textos clave editables desde el CMS sin tocar código
-- -------------------------------------------------------------------------
DROP TABLE IF EXISTS \`config_cms\`;
CREATE TABLE \`config_cms\` (
  \`id\` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  \`clave\` VARCHAR(100) NOT NULL UNIQUE COMMENT 'Ej: hero_titulo, hero_parrafo_apoyo',
  \`seccion\` VARCHAR(50) NOT NULL COMMENT 'Ej: hero, por_que_elegirnos, contacto, global',
  \`tipo_dato\` ENUM('texto', 'texto_largo', 'html', 'json', 'imagen') DEFAULT 'texto',
  \`valor\` MEDIUMTEXT NOT NULL,
  \`descripcion_campo\` VARCHAR(255) NULL COMMENT 'Guía visual para el editor del CMS',
  \`actualizado_por\` INT UNSIGNED NULL,
  \`actualizado_en\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX \`idx_config_seccion\` (\`seccion\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -------------------------------------------------------------------------
-- 4. TABLA: areas_clave_servicios
-- Las 4 áreas troncales del menú desplegable de Servicios
-- -------------------------------------------------------------------------
DROP TABLE IF EXISTS \`areas_clave_servicios\`;
CREATE TABLE \`areas_clave_servicios\` (
  \`id\` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  \`slug\` VARCHAR(100) NOT NULL UNIQUE,
  \`numero_orden\` TINYINT UNSIGNED NOT NULL,
  \`nombre\` VARCHAR(150) NOT NULL,
  \`subtitulo\` VARCHAR(255) NOT NULL,
  \`descripcion\` TEXT NOT NULL,
  \`icono\` VARCHAR(50) DEFAULT 'Layers',
  \`metricas_destacadas\` VARCHAR(255) NULL,
  \`activo\` BOOLEAN DEFAULT TRUE,
  \`creado_en\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -------------------------------------------------------------------------
-- 5. TABLA: servicios
-- Catálogo de los 10 servicios especializados One-Stop-Shop
-- -------------------------------------------------------------------------
DROP TABLE IF EXISTS \`servicios\`;
CREATE TABLE \`servicios\` (
  \`id\` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  \`area_clave_id\` INT UNSIGNED NOT NULL,
  \`numero_servicio\` TINYINT UNSIGNED NOT NULL UNIQUE,
  \`slug\` VARCHAR(150) NOT NULL UNIQUE,
  \`titulo\` VARCHAR(200) NOT NULL,
  \`descripcion\` TEXT NOT NULL,
  \`entregables_json\` JSON NOT NULL COMMENT 'Lista de entregables auditables',
  \`normativas_referencia\` VARCHAR(255) NULL COMMENT 'ECHO, USAID CFR 200, Esfera, ISO',
  \`icono\` VARCHAR(50) DEFAULT 'FolderKanban',
  \`orden_visual\` INT UNSIGNED DEFAULT 1,
  \`activo\` BOOLEAN DEFAULT TRUE,
  \`creado_en\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  \`actualizado_en\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT \`fk_servicios_area\` FOREIGN KEY (\`area_clave_id\`)
    REFERENCES \`areas_clave_servicios\` (\`id\`) ON DELETE RESTRICT ON UPDATE CASCADE,
  INDEX \`idx_servicios_activo_orden\` (\`activo\`, \`orden_visual\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -------------------------------------------------------------------------
-- 6. TABLA: proyectos
-- Los proyectos estratégicos gestionados (alimentan el Carrusel 3D)
-- -------------------------------------------------------------------------
DROP TABLE IF EXISTS \`proyectos\`;
CREATE TABLE \`proyectos\` (
  \`id\` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  \`codigo_proyecto\` VARCHAR(50) NOT NULL UNIQUE,
  \`slug\` VARCHAR(150) NOT NULL UNIQUE,
  \`nombre\` VARCHAR(150) NOT NULL,
  \`subtitulo\` VARCHAR(255) NOT NULL,
  \`categoria\` VARCHAR(100) NOT NULL,
  \`descripcion_corta\` VARCHAR(500) NOT NULL,
  \`descripcion_larga\` MEDIUMTEXT NOT NULL,
  \`impacto_social\` TEXT NOT NULL,
  \`estado\` ENUM('PLANIFICACION', 'EN_EJECUCION', 'AUDITORIA', 'COMPLETADO') DEFAULT 'EN_EJECUCION',
  \`avance_porcentaje\` DECIMAL(5,2) DEFAULT 0.00,
  \`beneficiarios_directos\` INT UNSIGNED DEFAULT 0,
  \`inversion_estimada_usd\` DECIMAL(14,2) DEFAULT 0.00,
  \`ubicacion\` VARCHAR(200) NOT NULL,
  \`cooperantes_json\` JSON NULL COMMENT 'Lista de agencias cooperantes',
  \`imagen_url\` VARCHAR(255) NOT NULL,
  \`color_accent\` VARCHAR(20) DEFAULT '#1d4ed8',
  \`icono\` VARCHAR(50) DEFAULT 'FolderKanban',
  \`destacado_carrusel\` BOOLEAN DEFAULT TRUE,
  \`posicion_carrusel\` TINYINT UNSIGNED DEFAULT 1,
  \`creado_en\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  \`actualizado_en\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX \`idx_proyectos_carrusel\` (\`destacado_carrusel\`, \`posicion_carrusel\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -------------------------------------------------------------------------
-- 7. TABLA: profesionales
-- Ficha del equipo técnico y directivo gestionable vía CMS
-- -------------------------------------------------------------------------
DROP TABLE IF EXISTS \`profesionales\`;
CREATE TABLE \`profesionales\` (
  \`id\` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  \`nombre\` VARCHAR(150) NOT NULL,
  \`cargo\` VARCHAR(150) NOT NULL,
  \`departamento\` VARCHAR(100) NOT NULL,
  \`especialidad\` VARCHAR(255) NOT NULL,
  \`biografia\` TEXT NOT NULL,
  \`certificaciones_json\` JSON NULL,
  \`experiencia_anos\` TINYINT UNSIGNED DEFAULT 5,
  \`foto_url\` VARCHAR(255) NOT NULL,
  \`email_corporativo\` VARCHAR(191) NULL,
  \`linkedin_url\` VARCHAR(255) NULL,
  \`orden_visual\` INT UNSIGNED DEFAULT 1,
  \`activo\` BOOLEAN DEFAULT TRUE,
  \`creado_en\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  \`actualizado_en\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX \`idx_profesionales_orden\` (\`activo\`, \`orden_visual\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -------------------------------------------------------------------------
-- 8. TABLA: estadisticas_visitantes
-- Telemetría de uso del portal para el Dashboard analítico
-- -------------------------------------------------------------------------
DROP TABLE IF EXISTS \`estadisticas_visitantes\`;
CREATE TABLE \`estadisticas_visitantes\` (
  \`id\` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  \`ip_hash\` CHAR(64) NOT NULL COMMENT 'SHA-256 de IP + Salt para cumplimiento de privacidad',
  \`modulo_visitado\` VARCHAR(100) NOT NULL COMMENT 'Finanzas, Legal, Proyectos, 3D Carousel, etc.',
  \`ruta_url\` VARCHAR(255) NOT NULL,
  \`dispositivo\` ENUM('Desktop', 'Mobile', 'Tablet') DEFAULT 'Desktop',
  \`sistema_operativo\` VARCHAR(50) NULL,
  \`navegador\` VARCHAR(50) NULL,
  \`pais_codigo\` CHAR(2) DEFAULT 'US',
  \`tiempo_permanencia_seg\` INT UNSIGNED DEFAULT 0,
  \`fecha_visita\` DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX \`idx_visitas_modulo_fecha\` (\`modulo_visitado\`, \`fecha_visita\`),
  INDEX \`idx_visitas_fecha\` (\`fecha_visita\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -------------------------------------------------------------------------
-- 9. TABLA: contactos_leads
-- Solicitudes de contacto y asesoría back-office recibidas
-- -------------------------------------------------------------------------
DROP TABLE IF EXISTS \`contactos_leads\`;
CREATE TABLE \`contactos_leads\` (
  \`id\` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  \`nombre_completo\` VARCHAR(150) NOT NULL,
  \`organizacion\` VARCHAR(150) NOT NULL,
  \`email\` VARCHAR(191) NOT NULL,
  \`telefono\` VARCHAR(50) NULL,
  \`servicio_interes\` VARCHAR(100) NULL,
  \`mensaje\` TEXT NOT NULL,
  \`estado\` ENUM('NUEVO', 'EN_CONTACTO', 'COTIZADO', 'CERRADO') DEFAULT 'NUEVO',
  \`creado_en\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET FOREIGN_KEY_CHECKS = 1;

-- =========================================================================
-- DATOS SEMILLA BÁSICOS (SEED DATA)
-- =========================================================================

INSERT INTO \`roles\` (\`id\`, \`codigo\`, \`nombre\`, \`descripcion\`, \`permisos_json\`) VALUES
(1, 'SUPERADMIN', 'Super Administrador', 'Acceso total y configuración de infraestructura', '["*"]'),
(2, 'ADMIN', 'Director Operativo', 'Gestión de proyectos, servicios y contenido', '["cms:read", "cms:write", "projects:manage", "services:manage"]'),
(3, 'AUDITOR', 'Auditor de Campo / Fiduciario', 'Inspección documental y métricas de proyectos', '["projects:read", "audit:verify", "metrics:read"]'),
(4, 'CONSULTOR', 'Consultor Externo / Donante', 'Acceso de solo lectura a avances', '["projects:read", "services:read"]');

-- Usuario inicial: salvaticarlos@gmail.com (hash bcrypt estándar de demostración)
INSERT INTO \`usuarios\` (\`id\`, \`rol_id\`, \`nombre\`, \`email\`, \`password_hash\`, \`estado\`) VALUES
(1, 1, 'Ing. Carlos Salvatierra', 'salvaticarlos@gmail.com', '$2y$12$eX8mJ5W.O7X5i8uF7D9Iru2B6Z6Y3d5P0w/hOqG5uE5hE8fI5wR5y', 'ACTIVO'),
(2, 2, 'Dra. Valentina Mendoza', 'vmendoza@360siace.com', '$2y$12$eX8mJ5W.O7X5i8uF7D9Iru2B6Z6Y3d5P0w/hOqG5uE5hE8fI5wR5y', 'ACTIVO');

INSERT INTO \`areas_clave_servicios\` (\`id\`, \`slug\`, \`numero_orden\`, \`nombre\`, \`subtitulo\`, \`descripcion\`, \`icono\`, \`metricas_destacadas\`) VALUES
(1, 'finanzas-auditoria', 1, 'Finanzas y Auditoría', 'Auditoría concurrente y contabilidad multilateral', 'Supervisión en tiempo real de la ejecución financiera para evitar objeciones de gasto.', 'BadgeDollarSign', '$14.8M USD auditados sin una sola glosa'),
(2, 'legal-rrhh', 2, 'Legal y RRHH', 'Cumplimiento laboral y legal transfronterizo', 'Blindaje jurídico y gestión de talento humano en contextos de alto riesgo.', 'Scale', '100% contratos homologados OIT'),
(3, 'ingenieria-proyectos', 3, 'Ingeniería y Proyectos', 'Supervisión técnica y gestión integral de obra', 'Aseguramiento de calidad técnica en infraestructuras y cálculo estructural.', 'HardHat', '48 obras civiles certificadas'),
(4, 'it-telematica', 4, 'IT y Telemática', 'Conectividad y seguridad de datos humanitarios', 'Diseño de redes satelitales cifradas y soberanía tecnológica.', 'Network', '99.98% disponibilidad de red');

INSERT INTO \`config_cms\` (\`clave\`, \`seccion\`, \`tipo_dato\`, \`valor\`, \`descripcion_campo\`) VALUES
('hero_tagline', 'hero', 'texto', '360 SIACE • MODELO OPERATIVO SIAH', 'Antetítulo superior en el Hero principal'),
('hero_titulo', 'hero', 'texto', 'Tu \\'Back-Office\\' especializado para maximizar el impacto social', 'Título de impacto principal'),
('hero_parrafo_apoyo', 'hero', 'texto_largo', '¿Su organización humanitaria enfrenta el desafío de equilibrar la eficiencia administrativa con la urgencia de salvar vidas? SIAH es su aliado estratégico. Proveemos un ecosistema integral de soporte en auditoría concurrente, gestión contractual, gobernanza de datos y supervisión técnica en campo para organismos multilaterales (ECHO, USAID, ONU) y fundaciones de alto impacto.', 'Párrafo central de propuesta de valor'),
('cta_titulo', 'cta', 'texto', '¡Transforme la capacidad operativa de su organización hoy!', 'Llamado a la acción final');
`;

export const FOLDER_STRUCTURE_TEXT = `
360siace-webapp/
├── .htaccess                       # Redirección HTTPS forzada y headers de seguridad
├── robots.txt                      # Políticas de indexación
├── index.html                      # Landing page pública y frontend SPA
├── assets/
│   ├── css/
│   │   ├── custom-3d-carousel.css  # Transformaciones CSS 3D (Cubo/Rueda)
│   │   └── theme-variables.css     # Variables: Azul Marino a Azul Rey
│   ├── js/
│   │   ├── carousel-3d.js          # Controlador matemático del cubo/rueda 3D
│   │   ├── metrics-dashboard.js    # Renderizado y telemetría de estadísticas
│   │   └── main-landing.js         # Menú desplegable, scroll y animaciones
│   └── img/
│       ├── branding/               # Logos 360 SIACE y modelo SIAH
│       ├── proyectos/              # Imágenes de los 6 proyectos
│       └── equipo/                 # Fotografías de profesionales
├── api/                            # Backend REST / Endpoints PHP (o Node.js)
│   ├── config/
│   │   ├── database.php            # Conexión PDO segura a MariaDB (utf8mb4, SSL)
│   │   └── security.php            # Headers CORS, JWT y validación CSRF
│   ├── auth/
│   │   ├── login.php               # Endpoint de autenticación (Argon2id/Bcrypt)
│   │   └── verify-token.php        # Middleware de autorización por roles
│   ├── cms/
│   │   ├── get-config.php          # Lectura de textos dinámicos
│   │   └── update-config.php       # Guardado de textos y copys (SuperAdmin/Admin)
│   ├── proyectos/
│   │   ├── listar.php              # Obtiene los 6 proyectos para el Carrusel 3D
│   │   └── crud.php                # Crear, Actualizar y Eliminar proyectos
│   ├── servicios/
│   │   └── listar.php              # Catálogo de 10 servicios y 4 áreas clave
│   └── telemetria/
│       ├── registrar-visita.php    # Registro de módulo visitado (IP hash)
│       └── metricas-dashboard.php  # Agregación para el Dashboard en tiempo real
├── cms/                            # Panel de Administración (Back-Office)
│   ├── index.html                  # Panel de control protegido
│   ├── usuarios-roles.html         # CRUD de Usuarios y Roles
│   ├── proyectos-editor.html       # Editor del Carrusel 3D y Landing pages
│   └── servicios-editor.html       # Editor de los 10 servicios One-Stop-Shop
└── sql/
    └── schema_mariadb_360siace.sql # Script DDL completo para MariaDB
`;

export const DEPLOYMENT_GUIDE_TEXT = `
========================================================================
GUÍA DE DESPLIEGUE EN PRODUCCIÓN PARA WWW.360SIACE.COM
Hosting, MariaDB, Certificado SSL y Redirección HTTPS Forzada
========================================================================

PASO 1: APROVISIONAMIENTO DE BASE DE DATOS MARIADB
------------------------------------------------------------------------
1. Conéctese a su servidor Linux (Debian 12 / Ubuntu 22.04 LTS):
   $ ssh root@360siace.com

2. Instale MariaDB Server 10.11 LTS:
   $ sudo apt update && sudo apt install mariadb-server mariadb-client -y
   $ sudo mysql_secure_installation

3. Cree la base de datos y el usuario dedicado con privilegios mínimos:
   $ sudo mariadb -u root -p
   > CREATE DATABASE db_360siace CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   > CREATE USER 'usr_360siace'@'localhost' IDENTIFIED BY 'TuClaveSeguraAlfanumerica_2026!';
   > GRANT ALL PRIVILEGES ON db_360siace.* TO 'usr_360siace'@'localhost';
   > FLUSH PRIVILEGES;
   > EXIT;

4. Importe el esquema DDL y los datos semilla:
   $ mariadb -u usr_360siace -p db_360siace < /ruta/al/proyecto/sql/schema_mariadb_360siace.sql

PASO 2: CONFIGURACIÓN DEL SERVIDOR WEB (APACHE O NGINX)
------------------------------------------------------------------------
Opción A: Apache (.htaccess en la raíz de www.360siace.com):
<IfModule mod_rewrite.c>
    RewriteEngine On
    # Redirección HTTPS forzada
    RewriteCond %{HTTPS} off
    RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]
    
    # Prevenir acceso a directorios
    Options -Indexes
    
    # Headers de seguridad HSTS y CSP
    Header always set Strict-Transport-Security "max-age=31536000; includeSubDomains; preload"
    Header always set X-Frame-Options "SAMEORIGIN"
    Header always set X-Content-Type-Options "nosniff"
</IfModule>

Opción B: Nginx (/etc/nginx/sites-available/360siace.com):
server {
    listen 80;
    listen [::]:80;
    server_name 360siace.com www.360siace.com;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name 360siace.com www.360siace.com;
    root /var/www/360siace/dist;
    index index.html index.php;

    ssl_certificate /etc/letsencrypt/live/360siace.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/360siace.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api/ {
        try_files $uri $uri/ /api/index.php?$query_string;
    }
}

PASO 3: CERTIFICADO SSL GRATUITO Y AUTOMATIZADO CON LET'S ENCRYPT
------------------------------------------------------------------------
1. Instale Certbot y el plugin de Nginx/Apache:
   $ sudo apt install certbot python3-certbot-nginx -y

2. Obtenga el certificado SSL forzando redirección HTTPS:
   $ sudo certbot --nginx -d 360siace.com -d www.360siace.com

3. Pruebe la renovación automática con systemd timer:
   $ sudo certbot renew --dry-run
`;
