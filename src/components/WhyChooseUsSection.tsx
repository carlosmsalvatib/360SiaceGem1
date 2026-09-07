import React, { useState } from 'react';
import { ConfigCMS } from '../types';
import { 
  ShieldCheck, 
  UsersRound, 
  Layers, 
  CheckCircle2, 
  Send, 
  Phone, 
  Mail, 
  MapPin, 
  Sparkles,
  ArrowRight
} from 'lucide-react';

interface WhyChooseUsSectionProps {
  config: ConfigCMS;
}

export const WhyChooseUsSection: React.FC<WhyChooseUsSectionProps> = ({ config }) => {
  const [formData, setFormData] = useState({
    nombre: '',
    organizacion: '',
    email: '',
    telefono: '',
    servicioInteres: 'Auditoría Concurrente y Rendición Fiduciaria',
    mensaje: ''
  });

  const [formSubmitted, setFormSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormSubmitted(true);
    setTimeout(() => {
      // simulate receipt
    }, 400);
  };

  const getPuntoIcon = (icono: string) => {
    switch (icono) {
      case 'ShieldCheck': return <ShieldCheck className="w-6 h-6 text-[#38BDF8]" />;
      case 'UsersRound': return <UsersRound className="w-6 h-6 text-[#38BDF8]" />;
      case 'Layers': return <Layers className="w-6 h-6 text-[#38BDF8]" />;
      default: return <Sparkles className="w-6 h-6 text-[#38BDF8]" />;
    }
  };

  return (
    <section id="por-que-elegirnos" className="py-20 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Why Choose Us Header */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/[0.05] border border-[#38BDF8]/40 text-xs font-semibold text-[#38BDF8] font-mono mb-3 shadow-[0_0_15px_rgba(56,189,248,0.2)]">
            <ShieldCheck className="w-3.5 h-3.5 text-[#38BDF8]" />
            <span>VENTAJA COMPETITIVA SIAH • ¿POR QUÉ ELEGIRNOS?</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            ¿Por qué elegir a 360 SIACE como su Back-Office?
          </h2>
          <p className="text-slate-300 text-sm sm:text-base mt-3 leading-relaxed">
            {config.por_que_elegirnos_intro}
          </p>
        </div>

        {/* 3 Key Pillars of Why Choose Us */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-20">
          {config.por_que_elegirnos_puntos.map((punto, idx) => (
            <div
              key={idx}
              className="glass-panel rounded-2xl p-7 border border-white/10 flex flex-col justify-between group hover:border-[#38BDF8]/40 transition-all shadow-xl"
            >
              <div>
                <div className="w-12 h-12 rounded-xl bg-white/[0.05] border border-white/10 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform shadow-sm">
                  {getPuntoIcon(punto.icono)}
                </div>
                <h3 className="text-lg font-bold text-white mb-3 group-hover:text-sky-200 transition-colors">
                  {punto.titulo}
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  {punto.descripcion}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-white/10 flex items-center gap-1 text-xs text-[#38BDF8] font-mono">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Garantía de elegibilidad 100%</span>
              </div>
            </div>
          ))}
        </div>

        {/* CTA & Contact Section */}
        <div id="contacto" className="rounded-3xl bg-[#000033]/85 border border-white/10 shadow-[0_8px_32px_0_rgba(0,0,51,0.6)] p-8 sm:p-12 relative overflow-hidden backdrop-blur-xl">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            
            {/* Left Contact Info */}
            <div className="lg:col-span-5 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.05] text-[#38BDF8] text-xs font-semibold border border-[#38BDF8]/40 font-mono shadow-[0_0_15px_rgba(56,189,248,0.2)]">
                <Sparkles className="w-3.5 h-3.5 text-[#38BDF8]" />
                <span>DIAGNÓSTICO TÉCNICO INMEDIATO</span>
              </div>

              <h3 className="text-2xl sm:text-3xl font-extrabold text-white leading-snug">
                {config.cta_titulo}
              </h3>

              <p className="text-sm text-slate-300 leading-relaxed">
                {config.cta_descripcion}
              </p>

              <div className="space-y-3 pt-2 text-xs sm:text-sm text-slate-300">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-white/[0.05] text-[#38BDF8] border border-white/10 shadow-sm">
                    <Phone className="w-4 h-4" />
                  </div>
                  <span>{config.cta_telefono}</span>
                </div>

                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-white/[0.05] text-[#38BDF8] border border-white/10 shadow-sm">
                    <Mail className="w-4 h-4" />
                  </div>
                  <span>{config.cta_email}</span>
                </div>

                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-white/[0.05] text-[#38BDF8] border border-white/10 shadow-sm">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <span>{config.cta_direccion}</span>
                </div>
              </div>

              <div className="pt-4 border-t border-white/10 text-xs text-slate-400">
                <span>Dominio Oficial Acreditado: <strong className="text-white font-mono">{config.dominio_oficial}</strong></span>
              </div>
            </div>

            {/* Right Interactive Form */}
            <div className="lg:col-span-7 bg-white/[0.03] rounded-2xl p-6 sm:p-8 border border-white/10 backdrop-blur-xl shadow-lg">
              {formSubmitted ? (
                <div className="text-center py-10 space-y-4">
                  <div className="w-14 h-14 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-emerald-400 flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h4 className="text-xl font-bold text-white">
                    ¡Solicitud de Diagnóstico Recibida!
                  </h4>
                  <p className="text-xs sm:text-sm text-slate-300 max-w-md mx-auto leading-relaxed">
                    Hemos registrado su solicitud en el sistema SIAH. Nuestro Director de Operaciones asignará al auditor especialista idóneo y le contactará en menos de 24 horas hábiles.
                  </p>
                  <button
                    onClick={() => setFormSubmitted(false)}
                    className="px-4 py-2 rounded-xl bg-white/[0.05] border border-white/10 text-xs font-semibold text-[#38BDF8] hover:text-white transition-all"
                  >
                    Enviar otra consulta
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-semibold text-slate-300 block mb-1">
                        Nombre y Cargo *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.nombre}
                        onChange={e => setFormData({ ...formData, nombre: e.target.value })}
                        placeholder="Ej. Lic. Ana Morales - Dir. País"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.05] border border-white/10 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-[#38BDF8] backdrop-blur-md"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-slate-300 block mb-1">
                        Organización / ONG / Cooperante *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.organizacion}
                        onChange={e => setFormData({ ...formData, organizacion: e.target.value })}
                        placeholder="Ej. Consorcio Humanitario Internacional"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.05] border border-white/10 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-[#38BDF8] backdrop-blur-md"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-semibold text-slate-300 block mb-1">
                        Correo Corporativo *
                      </label>
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={e => setFormData({ ...formData, email: e.target.value })}
                        placeholder="contacto@organizacion.org"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.05] border border-white/10 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-[#38BDF8] backdrop-blur-md"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-slate-300 block mb-1">
                        Teléfono / WhatsApp
                      </label>
                      <input
                        type="tel"
                        value={formData.telefono}
                        onChange={e => setFormData({ ...formData, telefono: e.target.value })}
                        placeholder="+1 / +58 ..."
                        className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.05] border border-white/10 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-[#38BDF8] backdrop-blur-md"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1">
                      Área o Servicio de Interés
                    </label>
                    <select
                      value={formData.servicioInteres}
                      onChange={e => setFormData({ ...formData, servicioInteres: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#000033] border border-white/10 text-xs text-white focus:outline-none focus:border-[#38BDF8]"
                    >
                      <option value="Auditoría Concurrente y Rendición Fiduciaria">1. Auditoría Concurrente y Rendición Fiduciaria (ECHO / USAID)</option>
                      <option value="Gestión Integral de Proyectos (PMO)">2. Gestión Integral de Proyectos (PMO)</option>
                      <option value="Finanzas y Contabilidad Multilateral">3. Finanzas y Contabilidad Multilateral</option>
                      <option value="Soporte Legal & Compliance Institucional">4. Soporte Legal & Compliance Institucional</option>
                      <option value="Tecnología, Cloud & Ciberseguridad">5. Tecnología, Cloud & Ciberseguridad</option>
                      <option value="Gestión de Talento Humano y Nómina">6. Gestión de Talento Humano y Nómina</option>
                      <option value="Formación y Capacitación Especializada">7. Formación y Capacitación Especializada</option>
                      <option value="Ingeniería Civil y Supervisión de Obra">8. Ingeniería Civil y Supervisión de Obra</option>
                      <option value="Producción Agropecuaria y Seguridad Alimentaria">9. Producción Agropecuaria y Seguridad Alimentaria</option>
                      <option value="Logística de Emergencia y Cadena de Suministro">10. Logística de Emergencia y Cadena de Suministro</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1">
                      Descripción del Desafío u Operación *
                    </label>
                    <textarea
                      rows={3}
                      required
                      value={formData.mensaje}
                      onChange={e => setFormData({ ...formData, mensaje: e.target.value })}
                      placeholder="Indique brevemente el alcance de sus proyectos, cooperantes involucrados o requerimientos de supervisión..."
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.05] border border-white/10 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-[#38BDF8] resize-none backdrop-blur-md"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 px-4 rounded-xl bg-[#38BDF8] hover:bg-sky-300 text-[#000033] font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(56,189,248,0.4)] border border-sky-200/50 transition-all hover:scale-[1.01]"
                  >
                    <Send className="w-4 h-4" />
                    <span>Enviar Solicitud al Comité de Operaciones SIAH</span>
                  </button>
                </form>
              )}
            </div>

          </div>

        </div>

      </div>
    </section>
  );
};
