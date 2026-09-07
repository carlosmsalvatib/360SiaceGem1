import React, { useState } from 'react';
import { 
  X, 
  Settings, 
  FileText, 
  FolderKanban, 
  Layers, 
  Users, 
  ShieldAlert, 
  Save, 
  Plus, 
  Trash2, 
  Edit3, 
  Check, 
  Sparkles,
  RefreshCw,
  Eye
} from 'lucide-react';
import { 
  ConfigCMS, 
  Proyecto, 
  ServicioEspecializado, 
  Profesional, 
  Usuario, 
  Rol 
} from '../types';

interface CmsBackofficeModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: Usuario;
  config: ConfigCMS;
  onUpdateConfig: (newConfig: ConfigCMS) => void;
  proyectos: Proyecto[];
  onUpdateProyectos: (newProyectos: Proyecto[]) => void;
  servicios: ServicioEspecializado[];
  onUpdateServicios: (newServicios: ServicioEspecializado[]) => void;
  profesionales: Profesional[];
  onUpdateProfesionales: (newProfesionales: Profesional[]) => void;
  usuarios: Usuario[];
  onUpdateUsuarios: (newUsuarios: Usuario[]) => void;
  roles: Rol[];
}

export const CmsBackofficeModal: React.FC<CmsBackofficeModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  config,
  onUpdateConfig,
  proyectos,
  onUpdateProyectos,
  servicios,
  onUpdateServicios,
  profesionales,
  onUpdateProfesionales,
  usuarios,
  onUpdateUsuarios,
  roles
}) => {
  const [activeTab, setActiveTab] = useState<'textos' | 'proyectos' | 'servicios' | 'profesionales' | 'usuarios'>('textos');
  
  // Local state for live form editing
  const [editableConfig, setEditableConfig] = useState<ConfigCMS>({ ...config });
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Proyectos state
  const [editingProject, setEditingProject] = useState<Proyecto | null>(null);

  // Usuarios state
  const [editingUser, setEditingUser] = useState<Usuario | null>(null);
  const [newUserModal, setNewUserModal] = useState(false);
  const [newUserData, setNewUserData] = useState({
    nombre: '',
    email: '',
    rol_id: 2,
    estado: 'ACTIVO' as const
  });

  if (!isOpen) return null;

  const handleSaveTextos = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateConfig(editableConfig);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleSaveProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProject) return;
    const updated = proyectos.map(p => p.id === editingProject.id ? editingProject : p);
    onUpdateProyectos(updated);
    setEditingProject(null);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  const handleDeleteProject = (id: number) => {
    if (confirm('¿Está seguro de eliminar este proyecto del catálogo?')) {
      const updated = proyectos.filter(p => p.id !== id);
      onUpdateProyectos(updated);
    }
  };

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    const rolObj = roles.find(r => r.id === Number(newUserData.rol_id));
    const newUser: Usuario = {
      id: Date.now(),
      nombre: newUserData.nombre,
      email: newUserData.email,
      rol_id: Number(newUserData.rol_id),
      rol_nombre: rolObj?.nombre || 'Usuario',
      estado: newUserData.estado,
      creado_en: new Date().toISOString().split('T')[0]
    };
    onUpdateUsuarios([...usuarios, newUser]);
    setNewUserModal(false);
    setNewUserData({ nombre: '', email: '', rol_id: 2, estado: 'ACTIVO' });
  };

  const handleDeleteUser = (id: number) => {
    if (confirm('¿Desea dar de baja esta cuenta de usuario?')) {
      onUpdateUsuarios(usuarios.filter(u => u.id !== id));
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-5xl max-h-[92vh] flex flex-col bg-[#000033]/90 border border-white/10 rounded-3xl shadow-[0_8px_32px_0_rgba(0,0,51,0.8)] backdrop-blur-2xl overflow-hidden text-slate-100"
        onClick={e => e.stopPropagation()}
      >
        {/* Top Bar */}
        <div className="p-5 border-b border-white/10 flex items-center justify-between bg-white/[0.03]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/[0.08] border border-[#38BDF8]/40 flex items-center justify-center text-[#38BDF8] shadow-[0_0_15px_rgba(56,189,248,0.2)]">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-white">
                  Panel de Administración & CMS Integral
                </h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/[0.05] text-[#38BDF8] border border-[#38BDF8]/30 font-semibold">
                  {currentUser.rol_nombre}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Edite textos, proyectos, 10 servicios, profesionales y cuentas sin tocar código fuente.
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

        {/* Tab Headers */}
        <div className="flex items-center gap-1 px-6 pt-3 pb-2 border-b border-white/10 bg-white/[0.02] overflow-x-auto text-xs font-semibold">
          <button
            onClick={() => setActiveTab('textos')}
            className={`px-3.5 py-2 rounded-xl flex items-center gap-2 transition-all shrink-0 ${
              activeTab === 'textos' ? 'bg-[#38BDF8] text-[#000033] font-bold shadow-[0_0_15px_rgba(56,189,248,0.3)]' : 'text-slate-400 hover:text-white hover:bg-white/[0.05]'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>1. Textos & Copywriting</span>
          </button>

          <button
            onClick={() => setActiveTab('proyectos')}
            className={`px-3.5 py-2 rounded-xl flex items-center gap-2 transition-all shrink-0 ${
              activeTab === 'proyectos' ? 'bg-[#38BDF8] text-[#000033] font-bold shadow-[0_0_15px_rgba(56,189,248,0.3)]' : 'text-slate-400 hover:text-white hover:bg-white/[0.05]'
            }`}
          >
            <FolderKanban className="w-3.5 h-3.5" />
            <span>2. Proyectos & Carrusel 3D ({proyectos.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('servicios')}
            className={`px-3.5 py-2 rounded-xl flex items-center gap-2 transition-all shrink-0 ${
              activeTab === 'servicios' ? 'bg-[#38BDF8] text-[#000033] font-bold shadow-[0_0_15px_rgba(56,189,248,0.3)]' : 'text-slate-400 hover:text-white hover:bg-white/[0.05]'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>3. 10 Servicios ({servicios.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('profesionales')}
            className={`px-3.5 py-2 rounded-xl flex items-center gap-2 transition-all shrink-0 ${
              activeTab === 'profesionales' ? 'bg-[#38BDF8] text-[#000033] font-bold shadow-[0_0_15px_rgba(56,189,248,0.3)]' : 'text-slate-400 hover:text-white hover:bg-white/[0.05]'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>4. Quiénes Somos / Equipo ({profesionales.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('usuarios')}
            className={`px-3.5 py-2 rounded-xl flex items-center gap-2 transition-all shrink-0 ${
              activeTab === 'usuarios' ? 'bg-[#38BDF8] text-[#000033] font-bold shadow-[0_0_15px_rgba(56,189,248,0.3)]' : 'text-slate-400 hover:text-white hover:bg-white/[0.05]'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>5. Usuarios & Roles ({usuarios.length})</span>
          </button>
        </div>

        {/* Tab Body */}
        <div className="p-6 overflow-y-auto flex-1 text-xs">
          
          {/* Status Message */}
          {savedSuccess && (
            <div className="mb-4 p-3 rounded-xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2 animate-in fade-in">
              <Check className="w-4 h-4" />
              <span>¡Cambios guardados con éxito! El portal público se actualizó en tiempo real.</span>
            </div>
          )}

          {/* TAB 1: TEXTOS & COPYWRITING */}
          {activeTab === 'textos' && (
            <form onSubmit={handleSaveTextos} className="space-y-5">
              <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-4">
                <h4 className="text-sm font-bold text-[#38BDF8] flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#38BDF8]" />
                  Textos del Hero Principal & Propuesta de Valor
                </h4>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Tagline / Antetítulo Superior
                  </label>
                  <input
                    type="text"
                    value={editableConfig.hero_tagline}
                    onChange={e => setEditableConfig({ ...editableConfig, hero_tagline: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-white/[0.05] border border-white/10 text-white focus:outline-none focus:border-[#38BDF8] backdrop-blur-md"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Título Principal de Impacto (H1)
                  </label>
                  <input
                    type="text"
                    value={editableConfig.hero_titulo}
                    onChange={e => setEditableConfig({ ...editableConfig, hero_titulo: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-white/[0.05] border border-white/10 text-white focus:outline-none focus:border-[#38BDF8] backdrop-blur-md"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Subtítulo / Bajada
                  </label>
                  <input
                    type="text"
                    value={editableConfig.hero_subtitulo}
                    onChange={e => setEditableConfig({ ...editableConfig, hero_subtitulo: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-white/[0.05] border border-white/10 text-white focus:outline-none focus:border-[#38BDF8] backdrop-blur-md"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Texto de Apoyo Central (Hero Body)
                  </label>
                  <textarea
                    rows={4}
                    value={editableConfig.hero_parrafo_apoyo}
                    onChange={e => setEditableConfig({ ...editableConfig, hero_parrafo_apoyo: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-white/[0.05] border border-white/10 text-white focus:outline-none focus:border-[#38BDF8] backdrop-blur-md resize-none leading-relaxed"
                  />
                </div>
              </div>

              {/* Call to action text */}
              <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-4">
                <h4 className="text-sm font-bold text-[#38BDF8]">
                  Llamado a la Acción (CTA) & Datos de Contacto Oficial
                </h4>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Título del CTA
                  </label>
                  <input
                    type="text"
                    value={editableConfig.cta_titulo}
                    onChange={e => setEditableConfig({ ...editableConfig, cta_titulo: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-white/[0.05] border border-white/10 text-white focus:outline-none focus:border-[#38BDF8] backdrop-blur-md"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1">
                      Teléfono Corporativo
                    </label>
                    <input
                      type="text"
                      value={editableConfig.cta_telefono}
                      onChange={e => setEditableConfig({ ...editableConfig, cta_telefono: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-white/[0.05] border border-white/10 text-white focus:outline-none focus:border-[#38BDF8] backdrop-blur-md"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1">
                      Correo Electrónico
                    </label>
                    <input
                      type="email"
                      value={editableConfig.cta_email}
                      onChange={e => setEditableConfig({ ...editableConfig, cta_email: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-white/[0.05] border border-white/10 text-white focus:outline-none focus:border-[#38BDF8] backdrop-blur-md"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-[#38BDF8] hover:bg-sky-300 text-[#000033] font-bold text-xs flex items-center gap-2 shadow-[0_0_20px_rgba(56,189,248,0.4)] border border-sky-200/50 transition-all hover:scale-[1.01]"
                >
                  <Save className="w-4 h-4" />
                  <span>Guardar Textos en MariaDB</span>
                </button>
              </div>
            </form>
          )}

          {/* TAB 2: PROYECTOS & CARRUSEL 3D */}
          {activeTab === 'proyectos' && (
            <div className="space-y-4">
              {editingProject ? (
                <form onSubmit={handleSaveProject} className="p-4 rounded-2xl bg-white/[0.04] border border-white/10 space-y-4">
                  <div className="flex items-center justify-between border-b border-white/10 pb-2">
                    <h4 className="text-sm font-bold text-[#38BDF8]">
                      Editando Proyecto: {editingProject.nombre}
                    </h4>
                    <button
                      type="button"
                      onClick={() => setEditingProject(null)}
                      className="text-slate-400 hover:text-white text-xs"
                    >
                      Cancelar
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-semibold text-slate-300 block mb-1">Nombre</label>
                      <input
                        type="text"
                        value={editingProject.nombre}
                        onChange={e => setEditingProject({ ...editingProject, nombre: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl bg-white/[0.05] border border-white/10 text-white focus:outline-none focus:border-[#38BDF8] backdrop-blur-md"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-slate-300 block mb-1">Subtítulo</label>
                      <input
                        type="text"
                        value={editingProject.subtitulo}
                        onChange={e => setEditingProject({ ...editingProject, subtitulo: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl bg-white/[0.05] border border-white/10 text-white focus:outline-none focus:border-[#38BDF8] backdrop-blur-md"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="text-xs font-semibold text-slate-300 block mb-1">Avance Físico (%)</label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={editingProject.avance_porcentaje}
                        onChange={e => setEditingProject({ ...editingProject, avance_porcentaje: Number(e.target.value) })}
                        className="w-full px-3 py-2 rounded-xl bg-white/[0.05] border border-white/10 text-white font-mono focus:outline-none focus:border-[#38BDF8] backdrop-blur-md"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-slate-300 block mb-1">Beneficiarios</label>
                      <input
                        type="number"
                        value={editingProject.beneficiarios_directos}
                        onChange={e => setEditingProject({ ...editingProject, beneficiarios_directos: Number(e.target.value) })}
                        className="w-full px-3 py-2 rounded-xl bg-white/[0.05] border border-white/10 text-white font-mono focus:outline-none focus:border-[#38BDF8] backdrop-blur-md"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-slate-300 block mb-1">Inversión (USD)</label>
                      <input
                        type="number"
                        value={editingProject.inversion_estimada_usd}
                        onChange={e => setEditingProject({ ...editingProject, inversion_estimada_usd: Number(e.target.value) })}
                        className="w-full px-3 py-2 rounded-xl bg-white/[0.05] border border-white/10 text-white font-mono focus:outline-none focus:border-[#38BDF8] backdrop-blur-md"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1">Descripción Corta</label>
                    <textarea
                      rows={2}
                      value={editingProject.descripcion_corta}
                      onChange={e => setEditingProject({ ...editingProject, descripcion_corta: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-white/[0.05] border border-white/10 text-white resize-none focus:outline-none focus:border-[#38BDF8] backdrop-blur-md"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1">Impacto Social Auditado</label>
                    <input
                      type="text"
                      value={editingProject.impacto_social}
                      onChange={e => setEditingProject({ ...editingProject, impacto_social: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-white/[0.05] border border-white/10 text-white focus:outline-none focus:border-[#38BDF8] backdrop-blur-md"
                    />
                  </div>

                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setEditingProject(null)}
                      className="px-4 py-2 rounded-xl bg-white/[0.05] text-slate-300 hover:text-white border border-white/10 text-xs transition-all"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 rounded-xl bg-[#38BDF8] hover:bg-sky-300 text-[#000033] text-xs font-bold shadow-[0_0_15px_rgba(56,189,248,0.3)] transition-all"
                    >
                      Guardar Cambios
                    </button>
                  </div>
                </form>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">
                      Catálogo de los 6 proyectos iniciales que alimentan el Carrusel 3D y las Landing Pages:
                    </span>
                  </div>

                  <div className="grid grid-cols-1 gap-3">
                    {proyectos.map((p, idx) => (
                      <div
                        key={p.id}
                        className="p-3.5 rounded-xl bg-white/[0.03] border border-white/10 flex items-center justify-between gap-4"
                      >
                        <div className="flex items-center gap-3">
                          <span className="w-7 h-7 rounded-lg bg-white/[0.08] border border-white/10 text-[#38BDF8] font-mono font-bold flex items-center justify-center text-xs">
                            {idx + 1}
                          </span>
                          <div>
                            <div className="font-bold text-white flex items-center gap-2">
                              <span>{p.nombre}</span>
                              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/[0.05] text-slate-400 border border-white/10">
                                {p.codigo}
                              </span>
                            </div>
                            <div className="text-slate-400 text-[11px] truncate max-w-md">
                              {p.subtitulo}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <span className="font-mono text-[#38BDF8] font-semibold text-xs">
                            {p.avance_porcentaje}% avance
                          </span>
                          <button
                            onClick={() => setEditingProject(p)}
                            className="p-1.5 rounded-lg bg-white/[0.05] hover:bg-[#38BDF8] text-[#38BDF8] hover:text-[#000033] border border-white/10 transition-all"
                            title="Editar"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: 10 SERVICIOS */}
          {activeTab === 'servicios' && (
            <div className="space-y-3">
              <span className="text-slate-400 block mb-2">
                Los 10 Servicios Especializados One-Stop-Shop sincronizados con la base de datos MariaDB:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {servicios.map((s) => (
                  <div key={s.id} className="p-3.5 rounded-xl bg-white/[0.03] border border-white/10">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-white">{s.numero}. {s.titulo}</span>
                      <span className="text-[10px] font-mono text-[#38BDF8] bg-white/[0.05] border border-[#38BDF8]/30 px-2 py-0.5 rounded-full">
                        Pilar {s.area_id.split('-')[0]}
                      </span>
                    </div>
                    <p className="text-slate-300 text-[11px] line-clamp-2">{s.descripcion}</p>
                    <div className="mt-2 text-[10px] text-slate-400 font-mono truncate">
                      Norma: {s.normativas_referencia}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: PROFESIONALES */}
          {activeTab === 'profesionales' && (
            <div className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {profesionales.map((prof) => (
                  <div key={prof.id} className="p-4 rounded-xl bg-white/[0.03] border border-white/10 flex items-start gap-3">
                    <img
                      src={prof.foto_url}
                      alt={prof.nombre}
                      className="w-12 h-12 rounded-xl object-cover border border-white/10 shrink-0"
                      referrerPolicy="no-referrer"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-white truncate">{prof.nombre}</div>
                      <div className="text-[#38BDF8] text-[11px] truncate">{prof.cargo}</div>
                      <div className="text-slate-400 text-[10px] truncate">{prof.email_corporativo}</div>
                      <div className="text-[10px] font-mono text-slate-400 mt-1">
                        {prof.experiencia_anos} años de experiencia
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: USUARIOS & ROLES */}
          {activeTab === 'usuarios' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">
                  Cuentas activas en la tabla <code className="text-[#38BDF8] font-mono">usuarios</code>:
                </span>
                <button
                  onClick={() => setNewUserModal(true)}
                  className="px-3 py-1.5 rounded-xl bg-[#38BDF8] hover:bg-sky-300 text-[#000033] text-xs font-bold flex items-center gap-1.5 shadow-[0_0_15px_rgba(56,189,248,0.3)] transition-all"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Nuevo Usuario</span>
                </button>
              </div>

              {newUserModal && (
                <form onSubmit={handleAddUser} className="p-4 rounded-2xl bg-[#000033] border border-[#38BDF8]/40 space-y-3 shadow-xl">
                  <h4 className="text-sm font-bold text-[#38BDF8]">Registrar Usuario en MariaDB</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="text-[11px] text-slate-300 block mb-1">Nombre Completo</label>
                      <input
                        type="text"
                        required
                        value={newUserData.nombre}
                        onChange={e => setNewUserData({ ...newUserData, nombre: e.target.value })}
                        placeholder="Ej. Ing. Laura Salas"
                        className="w-full px-3 py-1.5 rounded-lg bg-white/[0.05] border border-white/10 text-white focus:outline-none focus:border-[#38BDF8]"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-slate-300 block mb-1">Correo Electrónico</label>
                      <input
                        type="email"
                        required
                        value={newUserData.email}
                        onChange={e => setNewUserData({ ...newUserData, email: e.target.value })}
                        placeholder="lsalas@360siace.com"
                        className="w-full px-3 py-1.5 rounded-lg bg-white/[0.05] border border-white/10 text-white focus:outline-none focus:border-[#38BDF8]"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-slate-300 block mb-1">Rol Asignado</label>
                      <select
                        value={newUserData.rol_id}
                        onChange={e => setNewUserData({ ...newUserData, rol_id: Number(e.target.value) })}
                        className="w-full px-3 py-1.5 rounded-lg bg-[#000033] border border-white/10 text-white focus:outline-none focus:border-[#38BDF8]"
                      >
                        {roles.map(r => (
                          <option key={r.id} value={r.id} className="bg-[#000033] text-white">{r.nombre}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="flex justify-end gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setNewUserModal(false)}
                      className="px-3 py-1.5 rounded-lg bg-white/[0.05] text-slate-300 hover:text-white border border-white/10"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-1.5 rounded-lg bg-[#38BDF8] hover:bg-sky-300 text-[#000033] font-bold shadow-[0_0_15px_rgba(56,189,248,0.3)]"
                    >
                      Guardar Usuario
                    </button>
                  </div>
                </form>
              )}

              <div className="space-y-2">
                {usuarios.map((user) => (
                  <div
                    key={user.id}
                    className="p-3.5 rounded-xl bg-white/[0.03] border border-white/10 flex items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-white/[0.08] border border-white/10 flex items-center justify-center text-xs font-bold text-[#38BDF8]">
                        {user.nombre.charAt(0)}
                      </div>
                      <div>
                        <div className="font-bold text-white flex items-center gap-2">
                          <span>{user.nombre}</span>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/[0.05] text-[#38BDF8] border border-[#38BDF8]/30">
                            {user.rol_nombre}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-400 font-mono">
                          {user.email}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-emerald-950/80 text-emerald-400 border border-emerald-500/30">
                        {user.estado}
                      </span>
                      {user.id !== currentUser.id && (
                        <button
                          onClick={() => handleDeleteUser(user.id)}
                          className="p-1.5 rounded-lg bg-rose-950/40 hover:bg-rose-600 text-rose-300 hover:text-white border border-rose-500/30 transition-all"
                          title="Eliminar usuario"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-white/10 bg-white/[0.02] flex items-center justify-between text-xs text-slate-400">
          <span>
            Sesión iniciada como: <strong className="text-white">{currentUser.nombre}</strong> ({currentUser.rol_nombre})
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-white/[0.05] hover:bg-white/10 text-slate-200 text-xs font-semibold border border-white/10 transition-all"
          >
            Cerrar Panel
          </button>
        </div>

      </div>
    </div>
  );
};
