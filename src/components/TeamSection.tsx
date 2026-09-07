import React from 'react';
import { Profesional } from '../types';
import { 
  UsersRound, 
  Award, 
  Briefcase, 
  Mail, 
  ShieldCheck, 
  Sparkles,
  CheckCircle2
} from 'lucide-react';

interface TeamSectionProps {
  profesionales: Profesional[];
}

export const TeamSection: React.FC<TeamSectionProps> = ({ profesionales }) => {
  return (
    <section id="quienes-somos" className="py-20 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/[0.05] border border-[#38BDF8]/40 text-xs font-semibold text-[#38BDF8] font-mono mb-3 shadow-[0_0_15px_rgba(56,189,248,0.2)]">
            <UsersRound className="w-3.5 h-3.5 text-[#38BDF8]" />
            <span>QUIÉNES SOMOS • GESTIÓN DE PROFESIONALES Y ESPECIALISTAS</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            El Equipo Técnico Multidisciplinario de 360 SIACE
          </h2>
          <p className="text-slate-300 text-sm sm:text-base mt-3 leading-relaxed">
            Una sinergia de ingenieros colegiados, auditores fiduciarios certificados, expertos legales en convenios internacionales y arquitectos de sistemas dedicados a blindar la ejecución en terreno.
          </p>
        </div>

        {/* Team Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {profesionales.map((profesional) => (
            <div
              key={profesional.id}
              id={`profesional-${profesional.id}`}
              className="glass-panel glass-panel-hover rounded-2xl border border-white/10 p-5 flex flex-col justify-between group transition-all hover:border-[#38BDF8]/40"
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
                  
                  <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold bg-[#000033]/90 text-[#38BDF8] px-2.5 py-0.5 rounded-lg border border-[#38BDF8]/40 backdrop-blur-md shadow-sm">
                      {profesional.experiencia_anos}+ años exp.
                    </span>
                  </div>
                </div>

                {/* Info */}
                <h3 className="text-base font-bold text-white group-hover:text-[#38BDF8] transition-colors">
                  {profesional.nombre}
                </h3>
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

              {/* Email / Contact footer */}
              <div className="pt-3 border-t border-white/10 flex items-center justify-between text-xs">
                <a
                  href={`mailto:${profesional.email_corporativo}`}
                  className="text-slate-400 hover:text-[#38BDF8] flex items-center gap-1.5 truncate max-w-[220px] transition-colors"
                >
                  <Mail className="w-3.5 h-3.5 text-[#38BDF8] shrink-0" />
                  <span className="truncate">{profesional.email_corporativo}</span>
                </a>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
