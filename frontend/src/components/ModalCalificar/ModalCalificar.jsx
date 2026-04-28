import { useState } from 'react';
import { crearResena } from '../../services/resenas.service';
import Estrellas from '../Estrellas/Estrellas';
import './ModalCalificar.css';

export default function ModalCalificar({ isOpen, onClose, objetivoId, tipoObjetivo, onSuccess }) {
  const [calificacion, setCalificacion] = useState(5);
  const [comentario, setComentario] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState(null);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setEnviando(true);
    setError(null);

    try {
      const user = JSON.parse(localStorage.getItem('user'));
      if (!user) throw new Error('Debes iniciar sesión para calificar');

      await crearResena({
        id_usuario_dueno: user.id,
        id_usuario_objetivo: objetivoId,
        tipo_objetivo: tipoObjetivo,
        calificacion,
        comentario
      });

      onSuccess();
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="mc-overlay">
      <div className="mc-modal">
        <button className="mc-close" onClick={onClose}>&times;</button>
        <h2>Calificar Servicio</h2>
        <p>Tu opinión es muy importante para nosotros y la comunidad.</p>

        <form onSubmit={handleSubmit}>
          <div className="mc-stars-input">
            <Estrellas 
              calificacion={calificacion} 
              setCalificacion={setCalificacion} 
              editable={true} 
              size={32} 
            />
          </div>

          <div className="mc-field">
            <label>Comentario (opcional)</label>
            <textarea
              value={comentario}
              onChange={(e) => setComentario(e.target.value)}
              placeholder="Cuéntanos tu experiencia..."
            />
          </div>

          {error && <p className="mc-error">{error}</p>}

          <button type="submit" className="mc-btn-submit" disabled={enviando}>
            {enviando ? 'Enviando...' : 'Enviar Calificación'}
          </button>
        </form>
      </div>
    </div>
  );
}
