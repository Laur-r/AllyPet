import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { crearSolicitudCuidado } from '../../services/solicitud.service';
import './PerfilPublicoCuidador.css';

const API_CUID = 'http://localhost:3011';

function Estrellas({ valor, size = 15 }) {
  return (
    <span className="ppc-stars" style={{ fontSize: size }}>
      {[1, 2, 3, 4, 5].map(i => (
        <span key={i} className={i <= Math.round(valor) ? 'star on' : 'star'}>★</span>
      ))}
    </span>
  );
}

export default function PerfilPublicoCuidador() {
  const { usuarioId } = useParams();
  const navigate      = useNavigate();

  const [perfil,   setPerfil]   = useState(null);
  const [resenas,  setResenas]  = useState([]);
  const [cargando, setCargando] = useState(true);
  const [tab,      setTab]      = useState('info');
  const [error,    setError]    = useState(null);

  /* ── Formulario de solicitud ── */
  const [mostrarForm,  setMostrarForm]  = useState(false);
  const [mascotas,     setMascotas]     = useState([]);
  const [form,         setForm]         = useState({ mascota_id: '', fecha_inicio: '', fecha_fin: '' });
  const [enviando,     setEnviando]     = useState(false);
  const [msgExito,     setMsgExito]     = useState('');
  const [msgError,     setMsgError]     = useState('');

  const token    = localStorage.getItem('token');
  const user     = JSON.parse(localStorage.getItem('user') || '{}');

  /* ── Carga perfil y reseñas ── */
  const cargarDatos = async () => {
    try {
      const resPerfil = await fetch(`${API_CUID}/api/perfil-cuidador/publico/${usuarioId}`);
      if (!resPerfil.ok) throw new Error('Error al cargar perfil');
      const dataPerfil = await resPerfil.json();
      setPerfil(dataPerfil);

      try {
        const resResenas = await fetch(`${API_CUID}/api/perfil-cuidador/${usuarioId}/resenas`);
        const dataResenas = await resResenas.json();
        const lista = Array.isArray(dataResenas?.data) ? dataResenas.data : [];
        setResenas(lista);
      } catch {
        setResenas([]);
      }

    } catch (err) {
      console.error(err);
      setError('No se pudo cargar el perfil del cuidador.');
    } finally {
      setCargando(false);
    }
  };

  /* ── Carga mascotas del dueño ── */
  const cargarMascotas = async () => {
    try {
      const res  = await fetch('http://localhost:3003/api/pets', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setMascotas(Array.isArray(data?.mascotas) ? data.mascotas : Array.isArray(data) ? data : []);
    } catch {
      setMascotas([]);
    }
  };

  useEffect(() => {
    if (usuarioId) cargarDatos();
  }, [usuarioId]);

  /* ── Enviar solicitud ── */
  const handleSolicitar = async () => {
    setMsgError('');
    setMsgExito('');

    if (!form.mascota_id || !form.fecha_inicio || !form.fecha_fin) {
      setMsgError('Completa todos los campos.');
      return;
    }

    setEnviando(true);
    try {
      await crearSolicitudCuidado(
        { cuidador_id: Number(usuarioId), mascota_id: Number(form.mascota_id), fecha_inicio: form.fecha_inicio, fecha_fin: form.fecha_fin },
        token
      );
      setMsgExito('¡Solicitud enviada correctamente! El cuidador la revisará pronto.');
      setForm({ mascota_id: '', fecha_inicio: '', fecha_fin: '' });
      setMostrarForm(false);
    } catch (err) {
      setMsgError(err.message || 'Error al enviar la solicitud.');
    } finally {
      setEnviando(false);
    }
  };

  const abrirFormulario = () => {
    cargarMascotas();
    setMostrarForm(true);
    setMsgExito('');
    setMsgError('');
  };

  /* ── Loading / Error ── */
  if (cargando) return (
    <div className="ppc-loading">
      <div className="ppc-spinner" />
      <span>Cargando perfil...</span>
    </div>
  );

  if (error || !perfil) return (
    <div className="ppc-loading">
      <p>{error || 'Cuidador no encontrado'}</p>
      <button className="ppc-btn-volver" onClick={() => navigate(-1)}>Volver</button>
    </div>
  );

  const fotoUrl = perfil.foto_perfil
    ? perfil.foto_perfil.startsWith('/uploads') ? `${API_CUID}${perfil.foto_perfil}` : perfil.foto_perfil
    : null;

  const bannerUrl = perfil.banner
    ? perfil.banner.startsWith('/uploads') ? `${API_CUID}${perfil.banner}` : perfil.banner
    : 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=1200&q=80';

  return (
    <div className="ppc-page">
      <button className="ppc-btn-volver" onClick={() => navigate(-1)}>
        ← Volver a resultados
      </button>

      {/* ══ HERO ══ */}
      <div className="ppc-hero">
        <div className="ppc-banner">
          <img src={bannerUrl} alt="banner" />
          <div className="ppc-banner-overlay" />
        </div>
        <div className="ppc-foto-wrap">
          {fotoUrl
            ? <img className="ppc-foto" src={fotoUrl} alt={perfil.nombre} />
            : <div className="ppc-foto-placeholder">{perfil.nombre?.[0]?.toUpperCase()}</div>
          }
          <span className={`ppc-disponible ${perfil.disponible ? 'on' : 'off'}`}>
            <span className="ppc-dot" />
            {perfil.disponible ? 'Disponible' : 'No disponible'}
          </span>
        </div>
      </div>

      {/* ══ HEADER INFO ══ */}
      <div className="ppc-header-info">
        <div className="ppc-header-left">
          <h1>{perfil.nombre}</h1>
          <p className="ppc-especialidad">{perfil.especialidad || 'Cuidador de Mascotas'}</p>
          <div className="ppc-meta">
            {perfil.ciudad && <span>📍 {perfil.ciudad}</span>}
            {perfil.experiencia > 0 && <span>⏱ {perfil.experiencia} años de experiencia</span>}
            {perfil.tarifa && (
              <span className="ppc-tarifa">
                Desde ${Number(perfil.tarifa).toLocaleString('es-CO')} / día
              </span>
            )}
            {perfil.disponibilidad && <span>📅 {perfil.disponibilidad}</span>}
          </div>
        </div>

        <div className="ppc-rating-box">
          <span className="ppc-rating-num">
            {Number(perfil.calificacion || 0).toFixed(1)}
          </span>
          <Estrellas valor={perfil.calificacion || 0} size={17} />
          <span className="ppc-rating-count">{resenas.length} reseñas</span>
        </div>
      </div>

      {/* ══ BOTÓN SOLICITAR ══ */}
      <div className="ppc-solicitar-wrap">
        {msgExito && <p className="ppc-msg-exito">{msgExito}</p>}

        {!mostrarForm ? (
          <button className="ppc-btn-solicitar" onClick={abrirFormulario}>
            🐾 Solicitar servicio de cuidado
          </button>
        ) : (
          <div className="ppc-form">
            <h3 className="ppc-form-title">Solicitar servicio de cuidado</h3>

            <div className="ppc-form-group">
              <label>Mascota</label>
              <select
                value={form.mascota_id}
                onChange={e => setForm({ ...form, mascota_id: e.target.value })}
              >
                <option value="">Selecciona una mascota</option>
                {mascotas.map(m => (
                  <option key={m.id} value={m.id}>{m.nombre}</option>
                ))}
              </select>
            </div>

            <div className="ppc-form-row">
              <div className="ppc-form-group">
                <label>Fecha de inicio</label>
                <input
                  type="date"
                  value={form.fecha_inicio}
                  onChange={e => setForm({ ...form, fecha_inicio: e.target.value })}
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>
              <div className="ppc-form-group">
                <label>Fecha de fin</label>
                <input
                  type="date"
                  value={form.fecha_fin}
                  onChange={e => setForm({ ...form, fecha_fin: e.target.value })}
                  min={form.fecha_inicio || new Date().toISOString().split('T')[0]}
                />
              </div>
            </div>

            {msgError && <p className="ppc-msg-error">{msgError}</p>}

            <div className="ppc-form-actions">
              <button className="ppc-btn-solicitar" onClick={handleSolicitar} disabled={enviando}>
                {enviando ? 'Enviando...' : 'Confirmar solicitud'}
              </button>
              <button className="ppc-btn-cancelar" onClick={() => setMostrarForm(false)} disabled={enviando}>
                Cancelar
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ══ TABS ══ */}
      <div className="ppc-tabs">
        {[
          { key: 'info',    label: 'Información' },
          { key: 'resenas', label: `Reseñas (${resenas.length})` },
        ].map(t => (
          <button
            key={t.key}
            className={`ppc-tab ${tab === t.key ? 'activa' : ''}`}
            onClick={() => setTab(t.key)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ══ BODY ══ */}
      <div className="ppc-body">

        {tab === 'info' && (
          <div className="ppc-tab-info">
            <div className="ppc-card">
              <h3>Sobre mí</h3>
              <p>{perfil.descripcion || 'Hola, soy un amante de los animales listo para cuidar a tu mascota.'}</p>
            </div>
            <div className="ppc-card">
              <h3>Disponibilidad</h3>
              <p>{perfil.disponibilidad || 'Consulta mi disponibilidad directamente.'}</p>
            </div>
            {perfil.especialidad && (
              <div className="ppc-card">
                <h3>Especialidad</h3>
                <div className="ppc-chips">
                  <span className="ppc-chip">{perfil.especialidad}</span>
                </div>
              </div>
            )}
          </div>
        )}

        {tab === 'resenas' && (
          <div className="ppc-tab-resenas">
            {resenas.length === 0 ? (
              <div className="ppc-resenas-empty">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                </svg>
                <p>Este cuidador aún no tiene reseñas.</p>
              </div>
            ) : (
              <div className="ppc-resenas-lista">
                {resenas.map(r => (
                  <div key={r.id} className="ppc-resena-card">
                    <div className="ppc-resena-avatar">
                      {r.foto_dueno
                        ? <img src={r.foto_dueno.startsWith('/uploads/') ? `http://localhost:3004${r.foto_dueno}` : r.foto_dueno} alt={r.nombre_dueno} />
                        : <div className="ppc-resena-inicial">{r.nombre_dueno?.[0]?.toUpperCase() || 'D'}</div>
                      }
                    </div>
                    <div className="ppc-resena-body">
                      <div className="ppc-resena-top">
                        <span className="ppc-resena-nombre">{r.nombre_dueno}</span>
                        <Estrellas valor={r.calificacion} size={13} />
                      </div>
                      {r.comentario && <p className="ppc-resena-comentario">"{r.comentario}"</p>}
                      <span className="ppc-resena-fecha">
                        {new Date(r.fecha).toLocaleDateString('es-CO', { day: 'numeric', month: 'long', year: 'numeric' })}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}