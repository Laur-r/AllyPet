import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './CarnetVet.css';
import { getCarnetVet, agregarHistorialVet, agregarRecordatorioVet } from "../../services/carnet.service";

const API = 'http://localhost:3003';
const TIPOS = ['consulta', 'diagnóstico', 'tratamiento', 'cirugía', 'otro'];
const TIPOS_REC = ['vacuna', 'cita', 'tratamiento', 'otro'];

const TIPO_EMOJI = {
  consulta: '🩺', diagnóstico: '📋',
  tratamiento: '💊', cirugía: '🏥', otro: '📝',
};

const FORM_VACIO = {
  fecha: new Date().toISOString().split('T')[0],
  tipo: 'consulta',
  descripcion: '',
  veterinario: '',
  notas: '',
  agregarRecordatorio: false,
  rec_tipo: 'vacuna',
  rec_nombre: '',
  rec_descripcion: '',
  rec_fecha: '',
};

const IcoBack = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <polyline points="15 18 9 12 15 6"/>
  </svg>
);
const IcoCheck = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);
const IcoX = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <path d="M18 6L6 18M6 6l12 12"/>
  </svg>
);

export default function CarnetVet() {
  const { petId } = useParams();
  const navigate  = useNavigate();

  const [carnet,        setCarnet]        = useState(null);
  const [loading,       setLoading]       = useState(true);
  const [error,         setError]         = useState(null);
  const [tab,           setTab]           = useState('info');
  const [toast,         setToast]         = useState(null);
  const [modalConsulta, setModalConsulta] = useState(false);
  const [guardando,     setGuardando]     = useState(false);
  const [form,          setForm]          = useState({ ...FORM_VACIO });
  const [errs,          setErrs]          = useState({});

  const notify = msg => { setToast(msg); setTimeout(() => setToast(null), 2800); };

  useEffect(() => {
    let cancelado = false;
    setLoading(true);
    getCarnetVet(petId)
      .then(res => { if (!cancelado) setCarnet(res.data.data); })
      .catch(() => { if (!cancelado) setError('No se pudo cargar el carnet'); })
      .finally(() => { if (!cancelado) setLoading(false); });
    return () => { cancelado = true; };
  }, [petId]);

  const set = (k, v) => {
    setForm(f => ({ ...f, [k]: v }));
    setErrs(e => ({ ...e, [k]: '' }));
  };

  const handleGuardar = async () => {
    const e = {};
    if (!form.fecha)               e.fecha       = 'Requerido';
    if (!form.descripcion.trim())  e.descripcion = 'Requerido';
    if (form.agregarRecordatorio && !form.rec_nombre.trim()) e.rec_nombre = 'Requerido';
    if (form.agregarRecordatorio && !form.rec_fecha)         e.rec_fecha  = 'Requerido';
    if (Object.keys(e).length) { setErrs(e); return; }

    setGuardando(true);
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');

      // 1. Guardar historial
      const resH = await agregarHistorialVet(petId, {
        fecha:       form.fecha,
        tipo:        form.tipo,
        descripcion: form.descripcion,
        veterinario: user.nombre || form.veterinario,
        notas:       form.notas,
      });

      // 2. Guardar recordatorio si aplica
      let nuevoRecordatorio = null;
      if (form.agregarRecordatorio) {
        const resR = await agregarRecordatorioVet(petId, {
          tipo:             form.rec_tipo,
          nombre:           form.rec_nombre,
          descripcion:      form.rec_descripcion,
          fecha_programada: form.rec_fecha,
        });
        nuevoRecordatorio = resR.data.data;
      }

      // 3. Actualizar estado local sin recargar
   const resCarnet = await getCarnetVet(petId);
   setCarnet(resCarnet.data.data);

      setModalConsulta(false);
      setForm({ ...FORM_VACIO });
      notify(form.agregarRecordatorio
        ? 'Consulta registrada y recordatorio programado ✓'
        : 'Consulta registrada correctamente ✓');
    } catch {
      notify('Error al guardar');
    } finally {
      setGuardando(false);
    }
  };

  const formatFecha = (f) => {
    if (!f) return '—';
    return new Date(f).toLocaleDateString('es-CO', {
      day: '2-digit', month: 'long', year: 'numeric',
    });
  };

  const getFotoUrl = (foto) => {
    if (!foto) return null;
    if (foto.startsWith('http')) return foto;
    return `${API}${foto}`;
  };

  if (loading) return <div className="cv-loading">Cargando carnet...</div>;
  if (error)   return (
    <div className="cv-error">
      {error}<br/>
      <button onClick={() => navigate(-1)}>Volver</button>
    </div>
  );

  return (
    <div className="cv-page">

      {/* Header */}
      <div className="cv-header">
        <button className="cv-back" onClick={() => navigate(-1)}>
          <IcoBack /> Pacientes
        </button>
        <button className="cv-btn-consulta" onClick={() => setModalConsulta(true)}>
          + Registrar consulta
        </button>
      </div>

      {/* Carnet hero */}
      <div className="cv-card">
        <div className="cv-card-hero">
          <div className="cv-avatar">
            {getFotoUrl(carnet.foto)
              ? <img src={getFotoUrl(carnet.foto)} alt={carnet.nombre} />
              : '🐾'
            }
          </div>
          <div className="cv-hero-info">
            <h2>{carnet.nombre}</h2>
            <p>{carnet.raza} · {carnet.sexo} · {carnet.edad} {carnet.edad === 1 ? 'año' : 'años'}</p>
            <p className="cv-especie">{carnet.especie}</p>
          </div>
          <div className="cv-id-badge">ID #{String(carnet.id).padStart(5, '0')}</div>
        </div>

        <div className="cv-stats">
          <div className="cv-stat"><label>Peso</label><span>{carnet.peso ? `${carnet.peso} kg` : '—'}</span></div>
          <div className="cv-stat"><label>Color</label><span>{carnet.color || '—'}</span></div>
          <div className="cv-stat"><label>Dueño</label><span>{carnet.dueno_nombre}</span></div>
          <div className="cv-stat"><label>Contacto</label><span>{carnet.dueno_telefono || carnet.dueno_email || '—'}</span></div>
        </div>
      </div>

      {/* Tabs */}
      <div className="cv-tabs">
        {['info', 'historial', 'vacunas', 'recordatorios'].map(t => (
          <button
            key={t}
            className={`cv-tab ${tab === t ? 'active' : ''}`}
            onClick={() => setTab(t)}
          >
            {t === 'info'           ? 'Info'
             : t === 'historial'    ? `Historial (${carnet.historial?.length || 0})`
             : t === 'vacunas'      ? `Vacunas (${carnet.vacunas?.length || 0})`
             : `Recordatorios (${carnet.recordatorios?.length || 0})`}
          </button>
        ))}
      </div>

      {/* Tab: Info */}
      {tab === 'info' && (
        <div className="cv-section">
          {carnet.notas && (
            <div className="cv-info-card">
              <h3>Notas del dueño</h3>
              <p>{carnet.notas}</p>
            </div>
          )}
          <div className="cv-info-card">
            <h3>Información general</h3>
            <div className="cv-info-grid">
              <div><label>Especie</label><span>{carnet.especie}</span></div>
              <div><label>Raza</label><span>{carnet.raza}</span></div>
              <div><label>Sexo</label><span>{carnet.sexo}</span></div>
              <div><label>Edad</label><span>{carnet.edad} {carnet.edad === 1 ? 'año' : 'años'}</span></div>
              <div><label>Peso</label><span>{carnet.peso ? `${carnet.peso} kg` : '—'}</span></div>
              <div><label>Color</label><span>{carnet.color || '—'}</span></div>
              <div><label>Registrado</label><span>{formatFecha(carnet.fecha_registro)}</span></div>
            </div>
          </div>
        </div>
      )}

      {/* Tab: Historial */}
      {tab === 'historial' && (
        <div className="cv-section">
          {(!carnet.historial || carnet.historial.length === 0) ? (
            <div className="cv-empty">
              <div style={{ fontSize: '2.5rem' }}>🩺</div>
              <p>Sin registros médicos aún.<br />Registra la primera consulta.</p>
              <button className="cv-btn-consulta" onClick={() => setModalConsulta(true)}>
                + Registrar consulta
              </button>
            </div>
          ) : (
            <div className="cv-timeline">
              {carnet.historial.map(h => (
                <div className="cv-entry" key={h.id}>
                  <div className={`cv-entry-dot ${h.tipo}`}>{TIPO_EMOJI[h.tipo] || '📝'}</div>
                  <div className="cv-entry-card">
                    <div className="cv-entry-top">
                      <span className={`cv-tipo-badge ${h.tipo}`}>{h.tipo}</span>
                      <span className="cv-entry-fecha">{formatFecha(h.fecha)}</span>
                    </div>
                    <p className="cv-entry-desc">{h.descripcion}</p>
                    {h.veterinario && <div className="cv-entry-vet">🩺 {h.veterinario}</div>}
                    {h.notas && <div className="cv-entry-notas">{h.notas}</div>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab: Vacunas */}
      {tab === 'vacunas' && (
        <div className="cv-section">
          {(!carnet.vacunas || carnet.vacunas.length === 0) ? (
            <div className="cv-empty"><p>Sin vacunas registradas</p></div>
          ) : carnet.vacunas.map(v => (
            <div className="cv-vacuna-item" key={v.id}>
              <div className={`cv-vacuna-dot ${v.fecha_proxima && new Date(v.fecha_proxima) >= new Date() ? 'proxima' : ''}`} />
              <div className="cv-vacuna-info">
                <strong>{v.nombre}</strong>
                <span>{v.fecha_proxima
                  ? `Próxima: ${formatFecha(v.fecha_proxima)}`
                  : `Aplicada: ${formatFecha(v.fecha_aplicacion)}`}
                </span>
                {v.veterinario && <span className="cv-vacuna-vet">🩺 {v.veterinario}</span>}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab: Recordatorios */}
      {tab === 'recordatorios' && (
        <div className="cv-section">
          {(!carnet.recordatorios || carnet.recordatorios.length === 0) ? (
            <div className="cv-empty"><p>Sin recordatorios programados</p></div>
          ) : carnet.recordatorios.map(r => (
            <div className="cv-rec-item" key={r.id}>
              <div className="cv-rec-info">
                <strong>{r.nombre}</strong>
                <span className="cv-rec-tipo">{r.tipo}</span>
                {r.descripcion && <p>{r.descripcion}</p>}
              </div>
              <div className="cv-rec-fecha">{formatFecha(r.fecha_programada)}</div>
            </div>
          ))}
        </div>
      )}

      {/* Modal registrar consulta */}
      {modalConsulta && (
        <div className="cv-overlay" onClick={() => setModalConsulta(false)}>
          <div className="cv-modal" onClick={e => e.stopPropagation()}>
            <div className="cv-modal-head">
              <h2>Registrar consulta — {carnet.nombre}</h2>
              <button className="cv-modal-x" onClick={() => setModalConsulta(false)}><IcoX /></button>
            </div>

            <div className="cv-modal-body">
              <div className="cv-fg">
                <label>Fecha *</label>
                <input type="date" className="cv-input" value={form.fecha}
                  onChange={e => set('fecha', e.target.value)} />
                {errs.fecha && <span className="cv-err">{errs.fecha}</span>}
              </div>
              <div className="cv-fg">
                <label>Tipo *</label>
                <select className="cv-select" value={form.tipo}
                  onChange={e => set('tipo', e.target.value)}>
                  {TIPOS.map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
              <div className="cv-fg">
                <label>Descripción / Diagnóstico *</label>
                <textarea className="cv-textarea"
                  placeholder="Describe la consulta, hallazgos, diagnóstico..."
                  value={form.descripcion}
                  onChange={e => set('descripcion', e.target.value)} />
                {errs.descripcion && <span className="cv-err">{errs.descripcion}</span>}
              </div>
              <div className="cv-fg">
                <label>Notas adicionales</label>
                <textarea className="cv-textarea" style={{ minHeight: 60 }}
                  placeholder="Indicaciones, tratamiento a seguir en casa..."
                  value={form.notas}
                  onChange={e => set('notas', e.target.value)} />
              </div>

              <div className="cv-recordatorio-toggle">
                <label className="cv-toggle-label">
                  <input
                    type="checkbox"
                    checked={form.agregarRecordatorio}
                    onChange={e => set('agregarRecordatorio', e.target.checked)}
                  />
                  <span>Programar recordatorio para el dueño</span>
                </label>
              </div>

              {form.agregarRecordatorio && (
                <div className="cv-rec-form">
                  <div className="cv-rec-form-row">
                    <div className="cv-fg">
                      <label>Tipo de recordatorio</label>
                      <select className="cv-select" value={form.rec_tipo}
                        onChange={e => set('rec_tipo', e.target.value)}>
                        {TIPOS_REC.map(t => <option key={t}>{t}</option>)}
                      </select>
                    </div>
                    <div className="cv-fg">
                      <label>Fecha *</label>
                      <input type="date" className="cv-input" value={form.rec_fecha}
                        onChange={e => set('rec_fecha', e.target.value)} />
                      {errs.rec_fecha && <span className="cv-err">{errs.rec_fecha}</span>}
                    </div>
                  </div>
                  <div className="cv-fg">
                    <label>Nombre del recordatorio *</label>
                    <input type="text" className="cv-input"
                      placeholder="Ej: Control post-operatorio"
                      value={form.rec_nombre}
                      onChange={e => set('rec_nombre', e.target.value)} />
                    {errs.rec_nombre && <span className="cv-err">{errs.rec_nombre}</span>}
                  </div>
                  <div className="cv-fg">
                    <label>Descripción</label>
                    <input type="text" className="cv-input"
                      placeholder="Indicaciones para el dueño..."
                      value={form.rec_descripcion}
                      onChange={e => set('rec_descripcion', e.target.value)} />
                  </div>
                </div>
              )}
            </div>

            <div className="cv-modal-foot">
              <button className="cv-btn-sec" onClick={() => setModalConsulta(false)}>Cancelar</button>
              <button className="cv-btn-primary" onClick={handleGuardar} disabled={guardando}>
                {guardando ? 'Guardando...' : 'Guardar consulta'}
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && <div className="cv-toast"><IcoCheck /> {toast}</div>}
    </div>
  );
}