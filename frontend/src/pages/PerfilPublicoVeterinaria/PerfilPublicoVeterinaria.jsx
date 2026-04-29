import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Estrellas from '../../components/Estrellas/Estrellas';
import ListaResenas from '../../components/Resenas/ListaResenas';
import { getResenasUsuario } from '../../services/resenas.service';
import './PerfilPublicoVeterinaria.css';

const API_VET = 'http://localhost:3005';

export default function PerfilPublicoVeterinaria() {
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
        fetch(`${API_VET}/api/veterinarios/publico/${usuarioId}`),
        getResenasUsuario(usuarioId),
      ]);

      if (!resPerfil.ok) throw new Error('Error al cargar perfil');

      const dataPerfil = await resPerfil.json();
      setPerfil(dataPerfil);
      setResenas(resResenas || []);
    } catch (err) {
      console.error(err);
      setError('No se pudo cargar el perfil. Intenta de nuevo.');
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, [usuarioId]);

  if (cargando) return (
    <div className="ppv-loading">
      <div className="ppv-spinner" />
      <span>Cargando perfil...</span>
    </div>
  );

  if (error || !perfil) return (
    <div className="ppv-loading">
      <p>{error || 'Veterinaria no encontrada'}</p>
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
    ? JSON.parse(perfil.servicios || '[]')
    : [];

  return (
    <div className="ppv-page">
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
            ? <img className="ppv-foto" src={fotoUrl} alt={perfil.nombre} />
            : <div className="ppv-foto-placeholder">{perfil.nombre?.[0]?.toUpperCase()}</div>
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
          <h1>{perfil.nombre_establecimiento || perfil.nombre}</h1>
          <p className="ppv-especialidad">{perfil.especialidad || 'Servicios Veterinarios'}</p>
          <div className="ppv-meta">
            <span>📍 {perfil.direccion || perfil.ciudad}</span>
            <span>🏙 {perfil.ciudad}</span>
            <span>⏱ {perfil.experiencia || 0} años de experiencia</span>
          </div>
        </div>
        <div className="ppv-rating-box">
          <span className="ppv-rating-num">
            {Number(perfil.promedio_estrellas || 0).toFixed(1)}
          </span>
          <Estrellas calificacion={perfil.promedio_estrellas} size={17} />
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
        {tab === 'info' && (
          <div className="ppv-tab-info">
            <div className="ppv-card">
              <h3>Sobre nosotros</h3>
              <p>{perfil.descripcion || 'Soy un veterinario comprometido con la salud de tus mascotas.'}</p>
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
              <h3>Contacto</h3>
              <p>📞 {perfil.telefono || 'No disponible'}</p>
              <p>📧 {perfil.correo || 'No disponible'}</p>
            </div>
          </div>
        )}

        {tab === 'resenas' && (
          <div className="tema-violeta">
            <ListaResenas 
              resenas={resenas} 
              nombreProveedor={perfil?.nombre_establecimiento} 
              rol="veterinaria" 
            />
          </div>
        )}



      </div>

    </div>
  );
}