import React from 'react';
import { Profesional, Usuario } from '../types';
import { 
  UsersRound, 
  Award, 
  Briefcase, 
  Mail, 
  ShieldCheck, 
  Sparkles,
  CheckCircle2,
  Edit3,
  Plus,
  Settings
} from 'lucide-react';

interface TeamSectionProps {
  profesionales: Profesional[];
  currentUser?: Usuario | null;
  onEditProfesional?: (prof: Profesional) => void;
  onAddProfesional?: () => void;
  onOpenCmsTeam?: () => void;
}

export const TeamSection: React.FC<TeamSectionProps> = ({ 
  profesionales,
  currentUser,
  onEditProfesional,
  onAddProfesional,
  onOpenCmsTeam
}) => {
  // Authorization check: Niveles 1, 2 y 3 autorizados para modificar el equipo multidisciplinario
  const isLevel1 = currentUser?.rol_id === 1; // Superadmin
  const isLevel2 = currentUser?.rol_id === 2; // Admin / Operativo
  const isLevel3 = currentUser?.rol_id === 3; // Auditor
  const isAuthorized = isLevel1 || isLevel2 || isLevel3;

  return (
    <section id="quienes-somos" className="py-20 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/[0.05] border border-[#38BDF8]/40 text-xs font-semibold text-[#38BDF8] font-mono mb-3 shadow-[0_0_15px_rgba(56,189,248,0.2)]">
            <UsersRound className="w-3.5 h-3.5 text-[#38BDF8]" />
            <span>QUIÉNES SOMOS • EQUIPO MULTIDISCIPLINARIO 360 SIACE</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            El Equipo Multidisciplinario de la Sección "Quiénes Somos"
          </h2>
          <p className="text-slate-300 text-sm sm:text-base mt-3 leading-relaxed">
            Una sinergia de ingenieros colegiados, auditores fiduciarios certificados, expertos legales en convenios internacionales y arquitectos de sistemas dedicados a blindar la ejecución en terreno.
          </p>
        </div>

        {/* Authorized RBAC Management Banner (Levels 1, 2 and 3) */}
        {isAuthorized && (
          <div className="mb-10 p-4 sm:p-5 rounded-2xl bg-white/[0.03] border border-[#38BDF8]/30 shadow-[0_0_25px_rgba(56,189,248,0.12)] backdrop-blur-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4 animate-in fade-in duration-300">
            <div className="flex items-start sm:items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-[#38BDF8]/10 border border-[#38BDF8]/40 flex items-center justify-center text-[#38BDF8] shrink-0 shadow-inner">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs sm:text-sm font-bold text-white">
                    Modo Edición del Equipo Técnico Multidisciplinario
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-950/60 text-emerald-400 border border-emerald-500/30 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                    Autorizado: Nivel {currentUser?.rol_id} ({currentUser?.rol_nombre})
                  </span>
                </div>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                  Conforme a los privilegios del sistema, los usuarios de <strong>Nivel 1 (Superadmin)</strong>, <strong>Nivel 2 (Director Operativo)</strong> y <strong>Nivel 3 (Auditor Concurrente)</strong> tienen potestad para editar las fichas de los especialistas, actualizar certificaciones fiduciarias o incorporar nuevos miembros al equipo.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 w-full md:w-auto shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-white/10">
              {onAddProfesional && (
                <button
                  type="button"
                  onClick={onAddProfesional}
                  className="flex-1 md:flex-none px-3.5 py-2 rounded-xl bg-[#38BDF8] hover:bg-[#0284C7] text-[#000033] hover:text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-[0_0_15px_rgba(56,189,248,0.25)]"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+ Nuevo Especialista</span>
                </button>
              )}

              {onOpenCmsTeam && (
                <button
                  type="button"
                  onClick={onOpenCmsTeam}
                  className="flex-1 md:flex-none px-3.5 py-2 rounded-xl bg-white/[0.08] hover:bg-white/15 text-white text-xs font-semibold border border-white/10 transition-all flex items-center justify-center gap-1.5"
                >
                  <Settings className="w-3.5 h-3.5 text-[#38BDF8]" />
                  <span>Gestionar en CMS</span>
                </button>
              )}
            </div>
          </div>
        )}

        {/* Team Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {profesionales.map((profesional) => (
            <div
              key={profesional.id}
              id={`profesional-${profesional.id}`}
              className="glass-panel glass-panel-hover rounded-2xl border border-white/10 p-5 flex flex-col justify-between group transition-all hover:border-[#38BDF8]/40 relative"
            >
              <div>
                {/* Photo & Badge */}
                <div className="relative w-full h-48 rounded-xl overflow-hidden mb-4 border border-white/10">
                  <img
                    src={profesional.foto_url}
                    alt={profesional.nombre}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#000033] via-transparent to-transparent" />
                  
                  {/* Quick Edit button for authorized Levels 1, 2 and 3 */}
                  {isAuthorized && onEditProfesional && (
                    <button
                      type="button"
                      onClick={() => onEditProfesional(profesional)}
                      className="absolute top-2.5 right-2.5 z-10 px-2.5 py-1 rounded-lg bg-[#000033]/85 hover:bg-[#38BDF8] text-[#38BDF8] hover:text-[#000033] border border-[#38BDF8]/40 text-[11px] font-semibold transition-all flex items-center gap-1 backdrop-blur-md shadow-lg"
                      title="Editar ficha de este profesional (Niveles 1, 2 y 3)"
                    >
                      <Edit3 className="w-3 h-3" />
                      <span>Editar</span>
                    </button>
                  )}

                  <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold bg-[#000033]/90 text-[#38BDF8] px-2.5 py-0.5 rounded-lg border border-[#38BDF8]/40 backdrop-blur-md shadow-sm">
                      {profesional.experiencia_anos}+ años exp.
                    </span>
                    <span className="text-[9px] font-mono text-slate-300 bg-black/70 border border-white/10 px-1.5 py-0.5 rounded backdrop-blur-sm">
                      {profesional.foto_origen === 'ARCHIVO_LOCAL' ? 'PC/Local' :
                       profesional.foto_origen === 'BANCO_SIAH' ? 'Banco SIAH' :
                       profesional.foto_origen === 'AVATAR_GENERADO' ? 'SVG' :
                       profesional.foto_origen === 'CAMARA_DIRECTA' ? 'Cámara' : 'Web'}
                    </span>
                  </div>
                </div>

                {/* Info */}
                <div className="flex items-start justify-between gap-2">
                  <h3 className="text-base font-bold text-white group-hover:text-[#38BDF8] transition-colors">
                    {profesional.nombre}
                  </h3>
                </div>
                <p className="text-xs text-[#38BDF8] font-semibold mt-0.5">
                  {profesional.cargo}
                </p>
                <p className="text-[11px] text-slate-400 font-medium mb-3">
                  {profesional.departamento}
                </p>

                <p className="text-xs text-slate-300 leading-relaxed mb-3 line-clamp-3">
                  {profesional.biografia}
                </p>

                {/* Certifications tags */}
                <div className="space-y-1 mb-4">
                  <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
                    Acreditaciones Clave:
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {profesional.certificaciones.map((cert, idx) => (
                      <span
                        key={idx}
                        className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/[0.04] text-slate-300 border border-white/10 flex items-center gap-1"
                      >
                        <Award className="w-2.5 h-2.5 text-amber-400" />
                        {cert}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Email / Contact footer + Action Button */}
              <div className="pt-3 border-t border-white/10 flex items-center justify-between text-xs gap-2">
                <a
                  href={`mailto:${profesional.email_corporativo}`}
                  className="text-slate-400 hover:text-[#38BDF8] flex items-center gap-1.5 truncate max-w-[180px] transition-colors"
                >
                  <Mail className="w-3.5 h-3.5 text-[#38BDF8] shrink-0" />
                  <span className="truncate">{profesional.email_corporativo}</span>
                </a>

                {isAuthorized && onEditProfesional && (
                  <button
                    type="button"
                    onClick={() => onEditProfesional(profesional)}
                    className="p-1 rounded-md text-slate-400 hover:text-[#38BDF8] hover:bg-white/[0.05] transition-colors"
                    title="Editar ficha"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
