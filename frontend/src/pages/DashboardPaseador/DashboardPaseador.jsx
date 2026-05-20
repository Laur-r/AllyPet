import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from 'recharts';
import './DashboardPaseador.css';

/* ── URLs de servicios ── */
const API_PAS = 'http://localhost:3006'; // pas-service
const API_SOL = 'http://localhost:3007'; // request-service

const MESES = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];

const authHdrs = () => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${localStorage.getItem('token')}`,
});

export default function DashboardPaseador() {
  const navigate  = useNavigate();
  const user      = JSON.parse(localStorage.getItem('user') || '{}');
  const usuarioId = user?.id || user?.usuario_id;

  const [perfil,      setPerfil]      = useState(null);
  const [solicitudes, setSolicitudes] = useState([]); // pendientes + aceptadas
  const [historial,   setHistorial]   = useState([]); // completadas
  const [cargando,    setCargando]    = useState(true);

  /* ── Carga de datos ── */
  useEffect(() => {
    if (!usuarioId) { setCargando(false); return; }

    const cargar = async () => {
      try {
        /* 1. Perfil del paseador */
        const resPerfil = await fetch(`${API_PAS}/api/perfil-paseador/${usuarioId}`, {
          headers: authHdrs(),
        });
        if (resPerfil.ok) {
          const dataPerfil = await resPerfil.json();
          setPerfil(dataPerfil);
        }

        /* 2. Dashboard: activas + completadas en una sola llamada autenticada */
        const resDash = await fetch(`${API_SOL}/api/solicitudes/paseador/dashboard`, {
          headers: authHdrs(),
        });
        if (resDash.ok) {
          const dataDash = await resDash.json();
          const { activas = [], completadas = [] } = dataDash.data || {};
          setSolicitudes(activas);     // pendientes + aceptadas
          setHistorial(completadas);   // completadas con precio_total calculado
        }

      } catch (err) {
        console.error('Error dashboard paseador:', err);
      } finally {
        setCargando(false);
      }
    };

    cargar();
  }, [usuarioId]);

  /* ── Toggle disponibilidad ── */
  const toggleDisponible = async () => {
    const nuevo = !perfil?.disponible;
    try {
      await fetch(`${API_PAS}/api/perfil-paseador/${usuarioId}/disponibilidad`, {
        method: 'PATCH',
        headers: authHdrs(),
        body: JSON.stringify({ disponible: nuevo }),
      });
      setPerfil(p => ({ ...p, disponible: nuevo }));
    } catch {
      console.error('Error al cambiar disponibilidad');
    }
  };

  /* ── Métricas calculadas ── */
  const pendientes      = solicitudes.filter(s => s.estado === 'pendiente');
  const aceptadas       = solicitudes.filter(s => s.estado === 'aceptada');
  const completados     = historial.filter(h => h.estado === 'completada');
  const gananciaMensual = historial.reduce((acc, h) => acc + (Number(h.precio_total) || 0), 0);

  /* ── Gráfica paseos por mes ── */
  const paseosPorMes = MESES.map((mes, i) => ({
    mes,
    paseos: historial.filter(h => new Date(h.fecha_servicio).getMonth() === i).length,
  }));

  const hora   = new Date().getHours();
  const saludo = hora < 12 ? 'Buenos días' : hora < 18 ? 'Buenas tardes' : 'Buenas noches';

  if (cargando) return (
    <div className="dp-loading">
      <div className="dp-spinner" />
      <span>Cargando...</span>
    </div>
  );

  return (
    <div className="dp-page">

      {/* ── ENCABEZADO ── */}
      <div className="dp-head">
        <div>
          <h1>¡{saludo}, {user?.nombre?.split(' ')[0] || 'Usuario'}!</h1>
          <p>Revisa tus paseos y gestiona tus solicitudes.</p>
        </div>
        <div
          className={`dp-disponible-pill ${perfil?.disponible ? 'on' : 'off'}`}
          onClick={toggleDisponible}
          title="Clic para cambiar disponibilidad"
        >
          <span className={`dp-dot ${perfil?.disponible ? 'on' : 'off'}`} />
          {perfil?.disponible ? 'Disponible' : 'No disponible'}
        </div>
      </div>

      {/* ── MÉTRICAS ── */}
      <div className="dp-metricas">
        {[
          {
            label: 'Paseos programados',
            valor: aceptadas.length,
            color: 'purple',
            icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
          },
          {
            label: 'Solicitudes nuevas',
            valor: pendientes.length,
            color: 'orange',
            icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>,
          },
          {
            label: 'Paseos completados',
            valor: completados.length,
            color: 'green',
            icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><polyline points="20 6 9 17 4 12"/></svg>,
          },
          {
            label: 'Ganancias del mes',
            valor: gananciaMensual > 0 ? `$${(gananciaMensual / 1000).toFixed(0)}k` : '$0',
            color: 'cyan',
            icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>,
          },
        ].map((m, i) => (
          <div key={i} className={`dp-metrica dp-metrica--${m.color}`}>
            <div className="dp-metrica-icon">{m.icon}</div>
            <div className="dp-metrica-info">
              <span className="dp-metrica-val">{m.valor}</span>
              <span className="dp-metrica-lbl">{m.label}</span>
            </div>
          </div>
        ))}
      </div>

      {/* ── FILA 1: Solicitudes pendientes + Próximos paseos ── */}
      <div className="dp-row-2">

        {/* Solicitudes pendientes */}
        <div className="dp-card">
          <div className="dp-card-header">
            <h2>Solicitudes pendientes</h2>
            <button className="dp-ver-todo" onClick={() => navigate('/menu/paseador/solicitudes')}>
              Ver todas
            </button>
          </div>
          {pendientes.length > 0 ? (
            <div className="dp-sol-lista">
              {pendientes.slice(0, 3).map(s => (
                <div key={s.id} className="dp-sol-item">
                  <div className="dp-sol-avatar">{(s.mascota_nombre || '?')[0]}</div>
                  <div className="dp-sol-info">
                    <strong>{s.mascota_nombre || 'Mascota'}</strong>
                    <span>{s.dueno_nombre || 'Dueño'} · {s.duracion_minutos || '—'} min</span>
                  </div>
                  <div className="dp-sol-fecha">
                    <span>
                      {new Date(s.fecha_servicio).toLocaleDateString('es-CO', { day: 'numeric', month: 'short' })}
                    </span>
                    <span>{s.hora_servicio?.slice(0, 5)}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="dp-empty-text">No tienes solicitudes pendientes</p>
          )}
        </div>

        {/* Próximos paseos aceptados */}
        <div className="dp-card">
          <div className="dp-card-header">
            <h2>Próximos paseos</h2>
          </div>
          {aceptadas.length > 0 ? (
            <div className="dp-sol-lista">
              {aceptadas.slice(0, 3).map(s => (
                <div key={s.id} className="dp-sol-item">
                  <div className="dp-sol-avatar dp-sol-avatar--green">
                    {(s.mascota_nombre || '?')[0]}
                  </div>
                  <div className="dp-sol-info">
                    <strong>{s.mascota_nombre || 'Mascota'}</strong>
                    <span>{s.dueno_nombre || 'Dueño'} · {s.duracion_minutos || '—'} min</span>
                  </div>
                  <div className="dp-sol-fecha">
                    <span>
                      {new Date(s.fecha_servicio).toLocaleDateString('es-CO', { day: 'numeric', month: 'short' })}
                    </span>
                    <span>{s.hora_servicio?.slice(0, 5)}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="dp-empty-text">No tienes paseos confirmados</p>
          )}
        </div>
      </div>

      {/* ── FILA 2: Historial reciente + Perfil rápido ── */}
      <div className="dp-row-2">

        {/* Historial reciente */}
        <div className="dp-card">
          <div className="dp-card-header">
            <h2>Paseos recientes</h2>
            <button className="dp-ver-todo" onClick={() => navigate('/menu/paseador/historial')}>
              Ver historial
            </button>
          </div>
          {historial.length > 0 ? (
            <div className="dp-historial-lista">
              {historial.slice(0, 4).map(h => (
                <div key={h.id} className="dp-historial-item">
                  <div className="dp-hist-icon">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>
                  </div>
                  <div className="dp-hist-info">
                    <strong>{h.mascota_nombre || 'Mascota'}</strong>
                    <span>
                      {h.dueno_nombre || 'Dueño'} ·{' '}
                      {new Date(h.fecha_servicio).toLocaleDateString('es-CO', { day: 'numeric', month: 'short' })}
                    </span>
                  </div>
                  {h.precio_total > 0 && (
                    <span className="dp-ganancia">${(h.precio_total / 1000).toFixed(0)}k</span>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="dp-empty-text">Aún no tienes paseos completados</p>
          )}
        </div>

        {/* Perfil rápido */}
        <div className="dp-card">
          <div className="dp-card-header">
            <h2>Mi perfil</h2>
          </div>
          <div className="dp-perfil-quick">
            <div className="dp-perfil-avatar-wrap">
              {perfil?.foto_perfil ? (
                <img
                  src={perfil.foto_perfil.startsWith('/uploads') ? `${API_PAS}${perfil.foto_perfil}` : perfil.foto_perfil}
                  alt={user?.nombre}
                  className="dp-perfil-foto"
                />
              ) : (
                <div className="dp-perfil-avatar">
                  {user?.nombre?.[0]?.toUpperCase() || 'P'}
                </div>
              )}
            </div>
            <div className="dp-perfil-data">
              <strong>{user?.nombre || 'Paseador'}</strong>
              <span>{perfil?.ciudad || user?.ciudad || 'Sin ciudad'}</span>
              {perfil?.especialidad && <span className="dp-especialidad">{perfil.especialidad}</span>}
            </div>

            <div className="dp-perfil-stats">
              {[
                { label: 'Paseos totales',  valor: completados.length + solicitudes.length },
                { label: 'Calificación',    valor: perfil?.promedio_estrellas ? `${Number(perfil.promedio_estrellas).toFixed(1)} ★` : '— ★' },
                { label: 'Años de exp.',    valor: perfil?.experiencia ? `${perfil.experiencia} años` : '—' },
                { label: 'Este mes',        valor: gananciaMensual > 0 ? `$${(gananciaMensual / 1000).toFixed(0)}k` : '$0' },
              ].map((s, i) => (
                <div key={i} className="dp-pstat">
                  <span className="dp-pstat-val">{s.valor}</span>
                  <span className="dp-pstat-lbl">{s.label}</span>
                </div>
              ))}
            </div>

            <button className="dp-btn-outline" onClick={() => navigate('/menu/paseador/perfil')}>
              Editar perfil
            </button>
          </div>
        </div>
      </div>

      {/* ── Gráfica paseos por mes ── */}
      <div className="dp-card">
        <h2 className="dp-card-title">Paseos por mes</h2>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={paseosPorMes} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#EDE8F2" />
            <XAxis dataKey="mes" tick={{ fontSize: 11, fill: '#6B7280' }} />
            <YAxis tick={{ fontSize: 11, fill: '#6B7280' }} allowDecimals={false} />
            <Tooltip
              contentStyle={{ borderRadius: 10, border: '1px solid #EDE8F2', fontSize: 12 }}
              formatter={v => [v, 'Paseos']}
            />
            <Bar dataKey="paseos" fill="#6CC04A" radius={[5, 5, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

    </div>
  );
}