const BASE_URL = 'http://localhost:3009/api/messages';

const getToken = () => localStorage.getItem('token');

const headers = () => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${getToken()}`,
});

// H10.1 — Enviar mensaje
export const sendMessage = async ({ solicitud_id, destinatario_id, contenido }) => {
  const res = await fetch(`${BASE_URL}`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify({ solicitud_id, destinatario_id, contenido }),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message || 'Error al enviar el mensaje');
  }
  return res.json();
};

// H10.2 — Lista de conversaciones
export const getConversations = async () => {
  const res = await fetch(`${BASE_URL}/conversations`, { headers: headers() });
  if (!res.ok) throw new Error('Error al obtener conversaciones');
  const json = await res.json();
  return json.data;
};

// H10.2 — Mensajes de una conversación (también marca como leídos automáticamente)
export const getMessages = async (interlocutor_id) => {
  const res = await fetch(`${BASE_URL}/${interlocutor_id}`, { headers: headers() });
  if (!res.ok) throw new Error('Error al obtener mensajes');
  const json = await res.json();
  return json.data;
};

// H10.5 — Conteo de no leídos (para badge Navbar)
export const getUnreadCount = async () => {
  const res = await fetch(`${BASE_URL}/unread/count`, { headers: headers() });
  if (!res.ok) return 0;
  const json = await res.json();
  return json.data.total;
};