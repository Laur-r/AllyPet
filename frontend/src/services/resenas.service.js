/**
 * resenas.service.js
 * -------------------
 * Este servicio es el puente de comunicación con el microservicio de reseñas (Review Service).
 * Se encarga de gestionar todo lo relacionado con la reputación de los paseadores y veterinarios,
 * incluyendo la creación de nuevas calificaciones (estrellas) y la obtención de promedios.
 */
const API_RES = 'http://localhost:3007';

const getHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };
};

/* ── Obtener servicios completados que se pueden calificar ── */
export const obtenerServiciosCalificables = async () => {
  const res = await fetch(`${API_RES}/api/resenas/calificables`, {
    headers: getHeaders()
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Error al obtener servicios');
  return data;
};

/* ── Crear una nueva reseña ── */
export const crearResena = async (datos) => {
  const res = await fetch(`${API_RES}/api/resenas`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(datos),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Error al crear reseña');
  return data;
};

/* ── Obtener reseñas de un usuario (para perfil público) ── */
export const getResenasUsuario = async (idUsuario) => {
  const res = await fetch(`${API_RES}/api/resenas/${idUsuario}`);
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Error al cargar reseñas');
  return data;
};

/* ── Obtener promedio de un usuario ── */
export const getPromedioUsuario = async (idUsuario) => {
  const res = await fetch(`${API_RES}/api/resenas/promedio/${idUsuario}`);
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Error al cargar promedio');
  return data;
};
