import {
  Proyecto,
  AreaClave,
  ServicioEspecializado,
  Profesional,
  ConfigCMS,
  MetricasDashboard,
  Rol,
  Usuario
} from '../types';

export const INITIAL_ROLES: Rol[] = [
  {
    id: 1,
    codigo: 'SUPERADMIN',
    nombre: 'Super Administrador (Nivel 1)',
    descripcion: 'Control total de la plataforma, edición de cualquier usuario, CMS global, base de datos y seguridad.',
    permisos: ['ALL', 'USERS_MANAGE_ALL', 'CMS_FULL_EDIT', 'PROJECTS_MANAGE', 'SERVICES_MANAGE', 'AUDIT_FULL', 'SYSTEM_CONFIG']
  },
  {
    id: 2,
    codigo: 'ADMIN',
    nombre: 'Director Operativo / Admin (Nivel 2)',
    descripcion: 'Gestión de proyectos, servicios y métricas SIAH. Puede modificar usuarios de su nivel e inferiores.',
    permisos: ['PROJECTS_MANAGE', 'SERVICES_MANAGE', 'CMS_EDIT', 'USERS_MANAGE_SUB', 'METRICS_VIEW', 'TEAM_MANAGE']
  },
  {
    id: 3,
    codigo: 'AUDITOR',
    nombre: 'Auditor Financiero & Concurrente (Nivel 3)',
    descripcion: 'CMS de fiscalización, auditoría de fondos multilaterales, dictámenes y gestión autorizada del equipo técnico.',
    permisos: ['AUDIT_MANAGE', 'PROJECTS_AUDIT', 'REPORTS_DOWNLOAD', 'PROFILE_EDIT', 'AUDIT_CERTIFICATES', 'TEAM_MANAGE']
  },
  {
    id: 4,
    codigo: 'EDITOR',
    nombre: 'Editor de Contenidos & Storytelling (Nivel 4)',
    descripcion: 'CMS de comunicación, redacción del Hero, fichas narrativas de impacto humanitario y notas de prensa.',
    permisos: ['CMS_TEXTS_EDIT', 'PROJECTS_STORIES_EDIT', 'MEDIA_MANAGE', 'PROFILE_EDIT']
  },
  {
    id: 5,
    codigo: 'CONSULTOR',
    nombre: 'Consultor / Observador Multilateral (Nivel 5)',
    descripcion: 'CMS de monitoreo ejecutivo, veeduría de cooperantes (ECHO, USAID, ONU) y descarga de expedientes.',
    permisos: ['EXECUTIVE_VIEW', 'METRICS_ANALYTICS', 'DOSSIER_DOWNLOAD', 'PROFILE_EDIT']
  }
];

export const INITIAL_USERS: Usuario[] = [
  {
    id: 1,
    nombre: 'Ing. Carlos Salvatierra',
    email: 'salvaticarlos@gmail.com',
    rol_id: 1,
    rol_nombre: 'Super Administrador (Nivel 1)',
    cargo: 'Director General & Arquitecto Principal',
    telefono: '+58 414-360-0001',
    organizacion: '360 SIACE Global',
    avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    avatar_origen: 'BANCO_SIAH',
    estado: 'ACTIVO',
    ultimo_acceso: 'Hace 2 minutos (Sesión actual)',
    creado_en: '2025-01-10'
  },
  {
    id: 2,
    nombre: 'Dra. Valentina Mendoza',
    email: 'vmendoza@360siace.com',
    rol_id: 2,
    rol_nombre: 'Director Operativo / Admin (Nivel 2)',
    cargo: 'Directora de Operaciones Humanitarias',
    telefono: '+58 412-360-0002',
    organizacion: 'SIAH Operaciones de Campo',
    avatar_url: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=200&q=80',
    avatar_origen: 'BANCO_SIAH',
    estado: 'ACTIVO',
    ultimo_acceso: 'Hoy a las 09:15 AM',
    creado_en: '2025-02-14'
  },
  {
    id: 3,
    nombre: 'Lic. Roberto Briceño',
    email: 'rbriceno@360siace.com',
    rol_id: 3,
    rol_nombre: 'Auditor Financiero & Concurrente (Nivel 3)',
    cargo: 'Auditor Senior Fiduciario y ECHO/USAID',
    telefono: '+58 416-360-0003',
    organizacion: 'Comité de Auditoría Concurrente SIAH',
    avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
    avatar_origen: 'BANCO_SIAH',
    estado: 'ACTIVO',
    ultimo_acceso: 'Hoy a las 08:30 AM',
    creado_en: '2025-03-01'
  },
  {
    id: 4,
    nombre: 'Lcda. Mariana Gómez',
    email: 'mgomez@360siace.com',
    rol_id: 4,
    rol_nombre: 'Editor de Contenidos & Storytelling (Nivel 4)',
    cargo: 'Coordinadora de Comunicaciones y Medios Humanitarios',
    telefono: '+58 424-360-0004',
    organizacion: 'Área de Comunicaciones 360 SIACE',
    avatar_url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80',
    avatar_origen: 'BANCO_SIAH',
    estado: 'ACTIVO',
    ultimo_acceso: 'Ayer a las 16:20 PM',
    creado_en: '2025-03-10'
  },
  {
    id: 5,
    nombre: 'Dr. Jean-Pierre Laurent',
    email: 'jplaurent@cooperacion.org',
    rol_id: 5,
    rol_nombre: 'Consultor / Observador Multilateral (Nivel 5)',
    cargo: 'Veedor Internacional & Evaluador de Proyectos',
    telefono: '+33 1 42 68 00 05',
    organizacion: 'Misión Multilateral de Cooperación',
    avatar_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
    avatar_origen: 'BANCO_SIAH',
    estado: 'ACTIVO',
    ultimo_acceso: 'Ayer a las 11:00 AM',
    creado_en: '2025-03-15'
  }
];

export const INITIAL_CONFIG_CMS: ConfigCMS = {
  hero_tagline: "360 SIACE • MODELO OPERATIVO SIAH",
  hero_titulo: "Tu 'Back-Office' especializado para maximizar el impacto social",
  hero_subtitulo: "Alineando la rigurosidad administrativa, legal y de ingeniería con la velocidad humanitaria.",
  hero_parrafo_apoyo: "¿Su organización humanitaria enfrenta el desafío de equilibrar la eficiencia administrativa con la urgencia de salvar vidas? SIAH es su aliado estratégico. Proveemos un ecosistema integral de soporte en auditoría concurrente, gestión contractual, gobernanza de datos y supervisión técnica en campo para organismos multilaterales (ECHO, USAID, ONU) y fundaciones de alto impacto.",
  por_que_elegirnos_intro: "SIAH (Sistema Integral de Acompañamiento Humanitario) resuelve las 3 fricciones críticas de la cooperación: la burocracia desfasada, el riesgo fiduciario y la falta de verificación técnica en terreno.",
  por_que_elegirnos_puntos: [
    {
      titulo: "Especialización Sectorial Estricta",
      descripcion: "Dominio exhaustivo de normativas de rendición multilateral: ECHO (Unión Europea), USAID (BHA) y agencias del sistema de Naciones Unidas (ACNUR, PMA, UNICEF).",
      icono: "ShieldCheck"
    },
    {
      titulo: "Acompañamiento Hands-on en Terreno",
      descripcion: "No somos asesores pasivos de escritorio. Desplegamos equipos de auditoría concurrente e ingeniería in situ para verificar cada dólar y cada entregable.",
      icono: "UsersRound"
    },
    {
      titulo: "Enfoque Holístico One-Stop-Shop",
      descripcion: "Desde el cálculo de estructuras civiles y protocolos telemáticos cifrados, hasta litigios laborales y conciliación multimoneda sin intermediarios fragmentados.",
      icono: "Layers"
    }
  ],
  cta_titulo: "¡Transforme la capacidad operativa de su organización hoy!",
  cta_descripcion: "Agende una sesión técnica confidencial con nuestros arquitectos de back-office para diagnosticar sus proyectos en ejecución o formular nuevas propuestas elegibles.",
  cta_telefono: "+1 (800) 360-SIACE / +58 (212) 360-SIAH",
  cta_email: "contacto@360siace.com",
  cta_direccion: "Torre Corporativa 360, Piso 14. Eje Financiero & Centro de Operaciones Humanitarias.",
  dominio_oficial: "www.360siace.com",
  modelo_operativo_nombre: "SIAH - Sistema Integral de Acompañamiento Humanitario"
};

export const INITIAL_PROJECTS: Proyecto[] = [
  {
    id: 1,
    codigo: 'PRJ-MDR-01',
    nombre: 'Mis Delirios Ranch',
    subtitulo: 'Producción Agropecuaria Sustentable y Nutrición Comunitaria',
    categoria: 'Producción & Seguridad Alimentaria',
    descripcion_corta: 'Modelo agroproductivo autosustentable con ganadería regenerativa, piscicultura y huertos hidropónicos de alto rendimiento.',
    descripcion_larga: 'Desarrollo integral de 120 hectáreas agroproductivas destinadas a suministrar proteína de alta calidad y vegetales frescos a comedores comunitarios. Incluye banco de forrajes, biofábricas de fertilizantes orgánicos y pozos profundos con energía fotovoltaica.',
    impacto_social: '18,500 raciones nutritivas mensuales garantizadas para comedores infantiles y hogares de paso.',
    estado: 'EN_EJECUCION',
    avance_porcentaje: 82,
    beneficiarios_directos: 24500,
    inversion_estimada_usd: 850000,
    ubicacion: 'Faja Agrícola Central, Sector Los Valles',
    cooperantes_clave: ['PMA - Alimentos', 'FAO Regional', 'Fundación Semillas del Futuro'],
    imagen_url: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=800&q=80',
    color_accent: '#10b981',
    icono: 'Wheat'
  },
  {
    id: 2,
    codigo: 'PRJ-COD-58',
    nombre: 'Código 58',
    subtitulo: 'Red Telemática Crítica y Trazabilidad Satelital de Emergencia',
    categoria: 'IT & Telemática de Emergencia',
    descripcion_corta: 'Infraestructura de comunicación táctica, enlaces Starlink cifrados y sensores IoT para monitoreo de cadenas críticas.',
    descripcion_larga: 'Red privada humanitaria con nodos mesh de radioenlace y satélite para zonas incomunicadas. Integra una plataforma web/móvil que permite reportar incidentes, georreferenciar convoyes de auxilio y verificar entregas en tiempo real.',
    impacto_social: 'Conectividad ininterrumpida y resguardo de datos en 34 puestos de comando humanitario aislados.',
    estado: 'EN_EJECUCION',
    avance_porcentaje: 94,
    beneficiarios_directos: 82000,
    inversion_estimada_usd: 1200000,
    ubicacion: 'Cobertura Nacional / Ejes Fronterizos',
    cooperantes_clave: ['OCHA', 'Telecoms Sans Frontières', 'Consorcio SIAH Tech'],
    imagen_url: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&w=800&q=80',
    color_accent: '#0284c7',
    icono: 'Radio'
  },
  {
    id: 3,
    codigo: 'PRJ-CDA-03',
    nombre: 'Centros de Acopio',
    subtitulo: 'Hubs Logísticos y Almacenes Inteligentes con Cadena de Frío',
    categoria: 'Logística & Suministros',
    descripcion_corta: 'Red de almacenes primarios y secundarios con racks sismorresistentes, temperatura controlada y sistema WMS propio.',
    descripcion_larga: 'Diseño estructural, montaje de cámaras frigoríficas solares de -20°C a +4°C para vacunas e insumos médicos, y codificación estandarizada de bultos humanitarios mediante QR inviolable.',
    impacto_social: 'Cero mermas en medicamentos críticos y despacho expedito en menos de 4 horas post-desastre.',
    estado: 'EN_EJECUCION',
    avance_porcentaje: 76,
    beneficiarios_directos: 150000,
    inversion_estimada_usd: 1950000,
    ubicacion: 'Corredores Logísticos Estratégicos',
    cooperantes_clave: ['ECHO - Protección Civil', 'Cruz Roja Asociada', 'Agencia de Logística Multilateral'],
    imagen_url: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=800&q=80',
    color_accent: '#f59e0b',
    icono: 'Warehouse'
  },
  {
    id: 4,
    codigo: 'PRJ-PAB-04',
    nombre: 'Participantes / Bendiciones',
    subtitulo: 'Padrón Biométrico Ético y Transferencias Monetarias Condicionadas',
    categoria: 'Protección Social & Finanzas',
    descripcion_corta: 'Sistema de validación biométrica descentralizada con privacidad diferencial para entrega digna de subsidios y canastas.',
    descripcion_larga: 'Mecanismo auditable de asignación de ayudas sin duplicidad de registros ni filtraciones políticas. Emite tarjetas inteligentes y códigos dinámicos canjeables en comercios aliados formalizados.',
    impacto_social: 'Más de 45,000 familias vulnerables con auxilio monetario directo y trazabilidad contable auditada.',
    estado: 'EN_EJECUCION',
    avance_porcentaje: 88,
    beneficiarios_directos: 180000,
    inversion_estimada_usd: 3400000,
    ubicacion: 'Distritos Urbanos y Periurbanos Prioritarios',
    cooperantes_clave: ['USAID BHA', 'Banco Interamericano', 'Red de Microfinanzas Sociales'],
    imagen_url: 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&w=800&q=80',
    color_accent: '#ec4899',
    icono: 'HeartHandshake'
  },
  {
    id: 5,
    codigo: 'PRJ-RDD-05',
    nombre: 'Respuesta de Dios',
    subtitulo: 'Unidades Sanitarias Móviles y Brigadas Quirúrgicas Comunitarias',
    categoria: 'Salud & Asistencia Médica',
    descripcion_corta: 'Clínicas móviles 4x4 equipadas para odontología, triaje materno-infantil, laboratorio express y telemedicina.',
    descripcion_larga: 'Despliegue de convoys médicos en comunidades de difícil acceso geográfico. Brinda atención médica primaria, cirugías ambulatorias menores y dotación de medicamentos de soporte vital sin costo para la población.',
    impacto_social: 'Más de 31,000 consultas médicas anuales y reducción del 40% en complicaciones obstétricas locales.',
    estado: 'EN_EJECUCION',
    avance_porcentaje: 91,
    beneficiarios_directos: 62000,
    inversion_estimada_usd: 1100000,
    ubicacion: 'Zonas Rurales Fluviales y de Montaña',
    cooperantes_clave: ['OPS / OMS', 'Médicos Unidos Sin Frontera', 'Diócesis Humanitaria'],
    imagen_url: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=800&q=80',
    color_accent: '#8b5cf6',
    icono: 'Stethoscope'
  },
  {
    id: 6,
    codigo: 'PRJ-CDA-06',
    nombre: 'Control de Acceso',
    subtitulo: 'Blindaje Físico-Lógico y Salvaguarda de Recintos Humanitarios',
    categoria: 'Seguridad Integral & Gobernanza',
    descripcion_corta: 'Torniquetes RFID, reconocimiento facial local cifrado y control de bitácoras para bodegas y centros operativos.',
    descripcion_larga: 'Arquitectura de seguridad integral que protege al personal de ayuda, almacenes estratégicos e inventarios de alto valor contra saqueos o pérdidas no autorizadas, respetando los protocolos éticos de datos humanitarios.',
    impacto_social: '100% de recintos con cero incidentes de intrusión y auditorías de inventario 100% coincidentes.',
    estado: 'EN_EJECUCION',
    avance_porcentaje: 98,
    beneficiarios_directos: 12000,
    inversion_estimada_usd: 620000,
    ubicacion: 'Instalaciones Centrales y Almacenes Regionales',
    cooperantes_clave: ['UNDSS Protocolos', 'Comité de Seguridad Humanitaria', 'SIACE Security Lab'],
    imagen_url: 'https://images.unsplash.com/photo-1557597774-9d273605dfa9?auto=format&fit=crop&w=800&q=80',
    color_accent: '#06b6d4',
    icono: 'ScanFace'
  }
];

export const INITIAL_AREAS_CLAVE: AreaClave[] = [
  {
    id: 'finanzas-auditoria',
    numero: 1,
    nombre: 'Finanzas y Auditoría',
    subtitulo: 'Auditoría concurrente, presupuestos multimoneda y rendición fiduciaria',
    descripcion: 'Supervisión en tiempo real de la ejecución financiera de fondos internacionales para evitar objeciones de gasto y multas de donantes.',
    icono: 'BadgeDollarSign',
    metricas_destacadas: '$14.8M USD auditados sin una sola glosa',
    servicios_asociados: [2, 3]
  },
  {
    id: 'legal-rrhh',
    numero: 2,
    nombre: 'Legal y RRHH',
    subtitulo: 'Cumplimiento laboral, contrataciones transfronterizas y normativas',
    descripcion: 'Blindaje jurídico y gestión de talento humano en contextos de alto riesgo, salvaguardando a la organización y al personal expatriado/nacional.',
    icono: 'Scale',
    metricas_destacadas: '100% de contratos homologados con OIT y leyes locales',
    servicios_asociados: [4, 6]
  },
  {
    id: 'ingenieria-proyectos',
    numero: 3,
    nombre: 'Ingeniería y Proyectos',
    subtitulo: 'Supervisión técnica en obra, cálculo estructural y PMO',
    descripcion: 'Aseguramiento de calidad técnica en infraestructuras sanitarias, viales, agrícolas y centros comunitarios con memoria de cálculo verificable.',
    icono: 'HardHat',
    metricas_destacadas: '48 obras civiles finalizadas con certificación técnica',
    servicios_asociados: [1, 8, 9]
  },
  {
    id: 'it-telematica',
    numero: 4,
    nombre: 'IT y Telemática',
    subtitulo: 'Conectividad satelital, ciberseguridad y soberanía de datos',
    descripcion: 'Diseño e implementación de redes cifradas, ERPs a medida para ONGs y protocolos de privacidad para la protección de poblaciones vulnerables.',
    icono: 'Network',
    metricas_destacadas: '99.98% disponibilidad de red en zonas remotas',
    servicios_asociados: [5, 7, 10]
  }
];

export const INITIAL_SERVICIOS: ServicioEspecializado[] = [
  {
    id: 1,
    numero: 1,
    area_id: 'ingenieria-proyectos',
    titulo: 'Gestión Integral de Proyectos (PMO)',
    descripcion: 'Formulación bajo metodología de Marco Lógico (EML), monitoreo por indicadores de impacto y control de hitos según PMI/PMD Pro.',
    entregables: ['Matriz de Marco Lógico', 'Cronograma Gantt / WBS', 'Reportes Trimestrales de Progreso (QPR)'],
    normativas_referencia: 'PMD Pro / Project Management for Development',
    icono: 'FolderKanban'
  },
  {
    id: 2,
    numero: 2,
    area_id: 'finanzas-auditoria',
    titulo: 'Finanzas y Contabilidad Multilateral',
    descripcion: 'Estructuración de presupuestos multimoneda, conciliaciones bancarias en divisas y control de flujo de caja para subvenciones internacionales.',
    entregables: ['Estados Financieros Comparativos', 'Reportes Financieros Formato Donante', 'Manual de Procedimientos de Caja Chica'],
    normativas_referencia: 'NIIF para Pymes / Estándares GAAP / USAID CFR 200',
    icono: 'Calculator'
  },
  {
    id: 3,
    numero: 3,
    area_id: 'finanzas-auditoria',
    titulo: 'Auditoría Concurrente en Tiempo Real',
    descripcion: 'Revisión documental y física previa y simultánea a los desembolsos, eliminando gastos no elegibles antes del cierre contable.',
    entregables: ['Cédulas de Auditoría Preventiva', 'Dictamen Pericial de Gastos', 'Carta de Recomendaciones de Control Interno'],
    normativas_referencia: 'Normas Internacionales de Auditoría (NIA/ISA)',
    icono: 'FileCheck2'
  },
  {
    id: 4,
    numero: 4,
    area_id: 'legal-rrhh',
    titulo: 'Soporte Legal & Compliance Institucional',
    descripcion: 'Gobernanza corporativa de ONGs, redacción de convenios marco con ministerios, prevención de lavado de activos (AML/CFT) y propiedad intelectual.',
    entregables: ['Estatutos Sociales Homologados', 'Contratos de Alianza Estratégica (MoU)', 'Matriz de Cumplimiento Regulatorio'],
    normativas_referencia: 'Convenciones Internacionales y Marco Tributario Nacional',
    icono: 'Gavel'
  },
  {
    id: 5,
    numero: 5,
    area_id: 'it-telematica',
    titulo: 'Tecnología, Cloud & Ciberseguridad',
    descripcion: 'Desarrollo de portales de gestión, bases de datos MariaDB seguras, enlaces VPN dedicados y hosting corporativo certificado SSL.',
    entregables: ['Arquitectura de Red Cifrada', 'Manual de Respaldos Automatizados', 'Auditoría de Vulnerabilidades Web/App'],
    normativas_referencia: 'ISO/IEC 27001 / GDPR Humanitario',
    icono: 'ShieldAlert'
  },
  {
    id: 6,
    numero: 6,
    area_id: 'legal-rrhh',
    titulo: 'Gestión de Talento Humano y Nómina',
    descripcion: 'Reclutamiento de perfiles de alta especialidad, administración de nóminas complejas, seguros médicos de riesgo y planes de bienestar.',
    entregables: ['Políticas Salariales y de Viáticos', 'Expedientes Digitales de Personal', 'Evaluaciones de Desempeño 360°'],
    normativas_referencia: 'Normas de la OIT / Código Orgánico del Trabajo',
    icono: 'UserCheck'
  },
  {
    id: 7,
    numero: 7,
    area_id: 'it-telematica',
    titulo: 'Formación y Capacitación Especializada',
    descripcion: 'Programas de adiestramiento presencial y e-learning en estándares humanitarios (Proyecto Esfera, Norma Humanitaria Esencial CHS y PSEA).',
    entregables: ['Plataforma LMS Certificada', 'Kits Pedagógicos Interactivos', 'Certificados con Código de Verificación'],
    normativas_referencia: 'Estándares Humanitarios Core (CHS Alliance)',
    icono: 'GraduationCap'
  },
  {
    id: 8,
    numero: 8,
    area_id: 'ingenieria-proyectos',
    titulo: 'Ingeniería Civil y Supervisión de Obra',
    descripcion: 'Levantamientos topográficos, cálculo de estructuras, presupuestos de obra con análisis de precios unitarios (APU) e inspección en sitio.',
    entregables: ['Planos As-Built Digitalizados', 'Cuaderno de Obra Auditado', 'Pruebas de Resistencia de Materiales'],
    normativas_referencia: 'Normas COVENIN / ACI 318 / Eurocódigos',
    icono: 'Building2'
  },
  {
    id: 9,
    numero: 9,
    area_id: 'ingenieria-proyectos',
    titulo: 'Producción Agropecuaria y Seguridad Alimentaria',
    descripcion: 'Asesoría agronómica integral, diseño de sistemas de riego tecnificado, manejo integrado de plagas y producción de forrajes verdes hidropónicos.',
    entregables: ['Plan de Manejo Agronómico Sostenible', 'Estudio de Suelos y Agua', 'Manual de Bioseguridad Pecuaria'],
    normativas_referencia: 'Buenas Prácticas Agrícolas (BPA/GAP - FAO)',
    icono: 'Sprout'
  },
  {
    id: 10,
    numero: 10,
    area_id: 'it-telematica',
    titulo: 'Logística de Emergencia y Cadena de Suministro',
    descripcion: 'Gestión de almacenes, trazabilidad de bultos humanitarios, rutas de despacho seguro y mantenimiento de cadena de frío para biológicos.',
    entregables: ['Procedimiento Estándar de Almacén (SOP)', 'Reporte de Waybills y Manifiestos', 'Plan de Contingencia de Flotas'],
    normativas_referencia: 'Guías de Logística de Emergencia IFRC / WFP',
    icono: 'Truck'
  }
];

export const INITIAL_PROFESIONALES: Profesional[] = [
  {
    id: 1,
    nombre: 'Ing. Carlos A. Salvatierra',
    cargo: 'Director Ejecutivo & Arquitecto de Soluciones',
    departamento: 'Dirección General & Estrategia SIAH',
    especialidad: 'Ingeniería de Sistemas, Gestión de Proyectos de Alto Impacto y Transformación Operativa',
    biografia: 'Más de 18 años liderando arquitecturas tecnológicas y operativas de misión crítica para organismos multilaterales y proyectos de escala nacional.',
    certificaciones: ['PMP® Certified', 'ISO 27001 Lead Implementer', 'Scrum Master'],
    experiencia_anos: 18,
    foto_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
    foto_origen: 'BANCO_SIAH',
    email_corporativo: 'csalvatierra@360siace.com',
    orden_visual: 1
  },
  {
    id: 2,
    nombre: 'Lic. Valentina Mendoza M.',
    cargo: 'Directora de Finanzas & Auditoría Concurrente',
    departamento: 'Finanzas y Rendición Multilateral',
    especialidad: 'Contabilidad Forense, Cumplimiento ECHO/USAID y Presupuestos Multimoneda',
    biografia: 'Especialista en auditoría de fondos no reembolsables con más de $40M USD auditados satisfactoriamente ante la Unión Europea y agencias de la ONU.',
    certificaciones: ['CPA / Contador Público', 'ECHO Compliance Master', 'Especialista NIIF'],
    experiencia_anos: 15,
    foto_url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80',
    foto_origen: 'BANCO_SIAH',
    email_corporativo: 'vmendoza@360siace.com',
    orden_visual: 2
  },
  {
    id: 3,
    nombre: 'Abg. Roberto Briceño Gómez',
    cargo: 'Director de Asuntos Legales & RRHH',
    departamento: 'Legal, Compliance y Gobernanza',
    especialidad: 'Derecho Internacional Humanitario, Contrataciones Estatales y Derecho Laboral',
    biografia: 'Asesor de juntas directivas y consorcios humanitarios en estructuración estatutaria, convenios bilaterales y mitigación de contingencias laborales.',
    certificaciones: ['Magíster en Derecho Corporativo', 'Especialista en Gobernanza ONG', 'Mediador Laboral'],
    experiencia_anos: 14,
    foto_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
    foto_origen: 'BANCO_SIAH',
    email_corporativo: 'rbriceno@360siace.com',
    orden_visual: 3
  },
  {
    id: 4,
    nombre: 'Ing. Mariana Soto Valera',
    cargo: 'Jefa de Inspección de Obras & Infraestructura',
    departamento: 'Ingeniería y Obras Civiles',
    especialidad: 'Cálculo Estructural, Obras Hidráulicas Sanitarias y Presupuestos APU',
    biografia: 'Supervisora técnica de más de 60 proyectos de rehabilitación hospitalaria, centros de acopio y acueductos comunitarios con certificación técnica.',
    certificaciones: ['Ingeniero Civil Colegiado', 'Modelador BIM Revit', 'Seguridad en Construcción OHSAS'],
    experiencia_anos: 12,
    foto_url: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=400&q=80',
    foto_origen: 'BANCO_SIAH',
    email_corporativo: 'msoto@360siace.com',
    orden_visual: 4
  }
];

export const INITIAL_METRICAS: MetricasDashboard = {
  visitantes_hoy: 1420,
  visitas_totales_mes: 48930,
  tiempo_promedio_min: 4.8,
  tasa_rebote: 24.2,
  disponibilidad_sla: 99.98,
  proyectos_activos: 6,
  fondos_auditados_usd: 14850000,
  beneficiarios_totales: 508500,
  trafico_por_modulo: [
    { modulo: 'Finanzas y Auditoría', visitas: 18450, porcentaje: 38, color: '#3b82f6' },
    { modulo: 'Ingeniería y Proyectos', visitas: 13200, porcentaje: 27, color: '#10b981' },
    { modulo: 'IT y Telemática', visitas: 9750, porcentaje: 20, color: '#06b6d4' },
    { modulo: 'Legal y RRHH', visitas: 7530, porcentaje: 15, color: '#8b5cf6' }
  ],
  visitas_ultimos_7_dias: [
    { dia: 'Lun', visitas: 5800, usuarios_unicos: 2100 },
    { dia: 'Mar', visitas: 6400, usuarios_unicos: 2350 },
    { dia: 'Mie', visitas: 7200, usuarios_unicos: 2700 },
    { dia: 'Jue', visitas: 6900, usuarios_unicos: 2500 },
    { dia: 'Vie', visitas: 8100, usuarios_unicos: 3100 },
    { dia: 'Sab', visitas: 4900, usuarios_unicos: 1800 },
    { dia: 'Dom', visitas: 4300, usuarios_unicos: 1600 }
  ],
  actividad_reciente: [
    { id: 'ACT-1', evento: 'Auditoría preventiva cerrada sin objeciones en PRJ-MDR-01', modulo: 'Finanzas', hora: '10:42 AM', tipo: 'success' },
    { id: 'ACT-2', evento: 'Nodo satelital Starlink sincronizado exitosamente en Código 58', modulo: 'IT y Telemática', hora: '09:15 AM', tipo: 'info' },
    { id: 'ACT-3', evento: 'Inspección técnica civil aprobada: Centro de Acopio Sector Sur', modulo: 'Ingeniería', hora: 'Ayer', tipo: 'success' },
    { id: 'ACT-4', evento: 'Actualización de póliza de seguros de campo para brigadas', modulo: 'Legal y RRHH', hora: 'Ayer', tipo: 'warning' }
  ]
};
