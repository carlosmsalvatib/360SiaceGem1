import React, { useState, useRef, useEffect } from 'react';
import { 
  X, 
  Upload, 
  Globe, 
  Image as ImageIcon, 
  Sparkles, 
  Camera, 
  Check, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw, 
  Layers, 
  HardDrive, 
  Database,
  FileImage,
  Info,
  Sliders,
  Award
} from 'lucide-react';
import { OrigenImagen } from '../types';

interface ImageSourceSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentImageUrl?: string;
  currentOrigin?: OrigenImagen;
  profileName?: string;
  title?: string;
  subtitle?: string;
  onSelectImage: (imageUrl: string, origin: OrigenImagen) => void;
}

// Preset Headshots by category for Banco SIAH
const BANCO_SIAH_PRESETS = [
  {
    id: 'siah-dir-1',
    categoria: 'Dirección & Gerencia',
    nombre: 'Director General / Arquitecto',
    url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
    descripcion: 'Perfil masculino formal para directores y gerentes de proyecto.'
  },
  {
    id: 'siah-dir-2',
    categoria: 'Dirección & Gerencia',
    nombre: 'Directora Operativa / Ejecutiva',
    url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80',
    descripcion: 'Perfil femenino ejecutivo para coordinadoras y directoras de área.'
  },
  {
    id: 'siah-aud-1',
    categoria: 'Auditoría & Finanzas',
    nombre: 'Auditor Fiduciario Concurrente',
    url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=400&q=80',
    descripcion: 'Perfil senior para auditores de fondos multilaterales y CPA.'
  },
  {
    id: 'siah-aud-2',
    categoria: 'Auditoría & Finanzas',
    nombre: 'Especialista en Control Contable',
    url: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=400&q=80',
    descripcion: 'Perfil técnico para contadoras públicas y revisoras de gasto.'
  },
  {
    id: 'siah-ing-1',
    categoria: 'Ingeniería & Obras',
    nombre: 'Ingeniero Civil Colegiado',
    url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
    descripcion: 'Perfil de campo para supervisores de obra y valuadores.'
  },
  {
    id: 'siah-ing-2',
    categoria: 'Ingeniería & Obras',
    nombre: 'Ingeniera Residente / BIM',
    url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    descripcion: 'Perfil especialista para proyectistas estructurales y modeladores.'
  },
  {
    id: 'siah-leg-1',
    categoria: 'Legal & Cumplimiento',
    nombre: 'Abogado Corporativo & Contratos',
    url: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=400&q=80',
    descripcion: 'Perfil consultor para asesores jurídicos y convenios internacionales.'
  },
  {
    id: 'siah-esp-1',
    categoria: 'Consultoría & Campo',
    nombre: 'Consultor Humanitario de Campo',
    url: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=400&q=80',
    descripcion: 'Perfil operativo para oficiales de enlace y evaluadores EDAN.'
  },
  {
    id: 'siah-prj-agro',
    categoria: 'Proyectos Humanitarios & Campo',
    nombre: 'Producción Agropecuaria Sustentable',
    url: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=800&q=80',
    descripcion: 'Fotografía de alta resolución para proyectos de seguridad alimentaria, cultivos y ganadería regenerativa.'
  },
  {
    id: 'siah-prj-telecom',
    categoria: 'Proyectos Humanitarios & Campo',
    nombre: 'Telemática Satelital & Redes Críticas',
    url: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&w=800&q=80',
    descripcion: 'Infraestructura de telecomunicaciones tácticas, antenas satelitales y enlaces de radioenlace humanitario.'
  },
  {
    id: 'siah-prj-logistica',
    categoria: 'Proyectos Humanitarios & Campo',
    nombre: 'Hubs Logísticos & Cadena de Frío',
    url: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=800&q=80',
    descripcion: 'Almacenes inteligentes, racks sismorresistentes y logística de suministros humanitarios.'
  },
  {
    id: 'siah-prj-proteccion',
    categoria: 'Proyectos Humanitarios & Campo',
    nombre: 'Protección Social & Ayuda Directa',
    url: 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&w=800&q=80',
    descripcion: 'Transferencias monetarias, canastas alimentarias y atención comunitaria a familias vulnerables.'
  },
  {
    id: 'siah-prj-salud',
    categoria: 'Proyectos Humanitarios & Campo',
    nombre: 'Salud Comunitaria & Clínicas Móviles',
    url: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=800&q=80',
    descripcion: 'Unidades sanitarias 4x4, triaje médico de emergencia y dotación farmacológica.'
  },
  {
    id: 'siah-prj-seguridad',
    categoria: 'Proyectos Humanitarios & Campo',
    nombre: 'Seguridad Integral & Control de Acceso',
    url: 'https://images.unsplash.com/photo-1557597774-9d273605dfa9?auto=format&fit=crop&w=800&q=80',
    descripcion: 'Sistemas de biometría ética, salvaguarda de recintos y blindaje físico-lógico.'
  },
  {
    id: 'siah-prj-wash',
    categoria: 'Proyectos Humanitarios & Campo',
    nombre: 'Agua Potable & Saneamiento WASH',
    url: 'https://images.unsplash.com/photo-1541888946425-d0fbb186c5f7?auto=format&fit=crop&w=800&q=80',
    descripcion: 'Plantas potabilizadoras solares, pozos profundos y distribución comunitaria de agua segura.'
  },
  {
    id: 'siah-prj-energia',
    categoria: 'Proyectos Humanitarios & Campo',
    nombre: 'Energía Solar Fotovoltaica Humanitaria',
    url: 'https://images.unsplash.com/photo-1509391365360-2e959784a276?auto=format&fit=crop&w=800&q=80',
    descripcion: 'Sistemas solares aislados para escuelas, centros de salud y comunidades remotas.'
  }
];

// Color palettes for corporate SVG initials generator
const COLOR_PALETTES = [
  {
    id: 'siah-classic',
    label: 'Azul SIAH & Cyan',
    bgStart: '#000033',
    bgEnd: '#0284C7',
    ring: '#38BDF8',
    text: '#FFFFFF'
  },
  {
    id: 'fiduciary-gold',
    label: 'Dorado Fiduciario',
    bgStart: '#1A180E',
    bgEnd: '#B45309',
    ring: '#FBBF24',
    text: '#FFFBEB'
  },
  {
    id: 'emerald-audit',
    label: 'Esmeralda Auditoría',
    bgStart: '#022C22',
    bgEnd: '#047857',
    ring: '#34D399',
    text: '#ECFDF5'
  },
  {
    id: 'executive-indigo',
    label: 'Índigo Ejecutivo',
    bgStart: '#1E1B4B',
    bgEnd: '#4338CA',
    ring: '#818CF8',
    text: '#EEF2FF'
  },
  {
    id: 'steel-corporate',
    label: 'Acero Platino',
    bgStart: '#0F172A',
    bgEnd: '#334155',
    ring: '#94A3B8',
    text: '#F8FAFC'
  }
];

// Helper to compress images on client side into high-quality, lightweight Base64
const compressImage = (file: File, maxWidth = 600, maxHeight = 600, quality = 0.85): Promise<string> => {
  return new Promise((resolve, reject) => {
    // If it's SVG, keep vector quality
    if (file.type === 'image/svg+xml') {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string);
      reader.onerror = (err) => reject(err);
      reader.readAsDataURL(file);
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let { width, height } = img;
        if (width > maxWidth || height > maxHeight) {
          if (width > height) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          } else {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(e.target?.result as string);
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(dataUrl);
      };
      img.onerror = () => resolve(e.target?.result as string);
      img.src = e.target?.result as string;
    };
    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(file);
  });
};

// Generate SVG initials data URI
const createInitialsSvg = (name: string, palette = COLOR_PALETTES[0]): string => {
  const clean = (name || '360 SIACE')
    .replace(/^(Ing\.|Dr\.|Dra\.|Lic\.|Abog\.|Arq\.)\s+/i, '')
    .trim();
  const parts = clean.split(/\s+/).filter(Boolean);
  let initials = 'SI';
  if (parts.length >= 2) {
    initials = (parts[0][0] + parts[1][0]).toUpperCase();
  } else if (parts.length === 1) {
    initials = parts[0].slice(0, 2).toUpperCase();
  }

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200">
    <defs>
      <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="${palette.bgStart}" />
        <stop offset="100%" stop-color="${palette.bgEnd}" />
      </linearGradient>
    </defs>
    <rect width="200" height="200" rx="36" fill="url(#grad)" />
    <circle cx="100" cy="100" r="82" fill="none" stroke="${palette.ring}" stroke-width="4" stroke-opacity="0.8" stroke-dasharray="8 4" />
    <text x="100" y="118" font-family="system-ui, -apple-system, sans-serif" font-size="68" font-weight="800" fill="${palette.text}" text-anchor="middle" letter-spacing="1">
      ${initials}
    </text>
  </svg>`;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
};

export const ImageSourceSelectorModal: React.FC<ImageSourceSelectorModalProps> = ({
  isOpen,
  onClose,
  currentImageUrl = '',
  currentOrigin = 'URL_EXTERNA',
  profileName = 'Usuario',
  title = 'Seleccionar Origen de la Imagen de Perfil',
  subtitle = 'Configurar origen de fotografía y persistir en la Base de Datos MariaDB',
  onSelectImage
}) => {
  const [activeTab, setActiveTab] = useState<OrigenImagen>(currentOrigin || 'ARCHIVO_LOCAL');
  const [selectedUrl, setSelectedUrl] = useState<string>(currentImageUrl);
  const [selectedOrigin, setSelectedOrigin] = useState<OrigenImagen>(currentOrigin || 'ARCHIVO_LOCAL');

  // File Upload state
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [fileDetails, setFileDetails] = useState<{ name: string; size: string; type: string } | null>(null);
  const [isProcessingFile, setIsProcessingFile] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  // External URL state
  const [urlInput, setUrlInput] = useState(currentImageUrl.startsWith('http') ? currentImageUrl : '');
  const [urlTestStatus, setUrlTestStatus] = useState<'idle' | 'valid' | 'invalid'>('idle');

  // Banco SIAH state
  const [selectedPresetId, setSelectedPresetId] = useState<string | null>(null);
  const [bancoCategoryFilter, setBancoCategoryFilter] = useState<string>('Todos');

  // Initials generator state
  const [initialsName, setInitialsName] = useState<string>(profileName);
  const [selectedPalette, setSelectedPalette] = useState(COLOR_PALETTES[0]);

  // Camera state
  const videoRef = useRef<HTMLVideoElement>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    if (isOpen) {
      setSelectedUrl(currentImageUrl);
      setSelectedOrigin(currentOrigin || 'ARCHIVO_LOCAL');
      setActiveTab(currentOrigin || 'ARCHIVO_LOCAL');
      setInitialsName(profileName || 'Usuario');
      if (currentImageUrl.startsWith('http')) {
        setUrlInput(currentImageUrl);
      }
    } else {
      stopCamera();
    }
  }, [isOpen, currentImageUrl, currentOrigin, profileName]);

  // Stop camera stream cleanly
  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
    setCameraError(null);
  };

  // Switch tab and handle camera cleanup
  const handleTabChange = (tab: OrigenImagen) => {
    if (activeTab === 'CAMARA_DIRECTA' && tab !== 'CAMARA_DIRECTA') {
      stopCamera();
    }
    setActiveTab(tab);
  };

  // Start webcam
  const startCamera = async () => {
    stopCamera();
    setCameraError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 640 }, height: { ideal: 640 }, facingMode: 'user' },
        audio: false
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setCameraActive(true);
    } catch (err: any) {
      console.warn('Camera error:', err);
      setCameraError('No se pudo acceder a la cámara del dispositivo o el navegador no otorgó permisos.');
      setCameraActive(false);
    }
  };

  // Capture snapshot from webcam
  const captureCameraSnapshot = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 640;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
    setSelectedUrl(dataUrl);
    setSelectedOrigin('CAMARA_DIRECTA');
    stopCamera();
  };

  // File processing
  const handleFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Por favor seleccione un archivo de imagen válido (JPG, PNG, WEBP o SVG).');
      return;
    }
    setIsProcessingFile(true);
    try {
      const formattedSize = file.size > 1024 * 1024 
        ? `${(file.size / (1024 * 1024)).toFixed(2)} MB` 
        : `${Math.round(file.size / 1024)} KB`;

      const compressedDataUrl = await compressImage(file, 600, 600, 0.88);
      setFileDetails({
        name: file.name,
        size: formattedSize,
        type: file.type
      });
      setSelectedUrl(compressedDataUrl);
      setSelectedOrigin('ARCHIVO_LOCAL');
    } catch (err) {
      console.error('Error procesando archivo:', err);
      alert('Hubo un error al procesar la imagen seleccionada.');
    } finally {
      setIsProcessingFile(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  // URL test
  const handleTestUrl = () => {
    if (!urlInput.trim()) {
      setUrlTestStatus('invalid');
      return;
    }
    const img = new Image();
    img.onload = () => {
      setUrlTestStatus('valid');
      setSelectedUrl(urlInput.trim());
      setSelectedOrigin('URL_EXTERNA');
    };
    img.onerror = () => {
      setUrlTestStatus('invalid');
    };
    img.src = urlInput.trim();
  };

  // Preset Selection
  const handleSelectPreset = (preset: typeof BANCO_SIAH_PRESETS[0]) => {
    setSelectedPresetId(preset.id);
    setSelectedUrl(preset.url);
    setSelectedOrigin('BANCO_SIAH');
  };

  // Initials generator
  const handleGenerateInitials = (palette = selectedPalette, name = initialsName) => {
    const svgDataUri = createInitialsSvg(name, palette);
    setSelectedUrl(svgDataUri);
    setSelectedOrigin('AVATAR_GENERADO');
  };

  // Confirm and Apply
  const handleConfirm = () => {
    if (!selectedUrl) {
      alert('Por favor elija o cargue una imagen antes de confirmar.');
      return;
    }
    stopCamera();
    onSelectImage(selectedUrl, selectedOrigin);
    onClose();
  };

  if (!isOpen) return null;

  const categoriesList = ['Todos', ...Array.from(new Set(BANCO_SIAH_PRESETS.map(p => p.categoria)))];
  const filteredPresets = bancoCategoryFilter === 'Todos' 
    ? BANCO_SIAH_PRESETS 
    : BANCO_SIAH_PRESETS.filter(p => p.categoria === bancoCategoryFilter);

  const getOriginLabel = (origin: OrigenImagen) => {
    switch (origin) {
      case 'ARCHIVO_LOCAL': return 'Archivo Local / Dispositivo';
      case 'URL_EXTERNA': return 'URL Externa / Web CDN';
      case 'BANCO_SIAH': return 'Banco de Imágenes SIAH';
      case 'AVATAR_GENERADO': return 'Avatar Vectorial SVG (Iniciales)';
      case 'CAMARA_DIRECTA': return 'Captura de Cámara Web';
      default: return 'Personalizado';
    }
  };

  return (
    <div 
      className="fixed inset-0 z-[80] flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md animate-in fade-in duration-200"
      onClick={() => {
        stopCamera();
        onClose();
      }}
    >
      <div 
        className="relative w-full max-w-3xl max-h-[92vh] flex flex-col bg-[#000033]/95 border border-white/15 rounded-3xl shadow-[0_20px_60px_rgba(0,0,51,0.95)] backdrop-blur-2xl overflow-hidden text-slate-100"
        onClick={e => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-5 border-b border-white/10 flex items-center justify-between bg-white/[0.02]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/[0.08] border border-[#38BDF8]/40 flex items-center justify-center text-[#38BDF8] shadow-[0_0_15px_rgba(56,189,248,0.2)]">
              <ImageIcon className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold text-white">
                  {title}
                </h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-950/60 text-emerald-400 border border-emerald-500/30 font-semibold flex items-center gap-1">
                  <Database className="w-2.5 h-2.5" /> MariaDB Compatible
                </span>
              </div>
              <p className="text-xs text-slate-400">
                {subtitle}
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              stopCamera();
              onClose();
            }}
            className="p-2 rounded-xl bg-white/[0.05] text-slate-400 hover:text-white border border-white/10 hover:bg-white/10 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Source Navigation Tabs (5 Options) */}
        <div className="flex items-center gap-1.5 p-2 px-4 bg-white/[0.03] border-b border-white/10 overflow-x-auto custom-scrollbar">
          {/* Tab 1: Archivo Local */}
          <button
            type="button"
            onClick={() => handleTabChange('ARCHIVO_LOCAL')}
            className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all shrink-0 ${
              activeTab === 'ARCHIVO_LOCAL'
                ? 'bg-[#38BDF8] text-[#000033] shadow-[0_0_15px_rgba(56,189,248,0.3)]'
                : 'text-slate-300 hover:text-white hover:bg-white/[0.05]'
            }`}
          >
            <HardDrive className="w-3.5 h-3.5" />
            <span>Archivo Local / PC</span>
          </button>

          {/* Tab 2: URL Externa */}
          <button
            type="button"
            onClick={() => handleTabChange('URL_EXTERNA')}
            className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all shrink-0 ${
              activeTab === 'URL_EXTERNA'
                ? 'bg-[#38BDF8] text-[#000033] shadow-[0_0_15px_rgba(56,189,248,0.3)]'
                : 'text-slate-300 hover:text-white hover:bg-white/[0.05]'
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            <span>Enlace Web (URL)</span>
          </button>

          {/* Tab 3: Banco SIAH */}
          <button
            type="button"
            onClick={() => handleTabChange('BANCO_SIAH')}
            className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all shrink-0 ${
              activeTab === 'BANCO_SIAH'
                ? 'bg-[#38BDF8] text-[#000033] shadow-[0_0_15px_rgba(56,189,248,0.3)]'
                : 'text-slate-300 hover:text-white hover:bg-white/[0.05]'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Banco de Retratos SIAH</span>
          </button>

          {/* Tab 4: Iniciales SVG */}
          <button
            type="button"
            onClick={() => {
              handleTabChange('AVATAR_GENERADO');
              handleGenerateInitials();
            }}
            className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all shrink-0 ${
              activeTab === 'AVATAR_GENERADO'
                ? 'bg-[#38BDF8] text-[#000033] shadow-[0_0_15px_rgba(56,189,248,0.3)]'
                : 'text-slate-300 hover:text-white hover:bg-white/[0.05]'
            }`}
          >
            <Award className="w-3.5 h-3.5" />
            <span>Iniciales Vectoriales SVG</span>
          </button>

          {/* Tab 5: Cámara Web */}
          <button
            type="button"
            onClick={() => {
              handleTabChange('CAMARA_DIRECTA');
              startCamera();
            }}
            className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all shrink-0 ${
              activeTab === 'CAMARA_DIRECTA'
                ? 'bg-[#38BDF8] text-[#000033] shadow-[0_0_15px_rgba(56,189,248,0.3)]'
                : 'text-slate-300 hover:text-white hover:bg-white/[0.05]'
            }`}
          >
            <Camera className="w-3.5 h-3.5" />
            <span>Cámara Web</span>
          </button>
        </div>

        {/* Tab Contents */}
        <div className="p-6 overflow-y-auto flex-1 custom-scrollbar space-y-6">

          {/* TAB 1: ARCHIVO LOCAL */}
          {activeTab === 'ARCHIVO_LOCAL' && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-3 ${
                  isDragging 
                    ? 'border-[#38BDF8] bg-[#38BDF8]/10' 
                    : 'border-white/20 bg-white/[0.02] hover:border-[#38BDF8]/50 hover:bg-white/[0.04]'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/svg+xml,image/gif"
                  onChange={handleFileChange}
                  className="hidden"
                />

                <div className="w-14 h-14 rounded-2xl bg-[#38BDF8]/10 border border-[#38BDF8]/30 flex items-center justify-center text-[#38BDF8] shadow-inner">
                  <Upload className="w-7 h-7" />
                </div>

                <div>
                  <h4 className="text-sm font-bold text-white">
                    {isProcessingFile ? 'Procesando y optimizando imagen...' : 'Arrastre su fotografía aquí o haga clic para examinar'}
                  </h4>
                  <p className="text-xs text-slate-400 mt-1">
                    Soporta JPG, PNG, WEBP y SVG. Optimización automática a alta resolución para almacenamiento MariaDB.
                  </p>
                </div>

                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.05] border border-white/10 text-[11px] text-slate-300">
                  <HardDrive className="w-3 h-3 text-[#38BDF8]" />
                  <span>Carga directa desde disco local / móvil</span>
                </div>
              </div>

              {fileDetails && (
                <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/10 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2.5">
                    <FileImage className="w-4 h-4 text-[#38BDF8]" />
                    <div>
                      <span className="font-semibold text-white block truncate max-w-[280px]">{fileDetails.name}</span>
                      <span className="text-[10px] text-slate-400">{fileDetails.size} • {fileDetails.type}</span>
                    </div>
                  </div>
                  <span className="text-[11px] text-emerald-400 font-mono flex items-center gap-1">
                    <Check className="w-3 h-3" /> Optimizado
                  </span>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: URL EXTERNA / WEB */}
          {activeTab === 'URL_EXTERNA' && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                  Ingrese la URL directa de la imagen (HTTPS)
                </label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Globe className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="url"
                      value={urlInput}
                      onChange={(e) => {
                        setUrlInput(e.target.value);
                        setUrlTestStatus('idle');
                      }}
                      placeholder="https://images.unsplash.com/... o https://tu-servidor.com/avatar.jpg"
                      className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-white/[0.04] border border-white/10 text-white focus:outline-none focus:border-[#38BDF8] transition-all"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleTestUrl}
                    className="px-4 py-2 rounded-xl bg-white/[0.08] hover:bg-[#38BDF8] text-white hover:text-[#000033] text-xs font-semibold border border-white/10 transition-all shrink-0"
                  >
                    Probar Enlace
                  </button>
                </div>
              </div>

              {urlTestStatus === 'valid' && (
                <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Enlace válido. Vista previa cargada correctamente para la BD.</span>
                </div>
              )}

              {urlTestStatus === 'invalid' && (
                <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                  <span>No se pudo cargar la imagen desde la URL especificada. Verifique que sea pública y accesible.</span>
                </div>
              )}

              {/* Suggestions */}
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-semibold tracking-wider block mb-2">
                  Fuentes y Servidores Recomendados:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/5 text-slate-300">
                    <strong className="text-white block font-medium">Unsplash / CDN Corporativo</strong>
                    <span className="text-[11px] text-slate-400">Imágenes profesionales de alta fidelidad con HTTPS.</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/5 text-slate-300">
                    <strong className="text-white block font-medium">Gravatar o Repositorio S3 / Cloud</strong>
                    <span className="text-[11px] text-slate-400">Vínculos de cuentas fiduciarias autorizadas.</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: BANCO DE RETRATOS SIAH */}
          {activeTab === 'BANCO_SIAH' && (
            <div className="space-y-4 animate-in fade-in duration-200">
              {/* Category Filter Pills */}
              <div className="flex flex-wrap gap-1.5 pb-2 border-b border-white/10">
                {categoriesList.map((cat, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setBancoCategoryFilter(cat)}
                    className={`text-xs px-3 py-1 rounded-lg border transition-all ${
                      bancoCategoryFilter === cat
                        ? 'bg-[#38BDF8] text-[#000033] font-bold border-[#38BDF8]'
                        : 'bg-white/[0.03] text-slate-300 border-white/10 hover:bg-white/[0.08]'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* Grid of Headshots */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-h-[320px] overflow-y-auto custom-scrollbar p-1">
                {filteredPresets.map((preset) => {
                  const isSelected = selectedUrl === preset.url;
                  return (
                    <div
                      key={preset.id}
                      onClick={() => handleSelectPreset(preset)}
                      className={`relative rounded-2xl overflow-hidden border cursor-pointer group transition-all p-2 flex flex-col justify-between ${
                        isSelected
                          ? 'border-[#38BDF8] bg-[#38BDF8]/20 ring-2 ring-[#38BDF8]/50'
                          : 'border-white/10 bg-white/[0.03] hover:border-white/30 hover:bg-white/[0.06]'
                      }`}
                    >
                      <div className="relative aspect-square w-full rounded-xl overflow-hidden mb-2">
                        <img
                          src={preset.url}
                          alt={preset.nombre}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          referrerPolicy="no-referrer"
                        />
                        {isSelected && (
                          <div className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-[#38BDF8] text-[#000033] flex items-center justify-center font-bold shadow-md">
                            <Check className="w-3.5 h-3.5 stroke-[3]" />
                          </div>
                        )}
                      </div>

                      <div>
                        <span className="text-[11px] font-bold text-white block truncate">
                          {preset.nombre}
                        </span>
                        <span className="text-[9px] font-mono text-[#38BDF8] block truncate">
                          {preset.categoria}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 4: INICIALES VECTORIALES SVG */}
          {activeTab === 'AVATAR_GENERADO' && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Nombre o Siglas para el Avatar
                  </label>
                  <input
                    type="text"
                    value={initialsName}
                    onChange={(e) => {
                      setInitialsName(e.target.value);
                      handleGenerateInitials(selectedPalette, e.target.value);
                    }}
                    placeholder="Ej. Ing. Carlos Salvatierra"
                    className="w-full px-3 py-2 text-xs rounded-xl bg-white/[0.04] border border-white/10 text-white focus:outline-none focus:border-[#38BDF8]"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">
                    Genera un gráfico vectorial SVG nítido, sin pérdida de resolución en ninguna pantalla.
                  </p>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                    Esquema Cromático Corporativo SIAH
                  </label>
                  <div className="grid grid-cols-1 gap-1.5">
                    {COLOR_PALETTES.map((pal) => (
                      <button
                        key={pal.id}
                        type="button"
                        onClick={() => {
                          setSelectedPalette(pal);
                          handleGenerateInitials(pal, initialsName);
                        }}
                        className={`text-xs p-2 rounded-xl border flex items-center justify-between transition-all ${
                          selectedPalette.id === pal.id
                            ? 'border-[#38BDF8] bg-[#38BDF8]/15 text-white font-bold'
                            : 'border-white/10 bg-white/[0.02] text-slate-300 hover:bg-white/[0.06]'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-5 h-5 rounded-full border border-white/20 shadow-inner"
                            style={{ background: `linear-gradient(135deg, ${pal.bgStart}, ${pal.bgEnd})` }}
                          />
                          <span>{pal.label}</span>
                        </div>
                        {selectedPalette.id === pal.id && <Check className="w-3.5 h-3.5 text-[#38BDF8]" />}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: CÁMARA WEB */}
          {activeTab === 'CAMARA_DIRECTA' && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div className="relative w-full max-w-sm mx-auto aspect-square rounded-2xl overflow-hidden bg-black/60 border border-white/15 flex items-center justify-center shadow-inner">
                {cameraActive ? (
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="text-center p-6 space-y-3">
                    <Camera className="w-10 h-10 text-slate-500 mx-auto" />
                    <p className="text-xs text-slate-400">
                      {cameraError || 'Presione el botón para activar la cámara de su equipo.'}
                    </p>
                    <button
                      type="button"
                      onClick={startCamera}
                      className="px-4 py-2 rounded-xl bg-[#38BDF8] hover:bg-[#0284C7] text-[#000033] font-bold text-xs transition-all shadow-[0_0_15px_rgba(56,189,248,0.25)]"
                    >
                      Activar Cámara
                    </button>
                  </div>
                )}
              </div>

              {cameraActive && (
                <div className="flex justify-center gap-3">
                  <button
                    type="button"
                    onClick={captureCameraSnapshot}
                    className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs flex items-center gap-2 shadow-[0_0_20px_rgba(16,185,129,0.3)] transition-all"
                  >
                    <Camera className="w-4 h-4" />
                    <span>Tomar Fotografía Ahora</span>
                  </button>

                  <button
                    type="button"
                    onClick={stopCamera}
                    className="px-4 py-2 rounded-xl bg-white/[0.05] hover:bg-white/10 text-slate-300 text-xs font-semibold border border-white/10"
                  >
                    Detener Cámara
                  </button>
                </div>
              )}
            </div>
          )}

          {/* PREVIEW & SELECTED ORIGIN SUMMARY */}
          <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4 w-full sm:w-auto">
              <div className="relative shrink-0">
                <img
                  src={selectedUrl || currentImageUrl || BANCO_SIAH_PRESETS[0].url}
                  alt="Vista Previa de la Fotografía"
                  className="w-16 h-16 rounded-2xl object-cover border-2 border-[#38BDF8] shadow-lg"
                  referrerPolicy="no-referrer"
                />
                <span className="absolute -bottom-1 -right-1 p-1 rounded-full bg-[#000033] border border-[#38BDF8] text-[#38BDF8]">
                  <Check className="w-3 h-3" />
                </span>
              </div>

              <div className="min-w-0">
                <span className="text-[10px] text-slate-400 uppercase font-semibold tracking-wider block">
                  Origen Seleccionado para la BD:
                </span>
                <div className="flex items-center gap-1.5 text-xs font-bold text-white mt-0.5">
                  <span className="text-[#38BDF8]">{getOriginLabel(selectedOrigin)}</span>
                </div>
                <p className="text-[11px] text-slate-400 truncate max-w-sm mt-0.5">
                  Listo para persistirse en el esquema relacional MariaDB de 360 SIACE.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              <button
                type="button"
                onClick={() => {
                  stopCamera();
                  onClose();
                }}
                className="px-4 py-2 rounded-xl bg-white/[0.05] hover:bg-white/10 text-slate-300 text-xs font-semibold border border-white/10 transition-all"
              >
                Cancelar
              </button>

              <button
                type="button"
                onClick={handleConfirm}
                className="px-5 py-2 rounded-xl bg-[#38BDF8] hover:bg-[#0284C7] text-[#000033] hover:text-white font-bold text-xs transition-all shadow-[0_0_20px_rgba(56,189,248,0.3)] flex items-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                <span>Aplicar a la Ficha y Guardar</span>
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
