import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Estrellas from '../../components/Estrellas/Estrellas';
import ListaResenas from '../../components/Resenas/ListaResenas';
import { getResenasUsuario } from '../../services/resenas.service';
import ModalCalificar from '../../components/ModalCalificar/ModalCalificar';
import './PerfilPublicoPaseador.css';

const PUERTO = 3006; // Puerto de pas-service

export default function PerfilPublicoPaseador() {
  const { usuarioId } = useParams();
  const navigate      = useNavigate();

  const [perfil, setPerfil] = useState(null);
  const [resenas, setResenas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  const obtenerPerfil = async () => {
    try {
      console.log("Cargando perfil para ID:", usuarioId);
      
      // Llamada directa al nuevo alias simplificado
      const res = await fetch(`http://localhost:${PUERTO}/api/paseadores/publico/${usuarioId}`);
      const data = await res.json();

      console.log("Respuesta backend (Paseador):", data);

      if (!res.ok) throw new Error(data.error || 'Error al cargar perfil');
      
      setPerfil(data);
    } catch (error) {
      console.error("Error cargando perfil:", error);
      setError(error.message);
    } finally {
      setCargando(false);
    }
  };

  /* ── SECCIÓN DE REPUTACIÓN ──
     Esta función obtiene las reseñas escritas por otros dueños de mascotas.
     Es fundamental para generar confianza en el cliente antes de contratar.
     Los datos se traen del microservicio de reseñas (3007). */
  const obtenerResenas = async () => {
    try {
      const data = await getResenasUsuario(usuarioId);
      setResenas(data || []);
    } catch (err) {
      console.error("Error cargando reseñas:", err);
    }
  };

  useEffect(() => {
    obtenerPerfil();
    obtenerResenas();
  }, [usuarioId]);

  if (cargando) return <div className="ppp-loading"><p>Cargando perfil comercial...</p></div>;
  if (error || !perfil) return (
    <div className="ppp-loading">
      <p>{error || 'Paseador no encontrado'}</p>
      <button onClick={() => navigate(-1)}>Volver</button>
    </div>
  );

  const fotoUrl = perfil.foto_perfil
    ? perfil.foto_perfil.startsWith('/uploads') ? `http://localhost:${PUERTO}${perfil.foto_perfil}` : perfil.foto_perfil
    : null;

  return (
    <div className="ppp-page">
      <button className="ppp-btn-back" onClick={() => navigate(-1)}>← Volver</button>

      {/* DEBUG VISUAL TEMPORAL */}
      <details style={{ background: '#eee', padding: '10px', marginBottom: '20px' }}>
        <summary>Debug Data (JSON)</summary>
        <pre>{JSON.stringify(perfil, null, 2)}</pre>
      </details>

      <div className="ppp-card-main">
        <div className="ppp-header-flex">
          <div className="ppp-avatar-section">
            {fotoUrl ? (
              <img src={fotoUrl} alt={perfil.nombre} className="ppp-avatar-img" />
            ) : (
              <div className="ppp-avatar-initials">{perfil.nombre?.[0]?.toUpperCase()}</div>
            )}
          </div>
          
          <div className="ppp-info-section">
            <h2>{perfil.nombre}</h2>
            <p className="ppp-type">Paseador Comercial</p>
            <p>📍 {perfil.ciudad}</p>
            <p>📞 {perfil.telefono || 'Sin teléfono'}</p>
            
            {/* Visualización del Promedio de Estrellas:
                Muestra la calificación media calculada por el backend. */}
            <div className="ppp-rating-summary">
              <Estrellas calificacion={perfil.promedio_estrellas} size={18} />
              <span className="ppp-count">({perfil.total_resenas || 0} reseñas)</span>
            </div>
          </div>
        </div>

        <div className="ppp-actions">
          <button className="ppp-btn-primary">Solicitar Paseo</button>
          <button className="ppp-btn-secondary" onClick={() => setModalOpen(true)}>Calificar</button>
        </div>
      </div>

      <div className="ppp-details-grid">
        <div className="ppp-detail-card">
          <h3>Sobre mí</h3>
          <p>{perfil.descripcion || 'Sin descripción disponible.'}</p>
        </div>

        <ListaResenas resenas={resenas} nombreProveedor={perfil.nombre} />
      </div>

      {/* Modal para permitir que el dueño califique al paseador.
          onSuccess recarga tanto el perfil como las reseñas para mostrar los cambios inmediatamente. */}
      <ModalCalificar 
        isOpen={modalOpen} 
        onClose={() => setModalOpen(false)}
        objetivoId={usuarioId}
        tipoObjetivo="paseador"
        onSuccess={() => {
          obtenerPerfil();
          obtenerResenas();
        }}
      />
    </div>
  );
}