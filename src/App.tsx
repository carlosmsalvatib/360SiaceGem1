import React, { useState, useEffect } from 'react';
import { 
  INITIAL_CONFIG_CMS, 
  INITIAL_PROJECTS, 
  INITIAL_AREAS_CLAVE, 
  INITIAL_SERVICIOS, 
  INITIAL_PROFESIONALES, 
  INITIAL_METRICAS,
  INITIAL_USERS,
  INITIAL_ROLES
} from './data/initialData';
import { 
  ConfigCMS, 
  Proyecto, 
  ServicioEspecializado, 
  Profesional, 
  Usuario, 
  Rol 
} from './types';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { DashboardMetrics } from './components/DashboardMetrics';
import { ServicesSection } from './components/ServicesSection';
import { ProjectsSection } from './components/ProjectsSection';
import { TeamSection } from './components/TeamSection';
import { WhyChooseUsSection } from './components/WhyChooseUsSection';
import { Footer } from './components/Footer';
import { ProjectDetailModal } from './components/ProjectDetailModal';
import { LoginModal } from './components/LoginModal';
import { ArchitectureModal } from './components/ArchitectureModal';
import { CmsBackofficeModal } from './components/CmsBackofficeModal';

export default function App() {
  // Config state with localStorage persistence
  const [config, setConfig] = useState<ConfigCMS>(() => {
    const saved = localStorage.getItem('360siace_config_cms');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* ignore */ }
    }
    return INITIAL_CONFIG_CMS;
  });

  // Projects state
  const [proyectos, setProyectos] = useState<Proyecto[]>(() => {
    const saved = localStorage.getItem('360siace_proyectos');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* ignore */ }
    }
    return INITIAL_PROJECTS;
  });

  // Services state
  const [servicios, setServicios] = useState<ServicioEspecializado[]>(() => {
    const saved = localStorage.getItem('360siace_servicios');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* ignore */ }
    }
    return INITIAL_SERVICIOS;
  });

  // Professionals state
  const [profesionales, setProfesionales] = useState<Profesional[]>(() => {
    const saved = localStorage.getItem('360siace_profesionales');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* ignore */ }
    }
    return INITIAL_PROFESIONALES;
  });

  // Users state
  const [usuarios, setUsuarios] = useState<Usuario[]>(() => {
    const saved = localStorage.getItem('360siace_usuarios');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* ignore */ }
    }
    return INITIAL_USERS;
  });

  // Current session user
  const [currentUser, setCurrentUser] = useState<Usuario | null>(() => {
    const saved = localStorage.getItem('360siace_current_user');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* ignore */ }
    }
    return null;
  });

  // Modals & Navigation state
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isCmsOpen, setIsCmsOpen] = useState(false);
  const [isArchitectureOpen, setIsArchitectureOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Proyecto | null>(null);
  const [selectedAreaId, setSelectedAreaId] = useState<string | null>(null);

  // Persistence handlers
  const handleUpdateConfig = (newConfig: ConfigCMS) => {
    setConfig(newConfig);
    localStorage.setItem('360siace_config_cms', JSON.stringify(newConfig));
  };

  const handleUpdateProyectos = (newProyectos: Proyecto[]) => {
    setProyectos(newProyectos);
    localStorage.setItem('360siace_proyectos', JSON.stringify(newProyectos));
  };

  const handleUpdateServicios = (newServicios: ServicioEspecializado[]) => {
    setServicios(newServicios);
    localStorage.setItem('360siace_servicios', JSON.stringify(newServicios));
  };

  const handleUpdateProfesionales = (newProfesionales: Profesional[]) => {
    setProfesionales(newProfesionales);
    localStorage.setItem('360siace_profesionales', JSON.stringify(newProfesionales));
  };

  const handleUpdateUsuarios = (newUsuarios: Usuario[]) => {
    setUsuarios(newUsuarios);
    localStorage.setItem('360siace_usuarios', JSON.stringify(newUsuarios));
  };

  const handleLoginSuccess = (user: Usuario) => {
    setCurrentUser(user);
    localStorage.setItem('360siace_current_user', JSON.stringify(user));
    setIsLoginOpen(false);
    setIsCmsOpen(true);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('360siace_current_user');
  };

  const handleSelectArea = (areaId: string | null) => {
    setSelectedAreaId(areaId);
    const elem = document.getElementById('servicios');
    if (elem) {
      elem.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen flex flex-col relative selection:bg-blue-600 selection:text-white">
      
      {/* Top Header Navigation */}
      <Navbar
        currentUser={currentUser}
        onOpenLogin={() => setIsLoginOpen(true)}
        onLogout={handleLogout}
        onOpenCMS={() => setIsCmsOpen(true)}
        onOpenArchitecture={() => setIsArchitectureOpen(true)}
        onSelectArea={handleSelectArea}
      />

      {/* Main Content Sections */}
      <main className="flex-1">
        
        {/* 1. Hero with Value Proposition and 3D Cube/Wheel Carousel */}
        <HeroSection
          config={config}
          proyectos={proyectos}
          onSelectProject={(proj) => setSelectedProject(proj)}
          onOpenDiagnosis={() => {
            const elem = document.getElementById('contacto');
            if (elem) elem.scrollIntoView({ behavior: 'smooth' });
          }}
        />

        {/* 2. Real-time Dashboard with Visitor Metrics per Module */}
        <DashboardMetrics
          metricas={INITIAL_METRICAS}
        />

        {/* 3. The 4 Key Areas & 10 Specialized Services (One-Stop-Shop) */}
        <ServicesSection
          areas={INITIAL_AREAS_CLAVE}
          servicios={servicios}
          selectedAreaId={selectedAreaId}
          onSelectArea={setSelectedAreaId}
          onRequestService={() => {
            const elem = document.getElementById('contacto');
            if (elem) elem.scrollIntoView({ behavior: 'smooth' });
          }}
        />

        {/* 4. Strategic Projects Section (Grid of 6 Projects) */}
        <ProjectsSection
          proyectos={proyectos}
          onSelectProject={(proj) => setSelectedProject(proj)}
        />

        {/* 5. Quiénes Somos & Gestión de Profesionales */}
        <TeamSection
          profesionales={profesionales}
        />

        {/* 6. ¿Por qué elegirnos? (ECHO, USAID, ONU) & Lead Contact Form */}
        <WhyChooseUsSection
          config={config}
        />

      </main>

      {/* Footer */}
      <Footer
        config={config}
        onOpenArchitecture={() => setIsArchitectureOpen(true)}
        onSelectArea={handleSelectArea}
      />

      {/* MODAL: Project Detail Landing View */}
      <ProjectDetailModal
        proyecto={selectedProject}
        onClose={() => setSelectedProject(null)}
        onRequestQuote={() => {
          setSelectedProject(null);
          const elem = document.getElementById('contacto');
          if (elem) elem.scrollIntoView({ behavior: 'smooth' });
        }}
      />

      {/* MODAL: Login & Authentication */}
      <LoginModal
        isOpen={isLoginOpen}
        onClose={() => setIsLoginOpen(false)}
        onLoginSuccess={handleLoginSuccess}
        availableUsers={usuarios}
      />

      {/* MODAL: Architecture & MariaDB SQL Script Viewer */}
      <ArchitectureModal
        isOpen={isArchitectureOpen}
        onClose={() => setIsArchitectureOpen(false)}
      />

      {/* MODAL: CMS Back-Office Management */}
      {currentUser && (
        <CmsBackofficeModal
          isOpen={isCmsOpen}
          onClose={() => setIsCmsOpen(false)}
          currentUser={currentUser}
          config={config}
          onUpdateConfig={handleUpdateConfig}
          proyectos={proyectos}
          onUpdateProyectos={handleUpdateProyectos}
          servicios={servicios}
          onUpdateServicios={handleUpdateServicios}
          profesionales={profesionales}
          onUpdateProfesionales={handleUpdateProfesionales}
          usuarios={usuarios}
          onUpdateUsuarios={handleUpdateUsuarios}
          roles={INITIAL_ROLES}
        />
      )}

    </div>
  );
}
