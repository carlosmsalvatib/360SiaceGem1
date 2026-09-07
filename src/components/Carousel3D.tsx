import React, { useState, useEffect } from 'react';
import { Proyecto } from '../types';
import { 
  ChevronLeft, 
  ChevronRight, 
  Play, 
  Pause, 
  ExternalLink, 
  TrendingUp, 
  Users, 
  Sparkles,
  Wheat,
  Radio,
  Warehouse,
  HeartHandshake,
  Stethoscope,
  ScanFace,
  FolderKanban
} from 'lucide-react';

interface Carousel3DProps {
  proyectos: Proyecto[];
  onSelectProject: (proyecto: Proyecto) => void;
}

export const Carousel3D: React.FC<Carousel3DProps> = ({ proyectos, onSelectProject }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlay, setIsAutoPlay] = useState(true);
  const [isHovered, setIsHovered] = useState(false);

  const total = proyectos.length;
  // Angular step for a 6-sided cylindrical carousel
  const angleStep = 360 / total;

  useEffect(() => {
    if (!isAutoPlay || isHovered) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % total);
    }, 4500);
    return () => clearInterval(interval);
  }, [isAutoPlay, isHovered, total]);

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + total) % total);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % total);
  };

  const renderIcon = (iconName: string) => {
    switch (iconName) {
      case 'Wheat':
        return <Wheat className="w-5 h-5" />;
      case 'Radio':
        return <Radio className="w-5 h-5" />;
      case 'Warehouse':
        return <Warehouse className="w-5 h-5" />;
      case 'HeartHandshake':
        return <HeartHandshake className="w-5 h-5" />;
      case 'Stethoscope':
        return <Stethoscope className="w-5 h-5" />;
      case 'ScanFace':
        return <ScanFace className="w-5 h-5" />;
      default:
        return <FolderKanban className="w-5 h-5" />;
    }
  };

  const activeProject = proyectos[currentIndex] || proyectos[0];

  return (
    <div 
      id="carrusel-3d-container"
      className="relative w-full max-w-lg mx-auto flex flex-col items-center select-none"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* 3D Scene Wrapper */}
      <div className="relative w-full h-[380px] sm:h-[420px] flex items-center justify-center perspective-1000 overflow-visible">
        
        {/* Atmospheric Wheel Glow */}
        <div className="wheel-glow -z-10" />

        {/* Ambient Ring / Platform in the background */}
        <div 
          className="absolute w-[320px] h-[320px] rounded-full border border-sky-400/20 bg-sky-500/10 blur-xl -z-10 pointer-events-none"
          style={{ transform: 'rotateX(75deg) translateZ(-60px)' }}
        />

        {/* 3D Rotating Wheel / Cylinder */}
        <div 
          className="relative w-[280px] sm:w-[320px] h-[320px] sm:h-[350px] preserve-3d transition-transform duration-700 ease-out"
          style={{
            transform: `rotateY(${-currentIndex * angleStep}deg)`
          }}
        >
          {proyectos.map((proyecto, index) => {
            const angle = index * angleStep;
            // Radius distance for 6 items of width ~300px: r = (w/2) / tan(30deg) ~= 150 / 0.577 = 260px
            const radius = 260;
            const isCurrent = index === currentIndex;

            return (
              <div
                key={proyecto.id}
                id={`carousel-item-${proyecto.id}`}
                onClick={() => {
                  if (isCurrent) {
                    onSelectProject(proyecto);
                  } else {
                    setCurrentIndex(index);
                  }
                }}
                className={`absolute inset-0 rounded-2xl p-5 border cursor-pointer backface-hidden transition-all duration-500 flex flex-col justify-between overflow-hidden backdrop-blur-xl ${
                  isCurrent
                    ? 'border-[#38BDF8] bg-[#000033]/85 shadow-[0_0_25px_rgba(56,189,248,0.35)] scale-100 ring-2 ring-[#38BDF8]/40'
                    : 'border-white/10 bg-white/[0.04] opacity-40 hover:opacity-75 scale-95 shadow-xl'
                }`}
                style={{
                  transform: `rotateY(${angle}deg) translateZ(${radius}px)`
                }}
              >
                {/* Background image subtle preview with gradient overlay */}
                <div 
                  className="absolute inset-0 bg-cover bg-center -z-10 opacity-20 filter blur-[1px]"
                  style={{ backgroundImage: `url(${proyecto.imagen_url})` }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#000033] via-[#000033]/80 to-transparent -z-10" />

                {/* Card Header */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span 
                      className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border"
                      style={{ 
                        borderColor: `${proyecto.color_accent}50`, 
                        backgroundColor: `${proyecto.color_accent}20`,
                        color: proyecto.color_accent 
                      }}
                    >
                      {renderIcon(proyecto.icono)}
                      {proyecto.codigo}
                    </span>
                    <span className="text-[11px] font-mono text-slate-400 bg-white/5 border border-white/10 px-2 py-0.5 rounded">
                      #{index + 1} de {total}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-white leading-snug line-clamp-1 group-hover:text-sky-300">
                    {proyecto.nombre}
                  </h3>
                  <p className="text-xs text-sky-300 font-medium line-clamp-1 mt-0.5">
                    {proyecto.subtitulo}
                  </p>
                  <p className="text-xs text-slate-300 line-clamp-3 mt-2 leading-relaxed">
                    {proyecto.descripcion_corta}
                  </p>
                </div>

                {/* Metrics Bar */}
                <div className="space-y-2 mt-2 pt-2 border-t border-white/10">
                  <div className="flex items-center justify-between text-xs text-slate-300">
                    <span className="flex items-center gap-1 text-slate-400">
                      <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                      Avance Físico
                    </span>
                    <span className="font-bold text-white">{proyecto.avance_porcentaje}%</span>
                  </div>
                  {/* Progress bar */}
                  <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-blue-500 to-[#38BDF8] rounded-full transition-all duration-700"
                      style={{ width: `${proyecto.avance_porcentaje}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                    <span className="flex items-center gap-1 truncate max-w-[150px]">
                      <Users className="w-3 h-3 text-sky-400 shrink-0" />
                      {proyecto.beneficiarios_directos.toLocaleString()} ben.
                    </span>
                    <span className="font-semibold text-emerald-400 font-mono">
                      ${(proyecto.inversion_estimada_usd / 1000).toFixed(0)}k USD
                    </span>
                  </div>
                </div>

                {/* Card Action Footer */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectProject(proyecto);
                  }}
                  className="w-full mt-3 py-2 px-3 bg-[#38BDF8] hover:bg-sky-300 text-[#000033] text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 transition-all shadow-[0_0_15px_rgba(56,189,248,0.35)]"
                >
                  <span>Explorar Proyecto</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Interactive Controls & Navigation */}
      <div className="w-full flex items-center justify-between mt-3 px-2">
        <div className="flex items-center gap-2">
          <button
            id="btn-carrusel-prev"
            onClick={handlePrev}
            aria-label="Proyecto anterior"
            className="p-2 rounded-xl bg-white/[0.05] hover:bg-[#38BDF8] text-slate-300 hover:text-[#000033] border border-white/10 transition-all shadow-md"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            id="btn-carrusel-next"
            onClick={handleNext}
            aria-label="Proyecto siguiente"
            className="p-2 rounded-xl bg-white/[0.05] hover:bg-[#38BDF8] text-slate-300 hover:text-[#000033] border border-white/10 transition-all shadow-md"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
          <button
            id="btn-carrusel-autoplay"
            onClick={() => setIsAutoPlay(!isAutoPlay)}
            title={isAutoPlay ? "Pausar rotación 3D" : "Iniciar rotación 3D"}
            className={`p-2 rounded-xl border text-xs flex items-center gap-1.5 transition-all ${
              isAutoPlay 
                ? 'bg-[#002366]/60 border-[#38BDF8]/40 text-[#38BDF8]' 
                : 'bg-white/[0.05] border-white/10 text-slate-400 hover:text-white'
            }`}
          >
            {isAutoPlay ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline font-mono text-[11px]">
              {isAutoPlay ? 'Auto-Giro 3D' : 'Pausado'}
            </span>
          </button>
        </div>

        {/* Carousel pagination indicators */}
        <div className="flex items-center gap-1.5">
          {proyectos.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              aria-label={`Ir al proyecto ${idx + 1}`}
              className={`h-2 rounded-full transition-all duration-300 ${
                idx === currentIndex 
                  ? 'w-6 bg-[#38BDF8] shadow-[0_0_10px_rgba(56,189,248,0.6)]' 
                  : 'w-2 bg-white/20 hover:bg-white/40'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Selected Project Quick Chip */}
      <div className="mt-3 flex items-center gap-2 text-xs text-slate-300 bg-white/[0.05] px-3.5 py-1.5 rounded-full border border-white/10 backdrop-blur-md">
        <Sparkles className="w-3.5 h-3.5 text-[#38BDF8] shrink-0" />
        <span className="text-slate-300 truncate">
          Proyecto Activo: <strong className="text-white">{activeProject.nombre}</strong>
        </span>
      </div>
    </div>
  );
};
