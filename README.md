# Sistema de Gestión Código-58

Plataforma integral de consultoría empresarial, formalización jurídica y aceleración comercial para emprendedores.

![Código-58 Logo](assets/img/logo.png)

---

## 🚀 Módulos Principales del Sistema

1. **Dashboard Ejecutivo**: Métricas en tiempo real, accesos rápidos y vista personalizada según el rol del usuario (`direccion`, `consultor`, `gestor_legal`, `comercial`).
2. **Directorio de Emprendedores**: Buscador inteligente y tabla interactiva con datos de identificación (Cédula/RIF), dirección física, contacto directo (WhatsApp, llamada, email) y catálogo de servicios que ofrece.
3. **Emprendedores**: Registro, actualización y expedientes completos de cada emprendedor.
4. **Asesorías**: Programación, calendario y seguimiento de sesiones de consultoría y diagnóstico.
5. **Procesos Legales**: Gestión de trámites jurídicos, expedientes y control documental.
6. **Contratos & Pagos**: Formalización comercial, cobros, anticipos y verificación de comprobantes.
7. **Reportes & Analíticas**: Gráficos interactivos con **Chart.js**, KPIs ejecutivos y exportación de informes a Excel / CSV.
8. **CMS del Sistema**: Control de activación y roles de cada módulo, catálogo de servicios y configuración corporativa.

---

## 🎨 Identidad Visual Oficial

- **Azul Marino Profundo**: `#161938` / `#1E224F`
- **Verde Azulado / Persian Teal**: `#008080` / `#0D9488`
- **Amarillo Ámbar / Warm Gold**: `#F59E0B`
- **Púrpura Real**: `#4A154B`

---

## ⚙️ Despliegue en Vercel (`codigo58.360siace.com`)

El proyecto está preparado para ejecutarse en la infraestructura serverless de Vercel a través de `api/index.php` y `vercel.json` con el runtime `vercel-php@0.9.0`.

### Variables de Entorno en Vercel
En el panel de Vercel (**Project Settings &rarr; Environment Variables**), configure:

| Variable | Descripción | Ejemplo |
| :--- | :--- | :--- |
| `DB_HOST` | Host del servidor MySQL en la nube | `aws.connect.psdb.cloud` / `tu-host.com` |
| `DB_USER` | Usuario de la base de datos | `codigo58_user` |
| `DB_PASS` | Contraseña de la base de datos | `tu_password_segura` |
| `DB_NAME` | Nombre de la base de datos | `consultoria_mof` o `db_codigo58` |
| `DB_PORT` | Puerto de conexión MySQL | `3306` |

### Base de Datos
Importe el archivo `database.sql` en su servidor MySQL en la nube para crear todas las tablas y datos iniciales.

### Credenciales de Demostración
- **Email:** `admin@consultoria.com`
- **Contraseña:** `password`
