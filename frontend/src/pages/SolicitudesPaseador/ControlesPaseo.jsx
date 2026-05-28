import { useTracking } from "./useTracking";
import "./ControlesPaseo.css";

export default function ControlesPaseo({ solicitudId, estadoSolicitud, onPaseoIniciado, onPaseoFinalizado }) {
const { activo, cargando, error, iniciarPaseo, finalizarPaseo } =useTracking(solicitudId, estadoSolicitud === "en_curso");

  const puedeIniciar =
    !activo &&
    !cargando &&
    (estadoSolicitud === "aceptada" || estadoSolicitud === "confirmada");

  const puedeFinalizar = activo && !cargando;

  const handleIniciar = async () => {
    await iniciarPaseo();
    onPaseoIniciado?.();
  };

  const handleFinalizar = async () => {
    await finalizarPaseo();
    onPaseoFinalizado?.();
  };

  if (estadoSolicitud === "finalizado" || estadoSolicitud === "completado") {
    return (
      <div className="controles-paseo">
        <span className="controles-badge finalizado">✓ Paseo completado</span>
      </div>
    );
  }

  return (
    <div className="controles-paseo">
      {error && <p className="controles-error">{error}</p>}

      {!activo ? (
        <button
          className="controles-btn iniciar"
          onClick={handleIniciar}
          disabled={!puedeIniciar || cargando}
        >
          {cargando ? (
            <span className="controles-spinner" />
          ) : (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <polygon points="5 3 19 12 5 21 5 3" />
            </svg>
          )}
          {cargando ? "Iniciando..." : "Iniciar paseo"}
        </button>
      ) : (
        <button
          className="controles-btn finalizar"
          onClick={handleFinalizar}
          disabled={!puedeFinalizar || cargando}
        >
          {cargando ? (
            <span className="controles-spinner" />
          ) : (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <rect x="3" y="3" width="18" height="18" rx="2" />
            </svg>
          )}
          {cargando ? "Finalizando..." : "Finalizar paseo"}
        </button>
      )}

      {activo && !cargando && (
        <div className="controles-gps-activo">
          <span className="gps-dot" aria-hidden="true" />
          GPS activo · compartiendo ubicación
        </div>
      )}
    </div>
  );
}