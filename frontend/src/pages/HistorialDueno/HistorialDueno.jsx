import { useState, useEffect } from "react";
import { obtenerHistorialDueno, cancelarSolicitud } from "../../services/solicitud.service";
import "./HistorialDueno.css";

const PAS_API = "http://localhost:3006";
const PET_API = "http://localhost:3003";

const ESTADOS = [
  { value: "",            label: "Todas"      },
  { value: "pendiente",   label: "Pendientes" },
  { value: "aceptada",    label: "Aceptadas"  },
  { value: "completada",  label: "Completadas"},
  { value: "cancelada",   label: "Canceladas" },
  { value: "rechazada",   label: "Rechazadas" },
];

const COLORES_ESTADO = {
  pendiente:  { bg: "#FEF9C3", color: "#92400E", border: "#FDE68A", label: "Pendiente"  },
  aceptada:   { bg: "#EBF7E4", color: "#3A7A2A", border: "#C6EDBA", label: "Aceptada"   },
  completada: { bg: "#EFF6FF", color: "#1E40AF", border: "#BFDBFE", label: "Completada" },
  cancelada:  { bg: "#F3F4F6", color: "#6B7280", border: "#E5E7EB", label: "Cancelada"  },
  rechazada:  { bg: "#FEE2E2", color: "#B91C1C", border: "#FECACA", label: "Rechazada"  },
};

function formatFecha(fecha) {
  return new Date(fecha + "T00:00:00").toLocaleDateString("es-CO", {
    day: "numeric", month: "long", year: "numeric",
  });
}

function formatDuracion(minutos) {
  if (minutos < 60) return `${minutos} min`;
  const h = Math.floor(minutos / 60);
  const m = minutos % 60;
  return m > 0 ? `${h}h ${m}min` : `${h} hora${h > 1 ? "s" : ""}`;
}

export default function HistorialDueno() {
  const token = localStorage.getItem("token");

  const [solicitudes,  setSolicitudes]  = useState([]);
  const [cargando,     setCargando]     = useState(true);
  const [filtroEstado, setFiltroEstado] = useState("");
  const [cancelando,   setCancelando]   = useState(null);
  const [confirmId,    setConfirmId]    = useState(null);
  const [toast,        setToast]        = useState(null);

  const notify = (msg, tipo = "ok") => {
    setToast({ msg, tipo });
    setTimeout(() => setToast(null), 3000);
  };

  const cargar = async (estado = "") => {
    setCargando(true);
    try {
      const data = await obtenerHistorialDueno(token, estado);
      setSolicitudes(data.data || []);
    } catch {
      notify("Error al cargar el historial", "error");
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => { cargar(filtroEstado); }, [filtroEstado]);

  const handleCancelar = async (id) => {
    setCancelando(id);
    try {
      await cancelarSolicitud(id, token);
      setSolicitudes(prev =>
        prev.map(s => s.id === id ? { ...s, estado: "cancelada" } : s)
      );
      notify("Solicitud cancelada correctamente");
    } catch (err) {
      notify(err.message, "error");
    } finally {
      setCancelando(null);
      setConfirmId(null);
    }
  };

  return (
    <div className="hd-page">

      {/* ENCABEZADO */}
      <div className="hd-head">
        <div>
          <h1>Mis solicitudes</h1>
          <p>Historial de todos los paseos que has solicitado</p>
        </div>
      </div>

      {/* FILTROS */}
      <div className="hd-filtros">
        {ESTADOS.map(e => (
          <button
            key={e.value}
            className={`hd-filtro ${filtroEstado === e.value ? "activo" : ""}`}
            onClick={() => setFiltroEstado(e.value)}
          >
            {e.label}
          </button>
        ))}
      </div>

      {/* LOADING */}
      {cargando && (
        <div className="hd-loading">
          <div className="hd-spinner" />
          <span>Cargando historial…</span>
        </div>
      )}

      {/* VACÍO */}
      {!cargando && solicitudes.length === 0 && (
        <div className="hd-empty">
          <div className="hd-empty-icon">📋</div>
          <h3>Sin solicitudes</h3>
          <p>No tienes solicitudes {filtroEstado ? `con estado "${filtroEstado}"` : "registradas"}.</p>
        </div>
      )}

      {/* LISTA */}
      {!cargando && (
        <div className="hd-lista">
          {solicitudes.map(s => {
            const est = COLORES_ESTADO[s.estado] || COLORES_ESTADO.pendiente;
            return (
              <div key={s.id} className="hd-card">

                {/* Header card */}
                <div className="hd-card-header">
                  <div className="hd-paseador">
                    <div className="hd-avatar">
                      {s.paseador_foto
                        ? <img src={s.paseador_foto.startsWith("/uploads") ? `${PAS_API}${s.paseador_foto}` : s.paseador_foto} alt={s.paseador_nombre} />
                        : <span>{s.paseador_nombre?.[0]?.toUpperCase()}</span>
                      }
                    </div>
                    <div>
                      <strong>{s.paseador_nombre}</strong>
                      <span>Paseador</span>
                    </div>
                  </div>
                  <span
                    className="hd-estado-badge"
                    style={{ background: est.bg, color: est.color, borderColor: est.border }}
                  >
                    {est.label}
                  </span>
                </div>

                <div className="hd-divider" />

                {/* Mascota */}
                <div className="hd-mascota-row">
                  <div className="hd-mascota-foto">
                    {s.mascota_foto
                      ? <img src={s.mascota_foto.startsWith("/uploads") ? `${PET_API}${s.mascota_foto}` : s.mascota_foto} alt={s.mascota_nombre} />
                      : <span>🐶</span>
                    }
                  </div>
                  <div>
                    <strong>{s.mascota_nombre}</strong>
                    <span>{s.mascota_raza || s.mascota_especie}</span>
                  </div>
                </div>

                {/* Detalles */}
                <div className="hd-detalles">
                  <div className="hd-detalle">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="4" width="18" height="18" rx="2"/>
                      <line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/>
                      <line x1="3" y1="10" x2="21" y2="10"/>
                    </svg>
                    <span>{formatFecha(s.fecha_servicio)}</span>
                  </div>
                  <div className="hd-detalle">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                    </svg>
                    <span>{s.hora_servicio?.slice(0, 5)} — {formatDuracion(s.duracion_minutos)}</span>
                  </div>
                </div>

                {/* Botón cancelar solo si está pendiente */}
                {s.estado === "pendiente" && (
                  confirmId === s.id ? (
                    <div className="hd-confirm">
                      <p>¿Seguro que deseas cancelar esta solicitud?</p>
                      <div className="hd-confirm-btns">
                        <button className="hd-btn-no" onClick={() => setConfirmId(null)}>
                          No, volver
                        </button>
                        <button
                          className="hd-btn-si"
                          onClick={() => handleCancelar(s.id)}
                          disabled={cancelando === s.id}
                        >
                          {cancelando === s.id ? <div className="hd-spinner-sm" /> : null}
                          Sí, cancelar
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button className="hd-btn-cancelar" onClick={() => setConfirmId(s.id)}>
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path d="M18 6L6 18M6 6l12 12"/>
                      </svg>
                      Cancelar solicitud
                    </button>
                  )
                )}

              </div>
            );
          })}
        </div>
      )}

      {/* TOAST */}
      {toast && <div className={`hd-toast ${toast.tipo}`}>{toast.msg}</div>}

    </div>
  );
}