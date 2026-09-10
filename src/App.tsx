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
import { EditProfesionalModal } from './components/EditProfesionalModal';
import { EditProjectModal } from './components/EditProjectModal';
import { 
  seedFirestoreIfEmpty,
  subscribeToConfig,
  subscribeToProyectos,
  subscribeToServicios,
  subscribeToProfesionales,
  subscribeToUsuarios,
  saveConfigToFirestore,
  saveProyectosToFirestore,
  saveSingleProyectoToFirestore,
  saveServiciosToFirestore,
  saveProfesionalesToFirestore,
  saveSingleProfesionalToFirestore,
  saveUsuariosToFirestore
} from './services/firebaseSync';
import { testFirestoreConnection } from './lib/firebase';

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
  const [cmsInitialTab, setCmsInitialTab] = useState<string | undefined>(undefined);
  const [isArchitectureOpen, setIsArchitectureOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Proyecto | null>(null);
  const [selectedAreaId, setSelectedAreaId] = useState<string | null>(null);

  // Direct edit profesional state (from Quiénes Somos section)
  const [directEditProfesional, setDirectEditProfesional] = useState<Profesional | null>(null);
  const [isDirectAddProfesional, setIsDirectAddProfesional] = useState(false);

  // Direct edit project state (from Carrusel 3D, Ficha modal, or Projects section)
  const [directEditProject, setDirectEditProject] = useState<Proyecto | null>(null);
  const [isDirectAddProject, setIsDirectAddProject] = useState(false);
  const [isCloudConnected, setIsCloudConnected] = useState(false);

  // Real-time Cloud Database synchronization via Firebase Firestore
  useEffect(() => {
    // 1. Test connection and auto-seed Firestore with default dataset if brand new database
    testFirestoreConnection().then(connected => {
      if (connected) setIsCloudConnected(true);
    });
    seedFirestoreIfEmpty().then(() => {
      setIsCloudConnected(true);
    }).catch(console.error);

    // 2. Real-time subscriptions for immediate multi-device synchronization
    const unsubConfig = subscribeToConfig((cloudConfig) => {
      if (cloudConfig) {
        setConfig(cloudConfig);
        localStorage.setItem('360siace_config_cms', JSON.stringify(cloudConfig));
      }
    });

    const unsubProyectos = subscribeToProyectos((cloudProyectos) => {
      if (cloudProyectos && cloudProyectos.length > 0) {
        setProyectos(cloudProyectos);
        localStorage.setItem('360siace_proyectos', JSON.stringify(cloudProyectos));
      }
    });

    const unsubServicios = subscribeToServicios((cloudServicios) => {
      if (cloudServicios && cloudServicios.length > 0) {
        setServicios(cloudServicios);
        localStorage.setItem('360siace_servicios', JSON.stringify(cloudServicios));
      }
    });

    const unsubProfesionales = subscribeToProfesionales((cloudProfesionales) => {
      if (cloudProfesionales && cloudProfesionales.length > 0) {
        setProfesionales(cloudProfesionales);
        localStorage.setItem('360siace_profesionales', JSON.stringify(cloudProfesionales));
      }
    });

    const unsubUsuarios = subscribeToUsuarios((cloudUsuarios) => {
      if (cloudUsuarios && cloudUsuarios.length > 0) {
        setUsuarios(cloudUsuarios);
        localStorage.setItem('360siace_usuarios', JSON.stringify(cloudUsuarios));
        if (currentUser) {
          const updatedSelf = cloudUsuarios.find(u => u.id === currentUser.id);
          if (updatedSelf) {
            setCurrentUser(updatedSelf);
            localStorage.setItem('360siace_current_user', JSON.stringify(updatedSelf));
          }
        }
      }
    });

    return () => {
      unsubConfig();
      unsubProyectos();
      unsubServicios();
      unsubProfesionales();
      unsubUsuarios();
    };
  }, []);

  // Persistence handlers: Sync with localStorage and write to Firebase Firestore
  const handleUpdateConfig = (newConfig: ConfigCMS) => {
    setConfig(newConfig);
    localStorage.setItem('360siace_config_cms', JSON.stringify(newConfig));
    saveConfigToFirestore(newConfig).catch(console.error);
  };

  const handleUpdateProyectos = (newProyectos: Proyecto[]) => {
    setProyectos(newProyectos);
    localStorage.setItem('360siace_proyectos', JSON.stringify(newProyectos));
    saveProyectosToFirestore(newProyectos).catch(console.error);
  };

  const handleUpdateServicios = (newServicios: ServicioEspecializado[]) => {
    setServicios(newServicios);
    localStorage.setItem('360siace_servicios', JSON.stringify(newServicios));
    saveServiciosToFirestore(newServicios).catch(console.error);
  };

  const handleUpdateProfesionales = (newProfesionales: Profesional[]) => {
    setProfesionales(newProfesionales);
    localStorage.setItem('360siace_profesionales', JSON.stringify(newProfesionales));
    saveProfesionalesToFirestore(newProfesionales).catch(console.error);
  };

  // Direct save handler for EditProfesionalModal from TeamSection
  const handleSaveDirectProfesional = (savedProf: Profesional) => {
    const exists = profesionales.some(p => p.id === savedProf.id);
    let updatedList: Profesional[];
    if (exists) {
      updatedList = profesionales.map(p => p.id === savedProf.id ? savedProf : p);
    } else {
      updatedList = [...profesionales, savedProf];
    }
    handleUpdateProfesionales(updatedList);
    saveSingleProfesionalToFirestore(savedProf).catch(console.error);
  };

  // Direct save handler for EditProjectModal (from Carousel 3D, Ficha modal, or Projects section)
  const handleSaveDirectProject = (savedProj: Proyecto) => {
    const exists = proyectos.some(p => p.id === savedProj.id);
    let updatedList: Proyecto[];
    if (exists) {
      updatedList = proyectos.map(p => p.id === savedProj.id ? savedProj : p);
      if (selectedProject && selectedProject.id === savedProj.id) {
        setSelectedProject(savedProj);
      }
    } else {
      updatedList = [...proyectos, savedProj];
    }
    handleUpdateProyectos(updatedList);
    saveSingleProyectoToFirestore(savedProj).catch(console.error);
    setDirectEditProject(null);
    setIsDirectAddProject(false);
  };

  const handleUpdateUsuarios = (newUsuarios: Usuario[]) => {
    setUsuarios(newUsuarios);
    localStorage.setItem('360siace_usuarios', JSON.stringify(newUsuarios));
    saveUsuariosToFirestore(newUsuarios).catch(console.error);
    if (currentUser) {
      const updatedSelf = newUsuarios.find(u => u.id === currentUser.id);
      if (updatedSelf) {
        setCurrentUser(updatedSelf);
        localStorage.setItem('360siace_current_user', JSON.stringify(updatedSelf));
      }
    }
  };

  const handleSwitchUser = (user: Usuario) => {
    setCurrentUser(user);
    localStorage.setItem('360siace_current_user', JSON.stringify(user));
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
          currentUser={currentUser}
          onSelectProject={(proj) => setSelectedProject(proj)}
          onEditProject={(proj) => setDirectEditProject(proj)}
          onAddProject={() => setIsDirectAddProject(true)}
        />

        {/* 5. Quiénes Somos & Gestión de Profesionales */}
        <TeamSection
          profesionales={profesionales}
          currentUser={currentUser}
          onEditProfesional={(prof) => setDirectEditProfesional(prof)}
          onAddProfesional={() => setIsDirectAddProfesional(true)}
          onOpenCmsTeam={() => {
            setCmsInitialTab('profesionales');
            setIsCmsOpen(true);
          }}
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
        currentUser={currentUser}
        onClose={() => setSelectedProject(null)}
        onRequestQuote={() => {
          setSelectedProject(null);
          const elem = document.getElementById('contacto');
          if (elem) elem.scrollIntoView({ behavior: 'smooth' });
        }}
        onEditProject={(proj) => {
          setDirectEditProject(proj);
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
          onClose={() => {
            setIsCmsOpen(false);
            setCmsInitialTab(undefined);
          }}
          initialTab={cmsInitialTab}
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
          onSwitchUser={handleSwitchUser}
        />
      )}

      {/* DIRECT MODAL: Edit Profesional from Quiénes Somos Section (Levels 1, 2, 3) */}
      {currentUser && (
        <EditProfesionalModal
          isOpen={isDirectAddProfesional || !!directEditProfesional}
          onClose={() => {
            setDirectEditProfesional(null);
            setIsDirectAddProfesional(false);
          }}
          profesionalToEdit={directEditProfesional}
          isNew={isDirectAddProfesional}
          currentUser={currentUser}
          onSaveProfesional={handleSaveDirectProfesional}
        />
      )}

      {/* DIRECT MODAL: Edit Project from Carousel / Ficha Modal / Projects Section */}
      {currentUser && (
        <EditProjectModal
          isOpen={isDirectAddProject || !!directEditProject}
          onClose={() => {
            setDirectEditProject(null);
            setIsDirectAddProject(false);
          }}
          projectToEdit={directEditProject}
          isNew={isDirectAddProject}
          currentUser={currentUser}
          onSaveProject={handleSaveDirectProject}
        />
      )}

    </div>
  );
}
