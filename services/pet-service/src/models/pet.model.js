const pool = require('../config/db');

const getByUsuario = async (usuario_id) => {
  const { rows } = await pool.query(
    `SELECT id, usuario_id, nombre, especie, raza, sexo, edad, peso, color, foto, notas, fecha_registro
     FROM mascotas
     WHERE usuario_id = $1 AND activo IS NOT FALSE
     ORDER BY fecha_registro DESC`,
    [usuario_id]
  );
  return rows;
};

const getById = async (id, usuario_id) => {
  const { rows } = await pool.query(
    `SELECT id, usuario_id, nombre, especie, raza, sexo, edad, peso, color, foto, notas, fecha_registro
     FROM mascotas
     WHERE id = $1 AND usuario_id = $2 AND activo IS NOT FALSE`,
    [id, usuario_id]
  );
  return rows[0] || null;
};

const create = async ({ usuario_id, nombre, especie, raza, sexo, edad, peso, color, foto, notas }) => {
  const { rows } = await pool.query(
    `INSERT INTO mascotas (usuario_id, nombre, especie, raza, sexo, edad, peso, color, foto, notas)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
     RETURNING *`,
    [usuario_id, nombre, especie || null, raza, sexo || null, edad || null, peso || null, color || null, foto || null, notas || null]
  );
  return rows[0];
};

const update = async (id, usuario_id, { nombre, especie, raza, sexo, edad, peso, color, foto, notas }) => {
  const { rows } = await pool.query(
    `UPDATE mascotas
     SET nombre  = $1,
         especie = $2,
         raza    = $3,
         sexo    = $4,
         edad    = $5,
         peso    = $6,
         color   = $7,
         foto    = $8,
         notas   = $9
     WHERE id = $10 AND usuario_id = $11
     RETURNING *`,
    [nombre, especie || null, raza, sexo || null, edad || null, peso || null, color || null, foto || null, notas || null, id, usuario_id]
  );
  return rows[0] || null;
};

const remove = async (id, usuario_id) => {
  const { rowCount } = await pool.query(
    `DELETE FROM mascotas WHERE id = $1 AND usuario_id = $2`,
    [id, usuario_id]
  );
  return rowCount > 0;
};

// Galería de fotos
const getGaleriaByMascotaId = async (petId) => {
    const res = await pool.query(
        'SELECT * FROM mascota_galeria WHERE mascota_id = $1 ORDER BY fecha_subida DESC', 
        [petId]
    );
    return res.rows;
};

const addFotoGaleria = async (petId, url) => {
    const res = await pool.query(
        'INSERT INTO mascota_galeria (mascota_id, foto_url) VALUES ($1, $2) RETURNING *',
        [petId, url]
    );
    return res.rows[0];
};

const deleteFotoGaleria = async (photoId) => {
    const res = await pool.query(
        'DELETE FROM mascota_galeria WHERE id = $1 RETURNING *', 
        [photoId]
    );
    return res.rows[0];
};

// ✅ Ahora el export ya no dará error porque las funciones existen con estos nombres
module.exports = { 
    getByUsuario, 
    getById, 
    create, 
    update, 
    remove, 
    getGaleriaByMascotaId, 
    addFotoGaleria, 
    deleteFotoGaleria 
};