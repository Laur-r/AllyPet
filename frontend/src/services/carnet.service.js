import axios from 'axios';

const API_URL = import.meta.env.VITE_PET_API_URL || 'http://localhost:3003/api';

const getToken = () => localStorage.getItem('token');

const headers = () => ({
  headers: { Authorization: `Bearer ${getToken()}` }
});

// ─── CARNET ──────────────────────────────────────────────────────
export const getCarnet = (petId) =>
  axios.get(`${API_URL}/pets/${petId}/carnet`, headers());

// ─── VACUNAS ─────────────────────────────────────────────────────
export const getVacunas = (petId) =>
  axios.get(`${API_URL}/pets/${petId}/vacunas`, headers());

export const agregarVacuna = (petId, data) =>
  axios.post(`${API_URL}/pets/${petId}/vacunas`, data, headers());

export const editarVacuna = (petId, vacunaId, data) =>
  axios.put(`${API_URL}/pets/${petId}/vacunas/${vacunaId}`, data, headers());

export const eliminarVacuna = (petId, vacunaId) =>
  axios.delete(`${API_URL}/pets/${petId}/vacunas/${vacunaId}`, headers());

// ─── HISTORIAL ───────────────────────────────────────────────────
export const getHistorial = (petId) =>
  axios.get(`${API_URL}/pets/${petId}/historial`, headers());

export const agregarHistorial = (petId, data) =>
  axios.post(`${API_URL}/pets/${petId}/historial`, data, headers());

export const eliminarHistorial = (petId, entradaId) =>
  axios.delete(`${API_URL}/pets/${petId}/historial/${entradaId}`, headers());

// ─── RECORDATORIOS ───────────────────────────────────────────────
export const getRecordatorios = (petId) =>
  axios.get(`${API_URL}/pets/${petId}/recordatorios`, headers());

export const agregarRecordatorio = (petId, data) =>
  axios.post(`${API_URL}/pets/${petId}/recordatorios`, data, headers());

export const eliminarRecordatorio = (petId, recordatorioId) =>
  axios.delete(`${API_URL}/pets/${petId}/recordatorios/${recordatorioId}`, headers());

// ─── TOKEN QR ────────────────────────────────────────────────────
export const generarToken = (petId) =>
  axios.post(`${API_URL}/pets/${petId}/carnet/token`, {}, headers());

export const revocarToken = (petId) =>
  axios.delete(`${API_URL}/pets/${petId}/carnet/token`, headers());