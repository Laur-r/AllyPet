import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Estrellas from '../../components/Estrellas/Estrellas';
import { getResenasUsuario } from '../../services/resenas.service';
import './PerfilPublicoPaseador.css';

const API_PAS = 'http://localhost:3006';

export default function PerfilPublicoPaseador() {
  const { usuarioId } = useParams();
  const navigate      = useNavigate();

  const [perfil,   setPerfil]   = useState(null);
  const [resenas,  setResenas]  = useState([]);
  const [cargando, setCargando] = useState(true);
  const [tab,      setTab]      = useState('info');
  const [error,    setError]    = useState(null);

  const cargarDatos = async () => {
    try {
      const [resPerfil, resResenas] = await Promise.all([
        fetch(`${API_PAS}/api/paseadores/publico/${usuarioId}`),
        getResenasUsuario(usuarioId),
      ]);

      if (!resPerfil.ok) throw new Error('Error al cargar perfil');

      const dataPerfil = await resPerfil.json();
      setPerfil(dataPerfil);
      setResenas(resResenas || []);
    } catch (err) {
      console.error(err);
      setError('No se pudo cargar el perfil del paseador.');
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, [usuarioId]);

  if (cargando) return (
    <div className="ppp-loading">
      <div className="ppp-spinner" />
      <span>Cargando perfil...</span>
    </div>
  );

  if (error || !perfil) return (
    <div className="ppp-loading">
      <p>{error || 'Paseador no encontrado'}</p>
      <button className="ppp-btn-volver" onClick={() => navigate(-1)}>Volver</button>
    </div>
  );

  const fotoUrl = perfil.foto_perfil
    ? perfil.foto_perfil.startsWith('/uploads') ? `${API_PAS}${perfil.foto_perfil}` : perfil.foto_perfil
    : null;

  const bannerUrl = perfil.banner
    ? perfil.banner.startsWith('/uploads') ? `${API_PAS}${perfil.banner}` : perfil.banner
    : 'https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?w=1200&q=80';

  return (
    <div className="ppp-page">
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
            {perfil.disponible ? 'Disponible' : 'No disponible'}
          </span>
        </div>
      </div>

      {/* INFO PRINCIPAL */}
      <div className="ppp-header-info">
        <div className="ppp-header-left">
          <h1>{perfil.nombre}</h1>
          <p className="ppp-especialidad">{perfil.especialidad || 'Paseador de Mascotas'}</p>
          <div className="ppp-meta">
            <span>📍 {perfil.ciudad}</span>
            <span>⏱ {perfil.experiencia || 0} años de experiencia</span>
            <span className="ppp-tarifa">Tarifa: ${perfil.tarifa || 0}</span>
          </div>
        </div>
        <div className="ppp-rating-box">
          <span className="ppp-rating-num">
            {Number(perfil.promedio_estrellas || 0).toFixed(2)}
          </span>
          <Estrellas calificacion={perfil.promedio_estrellas} size={17} />
          <span className="ppp-rating-count">{perfil.total_resenas || 0} reseñas</span>
        </div>
      </div>

      {/* TABS */}
      <div className="ppp-tabs">
        {[
          { key: 'info',    label: 'Información' },
          { key: 'resenas', label: `Reseñas (${resenas.length})` },
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
        {tab === 'info' && (
          <div className="ppp-tab-info">
            <div className="ppp-card">
              <h3>Sobre mí</h3>
              <p>{perfil.descripcion || 'Hola, soy un amante de los animales listo para pasear a tu mascota.'}</p>
            </div>

            <div className="ppp-card">
              <h3>Disponibilidad</h3>
              <p>{perfil.disponibilidad || 'Consulta mi disponibilidad directamente.'}</p>
            </div>

            <div className="ppp-card">
              <h3>Preferencias</h3>
              <div className="ppp-chips">
                <span className="ppp-chip">Máx. {perfil.mascotas_max || 1} mascotas</span>
                {perfil.razas && <span className="ppp-chip">Razas: {perfil.razas}</span>}
              </div>
            </div>
          </div>
        )}

        {tab === 'resenas' && (
          <div className="ppp-tab-resenas">
            {resenas.length > 0
              ? resenas.map((r) => (
                  <div key={r.id} className="ppp-resena-card">
                    <div className="ppp-resena-header">
                      <div className="ppp-resena-avatar">
                        {r.usuario_dueno?.foto_perfil
                          ? <img src={r.usuario_dueno.foto_perfil} alt={r.usuario_dueno.nombre} />
                          : <span>{r.usuario_dueno?.nombre?.[0]?.toUpperCase()}</span>
                        }
                      </div>
                      <div className="ppp-resena-meta">
                        <strong>{r.usuario_dueno?.nombre || 'Usuario de AllyPet'}</strong>
                        <Estrellas calificacion={r.calificacion} size={13} />
                      </div>
                      <span className="ppp-resena-fecha">
                        {new Date(r.fecha).toLocaleDateString()}
                      </span>
                    </div>
                    {r.comentario && <p className="ppp-resena-comentario">{r.comentario}</p>}
                  </div>
                ))
              : <div className="ppp-empty-resenas">Aún no hay reseñas.</div>
            }
          </div>
        )}
      </div>

    </div>
  );
}