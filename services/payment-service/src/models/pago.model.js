const pool = require('../config/db');

/* ── Crear registro de pago pendiente ── */
const crearPago = async ({
  referencia, solicitud_id, dueno_id, proveedor_id,
  tipo_proveedor, monto_total, monto_proveedor, monto_plataforma,
}) => {
  const { rows } = await pool.query(
    `INSERT INTO pagos
       (referencia, solicitud_id, dueno_id, proveedor_id, tipo_proveedor,
        monto_total, monto_proveedor, monto_plataforma, estado)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,'pendiente')
     RETURNING *`,
    [referencia, solicitud_id, dueno_id, proveedor_id,
     tipo_proveedor, monto_total, monto_proveedor, monto_plataforma]
  );
  return rows[0];
};

/* ── Obtener pago por referencia ── */
const getPagoPorReferencia = async (referencia) => {
  const { rows } = await pool.query(
    `SELECT * FROM pagos WHERE referencia = $1`,
    [referencia]
  );
  return rows[0] || null;
};

/* ── Obtener pago por id de solicitud ── */
const getPagoPorSolicitud = async (solicitud_id) => {
  const { rows } = await pool.query(
    `SELECT * FROM pagos WHERE solicitud_id = $1 ORDER BY fecha_creacion DESC LIMIT 1`,
    [solicitud_id]
  );
  return rows[0] || null;
};

/* ── Actualizar estado del pago tras webhook de Wompi ── */
const actualizarEstadoPago = async ({
  referencia, estado, wompi_transaction_id, wompi_status, wompi_raw,
}) => {
  const { rows } = await pool.query(
    `UPDATE pagos
     SET estado = $1,
         wompi_transaction_id = $2,
         wompi_status = $3,
         wompi_raw = $4,
         fecha_pago = CASE WHEN $1 = 'aprobado' THEN now() ELSE fecha_pago END
     WHERE referencia = $5
     RETURNING *`,
    [estado, wompi_transaction_id, wompi_status, JSON.stringify(wompi_raw), referencia]
  );
  return rows[0] || null;
};

/* ── Crear retención tras pago aprobado ── */
const crearRetencion = async ({ pago_id, proveedor_id, tipo_proveedor, monto }) => {
  const { rows } = await pool.query(
    `INSERT INTO retenciones (pago_id, proveedor_id, tipo_proveedor, monto, estado)
     VALUES ($1,$2,$3,$4,'pendiente')
     RETURNING *`,
    [pago_id, proveedor_id, tipo_proveedor, monto]
  );
  return rows[0];
};

/* ── Historial de pagos del proveedor ── */
const getHistorialProveedor = async (proveedor_id) => {
  const { rows } = await pool.query(
    `SELECT
       p.id,
       p.referencia,
       p.monto_total,
       p.monto_proveedor,
       p.monto_plataforma,
       p.estado,
       p.fecha_creacion,
       p.fecha_pago,
       -- datos de la solicitud
       s.fecha_servicio,
       s.hora_servicio,
       s.duracion_minutos,
       s.tipo_proveedor,
       -- datos del dueño
       u.nombre AS dueno_nombre,
       u.foto_perfil AS dueno_foto,
       -- datos de la mascota
       m.nombre AS mascota_nombre,
       m.especie AS mascota_especie,
       -- estado de retención (si Allypet ya transfirió)
       r.estado AS retencion_estado,
       r.fecha_transferencia
     FROM pagos p
     LEFT JOIN solicitudes s ON s.id = p.solicitud_id
     LEFT JOIN usuarios u ON u.id = p.dueno_id
     LEFT JOIN mascotas m ON m.id = s.mascota_id
     LEFT JOIN retenciones r ON r.pago_id = p.id
     WHERE p.proveedor_id = $1
     ORDER BY p.fecha_creacion DESC`,
    [proveedor_id]
  );
  return rows;
};

/* ── Resumen financiero del proveedor ── */
const getResumenProveedor = async (proveedor_id) => {
  const { rows } = await pool.query(
    `SELECT
       -- Total histórico acumulado (solo pagos aprobados)
       COALESCE(SUM(p.monto_proveedor) FILTER (WHERE p.estado = 'aprobado'), 0)
         AS total_historico,

       -- Total del mes actual
       COALESCE(SUM(p.monto_proveedor) FILTER (
         WHERE p.estado = 'aprobado'
           AND DATE_TRUNC('month', p.fecha_pago) = DATE_TRUNC('month', now())
       ), 0) AS total_mes,

       -- Pendiente de transferencia por Allypet
       COALESCE(SUM(r.monto) FILTER (WHERE r.estado = 'pendiente'), 0)
         AS pendiente_cobro,

       -- Ya transferido
       COALESCE(SUM(r.monto) FILTER (WHERE r.estado = 'transferido'), 0)
         AS ya_cobrado,

       -- Cantidad de servicios completados y pagados
       COUNT(p.id) FILTER (WHERE p.estado = 'aprobado') AS total_servicios

     FROM pagos p
     LEFT JOIN retenciones r ON r.pago_id = p.id
     WHERE p.proveedor_id = $1`,
    [proveedor_id]
  );
  return rows[0];
};

/* ── Datos de la solicitud para validar el pago ── */
const getSolicitudParaPago = async (solicitud_id, dueno_id) => {
  const { rows } = await pool.query(
    `SELECT
       s.id,
       s.dueno_id,
       s.proveedor_usuario_id,
       s.tipo_proveedor,
       s.precio_acordado,
       s.estado,
       -- Calcular precio si precio_acordado es null
       COALESCE(s.precio_acordado,
         ROUND((pp.tarifa / 60.0) * s.duracion_minutos, 0)
       ) AS monto
     FROM solicitudes s
     LEFT JOIN perfil_paseador pp ON pp.id = s.paseador_id
     WHERE s.id = $1 AND s.dueno_id = $2`,
    [solicitud_id, dueno_id]
  );
  return rows[0] || null;
};

module.exports = {
  crearPago,
  getPagoPorReferencia,
  getPagoPorSolicitud,
  actualizarEstadoPago,
  crearRetencion,
  getHistorialProveedor,
  getResumenProveedor,
  getSolicitudParaPago,
};