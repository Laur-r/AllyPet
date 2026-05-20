const axios  = require('axios');
const crypto = require('crypto');
const model  = require('../models/pago.model');

const WOMPI_API    = process.env.WOMPI_API_URL    || 'https://sandbox.wompi.co/v1';
const PUBLIC_KEY   = process.env.WOMPI_PUBLIC_KEY;
const PRIVATE_KEY  = process.env.WOMPI_PRIVATE_KEY;
const EVENTS_KEY   = process.env.WOMPI_EVENTS_SECRET;
const COMISION     = parseFloat(process.env.COMISION_PLATAFORMA) || 0.12;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

/* ── Generar referencia única ── */
const generarReferencia = (solicitud_id) => {
  const ts   = Date.now();
  const rand = Math.random().toString(36).substring(2, 7).toUpperCase();
  return `ALLY-${solicitud_id}-${ts}-${rand}`;
};

/* ── Calcular split ── */
const calcularSplit = (monto_total) => {
  const monto_plataforma = Math.round(monto_total * COMISION);
  const monto_proveedor  = monto_total - monto_plataforma;
  return { monto_proveedor, monto_plataforma };
};

/* ── Iniciar pago ── */
const iniciarPago = async (solicitud_id, dueno_id) => {
  const solicitud = await model.getSolicitudParaPago(solicitud_id, dueno_id);

  if (!solicitud) throw new Error('Solicitud no encontrada o no te pertenece');
  if (solicitud.estado !== 'aceptada') throw new Error('Solo puedes pagar solicitudes aceptadas');
  if (!solicitud.monto || solicitud.monto <= 0) {
    throw new Error('El precio del servicio no está definido. Contacta al paseador.');
  }

  const pagoExistente = await model.getPagoPorSolicitud(solicitud_id);
  if (pagoExistente?.estado === 'aprobado') throw new Error('Esta solicitud ya fue pagada');

  const monto_total = Number(solicitud.monto);
  const { monto_proveedor, monto_plataforma } = calcularSplit(monto_total);
  const referencia  = generarReferencia(solicitud_id);

  // Guardar en BD antes de redirigir
  const pago = await model.crearPago({
    referencia,
    solicitud_id,
    dueno_id,
    proveedor_id:   solicitud.proveedor_usuario_id,
    tipo_proveedor: solicitud.tipo_proveedor || 'paseador',
    monto_total,
    monto_proveedor,
    monto_plataforma,
  });

  // ── Wompi Checkout ──────────────────────────────────────────
  // El monto va en centavos (×100), sin decimales
  const montoCentavos = Math.round(monto_total * 100);

  // ✅ FIRMA CORRECTA: reference + amount_in_cents + currency + integrity_secret
  // La llave correcta para la firma es el "Secreto de integridad" (integrity secret)
  // que está en Wompi → Desarrolladores → Llaves de API
  // Es DIFERENTE al private key y al events secret
  // En el .env lo llamamos WOMPI_INTEGRITY_SECRET
  const integritySecret = process.env.WOMPI_INTEGRITY_SECRET || PRIVATE_KEY;
  const firmaString = `${referencia}${montoCentavos}COP${integritySecret}`;
  const firma = crypto
    .createHash('sha256')
    .update(firmaString)
    .digest('hex');

  const redirectUrl =
  `${FRONTEND_URL}/menu/dueno/pagos/resultado?ref=${referencia}`;

  // Construir URL de checkout
  const params = new URLSearchParams({
    'public-key':          PUBLIC_KEY,
    'currency':            'COP',
    'amount-in-cents':     String(montoCentavos),
    'reference':           referencia,
    'signature:integrity': firma,
    'redirect-url':        redirectUrl,
  });

  const wompi_url = `https://checkout.wompi.co/p/?${params.toString()}`;

  console.log('💳 Pago iniciado:', {
    referencia,
    monto_total,
    montoCentavos,
    firma: firma.substring(0, 10) + '...',
    redirectUrl,
  });

  return {
    pago_id:         pago.id,
    referencia,
    monto_total,
    monto_proveedor,
    monto_plataforma,
    wompi_url,
  };
};

/* ── Verificar firma del webhook ── */
const verificarFirmaWebhook = (payload, firmaRecibida) => {
  if (!EVENTS_KEY) return true;
  const checksum = crypto
    .createHash('sha256')
    .update(JSON.stringify(payload) + EVENTS_KEY)
    .digest('hex');
  return checksum === firmaRecibida;
};

/* ── Procesar webhook de Wompi ── */
const procesarWebhook = async (body, firma) => {
  if (!verificarFirmaWebhook(body, firma)) {
    throw new Error('Firma del webhook inválida');
  }

  const evento = body?.event;
  const data   = body?.data?.transaction;

  if (!data) return { ok: true, ignorado: true };
  if (evento !== 'transaction.updated') return { ok: true, ignorado: true };

  const referencia = data.reference;
  const status     = data.status;

  const estadoMapeado = {
    APPROVED: 'aprobado',
    DECLINED: 'declinado',
    ERROR:    'error',
    VOIDED:   'reembolsado',
  }[status] || 'error';

  const pago = await model.actualizarEstadoPago({
    referencia,
    estado:               estadoMapeado,
    wompi_transaction_id: data.id,
    wompi_status:         status,
    wompi_raw:            data,
  });

  if (!pago) {
    console.warn(`⚠️ Webhook: pago ${referencia} no encontrado`);
    return { ok: true, ignorado: true };
  }

  if (estadoMapeado === 'aprobado') {
    await model.crearRetencion({
      pago_id:        pago.id,
      proveedor_id:   pago.proveedor_id,
      tipo_proveedor: pago.tipo_proveedor,
      monto:          pago.monto_proveedor,
    });
    console.log(`✅ Pago aprobado: ${referencia} — $${pago.monto_total} COP`);
  }

  return { ok: true, referencia, estado: estadoMapeado };
};

/* ── Historial del proveedor ── */
const getHistorialProveedor = async (proveedor_id) => {
  return await model.getHistorialProveedor(proveedor_id);
};

/* ── Resumen financiero ── */
const getResumenProveedor = async (proveedor_id) => {
  return await model.getResumenProveedor(proveedor_id);
};

/* ── Consultar pago por referencia ── */
const consultarPago = async (referencia, usuario_id) => {
  const pago = await model.getPagoPorReferencia(referencia);
  if (!pago) throw new Error('Pago no encontrado');
  if (pago.dueno_id !== usuario_id && pago.proveedor_id !== usuario_id) {
    throw new Error('No tienes acceso a este pago');
  }
  return pago;
};

module.exports = {
  iniciarPago,
  procesarWebhook,
  getHistorialProveedor,
  getResumenProveedor,
  consultarPago,
};