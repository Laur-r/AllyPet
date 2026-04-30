import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { crearSolicitud } from "../../services/solicitud.service";
import "./SolicitarPaseo.css";

const PAS_API = "http://localhost:3006";
const PET_API = "http://localhost:3003";

export default function SolicitarPaseo() {
  const { paseadorId } = useParams();
  const navigate       = useNavigate();

  const user    = JSON.parse(localStorage.getItem("user") || "{}");
  const token   = localStorage.getItem("token");
  const duenoId = user?.id || user?.usuario_id;

  const [paseador,  setPaseador]  = useState(null);
  const [mascotas,  setMascotas]  = useState([]);
  const [cargando,  setCargando]  = useState(true);
  const [enviando,  setEnviando]  = useState(false);
  const [exito,     setExito]     = useState(false);
  const [error,     setError]     = useState(null);

  const [form, setForm] = useState({
    mascota_id:       "",
    fecha_servicio:   "",
    hora_servicio:    "",
    duracion_minutos: "60",
  });

  useEffect(() => {
    Promise.all([
      fetch(`${PAS_API}/api/perfil-paseador/publico/${paseadorId}`)
        .then(r => r.json()),
      fetch(`${PET_API}/api/pets`, {
  headers: { Authorization: `Bearer ${token}` },
}).then(r => r.json()),
    ])
      .then(([datosPaseador, datosMascotas]) => {
        setPaseador(datosPaseador.data || null);
        const lista = Array.isArray(datosMascotas)
          ? datosMascotas
          : Array.isArray(datosMascotas?.mascotas)
          ? datosMascotas.mascotas
          : Array.isArray(datosMascotas?.data)
          ? datosMascotas.data
          : [];
        setMascotas(lista);
      })
      .catch(() => setError("Error al cargar los datos. Intenta de nuevo."))
      .finally(() => setCargando(false));
  }, [paseadorId]);

  const handleChange = (e) => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async () => {
    setError(null);

    if (!form.mascota_id || !form.fecha_servicio || !form.hora_servicio || !form.duracion_minutos) {
      setError("Por favor completa todos los campos.");
      return;
    }

    setEnviando(true);
    try {
      await crearSolicitud(
        {
          paseador_id:      Number(paseadorId),
          mascota_id:       Number(form.mascota_id),
          fecha_servicio:   form.fecha_servicio,
          hora_servicio:    form.hora_servicio,
          duracion_minutos: Number(form.duracion_minutos),
        },
        token
      );
      setExito(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setEnviando(false);
    }
  };

const hoy = new Date().toLocaleDateString("en-CA");
  if (cargando) return (
    <div className="sp-loading">
      <div className="sp-spinner" />
      <span>Cargando información…</span>
    </div>
  );

  if (exito) return (
    <div className="sp-exito">
      <div className="sp-exito-icon">🐾</div>
      <h2>¡Solicitud enviada!</h2>
      <p>Tu solicitud de paseo fue enviada correctamente. El paseador la revisará pronto.</p>
      <div className="sp-exito-btns">
        <button className="sp-btn-primario" onClick={() => navigate("/menu/dueno/historial-solicitudes")}>
          Ver mis solicitudes
        </button>
        <button className="sp-btn-secundario" onClick={() => navigate(-1)}>
          Volver al perfil
        </button>
      </div>
    </div>
  );

  return (
    <div className="sp-page">

      <div className="sp-head">
        <button className="sp-back" onClick={() => navigate(-1)}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M19 12H5M5 12l7 7M5 12l7-7"/>
          </svg>
          Volver
        </button>
        <h1>Solicitar paseo</h1>
        <p>Completa el formulario para enviar tu solicitud</p>
      </div>

      <div className="sp-layout">

        <div className="sp-form-card">

          {paseador && (
            <div className="sp-paseador-mini">
              <img
                src={
                  paseador.foto_perfil
                    ? paseador.foto_perfil.startsWith("/uploads")
                      ? `${PAS_API}${paseador.foto_perfil}`
                      : paseador.foto_perfil
                    : "https://i.pravatar.cc/300?img=57"
                }
                alt={paseador.nombre}
                className="sp-paseador-foto"
              />
              <div className="sp-paseador-info">
                <strong>{paseador.nombre}</strong>
                <span>{paseador.especialidad}</span>
                <span className="sp-tarifa">
                  ${paseador.tarifa ? Number(paseador.tarifa).toLocaleString("es-CO") : "—"} / servicio
                </span>
              </div>
            </div>
          )}

          <div className="sp-divider" />

          <div className="sp-campo">
            <label className="sp-label">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="4" r="2"/>
                <circle cx="18" cy="8" r="2"/>
                <path d="M9.27 7.26 4 17m11-6-2.15 5.4M4 17h16m-5 0 3-6 3.27 3.27"/>
              </svg>
              ¿Qué mascota va al paseo?
            </label>
            {mascotas.length === 0 ? (
              <div className="sp-aviso">
                No tienes mascotas registradas.{" "}
                <span className="sp-link" onClick={() => navigate("/menu/dueno/mascotas")}>
                  Registra una aquí
                </span>
              </div>
            ) : (
              <select name="mascota_id" value={form.mascota_id} onChange={handleChange} className="sp-select">
                <option value="">Selecciona una mascota</option>
                {mascotas.map(m => (
                  <option key={m.id} value={m.id}>
                    {m.nombre} ({m.raza || m.especie})
                  </option>
                ))}
              </select>
            )}
          </div>

          <div className="sp-campo">
            <label className="sp-label">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="4" width="18" height="18" rx="2"/>
                <line x1="16" y1="2" x2="16" y2="6"/>
                <line x1="8" y1="2" x2="8" y2="6"/>
                <line x1="3" y1="10" x2="21" y2="10"/>
              </svg>
              Fecha del paseo
            </label>
            <input
              type="date"
              name="fecha_servicio"
              value={form.fecha_servicio}
              min={hoy}
              onChange={handleChange}
              className="sp-input"
            />
          </div>

          <div className="sp-campo">
            <label className="sp-label">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/>
                <polyline points="12 6 12 12 16 14"/>
              </svg>
              Hora del paseo
            </label>
            <input
              type="time"
              name="hora_servicio"
              value={form.hora_servicio}
              onChange={handleChange}
              className="sp-input"
            />
          </div>

          <div className="sp-campo">
            <label className="sp-label">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
              </svg>
              Duración
            </label>
            <select name="duracion_minutos" value={form.duracion_minutos} onChange={handleChange} className="sp-select">
              <option value="30">30 minutos</option>
              <option value="60">1 hora</option>
              <option value="90">1 hora 30 min</option>
              <option value="120">2 horas</option>
            </select>
          </div>

          {error && (
            <div className="sp-error">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="8" x2="12" y2="12"/>
                <line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              {error}
            </div>
          )}

          <button
            className="sp-btn-enviar"
            onClick={handleSubmit}
            disabled={enviando || mascotas.length === 0}
          >
            {enviando ? (
              <><div className="sp-btn-spinner" /> Enviando solicitud…</>
            ) : (
              <>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="22" y1="2" x2="11" y2="13"/>
                  <polygon points="22 2 15 22 11 13 2 9 22 2"/>
                </svg>
                Enviar solicitud
              </>
            )}
          </button>

        </div>

        <div className="sp-resumen">
          <h3 className="sp-resumen-titulo">Resumen</h3>
          <div className="sp-resumen-item">
            <span>Mascota</span>
            <strong>
              {mascotas.find(m => m.id === Number(form.mascota_id))?.nombre || "—"}
            </strong>
          </div>
          <div className="sp-resumen-item">
            <span>Fecha</span>
            <strong>
              {form.fecha_servicio
                ? new Date(form.fecha_servicio + "T00:00:00").toLocaleDateString("es-CO", {
                    day: "numeric", month: "long", year: "numeric",
                  })
                : "—"}
            </strong>
          </div>
          <div className="sp-resumen-item">
            <span>Hora</span>
            <strong>{form.hora_servicio || "—"}</strong>
          </div>
          <div className="sp-resumen-item">
            <span>Duración</span>
            <strong>
              {form.duracion_minutos === "30"  ? "30 min"   :
               form.duracion_minutos === "60"  ? "1 hora"   :
               form.duracion_minutos === "90"  ? "1h 30min" :
               form.duracion_minutos === "120" ? "2 horas"  : "—"}
            </strong>
          </div>
          <div className="sp-resumen-divider" />
          <div className="sp-resumen-estado">
            <span className="sp-estado-badge">Pendiente de aceptación</span>
          </div>
        </div>

      </div>
    </div>
  );
}