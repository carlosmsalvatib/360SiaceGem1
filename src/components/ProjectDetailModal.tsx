import React from 'react';
import { Proyecto, Usuario } from '../types';
import { 
  X, 
  MapPin, 
  TrendingUp, 
  Users, 
  DollarSign, 
  ShieldCheck, 
  Globe2, 
  CheckCircle2, 
  Calendar, 
  Building, 
  HeartHandshake,
  Edit3,
  Sparkles
} from 'lucide-react';

interface ProjectDetailModalProps {
  proyecto: Proyecto | null;
  currentUser?: Usuario | null;
  onClose: () => void;
  onRequestQuote: (proyecto: Proyecto) => void;
  onEditProject?: (proyecto: Proyecto) => void;
}

export const ProjectDetailModal: React.FC<ProjectDetailModalProps> = ({
  proyecto,
  currentUser,
  onClose,
  onRequestQuote,
  onEditProject
}) => {
  if (!proyecto) return null;

  // Roles authorized to edit project in CMS: Superadmin (1), Admin (2), Auditor (3), Editor (4)
  const canEdit = !!currentUser && (currentUser.rol_id <= 4);

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-[#000033]/90 border border-white/10 rounded-3xl shadow-[0_8px_32px_0_rgba(0,0,51,0.8)] backdrop-blur-2xl p-6 sm:p-8 space-y-6 text-slate-100"
        onClick={e => e.stopPropagation()}
      >
        {/* Close & CMS Edit Buttons */}
        <div className="absolute top-5 right-5 flex items-center gap-2 z-10">
          {canEdit && onEditProject && (
            <button
              type="button"
              onClick={() => {
                onEditProject(proyecto);
              }}
              className="px-3 py-2 rounded-xl bg-[#000033]/80 hover:bg-[#38BDF8] text-[#38BDF8] hover:text-[#000033] border border-[#38BDF8]/50 hover:border-[#38BDF8] text-xs font-bold flex items-center gap-1.5 transition-all shadow-[0_0_15px_rgba(56,189,248,0.25)] backdrop-blur-md"
              title="Editar toda la información de este proyecto en el CMS"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Editar en CMS</span>
            </button>
          )}

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-[#000033]/80 text-slate-300 hover:text-white border border-white/10 hover:bg-white/10 transition-all backdrop-blur-md"
            title="Cerrar Ficha"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Hero Image Banner */}
        <div className="relative h-56 sm:h-64 rounded-2xl overflow-hidden border border-white/10">
          <img
            src={proyecto.imagen_url}
            alt={proyecto.nombre}
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#000033] via-[#000033]/40 to-transparent" />
          
          <div className="absolute top-4 left-4 flex items-center gap-2">
            <span 
              className="text-xs font-bold px-3 py-1 rounded-full backdrop-blur-md border font-mono shadow-sm"
              style={{ 
                backgroundColor: `${proyecto.color_accent}30`,
                borderColor: `${proyecto.color_accent}70`,
                color: proyecto.color_accent 
              }}
            >
              {proyecto.codigo}
            </span>
            <span className="text-xs font-semibold px-3 py-1 rounded-full bg-white/[0.08] text-[#38BDF8] border border-white/10 backdrop-blur-md">
              {proyecto.categoria}
            </span>
          </div>

          <div className="absolute bottom-4 left-4 right-4">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
              {proyecto.nombre}
            </h2>
            <p className="text-xs sm:text-sm text-sky-200 font-medium">
              {proyecto.subtitulo}
            </p>
          </div>
        </div>

        {/* KPI Metrics Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3 rounded-xl bg-white/[0.04] border border-white/10">
            <span className="text-[11px] text-slate-400 uppercase tracking-wider block">Avance Físico</span>
            <span className="text-lg font-bold text-white font-mono flex items-center gap-1 mt-0.5">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              {proyecto.avance_porcentaje}%
            </span>
          </div>

          <div className="p-3 rounded-xl bg-white/[0.04] border border-white/10">
            <span className="text-[11px] text-slate-400 uppercase tracking-wider block">Beneficiarios</span>
            <span className="text-lg font-bold text-[#38BDF8] font-mono flex items-center gap-1 mt-0.5">
              <Users className="w-4 h-4 text-[#38BDF8]" />
              {proyecto.beneficiarios_directos.toLocaleString()}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-white/[0.04] border border-white/10">
            <span className="text-[11px] text-slate-400 uppercase tracking-wider block">Presupuesto USD</span>
            <span className="text-lg font-bold text-emerald-400 font-mono flex items-center gap-1 mt-0.5">
              ${(proyecto.inversion_estimada_usd / 1000).toFixed(0)}k
            </span>
          </div>

          <div className="p-3 rounded-xl bg-white/[0.04] border border-white/10">
            <span className="text-[11px] text-slate-400 uppercase tracking-wider block">Estado SIAH</span>
            <span className="text-xs font-bold text-amber-400 font-mono flex items-center gap-1 mt-1">
              {proyecto.estado.replace('_', ' ')}
            </span>
          </div>
        </div>

        {/* Full Details Content */}
        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-1.5 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#38BDF8]" />
              Memoria Descriptiva del Proyecto
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              {proyecto.descripcion_larga}
            </p>
          </div>

          {/* Social Impact Box */}
          <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10">
            <h4 className="text-xs font-bold text-[#38BDF8] uppercase tracking-wider mb-1 flex items-center gap-1.5">
              <HeartHandshake className="w-4 h-4 text-pink-400" />
              Impacto Social Auditado en Campo:
            </h4>
            <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
              {proyecto.impacto_social}
            </p>
          </div>

          {/* Location & Cooperating partners */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div>
              <span className="text-xs font-semibold text-slate-400 flex items-center gap-1.5 mb-1.5">
                <MapPin className="w-4 h-4 text-[#38BDF8]" />
                Ubicación de Operaciones:
              </span>
              <p className="text-xs text-slate-200 font-mono bg-white/[0.04] p-2.5 rounded-xl border border-white/10">
                {proyecto.ubicacion}
              </p>
            </div>

            <div>
              <span className="text-xs font-semibold text-slate-400 flex items-center gap-1.5 mb-1.5">
                <Globe2 className="w-4 h-4 text-[#38BDF8]" />
                Cooperantes y Donantes Clave:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {proyecto.cooperantes_clave.map((coop, i) => (
                  <span key={i} className="text-xs px-2.5 py-1 rounded-lg bg-white/[0.04] border border-white/10 text-slate-300">
                    {coop}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Modal Action Footer */}
        <div className="pt-4 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3">
          <span className="text-xs text-slate-400">
            Ficha técnica validada por el Comité de Auditoría Concurrente SIAH.
          </span>
          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto justify-end">
            {canEdit && onEditProject && (
              <button
                type="button"
                onClick={() => {
                  onEditProject(proyecto);
                }}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-white/[0.08] hover:bg-[#38BDF8] text-[#38BDF8] hover:text-[#000033] text-xs font-bold border border-[#38BDF8]/40 hover:border-[#38BDF8] transition-all flex items-center justify-center gap-1.5 shadow-[0_0_15px_rgba(56,189,248,0.2)]"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Editar Toda la Información en CMS</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-white/[0.05] hover:bg-white/10 text-slate-300 text-xs font-semibold border border-white/10 transition-all"
            >
              Cerrar Ficha
            </button>
            <button
              onClick={() => {
                onRequestQuote(proyecto);
                onClose();
              }}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#38BDF8] hover:bg-sky-300 text-[#000033] text-xs font-bold shadow-[0_0_20px_rgba(56,189,248,0.4)] border border-sky-200/50 transition-all"
            >
              Solicitar Auditoría de este Proyecto
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
