import { useState, useEffect } from "react";
import { obtenerHistorialPaseador, completarServicio } from "../../services/solicitud.service";
import "./HistorialPaseador.css";

const PET_API = "http://localhost:3003";

const ESTADOS = [
  { value: "",            label: "Todas"       },
  { value: "pendiente",   label: "Pendientes"  },
  { value: "aceptada",    label: "Aceptadas"   },
  { value: "completada",  label: "Completadas" },
  { value: "cancelada",   label: "Canceladas"  },
  { value: "rechazada",   label: "Rechazadas"  },
];

const COLORES_ESTADO = {
  pendiente:  { bg: "#FEF9C3", color: "#92400E", border: "#FDE68A", label: "Pendiente"  },
  aceptada:   { bg: "#EBF7E4", color: "#3A7A2A", border: "#C6EDBA", label: "Aceptada"   },
  completada: { bg: "#EFF6FF", color: "#1E40AF", border: "#BFDBFE", label: "Completada" },
  cancelada:  { bg: "#F3F4F6", color: "#6B7280", border: "#E5E7EB", label: "Cancelada"  },
  rechazada:  { bg: "#FEE2E2", color: "#B91C1C", border: "#FECACA", label: "Rechazada"  },
};

function formatFecha(fecha) {
  if (!fecha) return "Fecha inválida";

  const f = new Date(fecha);

  if (isNaN(f)) return "Fecha inválida";

  return f.toLocaleDateString("es-CO", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function formatDuracion(minutos) {
  if (minutos < 60) return `${minutos} min`;
  const h = Math.floor(minutos / 60);
  const m = minutos % 60;
  return m > 0 ? `${h}h ${m}min` : `${h} hora${h > 1 ? "s" : ""}`;
}

function puedeCompletar(fechaServicio) {
  if (!fechaServicio) return false;

  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);

  const fecha = new Date(fechaServicio);
  if (isNaN(fecha)) return false;

  fecha.setHours(0, 0, 0, 0);

  return fecha <= hoy;
}

export default function HistorialPaseador() {
  const token = localStorage.getItem("token");

  const [solicitudes,  setSolicitudes]  = useState([]);
  const [cargando,     setCargando]     = useState(true);
  const [filtroEstado, setFiltroEstado] = useState("");
  const [completando,  setCompletando]  = useState(null);
  const [confirmId,    setConfirmId]    = useState(null);
  const [toast,        setToast]        = useState(null);

  const notify = (msg, tipo = "ok") => {
    setToast({ msg, tipo });
    setTimeout(() => setToast(null), 3000);
  };

  const cargar = async (estado = "") => {
    setCargando(true);
    try {
      const data = await obtenerHistorialPaseador(token, estado);
      setSolicitudes(data.data || []);
    } catch {
      notify("Error al cargar el historial", "error");
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => { cargar(filtroEstado); }, [filtroEstado]);

  const handleCompletar = async (id) => {
    setCompletando(id);
    try {
      await completarServicio(id, token);
      setSolicitudes(prev =>
        prev.map(s => s.id === id ? { ...s, estado: "completada" } : s)
      );
      notify("✅ Servicio marcado como completado");
    } catch (err) {
      notify(err.message, "error");
    } finally {
      setCompletando(null);
      setConfirmId(null);
    }
  };

  return (
    <div className="hp-page">

      <div className="hp-head">
        <h1>Historial de servicios</h1>
        <p>Todas las solicitudes que has recibido como paseador</p>
      </div>

      <div className="hp-filtros">
        {ESTADOS.map(e => (
          <button
            key={e.value}
            className={`hp-filtro ${filtroEstado === e.value ? "activo" : ""}`}
            onClick={() => setFiltroEstado(e.value)}
          >
            {e.label}
          </button>
        ))}
      </div>

      {cargando && (
        <div className="hp-loading">
          <div className="hp-spinner" />
          <span>Cargando historial…</span>
        </div>
      )}

      {!cargando && solicitudes.length === 0 && (
        <div className="hp-empty">
          <div className="hp-empty-icon">📋</div>
          <h3>Sin solicitudes</h3>
          <p>No tienes solicitudes {filtroEstado ? `con estado "${filtroEstado}"` : "registradas"}.</p>
        </div>
      )}

      {!cargando && (
        <div className="hp-lista">
          {solicitudes.map(s => {
            const est      = COLORES_ESTADO[s.estado] || COLORES_ESTADO.pendiente;
            const podemos  = s.estado === "aceptada" && puedeCompletar(s.fecha_servicio);

            return (
              <div key={s.id} className="hp-card">

                <div className="hp-card-header">
                  <div className="hp-dueno">
                    <div className="hp-avatar">
                      {s.dueno_foto
                        ? <img src={s.dueno_foto} alt={s.dueno_nombre} />
                        : <span>{s.dueno_nombre?.[0]?.toUpperCase()}</span>
                      }
                    </div>
                    <div>
                      <strong>{s.dueno_nombre}</strong>
                      {s.dueno_telefono && <span>{s.dueno_telefono}</span>}
                    </div>
                  </div>
                  <span
                    className="hp-estado-badge"
                    style={{ background: est.bg, color: est.color, borderColor: est.border }}
                  >
                    {est.label}
                  </span>
                </div>

                <div className="hp-divider" />

                <div className="hp-mascota-row">
                  <div className="hp-mascota-foto">
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

                <div className="hp-detalles">
                  <div className="hp-detalle">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="4" width="18" height="18" rx="2"/>
                      <line x1="16" y1="2" x2="16" y2="6"/>
                      <line x1="8" y1="2" x2="8" y2="6"/>
                      <line x1="3" y1="10" x2="21" y2="10"/>
                    </svg>
                    <span>{formatFecha(s.fecha_servicio)}</span>
                  </div>
                  <div className="hp-detalle">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10"/>
                      <polyline points="12 6 12 12 16 14"/>
                    </svg>
                    <span>{s.hora_servicio?.slice(0, 5)} — {formatDuracion(s.duracion_minutos)}</span>
                  </div>
                </div>

                {/* Botón completar — solo si está aceptada y la fecha ya llegó */}
                {s.estado === "aceptada" && (
                  podemos ? (
                    confirmId === s.id ? (
                      <div className="hp-confirm">
                        <p>¿Confirmas que el servicio fue realizado?</p>
                        <div className="hp-confirm-btns">
                          <button className="hp-btn-no" onClick={() => setConfirmId(null)}>
                            Cancelar
                          </button>
                          <button
                            className="hp-btn-si"
                            onClick={() => handleCompletar(s.id)}
                            disabled={completando === s.id}
                          >
                            {completando === s.id
                              ? <div className="hp-spinner-sm" />
                              : null
                            }
                            Sí, completar
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        className="hp-btn-completar"
                        onClick={() => setConfirmId(s.id)}
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <polyline points="20 6 9 17 4 12"/>
                        </svg>
                        Marcar como completado
                      </button>
                    )
                  ) : (
                    <div className="hp-aviso-fecha">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10"/>
                        <line x1="12" y1="8" x2="12" y2="12"/>
                        <line x1="12" y1="16" x2="12.01" y2="16"/>
                      </svg>
                      Podrás completarlo el día del servicio o después
                    </div>
                  )
                )}

              </div>
            );
          })}
        </div>
      )}

      {toast && <div className={`hp-toast ${toast.tipo}`}>{toast.msg}</div>}
    </div>
  );
}