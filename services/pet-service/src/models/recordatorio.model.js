const db = require('../config/db.js');

const RecordatorioModel = {
  getByPetId: async (mascota_id) => {
    console.log('🔍 Recordatorios para mascota:', mascota_id);
    
    try {
      const query = `
        SELECT id, mascota_id, tipo, nombre, descripcion, 
               fecha_programada, completado, fecha_registro
        FROM recordatorios 
        WHERE mascota_id = $1 
        ORDER BY fecha_programada ASC
      `;
      
      // ✅ PostgreSQL usa .query() NO .execute()
      const { rows } = await db.query(query, [mascota_id]);
      
      console.log('✅ Encontrados:', rows.length, 'recordatorios');
      return rows;
    } catch (error) {
      console.error('❌ ERROR recordatorio.model:', error.message);
      return [];
    }
  }
};

module.exports = RecordatorioModel;