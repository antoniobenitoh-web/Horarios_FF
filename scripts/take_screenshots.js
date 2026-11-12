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

const BASE_URL = 'http://localhost:5173/#';

async function waitSplash(page) {
  // Esperar a que el splash desaparezca y aparezca la app real
  await new Promise(r => setTimeout(r, 2500));
}

async function run() {
  console.log('🚀 Iniciando Puppeteer para capturar pantallas reales...');
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2 });

  // 1. LOGIN
  console.log('📸 1. Capturando Login...');
  await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle2' });
  await waitSplash(page);
  await new Promise(r => setTimeout(r, 1000));
  await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '01_login.png') });

  // 2. SESIÓN PROMOTOR: INICIO
  console.log('📸 2. Configurando sesión Promotor e Inicio...');
  await page.evaluate((u) => {
    localStorage.setItem('user', JSON.stringify(u));
    window.location.hash = '#/';
  }, PROMOTOR_USER);
  await new Promise(r => setTimeout(r, 2500));
  await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '02_inicio_promotor.png') });

  // 3. MI HORARIO - MENSUAL
  console.log('📸 3. Capturando Mi Horario Mensual...');
  await page.evaluate(() => { window.location.hash = '#/horario'; });
  await new Promise(r => setTimeout(r, 3000));
  await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '03_horario_mensual.png') });

  // 4. MI HORARIO - SEMANAL
  console.log('📸 4. Capturando Mi Horario Semanal...');
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const b = btns.find(btn => btn.textContent.includes('Semanal'));
    if (b) b.click();
  });
  await new Promise(r => setTimeout(r, 2000));
  await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '04_horario_semanal.png') });

  // 5. CONTROL HORAS (PROMOTOR)
  console.log('📸 5. Capturando Control Horas...');
  await page.evaluate(() => { window.location.hash = '#/horas'; });
  await new Promise(r => setTimeout(r, 3000));
  await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '05_control_horas.png') });

  // 6. SESIÓN AM: INICIO RESPONSABLE
  console.log('📸 6. Cambiando a sesión Responsable (AM)...');
  await page.evaluate((u) => {
    localStorage.setItem('user', JSON.stringify(u));
    window.location.hash = '#/';
  }, AM_USER);
  await new Promise(r => setTimeout(r, 3500));
  await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '06_inicio_responsable.png') });

  // 7. COBERTURA MENSUAL
  console.log('📸 7. Capturando Cobertura de Centros (Mensual)...');
  await page.evaluate(() => { window.location.hash = '#/cobertura'; });
  await new Promise(r => setTimeout(r, 4000));
  await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '07_cobertura_mensual.png') });

  // 8. COBERTURA DETALLE (Scroll hacia el detalle diario)
  console.log('📸 8. Capturando Detalle Diario de Cobertura...');
  await page.evaluate(() => {
    window.scrollTo({ top: 520, behavior: 'instant' });
  });
  await new Promise(r => setTimeout(r, 1000));
  await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '08_cobertura_detalle.png') });

  // 9. MI EQUIPO
  console.log('📸 9. Capturando Mi Equipo...');
  await page.evaluate(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
    window.location.hash = '#/equipo';
  });
  await new Promise(r => setTimeout(r, 4000));
  await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '09_mi_equipo.png') });

  // 10. GESTIÓN USUARIOS (Como Administradora para ver todo el panel)
  console.log('📸 10. Capturando Gestión de Usuarios...');
  await page.evaluate(() => {
    localStorage.setItem('user', JSON.stringify({
      name: 'Alicia Muruzabal',
      username: 'aliciamuruzabal@salesland.net',
      role: 'administradora'
    }));
    window.location.hash = '#/usuarios';
  });
  await new Promise(r => setTimeout(r, 3500));
  await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '10_usuarios.png') });

  await browser.close();
  console.log('🎉 Capturas reales completadas con éxito!');
}

run().catch(console.error);
