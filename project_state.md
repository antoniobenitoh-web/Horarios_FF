# Estado del Proyecto: Sistema de Gestión de Equipos de Promoción (Fase 1)

Este documento resume el estado actual del proyecto, las decisiones de arquitectura, el prototipo desarrollado y el esquema de base de datos propuesto, ideal para continuar el desarrollo o migrar el contexto a otro equipo/entorno.

---

## 1. Visión General del Proyecto

Se ha planificado y comenzado a desarrollar una plataforma SaaS para la gestión de equipos de promoción, enfocada en la agilidad, notificaciones en tiempo real y jerarquías de usuarios claras.

### Roles del Sistema (RBAC)
- **Promotor**: Visualiza horarios, firma conformidades (Lectura Obligatoria), solicita cambios de turnos y revisa su balance de horas semanales.
- **GPV (Gestor de Punto de Venta)**: Visualiza a los promotores de su zona, revisa conformidades y visualiza las solicitudes de cambio.
- **AM (Area Manager)**: Control global de todos los promotores de todas las zonas y control de reseteo de contraseñas de rangos inferiores.
- **Coordinadora**: Control total. Crea usuarios, aprueba o rechaza cambios de horario (con impacto automático en la planificación) y gestiona contraseñas globales.

---

## 2. Prototipo Funcional Desarrollado (Frontend)

Para validar el flujo, se ha desarrollado un prototipo *Single Page Application* (SPA) funcional basado en HTML, CSS y JavaScript *Vanilla* que utiliza `localStorage` como base de datos simulada.

### Archivos del Prototipo
- `index.html`: Estructura principal, paneles dinámicos de cada rol, widgets de balance de horas, modal de firma bloqueante y switcher de desarrollo.
- `style.css`: Sistema de diseño moderno con colores de variables, paneles tipo *glassmorphism*, indicadores visuales de semáforo para horarios y animaciones.
- `app.js`: Lógica completa que incluye la generación de la base de datos simulada, cálculo de *Horas Planificadas vs Horas Contrato*, trazabilidad (*Audit Logs*) e interfaces de los roles.

### Funcionalidades UI/UX Destacadas
1. **Modo Lectura Obligatoria**: Si un promotor tiene turnos "Publicados" pendientes de firmar, se bloquean sus acciones hasta que no firme la conformidad de dichos turnos.
2. **Semáforo de Estado**: Colores dinámicos en los turnos:
   - Gris: Borrador (*Draft*)
   - Azul: Publicado / Pendiente de Firma
   - Verde: Leído y Conforme
   - Rojo: Rechazado (Solicitudes)
3. **Control de Balance de Horas Semanal**: Algoritmo que calcula (Horas Planificadas - Horas Contrato) y muestra si hay déficit o exceso de horas.
4. **Logs de Auditoría (Trazabilidad)**: Línea de tiempo visible para Coordinadora/AM de todas las acciones ejecutadas de forma inmutable.

---

## 3. Arquitectura Técnica Definida (Para Backend Futuro)

Para la implementación del Backend real, se acordó el siguiente Stack y Modelo:

### Stack Propuesto
- **Frontend**: React.js / Vue.js + Tailwind CSS.
- **Backend**: Node.js (NestJS) o Python (FastAPI).
- **Base de Datos**: PostgreSQL (Ideal para la jerarquía del sistema).
- **Infraestructura**: Vercel / AWS.

### Modelo de Base de Datos y Lógica (PostgreSQL)
Se definió un esquema estructurado:
- **Tablas Core**: `users`, `centers`, `schedules`, `confirmations`, `change_requests`, `audit_logs`.
- **RBAC mediante FKs**: En `users` se mapean los superiores directos (`parent_gpv_id`, `parent_am_id`, `parent_coord_id`) facilitando consultas con *Row-Level Security* (RLS).
- **Triggers de Auditoría**: Función SQL que automáticamente registra un log inmutable en `audit_logs` tras operaciones INSERT o UPDATE en los horarios.
- **Vista de Balances**: Consulta optimizada agrupada por `ISO Year` e `ISO Week` sumando la diferencia entre `planned_hours` (calculado por diferencia de timestamps) y `contract_hours`.

---

## 4. Siguientes Pasos (Hoja de Ruta)

Para retomar o continuar con el proyecto en otro equipo, las siguientes acciones están disponibles en la hoja de ruta:
1. **Inicialización del Repositorio**: Migrar el prototipo (`index.html`, `app.js`, `style.css`) y este estado de proyecto al nuevo ordenador.
2. **Setup Backend**: Configurar la base de datos PostgreSQL real usando el esquema propuesto y levantar el API (NestJS/FastAPI).
3. **Migración a Framework (Opcional)**: Refactorizar el código Vanilla JS a componentes de React/Vue basándose en el comportamiento de la SPA.
4. **Historias de Usuario**: Desarrollar la documentación técnica para programadores.
