const USER_URL = "http://localhost:3004"; // user-service

const authHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${localStorage.getItem("token")}`,
});

export const getMe = async () => {
  const res = await fetch(`${USER_URL}/api/users/me`, { headers: authHeaders() });
  if (!res.ok) throw new Error("Error al obtener perfil");
  return res.json();
};

export const updateBasicInfo = async (data) => {
  const res = await fetch(`${USER_URL}/api/users/me/info`, {
    method: "PUT",
    headers: authHeaders(),
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Error al actualizar información");
  return res.json();
};

export const updateFoto = async (file) => {
  const form = new FormData();
  form.append("foto", file);
  const res = await fetch(`${USER_URL}/api/users/me/foto`, {
    method: "PUT",
    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    body: form,
  });
  if (!res.ok) throw new Error("Error al actualizar foto");
  return res.json();
};

export const updatePassword = async (data) => {
  const res = await fetch(`${USER_URL}/api/users/me/password`, {
    method: "PUT",
    headers: authHeaders(),
    body: JSON.stringify(data),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || "Error al cambiar contraseña");
  return json;
};