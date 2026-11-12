import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';

const SCREENSHOTS_DIR = path.resolve('public/screenshots_guia');
if (!fs.existsSync(SCREENSHOTS_DIR)) {
  fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
}

const PROMOTOR_USER = {
  id: 6,
  name: 'Alejandro Tovar Manzano',
  username: 'mmfontanella2@salesland.net',
  role: 'promotor',
  centro: 'Media Barcelona 5 Fontane',
  region: 'Northeast',
  manager: {
    gpv: 'Miguel Mata',
    am: 'Antonio Benito',
    coordinadora: 'Laura Muñido',
    trainer: 'Carles Hinojosa',
    project: 'Alicia Muruzabal',
    administradora: 'Alicia Muruzabal'
  }
};

const AM_USER = {
  name: 'Antonio Benito',
  username: 'antoniobenitoh@salesland.net',
  role: 'am'
};

const ADMIN_USER = {
  name: 'Alicia Muruzabal',
  username: 'aliciamuruzabal@salesland.net',
  role: 'administradora'
};

async function loadRouteWithUser(page, user, route) {
  await page.evaluate((u, r) => {
    if (u) {
      localStorage.setItem('user', JSON.stringify(u));
    } else {
      localStorage.clear();
    }
    window.location.href = `http://localhost:5173/#${r}`;
    window.location.reload();
  }, user, route);

  // Esperar splash inicial de 2 segundos + carga de red
  await new Promise(r => setTimeout(r, 4500));
}

async function run() {
  console.log('🚀 Iniciando captura sistemática de pantallas reales...');
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 412, height: 915, deviceScaleFactor: 2 });

  // 1. LOGIN
  console.log('📸 1. Login corporativo...');
  await page.goto('http://localhost:5173/#/login');
  await loadRouteWithUser(page, null, '/login');
  await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '01_login.png') });

  // 2. INICIO PROMOTOR
  console.log('📸 2. Inicio Promotor...');
  await loadRouteWithUser(page, PROMOTOR_USER, '/');
  await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '02_inicio_promotor.png') });

  // 3. MI HORARIO - MENSUAL
  console.log('📸 3. Mi Horario (Mensual)...');
  await loadRouteWithUser(page, PROMOTOR_USER, '/horario');
  await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '03_mi_horario_mensual.png') });

  // 4. MI HORARIO - SEMANAL
  console.log('📸 4. Mi Horario (Semanal)...');
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const b = btns.find(btn => btn.textContent.includes('Semanal'));
    if (b) b.click();
  });
  await new Promise(r => setTimeout(r, 2000));
  await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '04_mi_horario_semanal.png') });

  // 5. CONTROL HORAS (PROMOTOR)
  console.log('📸 5. Control Horas (Promotor)...');
  await loadRouteWithUser(page, PROMOTOR_USER, '/horas');
  await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '05_control_horas.png') });

  // 6. INICIO RESPONSABLE (AM)
  console.log('📸 6. Inicio Responsable (AM)...');
  await loadRouteWithUser(page, AM_USER, '/');
  await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '06_inicio_responsable.png') });

  // 7. COBERTURA MENSUAL
  console.log('📸 7. Cobertura Calendario Mensual...');
  await loadRouteWithUser(page, AM_USER, '/cobertura');
  await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '07_cobertura_mensual.png') });

  // 8. COBERTURA DETALLE DIARIO
  console.log('📸 8. Cobertura Detalle Diario...');
  await page.evaluate(() => {
    window.scrollTo({ top: 580, behavior: 'instant' });
  });
  await new Promise(r => setTimeout(r, 1500));
  await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '08_cobertura_detalle.png') });

  // 9. MI EQUIPO (RESPONSABLE)
  console.log('📸 9. Mi Equipo...');
  await loadRouteWithUser(page, AM_USER, '/equipo');
  await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '09_mi_equipo.png') });

  // 10. GESTIÓN USUARIOS (ADMINISTRADORA)
  console.log('📸 10. Gestión de Usuarios...');
  await loadRouteWithUser(page, ADMIN_USER, '/usuarios');
  await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '10_gestion_usuarios.png') });

  await browser.close();
  console.log('🎉 ¡Todas las capturas reales han sido generadas y son 100% auténticas!');
}

run().catch(console.error);
