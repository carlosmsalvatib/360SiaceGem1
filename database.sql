-- ============================================
-- BASE DE DATOS: consultoria_mof -> CÓDIGO-58
-- SISTEMA DE GESTIÓN CÓDIGO-58 v2.0
-- ============================================

CREATE DATABASE IF NOT EXISTS consultoria_mof;
USE consultoria_mof;

-- ============================================
-- TABLA: usuarios (para autenticación)
-- ============================================
CREATE TABLE IF NOT EXISTS usuarios (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nombre VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    rol ENUM('direccion', 'consultor', 'gestor_legal', 'comercial') NOT NULL,
    activo BOOLEAN DEFAULT TRUE,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ultimo_acceso TIMESTAMP NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================
-- TABLA: clientes (Emprendedores)
-- ============================================
CREATE TABLE IF NOT EXISTS clientes (
    id INT PRIMARY KEY AUTO_INCREMENT,
    identificacion VARCHAR(50) NULL,
    nombre_completo VARCHAR(150) NOT NULL,
    email VARCHAR(100) NOT NULL,
    telefono VARCHAR(20),
    direccion TEXT,
    nombre_empresa VARCHAR(150),
    servicios_ofrecidos TEXT NULL,
    industria VARCHAR(50),
    status ENUM('prospecto', 'activo', 'en_consulta', 'en_legalizacion', 'finalizado') DEFAULT 'prospecto',
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    usuario_id_creacion INT,
    FOREIGN KEY (usuario_id_creacion) REFERENCES usuarios(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================
-- TABLA: asesorias (sesiones de consultoría)
-- ============================================
CREATE TABLE IF NOT EXISTS asesorias (
    id INT PRIMARY KEY AUTO_INCREMENT,
    cliente_id INT NOT NULL,
    consultor_id INT NOT NULL,
    tipo ENUM('diagnostico', 'seguimiento', 'cierre') NOT NULL,
    fecha_programada DATETIME NOT NULL,
    fecha_realizada DATETIME NULL,
    duracion_minutos INT DEFAULT 60,
    tema TEXT,
    observaciones TEXT,
    status ENUM('programada', 'realizada', 'cancelada') DEFAULT 'programada',
    FOREIGN KEY (cliente_id) REFERENCES clientes(id),
    FOREIGN KEY (consultor_id) REFERENCES usuarios(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================
-- TABLA: formularios_diagnostico (FDI)
-- ============================================
CREATE TABLE IF NOT EXISTS formularios_diagnostico (
    id INT PRIMARY KEY AUTO_INCREMENT,
    cliente_id INT NOT NULL,
    consultor_id INT NOT NULL,
    fecha_aplicacion DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    -- Sección 1: Datos del Emprendedor
    motivacion VARCHAR(50),
    experiencia VARCHAR(50),
    disponibilidad VARCHAR(50),
    
    -- Sección 2: Idea de Negocio
    descripcion_negocio TEXT,
    problema_resuelve TEXT,
    publico_objetivo TEXT,
    propuesta_valor TEXT,
    
    -- Sección 3: Análisis de Mercado
    competidores TEXT,
    diferenciacion TEXT,
    tamano_mercado VARCHAR(50),
    
    -- Sección 4: Finanzas
    inversion_inicial DECIMAL(15,2),
    punto_equilibrio DECIMAL(15,2),
    proyeccion_ventas TEXT,
    
    -- Sección 5: Estructura
    estructura_propuesta TEXT,
    recursos_necesarios TEXT,
    
    recomendaciones TEXT,
    status ENUM('borrador', 'completado', 'aprobado') DEFAULT 'borrador',
    FOREIGN KEY (cliente_id) REFERENCES clientes(id),
    FOREIGN KEY (consultor_id) REFERENCES usuarios(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================
-- TABLA: procesos_legales
-- ============================================
CREATE TABLE IF NOT EXISTS procesos_legales (
    id INT PRIMARY KEY AUTO_INCREMENT,
    cliente_id INT NOT NULL,
    gestor_id INT NOT NULL,
    tipo_proceso VARCHAR(50) NOT NULL,
    nombre_comercial VARCHAR(150),
    documento_identidad VARCHAR(50),
    estado VARCHAR(50),
    fecha_inicio DATETIME DEFAULT CURRENT_TIMESTAMP,
    fecha_finalizacion DATETIME NULL,
    observaciones TEXT,
    status ENUM('pendiente', 'en_proceso', 'completado', 'rechazado') DEFAULT 'pendiente',
    FOREIGN KEY (cliente_id) REFERENCES clientes(id),
    FOREIGN KEY (gestor_id) REFERENCES usuarios(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================
-- TABLA: documentos_legales
-- ============================================
CREATE TABLE IF NOT EXISTS documentos_legales (
    id INT PRIMARY KEY AUTO_INCREMENT,
    proceso_legal_id INT NOT NULL,
    tipo_documento VARCHAR(50) NOT NULL,
    nombre_archivo VARCHAR(255) NOT NULL,
    ruta_archivo VARCHAR(500) NOT NULL,
    version INT DEFAULT 1,
    fecha_subida TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    usuario_id_subio INT,
    status ENUM('borrador', 'pendiente_revision', 'aprobado', 'entregado') DEFAULT 'borrador',
    FOREIGN KEY (proceso_legal_id) REFERENCES procesos_legales(id),
    FOREIGN KEY (usuario_id_subio) REFERENCES usuarios(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================
-- TABLA: contratos
-- ============================================
CREATE TABLE IF NOT EXISTS contratos (
    id INT PRIMARY KEY AUTO_INCREMENT,
    cliente_id INT NOT NULL,
    comercial_id INT NOT NULL,
    numero_contrato VARCHAR(50) UNIQUE NOT NULL,
    fecha_firma DATE NOT NULL,
    monto_total DECIMAL(15,2) NOT NULL,
    anticipo DECIMAL(15,2) NOT NULL,
    saldo_pendiente DECIMAL(15,2) NOT NULL,
    fecha_anticipo DATE,
    fecha_inicio_servicio DATE,
    fecha_fin_servicio DATE,
    estado_pago ENUM('pendiente', 'parcial', 'pagado') DEFAULT 'pendiente',
    estado_contrato ENUM('activo', 'completado', 'cancelado') DEFAULT 'activo',
    condiciones TEXT,
    observaciones TEXT,
    FOREIGN KEY (cliente_id) REFERENCES clientes(id),
    FOREIGN KEY (comercial_id) REFERENCES usuarios(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================
-- TABLA: pagos
-- ============================================
CREATE TABLE IF NOT EXISTS pagos (
    id INT PRIMARY KEY AUTO_INCREMENT,
    contrato_id INT NOT NULL,
    monto DECIMAL(15,2) NOT NULL,
    fecha_pago DATE NOT NULL,
    metodo_pago ENUM('efectivo', 'transferencia', 'tarjeta', 'otros') NOT NULL,
    referencia VARCHAR(100),
    comprobante VARCHAR(255),
    status ENUM('pendiente', 'verificado', 'rechazado') DEFAULT 'pendiente',
    FOREIGN KEY (contrato_id) REFERENCES contratos(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================
-- TABLA: interacciones
-- ============================================
CREATE TABLE IF NOT EXISTS interacciones (
    id INT PRIMARY KEY AUTO_INCREMENT,
    cliente_id INT NOT NULL,
    usuario_id INT NOT NULL,
    tipo VARCHAR(50) NOT NULL,
    canal VARCHAR(50),
    fecha_hora DATETIME DEFAULT CURRENT_TIMESTAMP,
    descripcion TEXT,
    seguimiento BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (cliente_id) REFERENCES clientes(id),
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================
-- TABLA: configuracion_sistema
-- ============================================
CREATE TABLE IF NOT EXISTS configuracion_sistema (
    id INT PRIMARY KEY AUTO_INCREMENT,
    clave VARCHAR(50) UNIQUE NOT NULL,
    valor TEXT NOT NULL,
    descripcion VARCHAR(255),
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================
-- TABLA: modulos_sistema (CMS)
-- ============================================
CREATE TABLE IF NOT EXISTS modulos_sistema (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nombre VARCHAR(100) NOT NULL,
    slug VARCHAR(50) UNIQUE NOT NULL,
    icono VARCHAR(50) DEFAULT 'fas fa-cube',
    descripcion TEXT,
    activo TINYINT(1) DEFAULT 1,
    orden INT DEFAULT 0,
    roles_permitidos VARCHAR(255) DEFAULT 'direccion,consultor,gestor_legal,comercial',
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================
-- TABLA: catalogo_servicios
-- ============================================
CREATE TABLE IF NOT EXISTS catalogo_servicios (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nombre VARCHAR(100) NOT NULL,
    categoria VARCHAR(100),
    descripcion TEXT,
    activo TINYINT(1) DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================
-- DATOS INICIALES
-- ============================================

-- Usuarios por defecto
INSERT INTO usuarios (nombre, email, password, rol) VALUES 
('Administrador', 'admin@consultoria.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'direccion'),
('Consultor 1', 'consultor@consultoria.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'consultor'),
('Gestor Legal', 'legal@consultoria.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'gestor_legal'),
('Comercial', 'comercial@consultoria.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'comercial')
ON DUPLICATE KEY UPDATE nombre=VALUES(nombre);

-- Configuración inicial
INSERT INTO configuracion_sistema (clave, valor, descripcion) VALUES
('nombre_empresa', 'Código-58', 'Nombre de la empresa'),
('sistema_titulo', 'Sistema de Gestión Código-58', 'Título del sistema'),
('version_sistema', '2.0', 'Versión del sistema'),
('lema', 'Soluciones Estratégicas y Gestión para Emprendedores', 'Lema corporativo'),
('email_contacto', 'contacto@codigo58.com', 'Correo de contacto general'),
('telefono_contacto', '+58 (0212) 555-0158', 'Teléfono principal'),
('direccion_oficina', 'Av. Francisco de Miranda, Centro Empresarial Código-58', 'Dirección física'),
('dias_plazo_legal', '15', 'Días plazo para procesos legales'),
('porcentaje_anticipo', '50', 'Porcentaje de anticipo requerido')
ON DUPLICATE KEY UPDATE valor=VALUES(valor);

-- Módulos del Sistema (CMS)
INSERT INTO modulos_sistema (id, nombre, slug, icono, descripcion, activo, orden, roles_permitidos) VALUES
(1, 'Dashboard', 'dashboard', 'fas fa-chart-pie', 'Panel principal con métricas ejecutivas', 1, 1, 'direccion,consultor,gestor_legal,comercial'),
(2, 'Directorio de Emprendedores', 'directorio', 'fas fa-address-book', 'Buscador y directorio de emprendedores y servicios', 1, 2, 'direccion,consultor,gestor_legal,comercial'),
(3, 'Emprendedores', 'clientes', 'fas fa-user-tie', 'Gestión integral de expedientes de emprendedores', 1, 3, 'direccion,consultor,gestor_legal,comercial'),
(4, 'Asesorías', 'asesorias', 'fas fa-calendar-alt', 'Sesiones de consultoría, diagnóstico y seguimiento', 1, 4, 'direccion,consultor'),
(5, 'Procesos Legales', 'legales', 'fas fa-gavel', 'Gestión de trámites legales y expedientes jurídicos', 1, 5, 'direccion,gestor_legal'),
(6, 'Contratos & Pagos', 'contratos', 'fas fa-file-contract', 'Contrataciones comerciales, cobros y comprobantes', 1, 6, 'direccion,comercial'),
(7, 'Reportes & Estadísticas', 'reportes', 'fas fa-chart-bar', 'Métricas analíticas, gráficos y reportes gerenciales', 1, 7, 'direccion,comercial')
ON DUPLICATE KEY UPDATE nombre=VALUES(nombre), activo=VALUES(activo);

-- Catálogo de Servicios Inicial
INSERT INTO catalogo_servicios (nombre, categoria, descripcion, activo) VALUES
('Constitución de Empresas y Registro Mercantil', 'Legal y Corporativo', 'Asesoría y gestión completa para registro de compañías anónimas y firmas personales.', 1),
('Asesoría Tributaria y Fiscal', 'Finanzas y Tributos', 'Declaraciones fiscales, libros contables y optimización impositiva.', 1),
('Desarrollo de Software y Apps', 'Tecnología e Innovación', 'Desarrollo web a la medida, tiendas online y aplicaciones móviles.', 1),
('Marketing Digital y Redes Sociales', 'Marketing y Ventas', 'Estrategia de contenidos, pauta publicitaria y gestión de comunidades.', 1),
('Plan de Negocios y Estructuración Financiera', 'Consultoría Estratégica', 'Formulación de planes de negocios y modelos de monetización.', 1),
('Registro de Marca y Propiedad Intelectual', 'Legal y Corporativo', 'Protección de marcas, patentes y derechos de autor ante el SAPI.', 1);