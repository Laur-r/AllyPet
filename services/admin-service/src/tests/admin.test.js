/**
 * Pruebas automatizadas - admin-service
 * AllyPet | Desarrollo de Software 3
 *
 * Estrategia: mockear la capa de servicios y el middleware JWT
 * para que las pruebas no dependan de base de datos ni tokens reales.
 */

// ─── Mocks ANTES de cualquier require ────────────────────────────────────────

// Mock del middleware JWT: simula que el token es válido y el usuario es admin
jest.mock('../middlewares/jwt.middleware', () => ({
  requireAdmin: (req, _res, next) => {
    req.user = { id: 1, email: 'admin@allypet.com', role: 'admin' };
    next();
  },
}));

// Mock de la capa de servicios: no toca la base de datos
jest.mock('../services/admin.service', () => ({
  getDashboardStats: jest.fn(),
  getAllUsers: jest.fn(),
  activateUser: jest.fn(),
  deactivateUser: jest.fn(),
  aprobarPaseador: jest.fn(),
  desaprobarPaseador: jest.fn(),
  aprobarVeterinario: jest.fn(),
  desaprobarVeterinario: jest.fn(),
  aprobarCuidador: jest.fn(),
  desaprobarCuidador: jest.fn(),
  getUserRoleById: jest.fn(),
}));

// ─── Imports ──────────────────────────────────────────────────────────────────
const request = require('supertest');
const app = require('../app');
const adminService = require('../services/admin.service');

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('Admin Service - Pruebas automatizadas', () => {

  // Limpia los mocks entre pruebas para evitar interferencia
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ── Ruta raíz ──────────────────────────────────────────────────────────────
  describe('GET /', () => {
    it('debe responder que el servicio está funcionando', async () => {
      const res = await request(app).get('/');
      expect(res.statusCode).toBe(200);
      expect(res.text).toContain('Admin Service');
    });
  });

  // ── Ruta de prueba de rutas ────────────────────────────────────────────────
  describe('GET /api/admin', () => {
    it('debe retornar mensaje de rutas funcionando', async () => {
      const res = await request(app).get('/api/admin');
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('message');
    });
  });

  // ── Dashboard ──────────────────────────────────────────────────────────────
  describe('GET /api/admin/dashboard', () => {
    it('debe retornar las estadísticas del dashboard', async () => {
      adminService.getDashboardStats.mockResolvedValue({
        totalUsers: 10,
        adminUsers: 2,
        totalPets: 5,
      });

      const res = await request(app)
        .get('/api/admin/dashboard')
        .set('Authorization', 'Bearer token-de-prueba');

      expect(res.statusCode).toBe(200);
      expect(res.body).toMatchObject({
        totalUsers: 10,
        adminUsers: 2,
        totalPets: 5,
      });
    });

    it('debe retornar 500 si el servicio falla', async () => {
      adminService.getDashboardStats.mockRejectedValue(new Error('DB caída'));

      const res = await request(app)
        .get('/api/admin/dashboard')
        .set('Authorization', 'Bearer token-de-prueba');

      expect(res.statusCode).toBe(500);
      expect(res.body).toHaveProperty('message');
    });
  });

  // ── Usuarios ───────────────────────────────────────────────────────────────
  describe('GET /api/admin/users', () => {
    it('debe retornar la lista de usuarios', async () => {
      adminService.getAllUsers.mockResolvedValue([
        { id: 1, nombre: 'Laura', email: 'laura@test.com', role: 'admin', estado: true },
        { id: 2, nombre: 'Juan', email: 'juan@test.com', role: 'paseador', estado: true },
      ]);

      const res = await request(app)
        .get('/api/admin/users')
        .set('Authorization', 'Bearer token-de-prueba');

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('users');
      expect(Array.isArray(res.body.users)).toBe(true);
      expect(res.body.users).toHaveLength(2);
    });

    it('debe retornar lista vacía si no hay usuarios', async () => {
      adminService.getAllUsers.mockResolvedValue([]);

      const res = await request(app)
        .get('/api/admin/users')
        .set('Authorization', 'Bearer token-de-prueba');

      expect(res.statusCode).toBe(200);
      expect(res.body.users).toEqual([]);
    });
  });

  // ── Activar / Desactivar usuario ───────────────────────────────────────────
  describe('PATCH /api/admin/users/:id/activate', () => {
    it('debe activar un usuario existente', async () => {
      adminService.activateUser.mockResolvedValue(true);

      const res = await request(app)
        .patch('/api/admin/users/1/activate')
        .set('Authorization', 'Bearer token-de-prueba');

      expect(res.statusCode).toBe(200);
      expect(res.body.message).toBe('Usuario activado satisfactoriamente');
    });

    it('debe retornar 404 si el usuario no existe', async () => {
      adminService.activateUser.mockResolvedValue(false);

      const res = await request(app)
        .patch('/api/admin/users/999/activate')
        .set('Authorization', 'Bearer token-de-prueba');

      expect(res.statusCode).toBe(404);
      expect(res.body.message).toBe('Usuario no encontrado');
    });
  });

  describe('PATCH /api/admin/users/:id/deactivate', () => {
    it('debe desactivar un usuario existente', async () => {
      adminService.deactivateUser.mockResolvedValue(true);

      const res = await request(app)
        .patch('/api/admin/users/2/deactivate')
        .set('Authorization', 'Bearer token-de-prueba');

      expect(res.statusCode).toBe(200);
      expect(res.body.message).toBe('Usuario desactivado satisfactoriamente');
    });

    it('debe retornar 404 si el usuario no existe', async () => {
      adminService.deactivateUser.mockResolvedValue(false);

      const res = await request(app)
        .patch('/api/admin/users/999/deactivate')
        .set('Authorization', 'Bearer token-de-prueba');

      expect(res.statusCode).toBe(404);
    });
  });

  // ── Paseador ───────────────────────────────────────────────────────────────
  describe('PATCH /api/admin/paseador/:id/aprobar', () => {
    it('debe aprobar un paseador existente', async () => {
      adminService.aprobarPaseador.mockResolvedValue(true);

      const res = await request(app)
        .patch('/api/admin/paseador/3/aprobar')
        .set('Authorization', 'Bearer token-de-prueba');

      expect(res.statusCode).toBe(200);
      expect(res.body.message).toBe('Paseador aprobado exitosamente');
    });

    it('debe retornar 404 si el paseador no existe', async () => {
      adminService.aprobarPaseador.mockResolvedValue(false);

      const res = await request(app)
        .patch('/api/admin/paseador/999/aprobar')
        .set('Authorization', 'Bearer token-de-prueba');

      expect(res.statusCode).toBe(404);
      expect(res.body.message).toBe('Perfil de paseador no encontrado');
    });
  });

  describe('PATCH /api/admin/paseador/:id/desaprobar', () => {
    it('debe desaprobar un paseador', async () => {
      adminService.desaprobarPaseador.mockResolvedValue(true);

      const res = await request(app)
        .patch('/api/admin/paseador/3/desaprobar')
        .set('Authorization', 'Bearer token-de-prueba');

      expect(res.statusCode).toBe(200);
      expect(res.body.message).toBe('Paseador desaprobado exitosamente');
    });
  });

  // ── Veterinario ────────────────────────────────────────────────────────────
  describe('PATCH /api/admin/veterinario/:id/aprobar', () => {
    it('debe aprobar un veterinario existente', async () => {
      adminService.aprobarVeterinario.mockResolvedValue(true);

      const res = await request(app)
        .patch('/api/admin/veterinario/4/aprobar')
        .set('Authorization', 'Bearer token-de-prueba');

      expect(res.statusCode).toBe(200);
      expect(res.body.message).toBe('Veterinario aprobado exitosamente');
    });

    it('debe retornar 404 si el veterinario no existe', async () => {
      adminService.aprobarVeterinario.mockResolvedValue(false);

      const res = await request(app)
        .patch('/api/admin/veterinario/999/aprobar')
        .set('Authorization', 'Bearer token-de-prueba');

      expect(res.statusCode).toBe(404);
    });
  });

  // ── Cuidador ───────────────────────────────────────────────────────────────
  describe('PATCH /api/admin/cuidador/:id/aprobar', () => {
    it('debe aprobar un cuidador existente', async () => {
      adminService.aprobarCuidador.mockResolvedValue(true);

      const res = await request(app)
        .patch('/api/admin/cuidador/5/aprobar')
        .set('Authorization', 'Bearer token-de-prueba');

      expect(res.statusCode).toBe(200);
      expect(res.body.message).toBe('Cuidador aprobado exitosamente');
    });

    it('debe retornar 404 si el cuidador no existe', async () => {
      adminService.aprobarCuidador.mockResolvedValue(false);

      const res = await request(app)
        .patch('/api/admin/cuidador/999/aprobar')
        .set('Authorization', 'Bearer token-de-prueba');

      expect(res.statusCode).toBe(404);
    });
  });

  describe('PATCH /api/admin/cuidador/:id/desaprobar', () => {
    it('debe desaprobar un cuidador', async () => {
      adminService.desaprobarCuidador.mockResolvedValue(true);

      const res = await request(app)
        .patch('/api/admin/cuidador/5/desaprobar')
        .set('Authorization', 'Bearer token-de-prueba');

      expect(res.statusCode).toBe(200);
      expect(res.body.message).toBe('Cuidador desaprobado exitosamente');
    });
  });

});