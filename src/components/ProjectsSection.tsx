import React, { useState } from 'react';
import { Proyecto, Usuario } from '../types';
import { 
  FolderKanban, 
  TrendingUp, 
  Users, 
  MapPin, 
  ExternalLink, 
  Sparkles,
  Search,
  CheckCircle2,
  Clock,
  Edit3,
  Plus
} from 'lucide-react';

interface ProjectsSectionProps {
  proyectos: Proyecto[];
  currentUser?: Usuario | null;
  onSelectProject: (proyecto: Proyecto) => void;
  onEditProject?: (proyecto: Proyecto) => void;
  onAddProject?: () => void;
}

export const ProjectsSection: React.FC<ProjectsSectionProps> = ({
  proyectos,
  currentUser,
  onSelectProject,
  onEditProject,
  onAddProject
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('ALL');

  // Can edit projects if user is SuperAdmin (1), Admin (2), Auditor (3), Editor (4)
  const canEdit = !!currentUser && currentUser.rol_id <= 4;

  const categories = ['ALL', ...Array.from(new Set(proyectos.map(p => p.categoria)))];

  const filteredProjects = proyectos.filter(p => {
    const matchesSearch = p.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          p.subtitulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          p.descripcion_corta.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'ALL' || p.categoria === filterCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <section id="proyectos" className="py-20 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.05] border border-[#38BDF8]/40 text-xs font-semibold text-[#38BDF8] font-mono mb-2 shadow-[0_0_15px_rgba(56,189,248,0.2)]">
              <FolderKanban className="w-3.5 h-3.5 text-[#38BDF8]" />
              <span>PORTAFOLIO ESTRATÉGICO SIAH • 6 PROYECTOS EMBLEMÁTICOS</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Proyectos Humanitarios & Operativos
            </h2>
            <p className="text-slate-300 text-sm sm:text-base mt-2 max-w-2xl">
              Iniciativas de alta complejidad gestionadas con rigor técnico, auditoría fiduciaria concurrente y verificación satelital y física en terreno.
            </p>
          </div>

          {/* Search & Category Filter */}
          <div className="flex flex-col sm:flex-row gap-2.5 w-full md:w-auto">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar proyecto..."
                className="w-full sm:w-56 pl-9 pr-3 py-2 rounded-xl bg-white/[0.05] border border-white/10 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-[#38BDF8] backdrop-blur-md"
              />
            </div>

            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-3 py-2 rounded-xl bg-white/[0.05] border border-white/10 text-xs text-slate-200 focus:outline-none focus:border-[#38BDF8] backdrop-blur-md"
            >
              {categories.map((c, i) => (
                <option key={i} value={c} className="bg-[#000033] text-white">
                  {c === 'ALL' ? 'Todas las Categorías' : c}
                </option>
              ))}
            </select>

            {canEdit && onAddProject && (
              <button
                type="button"
                onClick={onAddProject}
                className="px-3.5 py-2 rounded-xl bg-[#38BDF8] hover:bg-sky-300 text-[#000033] font-bold text-xs flex items-center justify-center gap-1.5 shadow-[0_0_15px_rgba(56,189,248,0.3)] transition-all shrink-0 hover:scale-[1.02]"
                title="Registrar nuevo proyecto en CMS para el Carrusel 3D"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Nuevo Proyecto</span>
              </button>
            )}
          </div>
        </div>

        {/* 6 Projects Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((proyecto) => (
            <div
              key={proyecto.id}
              id={`proyecto-grid-${proyecto.id}`}
              onClick={() => onSelectProject(proyecto)}
              className="glass-panel glass-panel-hover rounded-2xl border border-white/10 shadow-xl overflow-hidden cursor-pointer flex flex-col justify-between group transition-all hover:border-[#38BDF8]/40"
            >
              <div>
                {/* Project Image Header */}
                <div className="relative h-48 w-full overflow-hidden">
                  <img
                    src={proyecto.imagen_url}
                    alt={proyecto.nombre}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#000033] via-[#000033]/50 to-transparent" />
                  
                  {/* Category & Status badges */}
                  <div className="absolute top-3 left-3 flex items-center gap-2">
                    <span 
                      className="text-[11px] font-bold px-2.5 py-1 rounded-full backdrop-blur-md border font-mono shadow-sm"
                      style={{ 
                        backgroundColor: `${proyecto.color_accent}25`,
                        borderColor: `${proyecto.color_accent}60`,
                        color: proyecto.color_accent 
                      }}
                    >
                      {proyecto.codigo}
                    </span>
                  </div>

                  <div className="absolute top-3 right-3">
                    <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-emerald-950/80 text-emerald-400 border border-emerald-500/40 flex items-center gap-1 backdrop-blur-md">
                      <Clock className="w-3 h-3" />
                      {proyecto.estado.replace('_', ' ')}
                    </span>
                  </div>

                  {/* Title overlay */}
                  <div className="absolute bottom-3 left-3 right-3">
                    <h3 className="text-xl font-bold text-white group-hover:text-[#38BDF8] transition-colors">
                      {proyecto.nombre}
                    </h3>
                    <p className="text-xs text-sky-200 font-medium truncate">
                      {proyecto.subtitulo}
                    </p>
                  </div>
                </div>

                {/* Project Body */}
                <div className="p-5 space-y-3">
                  <div className="flex items-center gap-1.5 text-xs text-slate-400">
                    <MapPin className="w-3.5 h-3.5 text-[#38BDF8] shrink-0" />
                    <span className="truncate">{proyecto.ubicacion}</span>
                  </div>

                  <p className="text-xs text-slate-300 line-clamp-3 leading-relaxed">
                    {proyecto.descripcion_corta}
                  </p>

                  <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/10 text-xs">
                    <span className="font-semibold text-[#38BDF8] block mb-0.5">Impacto Social:</span>
                    <span className="text-slate-300 line-clamp-2">{proyecto.impacto_social}</span>
                  </div>

                  {/* Avance Físico Progress */}
                  <div className="space-y-1 pt-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-400 flex items-center gap-1">
                        <TrendingUp className="w-3 h-3 text-emerald-400" />
                        Ejecución Fiduciaria / Física
                      </span>
                      <span className="font-bold text-white font-mono">{proyecto.avance_porcentaje}%</span>
                    </div>
                    <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-blue-500 to-[#38BDF8] rounded-full shadow-[0_0_8px_rgba(56,189,248,0.5)]"
                        style={{ width: `${proyecto.avance_porcentaje}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Project Card Footer */}
              <div className="p-5 pt-0">
                <div className="pt-3 border-t border-white/10 flex items-center justify-between text-xs mb-3">
                  <span className="text-slate-400 flex items-center gap-1">
                    <Users className="w-3.5 h-3.5 text-[#38BDF8]" />
                    <strong>{proyecto.beneficiarios_directos.toLocaleString()}</strong> beneficiarios
                  </span>
                  <span className="font-mono font-bold text-emerald-400">
                    ${(proyecto.inversion_estimada_usd / 1000).toFixed(0)}k USD
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectProject(proyecto);
                    }}
                    className="flex-1 py-2.5 px-3 rounded-xl bg-white/[0.05] hover:bg-[#38BDF8] text-slate-200 hover:text-[#000033] hover:font-bold text-xs font-semibold flex items-center justify-center gap-1.5 transition-all border border-white/10 group-hover:border-[#38BDF8]/50"
                  >
                    <span>Ver Expediente</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>

                  {canEdit && onEditProject && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onEditProject(proyecto);
                      }}
                      className="py-2.5 px-3 rounded-xl bg-white/[0.08] hover:bg-[#38BDF8] text-[#38BDF8] hover:text-[#000033] border border-[#38BDF8]/40 hover:border-[#38BDF8] text-xs font-bold flex items-center gap-1 transition-all shadow-[0_0_12px_rgba(56,189,248,0.2)] shrink-0 hover:scale-[1.02]"
                      title="Editar toda la información del proyecto en CMS (Carrusel y Ficha)"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Editar</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
