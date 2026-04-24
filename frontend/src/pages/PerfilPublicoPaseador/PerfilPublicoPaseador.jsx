import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getPerfilPublicoPaseador, getResenasPaseador } from '../../../services/paseador.service';
import './PerfilPublicoPaseador.css';

const API_PAS = 'http://localhost:3006';

function Estrellas({ valor, size = 15 }) {
  return (
    <span className="ppp-stars" style={{ fontSize: size }}>
      {[1,2,3,4,5].map(i => (
        <span key={i} className={i <= Math.round(valor) ? 'star on' : 'star'}>★</span>
      ))}
    </span>
  );
}

export default function PerfilPublicoPaseador() {
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
        const [dataPerfil, dataResenas] = await Promise.all([
          getPerfilPublicoPaseador(usuarioId),
          getResenasPaseador(usuarioId),
        ]);

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
    <div className="ppp-loading">
      <div className="ppp-spinner" />
      <span>Cargando perfil...</span>
    </div>
  );

  if (error) return (
    <div className="ppp-loading">
      <p>{error}</p>
      <button className="ppp-btn-volver" onClick={() => navigate(-1)}>Volver</button>
    </div>
  );

  if (!perfil) return (
    <div className="ppp-loading">
      <p>Paseador no encontrado.</p>
      <button className="ppp-btn-volver" onClick={() => navigate(-1)}>Volver</button>
    </div>
  );

  const fotoUrl = perfil.foto_perfil
    ? perfil.foto_perfil.startsWith('/uploads') ? `${API_PAS}${perfil.foto_perfil}` : perfil.foto_perfil
    : null;

  const bannerUrl = perfil.banner
    ? perfil.banner.startsWith('/uploads') ? `${API_PAS}${perfil.banner}` : perfil.banner
    : 'https://images.unsplash.com/photo-1601758124510-52d02ddb7cbd?w=1200&q=80';

  return (
    <div className="ppp-page">

      {/* BOTÓN VOLVER */}
      <button className="ppp-btn-volver" onClick={() => navigate(-1)}>
        ← Volver a resultados
      </button>

      {/* HERO */}
      <div className="ppp-hero">
        <div className="ppp-banner">
          <img src={bannerUrl} alt="banner" />
          <div className="ppp-banner-overlay" />
        </div>

        <div className="ppp-foto-wrap">
          {fotoUrl
            ? <img className="ppp-foto" src={fotoUrl} alt={perfil.nombre} />
            : <div className="ppp-foto-placeholder">{perfil.nombre?.[0]?.toUpperCase()}</div>
          }
          <span className={`ppp-disponible ${perfil.disponible ? 'on' : 'off'}`}>
            <span className="ppp-dot" />
            {perfil.disponible ? 'Disponible' : 'Ocupado'}
          </span>
        </div>
      </div>

      {/* INFO PRINCIPAL */}
      <div className="ppp-header-info">
        <div className="ppp-header-left">
          <h1>{perfil.nombre}</h1>
          <p className="ppp-especialidad">{perfil.especialidad}</p>
          <div className="ppp-meta">
            <span> {perfil.ciudad}</span>
            <span>{perfil.experiencia} años de experiencia</span>
            <span> Máx. {perfil.mascotas_max} mascotas</span>
          </div>
        </div>
        <div className="ppp-rating-box">
          <span className="ppp-rating-num">{perfil.calificacion ?? '—'}</span>
          <Estrellas valor={perfil.calificacion || 0} size={17} />
          <span className="ppp-rating-count">{perfil.total_resenas || 0} reseñas</span>
          <span className="ppp-tarifa">${perfil.tarifa ? Number(perfil.tarifa).toLocaleString('es-CO') : '—'} / paseo</span>
        </div>
      </div>

      {/* BOTÓN SOLICITAR PASEO */}
      <div className="ppp-solicitar-wrap">
        <button className="ppp-btn-solicitar">
           Solicitar paseo
        </button>
      </div>

      {/* TABS */}
      <div className="ppp-tabs">
        {[
          { key: 'info',      label: 'Información' },
          { key: 'servicios', label: 'Servicios' },
          { key: 'resenas',   label: `Reseñas (${resenas.length})` },
        ].map(t => (
          <button
            key={t.key}
            className={`ppp-tab ${tab === t.key ? 'activa' : ''}`}
            onClick={() => setTab(t.key)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* CONTENIDO */}
      <div className="ppp-body">

        {/* INFO */}
        {tab === 'info' && (
          <div className="ppp-tab-info">

            <div className="ppp-card">
              <h3>Sobre mí</h3>
              <p>{perfil.descripcion || 'Sin descripción.'}</p>
            </div>

            <div className="ppp-card">
              <h3>Zonas de cobertura</h3>
              <div className="ppp-chips">
                {(perfil.zonas || []).length > 0
                  ? perfil.zonas.map((z, i) => <span key={i} className="ppp-chip">{z}</span>)
                  : <em>Sin zonas registradas</em>
                }
              </div>
            </div>

            <div className="ppp-card">
              <h3>Razas aceptadas</h3>
              <div className="ppp-chips">
                {(perfil.razas || []).length > 0
                  ? perfil.razas.map((r, i) => <span key={i} className="ppp-chip raza">{r}</span>)
                  : <em>Sin razas registradas</em>
                }
              </div>
            </div>

          </div>
        )}

        {/* SERVICIOS */}
        {tab === 'servicios' && (
          <div className="ppp-tab-servicios">
            {(perfil.servicios || []).length > 0
              ? perfil.servicios.map((srv, i) => (
                  <div key={i} className="ppp-srv-card">
                    <div className="ppp-srv-info">
                      <span className="ppp-srv-nombre">{srv.nombre}</span>
                      <span className="ppp-srv-precio">{srv.precio}</span>
                    </div>
                  </div>
                ))
              : <p className="ppp-empty">Sin servicios registrados.</p>
            }
          </div>
        )}

        {/* RESEÑAS */}
        {tab === 'resenas' && (
          <div className="ppp-tab-resenas">
            {resenas.length > 0
              ? resenas.map((r) => (
                  <div key={r.id} className="ppp-resena-card">
                    <div className="ppp-resena-header">
                      <div className="ppp-resena-avatar">
                        {r.dueno_foto
                          ? <img src={r.dueno_foto} alt={r.dueno_nombre} />
                          : <span>{r.dueno_nombre?.[0]?.toUpperCase()}</span>
                        }
                      </div>
                      <div className="ppp-resena-meta">
                        <strong>{r.dueno_nombre}</strong>
                        <Estrellas valor={r.calificacion} size={13} />
                      </div>
                      <span className="ppp-resena-fecha">
                        {new Date(r.fecha).toLocaleDateString('es-CO', { year: 'numeric', month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                    {r.comentario && <p className="ppp-resena-comentario">{r.comentario}</p>}
                  </div>
                ))
              : (
                <div className="ppp-empty-resenas">
                  <p>Este paseador aún no tiene reseñas.</p>
                </div>
              )
            }
          </div>
        )}

      </div>
    </div>
  );
}