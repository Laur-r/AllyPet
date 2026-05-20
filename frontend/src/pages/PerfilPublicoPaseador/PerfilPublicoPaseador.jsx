import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Estrellas from '../../components/Estrellas/Estrellas';
import ListaResenas from '../../components/Resenas/ListaResenas';
import { getResenasUsuario } from '../../services/resenas.service'; // ✅ puerto 3008
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
      const resPerfil = await fetch(`${API_PAS}/api/paseadores/publico/${usuarioId}`);
      if (!resPerfil.ok) throw new Error('Error al cargar perfil');
      const dataPerfil = await resPerfil.json();
      setPerfil(dataPerfil);

      try {
        const dataResenas = await getResenasUsuario(usuarioId); // ✅ puerto 3008
        // Normalizar: puede venir como array o como { resenas: [...] } o { data: [...] }
        const lista = Array.isArray(dataResenas)
          ? dataResenas
          : Array.isArray(dataResenas?.resenas)
          ? dataResenas.resenas
          : Array.isArray(dataResenas?.data)
          ? dataResenas.data
          : [];
        setResenas(lista);
      } catch {
        setResenas([]);
      }

    } catch (err) {
      console.error(err);
      setError('No se pudo cargar el perfil del paseador.');
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    if (usuarioId) cargarDatos();
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
            {Number(perfil.promedio_estrellas || 0).toFixed(1)}
          </span>
          <Estrellas calificacion={perfil.promedio_estrellas} size={17} />
          <span className="ppp-rating-count">{resenas.length} reseñas</span> {/* ✅ ahora tiene datos reales */}
        </div>
      </div>

      <div className="ppp-solicitar-wrap">
        <button
          className="ppp-btn-solicitar"
          onClick={() => navigate(`/menu/dueno/solicitar-paseo/${usuarioId}`)}
        >
           Solicitar paseo
        </button>
      </div>

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
          <ListaResenas resenas={resenas} nombreProveedor={perfil?.nombre} rol="paseador" />
        )}
      </div>
    </div>
  );
}