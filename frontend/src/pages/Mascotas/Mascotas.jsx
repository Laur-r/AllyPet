import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Mascotas.css';

const API = 'http://localhost:3003';
const getToken = () => localStorage.getItem('token');

const authFetch = (url, options = {}) => {
  const isFormData = options.body instanceof FormData;
  return fetch(`${API}${url}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${getToken()}`,
      ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
      ...options.headers,
    },
  }).then(r => r.json());
};

const getFotoUrl = (foto) => {
  if (!foto) return null;
  if (foto.startsWith('http')) return foto;
  if (foto.startsWith('/uploads')) return `${API}${foto}`;
  return null;
};

const normalizarMascota = (m) => ({
  ...m,
  especie: m.especie || 'Perro',
  sexo:    m.sexo    || 'Macho',
  color:   m.color   || '',
  notas:   m.notas   || '',
  edad:    m.edad    != null ? String(m.edad) : '',
  peso:    m.peso    != null ? String(m.peso) : '',
});

const RAZAS_PERRO = ['Schnauzer','Pincher','Labrador','Golden Retriever','Bulldog','Poodle','Chihuahua','Pastor Alemán','Beagle','Dachshund','Otra'];
const RAZAS_GATO  = ['Persa','Siamés','Maine Coon','Bengalí','Ragdoll','Doméstico','Otra'];
const RAZAS_OTRO  = ['Conejo','Hamster','Ave','Reptil','Otro'];
const FILTROS     = ['Todas','Perros','Gatos','Otros','Recordatorios'];
const FORM_VACIO  = { nombre:'', especie:'Perro', raza:'', sexo:'Macho', edad:'', peso:'', color:'', notas:'', foto:null };

const REC_TYPES = {
  vacuna:    { emoji: '💉', color: '#7B2D8B' },
  desparasitacion: { emoji: '💊', color: '#6CC04A' },
  higiene:   { emoji: '🧼', color: '#3A86FF' },
  control:   { emoji: '🩺', color: '#FFBE0B' },
  otro:      { emoji: '📋', color: '#6B7280' }
};

const IcoEdit   = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>;
const IcoDel    = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/></svg>;
const IcoX      = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 6L6 18M6 6l12 12"/></svg>;
const IcoCheck  = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>;
const IcoArrow  = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>;
const IcoPlus   = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>;
const IcoCam    = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>;
const IcoExternal = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ marginLeft: 4 }}><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>;

const IcoDog = () => <svg width="52" height="52" viewBox="0 0 64 64" fill="none" stroke="#C4A0D4" strokeWidth="2"><ellipse cx="32" cy="37" rx="18" ry="13"/><ellipse cx="32" cy="24" rx="12" ry="10"/><path d="M20 24 Q14 20 12 28"/><path d="M44 24 Q50 20 52 28"/><circle cx="28" cy="23" r="1.5" fill="#C4A0D4"/><circle cx="36" cy="23" r="1.5" fill="#C4A0D4"/><path d="M28 29 Q32 33 36 29"/></svg>;
const IcoCat = () => <svg width="52" height="52" viewBox="0 0 64 64" fill="none" stroke="#C4A0D4" strokeWidth="2"><ellipse cx="32" cy="37" rx="16" ry="12"/><path d="M16 37 Q16 22 22 18 L18 10 L28 18"/><path d="M48 37 Q48 22 42 18 L46 10 L36 18"/><circle cx="27" cy="35" r="1.5" fill="#C4A0D4"/><circle cx="37" cy="35" r="1.5" fill="#C4A0D4"/><path d="M27 40 Q32 43 37 40"/></svg>;

// --- COMPONENTE PRINCIPAL ---
export default function Mascotas() {
  const navigate = useNavigate();
  const [mascotas, setMascotas] = useState([]);
  const [recordatoriosReales, setRecordatoriosReales] = useState({});
  const [cargando, setCargando] = useState(true);
  const [filtro, setFiltro] = useState('Todas');
  const [modalForm, setModalForm] = useState(false);
  const [editando, setEditando] = useState(null);
  const [confirmDel, setConfirmDel] = useState(null);
  const [verGaleria, setVerGaleria] = useState(null); 
  const [toast, setToast] = useState(null);

  const notify = msg => { setToast(msg); setTimeout(() => setToast(null), 2800); };

  useEffect(() => {
    let cancelado = false;
    authFetch('/api/pets')
      .then(async res => {
        if (cancelado) return;
        if (res.ok) {
          const mascotasNorm = res.data.map(normalizarMascota);
          if (!cancelado) setMascotas(mascotasNorm);

          const token = getToken();
          const recordatoriosMap = {};
          await Promise.all(mascotasNorm.map(async m => {
            try {
              const r = await fetch(
                `${API}/api/pets/${m.id}/recordatorios`,
                { headers: { Authorization: `Bearer ${token}` } }
              );
              const data = await r.json();
              if (data.ok && data.data?.length > 0) {
              const proximos = data.data
                .filter(rec => !rec.completado)
                .sort((a, b) => new Date(a.fecha_programada) - new Date(b.fecha_programada));

              if (proximos.length > 0) {
                const rec = proximos[0];
                const dias = Math.ceil((new Date(rec.fecha_programada) - new Date()) / (1000 * 60 * 60 * 24));
                 recordatoriosMap[m.id] = { 
                    ...rec, 
                    dias,
                    tipo_norm: rec.tipo?.toLowerCase() || 'otro' 
                  };
                }
              }
            } catch { /* silencioso */ }
          }));
          if (!cancelado) setRecordatoriosReales(recordatoriosMap);
        }
      })
      .catch(() => { if (!cancelado) notify('Error al cargar mascotas'); })
      .finally(() => { if (!cancelado) setCargando(false); });
    return () => { cancelado = true; };
  }, []);

  const abrirCrear  = () => { setEditando(null); setModalForm(true); };
  const abrirEditar = m  => { setEditando(normalizarMascota(m)); setModalForm(true); };

  const guardar = async (data) => {
    const esEdicion = !!editando;
    const url    = esEdicion ? `/api/pets/${editando.id}` : '/api/pets';
    const method = esEdicion ? 'PUT' : 'POST';
    try {
      const formData = new FormData();
      Object.keys(data).forEach(key => {
        if (data[key] !== null && data[key] !== undefined) formData.append(key, data[key]);
      });
      const res = await authFetch(url, { method, body: formData });
      if (res.ok) {
        const mascotaActualizada = normalizarMascota(res.data);
        if (esEdicion) {
          setMascotas(ms => ms.map(m => m.id === mascotaActualizada.id ? mascotaActualizada : m));
          notify(`${mascotaActualizada.nombre} actualizada correctamente`);
        } else {
          setMascotas(ms => [...ms, mascotaActualizada]);
          notify(`${mascotaActualizada.nombre} registrada con éxito`);
        }
        setModalForm(false);
        setEditando(null);
      } else {
        notify(res.message || 'Error al guardar');
      }
    } catch { notify('Error de conexión'); }
  };

  const eliminar = async () => {
    const { id, nombre } = confirmDel;
    try {
      const res = await authFetch(`/api/pets/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setMascotas(ms => ms.filter(m => m.id !== id));
        notify(`${nombre} eliminada`);
      } else {
        notify(res.message || 'Error al eliminar');
      }
    } catch { notify('Error de conexión'); }
    setConfirmDel(null);
  };

 // --- LÓGICA DE FILTRADO ---
  const conRecordatorio = mascotas.map(m => ({
    ...m,
    recordatorio: recordatoriosReales[m.id] || null,
  }));

  const visibles = conRecordatorio.filter(m => {
    if (filtro === 'Perros')        return m.especie === 'Perro';
    if (filtro === 'Gatos')         return m.especie === 'Gato';
    if (filtro === 'Otros')         return m.especie === 'Otro';
    if (filtro === 'Recordatorios') return m.recordatorio !== null;
    return true;
  });

  const proximosRecordatorios = conRecordatorio
    .filter(m => m.recordatorio)
    .sort((a, b) => a.recordatorio.dias - b.recordatorio.dias);

  if (cargando) return (
    <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-soft)', fontFamily: 'Poppins, sans-serif' }}>
      Cargando mascotas…
    </div>
  );

  return (
    <div className="mas-page">
      <div className="mas-head">
        <h1>Mis Mascotas</h1>
        <p>Tienes {mascotas.length} mascota{mascotas.length !== 1 ? 's' : ''} registrada{mascotas.length !== 1 ? 's' : ''}</p>
      </div>

      <div className="mas-filters">
        {FILTROS.map(f => (
          <button key={f} className={`mas-filter${filtro === f ? ' active' : ''}`} onClick={() => setFiltro(f)}>{f}</button>
        ))}
      </div>

      <div className="mas-grid">
        {visibles.map((m, i) => (
          <Tarjeta
            key={m.id} mascota={m}
            style={{ animationDelay: `${i * 55}ms` }}
            onEditar={() => abrirEditar(m)}
            onEliminar={() => setConfirmDel(m)}
            onVerPerfil={() => navigate(`/menu/dueno/mascotas/${m.id}/carnet`)}
            onVerHistorial={() => navigate(`/menu/dueno/mascotas/${m.id}/historial`)}
            onVerGaleria={() => setVerGaleria(m)}
          />
        ))}
        <TarjetaAgregar onClick={abrirCrear} />
      </div>

   {/* --- SECCIÓN RECORDATORIOS ESTILO HISTORIAL --- */}
      {proximosRecordatorios.length > 0 && (
        <>
          <div className="mas-section-title">
            <h2>Próximos recordatorios</h2>
            <button className="mas-ver-todo" onClick={() => setFiltro('Recordatorios')}>
              Ver todos los pendientes <IcoArrow />
            </button>
          </div>

          <div className="mas-reminders-list">
            {proximosRecordatorios.map(m => {
              const rec = m.recordatorio;
              const config = REC_TYPES[rec.tipo_norm] || REC_TYPES.otro;
              return (
                <div key={m.id} className="mas-reminder-row">
                  <div className="mas-reminder-dot-container">
                    <div className="mas-reminder-dot-main" style={{ backgroundColor: config.color }}>
                      {config.emoji}
                    </div>
                    <div className="mas-reminder-line"></div>
                  </div>

                  <div className="mas-reminder-content">
                    <div className="mas-reminder-header">
                      <div className="mas-reminder-main-info">
                        <strong>{rec.nombre}</strong>
                        <span className={`mas-rec-badge ${rec.tipo_norm}`}>{rec.tipo}</span>
                        <span className="mas-pet-tag">@{m.nombre}</span>
                      </div>
                      <div className="mas-reminder-date-info">
                        <span className={`mas-days-badge ${rec.dias <= 3 ? 'urgent' : rec.dias <= 7 ? 'soon' : 'normal'}`}>
                          {rec.dias === 0 ? 'Hoy' : rec.dias < 0 ? `Vencido (${Math.abs(rec.dias)}d)` : `en ${rec.dias} días`}
                        </span>
                      </div>
                    </div>
                    {rec.descripcion && <p className="mas-reminder-desc">{rec.descripcion}</p>}
                    <div className="mas-reminder-footer">
                      <button className="mas-btn-ir" onClick={() => navigate(`/menu/dueno/mascotas/${m.id}/historial`)}>
                        Ir al historial <IcoExternal />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* Modales */}
      {modalForm && <FormularioMascota mascota={editando} onGuardar={guardar} onCerrar={() => setModalForm(false)} />}
      {confirmDel && <ModalEliminar mascota={confirmDel} onConfirmar={eliminar} onCerrar={() => setConfirmDel(null)} />}
      {verGaleria && <GaleriaMascota mascota={verGaleria} onCerrar={() => setVerGaleria(null)} notify={notify} />}
      {toast && <div className="mas-toast"><IcoCheck /> {toast}</div>}
    </div>
  );
}
// --- SUBCOMPONENTES (Tarjeta, Formulario, etc.) ---

function Tarjeta({ mascota, style, onEditar, onEliminar, onVerPerfil, onVerHistorial, onVerGaleria }) {
  const { nombre, especie, raza, sexo, edad, peso, color, foto } = mascota;
  const fotoUrl = getFotoUrl(foto);

  return (
    <div className="mas-card" style={style}>
      <div className="mas-card-img">
        {fotoUrl ? <img src={fotoUrl} alt={nombre} /> : (
          <div className="mas-placeholder">
            {especie === 'Gato' ? <IcoCat /> : <IcoDog />}
            <span>Sin foto</span>
          </div>
        )}
        <span className="mas-badge">{especie}</span>
        <button className="mas-btn-galeria-float" onClick={onVerGaleria} title="Galería"><IcoCam /></button>
      </div>
      <div className="mas-card-body">
        <div className="mas-card-top">
          <div>
            <div className="mas-card-name">{nombre}</div>
            <div className="mas-card-sub">{color || '—'} · {sexo}</div>
          </div>
          <div className="mas-card-actions">
            <button className="mas-icon-btn" onClick={onEditar}><IcoEdit /></button>
            <button className="mas-icon-btn del" onClick={onEliminar}><IcoDel /></button>
          </div>
        </div>
        <div className="mas-stats">
          <div className="mas-stat"><div className="mas-stat-val">{edad}</div><div className="mas-stat-lbl">Edad</div></div>
          <div className="mas-stat"><div className="mas-stat-val">{peso}</div><div className="mas-stat-lbl">Peso</div></div>
          <div className="mas-stat"><div className="mas-stat-val">{raza || '—'}</div><div className="mas-stat-lbl">Raza</div></div>
        </div>
        <div className="mas-card-btns-row">
          <button className="mas-btn-ver" onClick={onVerPerfil}>Carnet</button>      
          <button className="mas-btn-historial" onClick={onVerHistorial}>Historial</button>
        </div>
      </div>
    </div>
  );
}

function TarjetaAgregar({ onClick }) {
  return (
    <div className="mas-add-card" onClick={onClick} role="button" tabIndex={0} onKeyDown={e => e.key === 'Enter' && onClick()}>
      <div className="mas-add-plus">+</div>
      <h3>Agregar mascota</h3>
      <p>Registra el perfil médico de tu nueva mascota</p>
    </div>
  );
}

function GaleriaMascota({ mascota, onCerrar, notify }) {
  const [fotos, setFotos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const fileRef = useRef();

  useEffect(() => {
    authFetch(`/api/pets/${mascota.id}/galeria`)
      .then(res => { if(res.ok) setFotos(res.data); })
      .finally(() => setCargando(false));
  }, [mascota.id]);

  const handleSubir = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const fd = new FormData();
    fd.append('foto', file);

    try {
      const res = await authFetch(`/api/pets/${mascota.id}/galeria`, { method: 'POST', body: fd });
      if (res.ok) {
        setFotos([res.data, ...fotos]);
        notify('Foto añadida al álbum');
      }
    } catch { notify('Error al subir foto'); }
  };

  const eliminarFoto = async (fotoId) => {
    if (!window.confirm('¿Eliminar esta foto?')) return;
    try {
      const res = await authFetch(`/api/pets/galeria/${fotoId}`, { method: 'DELETE' });
      if (res.ok) {
        setFotos(fotos.filter(f => f.id !== fotoId));
        notify('Foto eliminada');
      }
    } catch { notify('Error al eliminar'); }
  };

  return (
    <div className="mas-overlay" onClick={onCerrar}>
      <div className="mas-modal mas-galeria-modal" onClick={e => e.stopPropagation()}>
        <div className="mas-modal-head">
          <div>
            <h2>Álbum de {mascota.nombre}</h2>
            <p>{fotos.length} fotos guardadas</p>
          </div>
          <button className="mas-modal-x" onClick={onCerrar}><IcoX /></button>
        </div>

        <div className="mas-modal-body">
          <div className="mas-galeria-grid">
            {/* Botón Añadir */}
            <div className="mas-galeria-add" onClick={() => fileRef.current.click()}>
              <IcoPlus />
              <span>Subir</span>
              <input type="file" ref={fileRef} hidden onChange={handleSubir} accept="image/*" />
            </div>

            {/* Lista de fotos */}
            {fotos.map(f => (
              <div key={f.id} className="mas-galeria-item">
                <img src={getFotoUrl(f.foto_url)} alt="Mascota" />
                <button className="mas-galeria-del" onClick={() => eliminarFoto(f.id)}>
                  <IcoX />
                </button>
              </div>
            ))}
          </div>
          {cargando && <p style={{ textAlign: 'center', padding: 20 }}>Cargando álbum...</p>}
          {!cargando && fotos.length === 0 && (
            <div className="mas-empty-galeria">
              <p>Aún no hay fotos en el álbum.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function FormularioMascota({ mascota, onGuardar, onCerrar }) {
  const esEdicion = !!mascota;
  const [form,    setForm]    = useState(esEdicion ? { ...mascota } : { ...FORM_VACIO });
  const [preview, setPreview] = useState(() => {
    if (!esEdicion || !mascota.foto) return null;
    return getFotoUrl(mascota.foto);
  });
  const [errs, setErrs] = useState({});
  const fileRef = useRef();

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  const razas = form.especie === 'Perro' ? RAZAS_PERRO
              : form.especie === 'Gato'  ? RAZAS_GATO
              : RAZAS_OTRO;

  const set = (k, v) => {
    setForm(f => ({ ...f, [k]: v }));
    setErrs(e => ({ ...e, [k]: '' }));
  };

  const handleFoto = e => {
    const file = e.target.files[0];
    if (!file) return;
    setPreview(URL.createObjectURL(file));
    set('foto', file);
  };

  const handleGuardar = () => {
    const e = {};
    if (!String(form.nombre).trim()) e.nombre = 'Campo requerido';
    if (!form.raza)                  e.raza   = 'Selecciona una raza';
    if (!String(form.edad).trim())   e.edad   = 'Campo requerido';
    if (Object.keys(e).length) { setErrs(e); return; }
    const { nombre, raza, edad, peso, foto, especie, sexo, color, notas } = form;
    onGuardar({ id: mascota?.id, nombre, raza, edad, peso, foto, especie, sexo, color, notas });
  };

  return (
    <div className="mas-overlay" onClick={onCerrar}>
      <div className="mas-modal" onClick={e => e.stopPropagation()}>
        <div className="mas-modal-head">
          <h2>{esEdicion ? `Editar a ${mascota.nombre}` : 'Registrar nueva mascota'}</h2>
          <button className="mas-modal-x" onClick={onCerrar}><IcoX /></button>
        </div>
        <div className="mas-modal-body">
          <div className="mas-fg full" style={{ marginBottom: 16 }}>
            <label>Foto</label>
            <div className="mas-photo" onClick={() => fileRef.current.click()}>
              <input ref={fileRef} type="file" accept="image/*" onChange={handleFoto} />
              {preview
                ? <img src={preview} alt="preview" className="mas-photo-prev" />
                : <IcoBell size={28} />
              }
              <p>{preview ? 'Toca para cambiar' : 'Subir foto (opcional)'}</p>
            </div>
          </div>
          <div className="mas-form-grid">
            <div className="mas-fg full">
              <label>Nombre *</label>
              <input className="mas-input" placeholder="Ej: Luna" value={form.nombre} onChange={e => set('nombre', e.target.value)} />
              {errs.nombre && <span className="mas-err">{errs.nombre}</span>}
            </div>
            <div className="mas-fg">
              <label>Especie *</label>
              <select className="mas-select" value={form.especie} onChange={e => { set('especie', e.target.value); set('raza', ''); }}>
                {['Perro','Gato','Otro'].map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div className="mas-fg">
              <label>Raza *</label>
              <select className="mas-select" value={form.raza} onChange={e => set('raza', e.target.value)}>
                <option value="">Seleccionar…</option>
                {razas.map(r => <option key={r}>{r}</option>)}
              </select>
              {errs.raza && <span className="mas-err">{errs.raza}</span>}
            </div>
            <div className="mas-fg">
              <label>Sexo</label>
              <select className="mas-select" value={form.sexo} onChange={e => set('sexo', e.target.value)}>
                {['Macho','Hembra'].map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div className="mas-fg">
              <label>Edad *</label>
              <input className="mas-input" placeholder="Ej: 2 años" value={form.edad} onChange={e => set('edad', e.target.value)} />
              {errs.edad && <span className="mas-err">{errs.edad}</span>}
            </div>
            <div className="mas-fg">
              <label>Peso</label>
              <input className="mas-input" placeholder="Ej: 5 Kg" value={form.peso} onChange={e => set('peso', e.target.value)} />
            </div>
            <div className="mas-fg">
              <label>Color / Pelaje</label>
              <input className="mas-input" placeholder="Ej: Gris" value={form.color} onChange={e => set('color', e.target.value)} />
            </div>
            <div className="mas-fg full">
              <label>Notas</label>
              <textarea className="mas-textarea" placeholder="Alergias, comportamiento especial…" value={form.notas} onChange={e => set('notas', e.target.value)} />
            </div>
          </div>
        </div>
        <div className="mas-modal-foot">
          <button className="mas-btn-sec" onClick={onCerrar}>Cancelar</button>
          <button className="mas-btn-primary" onClick={handleGuardar}>
            {esEdicion ? 'Guardar cambios' : 'Registrar mascota'}
          </button>
        </div>
      </div>
    </div>
  );
}

function ModalEliminar({ mascota, onConfirmar, onCerrar }) {
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  return (
    <div className="mas-overlay" onClick={onCerrar}>
      <div className="mas-modal mas-del-modal" onClick={e => e.stopPropagation()}>
        <div className="mas-modal-head">
          <h2>Eliminar mascota</h2>
          <button className="mas-modal-x" onClick={onCerrar}><IcoX /></button>
        </div>
        <div className="mas-del-body">
          <div className="mas-del-icon"><IcoDel /></div>
          <h3>¿Eliminar a <span style={{ color:'#7B2D8B' }}>{mascota.nombre}</span>?</h3>
          <p>Esta acción no se puede deshacer.</p>
        </div>
        <div className="mas-modal-foot">
          <button className="mas-btn-sec"    onClick={onCerrar}>Cancelar</button>
          <button className="mas-btn-danger" onClick={onConfirmar}>Sí, eliminar</button>
        </div>
      </div>
    </div>
  );
}