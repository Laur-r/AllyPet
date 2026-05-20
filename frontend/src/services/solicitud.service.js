const API = "http://localhost:3007";

export const crearSolicitud = async (datos, token) => {
  const res = await fetch(`${API}/api/solicitudes`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify(datos),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Error al crear la solicitud");
  return data;
};

export const obtenerSolicitudesPendientes = async (token) => {
  const res = await fetch(`${API}/api/solicitudes/paseador/pendientes`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Error al obtener solicitudes");
  return data;
};

export const responderSolicitud = async (id, estado, token) => {
  const res = await fetch(`${API}/api/solicitudes/${id}/responder`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify({ estado }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Error al responder la solicitud");
  return data;
};

export const cancelarSolicitud = async (id, token) => {
  const res = await fetch(`${API}/api/solicitudes/${id}/cancelar`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Error al cancelar la solicitud");
  return data;
};

export const obtenerHistorialDueno = async (token, estado = "") => {
  const url = estado
    ? `${API}/api/solicitudes/dueno/historial?estado=${estado}`
    : `${API}/api/solicitudes/dueno/historial`;
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Error al obtener historial");
  return data;
};

export const obtenerHistorialPaseador = async (token, estado = "") => {
  const url = estado
    ? `${API}/api/solicitudes/paseador/historial?estado=${estado}`
    : `${API}/api/solicitudes/paseador/historial`;
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Error al obtener historial");
  return data;
};
export const completarServicio = async (id, token) => {
  const res = await fetch(`${API}/api/solicitudes/${id}/completar`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Error al completar el servicio");
  return data;
};

/* ── H11.5 — Crear solicitud de cuidado ── */
export const crearSolicitudCuidado = async (datos, token) => {
  const res = await fetch(`${API}/api/solicitudes/cuidado`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify(datos),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Error al crear la solicitud de cuidado");
  return data;
};

/* ── H11.5 — Solicitudes pendientes del cuidador ── */
export const obtenerSolicitudesPendientesCuidador = async (token) => {
  const res = await fetch(`${API}/api/solicitudes/cuidador/pendientes`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Error al obtener solicitudes del cuidador");
  return data;
};

/* ── H11.5 — Historial de cuidado del dueño ── */
export const obtenerHistorialCuidadoDueno = async (token, estado = "") => {
  const url = estado
    ? `${API}/api/solicitudes/dueno/historial-cuidado?estado=${estado}`
    : `${API}/api/solicitudes/dueno/historial-cuidado`;
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Error al obtener historial de cuidado");
  return data;
};