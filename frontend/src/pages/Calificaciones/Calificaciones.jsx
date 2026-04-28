import { useState, useEffect } from 'react';
import { obtenerServiciosCalificables, crearResena } from '../../services/resenas.service';
import Estrellas from '../../components/Estrellas/Estrellas';
import './Calificaciones.css';

export default function Calificaciones() {
  const [servicios, setServicios] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [servicioSeleccionado, setServicioSeleccionado] = useState(null);
  
  // Estado para el formulario del modal
  const [calificacionForm, setCalificacionForm] = useState(5);
  const [comentarioForm, setComentarioForm] = useState('');
  const [enviando, setEnviando] = useState(false);

  const user = JSON.parse(localStorage.getItem('user'));

  const cargarDatos = async () => {
    try {
      const data = await obtenerServiciosCalificables();
      setServicios(data);
    } catch (err) {
      setError('No se pudieron cargar los servicios.');
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  const handleOpenModal = (servicio) => {
    setServicioSeleccionado(servicio);
    setCalificacionForm(5);
    setComentarioForm('');
    setModalOpen(true);
  };

  const handleEnviarResena = async (e) => {
    e.preventDefault();
    if (calificacionForm === 0) return alert('Por favor selecciona una calificación');
    
    setEnviando(true);
    try {
      await crearResena({
        id_servicio: servicioSeleccionado.id_servicio,
        id_dueno: user.id,
        id_proveedor: servicioSeleccionado.id_proveedor,
        calificacion: calificacionForm,
        comentario: comentarioForm
      });
      
      setModalOpen(false);
      cargarDatos(); // Recargar lista
    } catch (err) {
      alert(err.message);
    } finally {
      setEnviando(false);
    }
  };

  if (cargando) return <div className="cal-loading">Cargando servicios...</div>;

  return (
    <div className="cal-container">
      <div className="cal-header">
        <h1>Calificar Servicios</h1>
        <p>Comparte tu experiencia con los proveedores que te han ayudado.</p>
      </div>

      <div className="cal-list">
        {servicios.length === 0 ? (
          <div className="cal-empty">No tienes servicios completados para calificar.</div>
        ) : (
          servicios.map((s) => (
            <div key={s.id_servicio} className="cal-card">
              <div className="cal-card-left">
                <div className="cal-avatar">
                  {s.proveedor_foto ? (
                    <img src={s.proveedor_foto} alt={s.proveedor_nombre} />
                  ) : (
                    <div className="cal-avatar-placeholder">
                      {s.proveedor_nombre[0].toUpperCase()}
                    </div>
                  )}
                </div>
                <div className="cal-info">
                  <h3>{s.proveedor_nombre}</h3>
                  <span className="cal-tipo-badge">{s.tipo_servicio === 'veterinaria' ? 'Veterinario' : 'Paseador'}</span>
                  <span className="cal-fecha-srv">{new Date(s.fecha_servicio).toLocaleDateString()}</span>
                </div>
              </div>

              <div className="cal-card-right">
                {s.id_resena ? (
                  <div className="cal-ya-calificado">
                    <div className="cal-resena-info">
                      <Estrellas calificacion={s.calificacion} size={14} />
                      {s.comentario && <p className="cal-comentario-prev">"{s.comentario}"</p>}
                      <span className="cal-tag-ok">✔ Calificado</span>
                    </div>
                  </div>
                ) : (
                  <button className="cal-btn-action" onClick={() => handleOpenModal(s)}>
                    Calificar
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* MODAL DE CALIFICACIÓN */}
      {modalOpen && (
        <div className="cal-modal-overlay">
          <div className="cal-modal">
            <button className="cal-modal-close" onClick={() => setModalOpen(false)}>&times;</button>
            <h2>Calificar a {servicioSeleccionado?.proveedor_nombre}</h2>
            <p>¿Cómo fue el servicio de {servicioSeleccionado?.tipo_servicio === 'veterinaria' ? 'veterinaria' : 'paseo'}?</p>

            <form onSubmit={handleEnviarResena}>
              <div className="cal-stars-input-wrap">
                <Estrellas 
                  calificacion={calificacionForm} 
                  setCalificacion={setCalificacionForm} 
                  editable={true} 
                  size={40} 
                />
              </div>

              <div className="cal-field">
                <label>Tu comentario</label>
                <textarea 
                  value={comentarioForm}
                  onChange={(e) => setComentarioForm(e.target.value)}
                  placeholder="Describe tu experiencia..."
                  required
                />
              </div>

              <button type="submit" className="cal-btn-submit" disabled={enviando}>
                {enviando ? 'Enviando...' : 'Enviar Calificación'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
