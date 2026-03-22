const createUser = ({ nombre, email, password }) => {
  if (!nombre || !email || !password) {
    return { success: false, message: 'Todos los campos son obligatorios ❌' };
  }

  // Aquí irá la lógica real con BD cuando la tengan
  return {
    success: true,
    message: 'Usuario creado correctamente ✅',
    user: { nombre, email }
  };
};

module.exports = { createUser };