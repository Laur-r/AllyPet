import { useState, useRef, useEffect } from "react";
import "./PerfilVeterinario.css";

/* ── CONFIG ── */
const API = 'http://localhost:3005';
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
const fotoUrl = (f) => {
  if (!f) return null;
  if (f.startsWith('http') || f.startsWith('blob')) return f;
  return `${API}${f}`;
};

/* ─── SVG icons servicios ─── */
const SrvIcons = {
  consulta: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>,
  vacuna:   <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="m18 2 4 4"/><path d="m17 7 1-5"/><path d="M7 22 2 17l9.5-9.5"/><path d="m16 6-9.5 9.5"/><path d="m9.5 10.5 1 1"/><path d="m13 9 1 1"/><path d="m6 14 1 1"/></svg>,
  parasito: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
  default:  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>,
};

const DIAS = ['Lun','Mar','Mié','Jue','Vie','Sáb','Dom'];
const HORARIO_VACIO = DIAS.reduce((acc, d) => ({ ...acc, [d]: { abierto: d !== 'Sáb' && d !== 'Dom', desde: '08:00', hasta: '18:00' } }), {});

const VET_VACIO = {
  nombre: '', especialidad: '', foto_perfil: null, banner: null,
  ciudad: '', estado: '', disponible: true, calificacion: 0,
  totalResenas: 0, experiencia: 0,
  descripcion: '', nombre_establecimiento: '', direccion: '',
  servicios: [], horarios: HORARIO_VACIO, resenas: [],
};

/* ── íconos UI ── */
const IcoEdit   = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>;
const IcoSave   = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>;
const IcoCancel = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 6L6 18M6 6l12 12"/></svg>;
const IcoCamera = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>;
const IcoPlus   = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>;
const IcoTrash  = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/></svg>;

function Estrellas({ valor, size = 15 }) {
  return (
    <span className="pv-stars" style={{ fontSize: size }}>
      {[1,2,3,4,5].map(i => <span key={i} className={i <= Math.round(valor) ? 'star on' : 'star'}>★</span>)}
    </span>
  );
}

function EditBtn({ editando, onEdit, onSave, onCancel }) {
  if (!editando) return <button className="pv-edit-trigger" onClick={onEdit}><IcoEdit /> Editar</button>;
  return (
    <div className="pv-edit-actions">
      <button className="pv-edit-save" onClick={onSave}><IcoSave /> Guardar</button>
      <button className="pv-edit-cancel" onClick={onCancel}><IcoCancel /> Cancelar</button>
    </div>
  );
}

/* ════════════════════════════════════════════════════════ */
export default function PerfilVeterinario() {
  const [vet,          setVet]          = useState(VET_VACIO);
  const [cargando,     setCargando]     = useState(true);
  const [tab,          setTab]          = useState('info');
  const [toast,        setToast]        = useState(null);
  const [guardando,    setGuardando]    = useState(false);

  const [editHero,     setEditHero]     = useState(false);
  const [editDesc,     setEditDesc]     = useState(false);
  const [editHorarios, setEditHorarios] = useState(false);
  const [editServicio, setEditServicio] = useState(null);
  const [addServicio,  setAddServicio]  = useState(false);

  const [draftHero,    setDraftHero]    = useState({});
  const [draftDesc,    setDraftDesc]    = useState('');
  const [draftHorarios,setDraftHorarios]= useState({});
  const [draftSrv,     setDraftSrv]     = useState({ nombre: '', precio: '' });
  const [newSrv,       setNewSrv]       = useState({ nombre: '', precio: '' });

  /* archivos seleccionados (File objects) */
  const [fileFoto,   setFileFoto]   = useState(null);
  const [fileBanner, setFileBanner] = useState(null);

  const bannerRef = useRef();
  const fotoRef   = useRef();

  const notify = msg => { setToast(msg); setTimeout(() => setToast(null), 2800); };

  /* ── Cargar perfil al montar ── */
  useEffect(() => {
  const token = getToken();
  if (!token) return;

  authFetch('/perfil-vet')
    .then(res => {
      if (res.ok && res.data) {
        const d = res.data;
        setVet({
          ...VET_VACIO,
          nombre: d.nombre_establecimiento || '',
          nombre_establecimiento: d.nombre_establecimiento || '',
          especialidad: d.especialidad || '',
          foto_perfil: d.foto_perfil || null,
          banner: d.banner || null,
          ciudad: d.ciudad || '',
          estado: d.estado || '',
          direccion: d.direccion || '',
          disponible: d.disponible ?? true,
          calificacion: parseFloat(d.calificacion) || 0,
          totalResenas: d.total_resenas || 0,
          experiencia: d.experiencia || 0,
          descripcion: d.descripcion || '',
          servicios: Array.isArray(d.servicios) ? d.servicios : [],
          horarios: d.horarios || HORARIO_VACIO,
        });
      }
    })
    .catch(() => notify('Error al cargar perfil'))
    .finally(() => setCargando(false));
}, []);

  /* ── Guardar en backend ── */
  const guardarEnBackend = async (camposExtra = {}) => {
    setGuardando(true);
    try {
      const fd = new FormData();
      if (fileFoto)   fd.append('foto_perfil', fileFoto);
      if (fileBanner) fd.append('banner',       fileBanner);

      const campos = { ...vet, ...camposExtra };
      fd.append('nombre_establecimiento', campos.nombre_establecimiento || '');
      fd.append('direccion',   campos.direccion   || '');
      fd.append('ciudad',      campos.ciudad      || '');
      fd.append('estado',      campos.estado      || '');
      fd.append('especialidad',campos.especialidad|| '');
      fd.append('experiencia', campos.experiencia || 0);
      fd.append('descripcion', campos.descripcion || '');
      fd.append('disponible',  campos.disponible  ?? true);
      fd.append('servicios',   JSON.stringify(campos.servicios  || []));
      fd.append('horarios',    JSON.stringify(campos.horarios   || {}));

      const res = await authFetch('/perfil-vet', { method: 'PUT', body: fd });
      if (res.ok) {
        setFileFoto(null);
        setFileBanner(null);
      } else {
        notify(res.message || 'Error al guardar');
      }
    } catch {
      notify('Error de conexión');
    }
    setGuardando(false);
  };

  /* ── HERO ── */
  const abrirHero = () => {
    setDraftHero({
      nombre: vet.nombre, nombre_establecimiento: vet.nombre_establecimiento,
      especialidad: vet.especialidad, ciudad: vet.ciudad,
      estado: vet.estado, direccion: vet.direccion,
      experiencia: vet.experiencia, disponible: vet.disponible,
      foto_perfil: vet.foto_perfil, banner: vet.banner,
    });
    setEditHero(true);
  };
  const guardarHero = async () => {
    const nuevo = { ...vet, ...draftHero, nombre: draftHero.nombre_establecimiento };
    setVet(nuevo);
    setEditHero(false);
    await guardarEnBackend(nuevo);
    notify('Información principal actualizada');
  };
  const cancelarHero = () => { setEditHero(false); setFileFoto(null); setFileBanner(null); };

  /* ── DESC ── */
  const abrirDesc    = () => { setDraftDesc(vet.descripcion); setEditDesc(true); };
  const guardarDesc  = async () => {
    const nuevo = { ...vet, descripcion: draftDesc };
    setVet(nuevo); setEditDesc(false);
    await guardarEnBackend(nuevo);
    notify('Descripción actualizada');
  };
  const cancelarDesc = () => setEditDesc(false);

  /* ── HORARIOS ── */
  const abrirHorarios   = () => { setDraftHorarios({ ...vet.horarios }); setEditHorarios(true); };
  const guardarHorarios = async () => {
    const nuevo = { ...vet, horarios: draftHorarios };
    setVet(nuevo); setEditHorarios(false);
    await guardarEnBackend(nuevo);
    notify('Horarios actualizados');
  };
  const cancelarHorarios = () => setEditHorarios(false);

  /* ── SERVICIOS ── */
  const abrirSrv    = i => { setDraftSrv({ nombre: vet.servicios[i].nombre, precio: vet.servicios[i].precio }); setEditServicio(i); };
  const guardarSrv  = async i => {
    const srvs = vet.servicios.map((s, idx) => idx === i ? { ...s, ...draftSrv } : s);
    const nuevo = { ...vet, servicios: srvs };
    setVet(nuevo); setEditServicio(null);
    await guardarEnBackend(nuevo);
    notify('Servicio actualizado');
  };
  const eliminarSrv = async i => {
    const srvs = vet.servicios.filter((_, idx) => idx !== i);
    const nuevo = { ...vet, servicios: srvs };
    setVet(nuevo);
    await guardarEnBackend(nuevo);
    notify('Servicio eliminado');
  };
  const guardarNuevoSrv = async () => {
    if (!newSrv.nombre.trim()) return;
    const srvs = [...vet.servicios, { nombre: newSrv.nombre, precio: newSrv.precio }];
    const nuevo = { ...vet, servicios: srvs };
    setVet(nuevo); setNewSrv({ nombre: '', precio: '' }); setAddServicio(false);
    await guardarEnBackend(nuevo);
    notify('Servicio agregado');
  };

  /* ── Disponible toggle (inmediato) ── */
  const toggleDisponible = async () => {
    if (editHero) { setDraftHero(d => ({ ...d, disponible: !d.disponible })); return; }
    const nuevo = { ...vet, disponible: !vet.disponible };
    setVet(nuevo);
    await guardarEnBackend(nuevo);
  };

  const disponibleActual = editHero ? draftHero.disponible : vet.disponible;

  /* ── Helpers imagen ── */
  const handleBanner = e => {
    const f = e.target.files[0]; if (!f) return;
    setFileBanner(f);
    setDraftHero(d => ({ ...d, banner: URL.createObjectURL(f) }));
  };
  const handleFoto = e => {
    const f = e.target.files[0]; if (!f) return;
    setFileFoto(f);
    setDraftHero(d => ({ ...d, foto_perfil: URL.createObjectURL(f) }));
  };

  if (cargando) return (
    <div style={{ padding: 40, textAlign: 'center', color: '#6B7280', fontFamily: 'Inter, sans-serif' }}>
      Cargando perfil…
    </div>
  );

  const bannerSrc   = editHero ? (draftHero.banner     || vet.banner)      : vet.banner;
  const fotoSrc     = editHero ? (draftHero.foto_perfil || vet.foto_perfil) : vet.foto_perfil;

  return (
    <div className="pv-page">

      {/* ══════ HERO ══════ */}
      <div className="pv-hero">
        <div className="pv-banner">
          {bannerSrc
            ? <img src={fotoUrl(bannerSrc)} alt="banner" />
            : <div className="pv-banner-placeholder" />
          }
          <div className="pv-banner-overlay" />
          <div className="pv-banner-brand" />
          {editHero && (
            <>
              <button className="pv-banner-edit-btn" onClick={() => bannerRef.current.click()}>
                <IcoCamera /> Cambiar portada
              </button>
              <input ref={bannerRef} type="file" accept="image/*" style={{ display:'none' }} onChange={handleBanner} />
            </>
          )}
        </div>

        <div className="pv-foto-wrap">
          {fotoSrc
            ? <img className="pv-foto" src={fotoUrl(fotoSrc)} alt="foto" />
            : <div className="pv-foto pv-foto-placeholder"><IcoCamera /></div>
          }
          <span
            className={`pv-disponible-badge ${disponibleActual ? 'on' : 'off'}`}
            onClick={toggleDisponible}
            style={{ cursor: 'pointer' }}
            title="Clic para cambiar disponibilidad"
          >
            <span className="pv-badge-dot" />
            {disponibleActual ? 'Disponible' : 'Ocupado'}
          </span>
          {editHero && (
            <>
              <button className="pv-foto-edit-btn" onClick={() => fotoRef.current.click()}><IcoCamera /></button>
              <input ref={fotoRef} type="file" accept="image/*" style={{ display:'none' }} onChange={handleFoto} />
            </>
          )}
        </div>

        <div className="pv-acciones">
          {guardando && <span className="pv-guardando">Guardando…</span>}
          <EditBtn editando={editHero} onEdit={abrirHero} onSave={guardarHero} onCancel={cancelarHero} />
        </div>
      </div>

      {/* ══════ HEADER INFO ══════ */}
      <div className="pv-header-info">
        <div className="pv-header-left">
          {editHero ? (
            <div className="pv-hero-edit-form">
              <input className="pv-hero-input pv-hero-input-nombre"
                value={draftHero.nombre_establecimiento}
                onChange={e => setDraftHero(d => ({ ...d, nombre_establecimiento: e.target.value }))}
                placeholder="Nombre del establecimiento o tuyo" />
              <input className="pv-hero-input"
                value={draftHero.especialidad}
                onChange={e => setDraftHero(d => ({ ...d, especialidad: e.target.value }))}
                placeholder="Especialidad" />
              <div className="pv-hero-row">
                <input className="pv-hero-input"
                  value={draftHero.ciudad}
                  onChange={e => setDraftHero(d => ({ ...d, ciudad: e.target.value }))}
                  placeholder="Ciudad" />
                <input className="pv-hero-input"
                  value={draftHero.estado}
                  onChange={e => setDraftHero(d => ({ ...d, estado: e.target.value }))}
                  placeholder="Departamento" />
                <input className="pv-hero-input pv-hero-input-sm" type="number"
                  value={draftHero.experiencia}
                  onChange={e => setDraftHero(d => ({ ...d, experiencia: Number(e.target.value) }))}
                  placeholder="Años exp." />
              </div>
              <input className="pv-hero-input"
                value={draftHero.direccion}
                onChange={e => setDraftHero(d => ({ ...d, direccion: e.target.value }))}
                placeholder="Dirección del consultorio" />
            </div>
          ) : (
            <>
              <h1 className="pv-nombre">{vet.nombre_establecimiento || 'Mi consultorio'}</h1>
              <p className="pv-especialidad">{vet.especialidad || 'Veterinario'}</p>
              <div className="pv-meta-row">
                {(vet.ciudad || vet.estado) && (
                  <span className="pv-meta-item">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                    {[vet.ciudad, vet.estado].filter(Boolean).join(', ')}
                  </span>
                )}
                {vet.direccion && (
                  <span className="pv-meta-item">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
                    {vet.direccion}
                  </span>
                )}
                {vet.experiencia > 0 && (
                  <span className="pv-meta-item">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                    {vet.experiencia} años de experiencia
                  </span>
                )}
              </div>
            </>
          )}
        </div>

        {vet.calificacion > 0 && (
          <div className="pv-rating-box">
            <span className="pv-rating-num">{vet.calificacion}</span>
            <Estrellas valor={vet.calificacion} size={17} />
            <span className="pv-rating-count">{vet.totalResenas} reseñas</span>
          </div>
        )}
      </div>

      {/* ══════ TABS ══════ */}
      <div className="pv-tabs">
        {[
          { key: 'info',      label: 'Información' },
          { key: 'servicios', label: 'Servicios'   },
          { key: 'horarios',  label: 'Horarios'    },
          { key: 'resenas',   label: `Reseñas (${vet.resenas.length})` },
        ].map(t => (
          <button key={t.key} className={`pv-tab ${tab === t.key ? 'activa' : ''}`} onClick={() => setTab(t.key)}>
            {t.label}
          </button>
        ))}
      </div>

      {/* ══════ BODY ══════ */}
      <div className="pv-body">

        {/* ── INFO ── */}
        {tab === 'info' && (
          <div className="pv-tab-info">
            <div className="pv-card">
              <div className="pv-card-header">
                <h3 className="pv-card-title">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                  Sobre mí
                </h3>
                <EditBtn editando={editDesc} onEdit={abrirDesc} onSave={guardarDesc} onCancel={cancelarDesc} />
              </div>
              {editDesc
                ? <textarea className="pv-desc-textarea" value={draftDesc} onChange={e => setDraftDesc(e.target.value)} rows={5} />
                : <p className="pv-desc">{vet.descripcion || 'Agrega una descripción sobre ti y tu consultorio.'}</p>
              }
            </div>

            <div className="pv-stats-grid">
              {[
                { num: vet.experiencia,      label: 'Años de experiencia'   },
                { num: vet.totalResenas,     label: 'Reseñas recibidas'     },
                { num: vet.calificacion,     label: 'Calificación promedio' },
                { num: vet.servicios.length, label: 'Servicios ofrecidos'   },
              ].map((s, i) => (
                <div className="pv-stat" key={i}>
                  <span className="pv-stat-num">{s.num}</span>
                  <span className="pv-stat-label">{s.label}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── SERVICIOS ── */}
        {tab === 'servicios' && (
          <div className="pv-tab-servicios">
            <div className="pv-servicios-header">
              <div>
                <h3 className="pv-section-title">Servicios disponibles</h3>
                <p className="pv-section-sub">Edita, elimina o agrega los servicios que ofreces.</p>
              </div>
              <button className="pv-btn-add-srv" onClick={() => setAddServicio(true)}>
                <IcoPlus /> Agregar servicio
              </button>
            </div>

            {addServicio && (
              <div className="pv-add-srv-form">
                <input className="pv-srv-input" placeholder="Nombre del servicio"
                  value={newSrv.nombre} onChange={e => setNewSrv(s => ({ ...s, nombre: e.target.value }))} />
                <input className="pv-srv-input" placeholder="Precio (ej: Desde $40.000)"
                  value={newSrv.precio} onChange={e => setNewSrv(s => ({ ...s, precio: e.target.value }))} />
                <div className="pv-add-srv-btns">
                  <button className="pv-edit-save" onClick={guardarNuevoSrv}><IcoSave /> Guardar</button>
                  <button className="pv-edit-cancel" onClick={() => setAddServicio(false)}><IcoCancel /> Cancelar</button>
                </div>
              </div>
            )}

            {vet.servicios.length === 0 && !addServicio && (
              <div className="pv-empty-state">No tienes servicios aún. Agrega el primero.</div>
            )}

            <div className="pv-servicios-grid">
              {vet.servicios.map((srv, i) => (
                <div className="pv-srv-card" key={i}>
                  <div className="pv-srv-accent" />
                  <div className="pv-srv-icon-wrap">{SrvIcons.default}</div>
                  {editServicio === i ? (
                    <div className="pv-srv-edit-form">
                      <input className="pv-srv-input" value={draftSrv.nombre}
                        onChange={e => setDraftSrv(d => ({ ...d, nombre: e.target.value }))} placeholder="Nombre" />
                      <input className="pv-srv-input" value={draftSrv.precio}
                        onChange={e => setDraftSrv(d => ({ ...d, precio: e.target.value }))} placeholder="Precio" />
                      <div className="pv-srv-edit-btns">
                        <button className="pv-edit-save sm" onClick={() => guardarSrv(i)}><IcoSave /></button>
                        <button className="pv-edit-cancel sm" onClick={() => setEditServicio(null)}><IcoCancel /></button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="pv-srv-info">
                        <span className="pv-srv-nombre">{srv.nombre}</span>
                        <span className="pv-srv-precio">{srv.precio}</span>
                      </div>
                      <div className="pv-srv-card-actions">
                        <button className="pv-srv-icon-btn" onClick={() => abrirSrv(i)}><IcoEdit /></button>
                        <button className="pv-srv-icon-btn del" onClick={() => eliminarSrv(i)}><IcoTrash /></button>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── HORARIOS ── */}
        {tab === 'horarios' && (
          <div className="pv-tab-horarios">
            <div className="pv-card">
              <div className="pv-card-header">
                <h3 className="pv-card-title">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                  Horarios de atención
                </h3>
                <EditBtn editando={editHorarios} onEdit={abrirHorarios} onSave={guardarHorarios} onCancel={cancelarHorarios} />
              </div>

              <div className="pv-horarios-lista">
                {DIAS.map(dia => {
                  const h = editHorarios ? (draftHorarios[dia] || { abierto: false, desde: '08:00', hasta: '18:00' }) : (vet.horarios?.[dia] || { abierto: false, desde: '08:00', hasta: '18:00' });
                  return (
                    <div className={`pv-horario-row ${h.abierto ? '' : 'cerrado'}`} key={dia}>
                      <span className="pv-dia">{dia}</span>
                      {editHorarios ? (
                        <div className="pv-horario-edit">
                          <label className="pv-toggle-wrap">
                            <input type="checkbox" checked={h.abierto}
                              onChange={e => setDraftHorarios(d => ({ ...d, [dia]: { ...h, abierto: e.target.checked } }))} />
                            <span className="pv-toggle-label">{h.abierto ? 'Abierto' : 'Cerrado'}</span>
                          </label>
                          {h.abierto && (
                            <>
                              <input type="time" className="pv-time-input" value={h.desde}
                                onChange={e => setDraftHorarios(d => ({ ...d, [dia]: { ...h, desde: e.target.value } }))} />
                              <span className="pv-time-sep">–</span>
                              <input type="time" className="pv-time-input" value={h.hasta}
                                onChange={e => setDraftHorarios(d => ({ ...d, [dia]: { ...h, hasta: e.target.value } }))} />
                            </>
                          )}
                        </div>
                      ) : (
                        <>
                          <span className="pv-hora">{h.abierto ? `${h.desde} – ${h.hasta}` : '—'}</span>
                          <span className={`pv-estado-dia ${h.abierto ? 'on' : 'off'}`}>{h.abierto ? 'Abierto' : 'Cerrado'}</span>
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ── RESEÑAS ── */}
        {tab === 'resenas' && (
          <div className="pv-tab-resenas">
            <div className="pv-resenas-notice">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              Las reseñas son generadas por los dueños de mascotas y no pueden editarse.
            </div>
            {vet.resenas.length === 0
              ? <div className="pv-empty-state">Aún no tienes reseñas. Cuando los dueños te caliquen, aparecerán aquí.</div>
              : (
                <>
                  <div className="pv-rating-summary">
                    <div className="pv-rating-big">
                      <span className="pv-rating-big-num">{vet.calificacion}</span>
                      <Estrellas valor={vet.calificacion} size={20} />
                      <span className="pv-rating-big-sub">{vet.totalResenas} reseñas</span>
                    </div>
                  </div>
                  <div className="pv-resenas-list">
                    {vet.resenas.map(r => (
                      <div className="pv-resena" key={r.id}>
                        <div className="pv-resena-head">
                          <img className="pv-resena-avatar" src={r.avatar} alt={r.cliente} />
                          <div className="pv-resena-meta">
                            <span className="pv-resena-nombre">{r.cliente}</span>
                            <span className="pv-resena-fecha">{r.fecha}</span>
                          </div>
                          <Estrellas valor={r.estrellas} size={13} />
                        </div>
                        <p className="pv-resena-txt">{r.comentario}</p>
                      </div>
                    ))}
                  </div>
                </>
              )
            }
          </div>
        )}
      </div>

      {toast && (
        <div className="pv-toast"><IcoSave /> {toast}</div>
      )}
    </div>
  );
}