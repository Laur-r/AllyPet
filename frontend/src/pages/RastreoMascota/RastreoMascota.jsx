import { useEffect, useState, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import MapaRastreo from "./MapaRastreo";
import "./RastreoMascota.css";

const TRACKING_URL = "http://localhost:3013/api/tracking";
const INTERVALO_MS = 10000;

export default function RastreoMascota() {
  const { solicitudId } = useParams();
  const navigate = useNavigate();

  const [ubicacion, setUbicacion] = useState(null);
  const [nombreMascota, setNombreMascota] = useState("Tu mascota");
  const [estado, setEstado] = useState("en_curso");
  const [ultimaActualizacion, setUltimaActualizacion] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [contador, setContador] = useState(INTERVALO_MS / 1000);

  const intervalRef = useRef(null);
  const contadorRef = useRef(null);

  const token = localStorage.getItem("token");

  // GET /api/tracking/:solicitudId/ubicacion
  const fetchUbicacion = useCallback(async () => {
    try {
      const res = await fetch(`${TRACKING_URL}/${solicitudId}/ubicacion`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error(`Error ${res.status}`);

      const json = await res.json();
      // El backend devuelve { message, data: { latitud, longitud, ... } }
      const data = json.data ?? json;

      if (data.latitud != null && data.longitud != null) {
        setUbicacion({ latitud: Number(data.latitud), longitud: Number(data.longitud) });
        setUltimaActualizacion(new Date());
        setError(null);
      }

      if (data.estado) setEstado(data.estado);
      if (data.nombreMascota) setNombreMascota(data.nombreMascota);

      setCargando(false);
    } catch (err) {
      setError("No se pudo obtener la ubicación. Reintentando...");
      setCargando(false);
    }
  }, [solicitudId, token]);

  useEffect(() => {
    fetchUbicacion();

    intervalRef.current = setInterval(() => {
      fetchUbicacion();
      setContador(INTERVALO_MS / 1000);
    }, INTERVALO_MS);

    contadorRef.current = setInterval(() => {
      setContador((prev) => (prev > 0 ? prev - 1 : INTERVALO_MS / 1000));
    }, 1000);

    return () => {
      clearInterval(intervalRef.current);
      clearInterval(contadorRef.current);
    };
  }, [fetchUbicacion]);

  // El backend usa "en_curso" con guion bajo
  const paseoFinalizado = estado === "finalizado" || estado === "completada";

  const formatHora = (date) => {
    if (!date) return "—";
    return date.toLocaleTimeString("es-CO", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  return (
    <div className="rastreo-page">
      <div className="rastreo-header">
        <button className="rastreo-back-btn" onClick={() => navigate(-1)}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          Volver
        </button>
        <div className="rastreo-title-group">
          <h1 className="rastreo-title">Rastreando a {nombreMascota}</h1>
          <div className={`rastreo-estado-badge ${paseoFinalizado ? "finalizado" : "en-curso"}`}>
            {paseoFinalizado ? (
              <>
                <span className="badge-dot" />
                Paseo finalizado
              </>
            ) : (
              <>
                <span className="badge-dot pulso" />
                En curso
              </>
            )}
          </div>
        </div>
      </div>

      <div className="rastreo-content">
        <div className="rastreo-mapa-wrapper">
          {cargando ? (
            <div className="rastreo-loading">
              <div className="rastreo-spinner" />
              <p>Obteniendo ubicación...</p>
            </div>
          ) : ubicacion ? (
            <MapaRastreo
              latitud={ubicacion.latitud}
              longitud={ubicacion.longitud}
              nombreMascota={nombreMascota}
            />
          ) : (
            <div className="rastreo-sin-ubicacion">
              <span className="sin-ubicacion-icon">📍</span>
              <p>Esperando la primera ubicación del paseador...</p>
            </div>
          )}
        </div>

        <div className="rastreo-panel">
          <div className="rastreo-info-card">
            <h2 className="panel-titulo">Estado del paseo</h2>

            <div className="info-fila">
              <span className="info-label">Solicitud</span>
              <span className="info-valor">#{solicitudId}</span>
            </div>

            <div className="info-fila">
              <span className="info-label">Última actualización</span>
              <span className="info-valor">{formatHora(ultimaActualizacion)}</span>
            </div>

            {ubicacion && (
              <>
                <div className="info-fila">
                  <span className="info-label">Latitud</span>
                  <span className="info-valor coordenada">{ubicacion.latitud.toFixed(6)}</span>
                </div>
                <div className="info-fila">
                  <span className="info-label">Longitud</span>
                  <span className="info-valor coordenada">{ubicacion.longitud.toFixed(6)}</span>
                </div>
              </>
            )}

            {error && <p className="rastreo-error">{error}</p>}
          </div>

          {!paseoFinalizado && (
            <div className="rastreo-refresh-card">
              <div className="refresh-info">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <polyline points="23 4 23 10 17 10" />
                  <polyline points="1 20 1 14 7 14" />
                  <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
                </svg>
                <span>Actualizando en <strong>{contador}s</strong></span>
              </div>
              <button
                className="rastreo-refresh-btn"
                onClick={() => {
                  fetchUbicacion();
                  setContador(INTERVALO_MS / 1000);
                }}
              >
                Actualizar ahora
              </button>
            </div>
          )}

          {paseoFinalizado && (
            <div className="rastreo-finalizado-card">
              <span>🏁</span>
              <p>El paseo ha finalizado. ¡{nombreMascota} ya está de vuelta!</p>
              <button className="rastreo-volver-btn" onClick={() => navigate(-1)}>
                Ver mis solicitudes
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}