import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  obtenerSolicitudesVetPendientes,
  responderSolicitudVet,
} from "../../services/solicitud.service";
import "./CitasVeterinario.css";

const PET_API = "http://localhost:3003";

const BADGE_ESTADO = {
  pendiente:  { bg: "rgba(254,249,195,.92)", color: "#92400E", border: "#FDE68A", label: "Pendiente"  },
  aceptada:   { bg: "rgba(235,247,228,.92)", color: "#3A7A2A", border: "#C6EDBA", label: "Aceptada"   },
  rechazada:  { bg: "rgba(254,226,226,.92)", color: "#B91C1C", border: "#FECACA", label: "Rechazada"  },
};

function formatFecha(fecha) {
  return new Date(fecha + "T00:00:00").toLocaleDateString("es-CO", {
    day: "numeric", month: "long", year: "numeric",
  });
}
function getIniciales(nombre = "") {
  return nombre.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
}

export default function CitasVeterinario() {
  const token    = localStorage.getItem("token");
  const navigate = useNavigate();

  const [citas,      setCitas]      = useState([]);
  const [cargando,   setCargando]   = useState(true);
  const [procesando, setProcesando] = useState(null);
  const [toast,      setToast]      = useState(null);
  const [filtro,     setFiltro]     = useState("pendiente");

  const notify = (msg, tipo = "ok") => {
    setToast({ msg, tipo });
    setTimeout(() => setToast(null), 3000);
  };

  const cargar = async () => {
    setCargando(true);
    try {
      const data = await obtenerSolicitudesVetPendientes(token);
      setCitas(data.data || []);
    } catch {
      notify("Error al cargar las citas", "error");
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => { cargar(); }, []);

  const handleResponder = async (id, estado) => {
    setProcesando(id + estado);
    try {
      await responderSolicitudVet(id, estado, token);
      setCitas(prev =>
        prev.map(c => c.id === id ? { ...c, estado } : c)
      );
      notify(estado === "aceptada" ? "Cita aceptada ✅" : "Cita rechazada");
    } catch (err) {
      notify(err.message, "error");
    } finally {
      setProcesando(null);
    }
  };

  const citasFiltradas = filtro === "todas"
    ? citas
    : citas.filter(c => c.estado === filtro);

  return (
    <div className="cv-page">

      <div className="cv-head">
        <div>
          <h1>Citas</h1>
          <p>Gestiona las solicitudes de consulta de tus pacientes</p>
        </div>
        {!cargando && (
          <span className="cv-counter">
            {citasFiltradas.length} cita{citasFiltradas.length !== 1 ? "s" : ""}
          </span>
        )}
      </div>

      <div className="cv-filtros">
        {[
          { value: "pendiente", label: "Pendientes" },
          { value: "aceptada",  label: "Aceptadas"  },
          { value: "rechazada", label: "Rechazadas" },
          { value: "todas",     label: "Todas"      },
        ].map(f => (
          <button
            key={f.value}
            className={`cv-filtro ${filtro === f.value ? "activo" : ""}`}
            onClick={() => setFiltro(f.value)}
          >
            {f.label}
          </button>
        ))}
      </div>

      {cargando && (
        <div className="cv-loading">
          <div className="cv-spinner" />
          <span>Cargando citas…</span>
        </div>
      )}

      {!cargando && citasFiltradas.length === 0 && (
        <div className="cv-empty">
          <div className="cv-empty-icon">📅</div>
          <h3>Sin citas</h3>
          <p>No tienes citas {filtro !== "todas" ? `con estado "${filtro}"` : "registradas"}.</p>
        </div>
      )}

      {!cargando && citasFiltradas.length > 0 && (
        <div className="cv-lista">
          {citasFiltradas.map(c => {
            const est = BADGE_ESTADO[c.estado] || BADGE_ESTADO.pendiente;
            const fotoMascota = c.mascota_foto
              ? (c.mascota_foto.startsWith("/uploads") ? `${PET_API}${c.mascota_foto}` : c.mascota_foto)
              : null;

            return (
              <div key={c.id} className="cv-card">

                <div className="cv-card-header">
                  <div className="cv-mascota">
                    {fotoMascota
                      ? <img src={fotoMascota} alt={c.mascota_nombre} className="cv-mascota-foto" />
                      : <div className="cv-mascota-emoji">🐾</div>
                    }
                    <div>
                      <strong>{c.mascota_nombre}</strong>
                      <span>{c.mascota_raza || c.mascota_especie}</span>
                    </div>
                  </div>
                  <span
                    className="cv-badge"
                    style={{ background: est.bg, color: est.color, borderColor: est.border }}
                  >
                    {est.label}
                  </span>
                </div>

                <div className="cv-divider" />

                <div className="cv-dueno">
                  <div className="cv-avatar">
                    {c.dueno_foto
                      ? <img src={c.dueno_foto} alt={c.dueno_nombre} />
                      : <span>{getIniciales(c.dueno_nombre)}</span>
                    }
                  </div>
                  <div className="cv-dueno-info">
                    <strong>{c.dueno_nombre}</strong>
                    <small>Dueño · {c.dueno_telefono || "Sin teléfono"}</small>
                  </div>
                </div>

                <div className="cv-detalles">
                  <div className="cv-det">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="4" width="18" height="18" rx="2"/>
                      <line x1="16" y1="2" x2="16" y2="6"/>
                      <line x1="8" y1="2" x2="8" y2="6"/>
                      <line x1="3" y1="10" x2="21" y2="10"/>
                    </svg>
                    <span>{formatFecha(c.fecha_servicio)}</span>
                  </div>
                  <div className="cv-det">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10"/>
                      <polyline points="12 6 12 12 16 14"/>
                    </svg>
                    <span>{c.hora_servicio?.slice(0, 5)}</span>
                  </div>
                </div>

                {c.estado === "pendiente" && (
                  <div className="cv-acciones">
                    <button
                      className="cv-btn-rechazar"
                      onClick={() => handleResponder(c.id, "rechazada")}
                      disabled={!!procesando}
                    >
                      {procesando === c.id + "rechazada"
                        ? <div className="cv-btn-spinner" />
                        : "✕ Rechazar"
                      }
                    </button>
                    <button
                      className="cv-btn-aceptar"
                      onClick={() => handleResponder(c.id, "aceptada")}
                      disabled={!!procesando}
                    >
                      {procesando === c.id + "aceptada"
                        ? <div className="cv-btn-spinner" />
                        : "✓ Aceptar"
                      }
                    </button>
                  </div>
                )}

                {c.estado !== "pendiente" && (
                  <button
                    className="cv-btn-mensaje"
                    onClick={() => navigate("/menu/veterinario/mensajes", {
                      state: {
                        destinatario_id:     c.dueno_id,
                        destinatario_nombre: c.dueno_nombre,
                        destinatario_foto:   c.dueno_foto || null,
                        solicitud_id:        c.id,
                      }
                    })}
                  >
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                    </svg>
                    Enviar mensaje
                  </button>
                )}

              </div>
            );
          })}
        </div>
      )}

      {toast && (
        <div className={`cv-toast ${toast.tipo}`}>{toast.msg}</div>
      )}

    </div>
  );
}