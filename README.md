# Horarios Equipo FF

Aplicación web progresiva (PWA) para la gestión y consulta de horarios, control de jornadas y supervisión de equipos de trabajo para **Equipo FF**.

---

## 🚀 Características Principales

- **Gestión de Horarios y Turnos**: Cuadrante interactivo, lectura obligatoria y firma de conformidad de horarios publicados.
- **Jerarquía y Control de Acceso (RBAC)**:
  - **Promotor**: Consulta de turnos asignados, firma de conformidad y control de horas.
  - **GPV**: Supervisión de promotores de su zona y seguimiento de conformidades.
  - **AM (Area Manager)**: Visión multizona, seguimiento de equipos y balance horario.
  - **Coordinadora**: Control total sobre planificación, gestión de altas/bajas de usuarios y reseteo de claves.
- **Control de Horas**: Comparativa visual de horas planificadas frente a horas de contrato (déficit y exceso).
- **Directorio de Equipo**: Ficha de centros, promotores y responsables asignados.
- **Soporte PWA**: Instalable en dispositivos móviles y de escritorio como aplicación nativa.

---

## 🛠️ Stack Tecnológico

- **Frontend**: React 19, React Router 7, Vite 8, CSS Modules, Lucide React (iconografía).
- **PWA**: `vite-plugin-pwa` con service worker y soporte offline.
- **Backend / Persistencia**: Google Apps Script (integrado con Google Sheets) mediante API REST (`VITE_GAS_URL`).

---

## 💻 Desarrollo Local

### Requisitos
- Node.js (v18+)
- npm

### Instalación y Ejecución
```bash
# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm run dev

# Compilar para producción
npm run build

# Previsualizar compilación de producción
npm run preview
```

### Variables de Entorno (`.env` / `.env.local`)
```env
VITE_GAS_URL=https://script.google.com/macros/s/<ID_DEPLOYMENT>/exec
```
