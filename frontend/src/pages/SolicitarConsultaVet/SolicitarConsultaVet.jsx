import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { crearSolicitudVet } from "../../services/solicitud.service";
import "./SolicitarConsultaVet.css";

const VET_API = "http://localhost:3005";
const PET_API = "http://localhost:3003";

export default function SolicitarConsultaVet() {
const { usuarioId } = useParams();
  const navigate          = useNavigate();

  const user    = JSON.parse(localStorage.getItem("user") || "{}");
  const token   = localStorage.getItem("token");

  const [veterinario, setVeterinario] = useState(null);
  const [mascotas,    setMascotas]    = useState([]);
  const [cargando,    setCargando]    = useState(true);
  const [enviando,    setEnviando]    = useState(false);
  const [exito,       setExito]       = useState(false);
  const [error,       setError]       = useState(null);

  const [form, setForm] = useState({
    mascota_id:     "",
    fecha_servicio: "",
    hora_servicio:  "",
  });

  useEffect(() => {
    Promise.all([
      fetch(`${VET_API}/api/veterinarios/publico/${usuarioId}`)
        .then(r => r.json()),
      fetch(`${PET_API}/api/pets`, {
        headers: { Authorization: `Bearer ${token}` },
      }).then(r => r.json()),
    ])
      .then(([datosVet, datosMascotas]) => {
        setVeterinario(datosVet.data || null);
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
  }, [usuarioId]);

  const handleChange = (e) => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async () => {
    setError(null);

    if (!form.mascota_id || !form.fecha_servicio || !form.hora_servicio) {
      setError("Por favor completa todos los campos.");
      return;
    }

    setEnviando(true);
    try {
      await crearSolicitudVet(
        {
          veterinario_id: Number(usuarioId),
          mascota_id:     Number(form.mascota_id),
          fecha_servicio: form.fecha_servicio,
          hora_servicio:  form.hora_servicio,
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
    <div className="scv-loading">
      <div className="scv-spinner" />
      <span>Cargando información…</span>
    </div>
  );

  if (exito) return (
    <div className="scv-exito">
      <div className="scv-exito-icon">🐾</div>
      <h2>¡Solicitud enviada!</h2>
      <p>Tu solicitud de consulta fue enviada correctamente. El veterinario la revisará pronto.</p>
      <div className="scv-exito-btns">
        <button className="scv-btn-primario" onClick={() => navigate("/menu/dueno/historial-solicitudes")}>
          Ver mis solicitudes
        </button>
        <button className="scv-btn-secundario" onClick={() => navigate(-1)}>
          Volver al perfil
        </button>
      </div>
    </div>
  );

  return (
    <div className="scv-page">

      <div className="scv-head">
        <button className="scv-back" onClick={() => navigate(-1)}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M19 12H5M5 12l7 7M5 12l7-7"/>
          </svg>
          Volver
        </button>
        <h1>Solicitar consulta</h1>
        <p>Completa el formulario para enviar tu solicitud</p>
      </div>

      <div className="scv-layout">

        <div className="scv-form-card">

          {veterinario && (
            <div className="scv-vet-mini">
              <img
                src={
                  veterinario.foto_perfil
                    ? veterinario.foto_perfil.startsWith("/uploads")
                      ? `${VET_API}${veterinario.foto_perfil}`
                      : veterinario.foto_perfil
                    : "https://i.pravatar.cc/300?img=12"
                }
                alt={veterinario.nombre_establecimiento}
                className="scv-vet-foto"
              />
              <div className="scv-vet-info">
                <strong>{veterinario.nombre_establecimiento}</strong>
                <span>{veterinario.especialidad}</span>
                <span className="scv-ciudad">{veterinario.ciudad}</span>
              </div>
            </div>
          )}

          <div className="scv-divider" />

          <div className="scv-campo">
            <label className="scv-label">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="4" r="2"/>
                <circle cx="18" cy="8" r="2"/>
                <path d="M9.27 7.26 4 17m11-6-2.15 5.4M4 17h16m-5 0 3-6 3.27 3.27"/>
              </svg>
              ¿Qué mascota va a la consulta?
            </label>
            {mascotas.length === 0 ? (
              <div className="scv-aviso">
                No tienes mascotas registradas.{" "}
                <span className="scv-link" onClick={() => navigate("/menu/dueno/mascotas")}>
                  Registra una aquí
                </span>
              </div>
            ) : (
              <select name="mascota_id" value={form.mascota_id} onChange={handleChange} className="scv-select">
                <option value="">Selecciona una mascota</option>
                {mascotas.map(m => (
                  <option key={m.id} value={m.id}>
                    {m.nombre} ({m.raza || m.especie})
                  </option>
                ))}
              </select>
            )}
          </div>

          <div className="scv-campo">
            <label className="scv-label">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="4" width="18" height="18" rx="2"/>
                <line x1="16" y1="2" x2="16" y2="6"/>
                <line x1="8" y1="2" x2="8" y2="6"/>
                <line x1="3" y1="10" x2="21" y2="10"/>
              </svg>
              Fecha de la consulta
            </label>
            <input
              type="date"
              name="fecha_servicio"
              value={form.fecha_servicio}
              min={hoy}
              onChange={handleChange}
              className="scv-input"
            />
          </div>

          <div className="scv-campo">
            <label className="scv-label">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/>
                <polyline points="12 6 12 12 16 14"/>
              </svg>
              Hora de la consulta
            </label>
            <input
              type="time"
              name="hora_servicio"
              value={form.hora_servicio}
              onChange={handleChange}
              className="scv-input"
            />
          </div>

          {error && (
            <div className="scv-error">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="8" x2="12" y2="12"/>
                <line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              {error}
            </div>
          )}

          <button
            className="scv-btn-enviar"
            onClick={handleSubmit}
            disabled={enviando || mascotas.length === 0}
          >
            {enviando ? (
              <><div className="scv-btn-spinner" /> Enviando solicitud…</>
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

        <div className="scv-resumen">
          <h3 className="scv-resumen-titulo">Resumen</h3>
          <div className="scv-resumen-item">
            <span>Mascota</span>
            <strong>
              {mascotas.find(m => m.id === Number(form.mascota_id))?.nombre || "—"}
            </strong>
          </div>
          <div className="scv-resumen-item">
            <span>Fecha</span>
            <strong>
              {form.fecha_servicio
                ? new Date(form.fecha_servicio + "T00:00:00").toLocaleDateString("es-CO", {
                    day: "numeric", month: "long", year: "numeric",
                  })
                : "—"}
            </strong>
          </div>
          <div className="scv-resumen-item">
            <span>Hora</span>
            <strong>{form.hora_servicio || "—"}</strong>
          </div>
          <div className="scv-resumen-divider" />
          <div className="scv-resumen-estado">
            <span className="scv-estado-badge">Pendiente de aceptación</span>
          </div>
        </div>

      </div>
    </div>
  );
}