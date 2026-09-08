import React, { useState, useEffect } from 'react';
import { 
  X, 
  UserCheck, 
  Shield, 
  Mail, 
  Briefcase, 
  GraduationCap, 
  Award, 
  Image as ImageIcon, 
  Save, 
  AlertTriangle,
  Lock,
  CheckCircle2,
  Plus,
  Trash2,
  Sparkles,
  Building,
  Clock,
  Sliders,
  Database
} from 'lucide-react';
import { Profesional, Usuario, OrigenImagen } from '../types';
import { ImageSourceSelectorModal } from './ImageSourceSelectorModal';

interface EditProfesionalModalProps {
  isOpen: boolean;
  onClose: () => void;
  profesionalToEdit: Profesional | null;
  isNew?: boolean;
  currentUser: Usuario;
  onSaveProfesional: (prof: Profesional) => void;
}

const PHOTO_PRESETS = [
  { label: 'Ingeniero / Arquitecto', url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80' },
  { label: 'Auditora / Contadora', url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80' },
  { label: 'Abogado / Legal', url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80' },
  { label: 'Ingeniera Civil / Obras', url: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=400&q=80' },
  { label: 'Consultor Senior', url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=400&q=80' },
  { label: 'Especialista Femenina', url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80' }
];

const DEPARTAMENTOS_PRESETS = [
  'Dirección General & Estrategia SIAH',
  'Finanzas y Rendición Multilateral',
  'Legal, Compliance y Gobernanza',
  'Ingeniería y Obras Civiles',
  'Seguridad y Control de Acceso',
  'Tecnología y Telemática en Campo'
];

const CERTIFICACIONES_SUGERIDAS = [
  'PMP® Certified',
  'CPA / Contador Público',
  'ECHO Compliance Master',
  'USAID Certified Grantee',
  'ISO 27001 Lead Implementer',
  'Ingeniero Civil Colegiado',
  'Modelador BIM Revit',
  'Seguridad OHSAS / OSHA',
  'Especialista NIIF',
  'Magíster en Derecho Corporativo',
  'Scrum Master Certified',
  'Evaluador Rápido de Daños (EDAN)'
];

export const EditProfesionalModal: React.FC<EditProfesionalModalProps> = ({
  isOpen,
  onClose,
  profesionalToEdit,
  isNew = false,
  currentUser,
  onSaveProfesional
}) => {
  // Authorization validation: Niveles 1, 2 y 3 autorizados
  const isLevel1 = currentUser.rol_id === 1; // Superadmin
  const isLevel2 = currentUser.rol_id === 2; // Admin / Operativo
  const isLevel3 = currentUser.rol_id === 3; // Auditor
  const isAuthorized = isLevel1 || isLevel2 || isLevel3;

  const [formData, setFormData] = useState<Partial<Profesional>>({});
  const [certInput, setCertInput] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [isImageSourceModalOpen, setIsImageSourceModalOpen] = useState(false);

  useEffect(() => {
    if (profesionalToEdit) {
      setFormData({
        ...profesionalToEdit,
        foto_origen: profesionalToEdit.foto_origen || 'URL_EXTERNA',
        certificaciones: [...(profesionalToEdit.certificaciones || [])]
      });
    } else if (isNew) {
      setFormData({
        id: Date.now(),
        nombre: '',
        cargo: '',
        departamento: DEPARTAMENTOS_PRESETS[0],
        especialidad: '',
        biografia: '',
        certificaciones: ['PMP® Certified', 'ECHO Compliance Master'],
        experiencia_anos: 10,
        foto_url: PHOTO_PRESETS[0].url,
        foto_origen: 'BANCO_SIAH',
        email_corporativo: '',
        orden_visual: 5
      });
    }
    setCertInput('');
    setErrorMsg('');
    setSavedSuccess(false);
  }, [profesionalToEdit, isNew, isOpen]);

  if (!isOpen) return null;

  // Add certification tag
  const handleAddCert = (certName?: string) => {
    const toAdd = (certName || certInput).trim();
    if (!toAdd) return;
    const currentList = formData.certificaciones || [];
    if (!currentList.includes(toAdd)) {
      setFormData({
        ...formData,
        certificaciones: [...currentList, toAdd]
      });
    }
    setCertInput('');
  };

  // Remove certification tag
  const handleRemoveCert = (certToRemove: string) => {
    setFormData({
      ...formData,
      certificaciones: (formData.certificaciones || []).filter(c => c !== certToRemove)
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!isAuthorized) {
      setErrorMsg('Acceso Denegado: La modificación del equipo técnico requiere autorización de Nivel 1, Nivel 2 o Nivel 3.');
      return;
    }

    if (!formData.nombre?.trim()) {
      setErrorMsg('El nombre completo del profesional es obligatorio.');
      return;
    }

    if (!formData.cargo?.trim()) {
      setErrorMsg('El cargo del especialista es obligatorio.');
      return;
    }

    if (!formData.departamento?.trim()) {
      setErrorMsg('El departamento o área técnica es obligatorio.');
      return;
    }

    const finalProfesional: Profesional = {
      id: formData.id || Date.now(),
      nombre: formData.nombre.trim(),
      cargo: formData.cargo.trim(),
      departamento: formData.departamento.trim(),
      especialidad: formData.especialidad?.trim() || 'Especialista Técnico SIAH',
      biografia: formData.biografia?.trim() || 'Profesional de amplia trayectoria en proyectos fiduciarios y de desarrollo.',
      certificaciones: (formData.certificaciones && formData.certificaciones.length > 0) 
        ? formData.certificaciones 
        : ['Acreditación Técnica 360 SIACE'],
      experiencia_anos: Number(formData.experiencia_anos) || 5,
      foto_url: formData.foto_url?.trim() || PHOTO_PRESETS[0].url,
      foto_origen: (formData.foto_origen as OrigenImagen) || profesionalToEdit?.foto_origen || 'URL_EXTERNA',
      email_corporativo: formData.email_corporativo?.trim() || 'contacto@360siace.com',
      orden_visual: Number(formData.orden_visual) || 1
    };

    onSaveProfesional(finalProfesional);
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 1200);
  };

  const roleName = isLevel1 
    ? 'Nivel 1 • Super Administrador' 
    : isLevel2 
      ? 'Nivel 2 • Director Operativo / Admin' 
      : isLevel3 
        ? 'Nivel 3 • Auditor Financiero & Concurrente' 
        : `Nivel ${currentUser.rol_id} • Sin autorización`;

  return (
    <div 
      className="fixed inset-0 z-[70] flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-lg animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-3xl max-h-[92vh] flex flex-col bg-[#000033]/95 border border-white/10 rounded-3xl shadow-[0_12px_40px_rgba(0,0,51,0.95)] backdrop-blur-2xl overflow-hidden text-slate-100"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-white/10 flex items-center justify-between bg-white/[0.03]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/[0.08] border border-[#38BDF8]/40 flex items-center justify-center text-[#38BDF8] shadow-[0_0_15px_rgba(56,189,248,0.2)]">
              <Briefcase className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold text-white">
                  {isNew ? 'Registrar Nuevo Miembro en Quiénes Somos' : `Modificar Ficha: ${formData.nombre || 'Especialista'}`}
                </h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/[0.06] text-[#38BDF8] border border-[#38BDF8]/30 font-semibold">
                  Sección Quiénes Somos
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Equipo Multidisciplinario 360 SIACE • Modelo SIAH
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/[0.05] text-slate-400 hover:text-white border border-white/10 hover:bg-white/10 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Authorization Level Status Banner */}
        <div className="px-6 py-2.5 bg-white/[0.02] border-b border-white/5 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2 text-slate-300">
            <Shield className="w-3.5 h-3.5 text-[#38BDF8]" />
            <span>Operando como: <strong className="text-white">{currentUser.nombre}</strong> ({roleName})</span>
          </div>

          {isAuthorized ? (
            <span className="text-[11px] font-semibold text-emerald-400 flex items-center gap-1.5 bg-emerald-950/40 px-2.5 py-0.5 rounded-md border border-emerald-500/30">
              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
              <span>Modificación Autorizada (Niveles 1, 2 y 3)</span>
            </span>
          ) : (
            <span className="text-[11px] font-semibold text-rose-400 flex items-center gap-1.5 bg-rose-950/40 px-2.5 py-0.5 rounded-md border border-rose-500/30">
              <Lock className="w-3 h-3 text-rose-400" />
              <span>Acceso Restringido: Requiere Nivel 1, 2 o 3</span>
            </span>
          )}
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-6 flex-1 custom-scrollbar">
          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-rose-950/70 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {savedSuccess && (
            <div className="p-3.5 rounded-xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>¡Ficha del especialista técnico actualizada y publicada exitosamente en MariaDB!</span>
            </div>
          )}

          {!isAuthorized && (
            <div className="p-4 rounded-xl bg-amber-950/40 border border-amber-500/30 text-amber-200 text-xs leading-relaxed flex items-start gap-3">
              <Lock className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <strong className="block text-amber-300 font-semibold mb-1">Gobernanza de Seguridad SIAH</strong>
                Usted ha iniciado sesión como <strong>{currentUser.rol_nombre || 'Usuario'}</strong> (Nivel {currentUser.rol_id}).
                La modificación del cuerpo técnico multidisciplinario está reservada para usuarios de <strong>Nivel 1 (Superadmin)</strong>, <strong>Nivel 2 (Director Operativo)</strong> y <strong>Nivel 3 (Auditor Financiero & Concurrente)</strong> para garantizar la idoneidad y el registro de firmas profesionales.
              </div>
            </div>
          )}

          {/* Section 1: Basic Info & Photo Preview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
            {/* Photo preview & quick presets */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-300 block">
                  Fotografía Profesional
                </label>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#000033] text-[#38BDF8] border border-[#38BDF8]/30 font-semibold">
                  {formData.foto_origen === 'ARCHIVO_LOCAL' ? 'PC/Móvil' :
                   formData.foto_origen === 'BANCO_SIAH' ? 'Banco SIAH' :
                   formData.foto_origen === 'AVATAR_GENERADO' ? 'Vector SVG' :
                   formData.foto_origen === 'CAMARA_DIRECTA' ? 'Cámara' : 'URL Web'}
                </span>
              </div>

              <div className="relative w-full h-44 rounded-2xl overflow-hidden border border-white/10 bg-white/[0.02] shadow-inner group">
                <img
                  src={formData.foto_url || PHOTO_PRESETS[0].url}
                  alt={formData.nombre || 'Profesional'}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#000033]/90 via-transparent to-transparent flex items-end justify-between p-2.5">
                  <span className="text-[10px] font-mono font-bold bg-[#000033]/90 text-[#38BDF8] px-2 py-0.5 rounded border border-[#38BDF8]/40">
                    {formData.experiencia_anos || 5}+ años experiencia
                  </span>
                  <button
                    type="button"
                    disabled={!isAuthorized}
                    onClick={() => setIsImageSourceModalOpen(true)}
                    className="p-1 rounded-lg bg-[#000033]/90 text-white hover:text-[#38BDF8] border border-white/20 hover:border-[#38BDF8]/40 transition-all text-[10px] flex items-center gap-1"
                    title="Modificar origen de imagen"
                  >
                    <Sliders className="w-3 h-3 text-[#38BDF8]" />
                    <span>Cambiar</span>
                  </button>
                </div>
              </div>

              {/* Botón Principal: Seleccionar Origen de Imagen */}
              <button
                type="button"
                disabled={!isAuthorized}
                onClick={() => setIsImageSourceModalOpen(true)}
                className="w-full py-2 px-3 rounded-xl bg-white/[0.08] hover:bg-[#38BDF8] text-[#38BDF8] hover:text-[#000033] border border-[#38BDF8]/40 text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-[0_0_12px_rgba(56,189,248,0.2)] disabled:opacity-40 disabled:cursor-not-allowed hover:scale-[1.01]"
              >
                <Sliders className="w-3.5 h-3.5" />
                <span>Seleccionar Origen de Imagen</span>
              </button>

              <div>
                <span className="text-[10px] text-slate-400 uppercase font-semibold tracking-wider block mb-1.5">
                  Presets Rápidos de Fotografía:
                </span>
                <div className="grid grid-cols-3 gap-1.5">
                  {PHOTO_PRESETS.map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      disabled={!isAuthorized}
                      onClick={() => setFormData({ ...formData, foto_url: preset.url, foto_origen: 'BANCO_SIAH' })}
                      className={`text-[9px] font-medium p-1.5 rounded-lg border text-center transition-all truncate ${
                        formData.foto_url === preset.url
                          ? 'border-[#38BDF8] bg-[#38BDF8]/20 text-white font-bold'
                          : 'border-white/10 bg-white/[0.03] text-slate-400 hover:text-white hover:bg-white/[0.08]'
                      }`}
                      title={preset.label}
                    >
                      {preset.label.split(' ')[0]}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-[10px] text-slate-400 block mb-1">
                  O ingresar URL / DataURL de imagen:
                </label>
                <div className="relative flex items-center gap-1.5">
                  <div className="relative flex-1">
                    <ImageIcon className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="url"
                      disabled={!isAuthorized}
                      value={formData.foto_url || ''}
                      onChange={e => setFormData({ ...formData, foto_url: e.target.value })}
                      placeholder="https://... o data:image/..."
                      className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl bg-white/[0.04] border border-white/10 text-white focus:outline-none focus:border-[#38BDF8] transition-all disabled:opacity-50 font-mono"
                    />
                  </div>
                  <button
                    type="button"
                    disabled={!isAuthorized}
                    onClick={() => setIsImageSourceModalOpen(true)}
                    className="p-1.5 rounded-xl bg-white/[0.06] hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 shrink-0 disabled:opacity-40"
                    title="Abrir selector multiorigen"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-[#38BDF8]" />
                  </button>
                </div>
              </div>
            </div>

            {/* Main personal & corporate fields */}
            <div className="md:col-span-2 space-y-4">
              {/* Nombre y Cargo */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Nombre Completo & Grado Académico *
                  </label>
                  <input
                    type="text"
                    required
                    disabled={!isAuthorized}
                    value={formData.nombre || ''}
                    onChange={e => setFormData({ ...formData, nombre: e.target.value })}
                    placeholder="Ej. Ing. Carlos A. Salvatierra"
                    className="w-full px-3.5 py-2 text-xs rounded-xl bg-white/[0.04] border border-white/10 text-white focus:outline-none focus:border-[#38BDF8] transition-all disabled:opacity-50"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Cargo Directivo / Especialista *
                  </label>
                  <input
                    type="text"
                    required
                    disabled={!isAuthorized}
                    value={formData.cargo || ''}
                    onChange={e => setFormData({ ...formData, cargo: e.target.value })}
                    placeholder="Ej. Director Ejecutivo & Arquitecto"
                    className="w-full px-3.5 py-2 text-xs rounded-xl bg-white/[0.04] border border-white/10 text-white focus:outline-none focus:border-[#38BDF8] transition-all disabled:opacity-50"
                  />
                </div>
              </div>

              {/* Departamento y Experiencia */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Departamento Técnico / Dirección *
                  </label>
                  <input
                    type="text"
                    required
                    disabled={!isAuthorized}
                    list="departamentos-list"
                    value={formData.departamento || ''}
                    onChange={e => setFormData({ ...formData, departamento: e.target.value })}
                    placeholder="Ej. Finanzas y Rendición Multilateral"
                    className="w-full px-3.5 py-2 text-xs rounded-xl bg-white/[0.04] border border-white/10 text-white focus:outline-none focus:border-[#38BDF8] transition-all disabled:opacity-50"
                  />
                  <datalist id="departamentos-list">
                    {DEPARTAMENTOS_PRESETS.map((dep, idx) => (
                      <option key={idx} value={dep} />
                    ))}
                  </datalist>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Años de Exp.
                  </label>
                  <div className="relative">
                    <Clock className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="number"
                      min={1}
                      max={50}
                      disabled={!isAuthorized}
                      value={formData.experiencia_anos || 5}
                      onChange={e => setFormData({ ...formData, experiencia_anos: Number(e.target.value) })}
                      className="w-full pl-8 pr-3 py-2 text-xs rounded-xl bg-white/[0.04] border border-white/10 text-white focus:outline-none focus:border-[#38BDF8] transition-all disabled:opacity-50"
                    />
                  </div>
                </div>
              </div>

              {/* Correo y Orden visual */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Email Corporativo
                  </label>
                  <div className="relative">
                    <Mail className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      disabled={!isAuthorized}
                      value={formData.email_corporativo || ''}
                      onChange={e => setFormData({ ...formData, email_corporativo: e.target.value })}
                      placeholder="nombre@360siace.com"
                      className="w-full pl-8 pr-3 py-2 text-xs rounded-xl bg-white/[0.04] border border-white/10 text-white focus:outline-none focus:border-[#38BDF8] transition-all disabled:opacity-50"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Orden Visual
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={99}
                    disabled={!isAuthorized}
                    value={formData.orden_visual || 1}
                    onChange={e => setFormData({ ...formData, orden_visual: Number(e.target.value) })}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-white/[0.04] border border-white/10 text-white focus:outline-none focus:border-[#38BDF8] transition-all disabled:opacity-50"
                  />
                </div>
              </div>

              {/* Especialidad de Dominio */}
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Especialidad Principal & Áreas de Dominio
                </label>
                <input
                  type="text"
                  disabled={!isAuthorized}
                  value={formData.especialidad || ''}
                  onChange={e => setFormData({ ...formData, especialidad: e.target.value })}
                  placeholder="Ej. Auditoría Forense, Fondos ECHO/USAID y Presupuestos Multimoneda"
                  className="w-full px-3.5 py-2 text-xs rounded-xl bg-white/[0.04] border border-white/10 text-white focus:outline-none focus:border-[#38BDF8] transition-all disabled:opacity-50"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Biografía Curricular */}
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">
              Biografía / Reseña Profesional (Visible en la sección "Quiénes Somos")
            </label>
            <textarea
              rows={3}
              disabled={!isAuthorized}
              value={formData.biografia || ''}
              onChange={e => setFormData({ ...formData, biografia: e.target.value })}
              placeholder="Describa la trayectoria fiduciaria, operativa o técnica del especialista..."
              className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-white/[0.04] border border-white/10 text-white focus:outline-none focus:border-[#38BDF8] transition-all custom-scrollbar disabled:opacity-50 leading-relaxed"
            />
          </div>

          {/* Section 3: Certificaciones y Acreditaciones Clave */}
          <div className="space-y-3 pt-2 border-t border-white/10">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Award className="w-4 h-4 text-amber-400" />
                <span>Acreditaciones y Certificaciones Oficiales</span>
              </label>
              <span className="text-[11px] text-slate-400">
                {(formData.certificaciones || []).length} acreditaciones asignadas
              </span>
            </div>

            {/* Active Tags */}
            <div className="flex flex-wrap gap-1.5 min-h-[36px] p-2.5 rounded-xl bg-white/[0.02] border border-white/10">
              {(formData.certificaciones || []).map((cert, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-mono bg-white/[0.06] text-[#38BDF8] border border-[#38BDF8]/30 shadow-sm"
                >
                  <Award className="w-3 h-3 text-amber-400 shrink-0" />
                  <span>{cert}</span>
                  {isAuthorized && (
                    <button
                      type="button"
                      onClick={() => handleRemoveCert(cert)}
                      className="text-slate-400 hover:text-rose-400 ml-1 transition-colors"
                      title="Eliminar certificación"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </span>
              ))}
              {(formData.certificaciones || []).length === 0 && (
                <span className="text-xs text-slate-500 italic">No hay acreditaciones agregadas aún.</span>
              )}
            </div>

            {/* Add Custom Certification */}
            {isAuthorized && (
              <div className="flex gap-2">
                <input
                  type="text"
                  value={certInput}
                  onChange={e => setCertInput(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddCert();
                    }
                  }}
                  placeholder="Escriba el nombre de una certificación (ej. PMP, CPA, BIM, ISO)..."
                  className="flex-1 px-3.5 py-1.5 text-xs rounded-xl bg-white/[0.04] border border-white/10 text-white focus:outline-none focus:border-[#38BDF8]"
                />
                <button
                  type="button"
                  onClick={() => handleAddCert()}
                  className="px-3.5 py-1.5 rounded-xl bg-white/[0.08] hover:bg-[#38BDF8] text-white hover:text-[#000033] text-xs font-semibold border border-white/10 transition-all flex items-center gap-1 shrink-0"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Agregar</span>
                </button>
              </div>
            )}

            {/* Certification Quick Suggestions */}
            {isAuthorized && (
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-semibold tracking-wider block mb-1.5">
                  Acreditaciones Fiduciarias e Ingenieriles Sugeridas:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {CERTIFICACIONES_SUGERIDAS.map((sug, idx) => {
                    const isAlreadyAdded = (formData.certificaciones || []).includes(sug);
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleAddCert(sug)}
                        disabled={isAlreadyAdded}
                        className={`text-[10px] font-mono px-2 py-0.5 rounded-md border transition-all ${
                          isAlreadyAdded
                            ? 'bg-emerald-950/40 text-emerald-400 border-emerald-500/30 opacity-60 cursor-default'
                            : 'bg-white/[0.03] text-slate-300 border-white/10 hover:border-[#38BDF8]/40 hover:text-white hover:bg-white/[0.08]'
                        }`}
                      >
                        {isAlreadyAdded ? `✓ ${sug}` : `+ ${sug}`}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Form Actions Footer */}
          <div className="pt-4 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
              <Database className="w-3.5 h-3.5 text-[#38BDF8]" />
              <span>MariaDB 10.11 LTS • Tabla \`profesionales\` (foto_url & foto_origen)</span>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 sm:flex-none px-4 py-2 rounded-xl bg-white/[0.05] hover:bg-white/10 text-slate-300 text-xs font-semibold border border-white/10 transition-all"
              >
                Cancelar
              </button>

              <button
                type="submit"
                disabled={!isAuthorized}
                className="flex-1 sm:flex-none px-5 py-2 rounded-xl bg-[#38BDF8] hover:bg-[#0284C7] text-[#000033] hover:text-white text-xs font-bold transition-all shadow-[0_0_20px_rgba(56,189,248,0.3)] flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Save className="w-4 h-4" />
                <span>{isNew ? 'Registrar Especialista' : 'Guardar Cambios de Ficha'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Sub-modal: Selector de Origen de Imagen para Profesional */}
      <ImageSourceSelectorModal
        isOpen={isImageSourceModalOpen}
        onClose={() => setIsImageSourceModalOpen(false)}
        currentImageUrl={formData.foto_url || ''}
        currentOrigin={formData.foto_origen}
        profileName={formData.nombre || 'Especialista SIAH'}
        title="Origen de Fotografía del Especialista"
        subtitle="Seleccionar fuente para la ficha en Quiénes Somos y guardar en MariaDB"
        onSelectImage={(newUrl, newOrigin) => {
          setFormData(prev => ({
            ...prev,
            foto_url: newUrl,
            foto_origen: newOrigin
          }));
        }}
      />
    </div>
  );
};
