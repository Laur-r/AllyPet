import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './PerfilPublicoVeterinaria.css';

const API_VET = 'http://localhost:3005';

function Estrellas({ valor, size = 15 }) {
  return (
    <span className="ppv-stars" style={{ fontSize: size }}>
      {[1,2,3,4,5].map(i => (
        <span key={i} className={i <= Math.round(valor) ? 'star on' : 'star'}>★</span>
      ))}
    </span>
  );
}

export default function PerfilPublicoVeterinaria() {
  const { usuarioId } = useParams();
  const navigate      = useNavigate();

  const [perfil,   setPerfil]   = useState(null);
  const [resenas,  setResenas]  = useState([]);
  const [cargando, setCargando] = useState(true);
  const [tab,      setTab]      = useState('info');
  const [error,    setError]    = useState(null);

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        const [resPerfil, resResenas] = await Promise.all([
          fetch(`${API_VET}/perfil-vet/publico/${usuarioId}`),
          fetch(`${API_VET}/perfil-vet/${usuarioId}/resenas`),
        ]);

        const dataPerfil  = await resPerfil.json();
        const dataResenas = await resResenas.json();

        if (!resPerfil.ok) throw new Error(dataPerfil.error || 'Error al cargar perfil');

        setPerfil(dataPerfil.data);
        setResenas(dataResenas.data || []);
      } catch (err) {
        setError('No se pudo cargar el perfil. Intenta de nuevo.');
      } finally {
        setCargando(false);
      }
    };

    cargarDatos();
  }, [usuarioId]);

  if (cargando) return (
    <div className="ppv-loading">
      <div className="ppv-spinner" />
      <span>Cargando perfil...</span>
    </div>
  );

  if (error) return (
    <div className="ppv-loading">
      <p>{error}</p>
      <button className="ppv-btn-volver" onClick={() => navigate(-1)}>Volver</button>
    </div>
  );

  if (!perfil) return (
    <div className="ppv-loading">
      <p>Veterinaria no encontrada.</p>
      <button className="ppv-btn-volver" onClick={() => navigate(-1)}>Volver</button>
    </div>
  );

  const fotoUrl = perfil.foto_perfil
    ? perfil.foto_perfil.startsWith('/uploads') ? `${API_VET}${perfil.foto_perfil}` : perfil.foto_perfil
    : null;

  const bannerUrl = perfil.banner
    ? perfil.banner.startsWith('/uploads') ? `${API_VET}${perfil.banner}` : perfil.banner
    : 'https://images.unsplash.com/photo-1576201836106-db1758fd1c97?w=1200&q=80';

  const serviciosLista = Array.isArray(perfil.servicios)
    ? perfil.servicios
    : typeof perfil.servicios === 'string'
    ? perfil.servicios.split(',').map(s => s.trim())
    : [];

  return (
    <div className="ppv-page">

      {/* BOTÓN VOLVER */}
      <button className="ppv-btn-volver" onClick={() => navigate(-1)}>
        ← Volver a resultados
      </button>

      {/* HERO */}
      <div className="ppv-hero">
        <div className="ppv-banner">
          <img src={bannerUrl} alt="banner" />
          <div className="ppv-banner-overlay" />
        </div>

        <div className="ppv-foto-wrap">
          {fotoUrl
            ? <img className="ppv-foto" src={fotoUrl} alt={perfil.nombre_establecimiento} />
            : <div className="ppv-foto-placeholder">
                <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
              </div>
          }
          <span className={`ppv-disponible ${perfil.disponible ? 'on' : 'off'}`}>
            <span className="ppv-dot" />
            {perfil.disponible ? 'Abierto' : 'Cerrado'}
          </span>
        </div>
      </div>

      {/* INFO PRINCIPAL */}
      <div className="ppv-header-info">
        <div className="ppv-header-left">
          <h1>{perfil.nombre_establecimiento}</h1>
          <p className="ppv-especialidad">{perfil.especialidad}</p>
          <div className="ppv-meta">
            <span>📍 {perfil.direccion || perfil.ciudad}</span>
            <span>🏙 {perfil.ciudad}</span>
            <span>⏱ {perfil.experiencia} años de experiencia</span>
          </div>
        </div>
        <div className="ppv-rating-box">
          <span className="ppv-rating-num">{perfil.calificacion ?? '—'}</span>
          <Estrellas valor={perfil.calificacion || 0} size={17} />
          <span className="ppv-rating-count">{perfil.total_resenas || 0} reseñas</span>
        </div>
      </div>

      {/* TABS */}
      <div className="ppv-tabs">
        {[
          { key: 'info',    label: 'Información' },
          { key: 'resenas', label: `Reseñas (${resenas.length})` },
        ].map(t => (
          <button
            key={t.key}
            className={`ppv-tab ${tab === t.key ? 'activa' : ''}`}
            onClick={() => setTab(t.key)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* CONTENIDO */}
      <div className="ppv-body">

        {/* INFO */}
        {tab === 'info' && (
          <div className="ppv-tab-info">

            <div className="ppv-card">
              <h3>Sobre nosotros</h3>
              <p>{perfil.descripcion || 'Sin descripción.'}</p>
            </div>

            <div className="ppv-card">
              <h3>Servicios</h3>
              <div className="ppv-chips">
                {serviciosLista.length > 0
                  ? serviciosLista.map((s, i) => (
                      <span key={i} className="ppv-chip">
                        {typeof s === 'object' ? s.nombre : s}
                      </span>
                    ))
                  : <em>Sin servicios registrados</em>
                }
              </div>
            </div>

            <div className="ppv-card">
              <h3>Horarios</h3>
            {perfil.horarios && typeof perfil.horarios === 'object' && Object.keys(perfil.horarios).length > 0
            ? <div className="ppv-horarios">
                {Object.entries(perfil.horarios).map(([dia, hora]) => (
                    <div key={dia} className="ppv-horario-row">
                    <span className="ppv-dia">{dia}</span>
                    <span className="ppv-hora">
                        {typeof hora === 'object' 
                        ? `${hora.desde || ''} - ${hora.hasta || ''}` 
                        : hora}
                    </span>
                    </div>
                ))}
                </div>
            : <p>Sin horarios registrados.</p>
            }
            </div>

          </div>
        )}

        {/* RESEÑAS */}
        {tab === 'resenas' && (
          <div className="ppv-tab-resenas">
            {resenas.length > 0
              ? resenas.map((r) => (
                  <div key={r.id} className="ppv-resena-card">
                    <div className="ppv-resena-header">
                      <div className="ppv-resena-avatar">
                        {r.dueno_foto
                          ? <img src={r.dueno_foto} alt={r.dueno_nombre} />
                          : <span>{r.dueno_nombre?.[0]?.toUpperCase()}</span>
                        }
                      </div>
                      <div className="ppv-resena-meta">
                        <strong>{r.dueno_nombre}</strong>
                        <Estrellas valor={r.calificacion} size={13} />
                      </div>
                      <span className="ppv-resena-fecha">
                        {new Date(r.fecha).toLocaleDateString('es-CO', { year: 'numeric', month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                    {r.comentario && <p className="ppv-resena-comentario">{r.comentario}</p>}
                  </div>
                ))
              : (
                <div className="ppv-empty-resenas">
                  <p>Esta veterinaria aún no tiene reseñas.</p>
                </div>
              )
            }
          </div>
        )}

      </div>
    </div>
  );
}