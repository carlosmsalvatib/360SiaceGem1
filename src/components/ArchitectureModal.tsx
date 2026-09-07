import React, { useState } from 'react';
import { 
  X, 
  Database, 
  FolderTree, 
  Code2, 
  Server, 
  ShieldCheck, 
  Copy, 
  Check, 
  Download, 
  Terminal,
  ExternalLink,
  Sparkles
} from 'lucide-react';
import { MARIADB_SQL_SCRIPT, FOLDER_STRUCTURE_TEXT, DEPLOYMENT_GUIDE_TEXT } from '../data/sqlSchemaAndDocs';

interface ArchitectureModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ArchitectureModal: React.FC<ArchitectureModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'sql' | 'folders' | 'frontend' | 'backend' | 'deploy'>('sql');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadSQL = () => {
    const element = document.createElement('a');
    const file = new Blob([MARIADB_SQL_SCRIPT], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = 'schema_mariadb_360siace.sql';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const frontendCodeSnippet = `/* 1. CSS PARA FONDO DEGRADADO (AZUL MARINO A AZUL REY) Y LAYOUT */
:root {
  --color-navy-dark: #040915;     /* Azul Marino en los extremos */
  --color-navy-mid: #0a1733;      /* Intermedio con baja fatiga visual */
  --color-royal-blue: #1d4ed8;    /* Azul Rey en el centro / acentos */
  --color-cyan-glow: #38bdf8;
}

body {
  /* Degradado radial suave desde Azul Rey en el centro hacia Azul Marino en los bordes */
  background: radial-gradient(circle at 50% 30%, #1e3a8a 0%, #0c1c3f 50%, #030814 100%);
  background-attachment: fixed;
  color: #f1f5f9;
  font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
}

/* 2. TRANSFORMACIONES 3D PARA EL CARRUSEL TIPO CUBO / RUEDA */
.perspective-1000 {
  perspective: 1200px;
}
.preserve-3d {
  transform-style: preserve-3d;
}
.backface-hidden {
  backface-visibility: hidden;
}

/* 3. LÓGICA JAVASCRIPT MATEMÁTICA PARA EL CARRUSEL 3D (6 PROYECTOS) */
// Cálculo del ángulo y radio del prisma hexagonal (6 caras):
const totalCaras = 6;
const anguloPaso = 360 / totalCaras; // 60 grados por cara
const anchoCara = 300; // píxeles
const radio = Math.round((anchoCara / 2) / Math.tan(Math.PI / totalCaras)); // ~260px

function rotarCarrusel(indiceActivo) {
  const contenedor3D = document.getElementById('rueda-proyectos-3d');
  const rotacionY = -indiceActivo * anguloPaso;
  contenedor3D.style.transform = \`rotateY(\${rotacionY}deg)\`;
}

// Cada cara se posiciona en el espacio tridimensional:
// style="transform: rotateY(\${index * 60}deg) translateZ(\${radio}px);"`;

  const backendCodeSnippet = `<?php
// =========================================================================
// ENDPOINT DE AUTENTICACIÓN Y CMS DINÁMICO (PHP + PDO + MARIADB)
// Archivo: /api/auth/login.php
// =========================================================================

header('Content-Type: application/json; charset=UTF-8');
header('X-Content-Type-Options: nosniff');
header('X-Frame-Options: SAMEORIGIN');

require_once __DIR__ . '/../config/database.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Método no permitido. Utilice POST.']);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true);
$email = filter_var(trim($input['email'] ?? ''), FILTER_VALIDATE_EMAIL);
$password = trim($input['password'] ?? '');

if (!$email || empty($password)) {
    http_response_code(400);
    echo json_encode(['error' => 'Credenciales incompletas']);
    exit;
}

// Consulta parametrizada segura contra inyecciones SQL
$stmt = $pdo->prepare("
    SELECT u.id, u.nombre, u.email, u.password_hash, u.estado, r.codigo as rol_codigo, r.nombre as rol_nombre
    FROM usuarios u
    JOIN roles r ON u.rol_id = r.id
    WHERE u.email = :email AND u.estado = 'ACTIVO'
    LIMIT 1
");
$stmt->execute([':email' => $email]);
$usuario = $stmt->fetch(PDO::FETCH_ASSOC);

if (!$usuario || !password_verify($password, $usuario['password_hash'])) {
    http_response_code(401);
    echo json_encode(['error' => 'Usuario o contraseña incorrectos']);
    exit;
}

// Generación de JWT seguro con firma HMAC SHA-256
$payload = [
    'sub' => $usuario['id'],
    'nombre' => $usuario['nombre'],
    'email' => $usuario['email'],
    'rol' => $usuario['rol_codigo'],
    'iat' => time(),
    'exp' => time() + (8 * 3600) // 8 horas de validez
];
$token = generarJWT($payload, SECRET_KEY_SIAH);

echo json_encode([
    'success' => true,
    'token' => $token,
    'usuario' => [
        'id' => $usuario['id'],
        'nombre' => $usuario['nombre'],
        'email' => $usuario['email'],
        'rol' => $usuario['rol_nombre']
    ]
]);

// =========================================================================
// LÓGICA DE CMS DINÁMICO: ACTUALIZACIÓN DE TEXTOS SIN TOCAR CÓDIGO
// Archivo: /api/cms/update-config.php
// =========================================================================
/*
$clave = $input['clave']; // Ej: 'hero_titulo', 'hero_parrafo_apoyo'
$valor = $input['valor'];

$stmt = $pdo->prepare("
    INSERT INTO config_cms (clave, seccion, valor, actualizado_por)
    VALUES (:clave, :seccion, :valor, :usuario_id)
    ON DUPLICATE KEY UPDATE valor = :valor, actualizado_por = :usuario_id
");
$stmt->execute([
    ':clave' => $clave,
    ':seccion' => $seccion,
    ':valor' => $valor,
    ':usuario_id' => $tokenPayload['sub']
]);
*/`;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-5xl max-h-[92vh] flex flex-col bg-[#000033]/90 border border-white/10 rounded-3xl shadow-[0_8px_32px_0_rgba(0,0,51,0.8)] backdrop-blur-2xl overflow-hidden text-slate-100"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-white/10 flex items-center justify-between bg-white/[0.03]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/[0.08] border border-[#38BDF8]/40 flex items-center justify-center text-[#38BDF8] shadow-[0_0_15px_rgba(56,189,248,0.2)]">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-white">
                  Centro de Arquitectura & Base de Datos MariaDB
                </h3>
                <span className="text-[10px] font-mono font-bold bg-white/[0.05] text-[#38BDF8] border border-[#38BDF8]/30 px-2 py-0.5 rounded-full">
                  360 SIACE • SIAH
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Especificaciones técnicas, esquema SQL, árbol de carpetas, código y despliegue para www.360siace.com
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/[0.05] text-slate-400 hover:text-white border border-white/10 hover:bg-white/10 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1.5 px-6 pt-3 pb-2 border-b border-white/10 bg-white/[0.02] overflow-x-auto text-xs font-semibold">
          <button
            onClick={() => setActiveTab('sql')}
            className={`px-3.5 py-2 rounded-xl flex items-center gap-2 transition-all shrink-0 ${
              activeTab === 'sql' 
                ? 'bg-[#38BDF8] text-[#000033] font-bold shadow-[0_0_15px_rgba(56,189,248,0.3)]' 
                : 'text-slate-400 hover:text-white hover:bg-white/[0.05]'
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            <span>1. Esquema MariaDB (SQL)</span>
          </button>

          <button
            onClick={() => setActiveTab('folders')}
            className={`px-3.5 py-2 rounded-xl flex items-center gap-2 transition-all shrink-0 ${
              activeTab === 'folders' 
                ? 'bg-[#38BDF8] text-[#000033] font-bold shadow-[0_0_15px_rgba(56,189,248,0.3)]' 
                : 'text-slate-400 hover:text-white hover:bg-white/[0.05]'
            }`}
          >
            <FolderTree className="w-3.5 h-3.5" />
            <span>2. Árbol de Carpetas</span>
          </button>

          <button
            onClick={() => setActiveTab('frontend')}
            className={`px-3.5 py-2 rounded-xl flex items-center gap-2 transition-all shrink-0 ${
              activeTab === 'frontend' 
                ? 'bg-[#38BDF8] text-[#000033] font-bold shadow-[0_0_15px_rgba(56,189,248,0.3)]' 
                : 'text-slate-400 hover:text-white hover:bg-white/[0.05]'
            }`}
          >
            <Code2 className="w-3.5 h-3.5" />
            <span>3. Código Frontend & Cubo 3D</span>
          </button>

          <button
            onClick={() => setActiveTab('backend')}
            className={`px-3.5 py-2 rounded-xl flex items-center gap-2 transition-all shrink-0 ${
              activeTab === 'backend' 
                ? 'bg-[#38BDF8] text-[#000033] font-bold shadow-[0_0_15px_rgba(56,189,248,0.3)]' 
                : 'text-slate-400 hover:text-white hover:bg-white/[0.05]'
            }`}
          >
            <Server className="w-3.5 h-3.5" />
            <span>4. Lógica Backend & CMS</span>
          </button>

          <button
            onClick={() => setActiveTab('deploy')}
            className={`px-3.5 py-2 rounded-xl flex items-center gap-2 transition-all shrink-0 ${
              activeTab === 'deploy' 
                ? 'bg-[#38BDF8] text-[#000033] font-bold shadow-[0_0_15px_rgba(56,189,248,0.3)]' 
                : 'text-slate-400 hover:text-white hover:bg-white/[0.05]'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>5. Guía de Despliegue & SSL</span>
          </button>
        </div>

        {/* Tab Content Body */}
        <div className="p-6 overflow-y-auto flex-1 font-mono text-xs">
          
          {/* TAB 1: MariaDB SQL Script */}
          {activeTab === 'sql' && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2 bg-white/[0.03] p-3 rounded-xl border border-white/10">
                <div className="flex items-center gap-2">
                  <Database className="w-4 h-4 text-[#38BDF8]" />
                  <span className="text-white font-bold">Base de Datos: db_360siace (MariaDB 10.11 LTS)</span>
                  <span className="text-slate-400 font-normal">| 7 Tablas Principales + Semillas</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleCopy(MARIADB_SQL_SCRIPT)}
                    className="px-3 py-1.5 rounded-lg bg-white/[0.05] hover:bg-white/10 text-slate-200 border border-white/10 flex items-center gap-1.5 transition-all"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? '¡Copiado!' : 'Copiar SQL'}</span>
                  </button>
                  <button
                    onClick={handleDownloadSQL}
                    className="px-3 py-1.5 rounded-lg bg-[#38BDF8] hover:bg-sky-300 text-[#000033] font-bold flex items-center gap-1.5 transition-all shadow-md"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Descargar .sql</span>
                  </button>
                </div>
              </div>

              <pre className="p-4 rounded-2xl bg-black/40 border border-white/10 text-slate-300 overflow-x-auto whitespace-pre leading-relaxed text-[11px] selection:bg-[#38BDF8] selection:text-[#000033]">
                {MARIADB_SQL_SCRIPT}
              </pre>
            </div>
          )}

          {/* TAB 2: Folder Tree */}
          {activeTab === 'folders' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between bg-white/[0.03] p-3 rounded-xl border border-white/10">
                <span className="text-white font-bold">Estructura Modular Propuesta (Full-Stack + CMS + Assets)</span>
                <button
                  onClick={() => handleCopy(FOLDER_STRUCTURE_TEXT)}
                  className="px-3 py-1.5 rounded-lg bg-white/[0.05] hover:bg-white/10 text-slate-200 border border-white/10 flex items-center gap-1.5 transition-all"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>Copiar Árbol</span>
                </button>
              </div>

              <pre className="p-4 rounded-2xl bg-black/40 border border-white/10 text-[#38BDF8] overflow-x-auto whitespace-pre leading-relaxed text-[12px]">
                {FOLDER_STRUCTURE_TEXT}
              </pre>
            </div>
          )}

          {/* TAB 3: Frontend Code & 3D Wheel/Cube */}
          {activeTab === 'frontend' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between bg-white/[0.03] p-3 rounded-xl border border-white/10">
                <span className="text-white font-bold">CSS Tema Degradado + Algoritmo del Carrusel 3D Hexagonal</span>
                <button
                  onClick={() => handleCopy(frontendCodeSnippet)}
                  className="px-3 py-1.5 rounded-lg bg-white/[0.05] hover:bg-white/10 text-slate-200 border border-white/10 flex items-center gap-1.5 transition-all"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>Copiar Código</span>
                </button>
              </div>

              <pre className="p-4 rounded-2xl bg-black/40 border border-white/10 text-sky-200 overflow-x-auto whitespace-pre leading-relaxed text-[11px]">
                {frontendCodeSnippet}
              </pre>
            </div>
          )}

          {/* TAB 4: Backend Logic & Endpoints */}
          {activeTab === 'backend' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between bg-white/[0.03] p-3 rounded-xl border border-white/10">
                <span className="text-white font-bold">Lógica PHP PDO (o Node.js): Login Cifrado y CMS Dinámico</span>
                <button
                  onClick={() => handleCopy(backendCodeSnippet)}
                  className="px-3 py-1.5 rounded-lg bg-white/[0.05] hover:bg-white/10 text-slate-200 border border-white/10 flex items-center gap-1.5 transition-all"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>Copiar Código PHP</span>
                </button>
              </div>

              <pre className="p-4 rounded-2xl bg-black/40 border border-white/10 text-emerald-300 overflow-x-auto whitespace-pre leading-relaxed text-[11px]">
                {backendCodeSnippet}
              </pre>
            </div>
          )}

          {/* TAB 5: Deployment Guide & SSL */}
          {activeTab === 'deploy' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between bg-white/[0.03] p-3 rounded-xl border border-white/10">
                <span className="text-white font-bold">Hosting, MariaDB, SSL Let's Encrypt y HTTPS Forzada</span>
                <button
                  onClick={() => handleCopy(DEPLOYMENT_GUIDE_TEXT)}
                  className="px-3 py-1.5 rounded-lg bg-white/[0.05] hover:bg-white/10 text-slate-200 border border-white/10 flex items-center gap-1.5 transition-all"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>Copiar Guía</span>
                </button>
              </div>

              <pre className="p-4 rounded-2xl bg-black/40 border border-white/10 text-slate-200 overflow-x-auto whitespace-pre leading-relaxed text-[11px]">
                {DEPLOYMENT_GUIDE_TEXT}
              </pre>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/10 bg-white/[0.02] flex items-center justify-between text-xs text-slate-400">
          <span className="flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-[#38BDF8]" />
            Entregable oficial para arquitectura y desarrollo de www.360siace.com
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-white/[0.05] hover:bg-white/10 text-slate-200 text-xs font-semibold border border-white/10 transition-all"
          >
            Cerrar Visor
          </button>
        </div>

      </div>
    </div>
  );
};
