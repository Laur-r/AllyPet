import { useState, useRef, useEffect } from 'react';
import {useNavigate} from 'react-router-dom';
import './Mascotas.css';

/* ══════════════════════════════════════════════════════════
   CONFIG
   ══════════════════════════════════════════════════════════ */
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

/* ── Helper foto ───────────────────────────────────────── */
const getFotoUrl = (foto) => {
  if (!foto) return null;
  if (foto.startsWith('http')) return foto;
  if (foto.startsWith('/uploads')) return `${API}${foto}`;
  return null;
};

/* ── Normaliza mascota que viene del backend ───────────── */
// Garantiza que especie, sexo, color, notas siempre tengan valor
const normalizarMascota = (m) => ({
  ...m,
  especie: m.especie || 'Perro',
  sexo:    m.sexo    || 'Macho',
  color:   m.color   || '',
  notas:   m.notas   || '',
  edad:    m.edad    != null ? String(m.edad) : '',
  peso:    m.peso    != null ? String(m.peso) : '',
});

/* ══════════════════════════════════════════════════════════
   DATOS SOLO FRONTEND (recordatorios — no van al backend)
   ══════════════════════════════════════════════════════════ */
const RECORDATORIOS_MOCK = {
  1: { texto: 'Vacuna antirrábica · Vence pronto', dias: 5  },
  2: { texto: 'Desparasitación · Próximamente',    dias: 32 },
  3: { texto: 'Credelio · Tratamiento en casa',    dias: 60 },
};

const RAZAS_PERRO = ['Schnauzer','Pincher','Labrador','Golden Retriever','Bulldog','Poodle','Chihuahua','Pastor Alemán','Beagle','Dachshund','Otra'];
const RAZAS_GATO  = ['Persa','Siamés','Maine Coon','Bengalí','Ragdoll','Doméstico','Otra'];
const RAZAS_OTRO  = ['Conejo','Hamster','Ave','Reptil','Otro'];
const FILTROS     = ['Todas','Perros','Gatos','Otros','Recordatorios'];
const FORM_VACIO  = { nombre:'', especie:'Perro', raza:'', sexo:'Macho', edad:'', peso:'', color:'', notas:'', foto:null };

/* ── íconos ────────────────────────────────────────────── */
const IcoEdit  = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>;
const IcoDel   = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/></svg>;
const IcoX     = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 6L6 18M6 6l12 12"/></svg>;
const IcoCheck = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>;
const IcoArrow = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>;
const IcoBell  = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>;
const IcoDog   = () => (
  <svg width="52" height="52" viewBox="0 0 64 64" fill="none" stroke="#C4A0D4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <ellipse cx="32" cy="37" rx="18" ry="13"/><ellipse cx="32" cy="24" rx="12" ry="10"/>
    <path d="M20 24 Q14 20 12 28"/><path d="M44 24 Q50 20 52 28"/>
    <circle cx="28" cy="23" r="1.5" fill="#C4A0D4"/><circle cx="36" cy="23" r="1.5" fill="#C4A0D4"/>
    <path d="M28 29 Q32 33 36 29"/>
  </svg>
);
const IcoCat = () => (
  <svg width="52" height="52" viewBox="0 0 64 64" fill="none" stroke="#C4A0D4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <ellipse cx="32" cy="37" rx="16" ry="12"/>
    <path d="M16 37 Q16 22 22 18 L18 10 L28 18"/>
    <path d="M48 37 Q48 22 42 18 L46 10 L36 18"/>
    <circle cx="27" cy="35" r="1.5" fill="#C4A0D4"/><circle cx="37" cy="35" r="1.5" fill="#C4A0D4"/>
    <path d="M27 40 Q32 43 37 40"/>
  </svg>
);

/* ════════════════════════════════════════════════════════════
   COMPONENTE PRINCIPAL
   ════════════════════════════════════════════════════════════ */
export default function Mascotas() {
  const navigate = useNavigate();
  const [mascotas,   setMascotas]   = useState([]);
  const [cargando,   setCargando]   = useState(true);
  const [filtro,     setFiltro]     = useState('Todas');
  const [modalForm,  setModalForm]  = useState(false);
  const [editando,   setEditando]   = useState(null);
  const [confirmDel, setConfirmDel] = useState(null);
  const [toast,      setToast]      = useState(null);

  const notify = msg => { setToast(msg); setTimeout(() => setToast(null), 2800); };

  /* ── Cargar mascotas al montar ─────────────────────────── */
  useEffect(() => {
    authFetch('/api/pets')
      .then(res => { if (res.ok) setMascotas(res.data.map(normalizarMascota)); })
      .catch(() => notify('Error al cargar mascotas'))
      .finally(() => setCargando(false));
  }, []);

  /* ── Abrir modales ─────────────────────────────────────── */
  const abrirCrear  = () => { setEditando(null); setModalForm(true); };
  // Normalizamos antes de pasarlo al formulario
  const abrirEditar = m  => { setEditando(normalizarMascota(m)); setModalForm(true); };

  /* ── Guardar (crear o editar) ──────────────────────────── */
  const guardar = async (data) => {
    const esEdicion = !!editando;
    const url = esEdicion ? `/api/pets/${editando.id}` : '/api/pets';
    const method = esEdicion ? 'PUT' : 'POST';

    try {
      const formData = new FormData();
      Object.keys(data).forEach(key => {
        if (data[key] !== null && data[key] !== undefined) {
          formData.append(key, data[key]);
        }
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
    } catch {
      notify('Error de conexión');
    }
  };

  /* ── Eliminar ──────────────────────────────────────────── */
  const eliminar = async () => {
    const { id, nombre } = confirmDel;
    try {
      const res = await authFetch(`/api/pets/${id}`, { method: 'DELETE' })
      if (res.ok) {
        setMascotas(ms => ms.filter(m => m.id !== id));
        notify(`${nombre} eliminada`);
      } else {
        notify(res.message || 'Error al eliminar');
      }
    } catch {
      notify('Error de conexión');
    }
    setConfirmDel(null);
  };

  /* ── Filtro ────────────────────────────────────────────── */
  const conRecordatorio = mascotas.map(m => ({
    ...m,
    recordatorio: RECORDATORIOS_MOCK[m.id] || null,
  }));

  const visibles = conRecordatorio.filter(m => {
    if (filtro === 'Perros')        return m.especie === 'Perro';
    if (filtro === 'Gatos')         return m.especie === 'Gato';
    if (filtro === 'Otros')         return m.especie === 'Otro';
    if (filtro === 'Recordatorios') return !!m.recordatorio;
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
          />
        ))}
        <TarjetaAgregar onClick={abrirCrear} />
      </div>

      {proximosRecordatorios.length > 0 && (
        <>
          <div className="mas-section-title">
            <h2>Próximos recordatorios</h2>
            <button className="mas-ver-todo">Ver todo <IcoArrow /></button>
          </div>
          <div className="mas-reminders-list">
            {proximosRecordatorios.map(m => (
              <div key={m.id} className="mas-reminder-row">
                <div className="mas-reminder-avatar">
                  {m.especie === 'Gato' ? <IcoCat /> : <IcoDog />}
                </div>
                <div className="mas-reminder-info">
                  <strong>{m.recordatorio.texto.split('·')[0].trim()}</strong>
                  <span>{m.recordatorio.texto.split('·')[1]?.trim()}</span>
                </div>
                <div className="mas-reminder-right">
                  <span className={`mas-days-badge ${m.recordatorio.dias <= 7 ? 'soon' : m.recordatorio.dias <= 45 ? 'normal' : 'months'}`}>
                    {m.recordatorio.dias <= 30 ? `${m.recordatorio.dias} días` : `${Math.round(m.recordatorio.dias/30)} mes${Math.round(m.recordatorio.dias/30) > 1 ? 'es' : ''}`}
                  </span>
                  <span className="mas-pet-chip">{m.nombre}</span>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {modalForm && (
        <FormularioMascota
          mascota={editando}
          onGuardar={guardar}
          onCerrar={() => { setModalForm(false); setEditando(null); }}
        />
      )}
      {confirmDel && (
        <ModalEliminar
          mascota={confirmDel}
          onConfirmar={eliminar}
          onCerrar={() => setConfirmDel(null)}
        />
      )}

      {toast && <div className="mas-toast"><IcoCheck /> {toast}</div>}
    </div>
  );
}

/* ════════════════════════════════════════════════════════════
   TARJETA MASCOTA
   ════════════════════════════════════════════════════════════ */
function Tarjeta({ mascota, style, onEditar, onEliminar , onVerPerfil}) {
  const { nombre, especie, raza, sexo, edad, peso, color, foto, recordatorio } = mascota;
  const diasClass = recordatorio ? (recordatorio.dias <= 7 ? 'urgent' : '') : '';
  const fotoUrl   = getFotoUrl(foto);

  return (
    <div className="mas-card" style={style}>
      <div className="mas-card-img">
        {fotoUrl
          ? <img src={fotoUrl} alt={nombre} />
          : <div className="mas-placeholder">
              {especie === 'Gato' ? <IcoCat /> : <IcoDog />}
              <span>Sin foto</span>
            </div>
        }
        <span className="mas-badge">{especie || 'Mascota'}</span>
      </div>

      <div className="mas-card-body">
        <div className="mas-card-top">
          <div>
            <div className="mas-card-name">{nombre}</div>
            <div className="mas-card-sub">{color || '—'} · {sexo || '—'}</div>
          </div>
          <div className="mas-card-actions">
            <button className="mas-icon-btn" title="Editar"    onClick={onEditar}><IcoEdit /></button>
            <button className="mas-icon-btn del" title="Eliminar" onClick={onEliminar}><IcoDel /></button>
          </div>
        </div>

        <div className="mas-stats">
          <div className="mas-stat">
            <div className="mas-stat-val">{edad || '—'}</div>
            <div className="mas-stat-lbl">Edad</div>
          </div>
          <div className="mas-stat">
            <div className="mas-stat-val">{peso || '—'}</div>
            <div className="mas-stat-lbl">Peso</div>
          </div>
          <div className="mas-stat">
            <div className="mas-stat-val">{raza || '—'}</div>
            <div className="mas-stat-lbl">Raza</div>
          </div>
        </div>

        {recordatorio && (
          <div className="mas-reminder">
            <div className="mas-reminder-left">
              <span className="mas-reminder-dot" />
              {recordatorio.texto}
            </div>
            <span className={`mas-reminder-days ${diasClass}`}>
              {recordatorio.dias <= 30 ? `${recordatorio.dias} días` : `${Math.round(recordatorio.dias/30)} mes`}
            </span>
          </div>
        )}

        <div className="mas-card-btns-row">
         <button className="mas-btn-ver" onClick={onVerPerfil}>Ver Perfil</button>
          <button className="mas-btn-historial">Historial</button>
        </div>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════
   TARJETA AGREGAR
   ════════════════════════════════════════════════════════════ */
function TarjetaAgregar({ onClick }) {
  return (
    <div className="mas-add-card" onClick={onClick} role="button" tabIndex={0} onKeyDown={e => e.key === 'Enter' && onClick()}>
      <div className="mas-add-plus">+</div>
      <h3>Agregar mascota</h3>
      <p>Registra el perfil médico de tu nueva mascota</p>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════
   FORMULARIO MODAL
   ════════════════════════════════════════════════════════════ */
function FormularioMascota({ mascota, onGuardar, onCerrar }) {
  const esEdicion = !!mascota;

  // Al editar usamos la mascota ya normalizada, al crear usamos el form vacío
  const [form, setForm] = useState(esEdicion ? { ...mascota } : { ...FORM_VACIO });

  // Preview: si editando y tiene foto, construimos la URL completa
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

  // Las razas dependen de la especie actual del form
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
          {/* Foto */}
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

/* ════════════════════════════════════════════════════════════
   MODAL ELIMINAR
   ════════════════════════════════════════════════════════════ */
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