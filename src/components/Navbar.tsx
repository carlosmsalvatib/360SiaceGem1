import React, { useState, useRef, useEffect } from 'react';
import { 
  ShieldCheck, 
  ChevronDown, 
  Menu, 
  X, 
  LogIn, 
  User, 
  Database, 
  BarChart3, 
  LogOut,
  Sparkles,
  BadgeDollarSign,
  Scale,
  HardHat,
  Network
} from 'lucide-react';
import { Usuario } from '../types';

interface NavbarProps {
  currentUser: Usuario | null;
  onOpenLogin: () => void;
  onLogout: () => void;
  onOpenCMS: () => void;
  onOpenArchitecture: () => void;
  onSelectArea: (areaId: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  onOpenLogin,
  onLogout,
  onOpenCMS,
  onOpenArchitecture,
  onSelectArea
}) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isServicesOpen, setIsServicesOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsServicesOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const serviceAreas = [
    {
      id: 'finanzas-auditoria',
      number: '1',
      title: 'Finanzas y Auditoría',
      desc: 'Auditoría concurrente, rendición fiduciaria y contabilidad.',
      icon: BadgeDollarSign,
      color: 'text-blue-400'
    },
    {
      id: 'legal-rrhh',
      number: '2',
      title: 'Legal y RRHH',
      desc: 'Cumplimiento laboral, gobernanza y contratos marco.',
      icon: Scale,
      color: 'text-purple-400'
    },
    {
      id: 'ingenieria-proyectos',
      number: '3',
      title: 'Ingeniería y Proyectos',
      desc: 'Supervisión técnica de obras, cálculo y PMO.',
      icon: HardHat,
      color: 'text-emerald-400'
    },
    {
      id: 'it-telematica',
      number: '4',
      title: 'IT y Telemática',
      desc: 'Conectividad satelital, cifrado y seguridad de datos.',
      icon: Network,
      color: 'text-cyan-400'
    }
  ];

  return (
    <header 
      id="main-navbar-header"
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled 
          ? 'bg-[#000033]/85 backdrop-blur-xl border-b border-white/10 shadow-[0_4px_30px_rgba(0,0,51,0.6)] py-2.5' 
          : 'bg-gradient-to-b from-[#000033]/95 via-[#000033]/70 to-transparent py-4'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        
        {/* Brand Logo & SIAH Badge */}
        <a 
          href="#inicio" 
          id="navbar-brand-logo"
          className="flex items-center gap-3 group"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#002366] to-[#000033] flex items-center justify-center shadow-[0_0_15px_rgba(56,189,248,0.3)] border border-[#38BDF8]/40 group-hover:scale-105 transition-transform">
            <ShieldCheck className="w-6 h-6 text-[#38BDF8]" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="text-xl font-extrabold tracking-tight text-white group-hover:text-[#38BDF8] transition-colors font-mono">
                360 SIACE
              </span>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#38BDF8]/15 text-[#38BDF8] border border-[#38BDF8]/30">
                SIAH
              </span>
            </div>
            <span className="text-[10px] tracking-widest uppercase text-slate-400 font-medium">
              Back-Office Humanitario
            </span>
          </div>
        </a>

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center gap-1 xl:gap-2 text-sm font-medium text-slate-300">
          <a 
            href="#inicio" 
            className="px-3 py-2 rounded-lg hover:text-[#38BDF8] hover:bg-white/[0.06] transition-all"
          >
            Inicio
          </a>

          <a 
            href="#dashboard" 
            className="px-3 py-2 rounded-lg hover:text-[#38BDF8] hover:bg-white/[0.06] flex items-center gap-1.5 transition-all text-[#38BDF8]"
          >
            <BarChart3 className="w-4 h-4 text-[#38BDF8]" />
            <span>Dashboard</span>
          </a>

          <a 
            href="#quienes-somos" 
            className="px-3 py-2 rounded-lg hover:text-[#38BDF8] hover:bg-white/[0.06] transition-all"
          >
            Quiénes Somos
          </a>

          {/* Servicios Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              id="btn-dropdown-servicios"
              onClick={() => setIsServicesOpen(!isServicesOpen)}
              onMouseEnter={() => setIsServicesOpen(true)}
              className="px-3 py-2 rounded-lg hover:text-[#38BDF8] hover:bg-white/[0.06] flex items-center gap-1 transition-all"
              aria-expanded={isServicesOpen}
            >
              <span>Servicios</span>
              <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isServicesOpen ? 'rotate-180 text-[#38BDF8]' : ''}`} />
            </button>

            {/* Dropdown Menu */}
            {isServicesOpen && (
              <div 
                onMouseLeave={() => setIsServicesOpen(false)}
                className="absolute top-full left-0 mt-2 w-80 sm:w-96 rounded-2xl bg-[#000033]/95 border border-white/10 shadow-[0_20px_40px_rgba(0,0,51,0.9)] p-3 z-50 backdrop-blur-2xl animate-in fade-in zoom-in-95 duration-150"
              >
                <div className="px-3 py-2 border-b border-white/10 mb-2 flex items-center justify-between">
                  <span className="text-xs font-semibold text-[#38BDF8] uppercase tracking-wider">
                    Áreas Clave SIAH
                  </span>
                  <span className="text-[11px] text-slate-400 font-mono">
                    10 Servicios One-Stop
                  </span>
                </div>

                <div className="space-y-1">
                  {serviceAreas.map((area) => {
                    const Icon = area.icon;
                    return (
                      <a
                        key={area.id}
                        href="#servicios"
                        onClick={() => {
                          onSelectArea(area.id);
                          setIsServicesOpen(false);
                        }}
                        className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-[#38BDF8]/10 transition-all group"
                      >
                        <div className="p-2 rounded-lg bg-white/[0.05] border border-white/10 group-hover:border-[#38BDF8]/50 mt-0.5">
                          <Icon className={`w-4 h-4 ${area.color}`} />
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-white group-hover:text-[#38BDF8] flex items-center gap-1.5">
                            <span>{area.number}. {area.title}</span>
                          </div>
                          <p className="text-xs text-slate-400 leading-snug mt-0.5">
                            {area.desc}
                          </p>
                        </div>
                      </a>
                    );
                  })}
                </div>

                <div className="mt-2 pt-2 border-t border-white/10">
                  <a
                    href="#servicios"
                    onClick={() => setIsServicesOpen(false)}
                    className="block text-center py-2 px-3 text-xs font-semibold text-[#38BDF8] hover:text-white bg-[#002366]/40 hover:bg-[#002366]/70 rounded-lg transition-all"
                  >
                    Ver los 10 Servicios Especializados →
                  </a>
                </div>
              </div>
            )}
          </div>

          <a 
            href="#proyectos" 
            className="px-3 py-2 rounded-lg hover:text-[#38BDF8] hover:bg-white/[0.06] transition-all"
          >
            Proyectos
          </a>

          <a 
            href="#por-que-elegirnos" 
            className="px-3 py-2 rounded-lg hover:text-[#38BDF8] hover:bg-white/[0.06] transition-all"
          >
            ¿Por qué elegirnos?
          </a>

          <a 
            href="#contacto" 
            className="px-3 py-2 rounded-lg hover:text-[#38BDF8] hover:bg-white/[0.06] transition-all"
          >
            Contacto
          </a>
        </nav>

        {/* Right CTA Actions */}
        <div className="hidden sm:flex items-center gap-2.5">
          
          {/* Cloud Database indicator */}
          <div 
            className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-emerald-500/10 border border-emerald-500/25 text-[11px] font-mono text-emerald-300 shadow-sm"
            title="Base de datos en la nube conectada: Sincronización en tiempo real vía Firebase Firestore"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>Firestore Cloud</span>
          </div>

          {/* Architecture / MariaDB SQL button */}
          <button
            id="btn-nav-architecture"
            onClick={onOpenArchitecture}
            className="px-3 py-1.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] text-slate-300 hover:text-[#38BDF8] border border-white/10 text-xs font-medium flex items-center gap-1.5 transition-all shadow-sm"
            title="Ver Esquema MariaDB, Árbol de Carpetas y Despliegue"
          >
            <Database className="w-3.5 h-3.5 text-[#38BDF8]" />
            <span className="hidden xl:inline">Arquitectura & SQL</span>
            <span className="xl:hidden">SQL</span>
          </button>

          {/* User Auth or Access Button */}
          {currentUser ? (
            <div className="relative">
              <button
                id="btn-nav-user-menu"
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center gap-2 py-1 px-2.5 rounded-xl bg-[#002366]/60 border border-[#38BDF8]/40 hover:border-[#38BDF8] text-xs font-semibold text-white transition-all shadow-sm"
              >
                <div className="w-6 h-6 rounded-full bg-[#002366] text-[#38BDF8] border border-[#38BDF8]/40 flex items-center justify-center text-[10px] font-bold">
                  {currentUser.nombre.charAt(0)}
                </div>
                <span className="max-w-[110px] truncate">{currentUser.nombre.split(' ')[0]}</span>
                <ChevronDown className="w-3.5 h-3.5 text-sky-300" />
              </button>

              {isUserMenuOpen && (
                <div className="absolute right-0 mt-2 w-56 rounded-xl bg-[#000033]/95 border border-white/10 shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95 backdrop-blur-xl">
                  <div className="px-3 py-2 border-b border-white/10">
                    <p className="text-xs font-bold text-white truncate">{currentUser.nombre}</p>
                    <p className="text-[11px] text-[#38BDF8] font-mono">{currentUser.rol_nombre}</p>
                  </div>
                  <div className="space-y-1 mt-1.5">
                    <button
                      onClick={() => {
                        onOpenCMS();
                        setIsUserMenuOpen(false);
                      }}
                      className="w-full text-left px-3 py-2 text-xs text-slate-200 hover:bg-[#38BDF8]/15 rounded-lg flex items-center gap-2"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                      <span>Panel CMS & Back-Office</span>
                    </button>
                    <button
                      onClick={() => {
                        onLogout();
                        setIsUserMenuOpen(false);
                      }}
                      className="w-full text-left px-3 py-2 text-xs text-rose-300 hover:bg-rose-500/20 rounded-lg flex items-center gap-2"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Cerrar Sesión</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <button
              id="btn-nav-login"
              onClick={onOpenLogin}
              className="px-5 py-2 rounded-full bg-[#38BDF8] hover:bg-sky-300 text-[#000033] text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-[0_0_15px_rgba(56,189,248,0.4)] transition-all border border-sky-200/50 hover:scale-[1.02]"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Acceder</span>
            </button>
          )}
        </div>

        {/* Mobile Menu Hamburger */}
        <div className="flex items-center gap-2 lg:hidden">
          <button
            id="btn-nav-mobile-toggle"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 rounded-xl bg-white/[0.05] text-slate-300 border border-white/10 hover:text-white"
            aria-label="Abrir menú"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden bg-[#000033]/98 border-b border-white/10 px-4 pt-3 pb-6 space-y-3 backdrop-blur-2xl">
          <nav className="flex flex-col space-y-1 text-sm">
            <a 
              href="#inicio" 
              onClick={() => setIsMobileMenuOpen(false)}
              className="px-3 py-2 rounded-lg text-slate-200 hover:bg-white/[0.06] font-medium"
            >
              Inicio
            </a>
            <a 
              href="#dashboard" 
              onClick={() => setIsMobileMenuOpen(false)}
              className="px-3 py-2 rounded-lg text-[#38BDF8] hover:bg-white/[0.06] font-medium flex items-center gap-2"
            >
              <BarChart3 className="w-4 h-4 text-[#38BDF8]" />
              <span>Dashboard de Métricas</span>
            </a>
            <a 
              href="#quienes-somos" 
              onClick={() => setIsMobileMenuOpen(false)}
              className="px-3 py-2 rounded-lg text-slate-200 hover:bg-blue-600/20 font-medium"
            >
              Quiénes Somos
            </a>

            <div className="px-3 py-1.5 text-xs font-bold text-blue-300 uppercase tracking-wider">
              Áreas de Servicios:
            </div>
            {serviceAreas.map(area => (
              <a 
                key={area.id}
                href="#servicios" 
                onClick={() => {
                  onSelectArea(area.id);
                  setIsMobileMenuOpen(false);
                }}
                className="px-4 py-1.5 text-xs text-slate-300 hover:text-white hover:bg-blue-600/20 rounded-md"
              >
                {area.number}. {area.title}
              </a>
            ))}

            <a 
              href="#proyectos" 
              onClick={() => setIsMobileMenuOpen(false)}
              className="px-3 py-2 rounded-lg text-slate-200 hover:bg-blue-600/20 font-medium"
            >
              Proyectos (Carrusel 3D)
            </a>
            <a 
              href="#por-que-elegirnos" 
              onClick={() => setIsMobileMenuOpen(false)}
              className="px-3 py-2 rounded-lg text-slate-200 hover:bg-blue-600/20 font-medium"
            >
              ¿Por qué elegirnos?
            </a>
            <a 
              href="#contacto" 
              onClick={() => setIsMobileMenuOpen(false)}
              className="px-3 py-2 rounded-lg text-slate-200 hover:bg-blue-600/20 font-medium"
            >
              Contacto
            </a>
          </nav>

          <div className="pt-3 border-t border-blue-500/20 flex flex-col gap-2">
            <button
              onClick={() => {
                onOpenArchitecture();
                setIsMobileMenuOpen(false);
              }}
              className="w-full py-2 px-3 rounded-xl bg-slate-900 border border-blue-500/30 text-xs font-semibold text-cyan-300 flex items-center justify-center gap-2"
            >
              <Database className="w-4 h-4" />
              <span>Ver Esquema SQL MariaDB & Arquitectura</span>
            </button>

            {currentUser ? (
              <button
                onClick={() => {
                  onOpenCMS();
                  setIsMobileMenuOpen(false);
                }}
                className="w-full py-2.5 px-3 rounded-xl bg-blue-600 text-white text-xs font-bold flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                <span>Abrir Panel CMS ({currentUser.rol_nombre})</span>
              </button>
            ) : (
              <button
                onClick={() => {
                  onOpenLogin();
                  setIsMobileMenuOpen(false);
                }}
                className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-lg shadow-blue-600/30"
              >
                <LogIn className="w-4 h-4" />
                <span>Acceder al Sistema SIAH</span>
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
