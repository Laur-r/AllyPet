// start_all.js
// Script para levantar todos los microservicios y el frontend en un solo proceso de fondo en Windows

const { spawn } = require('child_process');
const path = require('path');

const services = [
  { name: 'admin-service', dir: 'services/admin-service' },
  { name: 'auth-service', dir: 'services/auth-service' },
  { name: 'cuidador-service', dir: 'services/cuidador-service' },
  { name: 'message-service', dir: 'services/message-service' },
  { name: 'notification-service', dir: 'services/notification-service' },
  { name: 'pas-service', dir: 'services/pas-service' },
  { name: 'pet-service', dir: 'services/pet-service' },
  { name: 'request-service', dir: 'services/request-service' },
  { name: 'review-service', dir: 'services/review-service' },
  { name: 'user-service', dir: 'services/user-service' },
  { name: 'vet-service', dir: 'services/vet-service' },
  { name: 'frontend', dir: 'frontend' }
];

console.log('=== INICIANDO TODOS LOS SERVICIOS DE ALLYPET ===');

services.forEach(service => {
  const fullPath = path.resolve(__dirname, service.dir);
  console.log(`[Sistema] Iniciando ${service.name} en ${fullPath}...`);

  const child = spawn('npm', ['run', 'dev'], {
    cwd: fullPath,
    stdio: 'ignore', // Cambiado a 'ignore' para evitar bloqueos en entornos headless
    shell: true
  });

  child.on('error', (err) => {
    console.error(`[Error] Fallo al iniciar ${service.name}:`, err);
  });

  child.on('exit', (code) => {
    console.log(`[Sistema] ${service.name} terminó con código ${code}`);
  });
});
