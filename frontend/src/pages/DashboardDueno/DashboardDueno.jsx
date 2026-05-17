import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { obtenerHistorialDueno } from '../../services/solicitud.service';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend
} from 'recharts';
import './DashboardDueno.css';

const API_PET = 'http://localhost:3003';

const COLORES_PIE = ['#7B2D8B', '#6CC04A', '#5BC8D4', '#F5A623', '#E91E8C'];

const MESES = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];

export default function DashboardDueno() {
  const navigate = useNavigate();
  const user     = JSON.parse(localStorage.getItem('user') || '{}');
  const token    = localStorage.getItem('token');

  const [mascotas,    setMascotas]    = useState([]);
  const [solicitudes, setSolicitudes] = useState([]);
  const [recordatorios, setRecordatorios] = useState([]);
  const [cargando,    setCargando]    = useState(true);

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        const headers = { Authorization: `Bearer ${token}` };

        const [resMascotas, dataSolicitudes] = await Promise.all([
          fetch(`${API_PET}/api/pets`, { headers }),
          obtenerHistorialDueno(token),
        ]);

        const dataMascotas = await resMascotas.json();

        if (dataMascotas.ok) {
          setMascotas(dataMascotas.data || []);

          // Cargar recordatorios de cada mascota
          const recs = [];
          await Promise.all((dataMascotas.data || []).map(async (m) => {
            try {
              const r = await fetch(`${API_PET}/api/pets/${m.id}/recordatorios`, { headers });
              const data = await r.json();
              if (data.ok && data.data?.length > 0) {
                data.data
                  .filter(rec => !rec.completado)
                  .forEach(rec => recs.push({ ...rec, mascota_nombre: m.nombre }));
              }
            } catch { /* silencioso */ }
          }));
          setRecordatorios(recs.sort((a, b) =>
            new Date(a.fecha_programada) - new Date(b.fecha_programada)
          ).slice(0, 3));
        }

        if (dataSolicitudes.data) setSolicitudes(dataSolicitudes.data || []);
      } catch (err) {
        console.error('Error cargando dashboard:', err);
      } finally {
        setCargando(false);
      }
    };

    cargarDatos();
  }, []);

  // ── Datos para gráfica de barras — solicitudes por mes ──
  const solicitudesPorMes = MESES.map((mes, i) => ({
    mes,
    total: solicitudes.filter(s => new Date(s.fecha_servicio).getMonth() === i).length,
  }));

  // ── Datos para gráfica de pie — mascotas por especie ──
  const especiesCount = mascotas.reduce((acc, m) => {
    const esp = m.especie || 'Otro';
    acc[esp] = (acc[esp] || 0) + 1;
    return acc;
  }, {});
  const dataPie = Object.entries(especiesCount).map(([name, value]) => ({ name, value }));

  // ── Solicitudes activas ──
  const solicitudesActivas = solicitudes
    .filter(s => s.estado === 'pendiente' || s.estado === 'aceptada')
    .slice(0, 3);

  const hora = new Date().getHours();
  const saludo = hora < 12 ? 'Buenos días' : hora < 18 ? 'Buenas tardes' : 'Buenas noches';

  if (cargando) return (
    <div className="dd-loading">
      <div className="dd-spinner" />
      <span>Cargando...</span>
    </div>
  );

  return (
    <div className="dd-page">

      {/* ENCABEZADO */}
      <div className="dd-head">
        <div>
          <h1>¡{saludo}, {user?.nombre?.split(' ')[0] || 'Usuario'}!</h1>
          <p>¿Qué deseas hacer hoy con tus mascotas?</p>
        </div>
      </div>

      {/* FILA 1 — Mascotas + Recordatorios */}
      <div className="dd-row-2">

        {/* Mis mascotas */}
        <div className="dd-card dd-card--mascotas">
          <div className="dd-card-header">
            <h2>Mis mascotas</h2>
            <button className="dd-ver-todo" onClick={() => navigate('/menu/dueno/mascotas')}>
              Ver todas
            </button>
          </div>
          <div className="dd-mascotas">
            {mascotas.slice(0, 3).map((m) => (
              <div key={m.id} className="dd-mascota-item">
                <div className="dd-mascota-foto">
                  {m.foto
                    ? <img src={m.foto.startsWith('/uploads') ? `${API_PET}${m.foto}` : m.foto} alt={m.nombre} />
                    : <div className="dd-mascota-placeholder">{m.nombre?.[0]?.toUpperCase()}</div>
                  }
                </div>
                <span className="dd-mascota-nombre">{m.nombre}</span>
                <span className="dd-mascota-raza">
                  <span className="dd-dot" />
                  {m.especie} · {m.edad} años
                </span>
              </div>
            ))}
            <div className="dd-mascota-agregar" onClick={() => navigate('/menu/dueno/mascotas')}>
              <div className="dd-agregar-plus">+</div>
              <span>Registrar mascota</span>
            </div>
          </div>
        </div>

        {/* Próximos recordatorios */}
        <div className="dd-card dd-card--recordatorios">
          <div className="dd-card-header">
            <h2>Próximos recordatorios</h2>
          </div>
          {recordatorios.length > 0 ? (
            <div className="dd-recordatorios">
              {recordatorios.map((r) => (
                <div key={r.id} className="dd-recordatorio-item">
                  <div className="dd-rec-icon">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
                  </div>
                  <div className="dd-rec-info">
                    <strong>{r.nombre}</strong>
                    <span>{new Date(r.fecha_programada).toLocaleDateString('es-CO', { day: 'numeric', month: 'short' })} · {r.mascota_nombre}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="dd-empty-text">No hay recordatorios próximos</p>
          )}
        </div>

      </div>

      {/* FILA 2 — Servicios */}
      <div className="dd-card">
        <h2 className="dd-card-title">Servicios</h2>
        <div className="dd-servicios">
          {[
            { label: 'Veterinarios',  desc: 'Agenda consultas médicas, vacunas y revisiones.',    path: '/menu/dueno/buscar/veterinarias', color: 'purple' },
            { label: 'Paseadores',    desc: 'Encuentra paseadores cercanos para tu mascota.',      path: '/menu/dueno/buscar/paseadores',   color: 'green'  },
            { label: 'Cuidadores',    desc: 'Personas de confianza cuando no estés en casa.',      path: null,                              color: 'cyan'   },
            { label: 'Peluquería',    desc: 'Servicios de baño, corte y cuidado estético.',        path: null,                              color: 'orange' },
          ].map((s) => (
            <div
              key={s.label}
              className={`dd-servicio-card dd-servicio-card--${s.color} ${!s.path ? 'dd-servicio-card--disabled' : ''}`}
              onClick={() => s.path && navigate(s.path)}
            >
              <div className="dd-servicio-top">
                <span className="dd-servicio-label">{s.label}</span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
              </div>
              <p className="dd-servicio-desc">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* FILA 3 — Reservas + Gráfica pie */}
      <div className="dd-row-2">

        {/* Próximas reservas */}
        <div className="dd-card">
          <div className="dd-card-header">
            <h2>Mis próximas reservas</h2>
            <button className="dd-ver-todo" onClick={() => navigate('/menu/dueno/historial-solicitudes')}>
              Ver todas
            </button>
          </div>
          {solicitudesActivas.length > 0 ? (
            <div className="dd-reservas">
              {solicitudesActivas.map((s) => (
                <div key={s.id} className="dd-reserva-item">
                  <div className="dd-reserva-icon">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                  </div>
                  <div className="dd-reserva-info">
                    <strong>Paseo · {s.mascota_nombre || 'Mascota'}</strong>
                    <span>{new Date(s.fecha_servicio).toLocaleDateString('es-CO', { day: 'numeric', month: 'short' })} · {s.hora_servicio?.slice(0, 5)}</span>
                  </div>
                  <span className={`dd-estado-badge dd-estado--${s.estado}`}>{s.estado}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="dd-empty">
              <p>No tienes reservas activas.</p>
              <button className="dd-btn-buscar" onClick={() => navigate('/menu/dueno/buscar/paseadores')}>
                Buscar paseador
              </button>
            </div>
          )}
        </div>

        {/* Gráfica pie — mascotas por especie */}
        <div className="dd-card">
          <h2 className="dd-card-title">Mis mascotas por especie</h2>
          {dataPie.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={dataPie} cx="50%" cy="50%" outerRadius={70} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                  {dataPie.map((_, i) => (
                    <Cell key={i} fill={COLORES_PIE[i % COLORES_PIE.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="dd-empty-text">No hay mascotas registradas</p>
          )}
        </div>

      </div>

      {/* FILA 4 — Gráfica de barras */}
      <div className="dd-card">
        <h2 className="dd-card-title">Historial de solicitudes por mes</h2>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={solicitudesPorMes} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#EDE8F2" />
            <XAxis dataKey="mes" tick={{ fontSize: 12, fill: '#6B7280' }} />
            <YAxis tick={{ fontSize: 12, fill: '#6B7280' }} allowDecimals={false} />
            <Tooltip
              contentStyle={{ borderRadius: 10, border: '1px solid #EDE8F2', fontSize: 13 }}
              formatter={(value) => [value, 'Solicitudes']}
            />
            <Bar dataKey="total" fill="#7B2D8B" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

    </div>
  );
}