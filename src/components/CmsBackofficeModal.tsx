import React, { useState, useEffect } from 'react';
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
  Eye,
  ShieldCheck,
  Lock,
  UserCheck,
  FileCheck,
  BarChart3,
  Award,
  Download,
  AlertCircle,
  Phone,
  Mail,
  Building,
  Briefcase,
  Shield,
  CheckCircle2,
  AlertTriangle,
  MapPin,
  TrendingUp,
  Users as UsersIcon,
  DollarSign,
  Clock
} from 'lucide-react';
import { 
  ConfigCMS, 
  Proyecto, 
  ServicioEspecializado, 
  Profesional, 
  Usuario, 
  Rol,
  OrigenImagen
} from '../types';
import { EditUserModal } from './EditUserModal';
import { EditProfesionalModal } from './EditProfesionalModal';
import { EditProjectModal } from './EditProjectModal';
import { ImageSourceSelectorModal } from './ImageSourceSelectorModal';

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
  onSwitchUser?: (user: Usuario) => void;
  initialTab?: string;
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
  roles,
  onSwitchUser,
  initialTab
}) => {
  // Determine role code and authorization clearance level
  const userRole = roles.find(r => r.id === currentUser.rol_id) || roles[0];
  const roleCode = userRole.codigo; // 'SUPERADMIN' | 'ADMIN' | 'AUDITOR' | 'EDITOR' | 'CONSULTOR'
  const isSuperAdmin = currentUser.rol_id === 1;
  const isAdmin = currentUser.rol_id === 2;
  const isAuditor = currentUser.rol_id === 3;
  const isEditor = currentUser.rol_id === 4;
  const isConsultor = currentUser.rol_id === 5;

  // Active tab state
  const [activeTab, setActiveTab] = useState<string>(initialTab || 'perfil');

  // Reset tab to 'perfil' or role-specific primary when user changes
  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
      return;
    }
    if (isSuperAdmin) setActiveTab('usuarios');
    else if (isAdmin) setActiveTab('proyectos');
    else if (isAuditor) setActiveTab('mesa_auditoria');
    else if (isEditor) setActiveTab('textos');
    else if (isConsultor) setActiveTab('monitor_kpis');
    else setActiveTab('perfil');
  }, [currentUser.id, currentUser.rol_id, initialTab]);

  // Local state for forms
  const [editableConfig, setEditableConfig] = useState<ConfigCMS>({ ...config });
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // Proyectos state
  const [editingProject, setEditingProject] = useState<Proyecto | null>(null);
  const [projectToEditInModal, setProjectToEditInModal] = useState<Proyecto | null>(null);
  const [isNewProjectModal, setIsNewProjectModal] = useState(false);

  // User editing modal
  const [userToEditModal, setUserToEditModal] = useState<Usuario | null>(null);

  // Professional editing modal state (Levels 1, 2 and 3)
  const [profesionalToEdit, setProfesionalToEdit] = useState<Profesional | null>(null);
  const [isNewProfesionalModal, setIsNewProfesionalModal] = useState(false);

  // New user form state (for Superadmin and Admin)
  const [newUserModal, setNewUserModal] = useState(false);
  const [newUserData, setNewUserData] = useState({
    nombre: '',
    email: '',
    rol_id: isAdmin ? 3 : 2,
    cargo: '',
    telefono: '',
    organizacion: '360 SIACE',
    estado: 'ACTIVO' as const
  });

  // Auditor inspection state for active project
  const [selectedAuditProjectId, setSelectedAuditProjectId] = useState<number>(proyectos[0]?.id || 1);
  const [auditNotes, setAuditNotes] = useState('');
  const [auditStatus, setAuditStatus] = useState<'CONFORME' | 'OBSERVADO' | 'EN_REVISION' | 'PENDIENTE'>('CONFORME');

  // Self profile form state
  const [isSelfImageSourceModalOpen, setIsSelfImageSourceModalOpen] = useState(false);
  const [selfProfileData, setSelfProfileData] = useState({
    nombre: currentUser.nombre,
    email: currentUser.email,
    cargo: currentUser.cargo || '',
    telefono: currentUser.telefono || '',
    organizacion: currentUser.organizacion || '',
    avatar_url: currentUser.avatar_url || '',
    avatar_origen: (currentUser.avatar_origen || 'URL_EXTERNA') as OrigenImagen
  });

  useEffect(() => {
    setSelfProfileData({
      nombre: currentUser.nombre,
      email: currentUser.email,
      cargo: currentUser.cargo || '',
      telefono: currentUser.telefono || '',
      organizacion: currentUser.organizacion || '',
      avatar_url: currentUser.avatar_url || '',
      avatar_origen: (currentUser.avatar_origen || 'URL_EXTERNA') as OrigenImagen
    });
  }, [currentUser]);

  if (!isOpen) return null;

  const triggerSuccess = (msg: string) => {
    setSuccessMessage(msg);
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      setSuccessMessage('');
    }, 2800);
  };

  // Save texts handler
  const handleSaveTextos = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateConfig(editableConfig);
    triggerSuccess('Textos y copywriting guardados exitosamente en MariaDB.');
  };

  // Save project handler (legacy inline)
  const handleSaveProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProject) return;
    const updated = proyectos.map(p => p.id === editingProject.id ? editingProject : p);
    onUpdateProyectos(updated);
    setEditingProject(null);
    triggerSuccess(`Proyecto "${editingProject.nombre}" actualizado en el catálogo.`);
  };

  // Open Edit Project Modal (Full editing of all project properties)
  const handleOpenEditProject = (proj: Proyecto) => {
    setProjectToEditInModal(proj);
    setIsNewProjectModal(false);
  };

  // Open Add New Project Modal
  const handleOpenAddProject = () => {
    setProjectToEditInModal(null);
    setIsNewProjectModal(true);
  };

  // Save Project from Modal (sychronized with Carrusel 3D and Ficha Técnica)
  const handleSaveProjectFromModal = (savedProj: Proyecto) => {
    const exists = proyectos.some(p => p.id === savedProj.id);
    let updatedList: Proyecto[];
    if (exists) {
      updatedList = proyectos.map(p => p.id === savedProj.id ? savedProj : p);
      triggerSuccess(`Proyecto "${savedProj.nombre}" actualizado en el Carrusel 3D y en la Ficha Técnica.`);
    } else {
      updatedList = [...proyectos, savedProj];
      triggerSuccess(`Proyecto "${savedProj.nombre}" incorporado al Carrusel 3D y Catálogo.`);
    }
    onUpdateProyectos(updatedList);
    setProjectToEditInModal(null);
    setIsNewProjectModal(false);
  };

  // Delete project
  const handleDeleteProject = (id: number) => {
    const target = proyectos.find(p => p.id === id);
    if (!target) return;
    if (confirm(`¿Está seguro de eliminar el proyecto "${target.nombre}" del catálogo y del carrusel 3D?`)) {
      const updated = proyectos.filter(p => p.id !== id);
      onUpdateProyectos(updated);
      triggerSuccess(`Proyecto "${target.nombre}" eliminado del catálogo.`);
    }
  };

  // Add new user
  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    const rolObj = roles.find(r => r.id === Number(newUserData.rol_id));
    const newUser: Usuario = {
      id: Date.now(),
      nombre: newUserData.nombre.trim(),
      email: newUserData.email.trim(),
      rol_id: Number(newUserData.rol_id),
      rol_nombre: rolObj?.nombre || 'Usuario',
      cargo: newUserData.cargo.trim() || 'Especialista SIAH',
      telefono: newUserData.telefono.trim() || '',
      organizacion: newUserData.organizacion.trim() || '360 SIACE',
      avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
      estado: newUserData.estado,
      creado_en: new Date().toISOString().split('T')[0],
      ultimo_acceso: 'Pendiente de primer ingreso'
    };
    onUpdateUsuarios([...usuarios, newUser]);
    setNewUserModal(false);
    setNewUserData({
      nombre: '',
      email: '',
      rol_id: isAdmin ? 3 : 2,
      cargo: '',
      telefono: '',
      organizacion: '360 SIACE',
      estado: 'ACTIVO'
    });
    triggerSuccess(`Usuario "${newUser.nombre}" registrado y sincronizado en la base de datos.`);
  };

  // Save edited user (from EditUserModal)
  const handleSaveEditedUser = (updatedUser: Usuario) => {
    const updatedList = usuarios.map(u => u.id === updatedUser.id ? updatedUser : u);
    onUpdateUsuarios(updatedList);
    triggerSuccess(`Modificaciones del usuario "${updatedUser.nombre}" guardadas con nivel de autorización.`);
  };

  // Delete user
  const handleDeleteUser = (id: number) => {
    const target = usuarios.find(u => u.id === id);
    if (!target) return;

    if (target.rol_id === 1 && !isSuperAdmin) {
      alert('Operación denegada: Las cuentas con rango Super Administrador no pueden ser eliminadas.');
      return;
    }

    if (confirm(`¿Desea dar de baja permanentemente al usuario ${target.nombre}?`)) {
      onUpdateUsuarios(usuarios.filter(u => u.id !== id));
      triggerSuccess(`Usuario ${target.nombre} eliminado.`);
    }
  };

  // Save self profile
  const handleSaveSelfProfile = (e: React.FormEvent) => {
    e.preventDefault();
    const updatedUser: Usuario = {
      ...currentUser,
      nombre: selfProfileData.nombre.trim(),
      email: selfProfileData.email.trim(),
      cargo: selfProfileData.cargo.trim(),
      telefono: selfProfileData.telefono.trim(),
      organizacion: selfProfileData.organizacion.trim(),
      avatar_url: selfProfileData.avatar_url.trim() || currentUser.avatar_url,
      avatar_origen: selfProfileData.avatar_origen || currentUser.avatar_origen || 'URL_EXTERNA'
    };
    handleSaveEditedUser(updatedUser);
  };

  // Auditor: Save project audit verification
  const handleSaveAuditVerification = (projectId: number) => {
    const project = proyectos.find(p => p.id === projectId);
    if (!project) return;
    const updated = proyectos.map(p => p.id === projectId ? {
      ...p,
      auditoria_estado: auditStatus,
      auditor_responsable: `${currentUser.nombre} (${currentUser.cargo || 'Auditor Concurrente'})`,
      auditoria_notas: auditNotes.trim() || 'Verificación documental y fiduciaria completada bajo estándares ECHO/USAID.'
    } : p);
    onUpdateProyectos(updated);
    triggerSuccess(`Auditoría fiduciaria registrada para "${project.nombre}" con estado: ${auditStatus}.`);
  };

  // Professional management handlers (Levels 1, 2, and 3 authorized)
  const isTeamAuthorized = isSuperAdmin || isAdmin || isAuditor;

  const handleOpenEditProfesional = (prof: Profesional) => {
    setProfesionalToEdit(prof);
    setIsNewProfesionalModal(false);
  };

  const handleOpenAddProfesional = () => {
    setProfesionalToEdit(null);
    setIsNewProfesionalModal(true);
  };

  const handleSaveProfesional = (savedProf: Profesional) => {
    const exists = profesionales.some(p => p.id === savedProf.id);
    let updatedList: Profesional[];
    if (exists) {
      updatedList = profesionales.map(p => p.id === savedProf.id ? savedProf : p);
      triggerSuccess(`Ficha de "${savedProf.nombre}" actualizada en la sección Quiénes Somos.`);
    } else {
      updatedList = [...profesionales, savedProf];
      triggerSuccess(`Especialista "${savedProf.nombre}" incorporado exitosamente al equipo multidisciplinario.`);
    }
    onUpdateProfesionales(updatedList);
  };

  const handleDeleteProfesional = (id: number) => {
    const target = profesionales.find(p => p.id === id);
    if (!target) return;
    if (confirm(`¿Está seguro de desincorporar a "${target.nombre}" del equipo multidisciplinario de la sección Quiénes Somos?`)) {
      const updatedList = profesionales.filter(p => p.id !== id);
      onUpdateProfesionales(updatedList);
      triggerSuccess(`Profesional "${target.nombre}" desincorporado del portal.`);
    }
  };

  // Dynamic CMS title based on user role
  const getCmsTitle = () => {
    if (isSuperAdmin) return 'CMS Maestro & Administración Integral';
    if (isAdmin) return 'CMS de Dirección Operativa & Proyectos SIAH';
    if (isAuditor) return 'CMS de Fiscalización & Auditoría Concurrente';
    if (isEditor) return 'CMS de Storytelling & Comunicaciones';
    if (isConsultor) return 'CMS de Monitoreo & Veeduría Multilateral';
    return 'Panel de Gestión Personal';
  };

  return (
    <>
      <div 
        className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-black/85 backdrop-blur-md animate-in fade-in duration-200"
        onClick={onClose}
      >
        <div 
          className="relative w-full max-w-6xl max-h-[94vh] flex flex-col bg-[#000033]/95 border border-white/10 rounded-3xl shadow-[0_16px_48px_rgba(0,0,51,0.95)] backdrop-blur-2xl overflow-hidden text-slate-100"
          onClick={e => e.stopPropagation()}
        >
          {/* Top Bar Header */}
          <div className="p-4 sm:p-5 border-b border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white/[0.03]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/[0.08] border border-[#38BDF8]/40 flex items-center justify-center text-[#38BDF8] shadow-[0_0_15px_rgba(56,189,248,0.2)] shrink-0">
                <Settings className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-base sm:text-lg font-bold text-white">
                    {getCmsTitle()}
                  </h3>
                  <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-white/[0.06] text-[#38BDF8] border border-[#38BDF8]/30 font-semibold">
                    {userRole.nombre}
                  </span>
                  <span className="inline-flex items-center gap-1.5 text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                    Firebase Firestore Activo
                  </span>
                </div>
                <p className="text-xs text-slate-400">
                  CMS conectado en la nube • Sincronización en tiempo real multi-dispositivo • Organización 360 SIACE
                </p>
              </div>
            </div>

            {/* Role Switcher & Close */}
            <div className="flex items-center gap-2 self-end sm:self-auto">
              {onSwitchUser && (
                <div className="flex items-center gap-1.5 bg-white/[0.04] p-1.5 rounded-xl border border-white/10">
                  <span className="text-[11px] text-slate-300 font-mono hidden md:inline px-1">
                    Simular como:
                  </span>
                  <select
                    value={currentUser.id}
                    onChange={(e) => {
                      const selected = usuarios.find(u => u.id === Number(e.target.value));
                      if (selected) onSwitchUser(selected);
                    }}
                    className="px-2 py-1 text-xs rounded-lg bg-[#000033] border border-white/15 text-[#38BDF8] font-bold focus:outline-none focus:border-[#38BDF8]"
                    title="Alternar entre roles para verificar que cada usuario tiene su propio CMS"
                  >
                    {usuarios.map(u => (
                      <option key={u.id} value={u.id} className="bg-[#000033] text-white">
                        {u.nombre} ({roles.find(r => r.id === u.rol_id)?.codigo || 'USUARIO'})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <button
                onClick={onClose}
                className="p-2 rounded-xl bg-white/[0.05] text-slate-400 hover:text-white border border-white/10 hover:bg-white/10 transition-all"
                title="Cerrar CMS"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Success Banner */}
          {savedSuccess && (
            <div className="px-6 py-2 bg-emerald-950/90 border-b border-emerald-500/40 text-emerald-200 text-xs flex items-center justify-between animate-in fade-in duration-150">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{successMessage || 'Operación guardada y sincronizada en la base de datos Firebase Firestore.'}</span>
              </div>
              <span className="text-[10px] font-mono opacity-75">Nivel validado: {userRole.codigo}</span>
            </div>
          )}

          {/* Tab Navigation (Adapts dynamically to current user's role) */}
          <div className="flex items-center gap-1.5 px-4 sm:px-6 pt-2.5 pb-2 border-b border-white/10 bg-white/[0.02] overflow-x-auto text-xs font-semibold custom-scrollbar">
            
            {/* Tab: Mi Perfil (Available to ALL users) */}
            <button
              onClick={() => setActiveTab('perfil')}
              className={`px-3 py-1.5 rounded-xl flex items-center gap-2 transition-all shrink-0 ${
                activeTab === 'perfil' 
                  ? 'bg-[#38BDF8] text-[#000033] font-bold shadow-[0_0_15px_rgba(56,189,248,0.3)]' 
                  : 'text-slate-400 hover:text-white hover:bg-white/[0.05]'
              }`}
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>Mi Perfil & CMS</span>
            </button>

            {/* SUPERADMIN & ADMIN: Textos */}
            {(isSuperAdmin || isAdmin || isEditor) && (
              <button
                onClick={() => setActiveTab('textos')}
                className={`px-3 py-1.5 rounded-xl flex items-center gap-2 transition-all shrink-0 ${
                  activeTab === 'textos' 
                    ? 'bg-[#38BDF8] text-[#000033] font-bold shadow-[0_0_15px_rgba(56,189,248,0.3)]' 
                    : 'text-slate-400 hover:text-white hover:bg-white/[0.05]'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Textos & Copywriting</span>
              </button>
            )}

            {/* PROYECTOS & CARRUSEL 3D (SuperAdmin, Admin, Editor, Auditor) */}
            {(isSuperAdmin || isAdmin || isEditor || isAuditor) && (
              <button
                onClick={() => setActiveTab('proyectos')}
                className={`px-3 py-1.5 rounded-xl flex items-center gap-2 transition-all shrink-0 ${
                  activeTab === 'proyectos' 
                    ? 'bg-[#38BDF8] text-[#000033] font-bold shadow-[0_0_15px_rgba(56,189,248,0.3)]' 
                    : 'text-slate-400 hover:text-white hover:bg-white/[0.05]'
                }`}
              >
                <FolderKanban className="w-3.5 h-3.5" />
                <span>Catálogo de Proyectos & Carrusel</span>
                <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                  activeTab === 'proyectos' ? 'bg-[#000033]/20 text-[#000033]' : 'bg-white/10 text-slate-300'
                }`}>
                  {proyectos.length}
                </span>
              </button>
            )}

            {/* AUDITOR DEDICATED TABS */}
            {isAuditor && (
              <>
                <button
                  onClick={() => setActiveTab('mesa_auditoria')}
                  className={`px-3 py-1.5 rounded-xl flex items-center gap-2 transition-all shrink-0 ${
                    activeTab === 'mesa_auditoria' 
                      ? 'bg-[#38BDF8] text-[#000033] font-bold shadow-[0_0_15px_rgba(56,189,248,0.3)]' 
                      : 'text-slate-400 hover:text-white hover:bg-white/[0.05]'
                  }`}
                >
                  <FileCheck className="w-3.5 h-3.5" />
                  <span>Mesa de Auditoría Concurrente</span>
                </button>
                <button
                  onClick={() => setActiveTab('certificados_siah')}
                  className={`px-3 py-1.5 rounded-xl flex items-center gap-2 transition-all shrink-0 ${
                    activeTab === 'certificados_siah' 
                      ? 'bg-[#38BDF8] text-[#000033] font-bold shadow-[0_0_15px_rgba(56,189,248,0.3)]' 
                      : 'text-slate-400 hover:text-white hover:bg-white/[0.05]'
                  }`}
                >
                  <Award className="w-3.5 h-3.5" />
                  <span>Certificados & Dictámenes SIAH</span>
                </button>
              </>
            )}

            {/* EDITOR DEDICATED TABS */}
            {isEditor && (
              <button
                onClick={() => setActiveTab('narrativas_proyectos')}
                className={`px-3 py-1.5 rounded-xl flex items-center gap-2 transition-all shrink-0 ${
                  activeTab === 'narrativas_proyectos' 
                    ? 'bg-[#38BDF8] text-[#000033] font-bold shadow-[0_0_15px_rgba(56,189,248,0.3)]' 
                    : 'text-slate-400 hover:text-white hover:bg-white/[0.05]'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Storytelling & Fichas de Impacto</span>
              </button>
            )}

            {/* CONSULTOR DEDICATED TABS */}
            {isConsultor && (
              <button
                onClick={() => setActiveTab('monitor_kpis')}
                className={`px-3 py-1.5 rounded-xl flex items-center gap-2 transition-all shrink-0 ${
                  activeTab === 'monitor_kpis' 
                    ? 'bg-[#38BDF8] text-[#000033] font-bold shadow-[0_0_15px_rgba(56,189,248,0.3)]' 
                    : 'text-slate-400 hover:text-white hover:bg-white/[0.05]'
                }`}
              >
                <BarChart3 className="w-3.5 h-3.5" />
                <span>Monitor Ejecutivo de Desempeño</span>
              </button>
            )}

            {/* SUPERADMIN & ADMIN: Servicios */}
            {(isSuperAdmin || isAdmin) && (
              <button
                onClick={() => setActiveTab('servicios')}
                className={`px-3 py-1.5 rounded-xl flex items-center gap-2 transition-all shrink-0 ${
                  activeTab === 'servicios' 
                    ? 'bg-[#38BDF8] text-[#000033] font-bold shadow-[0_0_15px_rgba(56,189,248,0.3)]' 
                    : 'text-slate-400 hover:text-white hover:bg-white/[0.05]'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>10 Servicios SIAH</span>
              </button>
            )}

            {/* SUPERADMIN, ADMIN & AUDITOR (NIVELES 1, 2 Y 3): Equipo Multidisciplinario (Quiénes Somos) */}
            {(isSuperAdmin || isAdmin || isAuditor) && (
              <button
                onClick={() => setActiveTab('profesionales')}
                className={`px-3 py-1.5 rounded-xl flex items-center gap-2 transition-all shrink-0 ${
                  activeTab === 'profesionales' 
                    ? 'bg-[#38BDF8] text-[#000033] font-bold shadow-[0_0_15px_rgba(56,189,248,0.3)]' 
                    : 'text-slate-400 hover:text-white hover:bg-white/[0.05]'
                }`}
              >
                <Briefcase className="w-3.5 h-3.5" />
                <span>Equipo Multidisciplinario</span>
                <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                  activeTab === 'profesionales' ? 'bg-[#000033]/20 text-[#000033]' : 'bg-white/10 text-slate-300'
                }`}>
                  {profesionales.length}
                </span>
              </button>
            )}

            {/* USUARIOS & ROLES (Available to all, but actions reflect authorization clearance) */}
            <button
              onClick={() => setActiveTab('usuarios')}
              className={`px-3 py-1.5 rounded-xl flex items-center gap-2 transition-all shrink-0 ${
                activeTab === 'usuarios' 
                  ? 'bg-[#38BDF8] text-[#000033] font-bold shadow-[0_0_15px_rgba(56,189,248,0.3)]' 
                  : 'text-slate-400 hover:text-white hover:bg-white/[0.05]'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>
                {isSuperAdmin 
                  ? 'Gestión de Usuarios & Roles' 
                  : isAdmin 
                    ? 'Gestión de Colaboradores' 
                    : 'Directorio de Personal'}
              </span>
            </button>

          </div>

          {/* Tab Content Container */}
          <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-6 custom-scrollbar">

            {/* ========================================================================= */}
            {/* TAB: MI PERFIL & CMS PROPIO (EVERY USER CAN MODIFY THEIR OWN PROFILE)      */}
            {/* ========================================================================= */}
            {activeTab === 'perfil' && (
              <div className="space-y-6 animate-in fade-in duration-200">
                <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="relative shrink-0">
                      <img
                        src={selfProfileData.avatar_url || currentUser.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'}
                        alt={currentUser.nombre}
                        className="w-16 h-16 rounded-2xl object-cover border-2 border-[#38BDF8]/40 shadow-lg"
                        referrerPolicy="no-referrer"
                      />
                      <span className="absolute -bottom-1 -right-1 text-[8px] font-mono px-1.5 py-0.5 rounded bg-[#000033] text-[#38BDF8] border border-[#38BDF8]/30 font-bold">
                        {selfProfileData.avatar_origen === 'ARCHIVO_LOCAL' ? 'Local' :
                         selfProfileData.avatar_origen === 'BANCO_SIAH' ? 'Banco SIAH' :
                         selfProfileData.avatar_origen === 'AVATAR_GENERADO' ? 'SVG' :
                         selfProfileData.avatar_origen === 'CAMARA_DIRECTA' ? 'Cámara' : 'Web'}
                      </span>
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-lg font-bold text-white">{currentUser.nombre}</h4>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/[0.08] text-[#38BDF8] border border-[#38BDF8]/30 font-semibold">
                          {userRole.codigo}
                        </span>
                      </div>
                      <p className="text-xs text-slate-300 font-mono">{currentUser.email}</p>
                      <p className="text-xs text-slate-400 mt-0.5">{currentUser.cargo || 'Especialista'} • {currentUser.organizacion || '360 SIACE'}</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2.5">
                    <button
                      type="button"
                      onClick={() => setIsSelfImageSourceModalOpen(true)}
                      className="px-3.5 py-2 rounded-xl bg-white/[0.08] hover:bg-[#38BDF8] text-[#38BDF8] hover:text-[#000033] font-bold text-xs flex items-center gap-1.5 border border-[#38BDF8]/40 shadow-[0_0_12px_rgba(56,189,248,0.2)] transition-all shrink-0 hover:scale-[1.02]"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Cambiar Fotografía</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setUserToEditModal(currentUser)}
                      className="px-4 py-2 rounded-xl bg-[#38BDF8] hover:bg-sky-300 text-[#000033] font-bold text-xs flex items-center gap-2 shadow-[0_0_15px_rgba(56,189,248,0.3)] transition-all shrink-0 hover:scale-[1.02]"
                    >
                      <Edit3 className="w-4 h-4" />
                      <span>Modificar Mi Perfil Completo</span>
                    </button>
                  </div>
                </div>

                {/* Inline Quick Profile Editor */}
                <form onSubmit={handleSaveSelfProfile} className="p-5 rounded-2xl bg-white/[0.03] border border-white/10 space-y-4">
                  <div className="flex items-center justify-between border-b border-white/10 pb-3">
                    <h4 className="text-sm font-bold text-[#38BDF8] flex items-center gap-2">
                      <UserCheck className="w-4 h-4 text-[#38BDF8]" />
                      Edición Rápida de Datos Personales
                    </h4>
                    <span className="text-[11px] text-slate-400 font-mono">
                      Nivel de Autorización: {userRole.nombre}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    <div>
                      <label className="text-xs font-semibold text-slate-300 block mb-1">Nombre y Apellidos</label>
                      <input
                        type="text"
                        required
                        value={selfProfileData.nombre}
                        onChange={e => setSelfProfileData({ ...selfProfileData, nombre: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl bg-white/[0.05] border border-white/10 text-xs text-white focus:outline-none focus:border-[#38BDF8] backdrop-blur-md"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-slate-300 block mb-1">Correo Electrónico</label>
                      <input
                        type="email"
                        required
                        value={selfProfileData.email}
                        onChange={e => setSelfProfileData({ ...selfProfileData, email: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl bg-white/[0.05] border border-white/10 text-xs text-white focus:outline-none focus:border-[#38BDF8] backdrop-blur-md"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-slate-300 block mb-1">Cargo / Especialidad</label>
                      <input
                        type="text"
                        value={selfProfileData.cargo}
                        onChange={e => setSelfProfileData({ ...selfProfileData, cargo: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl bg-white/[0.05] border border-white/10 text-xs text-white focus:outline-none focus:border-[#38BDF8] backdrop-blur-md"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-slate-300 block mb-1">Teléfono Directo</label>
                      <input
                        type="text"
                        value={selfProfileData.telefono}
                        onChange={e => setSelfProfileData({ ...selfProfileData, telefono: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl bg-white/[0.05] border border-white/10 text-xs text-white focus:outline-none focus:border-[#38BDF8] backdrop-blur-md"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-slate-300 block mb-1">Organización / Dependencia</label>
                      <input
                        type="text"
                        value={selfProfileData.organizacion}
                        onChange={e => setSelfProfileData({ ...selfProfileData, organizacion: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl bg-white/[0.05] border border-white/10 text-xs text-white focus:outline-none focus:border-[#38BDF8] backdrop-blur-md"
                      />
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-xs font-semibold text-slate-300 block">Fotografía de Perfil</label>
                        <button
                          type="button"
                          onClick={() => setIsSelfImageSourceModalOpen(true)}
                          className="text-[10px] text-[#38BDF8] hover:text-sky-300 font-semibold flex items-center gap-1 transition-colors"
                        >
                          <Sparkles className="w-3 h-3" />
                          <span>Seleccionar Origen</span>
                        </button>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <input
                          type="url"
                          value={selfProfileData.avatar_url}
                          onChange={e => setSelfProfileData({ ...selfProfileData, avatar_url: e.target.value })}
                          placeholder="https://... o data:image/..."
                          className="w-full px-3 py-2 rounded-xl bg-white/[0.05] border border-white/10 text-xs text-white focus:outline-none focus:border-[#38BDF8] backdrop-blur-md font-mono"
                        />
                        <button
                          type="button"
                          onClick={() => setIsSelfImageSourceModalOpen(true)}
                          className="px-2.5 py-2 rounded-xl bg-white/[0.08] hover:bg-[#38BDF8] text-[#38BDF8] hover:text-[#000033] border border-[#38BDF8]/40 text-xs font-bold transition-all shrink-0"
                          title="Cambiar origen de la fotografía"
                        >
                          Origen
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end pt-2">
                    <button
                      type="submit"
                      className="px-5 py-2 rounded-xl bg-[#38BDF8] hover:bg-sky-300 text-[#000033] font-bold text-xs flex items-center gap-2 shadow-[0_0_15px_rgba(56,189,248,0.3)] transition-all"
                    >
                      <Save className="w-4 h-4" />
                      <span>Guardar Mis Datos Personales</span>
                    </button>
                  </div>
                </form>

                {/* Permissions & Capabilities Summary Card */}
                <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/10 space-y-3">
                  <div className="flex items-center justify-between">
                    <h5 className="text-xs font-bold text-slate-200 flex items-center gap-2">
                      <Shield className="w-4 h-4 text-[#38BDF8]" />
                      Privilegios de tu CMS ({userRole.nombre})
                    </h5>
                    <span className="text-[10px] font-mono text-[#38BDF8]">
                      {userRole.permisos.length} permisos activos
                    </span>
                  </div>
                  <p className="text-xs text-slate-300">
                    {userRole.descripcion}
                  </p>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {userRole.permisos.map((p, idx) => (
                      <span key={idx} className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/[0.05] border border-white/10 text-slate-300">
                        ✓ {p}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ========================================================================= */}
            {/* TAB: GESTIÓN DE USUARIOS & ROLES (ALL USERS CAN BE EDITED ACCORDING TO RBAC) */}
            {/* ========================================================================= */}
            {activeTab === 'usuarios' && (
              <div className="space-y-5 animate-in fade-in duration-200">
                
                {/* Authorization Clearance Info Banner */}
                <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                        <Users className="w-4 h-4 text-[#38BDF8]" />
                        Directorio de Usuarios MariaDB ({usuarios.length} cuentas registradas)
                      </h4>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {isSuperAdmin 
                        ? 'Acceso Maestro: Puede modificar cualquier usuario, cambiar roles, suspender o reactivar cuentas.' 
                        : isAdmin 
                          ? 'Dirección Operativa: Puede modificar colaboradores, auditores, editores y consultores.' 
                          : 'Modo Directorio: Puede modificar su propio perfil. Para modificar cuentas de terceros solicite a Administración.'}
                    </p>
                  </div>

                  {(isSuperAdmin || isAdmin) && (
                    <button
                      onClick={() => setNewUserModal(true)}
                      className="px-3.5 py-2 rounded-xl bg-[#38BDF8] hover:bg-sky-300 text-[#000033] text-xs font-bold flex items-center gap-1.5 shadow-[0_0_15px_rgba(56,189,248,0.3)] transition-all shrink-0"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Nuevo Usuario</span>
                    </button>
                  )}
                </div>

                {/* Form to create new user (Superadmin or Admin) */}
                {newUserModal && (
                  <form onSubmit={handleAddUser} className="p-5 rounded-2xl bg-[#000033] border border-[#38BDF8]/40 space-y-4 shadow-2xl">
                    <div className="flex items-center justify-between border-b border-white/10 pb-2">
                      <h4 className="text-sm font-bold text-[#38BDF8] flex items-center gap-2">
                        <Plus className="w-4 h-4" />
                        Registrar Nuevo Usuario en MariaDB
                      </h4>
                      <button
                        type="button"
                        onClick={() => setNewUserModal(false)}
                        className="text-slate-400 hover:text-white text-xs"
                      >
                        Cancelar
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                      <div>
                        <label className="text-[11px] text-slate-300 block mb-1">Nombre Completo</label>
                        <input
                          type="text"
                          required
                          value={newUserData.nombre}
                          onChange={e => setNewUserData({ ...newUserData, nombre: e.target.value })}
                          placeholder="Ej. Ing. Laura Salas"
                          className="w-full px-3 py-1.5 rounded-lg bg-white/[0.05] border border-white/10 text-xs text-white focus:outline-none focus:border-[#38BDF8]"
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
                          className="w-full px-3 py-1.5 rounded-lg bg-white/[0.05] border border-white/10 text-xs text-white focus:outline-none focus:border-[#38BDF8]"
                        />
                      </div>

                      <div>
                        <label className="text-[11px] text-slate-300 block mb-1">Cargo / Especialidad</label>
                        <input
                          type="text"
                          value={newUserData.cargo}
                          onChange={e => setNewUserData({ ...newUserData, cargo: e.target.value })}
                          placeholder="Ej. Especialista en Gobernanza"
                          className="w-full px-3 py-1.5 rounded-lg bg-white/[0.05] border border-white/10 text-xs text-white focus:outline-none focus:border-[#38BDF8]"
                        />
                      </div>

                      <div>
                        <label className="text-[11px] text-slate-300 block mb-1">Rol Asignado</label>
                        <select
                          value={newUserData.rol_id}
                          onChange={e => setNewUserData({ ...newUserData, rol_id: Number(e.target.value) })}
                          className="w-full px-3 py-1.5 rounded-lg bg-[#000033] border border-white/10 text-xs text-white focus:outline-none focus:border-[#38BDF8]"
                        >
                          {roles.filter(r => isSuperAdmin ? true : r.id >= 2).map(r => (
                            <option key={r.id} value={r.id} className="bg-[#000033] text-white">
                              {r.nombre}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="text-[11px] text-slate-300 block mb-1">Teléfono</label>
                        <input
                          type="text"
                          value={newUserData.telefono}
                          onChange={e => setNewUserData({ ...newUserData, telefono: e.target.value })}
                          placeholder="+58 414-000-0000"
                          className="w-full px-3 py-1.5 rounded-lg bg-white/[0.05] border border-white/10 text-xs text-white focus:outline-none focus:border-[#38BDF8]"
                        />
                      </div>

                      <div>
                        <label className="text-[11px] text-slate-300 block mb-1">Estado</label>
                        <select
                          value={newUserData.estado}
                          onChange={e => setNewUserData({ ...newUserData, estado: e.target.value as any })}
                          className="w-full px-3 py-1.5 rounded-lg bg-[#000033] border border-white/10 text-xs text-white focus:outline-none focus:border-[#38BDF8]"
                        >
                          <option value="ACTIVO" className="bg-[#000033] text-emerald-400">ACTIVO</option>
                          <option value="INACTIVO" className="bg-[#000033] text-amber-400">INACTIVO</option>
                          <option value="SUSPENDIDO" className="bg-[#000033] text-rose-400">SUSPENDIDO</option>
                        </select>
                      </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-2">
                      <button
                        type="button"
                        onClick={() => setNewUserModal(false)}
                        className="px-3.5 py-1.5 rounded-lg bg-white/[0.05] text-slate-300 hover:text-white border border-white/10 text-xs"
                      >
                        Cancelar
                      </button>
                      <button
                        type="submit"
                        className="px-5 py-1.5 rounded-lg bg-[#38BDF8] hover:bg-sky-300 text-[#000033] font-bold text-xs shadow-[0_0_15px_rgba(56,189,248,0.3)]"
                      >
                        Guardar Usuario en MariaDB
                      </button>
                    </div>
                  </form>
                )}

                {/* Users List Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {usuarios.map((user) => {
                    const isSelf = user.id === currentUser.id;
                    const isTargetSuper = user.rol_id === 1;
                    
                    // Can edit check
                    const canEdit = 
                      isSelf || 
                      isSuperAdmin || 
                      (isAdmin && !isTargetSuper);

                    // Can delete check
                    const canDelete = 
                      !isSelf && 
                      (isSuperAdmin || (isAdmin && user.rol_id > 2));

                    const userRoleObj = roles.find(r => r.id === user.rol_id);

                    return (
                      <div
                        key={user.id}
                        className={`p-4 rounded-2xl border transition-all flex flex-col justify-between gap-3 ${
                          isSelf 
                            ? 'bg-white/[0.06] border-[#38BDF8]/40 shadow-[0_0_20px_rgba(56,189,248,0.15)]' 
                            : 'bg-white/[0.03] border-white/10 hover:border-white/20'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-start gap-3 min-w-0">
                            <img
                              src={user.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'}
                              alt={user.nombre}
                              className="w-12 h-12 rounded-xl object-cover border border-white/15 shadow shrink-0"
                              referrerPolicy="no-referrer"
                            />
                            <div className="min-w-0">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className="font-bold text-white text-sm truncate">{user.nombre}</span>
                                {isSelf && (
                                  <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-sky-500/20 text-[#38BDF8] border border-sky-500/30">
                                    Tú
                                  </span>
                                )}
                              </div>
                              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/[0.05] text-[#38BDF8] border border-[#38BDF8]/30 inline-block mt-0.5">
                                {user.rol_nombre || userRoleObj?.nombre}
                              </span>
                              <div className="text-xs text-slate-300 truncate mt-1">
                                {user.cargo || 'Especialista SIAH'}
                              </div>
                              <div className="text-[11px] text-slate-400 font-mono truncate">
                                {user.email}
                              </div>
                              {user.organizacion && (
                                <div className="text-[10px] text-slate-400 truncate">
                                  {user.organizacion}
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="flex flex-col items-end gap-1 shrink-0">
                            <span className={`text-[9px] font-semibold font-mono px-2 py-0.5 rounded ${
                              user.estado === 'ACTIVO' 
                                ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-500/30' 
                                : user.estado === 'INACTIVO'
                                  ? 'bg-amber-950/80 text-amber-400 border border-amber-500/30'
                                  : 'bg-rose-950/80 text-rose-400 border border-rose-500/30'
                            }`}>
                              {user.estado}
                            </span>
                          </div>
                        </div>

                        {/* Action buttons with authorization level enforcement */}
                        <div className="pt-2 border-t border-white/5 flex items-center justify-between text-xs">
                          <span className="text-[10px] text-slate-400 font-mono">
                            ID: {user.id} • {user.creado_en}
                          </span>

                          <div className="flex items-center gap-2">
                            {canEdit ? (
                              <button
                                onClick={() => setUserToEditModal(user)}
                                className="px-3 py-1.5 rounded-xl bg-white/[0.06] hover:bg-[#38BDF8] text-[#38BDF8] hover:text-[#000033] border border-[#38BDF8]/40 font-semibold text-xs flex items-center gap-1.5 transition-all"
                                title="Modificar usuario con autorización"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                                <span>{isSelf ? 'Editar Mi Perfil' : 'Editar Usuario'}</span>
                              </button>
                            ) : (
                              <span className="text-[10px] text-slate-400 font-mono flex items-center gap-1 bg-white/[0.02] px-2 py-1 rounded-lg border border-white/5">
                                <Lock className="w-3 h-3 text-slate-400" />
                                {isTargetSuper ? 'Protegido Superadmin' : 'Solo Lectura'}
                              </span>
                            )}

                            {canDelete && (
                              <button
                                onClick={() => handleDeleteUser(user.id)}
                                className="p-1.5 rounded-xl bg-rose-950/40 hover:bg-rose-600 text-rose-300 hover:text-white border border-rose-500/30 transition-all"
                                title="Dar de baja usuario"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ========================================================================= */}
            {/* TAB: MESA DE AUDITORÍA CONCURRENTE (DEDICATED CMS FOR AUDITOR ROLE)       */}
            {/* ========================================================================= */}
            {isAuditor && activeTab === 'mesa_auditoria' && (
              <div className="space-y-6 animate-in fade-in duration-200">
                <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center justify-between">
                  <div>
                    <h4 className="text-base font-bold text-[#38BDF8] flex items-center gap-2">
                      <FileCheck className="w-5 h-5 text-[#38BDF8]" />
                      Mesa de Fiscalización Concurrente de Proyectos SIAH
                    </h4>
                    <p className="text-xs text-slate-300 mt-0.5">
                      Verificación en tiempo real de partidas fiduciarias, gasto justificado y elegibilidad ECHO/USAID/ONU.
                    </p>
                  </div>
                  <span className="text-xs font-mono px-3 py-1 rounded-full bg-emerald-950/80 text-emerald-400 border border-emerald-500/30 font-bold">
                    Auditor Acreditado
                  </span>
                </div>

                {/* Audit desk project selector */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                  {/* Left: Project list selector */}
                  <div className="space-y-2">
                    <span className="text-xs font-semibold text-slate-300 block mb-1">
                      Expedientes de Proyectos a Fiscalizar:
                    </span>
                    {proyectos.map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => {
                          setSelectedAuditProjectId(p.id);
                          setAuditStatus(p.auditoria_estado || 'CONFORME');
                          setAuditNotes(p.auditoria_notas || '');
                        }}
                        className={`w-full p-3 rounded-xl border text-left transition-all flex items-center justify-between gap-2 ${
                          selectedAuditProjectId === p.id
                            ? 'bg-[#38BDF8]/15 border-[#38BDF8] shadow-[0_0_15px_rgba(56,189,248,0.2)]'
                            : 'bg-white/[0.02] border-white/10 hover:border-white/20'
                        }`}
                      >
                        <div>
                          <div className="font-bold text-white text-xs">{p.nombre}</div>
                          <div className="text-[10px] text-slate-400 font-mono">{p.codigo} • ${p.inversion_estimada_usd.toLocaleString()} USD</div>
                        </div>
                        <span className={`text-[9px] font-mono px-2 py-0.5 rounded font-bold ${
                          p.auditoria_estado === 'OBSERVADO'
                            ? 'bg-rose-950/80 text-rose-400 border border-rose-500/30'
                            : p.auditoria_estado === 'EN_REVISION'
                              ? 'bg-amber-950/80 text-amber-400 border border-amber-500/30'
                              : 'bg-emerald-950/80 text-emerald-400 border border-emerald-500/30'
                        }`}>
                          {p.auditoria_estado || 'CONFORME'}
                        </span>
                      </button>
                    ))}
                  </div>

                  {/* Right: Active project audit form */}
                  {(() => {
                    const activeP = proyectos.find(p => p.id === selectedAuditProjectId) || proyectos[0];
                    return (
                      <div className="lg:col-span-2 p-5 rounded-2xl bg-white/[0.04] border border-white/10 space-y-4">
                        <div className="flex items-center justify-between border-b border-white/10 pb-3">
                          <div>
                            <span className="text-[10px] font-mono text-[#38BDF8] uppercase">Dictamen Concurrente</span>
                            <h4 className="text-base font-bold text-white">{activeP.nombre}</h4>
                          </div>
                          <div className="text-right">
                            <span className="text-xs font-mono text-emerald-400 font-bold">{activeP.avance_porcentaje}% Físico</span>
                            <div className="text-[10px] text-slate-400 font-mono">${activeP.inversion_estimada_usd.toLocaleString()} USD Asignados</div>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="text-xs font-semibold text-slate-300 block mb-1">
                              Estatus de Auditoría Fiduciaria
                            </label>
                            <select
                              value={auditStatus}
                              onChange={e => setAuditStatus(e.target.value as any)}
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
                              Auditor Responsable de la Firma
                            </label>
                            <input
                              type="text"
                              readOnly
                              value={`${currentUser.nombre} • ${currentUser.email}`}
                              className="w-full px-3 py-2 rounded-xl bg-white/[0.03] border border-white/10 text-xs text-[#38BDF8] font-mono cursor-not-allowed"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="text-xs font-semibold text-slate-300 block mb-1">
                            Notas Técnicas de Auditoría Concurrente & Observaciones en Terreno
                          </label>
                          <textarea
                            rows={4}
                            value={auditNotes}
                            onChange={e => setAuditNotes(e.target.value)}
                            placeholder="Describa la verificación física de entregables, cotejo de actas de recepción y cumplimiento de normativas de elegibilidad..."
                            className="w-full px-3 py-2 rounded-xl bg-white/[0.05] border border-white/10 text-xs text-white focus:outline-none focus:border-[#38BDF8] resize-none"
                          />
                        </div>

                        <div className="flex items-center justify-between pt-2">
                          <span className="text-[10px] text-slate-400 font-mono">
                            Normativa aplicable: Directivas ECHO 2024 / USAID 22 CFR 200
                          </span>
                          <button
                            type="button"
                            onClick={() => handleSaveAuditVerification(activeP.id)}
                            className="px-5 py-2 rounded-xl bg-[#38BDF8] hover:bg-sky-300 text-[#000033] font-bold text-xs flex items-center gap-2 shadow-[0_0_15px_rgba(56,189,248,0.3)] transition-all"
                          >
                            <Save className="w-4 h-4" />
                            <span>Firmar & Registrar Dictamen en MariaDB</span>
                          </button>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              </div>
            )}

            {/* ========================================================================= */}
            {/* TAB: CERTIFICADOS & DICTÁMENES (AUDITOR)                                  */}
            {/* ========================================================================= */}
            {isAuditor && activeTab === 'certificados_siah' && (
              <div className="space-y-5 animate-in fade-in duration-200">
                <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center justify-between">
                  <div>
                    <h4 className="text-base font-bold text-white flex items-center gap-2">
                      <Award className="w-5 h-5 text-[#38BDF8]" />
                      Emisión de Dictámenes y Certificados de Auditoría Concurrente SIAH
                    </h4>
                    <p className="text-xs text-slate-400 mt-1">
                      Generación de certificados de trazabilidad financiera para organismos cooperantes.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => triggerSuccess('Certificado digital generado y rubricado con firma electrónica.')}
                    className="px-4 py-2 rounded-xl bg-[#38BDF8] hover:bg-sky-300 text-[#000033] font-bold text-xs flex items-center gap-2 shadow-[0_0_15px_rgba(56,189,248,0.3)] transition-all"
                  >
                    <Download className="w-4 h-4" />
                    <span>Exportar Certificado Oficial</span>
                  </button>
                </div>

                <div className="p-6 rounded-2xl bg-[#000033] border-2 border-dashed border-[#38BDF8]/30 space-y-4 text-center">
                  <div className="w-14 h-14 rounded-2xl bg-white/[0.08] flex items-center justify-center mx-auto text-[#38BDF8] shadow-[0_0_20px_rgba(56,189,248,0.2)]">
                    <ShieldCheck className="w-8 h-8" />
                  </div>
                  <h5 className="text-lg font-bold text-white">
                    Certificación de Idoneidad Fiduciaria SIAH 2026
                  </h5>
                  <p className="text-xs text-slate-300 max-w-xl mx-auto leading-relaxed">
                    Se certifica que la cartera de 6 proyectos del Modelo SIAH cuenta con acompañamiento concurrente en tiempo real, garantizando la total elegibilidad de los $2,870,000 USD administrados con 100% de trazabilidad fiduciaria.
                  </p>
                  <div className="flex flex-wrap justify-center gap-3 pt-2 font-mono text-xs">
                    <span className="px-3 py-1 rounded-lg bg-white/[0.05] border border-white/10 text-slate-300">
                      Auditor: {currentUser.nombre}
                    </span>
                    <span className="px-3 py-1 rounded-lg bg-white/[0.05] border border-white/10 text-[#38BDF8]">
                      Colegiatura: SIAH-AUD-2026-9948
                    </span>
                    <span className="px-3 py-1 rounded-lg bg-white/[0.05] border border-white/10 text-emerald-400">
                      Estatus: CONFORME SIN SALVEDADES
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* ========================================================================= */}
            {/* TAB: MONITOR EJECUTIVO DE KPIS (DEDICATED CMS FOR CONSULTOR / COOPERANTE) */}
            {/* ========================================================================= */}
            {isConsultor && activeTab === 'monitor_kpis' && (
              <div className="space-y-5 animate-in fade-in duration-200">
                <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center justify-between">
                  <div>
                    <h4 className="text-base font-bold text-white flex items-center gap-2">
                      <BarChart3 className="w-5 h-5 text-[#38BDF8]" />
                      Monitor Ejecutivo para Organismos Multilaterales & Donantes
                    </h4>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Veeduría en vivo de indicadores de impacto, fondos ejecutados y acuerdos de nivel de servicio (SLA).
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => triggerSuccess('Dossier ejecutivo descargado con éxito.')}
                    className="px-3.5 py-1.5 rounded-xl bg-[#38BDF8] hover:bg-sky-300 text-[#000033] font-bold text-xs flex items-center gap-2 shadow-[0_0_15px_rgba(56,189,248,0.3)] transition-all"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Descargar Dossier</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10">
                    <span className="text-[11px] text-slate-400 font-mono uppercase block">Fondos Auditados</span>
                    <span className="text-xl font-bold text-emerald-400 font-mono">$2,870,000 USD</span>
                    <span className="text-[10px] text-slate-400 block mt-1">100% elegibles ECHO/USAID</span>
                  </div>
                  <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10">
                    <span className="text-[11px] text-slate-400 font-mono uppercase block">Beneficiarios Verificados</span>
                    <span className="text-xl font-bold text-white font-mono">112,400</span>
                    <span className="text-[10px] text-slate-400 block mt-1">Población directa en 6 estados</span>
                  </div>
                  <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10">
                    <span className="text-[11px] text-slate-400 font-mono uppercase block">Cumplimiento SLA</span>
                    <span className="text-xl font-bold text-[#38BDF8] font-mono">99.8%</span>
                    <span className="text-[10px] text-slate-400 block mt-1">Disponibilidad operativa</span>
                  </div>
                  <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10">
                    <span className="text-[11px] text-slate-400 font-mono uppercase block">Proyectos en Ejecución</span>
                    <span className="text-xl font-bold text-white font-mono">{proyectos.length}</span>
                    <span className="text-[10px] text-slate-400 block mt-1">Frentes simultáneos</span>
                  </div>
                </div>

                {/* Project summaries for consultant */}
                <div className="space-y-2">
                  <span className="text-xs font-semibold text-slate-300 block">
                    Fichas Técnicas de Supervisión de Proyectos:
                  </span>
                  {proyectos.map((p) => (
                    <div key={p.id} className="p-3.5 rounded-xl bg-white/[0.02] border border-white/10 flex items-center justify-between gap-4">
                      <div>
                        <div className="font-bold text-white text-xs flex items-center gap-2">
                          <span>{p.nombre}</span>
                          <span className="text-[10px] font-mono text-slate-400">{p.codigo}</span>
                        </div>
                        <div className="text-[11px] text-slate-400">{p.impacto_social}</div>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="text-xs font-mono text-[#38BDF8] font-bold">{p.avance_porcentaje}%</span>
                        <div className="text-[10px] font-mono text-slate-400">${p.inversion_estimada_usd.toLocaleString()} USD</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ========================================================================= */}
            {/* TAB: STORYTELLING & IMPACTO (DEDICATED CMS FOR EDITOR DE CONTENIDOS)       */}
            {/* ========================================================================= */}
            {isEditor && activeTab === 'narrativas_proyectos' && (
              <div className="space-y-4 animate-in fade-in duration-200">
                <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10">
                  <h4 className="text-base font-bold text-[#38BDF8] flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-[#38BDF8]" />
                    Gestión de Narrativas de Impacto Social & Storytelling
                  </h4>
                  <p className="text-xs text-slate-400 mt-1">
                    Redacte los testimonios, historias de vida y titulares humanitarios que inspiran a cooperantes y comunidades.
                  </p>
                </div>

                <div className="space-y-3">
                  {proyectos.map((p) => (
                    <div key={p.id} className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <h5 className="font-bold text-white text-sm">{p.nombre}</h5>
                          <span className="text-[11px] text-[#38BDF8]">{p.categoria}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setEditingProject(p)}
                          className="px-3 py-1 rounded-xl bg-white/[0.06] hover:bg-[#38BDF8] text-[#38BDF8] hover:text-[#000033] border border-[#38BDF8]/40 text-xs font-semibold flex items-center gap-1.5 transition-all"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          <span>Editar Narrativa</span>
                        </button>
                      </div>

                      <p className="text-xs text-slate-300 leading-relaxed italic">
                        "{p.descripcion_corta}"
                      </p>

                      <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 text-xs text-slate-400">
                        <strong className="text-slate-200">Impacto Verificado:</strong> {p.impacto_social}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ========================================================================= */}
            {/* TAB: TEXTOS & COPYWRITING (SUPERADMIN, ADMIN, EDITOR)                     */}
            {/* ========================================================================= */}
            {activeTab === 'textos' && (isSuperAdmin || isAdmin || isEditor) && (
              <form onSubmit={handleSaveTextos} className="space-y-5 animate-in fade-in duration-200">
                <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-4">
                  <h4 className="text-sm font-bold text-[#38BDF8] flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-[#38BDF8]" />
                    Textos del Hero Principal & Propuesta de Valor
                  </h4>

                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1">
                      Tagline Superior (Badge Hero)
                    </label>
                    <input
                      type="text"
                      value={editableConfig.hero_tagline}
                      onChange={e => setEditableConfig({ ...editableConfig, hero_tagline: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-white/[0.05] border border-white/10 text-white focus:outline-none focus:border-[#38BDF8] backdrop-blur-md text-xs"
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
                      className="w-full px-3 py-2 rounded-xl bg-white/[0.05] border border-white/10 text-white focus:outline-none focus:border-[#38BDF8] backdrop-blur-md text-xs"
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
                      className="w-full px-3 py-2 rounded-xl bg-white/[0.05] border border-white/10 text-white focus:outline-none focus:border-[#38BDF8] backdrop-blur-md text-xs"
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
                      className="w-full px-3 py-2 rounded-xl bg-white/[0.05] border border-white/10 text-white focus:outline-none focus:border-[#38BDF8] backdrop-blur-md resize-none leading-relaxed text-xs"
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
                      className="w-full px-3 py-2 rounded-xl bg-white/[0.05] border border-white/10 text-white focus:outline-none focus:border-[#38BDF8] backdrop-blur-md text-xs"
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
                        className="w-full px-3 py-2 rounded-xl bg-white/[0.05] border border-white/10 text-white focus:outline-none focus:border-[#38BDF8] backdrop-blur-md text-xs"
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
                        className="w-full px-3 py-2 rounded-xl bg-white/[0.05] border border-white/10 text-white focus:outline-none focus:border-[#38BDF8] backdrop-blur-md text-xs"
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

            {/* ========================================================================= */}
            {/* TAB: PROYECTOS & CARRUSEL 3D (SUPERADMIN, ADMIN, EDITOR, AUDITOR)          */}
            {/* ========================================================================= */}
            {activeTab === 'proyectos' && (isSuperAdmin || isAdmin || isEditor || isAuditor) && (
              <div className="space-y-4 animate-in fade-in duration-200">
                {/* Header & Add Button */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-white/[0.03] border border-white/10">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-white/[0.08] border border-[#38BDF8]/40 flex items-center justify-center text-[#38BDF8] shadow-[0_0_15px_rgba(56,189,248,0.2)] shrink-0">
                      <FolderKanban className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                        <span>Catálogo de Proyectos & Carrusel 3D</span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/[0.08] text-[#38BDF8] border border-[#38BDF8]/30 font-semibold">
                          {proyectos.length} Proyectos
                        </span>
                      </h4>
                      <p className="text-xs text-slate-400">
                        Edición de toda la información visual del carrusel tridimensional y la ficha técnica desplegable.
                      </p>
                    </div>
                  </div>

                  {(isSuperAdmin || isAdmin || isEditor) && (
                    <button
                      type="button"
                      onClick={handleOpenAddProject}
                      className="px-4 py-2.5 rounded-xl bg-[#38BDF8] hover:bg-sky-300 text-[#000033] font-bold text-xs flex items-center gap-2 shadow-[0_0_20px_rgba(56,189,248,0.4)] border border-sky-200/50 transition-all hover:scale-[1.02] shrink-0"
                    >
                      <Plus className="w-4 h-4" />
                      <span>+ Crear Nuevo Proyecto para Carrusel 3D</span>
                    </button>
                  )}
                </div>

                {/* Project Cards Grid */}
                <div className="grid grid-cols-1 gap-4">
                  {proyectos.map((p, idx) => (
                    <div
                      key={p.id}
                      className="p-4 sm:p-5 rounded-2xl bg-white/[0.03] hover:bg-white/[0.05] border border-white/10 hover:border-[#38BDF8]/40 transition-all flex flex-col md:flex-row md:items-center justify-between gap-5 group"
                    >
                      {/* Left: Thumbnail & Project Core Details */}
                      <div className="flex items-start sm:items-center gap-4 min-w-0">
                        <div className="relative shrink-0 w-24 sm:w-28 h-20 rounded-xl overflow-hidden border border-white/15 shadow-md bg-black/40">
                          <img
                            src={p.imagen_url}
                            alt={p.nombre}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            referrerPolicy="no-referrer"
                          />
                          <span 
                            className="absolute top-1.5 left-1.5 text-[9px] font-mono px-1.5 py-0.5 rounded font-bold border backdrop-blur-md shadow-sm"
                            style={{
                              backgroundColor: `${p.color_accent}30`,
                              borderColor: `${p.color_accent}70`,
                              color: p.color_accent
                            }}
                          >
                            {p.codigo}
                          </span>
                          <span className="absolute bottom-1 right-1 text-[8px] font-mono px-1 py-0.2 rounded bg-black/70 text-slate-300 border border-white/10">
                            {p.imagen_origen === 'ARCHIVO_LOCAL' ? 'Local' :
                             p.imagen_origen === 'BANCO_SIAH' ? 'SIAH' :
                             p.imagen_origen === 'CAMARA_DIRECTA' ? 'Cámara' : 'Web'}
                          </span>
                        </div>

                        <div className="min-w-0 flex-1 space-y-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <h5 className="text-sm font-bold text-white group-hover:text-[#38BDF8] transition-colors truncate">
                              {p.nombre}
                            </h5>
                            <span className="text-[10px] px-2 py-0.5 rounded bg-white/[0.06] text-slate-300 border border-white/10 font-medium">
                              {p.categoria}
                            </span>
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-950/80 text-emerald-400 border border-emerald-500/40 font-semibold font-mono">
                              {p.estado.replace('_', ' ')}
                            </span>
                            {p.auditoria_estado && (
                              <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-950/80 text-sky-400 border border-sky-500/40 font-mono">
                                Auditoría: {p.auditoria_estado}
                              </span>
                            )}
                          </div>

                          <p className="text-xs text-sky-200 font-medium truncate">
                            {p.subtitulo}
                          </p>

                          <p className="text-xs text-slate-400 line-clamp-1 leading-relaxed">
                            {p.descripcion_corta}
                          </p>

                          {/* Location & Cooperantes */}
                          <div className="flex flex-wrap items-center gap-3 pt-1 text-[11px] text-slate-400">
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3 h-3 text-[#38BDF8]" />
                              <span className="truncate max-w-[200px]">{p.ubicacion}</span>
                            </span>
                            <span className="hidden sm:inline text-slate-600">•</span>
                            <span className="flex items-center gap-1 font-mono">
                              <UsersIcon className="w-3 h-3 text-sky-400" />
                              {p.beneficiarios_directos.toLocaleString()} beneficiarios
                            </span>
                            <span className="hidden sm:inline text-slate-600">•</span>
                            <span className="font-mono text-emerald-400 font-bold">
                              ${(p.inversion_estimada_usd / 1000).toFixed(0)}k USD
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Right: Progress & Action Buttons */}
                      <div className="flex flex-row md:flex-col items-center md:items-end justify-between md:justify-center gap-3 shrink-0 border-t md:border-t-0 pt-3 md:pt-0 border-white/10">
                        {/* Progress */}
                        <div className="w-32 text-right">
                          <div className="flex items-center justify-between text-xs mb-1">
                            <span className="text-slate-400 text-[10px]">Avance Físico</span>
                            <span className="font-bold text-white font-mono">{p.avance_porcentaje}%</span>
                          </div>
                          <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-gradient-to-r from-blue-500 to-[#38BDF8] rounded-full"
                              style={{ width: `${p.avance_porcentaje}%` }}
                            />
                          </div>
                        </div>

                        {/* Buttons */}
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleOpenEditProject(p)}
                            className="px-3.5 py-1.5 rounded-xl bg-white/[0.08] hover:bg-[#38BDF8] text-[#38BDF8] hover:text-[#000033] font-bold text-xs flex items-center gap-1.5 border border-[#38BDF8]/40 shadow-[0_0_12px_rgba(56,189,248,0.2)] transition-all hover:scale-[1.02]"
                            title="Editar toda la información del proyecto (Carrusel 3D y Ficha Técnica)"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                            <span>Editar Toda la Información</span>
                          </button>

                          {(isSuperAdmin || isAdmin) && (
                            <button
                              type="button"
                              onClick={() => handleDeleteProject(p.id)}
                              className="p-1.5 rounded-xl bg-rose-950/40 hover:bg-rose-600 text-rose-300 hover:text-white border border-rose-500/30 transition-all"
                              title="Eliminar proyecto del catálogo y carrusel"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ========================================================================= */}
            {/* TAB: 10 SERVICIOS SIAH (SUPERADMIN, ADMIN)                                */}
            {/* ========================================================================= */}
            {activeTab === 'servicios' && (isSuperAdmin || isAdmin) && (
              <div className="space-y-4 animate-in fade-in duration-200">
                <span className="text-xs text-slate-400 block">
                  Los 10 servicios estructurados en las 4 áreas troncales de acompañamiento humanitario:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {servicios.map((s) => (
                    <div key={s.id} className="p-3.5 rounded-xl bg-white/[0.03] border border-white/10">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-white text-xs">{s.numero}. {s.titulo}</span>
                        <span className="text-[10px] font-mono text-[#38BDF8] bg-white/[0.05] border border-[#38BDF8]/30 px-2 py-0.5 rounded-full">
                          Pilar {s.area_id.split('-')[0]}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 line-clamp-2">{s.descripcion}</p>
                      <div className="text-[10px] font-mono text-slate-400 mt-2">
                        Normativa: {s.normativas_referencia}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ========================================================================= */}
            {/* TAB: EQUIPO PROFESIONAL MULTIDISCIPLINARIO (NIVELES 1, 2 Y 3 AUTORIZADOS) */}
            {/* ========================================================================= */}
            {activeTab === 'profesionales' && (isSuperAdmin || isAdmin || isAuditor) && (
              <div className="space-y-5 animate-in fade-in duration-200">
                {/* Header Banner */}
                <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-white flex items-center gap-2">
                        <Briefcase className="w-4 h-4 text-[#38BDF8]" />
                        <span>Gestión del Equipo Multidisciplinario (Sección Quiénes Somos)</span>
                      </h4>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-950/60 text-emerald-400 border border-emerald-500/30 font-semibold flex items-center gap-1">
                        <CheckCircle2 className="w-2.5 h-2.5" /> Nivel {currentUser.rol_id} Autorizado
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 mt-1">
                      Conforme a la gobernanza SIAH, los usuarios de <strong>Nivel 1 (Superadmin)</strong>, <strong>Nivel 2 (Director Operativo)</strong> y <strong>Nivel 3 (Auditor Concurrente)</strong> pueden modificar, registrar y desincorporar miembros del cuerpo técnico colegiado.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={handleOpenAddProfesional}
                    className="px-4 py-2 rounded-xl bg-[#38BDF8] hover:bg-[#0284C7] text-[#000033] hover:text-white text-xs font-bold transition-all shadow-[0_0_15px_rgba(56,189,248,0.3)] flex items-center gap-1.5 shrink-0"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>+ Agregar Especialista</span>
                  </button>
                </div>

                {/* Professionals List Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {profesionales.map((prof) => (
                    <div 
                      key={prof.id} 
                      className="p-4 rounded-2xl bg-white/[0.03] hover:bg-white/[0.05] border border-white/10 transition-all flex flex-col justify-between gap-3 group relative"
                    >
                      <div className="flex items-start gap-3.5">
                        <div className="relative shrink-0">
                          <img
                            src={prof.foto_url}
                            alt={prof.nombre}
                            className="w-16 h-16 rounded-xl object-cover border border-white/10 shadow-sm"
                            referrerPolicy="no-referrer"
                          />
                          <span className="absolute -top-1 -left-1 text-[8px] font-mono font-bold bg-[#000033]/90 text-[#38BDF8] px-1 py-0.2 rounded border border-[#38BDF8]/30">
                            {prof.foto_origen === 'ARCHIVO_LOCAL' ? 'Local' :
                             prof.foto_origen === 'BANCO_SIAH' ? 'Banco' :
                             prof.foto_origen === 'AVATAR_GENERADO' ? 'SVG' :
                             prof.foto_origen === 'CAMARA_DIRECTA' ? 'Cam' : 'Web'}
                          </span>
                          <span className="absolute -bottom-1 -right-1 text-[9px] font-mono font-bold bg-[#000033] text-[#38BDF8] px-1.5 py-0.2 rounded border border-[#38BDF8]/40">
                            {prof.experiencia_anos}a exp
                          </span>
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <h5 className="font-bold text-white text-xs sm:text-sm truncate">{prof.nombre}</h5>
                              <div className="text-[#38BDF8] text-[11px] font-medium truncate">{prof.cargo}</div>
                              <div className="text-slate-400 text-[10px] truncate">{prof.departamento}</div>
                            </div>
                            <span className="text-[10px] font-mono text-slate-400 bg-white/[0.04] px-1.5 py-0.5 rounded border border-white/5">
                              #{prof.orden_visual}
                            </span>
                          </div>

                          <div className="text-slate-400 text-[10px] flex items-center gap-1 mt-1 truncate">
                            <Mail className="w-3 h-3 text-slate-500 shrink-0" />
                            <span>{prof.email_corporativo}</span>
                          </div>
                        </div>
                      </div>

                      {/* Especialidad y Certificaciones */}
                      <div className="space-y-1.5 pt-2 border-t border-white/5 text-[11px]">
                        {prof.especialidad && (
                          <div className="text-slate-300 text-xs line-clamp-1">
                            <strong className="text-slate-400 font-normal">Especialidad: </strong>
                            {prof.especialidad}
                          </div>
                        )}

                        <div className="flex flex-wrap gap-1">
                          {(prof.certificaciones || []).map((cert, idx) => (
                            <span
                              key={idx}
                              className="text-[9px] font-mono px-2 py-0.5 rounded bg-white/[0.05] text-[#38BDF8] border border-[#38BDF8]/20 flex items-center gap-1"
                            >
                              <Award className="w-2.5 h-2.5 text-amber-400" />
                              <span>{cert}</span>
                            </span>
                          ))}
                        </div>

                        {prof.biografia && (
                          <p className="text-[11px] text-slate-400 line-clamp-2 italic pt-1">
                            "{prof.biografia}"
                          </p>
                        )}
                      </div>

                      {/* Card Action Controls (Authorized for Levels 1, 2 and 3) */}
                      <div className="pt-2 border-t border-white/10 flex items-center justify-between">
                        <span className="text-[10px] text-slate-500">
                          ID: {prof.id} • Modificable por N1, N2, N3
                        </span>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleDeleteProfesional(prof.id)}
                            className="px-2.5 py-1 rounded-lg bg-rose-950/30 hover:bg-rose-900/60 text-rose-300 hover:text-rose-100 text-xs border border-rose-500/20 transition-all flex items-center gap-1"
                            title="Desincorporar especialista"
                          >
                            <Trash2 className="w-3 h-3" />
                            <span>Eliminar</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleOpenEditProfesional(prof)}
                            className="px-3 py-1 rounded-lg bg-white/[0.08] hover:bg-[#38BDF8] text-[#38BDF8] hover:text-[#000033] text-xs font-semibold border border-[#38BDF8]/30 transition-all flex items-center gap-1 shadow-sm"
                          >
                            <Edit3 className="w-3 h-3" />
                            <span>Editar Ficha</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>

          {/* Modal Footer with Active Session info */}
          <div className="p-4 border-t border-white/10 bg-white/[0.02] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>
                Sesión actual: <strong className="text-white">{currentUser.nombre}</strong> • {userRole.nombre}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setUserToEditModal(currentUser)}
                className="px-3 py-1.5 rounded-xl bg-white/[0.06] hover:bg-white/10 text-[#38BDF8] text-xs font-semibold border border-white/10 transition-all flex items-center gap-1.5"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Editar Mi Usuario</span>
              </button>

              <button
                onClick={onClose}
                className="px-4 py-1.5 rounded-xl bg-white/[0.05] hover:bg-white/10 text-slate-200 text-xs font-semibold border border-white/10 transition-all"
              >
                Cerrar Panel
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* Edit User Modal (Handles RBAC permission level logic for editing any user) */}
      <EditUserModal
        isOpen={!!userToEditModal}
        onClose={() => setUserToEditModal(null)}
        userToEdit={userToEditModal}
        currentUser={currentUser}
        roles={roles}
        onSaveUser={handleSaveEditedUser}
      />

      {/* Edit Profesional Modal (Handles RBAC for Levels 1, 2 and 3) */}
      <EditProfesionalModal
        isOpen={isNewProfesionalModal || !!profesionalToEdit}
        onClose={() => {
          setProfesionalToEdit(null);
          setIsNewProfesionalModal(false);
        }}
        profesionalToEdit={profesionalToEdit}
        isNew={isNewProfesionalModal}
        currentUser={currentUser}
        onSaveProfesional={handleSaveProfesional}
      />

      {/* Edit Project Modal (Full project editing for Carousel 3D and Ficha Técnica) */}
      <EditProjectModal
        isOpen={isNewProjectModal || !!projectToEditInModal}
        onClose={() => {
          setProjectToEditInModal(null);
          setIsNewProjectModal(false);
        }}
        projectToEdit={projectToEditInModal}
        isNew={isNewProjectModal}
        currentUser={currentUser}
        onSaveProject={handleSaveProjectFromModal}
      />

      {/* Sub-modal: Selector de Origen de Imagen para Mi Perfil */}
      <ImageSourceSelectorModal
        isOpen={isSelfImageSourceModalOpen}
        onClose={() => setIsSelfImageSourceModalOpen(false)}
        currentImageUrl={selfProfileData.avatar_url || currentUser.avatar_url || ''}
        currentOrigin={selfProfileData.avatar_origen}
        profileName={selfProfileData.nombre || currentUser.nombre}
        title="Origen de Mi Fotografía de Perfil"
        subtitle="Seleccione el origen para actualizar su avatar personal en MariaDB"
        onSelectImage={(newUrl, newOrigin) => {
          setSelfProfileData(prev => ({
            ...prev,
            avatar_url: newUrl,
            avatar_origen: newOrigin
          }));
        }}
      />
    </>
  );
};
