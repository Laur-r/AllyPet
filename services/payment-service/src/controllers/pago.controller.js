const service = require('../services/pago.service');

/* ─────────────────────────────────────────
   POST /pagos/iniciar
   Body: { solicitud_id }
   El dueno_id sale del token JWT
   Devuelve la URL de pago de Wompi
───────────────────────────────────────── */
const iniciarPago = async (req, res) => {
  try {
    const dueno_id   = req.usuario_id;
    const { solicitud_id } = req.body;

    if (!solicitud_id) {
      return res.status(400).json({ ok: false, message: 'solicitud_id es requerido' });
    }

    const resultado = await service.iniciarPago(Number(solicitud_id), dueno_id);
    return res.status(201).json({ ok: true, data: resultado });

  } catch (err) {
    console.error('iniciarPago:', err.message);
    const status = err.message.includes('no encontrada') || err.message.includes('no te pertenece') ? 400 : 500;
    return res.status(status).json({ ok: false, message: err.message });
  }
};

/* ─────────────────────────────────────────
   POST /pagos/webhook
   Wompi llama este endpoint cuando hay un evento
   NO lleva token JWT — usa firma de Wompi
───────────────────────────────────────── */
const webhook = async (req, res) => {
  try {
    // Wompi envía la firma en el header x-event-checksum
      console.log("🔥 WEBHOOK RECIBIDO");
    console.log(JSON.stringify(req.body, null, 2));
    const firma = req.headers['x-event-checksum'];
    const resultado = await service.procesarWebhook(req.body, firma);
    return res.status(200).json(resultado);
  } catch (err) {
    console.error('webhook:', err.message);
    // Siempre devolver 200 a Wompi aunque falle internamente
    // (si devolvemos error, Wompi reintenta indefinidamente)
    return res.status(200).json({ ok: false, message: err.message });
  }
};

/* ─────────────────────────────────────────
   GET /pagos/proveedor/historial
   El proveedor ve sus pagos recibidos
───────────────────────────────────────── */
const getHistorialProveedor = async (req, res) => {
  try {
    const proveedor_id = req.usuario_id;
    const historial = await service.getHistorialProveedor(proveedor_id);
    return res.status(200).json({ ok: true, data: historial });
  } catch (err) {
    console.error('getHistorialProveedor:', err.message);
    return res.status(500).json({ ok: false, message: err.message });
  }
};

/* ─────────────────────────────────────────
   GET /pagos/proveedor/resumen
   Totales: mes actual, histórico, pendiente de cobro
───────────────────────────────────────── */
const getResumenProveedor = async (req, res) => {
  try {
    const proveedor_id = req.usuario_id;
    const resumen = await service.getResumenProveedor(proveedor_id);
    return res.status(200).json({ ok: true, data: resumen });
  } catch (err) {
    console.error('getResumenProveedor:', err.message);
    return res.status(500).json({ ok: false, message: err.message });
  }
};

/* ─────────────────────────────────────────
   GET /pagos/consultar/:referencia
   Dueño o proveedor consulta el estado de un pago
───────────────────────────────────────── */
const consultarPago = async (req, res) => {
  try {
    const usuario_id = req.usuario_id;
    const { referencia } = req.params;
    const pago = await service.consultarPago(referencia, usuario_id);
    return res.status(200).json({ ok: true, data: pago });
  } catch (err) {
    console.error('consultarPago:', err.message);
    const status = err.message.includes('no encontrado') ? 404 : 403;
    return res.status(status).json({ ok: false, message: err.message });
  }
};

module.exports = {
  iniciarPago,
  webhook,
  getHistorialProveedor,
  getResumenProveedor,
  consultarPago,
};