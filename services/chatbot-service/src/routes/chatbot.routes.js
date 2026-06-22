import express from "express";
import OpenAI from "openai";
import { pool } from "../config/db.js";

const router = express.Router();



// =========================================================
// POSTGRES
// =========================================================


// =========================================================
// CHATBOT
// =========================================================

router.post("/", async (req, res) => {

  try {

    // =========================================================
    // OPENAI
    // =========================================================

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    // =========================================================
    // BODY
    // =========================================================

    const {
      message,
      userId,
      userName,
      userRole,
      userCity,
    } = req.body;

    if (!message) {
      return res.status(400).json({
        reply: "El mensaje es obligatorio.",
      });
    }

    // =========================================================
    // 1. DETECTAR INTENCIÓN
    // =========================================================

    const detectPrompt = `
Eres AllyBot, el asistente virtual de AllyPet.

Tu trabajo es detectar si el usuario necesita consultar
datos reales de la base de datos.

IMPORTANTE:
- Si requiere base de datos, responde SOLO JSON válido.
- NO escribas texto adicional.
- NO uses markdown.
- NO expliques el JSON.

FORMATO:

{
  "action": "",
  "mascota_nombre": "",
  "ciudad": "",
  "requiereSQL": true
}

ACCIONES VÁLIDAS:

consulta_mascota
listar_mascotas
consultar_vacunas
consultar_historial_medico
buscar_paseadores_ciudad
buscar_veterinarios_ciudad
consultar_servicios
consultar_solicitudes
none

REGLAS:

- "Háblame de mi mascota Candy"
→ consulta_mascota

- "¿Qué mascotas tengo?"
→ listar_mascotas

- "Vacunas de Candy"
→ consultar_vacunas

- "Historial médico de Candy"
→ consultar_historial_medico

- "Paseadores en Cali"
→ buscar_paseadores_ciudad

- "Veterinarios en Cali"
→ buscar_veterinarios_ciudad

- "Mis servicios"
→ consultar_servicios

- "Mis solicitudes"
→ consultar_solicitudes

Si NO necesita SQL:
responde texto normal y amigable.
`;

    const detectResp =
      await openai.chat.completions.create({

        model: "gpt-4o-mini",

        temperature: 0,

        max_tokens: 200,

        messages: [
          {
            role: "system",
            content: detectPrompt,
          },
          {
            role: "user",
            content: message,
          },
        ],
      });

    const detectText =
      detectResp.choices?.[0]?.message?.content?.trim() || "";

    let intent = null;

    if (
      detectText.startsWith("{") &&
      detectText.endsWith("}")
    ) {
      try {
        intent = JSON.parse(detectText);
      } catch (err) {
        console.error("JSON PARSE ERROR:", err);
      }
    }

    // =========================================================
    // NO SQL
    // =========================================================

    if (
      !intent ||
      !intent.requiereSQL ||
      intent.action === "none"
    ) {

      return res.json({
        reply:
          detectText ||
          "No entendí tu solicitud.",
      });
    }

    // =========================================================
    // 2. CONSULTAS SQL
    // =========================================================

    let dataForAI = {
      mascota: null,
      mascotas: [],
      vacunas: [],
      historial: [],
      paseadores: [],
      veterinarios: [],
      servicios: [],
      solicitudes: [],
    };

    // =========================================================
    // SWITCH
    // =========================================================

    switch (intent.action) {

      // =====================================================
      // CONSULTA MASCOTA
      // =====================================================

      case "consulta_mascota": {

        const mascotaNombre =
          intent.mascota_nombre?.trim();

        const q = await pool.query(
          `
          SELECT
            nombre,
            especie,
            raza,
            edad,
            peso,
            sexo,
            color,
            notas
          FROM mascotas
          WHERE usuario_id = $1
          AND LOWER(nombre) = LOWER($2)
          LIMIT 1
          `,
          [userId, mascotaNombre]
        );

        if (q.rows.length === 0) {
          return res.json({
            reply: `No encontré una mascota llamada ${mascotaNombre}.`,
          });
        }

        dataForAI.mascota = q.rows[0];

        break;
      }

      // =====================================================
      // LISTAR MASCOTAS
      // =====================================================

      case "listar_mascotas": {

        const q = await pool.query(
          `
          SELECT
            nombre,
            especie,
            raza,
            edad
          FROM mascotas
          WHERE usuario_id = $1
          AND activo = true
          ORDER BY nombre ASC
          `,
          [userId]
        );

        dataForAI.mascotas = q.rows;

        break;
      }

      // =====================================================
      // VACUNAS
      // =====================================================

      case "consultar_vacunas": {

        const mascotaNombre =
          intent.mascota_nombre?.trim();

        const mascotaQ = await pool.query(
          `
          SELECT
            id,
            nombre
          FROM mascotas
          WHERE usuario_id = $1
          AND LOWER(nombre) = LOWER($2)
          LIMIT 1
          `,
          [userId, mascotaNombre]
        );

        if (mascotaQ.rows.length === 0) {
          return res.json({
            reply: `No encontré la mascota ${mascotaNombre}.`,
          });
        }

        const mascota = mascotaQ.rows[0];

        const vacunasQ = await pool.query(
          `
          SELECT
            nombre,
            fecha_aplicacion,
            fecha_proxima,
            veterinario
          FROM vacunas
          WHERE mascota_id = $1
          ORDER BY fecha_aplicacion DESC
          `,
          [mascota.id]
        );

        dataForAI.mascota = mascota;
        dataForAI.vacunas = vacunasQ.rows;

        break;
      }

      // =====================================================
      // HISTORIAL MÉDICO
      // =====================================================

      case "consultar_historial_medico": {

        const mascotaNombre =
          intent.mascota_nombre?.trim();

        const mascotaQ = await pool.query(
          `
          SELECT
            id,
            nombre
          FROM mascotas
          WHERE usuario_id = $1
          AND LOWER(nombre) = LOWER($2)
          LIMIT 1
          `,
          [userId, mascotaNombre]
        );

        if (mascotaQ.rows.length === 0) {
          return res.json({
            reply: `No encontré la mascota ${mascotaNombre}.`,
          });
        }

        const historialQ = await pool.query(
          `
          SELECT
            fecha,
            tipo,
            descripcion,
            veterinario,
            notas
          FROM historial_medico
          WHERE mascota_id = $1
          ORDER BY fecha DESC
          `,
          [mascotaQ.rows[0].id]
        );

        dataForAI.mascota = mascotaQ.rows[0];
        dataForAI.historial = historialQ.rows;

        break;
      }

      // =====================================================
      // PASEADORES
      // =====================================================

      case "buscar_paseadores_ciudad": {

        const ciudad =
          intent.ciudad?.trim() || userCity;

        const q = await pool.query(
          `
          SELECT
            u.nombre,
            p.tarifa,
            p.calificacion,
            p.experiencia,
            p.especialidad
          FROM perfil_paseador p
          INNER JOIN usuarios u
          ON u.id = p.usuario_id
          WHERE LOWER(p.ciudad) = LOWER($1)
          AND p.disponible = true
          LIMIT 5
          `,
          [ciudad]
        );

        dataForAI.paseadores = q.rows;

        break;
      }

      // =====================================================
      // VETERINARIOS
      // =====================================================

      case "buscar_veterinarios_ciudad": {

        const ciudad =
          intent.ciudad?.trim() || userCity;

        const q = await pool.query(
          `
          SELECT
            nombre_establecimiento,
            especialidad,
            experiencia,
            calificacion,
            horarios
          FROM perfil_veterinario
          WHERE LOWER(ciudad) = LOWER($1)
          AND disponible = true
          LIMIT 5
          `,
          [ciudad]
        );

        dataForAI.veterinarios = q.rows;

        break;
      }

      // =====================================================
      // SERVICIOS
      // =====================================================

      case "consultar_servicios": {

        const q = await pool.query(
          `
          SELECT
            tipo_servicio,
            estado,
            fecha
          FROM servicios
          WHERE id_dueno = $1
          ORDER BY fecha DESC
          LIMIT 10
          `,
          [userId]
        );

        dataForAI.servicios = q.rows;

        break;
      }

      // =====================================================
      // SOLICITUDES
      // =====================================================

      case "consultar_solicitudes": {

        const q = await pool.query(
          `
          SELECT
            estado,
            fecha_servicio,
            hora_servicio,
            precio_acordado
          FROM solicitudes
          WHERE dueno_id = $1
          ORDER BY fecha_creacion DESC
          LIMIT 10
          `,
          [userId]
        );

        dataForAI.solicitudes = q.rows;

        break;
      }

      // =====================================================
      // DEFAULT
      // =====================================================

      default:
        return res.json({
          reply: "No entendí la solicitud.",
        });
    }

    // =========================================================
    // 3. RESPUESTA NATURAL
    // =========================================================

    const reasoningPrompt = `
Eres AllyBot.

El usuario se llama ${userName}.

Tu trabajo es responder de manera:
- natural
- amigable
- clara
- útil

REGLAS:
- Usa los datos reales proporcionados.
- No inventes información.
- No uses markdown.
- No respondas como robot.
- Máximo 2 o 3 párrafos cortos.
`;

    const reasoningUser = `
Pregunta del usuario:
${message}

Datos encontrados:
${JSON.stringify(dataForAI, null, 2)}
`;

    const reasoningResp =
      await openai.chat.completions.create({

        model: "gpt-4o-mini",

        temperature: 0.7,

        max_tokens: 500,

        messages: [
          {
            role: "system",
            content: reasoningPrompt,
          },
          {
            role: "user",
            content: reasoningUser,
          },
        ],
      });

    const finalReply =
      reasoningResp.choices?.[0]?.message?.content ||
      "No pude generar una respuesta.";

    // =========================================================
    // RESPONSE
    // =========================================================

    return res.json({
      reply: finalReply,
    });

  } catch (error) {

    console.error("CHATBOT ERROR:", error);

    return res.status(500).json({
      reply: "Error interno del chatbot.",
    });
  }
});

export default router;