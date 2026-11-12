import pptxgen from 'pptxgenjs';
import path from 'path';
import fs from 'fs';

const SCREENSHOTS_DIR = path.resolve('public/screenshots_guia');
const OUTPUT_PPTX = path.resolve('Guia_de_Uso_Horarios_Equipo_FF.pptx');

// Paleta de colores corporativos
const COLORS = {
  saleslandDark: '084859',
  saleslandDeep: '041D27',
  saleslandLight: '09576A',
  saleslandTeal: '00A2AC',
  saleslandCyan: '00C4CC',
  xiaomiOrange: 'FF6900',
  white: 'FFFFFF',
  slateDark: '1E293B',
  slateLight: 'F8FAFC',
  slateMuted: '64748B',
  successGreen: '10B981',
  dangerRed: 'EF4444'
};

async function generatePresentation() {
  console.log('📊 Generando presentación PowerPoint oficial...');
  const pptx = new pptxgen();
  pptx.layout = 'LAYOUT_16x9'; // Formato panorámico 16:9
  pptx.author = 'Equipo FF - Salesland & Xiaomi';
  pptx.company = 'Salesland / Xiaomi';
  pptx.title = 'Guía de Uso de la Aplicación Horarios Equipo FF';

  // Helper para añadir fondo corporativo con barra superior e inferior
  function addBaseSlide(title, subtitle, category = 'GUÍA DE USUARIO') {
    const slide = pptx.addSlide();

    // Fondo degradado sutil
    slide.background = { color: 'F1F5F9' };

    // Barra superior decorativa
    slide.addShape(pptx.ShapeType.rect, {
      x: 0, y: 0, w: '100%', h: 1.15,
      fill: { color: COLORS.saleslandDark }
    });

    // Franja turquesa fina
    slide.addShape(pptx.ShapeType.rect, {
      x: 0, y: 1.15, w: '100%', h: 0.05,
      fill: { color: COLORS.saleslandTeal }
    });

    // Categoría / Módulo
    slide.addText(category.toUpperCase(), {
      x: 0.8, y: 0.18, w: 9.0, h: 0.25,
      fontSize: 10, fontFace: 'Plus Jakarta Sans', color: COLORS.saleslandCyan,
      bold: true, tracking: 2
    });

    // Título de la diapositiva
    slide.addText(title, {
      x: 0.8, y: 0.42, w: 9.5, h: 0.45,
      fontSize: 22, fontFace: 'Plus Jakarta Sans', color: COLORS.white,
      bold: true
    });

    // Subtítulo
    if (subtitle) {
      slide.addText(subtitle, {
        x: 0.8, y: 0.82, w: 9.5, h: 0.25,
        fontSize: 11, fontFace: 'Plus Jakarta Sans', color: 'CBD5E1'
      });
    }

    // Pie de página corporativo
    slide.addText('Horarios Equipo FF · Salesland & Xiaomi', {
      x: 0.8, y: 7.15, w: 6.0, h: 0.3,
      fontSize: 9, fontFace: 'Plus Jakarta Sans', color: COLORS.slateMuted
    });

    // Número de diapositiva
    slide.addText('Confidencial - Uso Interno', {
      x: 8.5, y: 7.15, w: 4.0, h: 0.3,
      fontSize: 9, fontFace: 'Plus Jakarta Sans', color: COLORS.slateMuted, align: 'right'
    });

    return slide;
  }

  // ==========================================
  // SLIDE 1: PORTADA
  // ==========================================
  const slide1 = pptx.addSlide();
  slide1.background = { color: COLORS.saleslandDeep };

  // Franja decorativa
  slide1.addShape(pptx.ShapeType.rect, {
    x: 0, y: 0, w: 0.35, h: '100%',
    fill: { color: COLORS.saleslandTeal }
  });

  // Insignia de co-branding
  slide1.addText('SALESLAND  |  XIAOMI', {
    x: 1.2, y: 1.6, w: 6.0, h: 0.4,
    fontSize: 14, fontFace: 'Plus Jakarta Sans', color: COLORS.saleslandCyan,
    bold: true, tracking: 3
  });

  // Título principal
  slide1.addText('Horarios Equipo FF', {
    x: 1.2, y: 2.1, w: 10.5, h: 1.2,
    fontSize: 44, fontFace: 'Plus Jakarta Sans', color: COLORS.white,
    bold: true
  });

  // Subtítulo
  slide1.addText('Manual Integral y Guía de Uso de la Aplicación', {
    x: 1.2, y: 3.3, w: 10.5, h: 0.5,
    fontSize: 22, fontFace: 'Plus Jakarta Sans', color: 'E2E8F0',
    bold: true
  });

  slide1.addText('Gestión, consulta, confirmación de turnos y supervisión de cobertura de centros', {
    x: 1.2, y: 3.85, w: 9.5, h: 0.4,
    fontSize: 13, fontFace: 'Plus Jakarta Sans', color: '94A3B8'
  });

  // Tarjeta de roles en portada
  slide1.addShape(pptx.ShapeType.rect, {
    x: 1.2, y: 4.7, w: 10.8, h: 1.8,
    fill: { color: '07303E' },
    line: { color: '00A2AC', width: 1 }
  });

  slide1.addText('PERFILES Y AUDIENCIA DE ESTA GUÍA', {
    x: 1.5, y: 4.85, w: 8.0, h: 0.3,
    fontSize: 11, fontFace: 'Plus Jakarta Sans', color: COLORS.saleslandCyan,
    bold: true
  });

  const rolesText = [
    { text: '• Promotores: ', options: { bold: true, color: COLORS.white } },
    { text: 'Consulta de cuadrante mensual/semanal, confirmación y balance de horas.\n', options: { color: 'CBD5E1' } },
    { text: '• GPV / Area Managers / Coordinadoras: ', options: { bold: true, color: COLORS.white } },
    { text: 'Supervisión de cobertura diaria y mensual de centros, cuadrantes y equipos.\n', options: { color: 'CBD5E1' } },
    { text: '• Administradora: ', options: { bold: true, color: COLORS.white } },
    { text: 'Visión global nacional, altas y gestión de usuarios del proyecto.', options: { color: 'CBD5E1' } }
  ];

  slide1.addText(rolesText, {
    x: 1.5, y: 5.2, w: 10.2, h: 1.15,
    fontSize: 11, fontFace: 'Plus Jakarta Sans'
  });


  // ==========================================
  // SLIDE 2: ÍNDICE DE CONTENIDOS
  // ==========================================
  const slide2 = addBaseSlide('Estructura y Contenidos de la Guía', 'Resumen de apartados y funcionalidades de la plataforma');

  const indiceItems = [
    { num: '01', title: 'Acceso y Autenticación', desc: 'Login corporativo oficial Salesland + Xiaomi y seguridad de credenciales.' },
    { num: '02', title: 'Panel de Inicio (Promotor)', desc: 'Dashboard de turnos, centro asignado y equipo de coordinación.' },
    { num: '03', title: 'Mi Horario - Vista Mensual', desc: 'Calendario mensual completo, simbología de turnos (mañana, tarde, partido).' },
    { num: '04', title: 'Mi Horario - Vista Semanal', desc: 'Cuadrante detallado día a día y confirmación oficial de recepción de horario.' },
    { num: '05', title: 'Control Horario', desc: 'Balance de horas planificadas vs horas contrato de cada trabajador.' },
    { num: '06', title: 'Inicio para Responsables', desc: 'Métricas de equipo, accesos de gestión y widget de Cobertura Hoy.' },
    { num: '07', title: 'Módulo Cobertura (Mensual)', desc: 'Supervisión de tiendas cubiertas/descubiertas, ratios y porcentajes diarios.' },
    { num: '08', title: 'Cobertura - Desglose Diario', desc: 'Detalle centro a centro y promotores que aportan cobertura efectiva.' },
    { num: '09', title: 'Mi Equipo (Cuadrantes)', desc: 'Vista global de horarios de todos los promotores por tienda y semana.' },
    { num: '10', title: 'Gestión de Usuarios', desc: 'Directorio de personal, roles, regiones y dependencias jerárquicas.' }
  ];

  indiceItems.forEach((item, idx) => {
    const col = idx < 5 ? 0 : 1;
    const row = idx % 5;
    const x = 0.8 + col * 6.0;
    const y = 1.5 + row * 1.05;

    slide2.addShape(pptx.ShapeType.rect, {
      x, y, w: 5.6, h: 0.95,
      fill: { color: COLORS.white },
      line: { color: 'E2E8F0', width: 1 }
    });

    slide2.addShape(pptx.ShapeType.rect, {
      x: x + 0.15, y: y + 0.15, w: 0.65, h: 0.65,
      fill: { color: COLORS.saleslandDark }
    });

    slide2.addText(item.num, {
      x: x + 0.15, y: y + 0.22, w: 0.65, h: 0.45,
      fontSize: 13, fontFace: 'Plus Jakarta Sans', color: COLORS.saleslandCyan,
      bold: true, align: 'center'
    });

    slide2.addText(item.title, {
      x: x + 0.95, y: y + 0.15, w: 4.4, h: 0.3,
      fontSize: 12, fontFace: 'Plus Jakarta Sans', color: COLORS.saleslandDark,
      bold: true
    });

    slide2.addText(item.desc, {
      x: x + 0.95, y: y + 0.45, w: 4.4, h: 0.45,
      fontSize: 9.5, fontFace: 'Plus Jakarta Sans', color: COLORS.slateMuted
    });
  });


  // ==========================================
  // HELPER PARA DIAPOSITIVAS DE CAPTURA + EXPLICACIÓN
  // ==========================================
  function addFeatureSlide(opts) {
    const slide = addBaseSlide(opts.title, opts.subtitle, opts.category || 'MÓDULO DE LA APLICACIÓN');

    // Imagen enmarcada estilo móvil
    if (fs.existsSync(opts.imgPath)) {
      slide.addShape(pptx.ShapeType.rect, {
        x: 0.8, y: 1.45, w: 3.4, h: 5.5,
        fill: { color: COLORS.white },
        line: { color: 'CBD5E1', width: 2 }
      });

      slide.addImage({
        path: opts.imgPath,
        x: 0.85, y: 1.5, w: 3.3, h: 5.4
      });
    }

    // Bloque derecho con explicaciones
    const xText = 4.5;
    const wText = 7.9;

    // Tarjeta de descripción
    slide.addShape(pptx.ShapeType.rect, {
      x: xText, y: 1.45, w: wText, h: 5.5,
      fill: { color: COLORS.white },
      line: { color: 'E2E8F0', width: 1 }
    });

    slide.addText('DESCRIPCIÓN Y FUNCIONALIDAD', {
      x: xText + 0.35, y: 1.65, w: wText - 0.7, h: 0.25,
      fontSize: 10, fontFace: 'Plus Jakarta Sans', color: COLORS.saleslandTeal,
      bold: true, tracking: 1.5
    });

    slide.addText(opts.mainDesc, {
      x: xText + 0.35, y: 1.95, w: wText - 0.7, h: 0.75,
      fontSize: 12, fontFace: 'Plus Jakarta Sans', color: COLORS.slateDark,
      lineSpacing: 18
    });

    // Puntos destacados
    slide.addText('PUNTOS CLAVE Y GUÍA PASO A PASO', {
      x: xText + 0.35, y: 2.85, w: wText - 0.7, h: 0.25,
      fontSize: 10, fontFace: 'Plus Jakarta Sans', color: COLORS.saleslandDark,
      bold: true, tracking: 1.5
    });

    const bullets = opts.points.map(pt => ({
      text: pt.title + ': ',
      options: { bold: true, color: COLORS.saleslandDark }
    }, {
      text: pt.desc + '\n\n',
      options: { color: COLORS.slateMuted }
    }));

    // Reensamblar bullets
    const bulletRuns = [];
    opts.points.forEach(pt => {
      bulletRuns.push({ text: '• ' + pt.title + ': ', options: { bold: true, color: COLORS.saleslandDark } });
      bulletRuns.push({ text: pt.desc + '\n\n', options: { color: '475569' } });
    });

    slide.addText(bulletRuns, {
      x: xText + 0.35, y: 3.15, w: wText - 0.7, h: 3.4,
      fontSize: 11, fontFace: 'Plus Jakarta Sans'
    });

    return slide;
  }


  // ==========================================
  // SLIDE 3: LOGIN
  // ==========================================
  addFeatureSlide({
    title: '1. Acceso y Autenticación Corporativa',
    subtitle: 'Entrada individualizada y segura para todos los roles',
    category: 'SEGURIDAD Y ACCESO',
    imgPath: path.join(SCREENSHOTS_DIR, '01_login.png'),
    mainDesc: 'La pantalla de inicio de sesión incorpora la identidad visual corporativa unificada de Salesland y Xiaomi. Garantiza que cada promotor o responsable acceda exclusivamente a la información y competencias que le corresponden.',
    points: [
      {
        title: 'Credenciales Corporativas',
        desc: 'Cada usuario debe introducir su correo corporativo @salesland.net y su contraseña configurada en la base de datos oficial.'
      },
      {
        title: 'Verificación de Contraseña',
        desc: 'El campo de contraseña incluye un icono interactivo de ojo para visualizar u ocultar los caracteres durante la escritura.'
      },
      {
        title: 'Eliminación de Accesos Demo',
        desc: 'No existen botones de acceso directo ni cuentas de prueba públicas, garantizando estricta privacidad.'
      },
      {
        title: 'Recuperación de Acceso',
        desc: 'En caso de olvido o bloqueo de credenciales, el usuario debe dirigirse a su responsable o administradora.'
      }
    ]
  });

  // ==========================================
  // SLIDE 4: INICIO PROMOTOR
  // ==========================================
  addFeatureSlide({
    title: '2. Panel de Inicio (Perfil Promotor)',
    subtitle: 'Resumen ejecutivo diario y organigrama de coordinación',
    category: 'PORTAL PROMOTOR',
    imgPath: path.join(SCREENSHOTS_DIR, '02_inicio_promotor.png'),
    mainDesc: 'Al iniciar sesión, el promotor encuentra un cuadro de mandos con toda la información crítica para su jornada diaria, incluyendo su próximo turno y los responsables a su cargo.',
    points: [
      {
        title: 'Mi Equipo de Coordinación',
        desc: 'Tarjetas con los nombres de su GPV, Area Manager, Coordinadora, Trainer y Administradora asignados en la hoja de usuarios.'
      },
      {
        title: 'Próximo Turno (Día Siguiente)',
        desc: 'Muestra automáticamente el horario programado para mañana, la tienda asignada y la etiqueta identificativa del turno.'
      },
      {
        title: 'Acceso a Control Horario',
        desc: 'Tarjeta de acceso directo para consultar el balance entre horas planificadas y horas estipuladas por contrato.'
      },
      {
        title: 'Navegación Móvil Rápida',
        desc: 'Barra inferior fija estilo App que permite saltar en un solo toque entre Inicio, Mi Horario y Control Horas.'
      }
    ]
  });

  // ==========================================
  // SLIDE 5: MI HORARIO - VISTA MENSUAL
  // ==========================================
  addFeatureSlide({
    title: '3. Mi Horario: Vista Mensual en Calendario',
    subtitle: 'Cuadrante completo del mes adaptado para móviles sin scroll vertical',
    category: 'PORTAL PROMOTOR',
    imgPath: path.join(SCREENSHOTS_DIR, '03_mi_horario_mensual.png'),
    mainDesc: 'Permite al promotor ver de un vistazo toda su planificación mensual de lunes a domingo. El diseño ha sido especialmente optimizado para teléfonos móviles, evitando desplazamientos verticales innecesarios.',
    points: [
      {
        title: 'Turnos Continuos (Mañanas y Tardes)',
        desc: 'Mostrados con hora de inicio y fin en dos líneas grandes y nítidas (ej. 09:00 - 17:00 / 13:00 - 21:00).'
      },
      {
        title: 'Turnos Partidos (Doble Franja)',
        desc: 'Mostrados con pastillas violetas perfectamente ajustadas con el horario matinal y vespertino (ej. 10:00-14:00 y 17:00-21:00).'
      },
      {
        title: 'Simbología de Ausencias y Especiales',
        desc: 'Pastillas diferenciadas en verde para Day off (descansos), naranja para Kickoff / Sábados calidad, azul para Festivos y rojo para Permisos/Bajas.'
      },
      {
        title: 'Navegación entre Meses',
        desc: 'Selector horizontal compacto para consultar meses pasados, el mes en curso y meses futuros.'
      }
    ]
  });

  // ==========================================
  // SLIDE 6: MI HORARIO - VISTA SEMANAL Y CONFIRMACIÓN
  // ==========================================
  addFeatureSlide({
    title: '4. Mi Horario: Vista Semanal y Confirmación',
    subtitle: 'Revisión detallada por día y registro oficial de confirmación',
    category: 'PORTAL PROMOTOR',
    imgPath: path.join(SCREENSHOTS_DIR, '04_mi_horario_semanal.png'),
    mainDesc: 'La vista semanal desglosa la semana activa día a día con el total de horas planificadas. Es el espacio reglamentario donde el promotor confirma que ha recibido y revisado su horario.',
    points: [
      {
        title: 'Selector de Semanas',
        desc: 'Pestañas superiores (Semana 45, 46, 47, 48...) con el rango de fechas exactas de lunes a domingo.'
      },
      {
        title: 'Botón "Confirmar Semana"',
        desc: 'Los promotores disponen de un botón destacado para confirmar la recepción del cuadrante.'
      },
      {
        title: 'Sincronización en la Nube',
        desc: 'La confirmación se envía a Google Sheets registrando fecha y hora, y se memoriza localmente en el dispositivo.'
      },
      {
        title: 'Suma de Horas Semanales',
        desc: 'Pie de cuadrante que calcula la suma total de horas ordinarias planificadas para la semana.'
      }
    ]
  });

  // ==========================================
  // SLIDE 7: CONTROL DE HORAS
  // ==========================================
  addFeatureSlide({
    title: '5. Control de Horas y Balance Mensual',
    subtitle: 'Seguimiento de horas planificadas frente al contrato laboral',
    category: 'GESTIÓN HORARIA',
    imgPath: path.join(SCREENSHOTS_DIR, '05_control_horas.png'),
    mainDesc: 'Este módulo permite tanto al promotor como a sus responsables llevar el cómputo riguroso de horas trabajadas para asegurar el cumplimiento del contrato y detectar desajustes.',
    points: [
      {
        title: 'Horas Planificadas vs Contrato',
        desc: 'Compara las horas de presencia asignadas en el mes con la jornada estipulada en el contrato de trabajo.'
      },
      {
        title: 'Balance Neto de Horas',
        desc: 'Cálculo automático de la diferencia (+X horas extras o de exceso / -Y horas pendientes de compensar).'
      },
      {
        title: 'Indicadores Visuales',
        desc: 'Iconos y colores que señalan si el trabajador está al día, en balance positivo o con déficit.'
      },
      {
        title: 'Selector de Mes Histórico',
        desc: 'Permite consultar el balance de cualquier mes del año para aclaraciones de nómina.'
      }
    ]
  });

  // ==========================================
  // SLIDE 8: INICIO RESPONSABLE
  // ==========================================
  addFeatureSlide({
    title: '6. Panel de Inicio para Responsables (AM / GPV / Coord)',
    subtitle: 'Supervisión en tiempo real del equipo y estado de Cobertura Hoy',
    category: 'MANDOS INTERMEDIOS',
    imgPath: path.join(SCREENSHOTS_DIR, '06_inicio_responsable.png'),
    mainDesc: 'Los perfiles de gestión disponen de un cuadro de mandos con visión integral sobre su zona, incluyendo el tamaño del equipo, cuadrantes de horas y el nuevo indicador de Cobertura Hoy.',
    points: [
      {
        title: 'Mi Equipo (Conteo Activo)',
        desc: 'Muestra el número total de promotores asignados directamente a ese mando (ej. 38 promotores).'
      },
      {
        title: 'Tarjeta "Cobertura Hoy"',
        desc: 'Informa al instante del porcentaje y cantidad de tiendas cubiertas en el día en curso (ej. 80% - 20/25 centros cubiertos).'
      },
      {
        title: 'Colores Dinámicos de Estado',
        desc: 'Verde (>=80%), naranja (>=50%) o rojo (<50%) según el nivel de cobertura logrado en la jornada actual.'
      },
      {
        title: 'Acceso Directo al Módulo Cobertura',
        desc: 'Al pulsar sobre la tarjeta se abre inmediatamente el calendario mensual de Cobertura.'
      }
    ]
  });

  // ==========================================
  // SLIDE 9: MÓDULO COBERTURA (MENSUAL)
  // ==========================================
  addFeatureSlide({
    title: '7. Módulo Cobertura: Calendario Mensual de Centros',
    subtitle: 'Control riguroso de presencia y apertura de tiendas día a día',
    category: 'SUPERVISIÓN DE COBERTURA',
    imgPath: path.join(SCREENSHOTS_DIR, '07_cobertura_mensual.png'),
    mainDesc: 'Sustituye al antiguo control de equipo por un potente panel de Cobertura de Centros. Analiza día a día si cada tienda asignada dispone de presencia comercial o queda desatendida.',
    points: [
      {
        title: 'Regla de Cobertura Efectiva',
        desc: 'Una tienda está CUBIERTA si al menos uno de sus promotores asignados tiene un horario laboral ese día.'
      },
      {
        title: 'Regla para Tiendas con 2 Promotores',
        desc: 'Si ambos tienen Day off -> Sin Cobertura. Si uno libra pero el otro trabaja -> TIENDA CUBIERTA.'
      },
      {
        title: 'Porcentaje y Ratios Numéricos',
        desc: 'Cada casilla del mes muestra el porcentaje alcanzado y el ratio exacto (ej. 75% - 14/15 centros).'
      },
      {
        title: 'Filtros Avanzados por Región y Tienda',
        desc: 'Permite aislar una región concreta (ej. Northeast) o una tienda para comprobar su presencia todo el mes.'
      }
    ]
  });

  // ==========================================
  // SLIDE 10: COBERTURA - DESGLOSE DIARIO
  // ==========================================
  addFeatureSlide({
    title: '8. Cobertura: Desglose Detallado por Día y Tienda',
    subtitle: 'Auditoría individual centro a centro con los horarios de cada promotor',
    category: 'SUPERVISIÓN DE COBERTURA',
    imgPath: path.join(SCREENSHOTS_DIR, '08_cobertura_detalle.png'),
    mainDesc: 'Al pulsar sobre cualquier día del calendario mensual, la aplicación despliega el análisis pormenorizado de todas las tiendas para ese día concreto.',
    points: [
      {
        title: 'Estado del Centro (Cubierto vs Sin Cobertura)',
        desc: 'Etiqueta clara con borde verde o rojo indicando si la tienda tuvo presencia o quedó vacía.'
      },
      {
        title: 'Promotores y Turnos Asignados',
        desc: 'Lista todos los promotores vinculados a esa tienda y el horario específico de cada uno (ej. 15:00-21:00 vs DAY OFF).'
      },
      {
        title: 'Pestañas de Filtrado Rápido',
        desc: 'Filtre en un clic para ver "Todos los centros", solo los "Cubiertos" o solo los "Sin Cobertura" para tomar acciones correctivas.'
      },
      {
        title: 'Buscador de Centro / Promotor',
        desc: 'Caja de búsqueda rápida para localizar una tienda en segundos sin necesidad de recorrer la lista.'
      }
    ]
  });

  // ==========================================
  // SLIDE 11: MI EQUIPO (CUADRANTES SEMANALES)
  // ==========================================
  addFeatureSlide({
    title: '9. Módulo "Mi Equipo": Cuadrantes y Tiendas',
    subtitle: 'Visualización y seguimiento de horarios de todo el personal',
    category: 'GESTIÓN DE EQUIPOS',
    imgPath: path.join(SCREENSHOTS_DIR, '09_mi_equipo.png'),
    mainDesc: 'Este módulo permite a los mandos supervisar los horarios de todos los promotores organizados por centro de trabajo y semana de planificación.',
    points: [
      {
        title: 'Agrupación por Tienda',
        desc: 'Los promotores aparecen organizados bajo su centro asignado para facilitar la supervisión de la tienda.'
      },
      {
        title: 'Detalle de los 7 Días de la Semana',
        desc: 'Despliega de lunes a domingo las horas y turnos de cada promotor con iconos de mañana, tarde o partido.'
      },
      {
        title: 'Filtro de Semanas y Meses',
        desc: 'Posibilidad de seleccionar cualquier semana del mes para auditar la evolución de los turnos.'
      },
      {
        title: 'Buscador de Promotores',
        desc: 'Encuentre inmediatamente a cualquier promotor por nombre o por centro de venta.'
      }
    ]
  });

  // ==========================================
  // SLIDE 12: GESTIÓN DE USUARIOS
  // ==========================================
  addFeatureSlide({
    title: '10. Gestión de Usuarios y Jerarquías (Admin / AM)',
    subtitle: 'Directorio de personal, asignación de centros y estructura organizativa',
    category: 'ADMINISTRACIÓN Y ROLES',
    imgPath: path.join(SCREENSHOTS_DIR, '10_gestion_usuarios.png'),
    mainDesc: 'Disponible para perfiles de administración y Area Managers para consultar, auditar y mantener actualizada la base de usuarios y la jerarquía de mandos.',
    points: [
      {
        title: 'Directorio Completo de Usuarios',
        desc: 'Listado con los 178 usuarios del proyecto, mostrando nombre, email @salesland.net, rol y región.'
      },
      {
        title: 'Asignación de Tienda y Región',
        desc: 'Identificación rápida del centro de trabajo y la región comercial asociada a cada promotor.'
      },
      {
        title: 'Estructura de Coordinación',
        desc: 'Refleja la cadena de mando completa: GPV, Area Manager, Coordinadora, Trainer y Administradora.'
      },
      {
        title: 'Control de Roles del Sistema',
        desc: 'Diferencia claramente los roles de Promotor, GPV, AM, Coordinadora, Trainer y Administradora.'
      }
    ]
  });

  // ==========================================
  // SLIDE 13: RESUMEN DE NORMAS Y FAQ
  // ==========================================
  const slide13 = addBaseSlide('Normas Operativas y Preguntas Frecuentes', 'Buenas prácticas y resolución de incidencias comunes', 'SOPORTE Y NORMAS');

  const faqs = [
    {
      q: '¿Cuándo debe confirmar el horario el promotor?',
      a: 'Cada promotor debe entrar semanalmente en "Mi Horario" > vista "Semanal" y pulsar en "Confirmar semana" tras revisar sus turnos.'
    },
    {
      q: '¿Qué cuenta como Cobertura en un centro?',
      a: 'Cualquier turno con horario numérico (mañana, tarde o partido). Días libres (Day off), descansos, bajas o kickoff no aportan cobertura.'
    },
    {
      q: '¿Qué ocurre si hay 2 promotores en la misma tienda?',
      a: 'Basta con que uno de los dos trabaje ese día para que el centro compute como cubierto al 100% en las métricas de la zona.'
    },
    {
      q: '¿Cómo se actualizan los datos de horarios y usuarios?',
      a: 'La aplicación está conectada en tiempo real con Google Sheets. Cualquier cambio realizado por los administradores se refleja en la app.'
    },
    {
      q: '¿Cómo instalar la app en el teléfono móvil?',
      a: 'Abra el enlace en Chrome (Android) o Safari (iOS) y seleccione "Añadir a la pantalla de inicio" para tenerla como App nativa.'
    }
  ];

  faqs.forEach((faq, idx) => {
    const y = 1.45 + idx * 1.08;

    slide13.addShape(pptx.ShapeType.rect, {
      x: 0.8, y, w: 11.6, h: 0.95,
      fill: { color: COLORS.white },
      line: { color: 'E2E8F0', width: 1 }
    });

    slide13.addText(`Q: ${faq.q}`, {
      x: 1.0, y: y + 0.12, w: 11.2, h: 0.3,
      fontSize: 11.5, fontFace: 'Plus Jakarta Sans', color: COLORS.saleslandDark,
      bold: true
    });

    slide13.addText(`A: ${faq.a}`, {
      x: 1.0, y: y + 0.42, w: 11.2, h: 0.45,
      fontSize: 10, fontFace: 'Plus Jakarta Sans', color: '475569'
    });
  });

  // Guardar presentación
  await pptx.writeFile({ fileName: OUTPUT_PPTX });
  console.log('✅ Presentación PowerPoint guardada con éxito en:', OUTPUT_PPTX);
}

generatePresentation().catch(console.error);
