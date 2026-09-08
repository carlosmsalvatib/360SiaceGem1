import React, { useState, useEffect } from 'react';
import { 
  X, 
  UserCheck, 
  Shield, 
  Mail, 
  Briefcase, 
  Phone, 
  Building, 
  Image as ImageIcon, 
  Key, 
  Save, 
  AlertTriangle,
  Lock,
  CheckCircle2,
  Sliders,
  Sparkles,
  Database
} from 'lucide-react';
import { Usuario, Rol, OrigenImagen } from '../types';
import { ImageSourceSelectorModal } from './ImageSourceSelectorModal';

interface EditUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  userToEdit: Usuario | null;
  currentUser: Usuario;
  roles: Rol[];
  onSaveUser: (updatedUser: Usuario) => void;
}

const AVATAR_PRESETS = [
  { label: 'Avatar Masculino 1', url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80' },
  { label: 'Avatar Femenino 1', url: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=200&q=80' },
  { label: 'Avatar Masculino 2', url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80' },
  { label: 'Avatar Femenino 2', url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80' },
  { label: 'Avatar Masculino 3', url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80' }
];

export const EditUserModal: React.FC<EditUserModalProps> = ({
  isOpen,
  onClose,
  userToEdit,
  currentUser,
  roles,
  onSaveUser
}) => {
  const [formData, setFormData] = useState<Partial<Usuario>>({});
  const [newPassword, setNewPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [isImageSourceModalOpen, setIsImageSourceModalOpen] = useState(false);

  useEffect(() => {
    if (userToEdit) {
      setFormData({
        ...userToEdit,
        cargo: userToEdit.cargo || '',
        telefono: userToEdit.telefono || '',
        organizacion: userToEdit.organizacion || '',
        avatar_url: userToEdit.avatar_url || AVATAR_PRESETS[0].url,
        avatar_origen: userToEdit.avatar_origen || 'URL_EXTERNA'
      });
      setNewPassword('');
      setErrorMsg('');
      setSavedSuccess(false);
    }
  }, [userToEdit]);

  if (!isOpen || !userToEdit) return null;

  const isSelf = currentUser.id === userToEdit.id;
  const isCurrentSuperAdmin = currentUser.rol_id === 1;
  const isCurrentAdmin = currentUser.rol_id === 2;
  const isTargetSuperAdmin = userToEdit.rol_id === 1;

  // Authorization checks
  // 1. Can this current user edit this target user at all?
  const canEditThisUser = 
    isSelf || 
    isCurrentSuperAdmin || 
    (isCurrentAdmin && !isTargetSuperAdmin);

  // 2. Can change target user's role?
  const canChangeRole = 
    isCurrentSuperAdmin || 
    (isCurrentAdmin && !isTargetSuperAdmin && !isSelf);

  // 3. Allowed roles that current user can assign
  const assignableRoles = roles.filter(r => {
    if (isCurrentSuperAdmin) return true;
    if (isCurrentAdmin) return r.id >= 2; // Admin cannot assign SuperAdmin
    return r.id === userToEdit.rol_id; // Read-only for other roles
  });

  // 4. Can change account status?
  const canChangeStatus = 
    (isCurrentSuperAdmin && !isSelf) || 
    (isCurrentAdmin && !isTargetSuperAdmin && !isSelf);

  const selectedRole = roles.find(r => r.id === formData.rol_id) || roles[0];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nombre?.trim() || !formData.email?.trim()) {
      setErrorMsg('El nombre y el correo electrónico son obligatorios.');
      return;
    }

    if (!canEditThisUser) {
      setErrorMsg('No cuenta con el nivel de autorización requerido para modificar este usuario.');
      return;
    }

    const rolObj = roles.find(r => r.id === Number(formData.rol_id));

    const updatedUser: Usuario = {
      ...userToEdit,
      nombre: formData.nombre.trim(),
      email: formData.email.trim(),
      rol_id: Number(formData.rol_id || userToEdit.rol_id),
      rol_nombre: rolObj?.nombre || userToEdit.rol_nombre,
      cargo: formData.cargo?.trim() || 'Especialista SIAH',
      telefono: formData.telefono?.trim() || '',
      organizacion: formData.organizacion?.trim() || '360 SIACE',
      avatar_url: formData.avatar_url || userToEdit.avatar_url,
      avatar_origen: (formData.avatar_origen as OrigenImagen) || userToEdit.avatar_origen || 'URL_EXTERNA',
      estado: (formData.estado as 'ACTIVO' | 'INACTIVO' | 'SUSPENDIDO') || userToEdit.estado,
      ...(newPassword ? { password_hash: 'argon2id_hash_updated' } : {})
    };

    onSaveUser(updatedUser);
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 1200);
  };

  return (
    <div 
      className="fixed inset-0 z-[60] flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-lg animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-2xl max-h-[92vh] flex flex-col bg-[#000033]/95 border border-white/10 rounded-3xl shadow-[0_12px_40px_rgba(0,0,51,0.95)] backdrop-blur-2xl overflow-hidden text-slate-100"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-white/10 flex items-center justify-between bg-white/[0.03]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/[0.08] border border-[#38BDF8]/40 flex items-center justify-center text-[#38BDF8] shadow-[0_0_15px_rgba(56,189,248,0.2)]">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold text-white">
                  {isSelf ? 'Modificar Mi Perfil (CMS Propio)' : `Editar Usuario: ${userToEdit.nombre}`}
                </h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/[0.06] text-[#38BDF8] border border-[#38BDF8]/30 font-semibold">
                  {isSelf ? 'Sesión Actual' : `ID: ${userToEdit.id}`}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Nivel de Autorización Requerido • Validación de Privilegios MariaDB
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

        {/* Authorization Banner */}
        <div className="px-6 py-2.5 bg-white/[0.02] border-b border-white/5 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-slate-300">
            <Shield className="w-3.5 h-3.5 text-[#38BDF8]" />
            <span>Operando como: <strong className="text-white">{currentUser.nombre}</strong> ({currentUser.rol_nombre})</span>
          </div>
          {isTargetSuperAdmin && !isCurrentSuperAdmin ? (
            <span className="text-[11px] font-semibold text-amber-400 flex items-center gap-1 bg-amber-950/40 px-2 py-0.5 rounded-md border border-amber-500/30">
              <Lock className="w-3 h-3" /> Cuenta protegida de Superadmin
            </span>
          ) : (
            <span className="text-[11px] font-semibold text-emerald-400 flex items-center gap-1 bg-emerald-950/40 px-2 py-0.5 rounded-md border border-emerald-500/30">
              <CheckCircle2 className="w-3 h-3" /> Modificación autorizada
            </span>
          )}
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5 flex-1 custom-scrollbar">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-950/70 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {savedSuccess && (
            <div className="p-3 rounded-xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>¡Usuario actualizado exitosamente con su correspondiente nivel de autorización!</span>
            </div>
          )}

          {/* Avatar Preview & Selection */}
          <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 flex flex-col sm:flex-row items-center gap-4">
            <div className="relative shrink-0">
              <img 
                src={formData.avatar_url || AVATAR_PRESETS[0].url} 
                alt={formData.nombre} 
                className="w-20 h-20 rounded-2xl object-cover border-2 border-[#38BDF8]/50 shadow-[0_0_20px_rgba(56,189,248,0.2)]"
                referrerPolicy="no-referrer"
              />
              <span className="absolute -bottom-1.5 -right-1.5 text-[9px] font-mono px-2 py-0.5 rounded-md bg-[#000033] text-[#38BDF8] border border-[#38BDF8]/40 shadow-sm font-bold">
                {formData.avatar_origen === 'ARCHIVO_LOCAL' ? 'PC/Móvil' : 
                 formData.avatar_origen === 'BANCO_SIAH' ? 'Banco SIAH' : 
                 formData.avatar_origen === 'AVATAR_GENERADO' ? 'Vector SVG' : 
                 formData.avatar_origen === 'CAMARA_DIRECTA' ? 'Cámara' : 'Web URL'}
              </span>
            </div>

            <div className="flex-1 w-full space-y-2">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  <ImageIcon className="w-3.5 h-3.5 text-[#38BDF8]" />
                  Fotografía de Perfil / Avatar Corporativo
                </label>

                {/* BOTÓN: Seleccionar Origen de la Imagen */}
                <button
                  type="button"
                  onClick={() => setIsImageSourceModalOpen(true)}
                  className="px-3 py-1.5 rounded-xl bg-white/[0.08] hover:bg-[#38BDF8] text-[#38BDF8] hover:text-[#000033] border border-[#38BDF8]/40 text-xs font-bold transition-all flex items-center gap-1.5 shadow-[0_0_12px_rgba(56,189,248,0.2)] hover:scale-[1.02]"
                >
                  <Sliders className="w-3.5 h-3.5" />
                  <span>Seleccionar Origen de Imagen</span>
                </button>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="url"
                  value={formData.avatar_url || ''}
                  onChange={e => setFormData({ ...formData, avatar_url: e.target.value })}
                  placeholder="https://images.unsplash.com/... o data:image/..."
                  className="flex-1 px-3 py-1.5 rounded-xl bg-white/[0.05] border border-white/10 text-xs text-white focus:outline-none focus:border-[#38BDF8] font-mono truncate"
                />
                <button
                  type="button"
                  onClick={() => setIsImageSourceModalOpen(true)}
                  className="p-1.5 rounded-xl bg-white/[0.05] hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 shrink-0"
                  title="Examinar y cambiar origen (Local, Web, Banco SIAH, SVG, Cámara)"
                >
                  <Sparkles className="w-4 h-4 text-[#38BDF8]" />
                </button>
              </div>

              <div className="flex flex-wrap items-center gap-1.5 text-[10px] text-slate-400">
                <span className="font-semibold text-slate-300">Presets rápidos:</span>
                {AVATAR_PRESETS.map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setFormData({ ...formData, avatar_url: preset.url, avatar_origen: 'BANCO_SIAH' })}
                    className="px-2 py-0.5 rounded-md bg-white/[0.06] hover:bg-[#38BDF8] hover:text-[#000033] text-slate-300 border border-white/10 transition-all"
                  >
                    Preset {idx + 1}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Grid of details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                Nombre y Apellidos
              </label>
              <input
                type="text"
                required
                value={formData.nombre || ''}
                onChange={e => setFormData({ ...formData, nombre: e.target.value })}
                placeholder="Ej. Ing. Carlos Salvatierra"
                className="w-full px-3 py-2 rounded-xl bg-white/[0.05] border border-white/10 text-xs text-white focus:outline-none focus:border-[#38BDF8] backdrop-blur-md"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1 flex items-center gap-1">
                <Mail className="w-3 h-3 text-[#38BDF8]" />
                Correo Electrónico Corporativo
              </label>
              <input
                type="email"
                required
                value={formData.email || ''}
                onChange={e => setFormData({ ...formData, email: e.target.value })}
                placeholder="usuario@360siace.com"
                className="w-full px-3 py-2 rounded-xl bg-white/[0.05] border border-white/10 text-xs text-white focus:outline-none focus:border-[#38BDF8] backdrop-blur-md"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1 flex items-center gap-1">
                <Briefcase className="w-3 h-3 text-[#38BDF8]" />
                Cargo / Especialidad Técnica
              </label>
              <input
                type="text"
                value={formData.cargo || ''}
                onChange={e => setFormData({ ...formData, cargo: e.target.value })}
                placeholder="Ej. Auditor Senior Fiduciario"
                className="w-full px-3 py-2 rounded-xl bg-white/[0.05] border border-white/10 text-xs text-white focus:outline-none focus:border-[#38BDF8] backdrop-blur-md"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1 flex items-center gap-1">
                <Building className="w-3 h-3 text-[#38BDF8]" />
                Organización / Misión
              </label>
              <input
                type="text"
                value={formData.organizacion || ''}
                onChange={e => setFormData({ ...formData, organizacion: e.target.value })}
                placeholder="Ej. 360 SIACE / Misión Multilateral"
                className="w-full px-3 py-2 rounded-xl bg-white/[0.05] border border-white/10 text-xs text-white focus:outline-none focus:border-[#38BDF8] backdrop-blur-md"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1 flex items-center gap-1">
                <Phone className="w-3 h-3 text-[#38BDF8]" />
                Teléfono Directo / Celular
              </label>
              <input
                type="text"
                value={formData.telefono || ''}
                onChange={e => setFormData({ ...formData, telefono: e.target.value })}
                placeholder="+58 414-000-0000"
                className="w-full px-3 py-2 rounded-xl bg-white/[0.05] border border-white/10 text-xs text-white focus:outline-none focus:border-[#38BDF8] backdrop-blur-md"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1 flex items-center justify-between">
                <span>Rol & Nivel de Autorización</span>
                {!canChangeRole && (
                  <span className="text-[10px] text-amber-400 font-mono">Solo lectura</span>
                )}
              </label>
              <select
                disabled={!canChangeRole}
                value={formData.rol_id || userToEdit.rol_id}
                onChange={e => setFormData({ ...formData, rol_id: Number(e.target.value) })}
                className={`w-full px-3 py-2 rounded-xl bg-[#000033] border border-white/10 text-xs text-white focus:outline-none focus:border-[#38BDF8] ${
                  !canChangeRole ? 'opacity-60 cursor-not-allowed' : ''
                }`}
              >
                {assignableRoles.map(r => (
                  <option key={r.id} value={r.id} className="bg-[#000033] text-white">
                    {r.nombre}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Account Status and Security PIN */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-2xl bg-white/[0.02] border border-white/10">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1 flex items-center justify-between">
                <span>Estado de la Cuenta</span>
                {!canChangeStatus && (
                  <span className="text-[10px] text-slate-400 font-mono">Control admin</span>
                )}
              </label>
              <select
                disabled={!canChangeStatus}
                value={formData.estado || userToEdit.estado}
                onChange={e => setFormData({ ...formData, estado: e.target.value as any })}
                className={`w-full px-3 py-2 rounded-xl bg-[#000033] border border-white/10 text-xs text-white focus:outline-none focus:border-[#38BDF8] ${
                  !canChangeStatus ? 'opacity-60 cursor-not-allowed' : ''
                }`}
              >
                <option value="ACTIVO" className="bg-[#000033] text-emerald-400">ACTIVO (Habilitado)</option>
                <option value="INACTIVO" className="bg-[#000033] text-amber-400">INACTIVO (En Pausa)</option>
                <option value="SUSPENDIDO" className="bg-[#000033] text-rose-400">SUSPENDIDO (Bloqueado)</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1 flex items-center gap-1">
                <Key className="w-3 h-3 text-[#38BDF8]" />
                Nueva Contraseña / PIN de Acceso (Opcional)
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                placeholder="Dejar en blanco para mantener la actual"
                className="w-full px-3 py-2 rounded-xl bg-white/[0.05] border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#38BDF8] backdrop-blur-md"
              />
            </div>
          </div>

          {/* Permissions Matrix for the assigned role */}
          <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/10 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[#38BDF8] flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5" />
                CMS Asignado: {selectedRole.nombre}
              </span>
              <span className="text-[10px] font-mono text-slate-400">
                Código: {selectedRole.codigo}
              </span>
            </div>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              {selectedRole.descripcion}
            </p>
            <div className="flex flex-wrap gap-1 pt-1">
              {selectedRole.permisos.map((perm, idx) => (
                <span 
                  key={idx}
                  className="text-[9px] font-mono px-2 py-0.5 rounded bg-white/[0.04] text-slate-300 border border-white/5"
                >
                  ✓ {perm}
                </span>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-white/[0.05] text-slate-300 hover:text-white border border-white/10 text-xs transition-all"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={!canEditThisUser}
              className="px-6 py-2 rounded-xl bg-[#38BDF8] hover:bg-sky-300 text-[#000033] font-bold text-xs flex items-center gap-2 shadow-[0_0_20px_rgba(56,189,248,0.4)] border border-sky-200/50 transition-all hover:scale-[1.01] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className="w-4 h-4" />
              <span>Guardar Modificaciones de Usuario</span>
            </button>
          </div>
        </form>

        {/* Footer info */}
        <div className="px-6 py-3 border-t border-white/10 bg-white/[0.02] flex items-center justify-between text-[11px] text-slate-400 font-mono">
          <span className="flex items-center gap-1.5">
            <Database className="w-3.5 h-3.5 text-[#38BDF8]" />
            <span>MariaDB 10.11 LTS • Tabla \`usuarios\` (avatar_url & avatar_origen)</span>
          </span>
          <span>Último acceso: {userToEdit.ultimo_acceso || 'Nunca'}</span>
        </div>
      </div>

      {/* Sub-modal: Selector de Origen de Imagen */}
      <ImageSourceSelectorModal
        isOpen={isImageSourceModalOpen}
        onClose={() => setIsImageSourceModalOpen(false)}
        currentImageUrl={formData.avatar_url || ''}
        currentOrigin={formData.avatar_origen}
        profileName={formData.nombre || userToEdit.nombre}
        title="Origen de la Fotografía del Usuario"
        subtitle="Configurar fuente y almacenar en el registro de usuarios de MariaDB"
        onSelectImage={(newUrl, newOrigin) => {
          setFormData(prev => ({
            ...prev,
            avatar_url: newUrl,
            avatar_origen: newOrigin
          }));
        }}
      />
    </div>
  );
};
