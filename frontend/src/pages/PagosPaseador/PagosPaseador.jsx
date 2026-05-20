import { useState, useEffect } from 'react';
import './PagosPaseador.css';

const API_PAY = 'http://localhost:3012';
const getToken = () => localStorage.getItem('token');

const authFetch = async (url) => {
  const res  = await fetch(`${API_PAY}${url}`, {
    headers: { Authorization: `Bearer ${getToken()}` },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Error');
  return data;
};

const fmt = (n) =>
  new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 })
    .format(Number(n) || 0);

const fmtFecha = (f) =>
  f ? new Date(f).toLocaleDateString('es-CO', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';

const ESTADO_BADGE = {
  aprobado:    { label: 'Aprobado',    cls: 'green'  },
  pendiente:   { label: 'Pendiente',   cls: 'orange' },
  declinado:   { label: 'Declinado',   cls: 'red'    },
  error:       { label: 'Error',       cls: 'red'    },
  reembolsado: { label: 'Reembolsado', cls: 'gray'   },
};

const RETENCION_BADGE = {
  pendiente:   { label: 'Por cobrar',  cls: 'orange' },
  transferido: { label: 'Transferido', cls: 'green'  },
};

export default function PagosPaseador() {
  const [resumen,   setResumen]   = useState(null);
  const [historial, setHistorial] = useState([]);
  const [cargando,  setCargando]  = useState(true);
  const [error,     setError]     = useState(null);

  useEffect(() => {
    const cargar = async () => {
      try {
        const [resData, histData] = await Promise.all([
          authFetch('/pagos/proveedor/resumen'),
          authFetch('/pagos/proveedor/historial'),
        ]);
        setResumen(resData.data);
        setHistorial(histData.data || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setCargando(false);
      }
    };
    cargar();
  }, []);

  if (cargando) return (
    <div className="pp-loading">
      <div className="pp-spinner" />
      <span>Cargando pagos…</span>
    </div>
  );

  if (error) return (
    <div className="pp-error">
      <span>⚠️ {error}</span>
    </div>
  );

  return (
    <div className="pp-page">

      {/* ── HEADER ── */}
      <div className="pp-head">
        <div>
          <h1>Mis pagos</h1>
          <p>Historial de ingresos y estado de transferencias</p>
        </div>
      </div>

      {/* ── TARJETAS RESUMEN ── */}
      <div className="pp-resumen-grid">

        <div className="pp-resumen-card pp-resumen-card--purple">
          <div className="pp-rc-icon">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <line x1="12" y1="1" x2="12" y2="23"/>
              <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
            </svg>
          </div>
          <div>
            <span className="pp-rc-label">Total histórico</span>
            <span className="pp-rc-value">{fmt(resumen?.total_historico)}</span>
            <span className="pp-rc-sub">{resumen?.total_servicios || 0} servicios</span>
          </div>
        </div>

        <div className="pp-resumen-card pp-resumen-card--green">
          <div className="pp-rc-icon">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <rect x="3" y="4" width="18" height="18" rx="2"/>
              <line x1="16" y1="2" x2="16" y2="6"/>
              <line x1="8" y1="2" x2="8" y2="6"/>
              <line x1="3" y1="10" x2="21" y2="10"/>
            </svg>
          </div>
          <div>
            <span className="pp-rc-label">Este mes</span>
            <span className="pp-rc-value">{fmt(resumen?.total_mes)}</span>
            <span className="pp-rc-sub">Ingresos del mes actual</span>
          </div>
        </div>

        <div className="pp-resumen-card pp-resumen-card--orange">
          <div className="pp-rc-icon">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <circle cx="12" cy="12" r="10"/>
              <polyline points="12 6 12 12 16 14"/>
            </svg>
          </div>
          <div>
            <span className="pp-rc-label">Por cobrar</span>
            <span className="pp-rc-value">{fmt(resumen?.pendiente_cobro)}</span>
            <span className="pp-rc-sub">Pendiente de transferencia</span>
          </div>
        </div>

        <div className="pp-resumen-card pp-resumen-card--cyan">
          <div className="pp-rc-icon">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
          </div>
          <div>
            <span className="pp-rc-label">Ya cobrado</span>
            <span className="pp-rc-value">{fmt(resumen?.ya_cobrado)}</span>
            <span className="pp-rc-sub">Transferencias recibidas</span>
          </div>
        </div>

      </div>

      {/* ── NOTA COMISIÓN ── */}
      <div className="pp-nota-comision">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10"/>
          <line x1="12" y1="8" x2="12" y2="12"/>
          <line x1="12" y1="16" x2="12.01" y2="16"/>
        </svg>
        Los montos mostrados ya descontaron la comisión de plataforma del 12%.
        Lo que ves es tu parte (88% del total cobrado al cliente).
      </div>

      {/* ── HISTORIAL ── */}
      <div className="pp-card">
        <div className="pp-card-header">
          <h2>Historial de pagos</h2>
          <span className="pp-count">{historial.length} registros</span>
        </div>

        {historial.length === 0 ? (
          <p className="pp-empty">Aún no tienes pagos registrados.</p>
        ) : (
          <div className="pp-tabla-wrap">
            <table className="pp-tabla">
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th>Mascota / Dueño</th>
                  <th>Servicio</th>
                  <th>Total cobrado</th>
                  <th>Tu parte</th>
                  <th>Estado pago</th>
                  <th>Transferencia</th>
                </tr>
              </thead>
              <tbody>
                {historial.map((p) => {
                  const estadoPago = ESTADO_BADGE[p.estado]     || { label: p.estado,           cls: 'gray' };
                  const estadoRet  = RETENCION_BADGE[p.retencion_estado] || { label: 'Sin datos', cls: 'gray' };
                  return (
                    <tr key={p.id}>
                      <td className="pp-td-fecha">
                        <span>{fmtFecha(p.fecha_pago || p.fecha_creacion)}</span>
                        {p.fecha_servicio && (
                          <span className="pp-td-sub">Servicio: {fmtFecha(p.fecha_servicio)}</span>
                        )}
                      </td>
                      <td className="pp-td-info">
                        <strong>{p.mascota_nombre || '—'}</strong>
                        <span>{p.dueno_nombre}</span>
                      </td>
                      <td className="pp-td-srv">
                        <span>{p.tipo_proveedor || 'paseo'}</span>
                        {p.duracion_minutos && (
                          <span className="pp-td-sub">{p.duracion_minutos} min</span>
                        )}
                      </td>
                      <td className="pp-td-monto">
                        {fmt(p.monto_total)}
                      </td>
                      <td className="pp-td-monto pp-td-monto--prov">
                        {fmt(p.monto_proveedor)}
                      </td>
                      <td>
                        <span className={`pp-badge pp-badge--${estadoPago.cls}`}>
                          {estadoPago.label}
                        </span>
                      </td>
                      <td>
                        {p.estado === 'aprobado' ? (
                          <span className={`pp-badge pp-badge--${estadoRet.cls}`}>
                            {estadoRet.label}
                          </span>
                        ) : (
                          <span className="pp-badge pp-badge--gray">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}