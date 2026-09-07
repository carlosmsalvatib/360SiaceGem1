import React, { useState } from 'react';
import { 
  X, 
  LogIn, 
  ShieldCheck, 
  Key, 
  Mail, 
  Lock, 
  Sparkles, 
  UserCheck, 
  AlertCircle
} from 'lucide-react';
import { Usuario } from '../types';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: Usuario) => void;
  availableUsers: Usuario[];
}

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
  availableUsers
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleCustomLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const userFound = availableUsers.find(u => u.email.toLowerCase() === email.trim().toLowerCase());
    if (userFound) {
      setErrorMsg('');
      onLoginSuccess(userFound);
      onClose();
    } else {
      setErrorMsg('Usuario no encontrado en la base de datos MariaDB. Puede usar los accesos de prueba preconfigurados.');
    }
  };

  const handleQuickLogin = (user: Usuario) => {
    setErrorMsg('');
    onLoginSuccess(user);
    onClose();
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-md bg-[#000033]/90 border border-white/10 rounded-3xl shadow-[0_8px_32px_0_rgba(0,0,51,0.8)] backdrop-blur-2xl p-6 sm:p-8 text-slate-100 space-y-6"
        onClick={e => e.stopPropagation()}
      >
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl bg-white/[0.05] text-slate-400 hover:text-white border border-white/10 hover:bg-white/10 transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-white/[0.08] flex items-center justify-center mx-auto shadow-[0_0_15px_rgba(56,189,248,0.2)] border border-[#38BDF8]/40 text-[#38BDF8]">
            <Lock className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-extrabold text-white">
            Acceso al Back-Office SIAH
          </h3>
          <p className="text-xs text-slate-300">
            Organización 360 SIACE • Autenticación Cifrada MariaDB
          </p>
        </div>

        {/* Quick Demo Access Buttons */}
        <div className="space-y-2">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-[#38BDF8] block text-center">
            Perfiles de Prueba Rápidos (Un Clic):
          </span>
          <div className="grid grid-cols-1 gap-2">
            {availableUsers.map((user) => (
              <button
                key={user.id}
                onClick={() => handleQuickLogin(user)}
                className="w-full p-2.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 hover:border-[#38BDF8]/50 text-left flex items-center justify-between transition-all group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-white/[0.08] border border-white/10 flex items-center justify-center text-xs font-bold text-[#38BDF8]">
                    {user.nombre.charAt(0)}
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white group-hover:text-[#38BDF8]">
                      {user.nombre}
                    </div>
                    <div className="text-[11px] text-slate-400 font-mono">
                      {user.email}
                    </div>
                  </div>
                </div>
                <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-[#000033] text-[#38BDF8] border border-[#38BDF8]/30">
                  {user.rol_nombre?.split(' ')[0]}
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className="relative flex items-center justify-center">
          <div className="border-t border-white/10 w-full" />
          <span className="bg-[#000033] px-3 text-[11px] text-slate-400 uppercase tracking-wider font-mono">
            o ingrese credenciales
          </span>
        </div>

        {/* Form */}
        <form onSubmit={handleCustomLogin} className="space-y-4">
          {errorMsg && (
            <div className="p-2.5 rounded-xl bg-rose-950/70 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">
              Correo Electrónico
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="salvaticarlos@gmail.com"
                className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-white/[0.05] border border-white/10 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-[#38BDF8] backdrop-blur-md"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">
              Contraseña
            </label>
            <div className="relative">
              <Key className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-white/[0.05] border border-white/10 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-[#38BDF8] backdrop-blur-md"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-2.5 px-4 rounded-xl bg-[#38BDF8] hover:bg-sky-300 text-[#000033] font-bold text-xs flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(56,189,248,0.4)] border border-sky-200/50 transition-all hover:scale-[1.01]"
          >
            <LogIn className="w-4 h-4" />
            <span>Iniciar Sesión en el CMS</span>
          </button>
        </form>

        <div className="text-center text-[11px] text-slate-400 font-mono">
          <span>Servidor seguro • Conexión HTTPS Forzada www.360siace.com</span>
        </div>
      </div>
    </div>
  );
};
