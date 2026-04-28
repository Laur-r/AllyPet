import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Estrellas from '../../components/Estrellas/Estrellas';
import ListaResenas from '../../components/Resenas/ListaResenas';
import { getResenasUsuario } from '../../services/resenas.service';
import ModalCalificar from '../../components/ModalCalificar/ModalCalificar';
import './PerfilPublicoVeterinaria.css';

const PUERTO = 3005; // Puerto de vet-service

export default function PerfilPublicoVeterinaria() {
  const { usuarioId } = useParams();
  const navigate      = useNavigate();

  const [perfil, setPerfil] = useState(null);
  const [resenas, setResenas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  const obtenerPerfil = async () => {
    try {
      console.log("Cargando perfil veterinaria para ID:", usuarioId);
      
      const res = await fetch(`http://localhost:${PUERTO}/api/veterinarios/publico/${usuarioId}`);
      const data = await res.json();

      console.log("Respuesta backend (Veterinaria):", data);

      if (!res.ok) throw new Error(data.error || 'Error al cargar perfil');
      
      setPerfil(data);
    } catch (error) {
      console.error("Error cargando perfil veterinario:", error);
      setError(error.message);
    } finally {
      setCargando(false);
    }
  };

  /* ── SECCIÓN DE REPUTACIÓN ──
     Carga las experiencias de otros usuarios con esta veterinaria.
     Es clave para demostrar profesionalismo y calidad médica. */
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

  if (cargando) return <div className="ppv-loading"><p>Cargando veterinaria...</p></div>;
  if (error || !perfil) return (
    <div className="ppv-loading">
      <p>{error || 'Veterinaria no encontrada'}</p>
      <button onClick={() => navigate(-1)}>Volver</button>
    </div>
  );

  const fotoUrl = perfil.foto_perfil
    ? perfil.foto_perfil.startsWith('/uploads') ? `http://localhost:${PUERTO}${perfil.foto_perfil}` : perfil.foto_perfil
    : null;

  return (
    <div className="ppv-page">
      <button className="ppv-btn-back" onClick={() => navigate(-1)}>← Volver</button>

      {/* DEBUG VISUAL TEMPORAL */}
      <details style={{ background: '#eee', padding: '10px', marginBottom: '20px' }}>
        <summary>Debug Data (JSON)</summary>
        <pre>{JSON.stringify(perfil, null, 2)}</pre>
      </details>

      <div className="ppv-card-main">
        <div className="ppv-header-flex">
          <div className="ppv-avatar-section">
            {fotoUrl ? (
              <img src={fotoUrl} alt={perfil.nombre} className="ppv-avatar-img" />
            ) : (
              <div className="ppv-avatar-initials">{perfil.nombre?.[0]?.toUpperCase()}</div>
            )}
          </div>
          
          <div className="ppv-info-section">
            <h2>{perfil.nombre}</h2>
            <p className="ppv-type">{perfil.nombre_establecimiento || 'Clínica Veterinaria'}</p>
            <p>📍 {perfil.ciudad}</p>
            <p>📞 {perfil.telefono || 'Sin teléfono'}</p>
            <p>🏠 {perfil.direccion || 'Sin dirección'}</p>
            
            {/* Resumen de Estrellas:
                Componente visual que resume la satisfacción de los clientes. */}
            <div className="ppv-rating-summary">
              <Estrellas calificacion={perfil.promedio_estrellas} size={18} />
              <span className="ppv-count">({perfil.total_resenas || 0} reseñas)</span>
            </div>
          </div>
        </div>

        <div className="ppv-actions">
          <button className="ppv-btn-primary">Agendar Cita</button>
          <button className="ppv-btn-secondary" onClick={() => setModalOpen(true)}>Calificar</button>
        </div>
      </div>

      <div className="ppv-details-grid">
        <div className="ppv-detail-card">
          <h3>Sobre nosotros</h3>
          <p>{perfil.descripcion || 'Sin descripción disponible.'}</p>
        </div>

        <ListaResenas resenas={resenas} nombreProveedor={perfil.nombre_establecimiento || perfil.nombre} />
      </div>

      {/* Modal para permitir calificar a la veterinaria. 
          Al completarse, dispara el onSuccess para refrescar la información y las reseñas en pantalla. */}
      <ModalCalificar 
        isOpen={modalOpen} 
        onClose={() => setModalOpen(false)}
        objetivoId={usuarioId}
        tipoObjetivo="veterinaria"
        onSuccess={() => {
          obtenerPerfil();
          obtenerResenas();
        }}
      />
    </div>
  );
}