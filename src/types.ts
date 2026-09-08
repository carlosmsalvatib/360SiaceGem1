/**
 * Modelos de datos para 360 SIACE / Modelo SIAH
 */

export interface Rol {
  id: number;
  codigo: 'SUPERADMIN' | 'ADMIN' | 'AUDITOR' | 'EDITOR' | 'CONSULTOR';
  nombre: string;
  descripcion: string;
  permisos: string[];
}

export type OrigenImagen = 'ARCHIVO_LOCAL' | 'URL_EXTERNA' | 'BANCO_SIAH' | 'AVATAR_GENERADO' | 'CAMARA_DIRECTA';

export interface Usuario {
  id: number;
  nombre: string;
  email: string;
  password_hash?: string;
  rol_id: number;
  rol_nombre?: string;
  cargo?: string;
  telefono?: string;
  organizacion?: string;
  avatar_url?: string;
  avatar_origen?: OrigenImagen;
  estado: 'ACTIVO' | 'INACTIVO' | 'SUSPENDIDO';
  ultimo_acceso?: string;
  creado_en: string;
}

export interface Proyecto {
  id: number;
  codigo: string;
  nombre: string;
  subtitulo: string;
  categoria: string;
  descripcion_corta: string;
  descripcion_larga: string;
  impacto_social: string;
  estado: 'EN_EJECUCION' | 'COMPLETADO' | 'PLANIFICACION' | 'AUDITORIA';
  avance_porcentaje: number;
  beneficiarios_directos: number;
  inversion_estimada_usd: number;
  ubicacion: string;
  cooperantes_clave: string[];
  imagen_url: string;
  imagen_origen?: OrigenImagen;
  color_accent: string;
  icono: string;
  auditoria_estado?: 'CONFORME' | 'OBSERVADO' | 'EN_REVISION' | 'PENDIENTE';
  auditor_responsable?: string;
  auditoria_notas?: string;
}

export interface AreaClave {
  id: string;
  numero: number;
  nombre: string;
  subtitulo: string;
  descripcion: string;
  icono: string;
  metricas_destacadas: string;
  servicios_asociados: number[];
}

export interface ServicioEspecializado {
  id: number;
  numero: number;
  area_id: string;
  titulo: string;
  descripcion: string;
  entregables: string[];
  normativas_referencia: string;
  icono: string;
}

export interface Profesional {
  id: number;
  nombre: string;
  cargo: string;
  departamento: string;
  especialidad: string;
  biografia: string;
  certificaciones: string[];
  experiencia_anos: number;
  foto_url: string;
  foto_origen?: OrigenImagen;
  email_corporativo: string;
  orden_visual: number;
}

export interface EstadisticaVisitante {
  id: number;
  modulo_visitado: string;
  fecha_hora: string;
  ip_anonimizada: string;
  pais_ciudad: string;
  dispositivo: 'Desktop' | 'Mobile' | 'Tablet';
  navegador: string;
  tiempo_permanencia_seg: number;
}

export interface ConfigCMS {
  hero_tagline: string;
  hero_titulo: string;
  hero_subtitulo: string;
  hero_parrafo_apoyo: string;
  por_que_elegirnos_intro: string;
  por_que_elegirnos_puntos: {
    titulo: string;
    descripcion: string;
    icono: string;
  }[];
  cta_titulo: string;
  cta_descripcion: string;
  cta_telefono: string;
  cta_email: string;
  cta_direccion: string;
  dominio_oficial: string;
  modelo_operativo_nombre: string;
}

export interface MetricasDashboard {
  visitantes_hoy: number;
  visitas_totales_mes: number;
  tiempo_promedio_min: number;
  tasa_rebote: number;
  disponibilidad_sla: number;
  proyectos_activos: number;
  fondos_auditados_usd: number;
  beneficiarios_totales: number;
  trafico_por_modulo: {
    modulo: string;
    visitas: number;
    porcentaje: number;
    color: string;
  }[];
  visitas_ultimos_7_dias: {
    dia: string;
    visitas: number;
    usuarios_unicos: number;
  }[];
  actividad_reciente: {
    id: string;
    evento: string;
    modulo: string;
    hora: string;
    tipo: 'info' | 'success' | 'warning';
  }[];
}
