import React, { useState } from 'react';
import { 
  AreaClave, 
  ServicioEspecializado 
} from '../types';
import { 
  BadgeDollarSign, 
  Scale, 
  HardHat, 
  Network, 
  FolderKanban, 
  Calculator, 
  FileCheck2, 
  Gavel, 
  ShieldAlert, 
  UserCheck, 
  GraduationCap, 
  Building2, 
  Sprout, 
  Truck,
  CheckCircle2,
  Filter,
  Sparkles,
  ArrowRight
} from 'lucide-react';

interface ServicesSectionProps {
  areas: AreaClave[];
  servicios: ServicioEspecializado[];
  selectedAreaId: string | null;
  onSelectArea: (areaId: string | null) => void;
  onRequestService: (servicio: ServicioEspecializado) => void;
}

export const ServicesSection: React.FC<ServicesSectionProps> = ({
  areas,
  servicios,
  selectedAreaId,
  onSelectArea,
  onRequestService
}) => {
  const [activeServiceModal, setActiveServiceModal] = useState<ServicioEspecializado | null>(null);

  const getAreaIcon = (iconName: string) => {
    switch (iconName) {
      case 'BadgeDollarSign':
        return <BadgeDollarSign className="w-5 h-5 text-[#38BDF8]" />;
      case 'Scale':
        return <Scale className="w-5 h-5 text-[#38BDF8]" />;
      case 'HardHat':
        return <HardHat className="w-5 h-5 text-[#38BDF8]" />;
      case 'Network':
        return <Network className="w-5 h-5 text-[#38BDF8]" />;
      default:
        return <Sparkles className="w-5 h-5 text-[#38BDF8]" />;
    }
  };

  const getServiceIcon = (iconName: string) => {
    switch (iconName) {
      case 'FolderKanban': return <FolderKanban className="w-5 h-5 text-[#38BDF8]" />;
      case 'Calculator': return <Calculator className="w-5 h-5 text-[#38BDF8]" />;
      case 'FileCheck2': return <FileCheck2 className="w-5 h-5 text-[#38BDF8]" />;
      case 'Gavel': return <Gavel className="w-5 h-5 text-[#38BDF8]" />;
      case 'ShieldAlert': return <ShieldAlert className="w-5 h-5 text-[#38BDF8]" />;
      case 'UserCheck': return <UserCheck className="w-5 h-5 text-[#38BDF8]" />;
      case 'GraduationCap': return <GraduationCap className="w-5 h-5 text-amber-400" />;
      case 'Building2': return <Building2 className="w-5 h-5 text-emerald-400" />;
      case 'Sprout': return <Sprout className="w-5 h-5 text-emerald-400" />;
      case 'Truck': return <Truck className="w-5 h-5 text-amber-400" />;
      default: return <Sparkles className="w-5 h-5 text-[#38BDF8]" />;
    }
  };

  const filteredServices = selectedAreaId 
    ? servicios.filter(s => s.area_id === selectedAreaId)
    : servicios;

  return (
    <section id="servicios" className="py-20 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/[0.05] border border-[#38BDF8]/40 text-xs font-semibold text-[#38BDF8] font-mono mb-3 shadow-[0_0_15px_rgba(56,189,248,0.2)]">
            <Sparkles className="w-3.5 h-3.5 text-[#38BDF8]" />
            <span>MODELO INTEGRAL ONE-STOP-SHOP • 10 SERVICIOS ESPECIALIZADOS</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Servicios Troncales & Áreas de Intervención
          </h2>
          <p className="text-slate-300 text-sm sm:text-base mt-3 leading-relaxed">
            Eliminamos la fragmentación entre consultoras aisladas. SIAH integra las 4 áreas neurálgicas de soporte operativo para maximizar la ejecución y blindar legal y financieramente a las organizaciones.
          </p>
        </div>

        {/* 4 Key Pillars / Áreas Clave */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-12">
          {areas.map((area) => {
            const isSelected = selectedAreaId === area.id;
            return (
              <div
                key={area.id}
                id={`area-clave-${area.id}`}
                onClick={() => onSelectArea(isSelected ? null : area.id)}
                className={`rounded-2xl p-6 border transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between ${
                  isSelected
                    ? 'bg-[#002366]/70 border-[#38BDF8] shadow-[0_0_25px_rgba(56,189,248,0.3)] ring-1 ring-[#38BDF8]'
                    : 'glass-panel border-white/10 hover:border-[#38BDF8]/40'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 rounded-xl bg-white/[0.05] border border-white/10 shadow-sm">
                      {getAreaIcon(area.icono)}
                    </div>
                    <span className="text-xs font-mono font-bold text-slate-300 bg-white/[0.06] border border-white/10 px-2 py-0.5 rounded">
                      Pilar 0{area.numero}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-white leading-snug mb-1">
                    {area.nombre}
                  </h3>
                  <p className="text-xs text-[#38BDF8] font-medium mb-3">
                    {area.subtitulo}
                  </p>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {area.descripcion}
                  </p>
                </div>

                <div className="mt-5 pt-3 border-t border-white/10 flex items-center justify-between">
                  <span className="text-[11px] font-mono text-emerald-400 truncate max-w-[180px]">
                    {area.metricas_destacadas}
                  </span>
                  <span className="text-xs font-bold text-[#38BDF8] hover:text-sky-300">
                    {isSelected ? 'Ver todos' : 'Filtrar →'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Filter Bar for 10 Services */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-8 p-3.5 rounded-2xl bg-white/[0.04] border border-white/10 backdrop-blur-md">
          <div className="flex items-center gap-2 text-xs text-slate-300">
            <Filter className="w-4 h-4 text-[#38BDF8]" />
            <span>Mostrando:</span>
            <span className="font-bold text-white">
              {selectedAreaId 
                ? areas.find(a => a.id === selectedAreaId)?.nombre 
                : 'Los 10 Servicios Especializados (Todos)'}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            <button
              onClick={() => onSelectArea(null)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                selectedAreaId === null 
                  ? 'bg-[#38BDF8] text-[#000033] font-bold shadow-[0_0_12px_rgba(56,189,248,0.4)]' 
                  : 'text-slate-300 hover:text-white hover:bg-white/[0.08]'
              }`}
            >
              Todos (10)
            </button>
            {areas.map(a => (
              <button
                key={a.id}
                onClick={() => onSelectArea(a.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  selectedAreaId === a.id 
                    ? 'bg-[#38BDF8] text-[#000033] font-bold shadow-[0_0_12px_rgba(56,189,248,0.4)]' 
                    : 'text-slate-300 hover:text-white hover:bg-white/[0.08]'
                }`}
              >
                {a.nombre.split(' ')[0]}
              </button>
            ))}
          </div>
        </div>

        {/* 10 Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredServices.map((servicio) => (
            <div
              key={servicio.id}
              id={`servicio-card-${servicio.id}`}
              className="glass-panel glass-panel-hover rounded-2xl p-6 border border-white/10 shadow-lg flex flex-col justify-between transition-all group hover:border-[#38BDF8]/40"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="p-2.5 rounded-xl bg-white/[0.05] border border-white/10 group-hover:border-[#38BDF8]/50 transition-colors">
                    {getServiceIcon(servicio.icono)}
                  </div>
                  <span className="text-xs font-mono font-bold text-[#38BDF8] bg-[#002366]/70 px-2.5 py-0.5 rounded-lg border border-[#38BDF8]/30">
                    Servicio {servicio.numero}
                  </span>
                </div>

                <h3 className="text-lg font-bold text-white group-hover:text-sky-200 transition-colors leading-snug mb-2">
                  {servicio.titulo}
                </h3>
                
                <p className="text-xs text-slate-300 leading-relaxed mb-4">
                  {servicio.descripcion}
                </p>

                {/* Key Deliverables */}
                <div className="space-y-1.5 mb-4">
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                    Entregables Auditables:
                  </span>
                  {servicio.entregables.map((entregable, idx) => (
                    <div key={idx} className="flex items-start gap-1.5 text-xs text-slate-300">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#38BDF8] shrink-0 mt-0.5" />
                      <span>{entregable}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <div className="pt-3 border-t border-white/10 mb-3 flex items-center justify-between text-[11px]">
                  <span className="text-slate-400">Referencia:</span>
                  <span className="font-mono text-[#38BDF8] truncate max-w-[170px]">
                    {servicio.normativas_referencia}
                  </span>
                </div>

                <button
                  onClick={() => onRequestService(servicio)}
                  className="w-full py-2.5 px-3 rounded-xl bg-white/[0.05] hover:bg-[#38BDF8] text-slate-200 hover:text-[#000033] hover:font-bold text-xs font-semibold flex items-center justify-center gap-1.5 transition-all border border-white/10 shadow-sm group-hover:border-[#38BDF8]/50"
                >
                  <span>Solicitar Asesoría Técnica</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
