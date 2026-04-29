import { useState, useMemo } from 'react';
import Estrellas from '../Estrellas/Estrellas';
import './ListaResenas.css';

/**
 * Componente ListaResenas - Unificado para Paseadores y Veterinarias.
 * Muestra el resumen de reputación, barras de estadísticas y el listado de comentarios.
 */
export default function ListaResenas({ resenas = [], nombreProveedor = '', rol = 'paseador' }) {
  const [filtroCalificacion, setFiltroCalificacion] = useState('todas');
  const [filtroOrden, setFiltroOrden] = useState('recientes');

  // —— Determinar si es tema violeta ——
  const esVeterinaria = rol === 'veterinaria' || rol === 'veterinario';
  const themeClass = esVeterinaria ? 'theme-violet' : 'theme-green';

  // —— Cálculos de Resumen ——
  const stats = useMemo(() => {
    const counts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    let sum = 0;
    resenas.forEach(r => {
      const cal = Math.round(r.calificacion);
      if (counts[cal] !== undefined) counts[cal]++;
      sum += r.calificacion;
    });
    const total = resenas.length;
    const promedio = total > 0 ? (sum / total).toFixed(1) : "0.0";
    
    return { counts, total, promedio };
  }, [resenas]);

  const { counts, total, promedio } = stats;

  // —— Lógica Mensaje Dinámico de Confianza ——
  const getMensajeConfianza = (avg) => {
    const val = parseFloat(avg);
    const articulos = esVeterinaria ? 'Esta' : 'Este';
    const sujeto = esVeterinaria ? 'veterinaria' : 'paseador';
    const proveedorFinal = nombreProveedor || `${articulos} ${sujeto}`;
    const iconBase = esVeterinaria ? "🩺" : "🛡️";

    if (val >= 4.5) return { 
      label: "Excelente", 
      title: `${proveedorFinal} es altamente confiable`, 
      desc: "Sus excelentes reseñas reflejan un servicio seguro y de calidad",
      icon: iconBase 
    };
    if (val >= 4.0) return { 
      label: "Muy bueno", 
      title: `${proveedorFinal} es un servicio bien valorado`, 
      desc: "Los clientes destacan su buen trato y responsabilidad",
      icon: "🐾" 
    };
    return { 
      label: "Bueno", 
      title: `${proveedorFinal} tiene valoraciones positivas`, 
      desc: "Sigue mejorando su servicio con cada experiencia",
      icon: "✨" 
    };
  };

  const mensaje = getMensajeConfianza(promedio);

  // —— Filtrado y Ordenamiento ——
  const resenasFiltradas = useMemo(() => {
    let filtradas = [...resenas];
    if (filtroCalificacion !== 'todas') {
      filtradas = filtradas.filter(r => Math.round(r.calificacion) === parseInt(filtroCalificacion));
    }
    if (filtroOrden === 'recientes') {
      filtradas.sort((a, b) => new Date(b.fecha || b.fecha_creacion) - new Date(a.fecha || a.fecha_creacion));
    }
    return filtradas;
  }, [resenas, filtroCalificacion, filtroOrden]);

  if (resenas.length === 0) {
    return (
      <div className={`resenas-vacias ${themeClass}`}>
        <div className="resenas-vacias-icon">💬</div>
        <p>Aún no hay reseñas para este {esVeterinaria ? 'veterinario' : 'paseador'}.</p>
        <span>Sé el primero en calificar su servicio.</span>
      </div>
    );
  }

  return (
    <div className={`resenas-panel-container ${themeClass}`}>
      <div className="resenas-header-section">
        <h3 className="resenas-title-main">Reseñas de clientes</h3>
        <div className="resenas-title-underline" />
      </div>

      <div className="resenas-panel">
        <div className="resenas-notice-box">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          Las reseñas son generadas por los dueños de mascotas y no pueden editarse.
        </div>

        {/* ── SECCIÓN 1: RESUMEN ── */}
        <div className="resenas-summary-card">
          <div className="resenas-score-box">
            <div className="resenas-score-big">{Number(promedio).toFixed(1)}</div>
            <Estrellas calificacion={parseFloat(promedio)} size={20} />
            <div className="resenas-score-label">
              {mensaje.label} {parseFloat(promedio) >= 4.5 && "🎉"}
            </div>
            <div className="resenas-score-count">Basado en {total} {total === 1 ? 'reseña' : 'reseñas'}</div>
          </div>

          <div className="resenas-detailed-bars">
            <h4>Calificación detallada</h4>
            {[5, 4, 3, 2, 1].map(num => {
              const porcentaje = total > 0 ? (counts[num] / total) * 100 : 0;
              return (
                <div key={num} className="resena-bar-row">
                  <span className="resena-bar-num">{num} ★</span>
                  <div className="resena-bar-bg">
                    <div className="resena-bar-fill" style={{ width: `${porcentaje}%` }} />
                  </div>
                  <span className="resena-bar-count">{counts[num]}</span>
                </div>
              );
            })}
          </div>

          <div className="resenas-trust-card">
            <div className="resenas-trust-icon-wrap">
              <span className="resenas-trust-icon">{mensaje.icon}</span>
              <div className="resenas-trust-check">✓</div>
            </div>
            <div className="resenas-trust-info">
              <h5>{mensaje.title}</h5>
              <p>{mensaje.desc}</p>
            </div>
          </div>
        </div>

        {/* ── SECCIÓN 2: FILTROS ── */}
        <div className="resenas-filters">
          <div className="resenas-filter-item">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
            <select value={filtroOrden} onChange={e => setFiltroOrden(e.target.value)}>
              <option value="recientes">Más recientes</option>
              <option value="antiguas">Más antiguas</option>
            </select>
          </div>
          <div className="resenas-filter-item">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
            <select value={filtroCalificacion} onChange={e => setFiltroCalificacion(e.target.value)}>
              <option value="todas">Todas las calificaciones</option>
              <option value="5">Solo 5 estrellas</option>
              <option value="4">4 estrellas o más</option>
            </select>
          </div>
        </div>

        {/* ── SECCIÓN 3: LISTADO ── */}
        <div className="resenas-lista-items">
          {resenasFiltradas.map((r) => {
            const dueno = r.usuario_dueno || { nombre: r.nombre_dueno || 'Usuario' };
            const inicial = dueno.nombre ? dueno.nombre[0].toUpperCase() : '?';
            const fecha = new Date(r.fecha || r.fecha_creacion).toLocaleDateString('es-CO', {
              day: 'numeric', month: 'long', year: 'numeric'
            });

            return (
              <div key={r.id} className="resena-card-modern">
                <div className="resena-user-avatar">
                  {dueno.foto_perfil ? <img src={dueno.foto_perfil} alt={dueno.nombre} /> : <div className="resena-avatar-initial">{inicial}</div>}
                </div>
                <div className="resena-content">
                  <div className="resena-top-line">
                    <span className="resena-author">{dueno.nombre}</span>
                    <span className="resena-dot">•</span>
                    <span className="resena-date">{fecha}</span>
                  </div>

                  <div className="resena-mid-line">
                    <Estrellas calificacion={r.calificacion} size={14} />
                  </div>

                  <p className="resena-text">"{r.comentario}"</p>

                  <div className="resena-tag-service">
                    <span className="resena-tag-icon">
                      {r.tipo_servicio === 'veterinaria' ? '🩺' : '🐾'}
                    </span>
                    {r.tipo_servicio === 'veterinaria' ? 'Veterinaria' : 'Paseo'}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
