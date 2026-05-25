import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { obtenerHistorialDueno, cancelarSolicitud } from "../../services/solicitud.service";
import "./HistorialDueno.css";

const PAS_API = "http://localhost:3006";
const PET_API = "http://localhost:3003";
const PAY_API = "http://localhost:3012";
const VET_API = "http://localhost:3005";

const getToken = () => localStorage.getItem("token");

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
function getIniciales(nombre = "") {
  if (!nombre) return "?";
  return nombre.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
}
const fmt = (n) =>
  new Intl.NumberFormat("es-CO", {
    style: "currency", currency: "COP", minimumFractionDigits: 0,
  }).format(Number(n) || 0);

export default function HistorialDueno() {
  const token    = getToken();
  const navigate = useNavigate();

  const [solicitudes,  setSolicitudes]  = useState([]);
  const [cargando,     setCargando]     = useState(true);
  const [filtroEstado, setFiltroEstado] = useState("");
  const [cancelando,   setCancelando]   = useState(null);
  const [confirmId,    setConfirmId]    = useState(null);
  const [pagando,      setPagando]      = useState(null);
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

  const handleMensaje = (s) => {
    const esVet = s.tipo_servicio === "consulta_vet";
    navigate("/menu/dueno/mensajes", {
      state: {
        destinatario_id:     esVet ? s.vet_usuario_id : s.paseador_usuario_id,
        destinatario_nombre: esVet ? (s.vet_establecimiento || s.vet_nombre) : s.paseador_nombre,
        destinatario_foto:   esVet ? s.vet_foto : s.paseador_foto,
        solicitud_id:        s.id,
      },
    });
  };

  const handlePagar = async (solicitud) => {
    setPagando(solicitud.id);
    try {
      const res = await fetch(`${PAY_API}/pagos/iniciar`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ solicitud_id: solicitud.id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Error al iniciar pago");
      window.location.href = data.data.wompi_url;
    } catch (err) {
      notify(err.message || "No se pudo iniciar el pago", "error");
      setPagando(null);
    }
  };

  return (
    <div className="hd-page">

      <div className="hd-head">
        <div className="hd-head-titles">
          <h1>Mis solicitudes</h1>
          <p>Historial de todos los paseos que has solicitado</p>
        </div>
        {!cargando && (
          <span className="hd-head-counter">
            {solicitudes.length} solicitud{solicitudes.length !== 1 ? "es" : ""}
          </span>
        )}
      </div>

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

      {cargando && (
        <div className="hd-loading">
          <div className="hd-spinner" />
          <span>Cargando historial…</span>
        </div>
      )}

      {!cargando && solicitudes.length === 0 && (
        <div className="hd-empty">
          <div className="hd-empty-icon">📋</div>
          <h3>Sin solicitudes</h3>
          <p>No tienes solicitudes {filtroEstado ? `con estado "${filtroEstado}"` : "registradas"}.</p>
        </div>
      )}

      {!cargando && solicitudes.length > 0 && (
        <div className="hd-lista">
          {solicitudes.map(s => {
            const est = BADGE_ESTADO[s.estado] || BADGE_ESTADO.pendiente;

            const fotoMascota = s.mascota_foto
              ? (s.mascota_foto.startsWith("/uploads") ? `${PET_API}${s.mascota_foto}` : s.mascota_foto)
              : null;

            const esVet = s.tipo_servicio === "consulta_vet";
            const proveedorNombre = esVet
              ? (s.vet_establecimiento || s.vet_nombre || "")
              : (s.paseador_nombre || "");
            const proveedorRol    = esVet ? "Veterinario" : "Paseador";
            const proveedorFoto   = esVet
              ? (s.vet_foto ? (s.vet_foto.startsWith("/uploads") ? `${VET_API}${s.vet_foto}` : s.vet_foto) : null)
              : (s.paseador_foto ? (s.paseador_foto.startsWith("/uploads") ? `${PAS_API}${s.paseador_foto}` : s.paseador_foto) : null);
            const proveedorId = esVet ? s.vet_usuario_id : s.paseador_usuario_id;

            const puedeEnviarMensaje = ["pendiente", "aceptada", "completada"].includes(s.estado);
            const puedesPagar = s.estado === "aceptada" && s.pago_estado !== "aprobado";
            const yaPagado    = s.pago_estado === "aprobado";
            const estaPagando = pagando === s.id;

            return (
              <div key={s.id} className="hd-card">

                <div className="hd-hero">
                  {fotoMascota ? (
                    <img
                      className="hd-hero-img"
                      src={fotoMascota}
                      alt={s.mascota_nombre}
                      onError={e => {
                        e.target.style.display = "none";
                        e.target.nextSibling.style.display = "flex";
                      }}
                    />
                  ) : null}
                  <div className="hd-hero-emoji"
                       style={{ display: fotoMascota ? "none" : "flex" }}>🐶</div>
                  <div className="hd-hero-fade" />
                  <span className="hd-badge-float"
                        style={{ background: est.bg, color: est.color, borderColor: est.border }}>
                    {est.label}
                  </span>
                  <div className="hd-hero-info">
                    <div>
                      <div className="hd-pet-name">{s.mascota_nombre}</div>
                      <div className="hd-pet-raza">{s.mascota_raza || s.mascota_especie}</div>
                    </div>
                  </div>
                </div>

                <div className="hd-accent" style={{ background: est.accent }} />

                <div className="hd-body">
                  <div className="hd-paseador">
                    <div className="hd-avatar">
                      {proveedorFoto
                        ? <img src={proveedorFoto} alt={proveedorNombre} />
                        : <span>{getIniciales(proveedorNombre)}</span>
                      }
                    </div>
                    <div className="hd-paseador-info">
                      <strong>{proveedorNombre}</strong>
                      <small>{proveedorRol}</small>
                    </div>
                  </div>

                  <div className="hd-detalles">
                    <div className="hd-det">
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
                           stroke="currentColor" strokeWidth="2">
                        <rect x="3" y="4" width="18" height="18" rx="2"/>
                        <line x1="16" y1="2" x2="16" y2="6"/>
                        <line x1="8"  y1="2" x2="8"  y2="6"/>
                        <line x1="3"  y1="10" x2="21" y2="10"/>
                      </svg>
                      <span>{formatFecha(s.fecha_servicio)}</span>
                    </div>
                    <div className="hd-det">
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
                           stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10"/>
                        <polyline points="12 6 12 12 16 14"/>
                      </svg>
                      <span>
                        {s.hora_servicio?.slice(0, 5)}
                        {s.duracion_minutos ? ` · ${formatDuracion(s.duracion_minutos)}` : ""}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="hd-foot">

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
                            {cancelando === s.id && <div className="hd-spinner-sm" />}
                            Sí, cancelar
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button className="hd-btn-cancel" onClick={() => setConfirmId(s.id)}>
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
                             stroke="currentColor" strokeWidth="2.5">
                          <path d="M18 6L6 18M6 6l12 12"/>
                        </svg>
                        Cancelar solicitud
                      </button>
                    )
                  )}

                  {puedesPagar && (
                    <button
                      className="hd-btn-pagar"
                      onClick={() => handlePagar(s)}
                      disabled={estaPagando}
                    >
                      {estaPagando ? (
                        <>
                          <div className="hd-spinner-sm" />
                          Procesando…
                        </>
                      ) : (
                        <>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                               stroke="currentColor" strokeWidth="2.2">
                            <rect x="1" y="4" width="22" height="16" rx="2"/>
                            <line x1="1" y1="10" x2="23" y2="10"/>
                          </svg>
                          Pagar {s.precio_acordado ? fmt(s.precio_acordado) : "servicio"}
                        </>
                      )}
                    </button>
                  )}

                  {yaPagado && (
                    <div className="hd-pagado-badge">
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
                           stroke="currentColor" strokeWidth="2.5">
                        <polyline points="20 6 9 17 4 12"/>
                      </svg>
                      Pago confirmado
                    </div>
                  )}

                  {puedeEnviarMensaje && (
                    <button className="hd-btn-mensaje" onClick={() => handleMensaje(s)}>
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
                           stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"
                           strokeLinejoin="round">
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                      </svg>
                      Enviar mensaje
                    </button>
                  )}

                </div>

              </div>
            );
          })}
        </div>
      )}

      {toast && <div className={`hd-toast ${toast.tipo}`}>{toast.msg}</div>}
    </div>
  );
}