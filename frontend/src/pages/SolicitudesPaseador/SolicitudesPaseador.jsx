import { useState, useEffect } from "react";
import { obtenerSolicitudesPendientes, responderSolicitud } from "../../services/solicitud.service";
import "./SolicitudesPaseador.css";

const PAS_API = "http://localhost:3006";
const PET_API = "http://localhost:3003";

function formatFecha(fecha) {
  return new Date(fecha + "T00:00:00").toLocaleDateString("es-CO", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  });
}

function formatDuracion(minutos) {
  if (minutos < 60) return `${minutos} min`;
  const h = Math.floor(minutos / 60);
  const m = minutos % 60;
  return m > 0 ? `${h}h ${m}min` : `${h} hora${h > 1 ? "s" : ""}`;
}

export default function SolicitudesPaseador() {
  const token = localStorage.getItem("token");

  const [solicitudes, setSolicitudes] = useState([]);
  const [cargando,    setCargando]    = useState(true);
  const [error,       setError]       = useState(null);
  const [procesando,  setProcesando]  = useState(null); // id de solicitud en proceso
  const [toast,       setToast]       = useState(null);

  const notify = (msg, tipo = "ok") => {
    setToast({ msg, tipo });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    cargarSolicitudes();
  }, []);

  const cargarSolicitudes = async () => {
    setCargando(true);
    setError(null);
    try {
      const data = await obtenerSolicitudesPendientes(token);
      setSolicitudes(data.data || []);
    } catch (err) {
      setError("No se pudieron cargar las solicitudes.");
    } finally {
      setCargando(false);
    }
  };

  const handleResponder = async (id, estado) => {
    setProcesando(id);
    try {
      await responderSolicitud(id, estado, token);
      setSolicitudes(prev => prev.filter(s => s.id !== id));
      notify(
        estado === "aceptada"
          ? "✅ Solicitud aceptada correctamente"
          : "❌ Solicitud rechazada",
        estado === "aceptada" ? "ok" : "error"
      );
    } catch (err) {
      notify(err.message, "error");
    } finally {
      setProcesando(null);
    }
  };

  if (cargando) return (
    <div className="sp2-loading">
      <div className="sp2-spinner" />
      <span>Cargando solicitudes…</span>
    </div>
  );

  return (
    <div className="sp2-page">

      {/* ENCABEZADO */}
      <div className="sp2-head">
        <div>
          <h1>Solicitudes pendientes</h1>
          <p>Acepta o rechaza las solicitudes de paseo que te han enviado</p>
        </div>
        <button className="sp2-btn-refresh" onClick={cargarSolicitudes}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
            <polyline points="23 4 23 10 17 10"/>
            <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
          </svg>
          Actualizar
        </button>
      </div>

      {/* ERROR */}
      {error && (
        <div className="sp2-error">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          {error}
        </div>
      )}

      {/* VACÍO */}
      {!error && solicitudes.length === 0 && (
        <div className="sp2-empty">
          <div className="sp2-empty-icon">🐾</div>
          <h3>Sin solicitudes pendientes</h3>
          <p>Cuando un dueño te envíe una solicitud de paseo, aparecerá aquí.</p>
        </div>
      )}

      {/* LISTA */}
      <div className="sp2-lista">
        {solicitudes.map(s => (
          <div key={s.id} className="sp2-card">

            {/* Badge estado */}
            <span className="sp2-badge-pendiente">Pendiente</span>

            {/* Info dueño */}
            <div className="sp2-dueno">
              <div className="sp2-avatar">
                {s.dueno_foto
                  ? <img src={s.dueno_foto.startsWith("/uploads") ? `${PAS_API}${s.dueno_foto}` : s.dueno_foto} alt={s.dueno_nombre} />
                  : <span>{s.dueno_nombre?.[0]?.toUpperCase()}</span>
                }
              </div>
              <div className="sp2-dueno-info">
                <strong>{s.dueno_nombre}</strong>
                {s.dueno_telefono && (
                  <span>
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.62 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 9.91a16 16 0 0 0 6.09 6.09l.98-.98a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
                    </svg>
                    {s.dueno_telefono}
                  </span>
                )}
              </div>
            </div>

            <div className="sp2-divider" />

            {/* Info mascota */}
            <div className="sp2-mascota">
              <div className="sp2-mascota-foto">
                {s.mascota_foto
                  ? <img src={s.mascota_foto.startsWith("/uploads") ? `${PET_API}${s.mascota_foto}` : s.mascota_foto} alt={s.mascota_nombre} />
                  : <span>🐶</span>
                }
              </div>
              <div className="sp2-mascota-info">
                <strong>{s.mascota_nombre}</strong>
                <span>{s.mascota_raza || s.mascota_especie}</span>
              </div>
            </div>

            <div className="sp2-divider" />

            {/* Detalles del servicio */}
            <div className="sp2-detalles">
              <div className="sp2-detalle">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/>
                  <line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
                </svg>
                <span>{formatFecha(s.fecha_servicio)}</span>
              </div>
              <div className="sp2-detalle">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                </svg>
                <span>{s.hora_servicio?.slice(0, 5)}</span>
              </div>
              <div className="sp2-detalle">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4"/>
                </svg>
                <span>{formatDuracion(s.duracion_minutos)}</span>
              </div>
              <div className="sp2-detalle">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                </svg>
                <span>Recibida: {new Date(s.fecha_creacion).toLocaleDateString("es-CO")}</span>
              </div>
            </div>

            {/* Botones */}
            <div className="sp2-acciones">
              <button
                className="sp2-btn-rechazar"
                onClick={() => handleResponder(s.id, "rechazada")}
                disabled={procesando === s.id}
              >
                {procesando === s.id ? (
                  <div className="sp2-btn-spinner" />
                ) : (
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M18 6L6 18M6 6l12 12"/>
                  </svg>
                )}
                Rechazar
              </button>
              <button
                className="sp2-btn-aceptar"
                onClick={() => handleResponder(s.id, "aceptada")}
                disabled={procesando === s.id}
              >
                {procesando === s.id ? (
                  <div className="sp2-btn-spinner" />
                ) : (
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                )}
                Aceptar
              </button>
            </div>

          </div>
        ))}
      </div>

      {/* TOAST */}
      {toast && (
        <div className={`sp2-toast ${toast.tipo}`}>
          {toast.msg}
        </div>
      )}

    </div>
  );
}