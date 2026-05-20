import { useState, useRef, useEffect } from "react";
import ListaResenas from "../../components/Resenas/ListaResenas";
import "./PerfilVeterinario.css";

const API = 'http://localhost:3005';

const getToken = () => localStorage.getItem('token');

const authFetch = async (url, options = {}) => {
  const isFormData = options.body instanceof FormData;

  const response = await fetch(`${API}${url}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${getToken()}`,
      ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
      ...options.headers,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || data.message || 'Error en la petición');
  }

  return data;
};

const fotoUrl = (f) => {
  if (!f) return null;
  if (f.startsWith('http') || f.startsWith('blob')) return f;
  return `${API}${f}`;
};

/* ── SVG icons servicios ── */
const SrvIcons = {
  consulta: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>,
  vacuna:   <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="m18 2 4 4"/><path d="m17 7 1-5"/><path d="M7 22 2 17l9.5-9.5"/><path d="m16 6-9.5 9.5"/><path d="m9.5 10.5 1 1"/><path d="m13 9 1 1"/><path d="m6 14 1 1"/></svg>,
  parasito: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
  default:  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>,
};

const DIAS = ['Lun','Mar','Mié','Jue','Vie','Sáb','Dom'];
const HORARIO_VACIO = DIAS.reduce((acc, d) => ({
  ...acc,
  [d]: { abierto: d !== 'Sáb' && d !== 'Dom', desde: '08:00', hasta: '18:00' }
}), {});

const VET_VACIO = {
  nombre: '', especialidad: '', foto_perfil: null, banner: null,
  ciudad: '', estado: '', disponible: true, calificacion: 0,
  totalResenas: 0, experiencia: 0,
  descripcion: '', nombre_establecimiento: '', direccion: '',
  servicios: [], horarios: HORARIO_VACIO,
};

/* ── Iconos UI ── */
const IcoEdit   = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>;
const IcoSave   = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>;
const IcoCancel = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 6L6 18M6 6l12 12"/></svg>;
const IcoCamera = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>;
const IcoPlus   = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>;
const IcoTrash  = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/></svg>;

function Estrellas({ valor, size = 15 }) {
  return (
    <span className="pv-stars" style={{ fontSize: size }}>
      {[1,2,3,4,5].map(i => (
        <span key={i} className={i <= Math.round(valor) ? 'star on' : 'star'}>★</span>
      ))}
    </span>
  );
}

function EditBtn({ editando, onEdit, onSave, onCancel }) {
  if (!editando) return (
    <button className="pv-edit-trigger" onClick={onEdit}>
      <IcoEdit /> Editar
    </button>
  );
  return (
    <div className="pv-edit-actions">
      <button className="pv-edit-save"   onClick={onSave}><IcoSave /> Guardar</button>
      <button className="pv-edit-cancel" onClick={onCancel}><IcoCancel /> Cancelar</button>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────
   Normaliza la respuesta del backend al shape que usa el
   componente, sin importar si el backend devuelve:
     { ok, data: { ... } }   ← formato estándar
     { nombre, ciudad, ... } ← perfil plano (perfil público)
   ───────────────────────────────────────────────────────── */
const normalizarPerfil = (raw) => {
  // Si el backend envuelve en { ok, data }
  const perfil = raw?.data ?? raw;

  return {
    ...VET_VACIO,
    ...perfil,
    // ✅ promedio_estrellas es el nombre real en BD; calificacion es el alias
    calificacion: parseFloat(perfil?.promedio_estrellas ?? perfil?.calificacion ?? 0),
    // ✅ total_resenas es el nombre real en BD; totalResenas es el alias del componente
    totalResenas: parseInt(perfil?.total_resenas ?? perfil?.totalResenas ?? 0),
    servicios: Array.isArray(perfil?.servicios) ? perfil.servicios : [],
    horarios:  (perfil?.horarios && typeof perfil.horarios === 'object')
                 ? perfil.horarios
                 : HORARIO_VACIO,
  };
};

export default function PerfilVeterinario() {
  const [vet,             setVet]             = useState(VET_VACIO);
  const [cargando,        setCargando]        = useState(true);
  const [tab,             setTab]             = useState('info');
  const [toast,           setToast]           = useState(null);
  const [guardando,       setGuardando]       = useState(false);
  const [resenas,         setResenas]         = useState([]);
  const [cargandoResenas, setCargandoResenas] = useState(false);

  const [editHero,      setEditHero]      = useState(false);
  const [editDesc,      setEditDesc]      = useState(false);
  const [editHorarios,  setEditHorarios]  = useState(false);
  const [editServicio,  setEditServicio]  = useState(null);
  const [addServicio,   setAddServicio]   = useState(false);

  const [draftHero,     setDraftHero]     = useState({});
  const [draftDesc,     setDraftDesc]     = useState('');
  const [draftHorarios, setDraftHorarios] = useState({});
  const [draftSrv,      setDraftSrv]      = useState({ nombre: '', precio: '' });
  const [newSrv,        setNewSrv]        = useState({ nombre: '', precio: '' });

  const [fileFoto,   setFileFoto]   = useState(null);
  const [fileBanner, setFileBanner] = useState(null);

  const bannerRef = useRef();
  const fotoRef   = useRef();

  const user      = JSON.parse(localStorage.getItem('user') || '{}');
  const usuarioId = user?.id || user?.usuario_id;

  const notify = msg => { setToast(msg); setTimeout(() => setToast(null), 2800); };

  /* ── Cargar perfil al montar ── */
  useEffect(() => {
    const token = getToken();
    if (!token || !usuarioId) return;

    const cargar = async () => {
      try {
        // authFetch devuelve { ok: true, data: { ... } }
        const respuesta = await authFetch('/perfil-vet');

        // ✅ CORREGIDO: desempaca .data antes de normalizar
        const perfilNormalizado = normalizarPerfil(respuesta);

        // Intentar obtener calificación actualizada del review-service
        try {
          const resP  = await fetch(`http://localhost:3008/api/resenas/promedio/${usuarioId}`);
          const dataP = await resP.json();
          const promedio = parseFloat(dataP.promedio) || 0;
          const total    = parseInt(dataP.total_resenas) || 0;
          if (promedio > 0) {
            perfilNormalizado.calificacion = promedio;
            perfilNormalizado.totalResenas = total;
          }
        } catch { /* fallback al valor del perfil */ }

        setVet(perfilNormalizado);
      } catch (err) {
        console.error('Error al cargar perfil:', err);
        notify('Error al cargar perfil');
      } finally {
        setCargando(false);
      }
    };

    cargar();
  }, [usuarioId]);

  /* ── Cargar reseñas al entrar a esa pestaña ── */
  useEffect(() => {
    if (tab !== 'resenas' || !usuarioId) return;
    setCargandoResenas(true);
    fetch(`http://localhost:3008/api/resenas/${usuarioId}`)
      .then(r => r.json())
      .then(data => setResenas(Array.isArray(data) ? data : []))
      .catch(() => setResenas([]))
      .finally(() => setCargandoResenas(false));
  }, [tab, usuarioId]);

  /* ── Guardar en backend ── */
  const guardarEnBackend = async (camposExtra = {}) => {
    setGuardando(true);
    try {
      const fd     = new FormData();
      const campos = { ...vet, ...camposExtra };

      if (fileFoto)   fd.append('foto_perfil', fileFoto);
      if (fileBanner) fd.append('banner',       fileBanner);

      fd.append('nombre',                campos.nombre_establecimiento || '');
      fd.append('nombre_establecimiento', campos.nombre_establecimiento || '');
      fd.append('direccion',             campos.direccion    || '');
      fd.append('ciudad',                campos.ciudad       || '');
      fd.append('estado',                campos.estado       || '');
      fd.append('especialidad',          campos.especialidad || '');
      fd.append('experiencia',           campos.experiencia  || 0);
      fd.append('descripcion',           campos.descripcion  || '');
      fd.append('disponible',            campos.disponible   ?? true);
      fd.append('servicios',             JSON.stringify(campos.servicios || []));
      fd.append('horarios',              JSON.stringify(campos.horarios  || {}));

      // ✅ La respuesta del PUT también viene envuelta en { ok, data }
      const respuesta = await authFetch('/perfil-vet', { method: 'PUT', body: fd });
      const actualizado = normalizarPerfil(respuesta);

      // Fusiona: mantiene la calificacion local (viene de review-service)
      setVet(prev => ({
        ...actualizado,
        calificacion: prev.calificacion,
        totalResenas: prev.totalResenas,
      }));

      setFileFoto(null);
      setFileBanner(null);
      notify('Perfil actualizado correctamente');
    } catch (err) {
      console.error(err);
      notify(err.message || 'Error al guardar');
    } finally {
      setGuardando(false);
    }
  };

  /* ── EVENTOS ── */
  const abrirHero = () => {
    setDraftHero({
      nombre:                 vet.nombre,
      nombre_establecimiento: vet.nombre_establecimiento,
      especialidad:           vet.especialidad,
      ciudad:                 vet.ciudad,
      estado:                 vet.estado,
      direccion:              vet.direccion,
      experiencia:            vet.experiencia,
      disponible:             vet.disponible,
      foto_perfil:            vet.foto_perfil,
      banner:                 vet.banner,
    });
    setEditHero(true);
  };

  const guardarHero = async () => {
    const nuevo = { ...vet, ...draftHero, nombre: draftHero.nombre_establecimiento };
    setVet(nuevo);
    setEditHero(false);
    await guardarEnBackend(nuevo);
    if (draftHero.nombre_establecimiento) {
      const u = JSON.parse(localStorage.getItem('user') || '{}');
      u.nombre = draftHero.nombre_establecimiento;
      localStorage.setItem('user', JSON.stringify(u));
      window.dispatchEvent(new Event('storage'));
    }
    notify('Información principal actualizada');
  };
  const cancelarHero = () => { setEditHero(false); setFileFoto(null); setFileBanner(null); };

  const abrirDesc    = () => { setDraftDesc(vet.descripcion); setEditDesc(true); };
  const guardarDesc  = async () => {
    const nuevo = { ...vet, descripcion: draftDesc };
    setVet(nuevo); setEditDesc(false);
    await guardarEnBackend(nuevo);
    notify('Descripción actualizada');
  };
  const cancelarDesc = () => setEditDesc(false);

  const abrirHorarios    = () => { setDraftHorarios({ ...vet.horarios }); setEditHorarios(true); };
  const guardarHorarios  = async () => {
    const nuevo = { ...vet, horarios: draftHorarios };
    setVet(nuevo); setEditHorarios(false);
    await guardarEnBackend(nuevo);
    notify('Horarios actualizados');
  };
  const cancelarHorarios = () => setEditHorarios(false);

  const abrirSrv    = i  => { setDraftSrv({ nombre: vet.servicios[i].nombre, precio: vet.servicios[i].precio }); setEditServicio(i); };
  const guardarSrv  = async i => {
    const srvs = vet.servicios.map((s, idx) => idx === i ? { ...s, ...draftSrv } : s);
    const nuevo = { ...vet, servicios: srvs };
    setVet(nuevo); setEditServicio(null);
    await guardarEnBackend(nuevo);
    notify('Servicio actualizado');
  };
  const eliminarSrv = async i => {
    const srvs  = vet.servicios.filter((_, idx) => idx !== i);
    const nuevo = { ...vet, servicios: srvs };
    setVet(nuevo);
    await guardarEnBackend(nuevo);
    notify('Servicio eliminado');
  };
  const guardarNuevoSrv = async () => {
    if (!newSrv.nombre.trim()) return;
    const srvs  = [...vet.servicios, { nombre: newSrv.nombre, precio: newSrv.precio }];
    const nuevo = { ...vet, servicios: srvs };
    setVet(nuevo); setNewSrv({ nombre: '', precio: '' }); setAddServicio(false);
    await guardarEnBackend(nuevo);
    notify('Servicio agregado');
  };

  const toggleDisponible = async () => {
    if (editHero) { setDraftHero(d => ({ ...d, disponible: !d.disponible })); return; }
    const nuevo = { ...vet, disponible: !vet.disponible };
    setVet(nuevo);
    await guardarEnBackend(nuevo);
  };

  /* ── Valores para el render ── */
  const bannerSrc        = editHero ? (draftHero.banner      || vet.banner)      : vet.banner;
  const fotoSrc          = editHero ? (draftHero.foto_perfil || vet.foto_perfil) : vet.foto_perfil;
  const disponibleActual = editHero ? draftHero.disponible : vet.disponible;

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

  if (cargando) return <div className="pv-loading">Cargando perfil…</div>;

  return (
    <div className="pv-page">

      {/* ── HERO ── */}
      <div className="pv-hero">
        <div className="pv-banner">
          {bannerSrc
            ? <img src={fotoUrl(bannerSrc)} alt="banner" />
            : <div className="pv-banner-placeholder" />
          }
          <div className="pv-banner-overlay" />
          {editHero && (
            <>
              <button className="pv-banner-edit-btn" onClick={() => bannerRef.current.click()}>
                <IcoCamera /> Cambiar portada
              </button>
              <input ref={bannerRef} type="file" accept="image/*"
                     style={{ display: 'none' }} onChange={handleBanner} />
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
          >
            <span className="pv-badge-dot" />
            {disponibleActual ? 'Disponible' : 'Ocupado'}
          </span>
          {editHero && (
            <>
              <button className="pv-foto-edit-btn" onClick={() => fotoRef.current.click()}>
                <IcoCamera />
              </button>
              <input ref={fotoRef} type="file" accept="image/*"
                     style={{ display: 'none' }} onChange={handleFoto} />
            </>
          )}
        </div>

        <div className="pv-acciones">
          <EditBtn
            editando={editHero}
            onEdit={abrirHero}
            onSave={guardarHero}
            onCancel={cancelarHero}
          />
        </div>
      </div>

      {/* ── HEADER INFO ── */}
      <div className="pv-header-info">
        <div className="pv-header-left">
          {editHero ? (
            <div className="pv-hero-edit-form">
              <input
                className="pv-hero-input pv-hero-input-nombre"
                placeholder="Nombre del establecimiento"
                value={draftHero.nombre_establecimiento || ''}
                onChange={e => setDraftHero(d => ({ ...d, nombre_establecimiento: e.target.value }))}
              />
              <input
                className="pv-hero-input"
                placeholder="Especialidad"
                value={draftHero.especialidad || ''}
                onChange={e => setDraftHero(d => ({ ...d, especialidad: e.target.value }))}
              />
              <input
                className="pv-hero-input"
                placeholder="Ciudad"
                value={draftHero.ciudad || ''}
                onChange={e => setDraftHero(d => ({ ...d, ciudad: e.target.value }))}
              />
              <input
                className="pv-hero-input"
                placeholder="Dirección"
                value={draftHero.direccion || ''}
                onChange={e => setDraftHero(d => ({ ...d, direccion: e.target.value }))}
              />
              <input
                className="pv-hero-input"
                placeholder="Años de experiencia"
                type="number"
                min="0"
                value={draftHero.experiencia || ''}
                onChange={e => setDraftHero(d => ({ ...d, experiencia: e.target.value }))}
              />
            </div>
          ) : (
            <>
              <h1 className="pv-nombre">
                {vet.nombre_establecimiento || vet.nombre || 'Mi consultorio'}
              </h1>
              <p className="pv-especialidad">
                {vet.especialidad || 'Veterinario'}
              </p>
              {vet.ciudad && (
                <p className="pv-ciudad">📍 {vet.ciudad}{vet.estado ? `, ${vet.estado}` : ''}</p>
              )}
              {vet.experiencia > 0 && (
                <p className="pv-exp">🩺 {vet.experiencia} años de experiencia</p>
              )}
            </>
          )}
        </div>

        <div className="pv-rating-box">
          <span className="pv-rating-num">
            {Number(vet.calificacion || 0).toFixed(1)}
          </span>
          <Estrellas valor={vet.calificacion || 0} size={17} />
          {/* ✅ CORREGIDO: tilde en Reseñas */}
          <span className="pv-rating-count">{vet.totalResenas} reseñas</span>
        </div>
      </div>

      {/* ── TABS ── */}
      <div className="pv-tabs">
        {['info', 'servicios', 'horarios', 'resenas'].map(k => (
          <button
            key={k}
            className={`pv-tab ${tab === k ? 'activa' : ''}`}
            onClick={() => setTab(k)}
          >
            {/* ✅ CORREGIDO: tilde en Reseñas */}
            {k === 'resenas' ? `Reseñas (${vet.totalResenas})` : k.charAt(0).toUpperCase() + k.slice(1)}
          </button>
        ))}
      </div>

      {/* ── BODY ── */}
      <div className="pv-body">

        {/* Tab: info */}
        {tab === 'info' && (
          <div className="pv-tab-info">
            <div className="pv-card">
              <div className="pv-card-header">
                <h3>Sobre mí</h3>
                <EditBtn
                  editando={editDesc}
                  onEdit={abrirDesc}
                  onSave={guardarDesc}
                  onCancel={cancelarDesc}
                />
              </div>
              {editDesc
                ? <textarea className="pv-desc-textarea" value={draftDesc}
                            onChange={e => setDraftDesc(e.target.value)} />
                : <p className="pv-desc">{vet.descripcion || 'Sin descripción.'}</p>
              }
            </div>
          </div>
        )}

        {/* Tab: servicios */}
        {tab === 'servicios' && (
          <div className="pv-tab-servicios">
            <div className="pv-card">
              <div className="pv-card-header">
                <h3>Servicios</h3>
                <button className="pv-edit-trigger" onClick={() => setAddServicio(true)}>
                  <IcoPlus /> Agregar
                </button>
              </div>

              {vet.servicios.length === 0 && !addServicio && (
                <p className="pv-desc">Sin servicios registrados.</p>
              )}

              <div className="pv-servicios-lista">
                {vet.servicios.map((s, i) => (
                  <div key={i} className="pv-servicio-item">
                    <div className="pv-srv-icon">
                      {SrvIcons[s.nombre?.toLowerCase()] || SrvIcons.default}
                    </div>
                    {editServicio === i ? (
                      <div className="pv-srv-edit">
                        <input
                          value={draftSrv.nombre}
                          placeholder="Nombre del servicio"
                          onChange={e => setDraftSrv(d => ({ ...d, nombre: e.target.value }))}
                        />
                        <input
                          value={draftSrv.precio}
                          placeholder="Precio (ej: $50.000)"
                          onChange={e => setDraftSrv(d => ({ ...d, precio: e.target.value }))}
                        />
                        <div className="pv-srv-edit-btns">
                          <button className="pv-edit-save"   onClick={() => guardarSrv(i)}><IcoSave /> Guardar</button>
                          <button className="pv-edit-cancel" onClick={() => setEditServicio(null)}><IcoCancel /> Cancelar</button>
                        </div>
                      </div>
                    ) : (
                      <div className="pv-srv-info">
                        <strong>{s.nombre}</strong>
                        {s.precio && <span className="pv-srv-precio">{s.precio}</span>}
                      </div>
                    )}
                    {editServicio !== i && (
                      <div className="pv-srv-acciones">
                        <button onClick={() => abrirSrv(i)}><IcoEdit /></button>
                        <button onClick={() => eliminarSrv(i)}><IcoTrash /></button>
                      </div>
                    )}
                  </div>
                ))}

                {addServicio && (
                  <div className="pv-servicio-item pv-servicio-new">
                    <div className="pv-srv-edit">
                      <input
                        value={newSrv.nombre}
                        placeholder="Nombre del servicio"
                        onChange={e => setNewSrv(d => ({ ...d, nombre: e.target.value }))}
                        autoFocus
                      />
                      <input
                        value={newSrv.precio}
                        placeholder="Precio (ej: $50.000)"
                        onChange={e => setNewSrv(d => ({ ...d, precio: e.target.value }))}
                      />
                      <div className="pv-srv-edit-btns">
                        <button className="pv-edit-save"   onClick={guardarNuevoSrv}><IcoSave /> Agregar</button>
                        <button className="pv-edit-cancel" onClick={() => setAddServicio(false)}><IcoCancel /> Cancelar</button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Tab: horarios */}
        {tab === 'horarios' && (
          <div className="pv-tab-horarios">
            <div className="pv-card">
              <div className="pv-card-header">
                <h3>Horarios de atención</h3>
                <EditBtn
                  editando={editHorarios}
                  onEdit={abrirHorarios}
                  onSave={guardarHorarios}
                  onCancel={cancelarHorarios}
                />
              </div>
              <div className="pv-horarios-grid">
                {DIAS.map(dia => {
                  const h = (editHorarios ? draftHorarios : vet.horarios)?.[dia] || { abierto: false, desde: '08:00', hasta: '18:00' };
                  return (
                    <div key={dia} className={`pv-horario-row ${h.abierto ? 'abierto' : 'cerrado'}`}>
                      <span className="pv-dia">{dia}</span>
                      {editHorarios ? (
                        <div className="pv-horario-edit">
                          <label className="pv-toggle-wrap">
                            <input type="checkbox" checked={h.abierto}
                              onChange={e => setDraftHorarios(d => ({
                                ...d,
                                [dia]: { ...d[dia], abierto: e.target.checked }
                              }))} />
                            <span>{h.abierto ? 'Abierto' : 'Cerrado'}</span>
                          </label>
                          {h.abierto && (
                            <div className="pv-horas">
                              <input type="time" value={h.desde}
                                onChange={e => setDraftHorarios(d => ({
                                  ...d, [dia]: { ...d[dia], desde: e.target.value }
                                }))} />
                              <span>—</span>
                              <input type="time" value={h.hasta}
                                onChange={e => setDraftHorarios(d => ({
                                  ...d, [dia]: { ...d[dia], hasta: e.target.value }
                                }))} />
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className="pv-horario-val">
                          {h.abierto ? `${h.desde} – ${h.hasta}` : 'Cerrado'}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Tab: reseñas */}
        {tab === 'resenas' && (
          <div className="pv-tab-resenas tema-violeta">
            {cargandoResenas
              ? <div className="pv-loading">Cargando reseñas…</div>
              : <ListaResenas
                  resenas={resenas}
                  nombreProveedor={vet.nombre_establecimiento || vet.nombre}
                  rol="veterinaria"
                />
            }
          </div>
        )}

      </div>

      {toast && <div className="pv-toast">{toast}</div>}
    </div>
  );
}