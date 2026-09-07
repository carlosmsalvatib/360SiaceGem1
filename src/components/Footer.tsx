import React from 'react';
import { 
  ShieldCheck, 
  Lock, 
  Database, 
  Mail, 
  Phone, 
  MapPin, 
  ExternalLink,
  Heart,
  Globe2,
  CheckCircle2
} from 'lucide-react';
import { ConfigCMS } from '../types';

interface FooterProps {
  config: ConfigCMS;
  onOpenArchitecture: () => void;
  onSelectArea: (areaId: string) => void;
}

export const Footer: React.FC<FooterProps> = ({
  config,
  onOpenArchitecture,
  onSelectArea
}) => {
  return (
    <footer className="bg-[#000033]/90 backdrop-blur-xl border-t border-white/10 text-slate-400 text-xs pt-16 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 mb-12">
          
          {/* Col 1 & 2: Brand & Mission */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/[0.08] border border-[#38BDF8]/40 flex items-center justify-center text-[#38BDF8] shadow-[0_0_15px_rgba(56,189,248,0.2)]">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xl font-extrabold text-white font-mono tracking-tight">
                  360 SIACE
                </span>
                <span className="ml-2 text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/[0.05] text-[#38BDF8] border border-[#38BDF8]/30">
                  MODELO SIAH
                </span>
                <div className="text-[11px] text-slate-400 font-medium">
                  {config.modelo_operativo_nombre}
                </div>
              </div>
            </div>

            <p className="text-slate-300 text-xs leading-relaxed max-w-sm">
              Ecosistema de back-office especializado para organizaciones humanitarias, consorcios multilaterales y proyectos de alto impacto social. Alineamos la rigurosidad fiduciaria con la velocidad en terreno.
            </p>

            {/* SSL & Security Badge */}
            <div className="inline-flex items-center gap-2 p-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-slate-200">
              <Lock className="w-4 h-4 text-emerald-400" />
              <div className="text-[11px] leading-tight">
                <span className="font-bold text-white block">Certificado SSL & HTTPS Forzada</span>
                <span className="text-slate-400">Dominio www.360siace.com • Cifrado TLS 1.3</span>
              </div>
            </div>
          </div>

          {/* Col 3: Navegación Rápida */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider">
              Navegación
            </h4>
            <ul className="space-y-2">
              <li>
                <a href="#inicio" className="hover:text-[#38BDF8] transition-colors">
                  Inicio (Hero)
                </a>
              </li>
              <li>
                <a href="#dashboard" className="hover:text-[#38BDF8] transition-colors text-[#38BDF8] font-medium">
                  Dashboard de Telemetría
                </a>
              </li>
              <li>
                <a href="#quienes-somos" className="hover:text-[#38BDF8] transition-colors">
                  Quiénes Somos / Especialistas
                </a>
              </li>
              <li>
                <a href="#servicios" className="hover:text-[#38BDF8] transition-colors">
                  10 Servicios One-Stop
                </a>
              </li>
              <li>
                <a href="#proyectos" className="hover:text-[#38BDF8] transition-colors">
                  Portafolio 3D de Proyectos
                </a>
              </li>
              <li>
                <a href="#por-que-elegirnos" className="hover:text-[#38BDF8] transition-colors">
                  Ventajas ECHO / USAID / ONU
                </a>
              </li>
              <li>
                <a href="#contacto" className="hover:text-[#38BDF8] transition-colors">
                  Contacto y Diagnóstico
                </a>
              </li>
            </ul>
          </div>

          {/* Col 4: 4 Áreas Clave */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider">
              Áreas de Intervención
            </h4>
            <ul className="space-y-2">
              <li>
                <a 
                  href="#servicios" 
                  onClick={() => onSelectArea('finanzas-auditoria')}
                  className="hover:text-[#38BDF8] transition-colors block"
                >
                  1. Finanzas y Auditoría Concurrente
                </a>
              </li>
              <li>
                <a 
                  href="#servicios" 
                  onClick={() => onSelectArea('legal-rrhh')}
                  className="hover:text-[#38BDF8] transition-colors block"
                >
                  2. Legal y RRHH Internacional
                </a>
              </li>
              <li>
                <a 
                  href="#servicios" 
                  onClick={() => onSelectArea('ingenieria-proyectos')}
                  className="hover:text-[#38BDF8] transition-colors block"
                >
                  3. Ingeniería Civil y Gestión PMO
                </a>
              </li>
              <li>
                <a 
                  href="#servicios" 
                  onClick={() => onSelectArea('it-telematica')}
                  className="hover:text-[#38BDF8] transition-colors block"
                >
                  4. IT y Telemática Satelital
                </a>
              </li>
            </ul>

            <div className="pt-2">
              <button
                onClick={onOpenArchitecture}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.05] hover:bg-[#38BDF8] text-slate-200 hover:text-[#000033] border border-white/10 font-semibold transition-all shadow-sm"
              >
                <Database className="w-3.5 h-3.5 text-[#38BDF8]" />
                <span>Ver Esquema MariaDB</span>
              </button>
            </div>
          </div>

          {/* Col 5: Contacto Oficial */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider">
              Sede Central
            </h4>
            <div className="space-y-2.5 text-xs text-slate-300">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-[#38BDF8] shrink-0 mt-0.5" />
                <span>{config.cta_direccion}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-[#38BDF8] shrink-0" />
                <span>{config.cta_telefono}</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-[#38BDF8] shrink-0" />
                <span>{config.cta_email}</span>
              </div>
              <div className="flex items-center gap-2">
                <Globe2 className="w-4 h-4 text-[#38BDF8] shrink-0" />
                <span className="font-mono text-[#38BDF8]">{config.dominio_oficial}</span>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom copyright & technical specs */}
        <div className="pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <div>
            © {new Date().getFullYear()} 360 SIACE. Todos los derechos reservados. Modelo Operativo SIAH®.
          </div>
          <div className="flex items-center gap-4 text-[11px] font-mono">
            <span>MariaDB 10.11+ InnoDB</span>
            <span>•</span>
            <span>SSL TLS 1.3</span>
            <span>•</span>
            <span>Hosting www.360siace.com</span>
          </div>
        </div>

      </div>
    </footer>
  );
};
