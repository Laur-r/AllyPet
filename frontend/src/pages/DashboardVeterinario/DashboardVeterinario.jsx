import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, LineChart, Line,
} from 'recharts';
import './DashboardVeterinario.css';

// ✅ CORREGIDO: puerto 3005 (vet-service real), no 3004
const API_VET = 'http://localhost:3005';

export default function DashboardVeterinario() {

  const navigate = useNavigate();

  const user  = JSON.parse(localStorage.getItem('user') || '{}');
  const token = localStorage.getItem('token');

  const [perfil, setPerfil]               = useState(null);
  const [citas, setCitas]                 = useState([]);
  const [pacientes, setPacientes]         = useState([]);
  const [citasPorMes, setCitasPorMes]     = useState([]);
  const [ingresosPorMes, setIngresosPorMes] = useState([]);
  const [cargando, setCargando]           = useState(true);

  useEffect(() => {

    const cargarDashboard = async () => {
      try {
        const headers = {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        };

        const [
          perfilRes,
          citasRes,
          pacientesRes,
          estadisticasRes,
        ] = await Promise.all([
          // ✅ CORREGIDO: /perfil-vet (ruta real del servicio)
          fetch(`${API_VET}/perfil-vet`,                         { headers }),
          fetch(`${API_VET}/perfil-vet/veterinario/citas`,       { headers }),
          fetch(`${API_VET}/perfil-vet/veterinario/pacientes`,   { headers }),
          fetch(`${API_VET}/perfil-vet/veterinario/dashboard-estadisticas`, { headers }),
        ]);

        const perfilData       = await perfilRes.json();
        const citasData        = await citasRes.json();
        const pacientesData    = await pacientesRes.json();
        const estadisticasData = await estadisticasRes.json();

        if (perfilData.ok)    setPerfil(perfilData.data);
        if (citasData.ok)     setCitas(citasData.data);
        if (pacientesData.ok) setPacientes(pacientesData.data);

        if (estadisticasData.ok) {
          setCitasPorMes(estadisticasData.citasPorMes     || []);
          setIngresosPorMes(estadisticasData.ingresosPorMes || []);
        }

      } catch (error) {
        console.error('Error cargando dashboard:', error);
      } finally {
        setCargando(false);
      }
    };

    cargarDashboard();
  }, [token]);

  /* ── Derivados ── */
  const citasHoy = citas.filter(c => {
    const fechaCita = new Date(c.fecha);
    return fechaCita.toDateString() === new Date().toDateString();
  });

  const citasPendientes  = citas.filter(c => c.estado === 'pendiente');
  const citasConfirmadas = citas.filter(c => c.estado === 'confirmada');

  const hora = new Date().getHours();
  const saludo =
    hora < 12 ? 'Buenos días' :
    hora < 18 ? 'Buenas tardes' :
                'Buenas noches';

  const estadoColor = {
    pendiente:   'orange',
    confirmada:  'green',
    completada:  'blue',
    cancelada:   'red',
  };

  /* ── Loading ── */
  if (cargando) {
    return (
      <div className="dv-loading">
        <div className="dv-spinner" />
        <span>Cargando dashboard...</span>
      </div>
    );
  }

  return (
    <div className="dv-page">

      {/* ── HEADER ── */}
      <div className="dv-head">
        <div>
          <h1>¡{saludo}, {user?.nombre?.split(' ')[0] || 'Doctor'}!</h1>
          <p>Aquí tienes el resumen de tu consultorio hoy.</p>
        </div>
        <div className="dv-head-actions">
          <button
            className="dv-btn-primary"
            onClick={() => navigate('/menu/veterinario/perfil')}
          >
            {/* Icono persona */}
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
                 stroke="currentColor" strokeWidth="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
              <circle cx="12" cy="7" r="4"/>
            </svg>
            Mi perfil
          </button>
        </div>
      </div>

      {/* ── MÉTRICAS ── */}
      <div className="dv-metricas">
        {[
          {
            label: 'Citas hoy',
            valor: citasHoy.length,
            color: 'purple',
            icon: (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
                   stroke="currentColor" strokeWidth="1.8">
                <rect x="3" y="4" width="18" height="18" rx="2"/>
                <line x1="16" y1="2" x2="16" y2="6"/>
                <line x1="8"  y1="2" x2="8"  y2="6"/>
                <line x1="3"  y1="10" x2="21" y2="10"/>
              </svg>
            ),
          },
          {
            label: 'Pendientes',
            valor: citasPendientes.length,
            color: 'orange',
            icon: (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
                   stroke="currentColor" strokeWidth="1.8">
                <circle cx="12" cy="12" r="10"/>
                <polyline points="12 6 12 12 16 14"/>
              </svg>
            ),
          },
          {
            label: 'Confirmadas',
            valor: citasConfirmadas.length,
            color: 'green',
            icon: (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
                   stroke="currentColor" strokeWidth="1.8">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
            ),
          },
          {
            label: 'Total pacientes',
            valor: pacientes.length,
            color: 'cyan',
            // ✅ CORREGIDO: ícono de pacientes (pata de animal, más apropiado)
            icon: (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
                   stroke="currentColor" strokeWidth="1.8">
                {/* Pata de mascota */}
                <ellipse cx="12" cy="17" rx="4" ry="3"/>
                <ellipse cx="7"  cy="13" rx="2" ry="2.5"/>
                <ellipse cx="17" cy="13" rx="2" ry="2.5"/>
                <ellipse cx="9"  cy="9"  rx="1.5" ry="2"/>
                <ellipse cx="15" cy="9"  rx="1.5" ry="2"/>
              </svg>
            ),
          },
        ].map((m, i) => (
          <div key={i} className={`dv-metrica dv-metrica--${m.color}`}>
            <div className="dv-metrica-icon">{m.icon}</div>
            <div className="dv-metrica-info">
              <span className="dv-metrica-val">{m.valor}</span>
              <span className="dv-metrica-lbl">{m.label}</span>
            </div>
          </div>
        ))}
      </div>

      {/* ── FILA 1: citas hoy + próximas ── */}
      <div className="dv-row-2">

        <div className="dv-card">
          <div className="dv-card-header">
            <h2>Citas de hoy</h2>
            <button className="dv-ver-todo"
                    onClick={() => navigate('/menu/veterinario/citas')}>
              Ver todas
            </button>
          </div>
          {citasHoy.length > 0 ? (
            <div className="dv-citas-lista">
              {citasHoy.map(c => (
                <div key={c.id} className="dv-cita-item">
                  <div className="dv-cita-hora">{c.hora}</div>
                  <div className="dv-cita-info">
                    <strong>{c.mascota_nombre}</strong>
                    <span>{c.tipo} · {c.dueno}</span>
                  </div>
                  <span className={`dv-estado dv-estado--${estadoColor[c.estado] || 'orange'}`}>
                    {c.estado}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="dv-empty-text">No tienes citas programadas para hoy</p>
          )}
        </div>

        <div className="dv-card">
          <div className="dv-card-header">
            <h2>Próximas citas</h2>
          </div>
          <div className="dv-citas-lista">
            {citas
              .filter(c => c.estado === 'pendiente')
              .slice(0, 4)
              .map(c => (
                <div key={c.id} className="dv-cita-item">
                  <div className="dv-cita-fecha">
                    <span>
                      {new Date(c.fecha).toLocaleDateString('es-CO', {
                        day: 'numeric', month: 'short',
                      })}
                    </span>
                    <span>{c.hora}</span>
                  </div>
                  <div className="dv-cita-info">
                    <strong>{c.mascota_nombre}</strong>
                    <span>{c.tipo}</span>
                  </div>
                  <span className={`dv-estado dv-estado--${estadoColor[c.estado] || 'orange'}`}>
                    {c.estado}
                  </span>
                </div>
              ))
            }
            {citas.filter(c => c.estado === 'pendiente').length === 0 && (
              <p className="dv-empty-text">Sin citas próximas</p>
            )}
          </div>
        </div>

      </div>

      {/* ── FILA 2: pacientes + estado consultorio ── */}
      <div className="dv-row-2">

        <div className="dv-card">
          <div className="dv-card-header">
            <h2>Pacientes recientes</h2>
            <button className="dv-ver-todo"
                    onClick={() => navigate('/menu/veterinario/pacientes')}>
              Ver todos
            </button>
          </div>
          <div className="dv-pacientes-lista">
            {pacientes.slice(0, 4).map(p => (
              <div
                key={p.id}
                className="dv-paciente-item"
                onClick={() => navigate(`/menu/veterinario/pacientes/${p.id}`)}
              >
                <div className="dv-paciente-avatar">
                  {p.foto ? (
                    // ✅ CORREGIDO: imagen actualizada con cache-bust
                    <img
                      src={`http://localhost:3005${p.foto}?t=${Date.now()}`}
                      alt={p.nombre}
                    />
                  ) : (
                    <span>{p.nombre[0]}</span>
                  )}
                </div>
                <div className="dv-paciente-info">
                  <strong>{p.nombre}</strong>
                  <span>{p.especie} · {p.raza}</span>
                </div>
                <div className="dv-paciente-meta">
                  <span className="dv-dueno">{p.dueno}</span>
                  <span className="dv-ultima">
                    {p.ultima_visita
                      ? new Date(p.ultima_visita).toLocaleDateString('es-CO', {
                          day: 'numeric', month: 'short',
                        })
                      : '—'}
                  </span>
                </div>
              </div>
            ))}
            {pacientes.length === 0 && (
              <p className="dv-empty-text">Sin pacientes registrados aún</p>
            )}
          </div>
        </div>

        <div className="dv-card">
          <div className="dv-card-header">
            <h2>Estado del consultorio</h2>
          </div>
          <div className="dv-consultorio">
            <div className={`dv-disponible-toggle ${perfil?.disponible ? 'on' : 'off'}`}>
              <div className="dv-disp-left">
                <div className="dv-disp-dot" />
                <div>
                  <strong>
                    {perfil?.disponible ? 'Consultorio abierto' : 'Consultorio cerrado'}
                  </strong>
                  <span>Los dueños pueden ver tu disponibilidad</span>
                </div>
              </div>
            </div>

            <div className="dv-perfil-stats">
              {[
                {
                  label: 'Calificación',
                  // ✅ CORREGIDO: usa promedio_estrellas (nombre real en BD)
                  valor: perfil?.promedio_estrellas
                    ? `${Number(perfil.promedio_estrellas).toFixed(1)} ★`
                    : '—',
                },
                {
                  label: 'Especialidad',
                  valor: perfil?.especialidad || '—',
                },
                {
                  label: 'Años de exp.',
                  valor: perfil?.experiencia ? `${perfil.experiencia} años` : '—',
                },
                {
                  label: 'Ciudad',
                  valor: perfil?.ciudad || '—',
                },
                {
                  label: 'Total reseñas',     // ✅ CORREGIDO: tilde en Reseñas
                  valor: perfil?.total_resenas ?? '—',
                },
              ].map((s, i) => (
                <div key={i} className="dv-perfil-stat">
                  <span className="dv-ps-lbl">{s.label}</span>
                  <span className="dv-ps-val">{s.valor}</span>
                </div>
              ))}
            </div>

            <button
              className="dv-btn-outline"
              onClick={() => navigate('/menu/veterinario/perfil')}
            >
              Editar perfil comercial
            </button>
          </div>
        </div>

      </div>

      {/* ── GRÁFICAS ── */}
      <div className="dv-row-2">

        <div className="dv-card">
          <h2 className="dv-card-title">Citas por mes</h2>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart
              data={citasPorMes}
              margin={{ top: 5, right: 10, left: -10, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#EDE8F2"/>
              <XAxis dataKey="mes" tick={{ fontSize: 11, fill: '#6B7280' }}/>
              <YAxis tick={{ fontSize: 11, fill: '#6B7280' }} allowDecimals={false}/>
              <Tooltip
                contentStyle={{ borderRadius: 10, border: '1px solid #EDE8F2', fontSize: 12 }}
                formatter={(v) => [v, 'Citas']}
              />
              <Bar dataKey="citas" fill="#7B2D8B" radius={[5,5,0,0]}/>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="dv-card">
          <h2 className="dv-card-title">Ingresos por mes ($000)</h2>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart
              data={ingresosPorMes}
              margin={{ top: 5, right: 10, left: -10, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#EDE8F2"/>
              <XAxis dataKey="mes" tick={{ fontSize: 11, fill: '#6B7280' }}/>
              <YAxis tick={{ fontSize: 11, fill: '#6B7280' }}/>
              <Tooltip
                contentStyle={{ borderRadius: 10, border: '1px solid #EDE8F2', fontSize: 12 }}
                formatter={(v) => [`$${v}k`, 'Ingresos']}
              />
              <Line
                type="monotone"
                dataKey="ingresos"
                stroke="#6CC04A"
                strokeWidth={2.5}
                dot={{ fill: '#6CC04A', r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

      </div>

    </div>
  );
}