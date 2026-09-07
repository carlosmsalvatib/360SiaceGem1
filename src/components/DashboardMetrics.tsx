import React, { useState, useEffect } from 'react';
import { 
  Users, 
  BarChart3, 
  TrendingUp, 
  Clock, 
  ShieldCheck, 
  Layers, 
  Activity, 
  Eye, 
  Globe, 
  Server,
  RefreshCw,
  Zap,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { MetricasDashboard } from '../types';

interface DashboardMetricsProps {
  metricas: MetricasDashboard;
}

export const DashboardMetrics: React.FC<DashboardMetricsProps> = ({ metricas }) => {
  const [timeRange, setTimeRange] = useState<'24h' | '7d' | '30d'>('7d');
  const [liveVisitors, setLiveVisitors] = useState(metricas.visitantes_hoy);
  const [selectedModule, setSelectedModule] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Simulated live visitor heartbeats
  useEffect(() => {
    const interval = setInterval(() => {
      setLiveVisitors(prev => prev + Math.floor(Math.random() * 3) - 1);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  const handleManualRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setLiveVisitors(prev => prev + Math.floor(Math.random() * 5) + 1);
      setIsRefreshing(false);
    }, 600);
  };

  const getMultiplier = () => {
    if (timeRange === '24h') return 0.2;
    if (timeRange === '30d') return 3.8;
    return 1;
  };

  const multiplier = getMultiplier();

  return (
    <section id="dashboard" className="py-16 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div className="accent-border-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.05] border border-[#38BDF8]/40 text-xs font-semibold text-[#38BDF8] font-mono mb-2 shadow-[0_0_15px_rgba(56,189,248,0.2)]">
              <Activity className="w-3.5 h-3.5 text-[#38BDF8] animate-pulse" />
              <span>TELEMETRÍA EN TIEMPO REAL • PORTAL SIAH</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Dashboard de Métricas & Tráfico por Módulos
            </h2>
            <p className="text-sm text-slate-300 mt-1">
              Monitoreo analítico del uso de la plataforma, consultas fiduciarias y consultas técnicas sectoriales.
            </p>
          </div>

          {/* Time range selector & refresh */}
          <div className="flex items-center gap-2 self-start md:self-auto">
            <div className="bg-white/[0.05] p-1 rounded-xl border border-white/10 flex items-center text-xs font-medium backdrop-blur-md">
              <button
                onClick={() => setTimeRange('24h')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  timeRange === '24h' 
                    ? 'bg-[#38BDF8] text-[#000033] font-bold shadow-[0_0_10px_rgba(56,189,248,0.5)]' 
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                24 Horas
              </button>
              <button
                onClick={() => setTimeRange('7d')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  timeRange === '7d' 
                    ? 'bg-[#38BDF8] text-[#000033] font-bold shadow-[0_0_10px_rgba(56,189,248,0.5)]' 
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                7 Días
              </button>
              <button
                onClick={() => setTimeRange('30d')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  timeRange === '30d' 
                    ? 'bg-[#38BDF8] text-[#000033] font-bold shadow-[0_0_10px_rgba(56,189,248,0.5)]' 
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                30 Días
              </button>
            </div>

            <button
              onClick={handleManualRefresh}
              title="Actualizar telemetría"
              className="p-2 rounded-xl bg-white/[0.05] border border-white/10 text-slate-300 hover:text-[#38BDF8] transition-all hover:bg-white/[0.1]"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-[#38BDF8]' : ''}`} />
            </button>
          </div>
        </div>

        {/* Top 4 KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          
          {/* Card 1: Visitantes Únicos */}
          <div className="glass-panel rounded-2xl p-5 border border-white/10 shadow-lg relative overflow-hidden group hover:border-[#38BDF8]/40 transition-all">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-[#38BDF8] uppercase tracking-wider">
                Visitantes Únicos
              </span>
              <div className="p-2 rounded-xl bg-[#38BDF8]/15 text-[#38BDF8] border border-[#38BDF8]/30 shadow-[0_0_10px_rgba(56,189,248,0.2)]">
                <Users className="w-5 h-5" />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-extrabold text-white font-mono">
                {Math.round(liveVisitors * multiplier).toLocaleString()}
              </span>
              <span className="text-xs font-semibold text-emerald-400 flex items-center gap-0.5">
                <TrendingUp className="w-3 h-3" />
                +14.2%
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
              <span>{Math.floor(liveVisitors / 42)} sesiones activas en este instante</span>
            </p>
          </div>

          {/* Card 2: Fondos Fiduciarios Auditados */}
          <div className="glass-panel rounded-2xl p-5 border border-white/10 shadow-lg relative overflow-hidden group hover:border-[#38BDF8]/40 transition-all">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-[#38BDF8] uppercase tracking-wider">
                Fondos Auditados
              </span>
              <div className="p-2 rounded-xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                <ShieldCheck className="w-5 h-5" />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-extrabold text-white font-mono">
                ${(metricas.fondos_auditados_usd / 1000000).toFixed(2)}M
              </span>
              <span className="text-xs font-bold text-emerald-400">USD</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              0 glosas u objeciones ante ECHO y USAID
            </p>
          </div>

          {/* Card 3: Disponibilidad SLA */}
          <div className="glass-panel rounded-2xl p-5 border border-white/10 shadow-lg relative overflow-hidden group hover:border-[#38BDF8]/40 transition-all">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-[#38BDF8] uppercase tracking-wider">
                Disponibilidad SLA
              </span>
              <div className="p-2 rounded-xl bg-[#38BDF8]/15 text-[#38BDF8] border border-[#38BDF8]/30">
                <Server className="w-5 h-5" />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-extrabold text-white font-mono">
                {metricas.disponibilidad_sla}%
              </span>
              <span className="text-xs font-semibold text-[#38BDF8] font-mono">Uptime</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Certificado SSL forzado & MariaDB con réplica
            </p>
          </div>

          {/* Card 4: Beneficiarios & Impacto */}
          <div className="glass-panel rounded-2xl p-5 border border-white/10 shadow-lg relative overflow-hidden group hover:border-[#38BDF8]/40 transition-all">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-[#38BDF8] uppercase tracking-wider">
                Beneficiarios Registrados
              </span>
              <div className="p-2 rounded-xl bg-purple-500/15 text-purple-400 border border-purple-500/30">
                <Zap className="w-5 h-5" />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-extrabold text-white font-mono">
                {(metricas.beneficiarios_totales / 1000).toFixed(1)}k
              </span>
              <span className="text-xs font-semibold text-purple-400">Impacto</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Distribuidos en los 6 proyectos estratégicos
            </p>
          </div>

        </div>

        {/* Detailed Analytics Grid: Modules Breakdown + 7-Day Chart */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left Column: Tráfico por Módulos (Áreas Clave) */}
          <div className="lg:col-span-5 glass-panel rounded-2xl p-6 border border-white/10 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-[#38BDF8]" />
                  Métricas de Visitantes por Módulo
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Distribución de interés en las 4 áreas clave SIAH
                </p>
              </div>
              <span className="text-xs font-mono text-[#38BDF8] bg-[#002366]/60 px-2.5 py-1 rounded-lg border border-[#38BDF8]/30">
                {metricas.visitas_totales_mes.toLocaleString()} visitas
              </span>
            </div>

            <div className="space-y-4">
              {metricas.trafico_por_modulo.map((mod) => {
                const isSelected = selectedModule === mod.modulo;
                const dynamicVisits = Math.round(mod.visitas * multiplier);

                return (
                  <div 
                    key={mod.modulo}
                    onClick={() => setSelectedModule(isSelected ? null : mod.modulo)}
                    className={`p-3 rounded-xl border transition-all cursor-pointer ${
                      isSelected 
                        ? 'bg-[#002366]/70 border-[#38BDF8] shadow-[0_0_15px_rgba(56,189,248,0.25)]' 
                        : 'bg-white/[0.03] border-white/10 hover:bg-white/[0.06] hover:border-[#38BDF8]/40'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <span className="font-semibold text-white flex items-center gap-2">
                        <span 
                          className="w-2.5 h-2.5 rounded-full" 
                          style={{ backgroundColor: mod.color }} 
                        />
                        {mod.modulo}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-slate-300">{dynamicVisits.toLocaleString()} visitas</span>
                        <span className="font-bold font-mono text-[#38BDF8]">({mod.porcentaje}%)</span>
                      </div>
                    </div>

                    {/* Progress Track */}
                    <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
                      <div 
                        className="h-full rounded-full transition-all duration-700"
                        style={{ 
                          width: `${mod.porcentaje}%`,
                          backgroundColor: mod.color
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-5 pt-4 border-t border-white/10 flex items-center justify-between text-xs text-slate-400">
              <span className="flex items-center gap-1.5">
                <Eye className="w-3.5 h-3.5 text-[#38BDF8]" />
                Tiempo promedio en portal: <strong className="text-white font-mono">{metricas.tiempo_promedio_min} min</strong>
              </span>
              <span>Tasa de rebote: <strong className="text-white font-mono">{metricas.tasa_rebote}%</strong></span>
            </div>
          </div>

          {/* Right Column: Tendencia Temporal & Bitácora de Telemetría */}
          <div className="lg:col-span-7 glass-panel rounded-2xl p-6 border border-white/10 shadow-xl flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-[#38BDF8]" />
                    Tendencia de Consultas (Últimos 7 Días)
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Volumen de accesos a expedientes de proyectos y auditorías
                  </p>
                </div>
                <div className="flex items-center gap-4 text-xs font-mono">
                  <span className="flex items-center gap-1.5 text-blue-400">
                    <span className="w-2.5 h-2.5 bg-blue-500 rounded-sm" /> Visitas
                  </span>
                  <span className="flex items-center gap-1.5 text-[#38BDF8]">
                    <span className="w-2.5 h-2.5 bg-[#38BDF8] rounded-sm" /> Únicos
                  </span>
                </div>
              </div>

              {/* Bar Chart Visualization */}
              <div className="h-44 flex items-end justify-between gap-2 sm:gap-4 pt-4 pb-2 px-2 border-b border-white/10">
                {metricas.visitas_ultimos_7_dias.map((item, idx) => {
                  const maxVal = 9000;
                  const barHeight = Math.round((item.visitas / maxVal) * 100);
                  const uniqueHeight = Math.round((item.usuarios_unicos / maxVal) * 100);

                  return (
                    <div key={idx} className="flex-1 flex flex-col items-center gap-1 group">
                      <div className="w-full flex items-end justify-center gap-1 h-32">
                        {/* Bar Visitas */}
                        <div 
                          className="w-1/2 bg-gradient-to-t from-blue-700 to-blue-500 rounded-t-md transition-all duration-500 group-hover:from-blue-600 group-hover:to-blue-400 relative"
                          style={{ height: `${barHeight}%` }}
                        >
                          <div className="opacity-0 group-hover:opacity-100 absolute -top-7 left-1/2 -translate-x-1/2 bg-[#000033] text-white text-[10px] font-mono py-0.5 px-1.5 rounded border border-[#38BDF8] pointer-events-none transition-opacity z-10 whitespace-nowrap shadow-lg">
                            {item.visitas}
                          </div>
                        </div>

                        {/* Bar Únicos */}
                        <div 
                          className="w-1/2 bg-gradient-to-t from-sky-600 to-[#38BDF8] rounded-t-md transition-all duration-500 group-hover:from-sky-500 group-hover:to-[#38BDF8] relative shadow-[0_0_10px_rgba(56,189,248,0.2)]"
                          style={{ height: `${uniqueHeight}%` }}
                        >
                          <div className="opacity-0 group-hover:opacity-100 absolute -top-7 left-1/2 -translate-x-1/2 bg-[#000033] text-[#38BDF8] text-[10px] font-mono py-0.5 px-1.5 rounded border border-[#38BDF8] pointer-events-none transition-opacity z-10 whitespace-nowrap shadow-lg">
                            {item.usuarios_unicos}
                          </div>
                        </div>
                      </div>

                      <span className="text-[11px] font-mono text-slate-400 group-hover:text-white transition-colors">
                        {item.dia}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Live Telemetry Activity Log */}
            <div className="mt-4 pt-3">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-2">
                Bitácora de Telemetría Reciente (Auditable):
              </span>
              <div className="space-y-2">
                {metricas.actividad_reciente.slice(0, 3).map((act) => (
                  <div 
                    key={act.id} 
                    className="flex items-center justify-between text-xs p-2.5 rounded-xl bg-white/[0.03] border border-white/10"
                  >
                    <div className="flex items-center gap-2 truncate">
                      {act.tipo === 'success' ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      ) : act.tipo === 'warning' ? (
                        <AlertCircle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      ) : (
                        <Clock className="w-3.5 h-3.5 text-[#38BDF8] shrink-0" />
                      )}
                      <span className="text-slate-300 truncate">{act.evento}</span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0 font-mono text-[11px] text-slate-400">
                      <span className="px-2 py-0.5 rounded bg-white/[0.06] text-[#38BDF8] border border-white/10">
                        {act.modulo}
                      </span>
                      <span>{act.hora}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
};
