import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './HistorialMedico.css';
import { getHistorial, agregarHistorial, eliminarHistorial } from '../../services/carnet.service';

const TIPOS = ['consulta', 'diagnóstico', 'tratamiento', 'cirugía', 'otro'];

const TIPO_EMOJI = {
  consulta:    '🩺',
  diagnóstico: '📋',
  tratamiento: '💊',
  cirugía:     '🏥',
  otro:        '📝',
};

const FORM_VACIO = {
  fecha: '',
  tipo: 'consulta',
  descripcion: '',
  veterinario: '',
  notas: '',
};

const IcoBack = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <polyline points="15 18 9 12 15 6"/>
  </svg>
);

const IcoDel = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
    <polyline points="3 6 5 6 21 6"/>
    <path d="M19 6l-1 14H6L5 6"/>
    <path d="M10 11v6M14 11v6"/>
    <path d="M9 6V4h6v2"/>
  </svg>
);

const IcoX = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <path d="M18 6L6 18M6 6l12 12"/>
  </svg>
);

const IcoCheck = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);

export default function HistorialMedico() {
  const { petId } = useParams();
  const navigate  = useNavigate();

  const [historial,   setHistorial]   = useState([]);
  const [petNombre,   setPetNombre]   = useState('');
  const [loading,     setLoading]     = useState(true);
  const [modal,       setModal]       = useState(false);
  const [confirmDel,  setConfirmDel]  = useState(null);
  const [form,        setForm]        = useState({ ...FORM_VACIO });
  const [errs,        setErrs]        = useState({});
  const [toast,       setToast]       = useState(null);
  const [guardando,   setGuardando]   = useState(false);

  const notify = msg => {
    setToast(msg);
    setTimeout(() => setToast(null), 2800);
  };

  const formatFecha = (fecha) => {
    if (!fecha) return '—';
    return new Date(fecha).toLocaleDateString('es-CO', {
      day: '2-digit', month: 'long', year: 'numeric',
    });
  };

  useEffect(() => {
    if (!petId) return;
    setLoading(true);

    // Carga nombre de la mascota
    const token = localStorage.getItem('token');
    fetch(`http://localhost:3003/api/pets/${petId}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(r => r.json())
      .then(res => { if (res.ok) setPetNombre(res.data.nombre); })
      .catch(() => {});

    // Carga historial
    getHistorial(petId)
      .then(res => setHistorial(res.data.data || []))
      .catch(() => notify('Error al cargar historial'))
      .finally(() => setLoading(false));
  }, [petId]);

  const set = (k, v) => {
    setForm(f => ({ ...f, [k]: v }));
    setErrs(e => ({ ...e, [k]: '' }));
  };

  const handleGuardar = async () => {
    const e = {};
    if (!form.fecha)       e.fecha       = 'Campo requerido';
    if (!form.descripcion.trim()) e.descripcion = 'Campo requerido';
    if (Object.keys(e).length) { setErrs(e); return; }

    setGuardando(true);
    try {
      const res = await agregarHistorial(petId, form);
      setHistorial(prev => [res.data.data, ...prev]);
      setModal(false);
      setForm({ ...FORM_VACIO });
      notify('Registro agregado correctamente');
    } catch {
      notify('Error al guardar el registro');
    } finally {
      setGuardando(false);
    }
  };

  const handleEliminar = async () => {
    try {
      await eliminarHistorial(petId, confirmDel.id);
      setHistorial(prev => prev.filter(h => h.id !== confirmDel.id));
      notify('Registro eliminado');
    } catch {
      notify('Error al eliminar');
    } finally {
      setConfirmDel(null);
    }
  };

  return (
    <div className="hm-page">

      {/* Header */}
      <div className="hm-header">
        <div className="hm-header-left">
          <button className="hm-back-btn" onClick={() => navigate(-1)}>
            <IcoBack />
          </button>
          <div>
            <h1>Historial médico</h1>
            {petNombre && <p>{petNombre}</p>}
          </div>
        </div>
        <button className="hm-btn-agregar" onClick={() => setModal(true)}>
          + Agregar registro
        </button>
      </div>

      {/* Contenido */}
      {loading ? (
        <div className="hm-loading">Cargando historial...</div>
      ) : historial.length === 0 ? (
        <div className="hm-empty">
          <div className="hm-empty-icon">🩺</div>
          <h3>Sin registros médicos</h3>
          <p>Agrega el primer registro del historial de {petNombre || 'tu mascota'}</p>
        </div>
      ) : (
        <div className="hm-timeline">
          {historial.map(entry => (
            <div className="hm-entry" key={entry.id}>
              <div className={`hm-entry-dot ${entry.tipo}`}>
                {TIPO_EMOJI[entry.tipo] || '📝'}
              </div>
              <div className="hm-entry-card">
                <div className="hm-entry-top">
                  <div className="hm-entry-meta">
                    <span className={`hm-tipo-badge ${entry.tipo}`}>{entry.tipo}</span>
                    <span className="hm-entry-fecha">{formatFecha(entry.fecha)}</span>
                  </div>
                  <button className="hm-btn-del" onClick={() => setConfirmDel(entry)}>
                    <IcoDel />
                  </button>
                </div>
                <p className="hm-entry-desc">{entry.descripcion}</p>
                {entry.veterinario && (
                  <div className="hm-entry-vet">
                    🩺 {entry.veterinario}
                  </div>
                )}
                {entry.notas && (
                  <div className="hm-entry-notas">{entry.notas}</div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal agregar */}
      {modal && (
        <div className="hm-overlay" onClick={() => setModal(false)}>
          <div className="hm-modal" onClick={e => e.stopPropagation()}>
            <div className="hm-modal-head">
              <h2>Nuevo registro médico</h2>
              <button className="hm-modal-x" onClick={() => setModal(false)}><IcoX /></button>
            </div>
            <div className="hm-modal-body">
              <div className="hm-fg">
                <label>Fecha *</label>
                <input
                  type="date"
                  className="hm-input"
                  value={form.fecha}
                  onChange={e => set('fecha', e.target.value)}
                />
                {errs.fecha && <span className="hm-err">{errs.fecha}</span>}
              </div>
              <div className="hm-fg">
                <label>Tipo *</label>
                <select className="hm-select" value={form.tipo} onChange={e => set('tipo', e.target.value)}>
                  {TIPOS.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div className="hm-fg">
                <label>Descripción *</label>
                <textarea
                  className="hm-textarea"
                  placeholder="Describe la consulta, diagnóstico o tratamiento..."
                  value={form.descripcion}
                  onChange={e => set('descripcion', e.target.value)}
                />
                {errs.descripcion && <span className="hm-err">{errs.descripcion}</span>}
              </div>
              <div className="hm-fg">
                <label>Veterinario</label>
                <input
                  type="text"
                  className="hm-input"
                  placeholder="Nombre del veterinario"
                  value={form.veterinario}
                  onChange={e => set('veterinario', e.target.value)}
                />
              </div>
              <div className="hm-fg">
                <label>Notas adicionales</label>
                <textarea
                  className="hm-textarea"
                  placeholder="Observaciones, indicaciones, seguimiento..."
                  value={form.notas}
                  onChange={e => set('notas', e.target.value)}
                  style={{ minHeight: 60 }}
                />
              </div>
            </div>
            <div className="hm-modal-foot">
              <button className="hm-btn-sec" onClick={() => setModal(false)}>Cancelar</button>
              <button className="hm-btn-primary" onClick={handleGuardar} disabled={guardando}>
                {guardando ? 'Guardando...' : 'Guardar registro'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal confirmar eliminar */}
      {confirmDel && (
        <div className="hm-overlay" onClick={() => setConfirmDel(null)}>
          <div className="hm-modal" style={{ maxWidth: 360 }} onClick={e => e.stopPropagation()}>
            <div className="hm-modal-head">
              <h2>Eliminar registro</h2>
              <button className="hm-modal-x" onClick={() => setConfirmDel(null)}><IcoX /></button>
            </div>
            <div className="hm-modal-body" style={{ textAlign: 'center', padding: '2rem' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: 12 }}>🗑️</div>
              <p style={{ fontSize: '0.9rem', color: '#1A1A2E', fontWeight: 500 }}>
                ¿Eliminar este registro de <span style={{ color: '#8B35C8' }}>{confirmDel.tipo}</span>?
              </p>
              <p style={{ fontSize: '0.82rem', color: '#6B7280', marginTop: 6 }}>
                Esta acción no se puede deshacer.
              </p>
            </div>
            <div className="hm-modal-foot">
              <button className="hm-btn-sec" onClick={() => setConfirmDel(null)}>Cancelar</button>
              <button
                className="hm-btn-primary"
                style={{ background: '#ef4444' }}
                onClick={handleEliminar}
              >
                Sí, eliminar
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div className="hm-toast">
          <IcoCheck /> {toast}
        </div>
      )}
    </div>
  );
}