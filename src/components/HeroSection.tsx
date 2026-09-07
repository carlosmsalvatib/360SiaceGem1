import React from 'react';
import { 
  ShieldCheck, 
  ArrowRight, 
  Layers, 
  BarChart3, 
  CheckCircle2, 
  Activity,
  Globe2,
  Sparkles
} from 'lucide-react';
import { ConfigCMS, Proyecto } from '../types';
import { Carousel3D } from './Carousel3D';

interface HeroSectionProps {
  config: ConfigCMS;
  proyectos: Proyecto[];
  onSelectProject: (proyecto: Proyecto) => void;
  onOpenDiagnosis: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  config,
  proyectos,
  onSelectProject,
  onOpenDiagnosis
}) => {
  return (
    <section 
      id="inicio"
      className="relative pt-28 pb-16 md:pt-36 md:pb-24 overflow-hidden"
    >
      {/* Atmospheric Top Ambient Glow */}
      <div className="ambient-light-top" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* Left Column: Value Proposition & Copywriting */}
          <div className="lg:col-span-6 xl:col-span-7 space-y-6">
            
            {/* Tagline Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/[0.05] border border-[#38BDF8]/40 backdrop-blur-md shadow-[0_0_15px_rgba(56,189,248,0.2)]">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#38BDF8] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#38BDF8]"></span>
              </span>
              <span className="text-xs font-bold text-[#38BDF8] tracking-wider uppercase font-mono">
                {config.hero_tagline}
              </span>
            </div>

            {/* Main Headline */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-5xl font-extrabold text-white tracking-tight leading-[1.15]">
              {config.hero_titulo}
            </h1>

            {/* Subtitle / Value statement */}
            <p className="text-base sm:text-lg text-sky-200/90 font-medium leading-snug">
              {config.hero_subtitulo}
            </p>

            {/* Support Paragraph */}
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-2xl">
              {config.hero_parrafo_apoyo}
            </p>

            {/* Bullet Highlights */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2">
              <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-200">
                <CheckCircle2 className="w-4 h-4 text-[#38BDF8] shrink-0" />
                <span>Auditoría concurrente en tiempo real</span>
              </div>
              <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-200">
                <CheckCircle2 className="w-4 h-4 text-[#38BDF8] shrink-0" />
                <span>Rendición certificada ECHO / USAID / ONU</span>
              </div>
              <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-200">
                <CheckCircle2 className="w-4 h-4 text-[#38BDF8] shrink-0" />
                <span>Supervisión de obras civiles y telemática</span>
              </div>
              <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-200">
                <CheckCircle2 className="w-4 h-4 text-[#38BDF8] shrink-0" />
                <span>Despliegue integral One-Stop-Shop</span>
              </div>
            </div>

            {/* CTAs Action Buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-4">
              <a
                href="#contacto"
                onClick={onOpenDiagnosis}
                id="btn-hero-contacto"
                className="px-6 py-3.5 rounded-xl bg-[#38BDF8] hover:bg-sky-300 text-[#000033] font-bold text-sm flex items-center gap-2 shadow-[0_0_20px_rgba(56,189,248,0.4)] border border-sky-200/50 transition-all hover:scale-[1.02]"
              >
                <span>Solicitar Diagnóstico Fiduciario</span>
                <ArrowRight className="w-4 h-4" />
              </a>

              <a
                href="#servicios"
                id="btn-hero-servicios"
                className="px-5 py-3.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-slate-200 hover:text-white font-semibold text-sm flex items-center gap-2 border border-white/10 transition-all shadow-md backdrop-blur-md"
              >
                <Layers className="w-4 h-4 text-[#38BDF8]" />
                <span>10 Servicios SIAH</span>
              </a>

              <a
                href="#dashboard"
                id="btn-hero-metricas"
                className="px-4 py-3.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-[#38BDF8] hover:text-white font-semibold text-sm flex items-center gap-2 border border-[#38BDF8]/30 transition-all backdrop-blur-md"
              >
                <BarChart3 className="w-4 h-4 text-[#38BDF8]" />
                <span>Métricas en Vivo</span>
              </a>
            </div>

            {/* Multilateral Compliance Bar */}
            <div className="pt-6 border-t border-white/10">
              <span className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold block mb-2.5">
                Normativas Fiduciarias y Estándares de Rendición:
              </span>
              <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-slate-300">
                <span className="px-2.5 py-1 rounded-lg bg-white/[0.05] border border-white/10 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#38BDF8]" />
                  ECHO (Unión Europea)
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-white/[0.05] border border-white/10 flex items-center gap-1.5">
                  <Globe2 className="w-3.5 h-3.5 text-[#38BDF8]" />
                  USAID BHA / 2 CFR 200
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-white/[0.05] border border-white/10 flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-emerald-400" />
                  Naciones Unidas (ONU)
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-white/[0.05] border border-white/10 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  Norma Humanitaria CHS
                </span>
              </div>
            </div>

          </div>

          {/* Right Column: 3D Cube / Wheel Carousel */}
          <div className="lg:col-span-6 xl:col-span-5 flex flex-col items-center">
            <div className="w-full text-center lg:text-left mb-3">
              <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-200 px-3.5 py-1.5 rounded-full bg-white/[0.05] border border-white/10 backdrop-blur-md shadow-md">
                <span className="w-2 h-2 rounded-full bg-[#38BDF8] animate-pulse" />
                <span>Portafolio Dinámico en 3D • 6 Proyectos Estratégicos</span>
              </div>
            </div>

            <Carousel3D
              proyectos={proyectos}
              onSelectProject={onSelectProject}
            />
          </div>

        </div>
      </div>
    </section>
  );
};
