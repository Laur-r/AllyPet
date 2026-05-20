const API_VET = 'http://localhost:3005';

/* ── Buscar veterinarias por ciudad ── */
export const buscarVeterinarias = async (ciudad) => {
  const res  = await fetch(`${API_VET}/perfil-vet/buscar?ciudad=${encodeURIComponent(ciudad)}`);
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Error al buscar');
  return data;
};

/* ── Obtener perfil público de la veterinaria ── */
export const getPerfilPublicoVeterinaria = async (usuarioId) => {
  const res  = await fetch(`${API_VET}/perfil-vet/publico/${usuarioId}`);
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Error al cargar perfil');
  return data;
};

/* ── Obtener reseñas de la veterinaria ── */
export const getResenasVeterinaria = async (usuarioId) => {
  const res  = await fetch(`${API_VET}/perfil-vet/${usuarioId}/resenas`);
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Error al cargar reseñas');
  return data;
};