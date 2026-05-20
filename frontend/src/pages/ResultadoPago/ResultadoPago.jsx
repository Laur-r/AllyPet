import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import "./ResultadoPago.css";

const PAY_API = "http://localhost:3012";
const getToken = () => localStorage.getItem("token");

/**
 * Wompi redirige a esta página con los params:
 * ?id=WOMPI_TX_ID&ref=REFERENCIA
 *
 * Consultamos nuestro backend con la referencia para saber
 * el estado real del pago
 */
export default function ResultadoPago() {
  const [params]   = useSearchParams();
  const navigate   = useNavigate();

  const referencia = params.get("ref") || params.get("reference");
  const [estado,   setEstado]   = useState("cargando"); // cargando | aprobado | pendiente | fallido
  const [pago,     setPago]     = useState(null);
  const [intentos, setIntentos] = useState(0);

  useEffect(() => {
    if (!referencia) { setEstado("fallido"); return; }
    verificar();
  }, [referencia]);

  /* Wompi puede tardar unos segundos en disparar el webhook.
     Reintentamos hasta 6 veces con 2 s de espera entre cada una. */
  const verificar = async () => {
    try {
      const res  = await fetch(`${PAY_API}/pagos/consultar/${referencia}`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      const data = await res.json();

      if (!res.ok) { setEstado("fallido"); return; }

      const p = data.data;
      setPago(p);

      if (p.estado === "aprobado") {
        setEstado("aprobado");
      } else if (p.estado === "declinado" || p.estado === "error") {
        setEstado("fallido");
      } else if (intentos < 5) {
        // aún pendiente — reintentar en 2 s
        setTimeout(() => setIntentos(i => i + 1), 2000);
      } else {
        setEstado("pendiente"); // después de 5 intentos, mostrar pendiente
      }
    } catch {
      setEstado("fallido");
    }
  };

  // Reintento automático
  useEffect(() => {
    if (intentos > 0 && estado === "cargando") verificar();
  }, [intentos]);

  const fmt = (n) =>
    new Intl.NumberFormat("es-CO", {
      style: "currency", currency: "COP", minimumFractionDigits: 0,
    }).format(Number(n) || 0);

  /* ── Render según estado ── */
  if (estado === "cargando") return (
    <div className="rp-page">
      <div className="rp-card">
        <div className="rp-spinner" />
        <h2>Verificando pago…</h2>
        <p>Estamos confirmando tu transacción con Wompi.</p>
      </div>
    </div>
  );

  if (estado === "aprobado") return (
    <div className="rp-page">
      <div className="rp-card rp-card--ok">
        <div className="rp-icon rp-icon--ok">
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none"
               stroke="currentColor" strokeWidth="2.5">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
        </div>
        <h2>¡Pago exitoso!</h2>
        <p>Tu pago fue confirmado correctamente.</p>

        {pago && (
          <div className="rp-detalle">
            <div className="rp-detalle-row">
              <span>Total pagado</span>
              <strong>{fmt(pago.monto_total)}</strong>
            </div>
            <div className="rp-detalle-row">
              <span>Referencia</span>
              <strong className="rp-ref">{pago.referencia}</strong>
            </div>
          </div>
        )}

        <button
          className="rp-btn rp-btn--primary"
          onClick={() => navigate("/menu/dueno/historial-solicitudes")}
        >
          Ver mis solicitudes
        </button>
      </div>
    </div>
  );

  if (estado === "pendiente") return (
    <div className="rp-page">
      <div className="rp-card rp-card--warn">
        <div className="rp-icon rp-icon--warn">
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none"
               stroke="currentColor" strokeWidth="2.5">
            <circle cx="12" cy="12" r="10"/>
            <polyline points="12 6 12 12 16 14"/>
          </svg>
        </div>
        <h2>Pago en proceso</h2>
        <p>
          Tu pago está siendo procesado. Puede tomar unos minutos.
          Revisa el estado en tus solicitudes.
        </p>
        <button
          className="rp-btn rp-btn--primary"
          onClick={() => navigate("/menu/dueno/historial-solicitudes")}
        >
          Ver mis solicitudes
        </button>
      </div>
    </div>
  );

  // fallido
  return (
    <div className="rp-page">
      <div className="rp-card rp-card--error">
        <div className="rp-icon rp-icon--error">
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none"
               stroke="currentColor" strokeWidth="2.5">
            <circle cx="12" cy="12" r="10"/>
            <line x1="15" y1="9" x2="9" y2="15"/>
            <line x1="9"  y1="9" x2="15" y2="15"/>
          </svg>
        </div>
        <h2>Pago no completado</h2>
        <p>
          El pago fue rechazado o hubo un error. No se realizó ningún cobro.
          Puedes intentarlo de nuevo.
        </p>
        <div className="rp-btns">
          <button
            className="rp-btn rp-btn--secondary"
            onClick={() => navigate("/menu/dueno/historial-solicitudes")}
          >
            Volver a solicitudes
          </button>
        </div>
      </div>
    </div>
  );
}