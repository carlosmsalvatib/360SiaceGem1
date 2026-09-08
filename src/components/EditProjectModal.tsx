import React, { useState, useEffect } from 'react';
import { Proyecto, Usuario, OrigenImagen } from '../types';
import { ImageSourceSelectorModal } from './ImageSourceSelectorModal';
import { 
  X, 
  Save, 
  Sparkles, 
  FolderKanban, 
  TrendingUp, 
  Users, 
  DollarSign, 
  ShieldCheck, 
  MapPin, 
  Globe, 
  CheckCircle2, 
  AlertCircle,
  Clock,
  Layers,
  HeartHandshake,
  Wheat,
  Radio,
  Warehouse,
  Stethoscope,
  ScanFace,
  Droplet,
  Zap,
  Building,
  Truck,
  Eye,
  Plus,
  Trash2,
  Palette,
  Camera,
  ExternalLink
} from 'lucide-react';

interface EditProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectToEdit: Proyecto | null;
  isNew?: boolean;
  currentUser: Usuario;
  onSaveProject: (project: Proyecto) => void;
}

// Preset modern color accents
const COLOR_PRESETS = [
  { hex: '#10b981', label: 'Esmeralda Agro' },
  { hex: '#0284c7', label: 'Azul Satelital' },
  { hex: '#38bdf8', label: 'Cyan SIAH' },
  { hex: '#f59e0b', label: 'Ámbar Logística' },
  { hex: '#ec4899', label: 'Rosa Social' },
  { hex: '#8b5cf6', label: 'Violeta Sanitario' },
  { hex: '#06b6d4', label: 'Turquesa Blindaje' },
  { hex: '#14b8a6', label: 'Verde Agua WASH' },
  { hex: '#ef4444', label: 'Rojo Emergencia' }
];

// Preset available icons
const AVAILABLE_ICONS = [
  { id: 'Wheat', label: 'Agricultura & Alimentos', icon: Wheat },
  { id: 'Radio', label: 'Telemática & Satélite', icon: Radio },
  { id: 'Warehouse', label: 'Almacén & Cadena de Frío', icon: Warehouse },
  { id: 'HeartHandshake', label: 'Protección & Finanzas', icon: HeartHandshake },
  { id: 'Stethoscope', label: 'Salud & Clínicas Móviles', icon: Stethoscope },
  { id: 'ScanFace', label: 'Biometría & Seguridad', icon: ScanFace },
  { id: 'Droplet', label: 'Agua & Saneamiento WASH', icon: Droplet },
  { id: 'Zap', label: 'Energía Solar & Redes', icon: Zap },
  { id: 'Building', label: 'Obras Civiles & Refugios', icon: Building },
  { id: 'Truck', label: 'Transporte & Convoyes', icon: Truck },
  { id: 'ShieldCheck', label: 'Auditoría & Veeduría', icon: ShieldCheck },
  { id: 'Globe', label: 'Cooperación Internacional', icon: Globe },
  { id: 'FolderKanban', label: 'Proyecto Integral', icon: FolderKanban }
];

// Category quick suggestions
const CATEGORY_SUGGESTIONS = [
  'Producción & Seguridad Alimentaria',
  'IT & Telemática de Emergencia',
  'Logística & Suministros',
  'Protección Social & Finanzas',
  'Salud & Asistencia Médica',
  'Seguridad Integral & Gobernanza',
  'Agua, Saneamiento & WASH',
  'Infraestructura Civil & Refugio'
];

// Frequent Cooperating Donors
const COMMON_DONORS = [
  'ECHO - Protección Civil',
  'USAID BHA',
  'PMA - Alimentos',
  'OCHA',
  'ACNUR Regional',
  'FAO Regional',
  'Cruz Roja Asociada',
  'OPS / OMS',
  'Banco Interamericano',
  'Consorcio SIAH Tech'
];

export const EditProjectModal: React.FC<EditProjectModalProps> = ({
  isOpen,
  onClose,
  projectToEdit,
  isNew = false,
  currentUser,
  onSaveProject
}) => {
  const [activeTab, setActiveTab] = useState<'carrusel' | 'metricas' | 'ficha' | 'auditoria'>('carrusel');
  const [showPreview, setShowPreview] = useState<'none' | 'carrusel' | 'ficha'>('carrusel');
  const [isImageSourceModalOpen, setIsImageSourceModalOpen] = useState(false);
  const [newDonorInput, setNewDonorInput] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);

  // Editable Project Form State
  const [formData, setFormData] = useState<Proyecto>({
    id: Date.now(),
    codigo: 'PRJ-NUEVO-01',
    nombre: '',
    subtitulo: '',
    categoria: 'Producción & Seguridad Alimentaria',
    descripcion_corta: '',
    descripcion_larga: '',
    impacto_social: '',
    estado: 'EN_EJECUCION',
    avance_porcentaje: 75,
    beneficiarios_directos: 15000,
    inversion_estimada_usd: 500000,
    ubicacion: 'Eje Operativo Regional SIAH',
    cooperantes_clave: ['ECHO - Protección Civil', 'USAID BHA'],
    imagen_url: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=800&q=80',
    imagen_origen: 'BANCO_SIAH',
    color_accent: '#0284c7',
    icono: 'FolderKanban',
    auditoria_estado: 'CONFORME',
    auditor_responsable: `${currentUser.nombre} (${currentUser.cargo || 'Auditor SIAH'})`,
    auditoria_notas: 'Verificación documental y técnica inicial.'
  });

  useEffect(() => {
    if (projectToEdit) {
      setFormData({
        ...projectToEdit,
        auditor_responsable: projectToEdit.auditor_responsable || `${currentUser.nombre} (${currentUser.cargo || 'Auditor SIAH'})`,
        auditoria_estado: projectToEdit.auditoria_estado || 'CONFORME',
        auditoria_notas: projectToEdit.auditoria_notas || ''
      });
    } else if (isNew) {
      setFormData({
        id: Date.now(),
        codigo: `PRJ-SIAH-${Math.floor(10 + Math.random() * 90)}`,
        nombre: 'Nuevo Proyecto Humanitario SIAH',
        subtitulo: 'Programa Estratégico de Asistencia y Desarrollo Comunitario',
        categoria: 'Producción & Seguridad Alimentaria',
        descripcion_corta: 'Iniciativa orientada a fortalecer las capacidades locales y garantizar entregas auditables con alto impacto.',
        descripcion_larga: 'Memoria descriptiva integral que detalla los componentes de ingeniería, fiduciarios y de protección en terreno. Supervisado bajo estándares internacionales ECHO y USAID.',
        impacto_social: 'Garantiza atención directa a comunidades vulnerables con trazabilidad física verificada.',
        estado: 'EN_EJECUCION',
        avance_porcentaje: 60,
        beneficiarios_directos: 25000,
        inversion_estimada_usd: 750000,
        ubicacion: 'Eje Central de Operaciones',
        cooperantes_clave: ['ECHO - Protección Civil', 'PMA - Alimentos'],
        imagen_url: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=800&q=80',
        imagen_origen: 'BANCO_SIAH',
        color_accent: '#10b981',
        icono: 'Wheat',
        auditoria_estado: 'CONFORME',
        auditor_responsable: `${currentUser.nombre} (${currentUser.cargo || 'Auditor SIAH'})`,
        auditoria_notas: 'Planificación fiduciaria aprobada en mesa de trabajo.'
      });
    }
    setValidationError(null);
  }, [projectToEdit, isNew, isOpen, currentUser]);

  if (!isOpen) return null;

  const handleAddDonor = () => {
    const trimmed = newDonorInput.trim();
    if (!trimmed) return;
    if (!formData.cooperantes_clave.includes(trimmed)) {
      setFormData({
        ...formData,
        cooperantes_clave: [...formData.cooperantes_clave, trimmed]
      });
    }
    setNewDonorInput('');
  };

  const handleRemoveDonor = (indexToRemove: number) => {
    setFormData({
      ...formData,
      cooperantes_clave: formData.cooperantes_clave.filter((_, idx) => idx !== indexToRemove)
    });
  };

  const handleAddPresetDonor = (donor: string) => {
    if (!formData.cooperantes_clave.includes(donor)) {
      setFormData({
        ...formData,
        cooperantes_clave: [...formData.cooperantes_clave, donor]
      });
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nombre.trim()) {
      setValidationError('El nombre del proyecto es obligatorio.');
      setActiveTab('carrusel');
      return;
    }
    if (!formData.codigo.trim()) {
      setValidationError('El código del proyecto es obligatorio.');
      setActiveTab('carrusel');
      return;
    }
    if (!formData.descripcion_corta.trim()) {
      setValidationError('La descripción corta para el carrusel es requerida.');
      setActiveTab('carrusel');
      return;
    }
    if (!formData.descripcion_larga.trim()) {
      setValidationError('La memoria descriptiva para la ficha desplegable es requerida.');
      setActiveTab('ficha');
      return;
    }

    setValidationError(null);
    onSaveProject(formData);
    onClose();
  };

  const renderIconComponent = (iconId: string) => {
    const found = AVAILABLE_ICONS.find(i => i.id === iconId);
    if (!found) return <FolderKanban className="w-5 h-5" />;
    const IconComp = found.icon;
    return <IconComp className="w-5 h-5" />;
  };

  return (
    <>
      <div 
        className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200"
        onClick={onClose}
      >
        <div 
          className="relative w-full max-w-5xl max-h-[94vh] flex flex-col bg-[#000033]/95 border border-white/10 rounded-3xl shadow-[0_16px_48px_rgba(0,0,51,0.95)] backdrop-blur-2xl overflow-hidden text-slate-100"
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div className="p-4 sm:p-5 border-b border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white/[0.03]">
            <div className="flex items-center gap-3">
              <div 
                className="w-10 h-10 rounded-xl flex items-center justify-center border shadow-sm shrink-0"
                style={{
                  backgroundColor: `${formData.color_accent}25`,
                  borderColor: `${formData.color_accent}60`,
                  color: formData.color_accent
                }}
              >
                {renderIconComponent(formData.icono)}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold text-[#38BDF8] uppercase tracking-wider">
                    {isNew ? 'Nuevo Registro de Proyecto' : 'Edición Integral de Proyecto'}
                  </span>
                  <span 
                    className="text-[10px] font-mono px-2 py-0.5 rounded-full border font-bold"
                    style={{
                      borderColor: `${formData.color_accent}60`,
                      backgroundColor: `${formData.color_accent}15`,
                      color: formData.color_accent
                    }}
                  >
                    {formData.codigo || 'SIN CÓDIGO'}
                  </span>
                </div>
                <h3 className="text-base sm:text-lg font-bold text-white truncate max-w-md sm:max-w-xl">
                  {formData.nombre || 'Nombre del Proyecto'}
                </h3>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Preview Toggle Buttons */}
              <div className="flex items-center bg-white/[0.05] p-1 rounded-xl border border-white/10 text-xs font-medium">
                <button
                  type="button"
                  onClick={() => setShowPreview(showPreview === 'carrusel' ? 'none' : 'carrusel')}
                  className={`px-2.5 py-1 rounded-lg flex items-center gap-1.5 transition-all ${
                    showPreview === 'carrusel' 
                      ? 'bg-[#38BDF8] text-[#000033] font-bold shadow-sm' 
                      : 'text-slate-300 hover:text-white'
                  }`}
                  title="Ver cómo se proyecta en el Carrusel 3D"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Previa Carrusel</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowPreview(showPreview === 'ficha' ? 'none' : 'ficha')}
                  className={`px-2.5 py-1 rounded-lg flex items-center gap-1.5 transition-all ${
                    showPreview === 'ficha' 
                      ? 'bg-[#38BDF8] text-[#000033] font-bold shadow-sm' 
                      : 'text-slate-300 hover:text-white'
                  }`}
                  title="Ver cómo se despliega en la Ficha Técnica"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Previa Ficha</span>
                </button>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="p-2 rounded-xl bg-white/[0.05] text-slate-400 hover:text-white border border-white/10 hover:bg-white/10 transition-all"
                title="Cerrar modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Validation Alert */}
          {validationError && (
            <div className="px-6 py-2.5 bg-rose-950/90 border-b border-rose-500/40 text-rose-200 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{validationError}</span>
            </div>
          )}

          {/* Tab Navigation */}
          <div className="flex items-center gap-1.5 px-4 sm:px-6 pt-2.5 pb-2 border-b border-white/10 bg-white/[0.02] overflow-x-auto text-xs font-semibold custom-scrollbar">
            <button
              type="button"
              onClick={() => setActiveTab('carrusel')}
              className={`px-3 py-1.5 rounded-xl flex items-center gap-2 transition-all shrink-0 ${
                activeTab === 'carrusel'
                  ? 'bg-[#38BDF8] text-[#000033] font-bold shadow-[0_0_15px_rgba(56,189,248,0.3)]'
                  : 'text-slate-400 hover:text-white hover:bg-white/[0.05]'
              }`}
            >
              <Palette className="w-3.5 h-3.5" />
              <span>1. Identidad & Carrusel 3D</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('metricas')}
              className={`px-3 py-1.5 rounded-xl flex items-center gap-2 transition-all shrink-0 ${
                activeTab === 'metricas'
                  ? 'bg-[#38BDF8] text-[#000033] font-bold shadow-[0_0_15px_rgba(56,189,248,0.3)]'
                  : 'text-slate-400 hover:text-white hover:bg-white/[0.05]'
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5" />
              <span>2. Métricas & Avance Fiduciario</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('ficha')}
              className={`px-3 py-1.5 rounded-xl flex items-center gap-2 transition-all shrink-0 ${
                activeTab === 'ficha'
                  ? 'bg-[#38BDF8] text-[#000033] font-bold shadow-[0_0_15px_rgba(56,189,248,0.3)]'
                  : 'text-slate-400 hover:text-white hover:bg-white/[0.05]'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>3. Ficha Técnica & Memorias</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('auditoria')}
              className={`px-3 py-1.5 rounded-xl flex items-center gap-2 transition-all shrink-0 ${
                activeTab === 'auditoria'
                  ? 'bg-[#38BDF8] text-[#000033] font-bold shadow-[0_0_15px_rgba(56,189,248,0.3)]'
                  : 'text-slate-400 hover:text-white hover:bg-white/[0.05]'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>4. Donantes & Auditoría</span>
            </button>
          </div>

          {/* Form and Preview Layout */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 custom-scrollbar">
            <div className={`grid gap-6 ${showPreview !== 'none' ? 'lg:grid-cols-12' : 'grid-cols-1'}`}>
              
              {/* Form Column */}
              <form 
                id="form-edit-project" 
                onSubmit={handleSave} 
                className={`space-y-5 ${showPreview !== 'none' ? 'lg:col-span-7' : 'max-w-4xl mx-auto'}`}
              >
                {/* ============================================================ */}
                {/* TAB 1: IDENTIDAD & CARRUSEL 3D                               */}
                {/* ============================================================ */}
                {activeTab === 'carrusel' && (
                  <div className="space-y-4 animate-in fade-in duration-150">
                    <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-4">
                      <h4 className="text-xs font-bold text-[#38BDF8] uppercase tracking-wider flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5" />
                        Identidad del Proyecto y Presentación en el Carrusel 3D
                      </h4>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div className="sm:col-span-2">
                          <label className="text-xs font-semibold text-slate-300 block mb-1">
                            Nombre del Proyecto <span className="text-[#38BDF8]">*</span>
                          </label>
                          <input
                            type="text"
                            required
                            value={formData.nombre}
                            onChange={e => setFormData({ ...formData, nombre: e.target.value })}
                            placeholder="Ej. Mis Delirios Ranch"
                            className="w-full px-3 py-2 rounded-xl bg-white/[0.05] border border-white/10 text-xs text-white focus:outline-none focus:border-[#38BDF8]"
                          />
                        </div>

                        <div>
                          <label className="text-xs font-semibold text-slate-300 block mb-1">
                            Código Oficial <span className="text-[#38BDF8]">*</span>
                          </label>
                          <input
                            type="text"
                            required
                            value={formData.codigo}
                            onChange={e => setFormData({ ...formData, codigo: e.target.value })}
                            placeholder="Ej. PRJ-MDR-01"
                            className="w-full px-3 py-2 rounded-xl bg-white/[0.05] border border-white/10 text-xs text-white font-mono uppercase focus:outline-none focus:border-[#38BDF8]"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="text-xs font-semibold text-slate-300 block mb-1">
                          Subtítulo / Bajada Descriptiva <span className="text-[#38BDF8]">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={formData.subtitulo}
                          onChange={e => setFormData({ ...formData, subtitulo: e.target.value })}
                          placeholder="Ej. Producción Agropecuaria Sustentable y Nutrición Comunitaria"
                          className="w-full px-3 py-2 rounded-xl bg-white/[0.05] border border-white/10 text-xs text-white focus:outline-none focus:border-[#38BDF8]"
                        />
                      </div>

                      {/* Categoría con sugerencias */}
                      <div>
                        <label className="text-xs font-semibold text-slate-300 block mb-1">
                          Categoría / Sector
                        </label>
                        <input
                          type="text"
                          value={formData.categoria}
                          onChange={e => setFormData({ ...formData, categoria: e.target.value })}
                          placeholder="Ej. Producción & Seguridad Alimentaria"
                          className="w-full px-3 py-2 rounded-xl bg-white/[0.05] border border-white/10 text-xs text-white focus:outline-none focus:border-[#38BDF8] mb-2"
                        />
                        <div className="flex flex-wrap gap-1.5">
                          {CATEGORY_SUGGESTIONS.map((cat, idx) => (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => setFormData({ ...formData, categoria: cat })}
                              className={`text-[10px] px-2 py-0.5 rounded-lg border transition-all ${
                                formData.categoria === cat
                                  ? 'bg-[#38BDF8]/20 border-[#38BDF8] text-[#38BDF8] font-bold'
                                  : 'bg-white/[0.03] border-white/10 text-slate-400 hover:text-white'
                              }`}
                            >
                              {cat}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Icono y Color Accent */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                        {/* Selector de Icono */}
                        <div>
                          <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                            Icono del Badge del Carrusel
                          </label>
                          <div className="grid grid-cols-4 gap-1.5 max-h-40 overflow-y-auto p-1.5 bg-black/40 rounded-xl border border-white/10 custom-scrollbar">
                            {AVAILABLE_ICONS.map((item) => {
                              const IconC = item.icon;
                              const isSelected = formData.icono === item.id;
                              return (
                                <button
                                  key={item.id}
                                  type="button"
                                  onClick={() => setFormData({ ...formData, icono: item.id })}
                                  title={item.label}
                                  className={`p-2 rounded-lg flex flex-col items-center justify-center gap-1 transition-all text-center ${
                                    isSelected
                                      ? 'bg-[#38BDF8] text-[#000033] shadow-[0_0_10px_rgba(56,189,248,0.5)] font-bold'
                                      : 'bg-white/[0.04] text-slate-300 hover:bg-white/10 hover:text-white'
                                  }`}
                                >
                                  <IconC className="w-4 h-4 shrink-0" />
                                  <span className="text-[9px] truncate w-full">{item.id}</span>
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        {/* Selector de Color de Acento */}
                        <div>
                          <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                            Color de Acento & Resplandor 3D
                          </label>
                          <div className="space-y-2">
                            <div className="flex flex-wrap gap-2">
                              {COLOR_PRESETS.map((color) => {
                                const isSelected = formData.color_accent.toLowerCase() === color.hex.toLowerCase();
                                return (
                                  <button
                                    key={color.hex}
                                    type="button"
                                    onClick={() => setFormData({ ...formData, color_accent: color.hex })}
                                    title={color.label}
                                    className={`w-7 h-7 rounded-xl transition-all flex items-center justify-center border ${
                                      isSelected
                                        ? 'ring-2 ring-white scale-110 shadow-lg border-white'
                                        : 'border-white/20 hover:scale-105'
                                    }`}
                                    style={{ backgroundColor: color.hex }}
                                  >
                                    {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-white drop-shadow" />}
                                  </button>
                                );
                              })}
                            </div>
                            
                            <div className="flex items-center gap-2 pt-1">
                              <span className="text-[11px] text-slate-400 font-mono">Hex:</span>
                              <input
                                type="text"
                                value={formData.color_accent}
                                onChange={e => setFormData({ ...formData, color_accent: e.target.value })}
                                placeholder="#0284c7"
                                className="w-28 px-2 py-1 rounded-lg bg-white/[0.05] border border-white/10 text-xs text-white font-mono uppercase focus:outline-none focus:border-[#38BDF8]"
                              />
                              <div 
                                className="w-6 h-6 rounded-lg border border-white/20 shadow-sm"
                                style={{ backgroundColor: formData.color_accent }}
                              />
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Fotografía de Fondo con Selector de Origen */}
                      <div className="pt-2 border-t border-white/10">
                        <div className="flex items-center justify-between mb-1.5">
                          <label className="text-xs font-semibold text-slate-300">
                            Fotografía de Fondo del Carrusel & Banner de la Ficha
                          </label>
                          <button
                            type="button"
                            onClick={() => setIsImageSourceModalOpen(true)}
                            className="px-3 py-1 rounded-lg bg-[#38BDF8]/20 hover:bg-[#38BDF8] text-[#38BDF8] hover:text-[#000033] font-bold text-xs flex items-center gap-1.5 border border-[#38BDF8]/40 transition-all shadow-sm"
                          >
                            <Camera className="w-3.5 h-3.5" />
                            <span>Seleccionar Origen de Imagen</span>
                          </button>
                        </div>

                        <div className="flex items-center gap-3">
                          <img
                            src={formData.imagen_url}
                            alt="Previa"
                            className="w-20 h-14 rounded-xl object-cover border border-white/20 shadow-md shrink-0 bg-black/40"
                            referrerPolicy="no-referrer"
                          />
                          <div className="flex-1 min-w-0">
                            <input
                              type="url"
                              value={formData.imagen_url}
                              onChange={e => setFormData({ ...formData, imagen_url: e.target.value, imagen_origen: 'URL_EXTERNA' })}
                              placeholder="https://images.unsplash.com/..."
                              className="w-full px-3 py-2 rounded-xl bg-white/[0.05] border border-white/10 text-xs text-white font-mono focus:outline-none focus:border-[#38BDF8]"
                            />
                            <div className="flex items-center gap-2 mt-1 text-[10px] text-slate-400">
                              <span>Origen actual: </span>
                              <span className="font-mono text-[#38BDF8] font-bold">
                                {formData.imagen_origen === 'ARCHIVO_LOCAL' ? 'Archivo Local' :
                                 formData.imagen_origen === 'BANCO_SIAH' ? 'Banco de Fotos SIAH' :
                                 formData.imagen_origen === 'CAMARA_DIRECTA' ? 'Cámara de Dispositivo' : 'URL Web Externa'}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Descripción Corta (Tarjeta Carrusel) */}
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="text-xs font-semibold text-slate-300">
                            Descripción Corta (Tarjeta del Carrusel) <span className="text-[#38BDF8]">*</span>
                          </label>
                          <span className="text-[10px] text-slate-400 font-mono">
                            {formData.descripcion_corta.length} / 250 caracteres sugeridos
                          </span>
                        </div>
                        <textarea
                          rows={3}
                          required
                          value={formData.descripcion_corta}
                          onChange={e => setFormData({ ...formData, descripcion_corta: e.target.value })}
                          placeholder="Texto sinóptico de alto impacto visual visible al rotar el cilindro del carrusel 3D..."
                          className="w-full px-3 py-2 rounded-xl bg-white/[0.05] border border-white/10 text-xs text-white focus:outline-none focus:border-[#38BDF8] resize-none leading-relaxed"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* ============================================================ */}
                {/* TAB 2: MÉTRICAS & AVANCE FIDUCIARIO                          */}
                {/* ============================================================ */}
                {activeTab === 'metricas' && (
                  <div className="space-y-4 animate-in fade-in duration-150">
                    <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-4">
                      <h4 className="text-xs font-bold text-[#38BDF8] uppercase tracking-wider flex items-center gap-1.5">
                        <TrendingUp className="w-3.5 h-3.5" />
                        Métricas Operativas, Avance Físico & Presupuesto USD
                      </h4>

                      {/* Avance Físico */}
                      <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/10 space-y-2">
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                            <TrendingUp className="w-4 h-4 text-emerald-400" />
                            <span>Porcentaje de Avance Físico / Fiduciario</span>
                          </label>
                          <span className="text-sm font-bold text-white font-mono px-2.5 py-0.5 rounded-lg bg-emerald-950/80 border border-emerald-500/40 text-emerald-300">
                            {formData.avance_porcentaje}%
                          </span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={formData.avance_porcentaje}
                          onChange={e => setFormData({ ...formData, avance_porcentaje: Number(e.target.value) })}
                          className="w-full accent-[#38BDF8] cursor-pointer"
                        />
                        <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-blue-500 to-[#38BDF8] rounded-full transition-all duration-300"
                            style={{ width: `${formData.avance_porcentaje}%` }}
                          />
                        </div>
                      </div>

                      {/* Beneficiarios e Inversión */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="text-xs font-semibold text-slate-300 block mb-1">
                            Beneficiarios Directos Auditados
                          </label>
                          <div className="relative">
                            <Users className="w-4 h-4 text-[#38BDF8] absolute left-3 top-1/2 -translate-y-1/2" />
                            <input
                              type="number"
                              min="0"
                              value={formData.beneficiarios_directos}
                              onChange={e => setFormData({ ...formData, beneficiarios_directos: Number(e.target.value) })}
                              className="w-full pl-9 pr-3 py-2 rounded-xl bg-white/[0.05] border border-white/10 text-xs text-white font-mono focus:outline-none focus:border-[#38BDF8]"
                            />
                          </div>
                          <span className="text-[10px] text-slate-400 mt-1 block font-mono">
                            Impacto: {formData.beneficiarios_directos.toLocaleString()} personas asistidas
                          </span>
                        </div>

                        <div>
                          <label className="text-xs font-semibold text-slate-300 block mb-1">
                            Presupuesto / Inversión Estimada (USD)
                          </label>
                          <div className="relative">
                            <DollarSign className="w-4 h-4 text-emerald-400 absolute left-3 top-1/2 -translate-y-1/2" />
                            <input
                              type="number"
                              min="0"
                              step="5000"
                              value={formData.inversion_estimada_usd}
                              onChange={e => setFormData({ ...formData, inversion_estimada_usd: Number(e.target.value) })}
                              className="w-full pl-9 pr-3 py-2 rounded-xl bg-white/[0.05] border border-white/10 text-xs text-white font-mono focus:outline-none focus:border-[#38BDF8]"
                            />
                          </div>
                          <span className="text-[10px] text-emerald-400 mt-1 block font-mono font-bold">
                            Equivalente: ${(formData.inversion_estimada_usd / 1000).toFixed(0)}k USD (${formData.inversion_estimada_usd.toLocaleString()} USD)
                          </span>
                        </div>
                      </div>

                      {/* Estado Operativo SIAH */}
                      <div>
                        <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                          Estado Operativo en Plataforma
                        </label>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                          {[
                            { val: 'EN_EJECUCION', label: 'En Ejecución', color: 'emerald' },
                            { val: 'COMPLETADO', label: 'Completado', color: 'sky' },
                            { val: 'PLANIFICACION', label: 'Planificación', color: 'amber' },
                            { val: 'AUDITORIA', label: 'En Auditoría', color: 'purple' }
                          ].map((st) => (
                            <button
                              key={st.val}
                              type="button"
                              onClick={() => setFormData({ ...formData, estado: st.val as any })}
                              className={`p-2.5 rounded-xl border text-xs font-bold transition-all text-center ${
                                formData.estado === st.val
                                  ? 'bg-[#38BDF8] text-[#000033] border-[#38BDF8] shadow-[0_0_12px_rgba(56,189,248,0.3)]'
                                  : 'bg-white/[0.03] border-white/10 text-slate-300 hover:bg-white/[0.06]'
                              }`}
                            >
                              {st.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* ============================================================ */}
                {/* TAB 3: FICHA TÉCNICA & MEMORIAS                              */}
                {/* ============================================================ */}
                {activeTab === 'ficha' && (
                  <div className="space-y-4 animate-in fade-in duration-150">
                    <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-4">
                      <h4 className="text-xs font-bold text-[#38BDF8] uppercase tracking-wider flex items-center gap-1.5">
                        <Layers className="w-3.5 h-3.5" />
                        Información Desplegable de la Ficha Técnica (Modal al Seleccionar)
                      </h4>

                      {/* Memoria Descriptiva Larga */}
                      <div>
                        <label className="text-xs font-semibold text-slate-300 block mb-1">
                          Memoria Descriptiva del Proyecto <span className="text-[#38BDF8]">*</span>
                        </label>
                        <p className="text-[11px] text-slate-400 mb-1.5">
                          Se presenta bajo el encabezado "Memoria Descriptiva del Proyecto" cuando el usuario hace clic en el carrusel.
                        </p>
                        <textarea
                          rows={5}
                          required
                          value={formData.descripcion_larga}
                          onChange={e => setFormData({ ...formData, descripcion_larga: e.target.value })}
                          placeholder="Detalle de obras civiles, equipamiento, protocolos de seguridad, fases de implementación, cronograma de entregas..."
                          className="w-full px-3 py-2 rounded-xl bg-white/[0.05] border border-white/10 text-xs text-white focus:outline-none focus:border-[#38BDF8] leading-relaxed resize-none"
                        />
                      </div>

                      {/* Impacto Social Auditado */}
                      <div>
                        <label className="text-xs font-semibold text-slate-300 block mb-1">
                          Impacto Social Auditado en Campo <span className="text-[#38BDF8]">*</span>
                        </label>
                        <p className="text-[11px] text-slate-400 mb-1.5">
                          Aparece resaltado en el recuadro con icono de corazón y borde especial dentro de la ficha desplegable.
                        </p>
                        <textarea
                          rows={3}
                          required
                          value={formData.impacto_social}
                          onChange={e => setFormData({ ...formData, impacto_social: e.target.value })}
                          placeholder="Ej. 18,500 raciones nutritivas mensuales garantizadas para comedores infantiles y hogares de paso..."
                          className="w-full px-3 py-2 rounded-xl bg-white/[0.05] border border-white/10 text-xs text-white focus:outline-none focus:border-[#38BDF8] leading-relaxed resize-none"
                        />
                      </div>

                      {/* Ubicación Geográfica */}
                      <div>
                        <label className="text-xs font-semibold text-slate-300 block mb-1">
                          Ubicación de Operaciones
                        </label>
                        <div className="relative">
                          <MapPin className="w-4 h-4 text-[#38BDF8] absolute left-3 top-1/2 -translate-y-1/2" />
                          <input
                            type="text"
                            value={formData.ubicacion}
                            onChange={e => setFormData({ ...formData, ubicacion: e.target.value })}
                            placeholder="Ej. Faja Agrícola Central, Sector Los Valles"
                            className="w-full pl-9 pr-3 py-2 rounded-xl bg-white/[0.05] border border-white/10 text-xs text-white focus:outline-none focus:border-[#38BDF8]"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* ============================================================ */}
                {/* TAB 4: DONANTES & AUDITORÍA                                  */}
                {/* ============================================================ */}
                {activeTab === 'auditoria' && (
                  <div className="space-y-4 animate-in fade-in duration-150">
                    <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-4">
                      <h4 className="text-xs font-bold text-[#38BDF8] uppercase tracking-wider flex items-center gap-1.5">
                        <Globe className="w-3.5 h-3.5" />
                        Cooperantes, Donantes Clave & Auditoría Concurrente SIAH
                      </h4>

                      {/* Lista de Cooperantes Clave */}
                      <div>
                        <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                          Cooperantes y Donantes Clave
                        </label>
                        
                        {/* Tags actuales */}
                        <div className="flex flex-wrap gap-2 mb-2.5 p-2 bg-black/30 rounded-xl border border-white/10 min-h-12 items-center">
                          {formData.cooperantes_clave.length === 0 && (
                            <span className="text-xs text-slate-500 italic">No hay cooperantes registrados. Agregue uno abajo.</span>
                          )}
                          {formData.cooperantes_clave.map((coop, idx) => (
                            <span 
                              key={idx}
                              className="text-xs px-2.5 py-1 rounded-lg bg-white/[0.08] border border-white/15 text-slate-200 flex items-center gap-1.5"
                            >
                              <span>{coop}</span>
                              <button
                                type="button"
                                onClick={() => handleRemoveDonor(idx)}
                                className="text-slate-400 hover:text-rose-400 transition-colors"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </span>
                          ))}
                        </div>

                        {/* Input para nuevo donante */}
                        <div className="flex gap-2 mb-3">
                          <input
                            type="text"
                            value={newDonorInput}
                            onChange={e => setNewDonorInput(e.target.value)}
                            onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleAddDonor(); } }}
                            placeholder="Escriba el nombre del donante u organismo (ej. ECHO, USAID, OCHA)..."
                            className="flex-1 px-3 py-1.5 rounded-xl bg-white/[0.05] border border-white/10 text-xs text-white focus:outline-none focus:border-[#38BDF8]"
                          />
                          <button
                            type="button"
                            onClick={handleAddDonor}
                            className="px-3.5 py-1.5 rounded-xl bg-[#38BDF8] hover:bg-sky-300 text-[#000033] font-bold text-xs flex items-center gap-1 transition-all"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>Agregar</span>
                          </button>
                        </div>

                        {/* Sugerencias Rápidas con 1 Clic */}
                        <div>
                          <span className="text-[10px] text-slate-400 block mb-1 font-mono">Organismos frecuentes (clic para añadir):</span>
                          <div className="flex flex-wrap gap-1.5">
                            {COMMON_DONORS.map((d, i) => (
                              <button
                                key={i}
                                type="button"
                                onClick={() => handleAddPresetDonor(d)}
                                className="text-[10px] px-2 py-0.5 rounded-lg bg-white/[0.03] hover:bg-[#38BDF8]/20 text-slate-300 hover:text-[#38BDF8] border border-white/10 transition-all"
                              >
                                + {d}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Auditoría Concurrente SIAH */}
                      <div className="pt-3 border-t border-white/10 space-y-3">
                        <h5 className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                          <ShieldCheck className="w-4 h-4 text-emerald-400" />
                          Dictamen & Ficha de Auditoría Concurrente SIAH
                        </h5>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="text-xs font-semibold text-slate-300 block mb-1">
                              Estatus de Auditoría Fiduciaria
                            </label>
                            <select
                              value={formData.auditoria_estado || 'CONFORME'}
                              onChange={e => setFormData({ ...formData, auditoria_estado: e.target.value as any })}
                              className="w-full px-3 py-2 rounded-xl bg-[#000033] border border-white/10 text-xs text-white focus:outline-none focus:border-[#38BDF8]"
                            >
                              <option value="CONFORME" className="bg-[#000033] text-emerald-400">CONFORME (Fondos Verificados & Liberados)</option>
                              <option value="EN_REVISION" className="bg-[#000033] text-amber-400">EN REVISIÓN (Cotejo de Facturas / Bitácora)</option>
                              <option value="OBSERVADO" className="bg-[#000033] text-rose-400">OBSERVADO (Alerta Fiduciaria de Campo)</option>
                              <option value="PENDIENTE" className="bg-[#000033] text-slate-400">PENDIENTE DE VISITA TÉCNICA</option>
                            </select>
                          </div>

                          <div>
                            <label className="text-xs font-semibold text-slate-300 block mb-1">
                              Auditor Responsable Firmante
                            </label>
                            <input
                              type="text"
                              value={formData.auditor_responsable || ''}
                              onChange={e => setFormData({ ...formData, auditor_responsable: e.target.value })}
                              placeholder="Ej. Ing. Carlos Salvati (Auditor Concurrente SIAH)"
                              className="w-full px-3 py-2 rounded-xl bg-white/[0.05] border border-white/10 text-xs text-white focus:outline-none focus:border-[#38BDF8]"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="text-xs font-semibold text-slate-300 block mb-1">
                            Notas Técnicas de Auditoría & Verificación en Terreno
                          </label>
                          <textarea
                            rows={3}
                            value={formData.auditoria_notas || ''}
                            onChange={e => setFormData({ ...formData, auditoria_notas: e.target.value })}
                            placeholder="Registro de inspecciones de campo, cotejo de actas de recepción y cumplimiento de normativas de elegibilidad..."
                            className="w-full px-3 py-2 rounded-xl bg-white/[0.05] border border-white/10 text-xs text-white focus:outline-none focus:border-[#38BDF8] resize-none leading-relaxed"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Form Bottom Action Bar */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
                  <div className="text-[11px] text-slate-400 font-mono">
                    Los cambios se sincronizan en tiempo real con el Carrusel 3D y la Ficha Técnica.
                  </div>

                  <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                    <button
                      type="button"
                      onClick={onClose}
                      className="px-4 py-2 rounded-xl bg-white/[0.05] hover:bg-white/10 text-slate-300 text-xs font-semibold border border-white/10 transition-all"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-2 rounded-xl bg-[#38BDF8] hover:bg-sky-300 text-[#000033] font-bold text-xs flex items-center gap-2 shadow-[0_0_20px_rgba(56,189,248,0.4)] border border-sky-200/50 transition-all hover:scale-[1.02]"
                    >
                      <Save className="w-4 h-4" />
                      <span>{isNew ? 'Registrar Proyecto en MariaDB' : 'Guardar Toda la Información'}</span>
                    </button>
                  </div>
                </div>
              </form>

              {/* ============================================================ */}
              {/* LIVE PREVIEW COLUMN                                          */}
              {/* ============================================================ */}
              {showPreview !== 'none' && (
                <div className="lg:col-span-5 space-y-3">
                  <div className="flex items-center justify-between px-1">
                    <span className="text-xs font-bold text-[#38BDF8] flex items-center gap-1.5 uppercase font-mono">
                      <Eye className="w-3.5 h-3.5" />
                      {showPreview === 'carrusel' ? 'Previsualización: Tarjeta Carrusel 3D' : 'Previsualización: Ficha Desplegable'}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">En vivo</span>
                  </div>

                  {/* PREVIEW: CARRUSEL 3D CARD */}
                  {showPreview === 'carrusel' && (
                    <div 
                      className="relative rounded-2xl p-5 border overflow-hidden backdrop-blur-xl transition-all shadow-2xl flex flex-col justify-between"
                      style={{
                        borderColor: '#38BDF8',
                        backgroundColor: 'rgba(0, 0, 51, 0.85)',
                        boxShadow: `0 0 25px ${formData.color_accent}30`
                      }}
                    >
                      {/* Background image subtle preview */}
                      <div 
                        className="absolute inset-0 bg-cover bg-center -z-10 opacity-25 filter blur-[1px]"
                        style={{ backgroundImage: `url(${formData.imagen_url})` }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#000033] via-[#000033]/85 to-transparent -z-10" />

                      {/* Header */}
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span 
                            className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border shadow-sm"
                            style={{ 
                              borderColor: `${formData.color_accent}60`, 
                              backgroundColor: `${formData.color_accent}20`,
                              color: formData.color_accent 
                            }}
                          >
                            {renderIconComponent(formData.icono)}
                            {formData.codigo || 'PRJ-CODE'}
                          </span>
                          <span className="text-[11px] font-mono text-slate-400 bg-white/5 border border-white/10 px-2 py-0.5 rounded">
                            Vista Carrusel
                          </span>
                        </div>

                        <h3 className="text-lg font-bold text-white leading-snug line-clamp-2">
                          {formData.nombre || 'Nombre del Proyecto'}
                        </h3>
                        <p className="text-xs text-sky-300 font-medium line-clamp-1 mt-0.5">
                          {formData.subtitulo || 'Subtítulo del proyecto'}
                        </p>
                        <p className="text-xs text-slate-300 line-clamp-3 mt-2.5 leading-relaxed">
                          {formData.descripcion_corta || 'Descripción corta orientada a la lectura fluida en el carrusel tridimensional...'}
                        </p>
                      </div>

                      {/* Metrics Bar */}
                      <div className="space-y-2 mt-4 pt-2.5 border-t border-white/10">
                        <div className="flex items-center justify-between text-xs text-slate-300">
                          <span className="flex items-center gap-1 text-slate-400">
                            <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                            Avance Físico
                          </span>
                          <span className="font-bold text-white font-mono">{formData.avance_porcentaje}%</span>
                        </div>
                        {/* Progress bar */}
                        <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-blue-500 to-[#38BDF8] rounded-full transition-all duration-300"
                            style={{ width: `${formData.avance_porcentaje}%` }}
                          />
                        </div>

                        <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                          <span className="flex items-center gap-1 truncate max-w-[150px]">
                            <Users className="w-3 h-3 text-sky-400 shrink-0" />
                            {formData.beneficiarios_directos.toLocaleString()} ben.
                          </span>
                          <span className="font-semibold text-emerald-400 font-mono">
                            ${(formData.inversion_estimada_usd / 1000).toFixed(0)}k USD
                          </span>
                        </div>
                      </div>

                      {/* Card Action Footer */}
                      <div className="w-full mt-3.5 py-2 px-3 bg-[#38BDF8] text-[#000033] text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 shadow-[0_0_15px_rgba(56,189,248,0.35)]">
                        <span>Explorar Proyecto</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </div>
                    </div>
                  )}

                  {/* PREVIEW: FICHA DESPLEGABLE */}
                  {showPreview === 'ficha' && (
                    <div className="rounded-2xl p-4 bg-[#000033]/90 border border-white/10 space-y-4 shadow-2xl max-h-[500px] overflow-y-auto custom-scrollbar">
                      {/* Hero Image Banner Preview */}
                      <div className="relative h-36 rounded-xl overflow-hidden border border-white/10">
                        <img
                          src={formData.imagen_url}
                          alt="Banner Previa"
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#000033] via-[#000033]/40 to-transparent" />
                        <div className="absolute top-2 left-2 flex items-center gap-1.5">
                          <span 
                            className="text-[10px] font-bold px-2 py-0.5 rounded-full border font-mono shadow-sm"
                            style={{ 
                              backgroundColor: `${formData.color_accent}30`,
                              borderColor: `${formData.color_accent}70`,
                              color: formData.color_accent 
                            }}
                          >
                            {formData.codigo}
                          </span>
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-white/[0.08] text-[#38BDF8] border border-white/10">
                            {formData.categoria}
                          </span>
                        </div>
                        <div className="absolute bottom-2 left-2 right-2">
                          <h4 className="text-sm font-bold text-white leading-tight">
                            {formData.nombre || 'Nombre del Proyecto'}
                          </h4>
                          <p className="text-[11px] text-sky-200 truncate">
                            {formData.subtitulo}
                          </p>
                        </div>
                      </div>

                      {/* KPI Strip */}
                      <div className="grid grid-cols-3 gap-2">
                        <div className="p-2 rounded-lg bg-white/[0.04] border border-white/10 text-center">
                          <span className="text-[9px] text-slate-400 block uppercase">Avance</span>
                          <span className="text-xs font-bold text-white font-mono">{formData.avance_porcentaje}%</span>
                        </div>
                        <div className="p-2 rounded-lg bg-white/[0.04] border border-white/10 text-center">
                          <span className="text-[9px] text-slate-400 block uppercase">Beneficiarios</span>
                          <span className="text-xs font-bold text-[#38BDF8] font-mono">{formData.beneficiarios_directos.toLocaleString()}</span>
                        </div>
                        <div className="p-2 rounded-lg bg-white/[0.04] border border-white/10 text-center">
                          <span className="text-[9px] text-slate-400 block uppercase">Inversión</span>
                          <span className="text-xs font-bold text-emerald-400 font-mono">${(formData.inversion_estimada_usd / 1000).toFixed(0)}k</span>
                        </div>
                      </div>

                      {/* Memoria Descriptiva Snippet */}
                      <div>
                        <span className="text-[11px] font-bold text-white uppercase flex items-center gap-1 mb-1">
                          <ShieldCheck className="w-3.5 h-3.5 text-[#38BDF8]" />
                          Memoria Descriptiva
                        </span>
                        <p className="text-[11px] text-slate-300 leading-relaxed line-clamp-4">
                          {formData.descripcion_larga || 'Texto de la memoria técnica descriptiva...'}
                        </p>
                      </div>

                      {/* Social impact */}
                      <div className="p-3 rounded-xl bg-white/[0.03] border border-white/10 text-xs">
                        <span className="font-bold text-[#38BDF8] flex items-center gap-1 mb-0.5 text-[10px] uppercase">
                          <HeartHandshake className="w-3 h-3 text-pink-400" />
                          Impacto Social en Campo:
                        </span>
                        <p className="text-[11px] text-slate-200">{formData.impacto_social}</p>
                      </div>

                      {/* Location & Cooperantes */}
                      <div className="space-y-1.5 text-[11px]">
                        <div className="flex items-center gap-1.5 text-slate-300">
                          <MapPin className="w-3.5 h-3.5 text-[#38BDF8] shrink-0" />
                          <span className="truncate">{formData.ubicacion}</span>
                        </div>
                        <div className="flex flex-wrap gap-1 pt-1">
                          {formData.cooperantes_clave.map((c, i) => (
                            <span key={i} className="text-[10px] px-2 py-0.5 rounded bg-white/[0.05] border border-white/10 text-slate-300">
                              {c}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

            </div>
          </div>
        </div>
      </div>

      {/* SUB-MODAL: Image Source Selector */}
      <ImageSourceSelectorModal
        isOpen={isImageSourceModalOpen}
        onClose={() => setIsImageSourceModalOpen(false)}
        currentImageUrl={formData.imagen_url}
        currentOrigin={formData.imagen_origen}
        profileName={formData.nombre}
        title="Imagen del Proyecto Humanitario & Operativo"
        subtitle="Seleccione una fotografía de alta resolución para el carrusel 3D y la ficha técnica desplegable"
        onSelectImage={(newUrl, newOrigin) => {
          setFormData({
            ...formData,
            imagen_url: newUrl,
            imagen_origen: newOrigin
          });
        }}
      />
    </>
  );
};
