import axios from 'axios';

const AUTH_URL = 'http://localhost:3001/api/auth';

export const registrarDueno = (datos) =>
  axios.post(`${AUTH_URL}/register/dueno`, datos);

export const registrarPaseador = (datos) =>
  axios.post(`${AUTH_URL}/register/paseador`, datos);

export const registrarVeterinario = (datos) =>
  axios.post(`${AUTH_URL}/register/veterinario`, datos);