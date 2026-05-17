const BASE_URL = 'http://localhost:3010/api/notifications';

const getToken = () => localStorage.getItem('token');

const headers = () => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${getToken()}`,
});

// H10.7 — Historial completo de notificaciones
export const getNotifications = async () => {
  const res = await fetch(`${BASE_URL}`, { headers: headers() });
  if (!res.ok) throw new Error('Error al obtener notificaciones');
  const json = await res.json();
  return json.data;
};

// H10.5 — Conteo de no leídas (badge Navbar)
export const getUnreadCount = async () => {
  const res = await fetch(`${BASE_URL}/unread/count`, { headers: headers() });
  if (!res.ok) return 0;
  const json = await res.json();
  return json.data.total;
};

// Marcar una notificación como leída
export const markAsRead = async (id) => {
  const res = await fetch(`${BASE_URL}/${id}/read`, {
    method: 'PATCH',
    headers: headers(),
  });
  if (!res.ok) throw new Error('Error al marcar notificación');
  return res.json();
};

// H10.7 — Marcar todas como leídas
export const markAllAsRead = async () => {
  const res = await fetch(`${BASE_URL}/read-all`, {
    method: 'PATCH',
    headers: headers(),
  });
  if (!res.ok) throw new Error('Error al marcar notificaciones');
  return res.json();
};