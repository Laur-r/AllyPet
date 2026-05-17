// frontend/src/services/cuidador.service.js

const AUTH_URL = 'http://localhost:3001/api/auth';

export const registrarCuidador = async (datos) => {
  const res = await fetch(`${AUTH_URL}/register/cuidador`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(datos),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || data.message || 'Error al registrar cuidador');
  }

  return data;
};