const API_PAS = 'http://localhost:3006';

/* ── Buscar paseadores por ciudad ── */
export const buscarPaseadores = async (ciudad) => {
  const res  = await fetch(`${API_PAS}/api/perfil-paseador/buscar?ciudad=${encodeURIComponent(ciudad)}`);
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Error al buscar');
  return data;
};

/* ── Obtener perfil público del paseador ── */
export const getPerfilPublicoPaseador = async (usuarioId) => {
  const res  = await fetch(`${API_PAS}/api/perfil-paseador/publico/${usuarioId}`);
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Error al cargar perfil');
  return data;
};

/* ── Obtener reseñas del paseador ── */
export const getResenasPaseador = async (usuarioId) => {
  const res  = await fetch(`${API_PAS}/api/perfil-paseador/${usuarioId}/resenas`);
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Error al cargar reseñas');
  return data;
};