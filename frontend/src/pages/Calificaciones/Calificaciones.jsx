import { useState, useEffect } from 'react';
import { obtenerServiciosCalificables, crearResena } from '../../services/resenas.service';
import Estrellas from '../../components/Estrellas/Estrellas';
import './Calificaciones.css';

import walkingDogImg from '../../assets/illustrations/walking_dog.png';
import petFooterImg from '../../assets/illustrations/pet_footer.png';

function esVeterinaria(tipo) {
  if (!tipo) return false;
  return tipo.toLowerCase().includes('veterinaria');
}

export default function Calificaciones() {
  const [cargando, setCargando] = useState(true);
  const [tab, setTab] = useState('por-calificar');
  
  const [servicioSeleccionado, setServicioSeleccionado] = useState(null);
  const [calificacion, setCalificacion] = useState(5);
  const [comentario, setComentario] = useState('');
  const [recomienda, setRecomienda] = useState(true);
  const [enviando, setEnviando] = useState(false);

  const user = JSON.parse(localStorage.getItem('user'));

  const [pendientes, setPendientes] = useState([]);
  const [historial, setHistorial] = useState([]);

  const cargarDatos = async () => {
    try {
      const data = await obtenerServiciosCalificables();

      // Solo los que NO tienen reseña todavía
      const sinCalificar = (data.pendientes || []).filter(s => s.id_resena === null);
      setPendientes(sinCalificar);
      setHistorial(data.historial || []);

      setServicioSeleccionado((actual) => {
        if (!sinCalificar || sinCalificar.length === 0) return null;
        if (actual && sinCalificar.some((s) => s.solicitud_id === actual.solicitud_id)) {
          return actual;
        }
        return sinCalificar[0];
      });
    } catch (err) {
      console.error(err);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  const handleEnviar = async (e) => {
    e.preventDefault();
    if (!servicioSeleccionado) return;

    setEnviando(true);
    try {
      await crearResena({
        dueno_id: user.id,
        proveedor_id: servicioSeleccionado.proveedor_id,
        solicitud_id: servicioSeleccionado.solicitud_id,
        tipo_proveedor: esVeterinaria(servicioSeleccionado.tipo_servicio) ? 'veterinario' : 'paseador',
        calificacion,
        comentario
      });

      setComentario('');
      setCalificacion(5);
      setServicioSeleccionado(null);
      await cargarDatos();
      alert('¡Gracias por tu calificación!');
    } catch (err) {
      alert(err.message);
    } finally {
      setEnviando(false);
    }
  };

  const serviciosPorCalificar = pendientes;
  const historialServicios = historial;

  if (cargando) return (
    <div className="cal-container">
      <div className="cal-empty-state">
        <div className="cal-spinner" />
        <p>Cargando tus servicios...</p>
      </div>
    </div>
  );

  return (
    <div className="cal-container">
      <header className="cal-header">
        <h1>Calificar Servicios</h1>
        <p>Comparte tu experiencia y ayuda a otros dueños de mascotas.</p>
      </header>

      <nav className="cal-tabs">
        <button 
          className={`cal-tab ${tab === 'por-calificar' ? 'active' : ''}`}
          onClick={() => setTab('por-calificar')}
        >
          Por calificar
        </button>
        <button 
          className={`cal-tab ${tab === 'historial' ? 'active' : ''}`}
          onClick={() => setTab('historial')}
        >
          Historial de calificaciones
        </button>
      </nav>

      <main className="cal-content">
        {tab === 'por-calificar' && (
          <>
            {serviciosPorCalificar.length > 0 ? (
              <>
                {serviciosPorCalificar.length > 1 && (
                  <div className="cal-pending-list">
                    {serviciosPorCalificar.map(s => (
                      <div 
                        key={s.solicitud_id}
                        className={`cal-mini-card ${servicioSeleccionado?.solicitud_id === s.solicitud_id ? 'active' : ''}`}
                        onClick={() => setServicioSeleccionado(s)}
                      >
                        <strong>{s.proveedor_nombre}</strong>
                        <span>{s.tipo_servicio} • {new Date(s.fecha_servicio).toLocaleDateString()}</span>
                      </div>
                    ))}
                  </div>
                )}

                {servicioSeleccionado && (
                  <div className="cal-main-card">
                    <div className="cal-card-top">
                      <div className="cal-provider-info">
                        <div className="cal-provider-avatar">
                          {servicioSeleccionado.proveedor_foto ? (
                            <img src={servicioSeleccionado.proveedor_foto} alt="provider" />
                          ) : (
                            <span>{servicioSeleccionado.proveedor_nombre?.[0]?.toUpperCase() ?? '?'}</span>
                          )}
                        </div>
                        <div className="cal-provider-details">
                          <div className="cal-name-row">
                            <h2>{servicioSeleccionado.proveedor_nombre ?? 'Proveedor'}</h2>
                            <span className="cal-role-tag">
                              {esVeterinaria(servicioSeleccionado.tipo_servicio) ? 'Veterinario' : 'Paseador'}
                            </span>
                          </div>
                          <p className="cal-service-meta">
                            {new Date(servicioSeleccionado.fecha_servicio).toLocaleDateString()} • 
                            {esVeterinaria(servicioSeleccionado.tipo_servicio) ? ' Consulta Médica' : ' Paseo de 30 minutos'}
                          </p>
                        </div>
                      </div>
                      <img src={walkingDogImg} alt="illustration" className="cal-illustration-top" />
                    </div>

                    <div className="cal-exp-banner">
                      <div className="cal-exp-icon">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--cal-purple)" strokeWidth="2">
                          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                        </svg>
                      </div>
                      <div className="cal-exp-text">
                        <h4>¿Cómo fue tu experiencia?</h4>
                        <p>Tu opinión ayuda a otros dueños a tomar mejores decisiones.</p>
                      </div>
                    </div>

                    <form onSubmit={handleEnviar}>
                      <div className="cal-rating-row">
                        <div className="cal-stars-section">
                          <h4>Calificación general</h4>
                          <Estrellas 
                            calificacion={calificacion} 
                            setCalificacion={setCalificacion} 
                            editable={true} 
                            size={40} 
                          />
                        </div>

                        <div className="cal-recommend-section">
                          <h4>¿Recomendarías este servicio?</h4>
                          <div className="cal-recommend-toggles">
                            <button 
                              type="button" 
                              className={`cal-toggle-btn ${recomienda ? 'active' : ''}`}
                              onClick={() => setRecomienda(true)}
                            >
                              👍 Sí
                            </button>
                            <button 
                              type="button" 
                              className={`cal-toggle-btn ${!recomienda ? 'active' : ''}`}
                              onClick={() => setRecomienda(false)}
                            >
                              👎 No
                            </button>
                          </div>
                        </div>
                      </div>

                      <div className="cal-comment-section">
                        <label>Comentario (opcional)</label>
                        <div className="cal-textarea-wrap">
                          <textarea 
                            placeholder="Cuéntanos más sobre tu experiencia..."
                            value={comentario}
                            onChange={(e) => setComentario(e.target.value.slice(0, 500))}
                            maxLength={500}
                          />
                          <span className="cal-char-counter">{comentario.length}/500</span>
                        </div>
                      </div>

                      <div className="cal-submit-wrap">
                        <button type="submit" className="cal-btn-submit" disabled={enviando}>
                          {enviando ? 'Enviando...' : 'Enviar Calificación'}
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
                          </svg>
                        </button>
                      </div>
                    </form>
                  </div>
                )}
              </>
            ) : (
              <div className="cal-empty-state">
                <div className="cal-empty-icon">🎉</div>
                <h3>¡Todo al día!</h3>
                <p>No tienes servicios pendientes por calificar en este momento.</p>
              </div>
            )}
          </>
        )}

        {tab === 'historial' && (
          <div className="cal-historial-list">
            {historialServicios.length > 0 ? (
              historialServicios.map(s => (
                <div key={s.id} className="cal-main-card">
                  <div className="cal-card-top">
                    <div className="cal-provider-info">
                      <div className="cal-provider-avatar">
                        {s.proveedor_foto ? (
                          <img src={s.proveedor_foto} alt="provider" />
                        ) : (
                          <span>{s.proveedor_nombre?.[0]?.toUpperCase() ?? '?'}</span>
                        )}
                      </div>
                      <div className="cal-provider-details">
                        <div className="cal-name-row">
                          <h2>{s.proveedor_nombre ?? 'Proveedor'}</h2>
                          <span className="cal-role-tag">
                            {esVeterinaria(s.tipo_servicio) ? 'Veterinario' : 'Paseador'}
                          </span>
                        </div>
                        <p className="cal-service-meta">
                          Calificado el {s.fecha_resena 
                            ? new Date(s.fecha_resena.toString().replace(' ', 'T')).toLocaleDateString() 
                            : 'Recientemente'}
                        </p>
                      </div>
                    </div>
                    <div className="cal-score-badge">
                      <span className="cal-score-num">{Number(s.calificacion).toFixed(1)}</span>
                      <Estrellas calificacion={s.calificacion} size={14} />
                    </div>
                  </div>
                  <p className="cal-comment-prev">"{s.comentario || 'Sin comentario'}"</p>
                </div>
              ))
            ) : (
              <div className="cal-empty-state">
                <div className="cal-empty-icon">📋</div>
                <h3>Historial vacío</h3>
                <p>Aún no has realizado ninguna calificación.</p>
              </div>
            )}
          </div>
        )}
      </main>

      <footer className="cal-info-footer">
        <div className="cal-info-footer-left">
          <div className="cal-info-footer-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
          </div>
          <div className="cal-info-footer-text">
            <h5>Tu opinión es importante y siempre será respetuosa.</h5>
            <p>Las calificaciones se publican de forma anónima para proteger tu privacidad.</p>
          </div>
        </div>
        <img src={petFooterImg} alt="pet" className="cal-pet-illustration" />
      </footer>
    </div>
  );
}