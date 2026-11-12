import pptxgen from 'pptxgenjs';
import path from 'path';
import fs from 'fs';

const SCREENSHOTS_DIR = path.resolve('public/screenshots_guia');
const OUTPUT_PPTX = path.resolve('Guia_de_Uso_Horarios_Equipo_FF.pptx');

// Paleta de colores corporativos Salesland + Xiaomi
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
  cardBg: 'FFFFFF',
  cardBorder: 'E2E8F0',
  successGreen: '10B981',
  dangerRed: 'EF4444'
};

async function generatePromoterPresentation() {
  console.log('📊 Generando Guía de Uso oficial de Promotores en formato PowerPoint (16:9 Panorámica Widescreen)...');
  const pptx = new pptxgen();

  // Widescreen 16:9 estándar moderno: 13.333 x 7.5 pulgadas (33.87 cm x 19.05 cm)
  pptx.layout = 'LAYOUT_WIDE';
  pptx.author = 'Equipo FF - Salesland & Xiaomi';
  pptx.company = 'Salesland / Xiaomi';
  pptx.title = 'Guía de Uso para Promotores - Horarios Equipo FF';

  // Helper para diapositivas base corporativas con dimensiones exactas
  function addBaseSlide(title, subtitle, category = 'MANUAL DEL PROMOTOR') {
    const slide = pptx.addSlide();

    // Fondo gris claro ultra sutil
    slide.background = { color: 'F8FAFC' };

    // Barra superior corporativa Salesland
    slide.addShape(pptx.ShapeType.rect, {
      x: 0, y: 0, w: '100%', h: 1.15,
      fill: { color: COLORS.saleslandDark }
    });

    // Franja turquesa fina
    slide.addShape(pptx.ShapeType.rect, {
      x: 0, y: 1.15, w: '100%', h: 0.05,
      fill: { color: COLORS.saleslandTeal }
    });

    // Categoría superior
    slide.addText(category.toUpperCase(), {
      x: 0.8, y: 0.16, w: 9.5, h: 0.22,
      fontSize: 9.5, fontFace: 'Plus Jakarta Sans', color: COLORS.saleslandCyan,
      bold: true, tracking: 1.5
    });

    // Título de la diapositiva
    slide.addText(title, {
      x: 0.8, y: 0.38, w: 9.5, h: 0.42,
      fontSize: 20, fontFace: 'Plus Jakarta Sans', color: COLORS.white,
      bold: true
    });

    // Subtítulo
    if (subtitle) {
      slide.addText(subtitle, {
        x: 0.8, y: 0.78, w: 9.5, h: 0.28,
        fontSize: 10.5, fontFace: 'Plus Jakarta Sans', color: 'CBD5E1'
      });
    }

    // Co-branding esquina superior derecha
    slide.addShape(pptx.ShapeType.rect, {
      x: 10.7, y: 0.3, w: 1.85, h: 0.52,
      fill: { color: '063B48' },
      line: { color: COLORS.saleslandTeal, width: 1 }
    });
    slide.addText('SALESLAND  |  MI', {
      x: 10.7, y: 0.32, w: 1.85, h: 0.48,
      fontSize: 9, fontFace: 'Plus Jakarta Sans', color: COLORS.white,
      bold: true, align: 'center', valign: 'middle'
    });

    // Pie de página corporativo (completamente dentro del canvas 7.5")
    slide.addText('Horarios Equipo FF · Manual de Uso del Promotor · Salesland & Xiaomi', {
      x: 0.8, y: 6.85, w: 7.0, h: 0.3,
      fontSize: 9, fontFace: 'Plus Jakarta Sans', color: COLORS.slateMuted
    });

    slide.addText('Uso Interno · Confidencial', {
      x: 8.5, y: 6.85, w: 4.0, h: 0.3,
      fontSize: 9, fontFace: 'Plus Jakarta Sans', color: COLORS.slateMuted, align: 'right'
    });

    return slide;
  }

  // Helper para diapositivas con captura móvil + tarjeta explicativa
  function addFeatureSlide(opts) {
    const slide = addBaseSlide(opts.title, opts.subtitle, opts.category || 'MÓDULO DE LA APP');

    const frameX = 0.8;
    const frameY = 1.35;
    const frameW = 2.85;
    const frameH = 5.25;

    // Tarjeta marco para el móvil
    slide.addShape(pptx.ShapeType.roundRect, {
      x: frameX, y: frameY, w: frameW, h: frameH,
      fill: { color: 'FFFFFF' },
      line: { color: 'CBD5E1', width: 1.5 }
    });

    // Imagen centrada en el marco móvil
    if (fs.existsSync(opts.imgPath)) {
      // Dimensiones proporcionales para ratio 824x1830 (1:2.22)
      const imgH = 5.0;
      const imgW = 2.25;
      const imgX = frameX + (frameW - imgW) / 2;
      const imgY = frameY + (frameH - imgH) / 2;

      slide.addImage({
        path: opts.imgPath,
        x: imgX, y: imgY, w: imgW, h: imgH
      });
    }

    // Tarjeta explicativa derecha (ajustada exactamente para no salirse)
    const cardX = 3.9;
    const cardY = 1.35;
    const cardW = 8.6;
    const cardH = 5.25;

    slide.addShape(pptx.ShapeType.roundRect, {
      x: cardX, y: cardY, w: cardW, h: cardH,
      fill: { color: 'FFFFFF' },
      line: { color: COLORS.cardBorder, width: 1 }
    });

    // Etiqueta sección
    slide.addText('DESCRIPCIÓN Y OBJETIVO', {
      x: cardX + 0.4, y: cardY + 0.25, w: cardW - 0.8, h: 0.22,
      fontSize: 10, fontFace: 'Plus Jakarta Sans', color: COLORS.saleslandTeal,
      bold: true, tracking: 1.5
    });

    // Párrafo principal
    slide.addText(opts.mainDesc, {
      x: cardX + 0.4, y: cardY + 0.52, w: cardW - 0.8, h: 0.7,
      fontSize: 12, fontFace: 'Plus Jakarta Sans', color: COLORS.slateDark,
      lineSpacing: 18
    });

    // Línea separadora
    slide.addShape(pptx.ShapeType.line, {
      x: cardX + 0.4, y: cardY + 1.35, w: cardW - 0.8, h: 0,
      line: { color: 'E2E8F0', width: 1 }
    });

    // Etiqueta puntos clave
    slide.addText('PASO A PASO Y FUNCIONALIDADES CLAVE', {
      x: cardX + 0.4, y: cardY + 1.48, w: cardW - 0.8, h: 0.22,
      fontSize: 10, fontFace: 'Plus Jakarta Sans', color: COLORS.saleslandDark,
      bold: true, tracking: 1.5
    });

    // Bullets de funcionalidad
    const bulletRuns = [];
    opts.points.forEach(pt => {
      bulletRuns.push({ text: '• ' + pt.title + ': ', options: { bold: true, color: COLORS.saleslandDark } });
      bulletRuns.push({ text: pt.desc + '\n\n', options: { color: '475569' } });
    });

    slide.addText(bulletRuns, {
      x: cardX + 0.4, y: cardY + 1.8, w: cardW - 0.8, h: 3.25,
      fontSize: 11, fontFace: 'Plus Jakarta Sans',
      lineSpacing: 16
    });

    return slide;
  }

  // ==========================================
  // SLIDE 1: PORTADA OFICIAL (PROMOTORES)
  // ==========================================
  const slide1 = pptx.addSlide();
  slide1.background = { color: COLORS.saleslandDeep };

  // Franja decorativa izquierda
  slide1.addShape(pptx.ShapeType.rect, {
    x: 0, y: 0, w: 0.35, h: '100%',
    fill: { color: COLORS.saleslandTeal }
  });

  // Insignia corporativa
  slide1.addText('SALESLAND  |  XIAOMI', {
    x: 1.2, y: 1.2, w: 6.0, h: 0.35,
    fontSize: 13, fontFace: 'Plus Jakarta Sans', color: COLORS.saleslandCyan,
    bold: true, tracking: 2
  });

  // Título principal
  slide1.addText('Horarios Equipo FF', {
    x: 1.2, y: 1.6, w: 10.8, h: 1.0,
    fontSize: 42, fontFace: 'Plus Jakarta Sans', color: COLORS.white,
    bold: true
  });

  // Subtítulo para Promotores
  slide1.addText('Manual de Uso y Consulta de Turnos · Perfil Promotor', {
    x: 1.2, y: 2.65, w: 10.8, h: 0.5,
    fontSize: 21, fontFace: 'Plus Jakarta Sans', color: 'E2E8F0',
    bold: true
  });

  slide1.addText('Tu cuadrante mensual y semanal siempre a mano, confirmación obligatoria de turnos y control de horas', {
    x: 1.2, y: 3.2, w: 10.5, h: 0.4,
    fontSize: 13, fontFace: 'Plus Jakarta Sans', color: '94A3B8'
  });

  // Tarjeta resumen de funciones para el promotor
  slide1.addShape(pptx.ShapeType.roundRect, {
    x: 1.2, y: 3.85, w: 10.8, h: 2.7,
    fill: { color: '07303E' },
    line: { color: COLORS.saleslandTeal, width: 1.5 }
  });

  slide1.addText('QUÉ PUEDES HACER COMO PROMOTOR EN LA APLICACIÓN', {
    x: 1.5, y: 4.05, w: 10.0, h: 0.28,
    fontSize: 11, fontFace: 'Plus Jakarta Sans', color: COLORS.saleslandCyan,
    bold: true
  });

  const promotorFeatures = [
    { text: '• Próximo Turno Inmediato: ', options: { bold: true, color: COLORS.white } },
    { text: 'Consulta el horario exacto del día siguiente en tu pantalla de inicio para planificarte.\n', options: { color: 'CBD5E1' } },
    { text: '• Cuadrante Mensual sin Scroll: ', options: { bold: true, color: COLORS.white } },
    { text: 'Visualiza todo el mes de un vistazo, con turnos partidos claros y días libres (DAY OFF).\n', options: { color: 'CBD5E1' } },
    { text: '• Confirmación Semanal Obligatoria: ', options: { bold: true, color: COLORS.white } },
    { text: 'Acuse de recibo de tus horarios pulsando "Confirmar semana" para validar tu recepción.\n', options: { color: 'CBD5E1' } },
    { text: '• Control de Horas: ', options: { bold: true, color: COLORS.white } },
    { text: 'Seguimiento mensual de horas de contrato vs. horas planificadas y balance acumulado.\n', options: { color: 'CBD5E1' } },
    { text: '• Contacto Directo: ', options: { bold: true, color: COLORS.white } },
    { text: 'Identificación directa de tu administradora de referencia para resolver cualquier duda o gestión.', options: { color: 'CBD5E1' } }
  ];

  slide1.addText(promotorFeatures, {
    x: 1.5, y: 4.42, w: 10.2, h: 1.95,
    fontSize: 11, fontFace: 'Plus Jakarta Sans',
    lineSpacing: 15
  });

  // ==========================================
  // SLIDE 2: ÍNDICE DE CONTENIDOS DEL PROMOTOR
  // ==========================================
  const slide2 = addBaseSlide('Estructura de la Guía del Promotor', 'Apartados clave para el uso diario de la aplicación');

  const indicePromotor = [
    { num: '01', title: 'Acceso a la App (Login)', desc: 'Inicio de sesión con correo oficial Salesland y seguridad de acceso.' },
    { num: '02', title: 'Pantalla de Inicio', desc: 'Próximo turno del día siguiente y datos de la administradora asignada.' },
    { num: '03', title: 'Cuadrante Mensual', desc: 'Visualización compacta mensual sin scroll, turnos partidos y libranzas.' },
    { num: '04', title: 'Vista Semanal y Confirmación', desc: 'Detalle día a día y acuse de recibo con el botón "Confirmar semana".' },
    { num: '05', title: 'Control Horario Mensual', desc: 'Balance de horas de contrato vs. horas planificadas del mes.' },
    { num: '06', title: 'Preguntas Frecuentes y Pautas', desc: 'Buenas prácticas, plazos de confirmación y comunicación de incidencias.' }
  ];

  // Grid 3 columnas x 2 filas
  const colW = 3.75;
  const colGap = 0.35;
  const rowH = 2.25;
  const rowGap = 0.35;
  const startX = 0.8;
  const startY = 1.45;

  indicePromotor.forEach((item, idx) => {
    const col = idx % 3;
    const row = Math.floor(idx / 3);
    const x = startX + col * (colW + colGap);
    const y = startY + row * (rowH + rowGap);

    slide2.addShape(pptx.ShapeType.roundRect, {
      x, y, w: colW, h: rowH,
      fill: { color: 'FFFFFF' },
      line: { color: COLORS.cardBorder, width: 1 }
    });

    // Número
    slide2.addShape(pptx.ShapeType.rect, {
      x: x + 0.3, y: y + 0.3, w: 0.65, h: 0.45,
      fill: { color: 'F1F5F9' },
      line: { color: COLORS.saleslandTeal, width: 1 }
    });

    slide2.addText(item.num, {
      x: x + 0.3, y: y + 0.3, w: 0.65, h: 0.45,
      fontSize: 14, fontFace: 'Plus Jakarta Sans', color: COLORS.saleslandDark,
      bold: true, align: 'center', valign: 'middle'
    });

    // Título
    slide2.addText(item.title, {
      x: x + 1.1, y: y + 0.3, w: colW - 1.35, h: 0.45,
      fontSize: 13, fontFace: 'Plus Jakarta Sans', color: COLORS.saleslandDark,
      bold: true, valign: 'middle'
    });

    // Descripción
    slide2.addText(item.desc, {
      x: x + 0.3, y: y + 0.95, w: colW - 0.6, h: 1.05,
      fontSize: 11, fontFace: 'Plus Jakarta Sans', color: COLORS.slateMuted,
      lineSpacing: 15
    });
  });

  // ==========================================
  // SLIDE 3: LOGIN CORPORATIVO
  // ==========================================
  addFeatureSlide({
    category: 'MÓDULO 01 · ACCESO',
    title: 'Acceso a la Aplicación (Login)',
    subtitle: 'Inicio de sesión con cuenta corporativa Salesland y entorno seguro',
    imgPath: path.join(SCREENSHOTS_DIR, '01_login.png'),
    mainDesc: 'Accede a la plataforma utilizando tu cuenta corporativa oficial de Salesland. La pantalla cuenta con diseño corporativo unificado y altos estándares de privacidad.',
    points: [
      {
        title: 'Usuario Corporativo',
        desc: 'Introduce tu dirección de correo electrónico corporativo oficial (@salesland.net).'
      },
      {
        title: 'Contraseña y Verificación',
        desc: 'Escribe tu contraseña. Puedes pulsar el icono del ojo para comprobar que no haya errores de tipografía antes de pulsar "Comenzar".'
      },
      {
        title: 'Sin Accesos Demo (Seguridad Total)',
        desc: 'Se han eliminado los accesos rápidos de prueba. Cada promotor accede exclusivamente a su propio perfil garantizando la confidencialidad de datos.'
      },
      {
        title: 'Recuperación y Soporte',
        desc: 'Si no recuerdas tus claves o tienes problemas de conexión, contacta con tu administradora asignada para restaurar el acceso.'
      }
    ]
  });

  // ==========================================
  // SLIDE 4: PANTALLA DE INICIO (PROMOTOR)
  // ==========================================
  addFeatureSlide({
    category: 'MÓDULO 02 · PANEL PRINCIPAL',
    title: 'Pantalla de Inicio y Próximo Turno',
    subtitle: 'Tu resumen diario nada más entrar en la aplicación',
    imgPath: path.join(SCREENSHOTS_DIR, '02_inicio_promotor.png'),
    mainDesc: 'El menú de Inicio está optimizado para darte la información imprescindible en un segundo: qué turno tienes mañana y quién es tu administradora de contacto.',
    points: [
      {
        title: 'Tarjeta de Próximo Turno',
        desc: 'Muestra siempre tu horario del día siguiente (o el siguiente día laborable si mañana libras), permitiéndote organizar tu jornada con total antelación.'
      },
      {
        title: 'Administradora Asignada',
        desc: 'Aparece visible el nombre de tu administradora de referencia para cualquier trámite, gestión de cuadrantes o envío de justificantes.'
      },
      {
        title: 'Punto de Venta Asignado',
        desc: 'Verifica tu centro de trabajo principal y consulta rápidamente tus turnos semanales.'
      },
      {
        title: 'Accesos Directos',
        desc: 'Accede con un solo toque a "Mi Horario" para ver el calendario completo o a "Control Horas" para revisar tu jornada acumulada.'
      }
    ]
  });

  // ==========================================
  // SLIDE 5: MI HORARIO - MENSUAL
  // ==========================================
  addFeatureSlide({
    category: 'MÓDULO 03 · PLANIFICACIÓN MENSUAL',
    title: 'Mi Horario: Cuadrante Mensual',
    subtitle: 'Vista de todo el mes sin scroll vertical y con turnos claros',
    imgPath: path.join(SCREENSHOTS_DIR, '03_mi_horario_mensual.png'),
    mainDesc: 'La vista mensual ha sido diseñada para encajar en la pantalla sin necesidad de scroll vertical, mostrando cada día con su turno correspondiente y código de colores.',
    points: [
      {
        title: 'Visualización sin Scroll Vertical',
        desc: 'Todo el calendario del mes se presenta ajustado a la pantalla de tu móvil para una lectura rápida y sin desplazamientos innecesarios.'
      },
      {
        title: 'Turnos Partidos Legibles',
        desc: 'Los turnos partidos se muestran en dos líneas claras (ejemplo: 10:00-14:00 / 17:00-21:00) evitando que los horarios queden cortados.'
      },
      {
        title: 'Código Oficial de Colores',
        desc: 'Verde para días libres (DAY OFF), naranja para eventos o KICKOFF, y tonos morados/azules para turnos continuos o partidos de trabajo.'
      },
      {
        title: 'Navegación entre Meses',
        desc: 'Utiliza las flechas en la barra de mes para consultar cuadrantes de meses anteriores o anticipar la planificación del mes siguiente.'
      }
    ]
  });

  // ==========================================
  // SLIDE 6: MI HORARIO - SEMANAL Y CONFIRMACIÓN
  // ==========================================
  addFeatureSlide({
    category: 'MÓDULO 04 · CONFIRMACIÓN OBLIGATORIA',
    title: 'Mi Horario: Vista Semanal y Confirmación',
    subtitle: 'Revisión día a día y acuse de recibo de turnos',
    imgPath: path.join(SCREENSHOTS_DIR, '04_mi_horario_semanal.png'),
    mainDesc: 'Para confirmar oficialmente que has recibido tu horario, debes cambiar a la vista "Semanal". Este proceso es obligatorio para dar trazabilidad a la coordinación.',
    points: [
      {
        title: 'Cambio a Vista Semanal',
        desc: 'En el selector horizontal superior pulsa sobre "Semanal". Podrás revisar tu semana desglosada día por día de lunes a domingo.'
      },
      {
        title: 'Botón "Confirmar Semana"',
        desc: 'En la parte inferior del cuadrante semanal encontrarás el botón destacado para confirmar la semana visualizada.'
      },
      {
        title: 'Acuse de Recibo y Trazabilidad',
        desc: 'Al pulsar el botón, el sistema registra la fecha y hora de tu confirmación, notificando a coordinación que estás conforme con los turnos.'
      },
      {
        title: 'Confirmación por Semanas',
        desc: 'Cada semana se revisa y confirma individualmente mediante los selectores de avance de semana.'
      }
    ]
  });

  // ==========================================
  // SLIDE 7: CONTROL DE HORAS
  // ==========================================
  addFeatureSlide({
    category: 'MÓDULO 05 · SEGUIMIENTO DE JORNADA',
    title: 'Control de Horas del Mes',
    subtitle: 'Transparencia total en el balance entre horas planificadas y contrato',
    imgPath: path.join(SCREENSHOTS_DIR, '05_control_horas.png'),
    mainDesc: 'Este apartado te permite verificar que las horas asignadas en tu cuadrante se corresponden exactamente con las horas estipuladas en tu contrato laboral.',
    points: [
      {
        title: 'Horas de Contrato',
        desc: 'Total de horas estipuladas para el mes según tu tipo de jornada laboral (por ejemplo, 40h semanales).'
      },
      {
        title: 'Horas Planificadas',
        desc: 'Suma de todas las horas correspondientes a los turnos que tienes asignados a lo largo del mes en curso.'
      },
      {
        title: 'Balance y Diferencia de Jornada',
        desc: 'Indica de forma gráfica si existe un saldo a favor (exceso de horas) o saldo a recuperar, facilitando el control antes del cierre del mes.'
      },
      {
        title: 'Autocontrol del Promotor',
        desc: 'Te da autonomía y visibilidad para detectar cualquier desfase y consultarlo a tiempo con tu administradora.'
      }
    ]
  });

  // ==========================================
  // SLIDE 8: PREGUNTAS FRECUENTES (FAQ PROMOTORES)
  // ==========================================
  const slide8 = addBaseSlide('Preguntas Frecuentes y Pautas Operativas', 'Respuestas rápidas para el día a día en tienda');

  const faqs = [
    {
      q: '¿Cuándo debo confirmar mi horario semanal?',
      a: 'Debes confirmarlo en la vista "Semanal" en cuanto se publique el cuadrante o cuando recibas el aviso de tu coordinadora o administradora.'
    },
    {
      q: '¿Qué hago si hay un error en mi turno o necesito un cambio?',
      a: 'Contacta de inmediato con tu administradora asignada (cuyo nombre ves en la pantalla de Inicio). Los cambios deben ser aprobados previamente.'
    },
    {
      q: '¿Cómo distingo mis días libres y eventos en el calendario?',
      a: 'Los días libres aparecen señalizados en color verde claro con la etiqueta DAY OFF. Los eventos especiales o reuniones de equipo aparecen como KICKOFF en naranja.'
    },
    {
      q: '¿Cómo sé si he trabajado más o menos horas de las debidas?',
      a: 'En la sección "Control Horas" verás la comparativa exacta entre tus horas de contrato y las horas planificadas, con el saldo resultante del mes.'
    }
  ];

  const faqW = 5.65;
  const faqH = 2.45;
  const faqGapX = 0.45;
  const faqGapY = 0.35;
  const faqStartX = 0.8;
  const faqStartY = 1.45;

  faqs.forEach((faq, idx) => {
    const col = idx % 2;
    const row = Math.floor(idx / 2);
    const x = faqStartX + col * (faqW + faqGapX);
    const y = faqStartY + row * (faqH + faqGapY);

    slide8.addShape(pptx.ShapeType.roundRect, {
      x, y, w: faqW, h: faqH,
      fill: { color: 'FFFFFF' },
      line: { color: COLORS.cardBorder, width: 1 }
    });

    // Pregunta
    slide8.addText(`Q: ${faq.q}`, {
      x: x + 0.35, y: y + 0.3, w: faqW - 0.7, h: 0.5,
      fontSize: 12.5, fontFace: 'Plus Jakarta Sans', color: COLORS.saleslandDark,
      bold: true
    });

    // Respuesta
    slide8.addText(faq.a, {
      x: x + 0.35, y: y + 0.85, w: faqW - 0.7, h: 1.35,
      fontSize: 11, fontFace: 'Plus Jakarta Sans', color: '475569',
      lineSpacing: 16
    });
  });

  // ==========================================
  // SLIDE 9: BUENAS PRÁCTICAS Y SOPORTE
  // ==========================================
  const slide9 = addBaseSlide('Buenas Prácticas y Soporte al Promotor', 'Normas operativas para el correcto funcionamiento del equipo');

  // Tarjeta de Buenas Prácticas
  slide9.addShape(pptx.ShapeType.roundRect, {
    x: 0.8, y: 1.45, w: 7.2, h: 5.15,
    fill: { color: 'FFFFFF' },
    line: { color: COLORS.cardBorder, width: 1 }
  });

  slide9.addText('DECÁLOGO DE BUENAS PRÁCTICAS DEL PROMOTOR', {
    x: 1.15, y: 1.75, w: 6.5, h: 0.25,
    fontSize: 11, fontFace: 'Plus Jakarta Sans', color: COLORS.saleslandTeal,
    bold: true
  });

  const buenasPracticas = [
    { text: '1. Revisa tu próximo turno a diario: ', options: { bold: true, color: COLORS.saleslandDark } },
    { text: 'Consulta el menú Inicio al finalizar tu jornada para verificar el horario del día siguiente.\n\n', options: { color: '475569' } },
    { text: '2. Confirma semanalmente tus turnos: ', options: { bold: true, color: COLORS.saleslandDark } },
    { text: 'No olvides pulsar "Confirmar semana" en la vista semanal para registrar tu recepción.\n\n', options: { color: '475569' } },
    { text: '3. Controla tu balance de horas: ', options: { bold: true, color: COLORS.saleslandDark } },
    { text: 'Revisa periódicamente la pestaña "Control Horas" para asegurar que tu balance mensual es el correcto.\n\n', options: { color: '475569' } },
    { text: '4. Comunicación temprana de imprevistos: ', options: { bold: true, color: COLORS.saleslandDark } },
    { text: 'Cualquier baja, permiso o justificación debe comunicarse a tu administradora con la máxima antelación posible.', options: { color: '475569' } }
  ];

  slide9.addText(buenasPracticas, {
    x: 1.15, y: 2.15, w: 6.5, h: 4.15,
    fontSize: 11, fontFace: 'Plus Jakarta Sans',
    lineSpacing: 15
  });

  // Tarjeta derecha: Canales de contacto
  slide9.addShape(pptx.ShapeType.roundRect, {
    x: 8.3, y: 1.45, w: 4.25, h: 5.15,
    fill: { color: COLORS.saleslandDark },
    line: { color: COLORS.saleslandTeal, width: 1.5 }
  });

  slide9.addText('CANALES DE CONTACTO', {
    x: 8.6, y: 1.8, w: 3.65, h: 0.28,
    fontSize: 12, fontFace: 'Plus Jakarta Sans', color: COLORS.saleslandCyan,
    bold: true
  });

  const contactosText = [
    { text: 'Tu Administradora Asignada:\n', options: { bold: true, color: COLORS.white } },
    { text: 'Consulta su nombre en la pantalla de Inicio de tu app para contactar con ella por los canales habituales de la cuenta.\n\n', options: { color: 'CBD5E1' } },
    { text: 'Coordinación de Zona:\n', options: { bold: true, color: COLORS.white } },
    { text: 'Para consultas operativas en el punto de venta o cambios de turnos coordinados.\n\n', options: { color: 'CBD5E1' } },
    { text: 'Soporte Técnico:\n', options: { bold: true, color: COLORS.white } },
    { text: 'Si experimentas problemas técnicos o de inicio de sesión con tu correo @salesland.net, notifícalo a tu responsable directo.', options: { color: 'CBD5E1' } }
  ];

  slide9.addText(contactosText, {
    x: 8.6, y: 2.25, w: 3.65, h: 4.0,
    fontSize: 11, fontFace: 'Plus Jakarta Sans',
    lineSpacing: 16
  });

  // Guardar archivo
  await pptx.writeFile({ fileName: OUTPUT_PPTX });
  console.log(`✅ Guía de Uso del Promotor generada exitosamente en:\n${OUTPUT_PPTX}`);
}

generatePromoterPresentation().catch(err => {
  console.error('❌ Error al generar la presentación:', err);
  process.exit(1);
});
