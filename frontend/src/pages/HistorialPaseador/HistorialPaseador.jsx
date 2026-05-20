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

const BADGE_ESTADO = {
  pendiente:  { bg: "rgba(254,249,195,.92)", color: "#92400E", border: "#FDE68A", label: "Pendiente",  accent: "#F59E0B" },
  aceptada:   { bg: "rgba(235,247,228,.92)", color: "#3A7A2A", border: "#C6EDBA", label: "Aceptada",   accent: "#6CC04A" },
  completada: { bg: "rgba(239,246,255,.92)", color: "#1E40AF", border: "#BFDBFE", label: "Completada", accent: "#3B82F6" },
  cancelada:  { bg: "rgba(243,244,246,.92)", color: "#6B7280", border: "#E5E7EB", label: "Cancelada",  accent: "#9CA3AF" },
  rechazada:  { bg: "rgba(254,226,226,.92)", color: "#B91C1C", border: "#FECACA", label: "Rechazada",  accent: "#EF4444" },
};

function formatFecha(fecha) {
  if (!fecha) return "Fecha inválida";
  const f = new Date(fecha);
  if (isNaN(f)) return "Fecha inválida";
  return f.toLocaleDateString("es-CO", {
    day: "numeric", month: "long", year: "numeric",
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

function getIniciales(nombre = "") {
  return nombre.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
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
      notify("Servicio marcado como completado");
    } catch (err) {
      notify(err.message, "error");
    } finally {
      setCompletando(null);
      setConfirmId(null);
    }
  };

  return (
    <div className="hp-page">

      {/* ENCABEZADO */}
      <div className="hp-head">
        <div className="hp-head-titles">
          <h1>Historial de servicios</h1>
          <p>Todas las solicitudes que has recibido como paseador</p>
        </div>
        {!cargando && (
          <span className="hp-head-counter">
            {solicitudes.length} solicitud{solicitudes.length !== 1 ? "es" : ""}
          </span>
        )}
      </div>

      {/* FILTROS */}
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

      {/* LOADING */}
      {cargando && (
        <div className="hp-loading">
          <div className="hp-spinner" />
          <span>Cargando historial…</span>
        </div>
      )}

      {/* VACÍO */}
      {!cargando && solicitudes.length === 0 && (
        <div className="hp-empty">
          <div className="hp-empty-icon">📋</div>
          <h3>Sin solicitudes</h3>
          <p>No tienes solicitudes {filtroEstado ? `con estado "${filtroEstado}"` : "registradas"}.</p>
        </div>
      )}

      {/* LISTA */}
      {!cargando && solicitudes.length > 0 && (
        <div className="hp-lista">
          {solicitudes.map(s => {
            const est      = BADGE_ESTADO[s.estado] || BADGE_ESTADO.pendiente;
            const podemos  = s.estado === "aceptada" && puedeCompletar(s.fecha_servicio);
            const fotoMascota = s.mascota_foto
              ? (s.mascota_foto.startsWith("/uploads") ? `${PET_API}${s.mascota_foto}` : s.mascota_foto)
              : null;

            return (
              <div key={s.id} className="hp-card">

                {/* ── HERO: foto grande de la mascota ── */}
                <div className="hp-hero">
                  {fotoMascota ? (
                    <img
                      className="hp-hero-img"
                      src={fotoMascota}
                      alt={s.mascota_nombre}
                      onError={e => {
                        e.target.style.display = "none";
                        e.target.nextSibling.style.display = "flex";
                      }}
                    />
                  ) : null}
                  <div
                    className="hp-hero-emoji"
                    style={{ display: fotoMascota ? "none" : "flex" }}
                  >
                    🐶
                  </div>
                  <div className="hp-hero-fade" />
                  <span
                    className="hp-badge-float"
                    style={{ background: est.bg, color: est.color, borderColor: est.border }}
                  >
                    {est.label}
                  </span>
                  <div className="hp-hero-info">
                    <div className="hp-pet-name">{s.mascota_nombre}</div>
                    <div className="hp-pet-raza">{s.mascota_raza || s.mascota_especie}</div>
                  </div>
                </div>

                {/* Barra acento */}
                <div className="hp-accent" style={{ background: est.accent }} />

                {/* BODY */}
                <div className="hp-body">

                  {/* Dueño */}
                  <div className="hp-dueno">
                    <div className="hp-avatar">
                      {s.dueno_foto
                        ? <img src={s.dueno_foto} alt={s.dueno_nombre} />
                        : <span>{getIniciales(s.dueno_nombre)}</span>
                      }
                    </div>
                    <div className="hp-dueno-info">
                      <strong>{s.dueno_nombre}</strong>
                      <small>{s.dueno_telefono || "Dueño"}</small>
                    </div>
                  </div>

                  {/* Detalles */}
                  <div className="hp-detalles">
                    <div className="hp-det">
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="3" y="4" width="18" height="18" rx="2"/>
                        <line x1="16" y1="2" x2="16" y2="6"/>
                        <line x1="8" y1="2" x2="8" y2="6"/>
                        <line x1="3" y1="10" x2="21" y2="10"/>
                      </svg>
                      <span>{formatFecha(s.fecha_servicio)}</span>
                    </div>
                    <div className="hp-det">
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10"/>
                        <polyline points="12 6 12 12 16 14"/>
                      </svg>
                      <span>{s.hora_servicio?.slice(0, 5)} · {formatDuracion(s.duracion_minutos)}</span>
                    </div>
                  </div>

                </div>

                {/* FOOTER según estado */}
                {s.estado === "aceptada" ? (
                  <div className="hp-foot">
                    {podemos ? (
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
                              {completando === s.id && <div className="hp-spinner-sm" />}
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                <polyline points="20 6 9 17 4 12"/>
                              </svg>
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
                    )}
                  </div>
                ) : (
                  <div style={{ height: "14px" }} />
                )}

              </div>
            );
          })}
        </div>
      )}

      {/* TOAST */}
      {toast && <div className={`hp-toast ${toast.tipo}`}>{toast.msg}</div>}

    </div>
  );
}