import { useState, useRef } from "react";
import "./PerfilVeterinario.css";

/* ─── SVG icons para servicios ─── */
const SrvIcons = {
  consulta: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
    </svg>
  ),
  vacuna: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="m18 2 4 4"/><path d="m17 7 1-5"/><path d="M7 22 2 17l9.5-9.5"/><path d="m16 6-9.5 9.5"/><path d="m9.5 10.5 1 1"/><path d="m13 9 1 1"/><path d="m6 14 1 1"/>
    </svg>
  ),
  parasito: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
    </svg>
  ),
  peluqueria: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="6" cy="6" r="3"/><circle cx="6" cy="18" r="3"/>
      <line x1="20" y1="4" x2="8.12" y2="15.88"/><line x1="14.47" y1="14.48" x2="20" y2="20"/>
      <line x1="8.12" y1="8.12" x2="12" y2="12"/>
    </svg>
  ),
  dental: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 5c-1-2-3.5-3-5-3C4 2 2 4 2 7c0 5 4 8 10 15 6-7 10-10 10-15 0-3-2-5-5-5-1.5 0-4 1-5 3z"/>
    </svg>
  ),
  laboratorio: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 3H5a2 2 0 0 0-2 2v4m6-6h10a2 2 0 0 1 2 2v4M9 3v11m0 0a6 6 0 0 0 6 6 6 6 0 0 0 6-6"/>
      <path d="M3 9h18"/>
    </svg>
  ),
};

const VET_INICIAL = {
  nombre:       "Dr. Alexander Velez",
  especialidad: "Medicina Veterinaria General",
  foto:         "https://i.pravatar.cc/300?img=57",
  banner:       "https://images.unsplash.com/photo-1628009368231-7bb7cfcb0def?w=1200&q=80",
  ciudad:       "Cali",
  estado:       "Valle del Cauca",
  disponible:   true,
  calificacion: 4.8,
  totalResenas: 124,
  experiencia:  9,
  descripcion:  "Soy veterinaria con más de 9 años de experiencia en medicina de pequeños animales. Me especializo en prevención, diagnóstico y tratamiento de perros y gatos. Mi prioridad es el bienestar de tu mascota y brindarte información clara en cada consulta.",
  servicios: [
    { icon: SrvIcons.consulta,    iconKey: "consulta",    nombre: "Consulta General",  precio: "Desde $40.000" },
    { icon: SrvIcons.vacuna,      iconKey: "vacuna",      nombre: "Vacunación",         precio: "Desde $25.000" },
    { icon: SrvIcons.parasito,    iconKey: "parasito",    nombre: "Desparasitación",    precio: "Desde $20.000" },
    { icon: SrvIcons.peluqueria,  iconKey: "peluqueria",  nombre: "Peluquería",         precio: "Desde $35.000" },
    { icon: SrvIcons.dental,      iconKey: "dental",      nombre: "Limpieza Dental",    precio: "Desde $60.000" },
    { icon: SrvIcons.laboratorio, iconKey: "laboratorio", nombre: "Laboratorio",        precio: "Desde $45.000" },
  ],
  resenas: [
    { id: 1, cliente: "Valentina Ríos",   avatar: "https://i.pravatar.cc/60?img=5",  fecha: "15 mar 2025", estrellas: 5, comentario: "Excelente atención. La Dra. Mora explicó todo con paciencia y mi perro quedó muy bien. Super recomendada." },
    { id: 2, cliente: "Mateo Gómez",      avatar: "https://i.pravatar.cc/60?img=11", fecha: "2 feb 2025",  estrellas: 5, comentario: "Llevé a mi gata por una consulta de urgencia y me atendieron rápido. Muy profesional y amable." },
    { id: 3, cliente: "Camila Herrera",   avatar: "https://i.pravatar.cc/60?img=9",  fecha: "18 ene 2025", estrellas: 4, comentario: "Buen servicio, instalaciones limpias. El precio es justo para la calidad que ofrecen." },
    { id: 4, cliente: "Sebastián Torres", avatar: "https://i.pravatar.cc/60?img=15", fecha: "5 ene 2025",  estrellas: 5, comentario: "Mi mascota siempre sale contenta de las consultas. La doctora tiene mucha paciencia con los animales." },
  ],
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
      {[1,2,3,4,5].map((i) => (
        <span key={i} className={i <= Math.round(valor) ? "star on" : "star"}>★</span>
      ))}
    </span>
  );
}

/* ── Botón editar/guardar/cancelar inline ── */
function EditBtn({ editando, onEdit, onSave, onCancel }) {
  if (!editando) return (
    <button className="pv-edit-trigger" onClick={onEdit} title="Editar">
      <IcoEdit /> Editar
    </button>
  );
  return (
    <div className="pv-edit-actions">
      <button className="pv-edit-save" onClick={onSave}><IcoSave /> Guardar</button>
      <button className="pv-edit-cancel" onClick={onCancel}><IcoCancel /> Cancelar</button>
    </div>
  );
}

/* ── Toast ── */
function Toast({ msg }) {
  return msg ? (
    <div className="pv-toast">
      <IcoSave /> {msg}
    </div>
  ) : null;
}

/* ════════════════════════════════════════════════════════ */
export default function PerfilVeterinario() {
  const [vet, setVet]           = useState(VET_INICIAL);
  const [tab, setTab]           = useState("info");
  const [toast, setToast]       = useState(null);

  /* estados de edición por sección */
  const [editHero,      setEditHero]      = useState(false);
  const [editDesc,      setEditDesc]      = useState(false);
  const [editServicio,  setEditServicio]  = useState(null); // índice
  const [addServicio,   setAddServicio]   = useState(false);

  /* drafts */
  const [draftHero, setDraftHero] = useState({});
  const [draftDesc, setDraftDesc] = useState("");
  const [draftSrv,  setDraftSrv]  = useState({ nombre: "", precio: "" });
  const [newSrv,    setNewSrv]    = useState({ nombre: "", precio: "" });

  /* refs para inputs de archivo */
  const bannerRef = useRef();
  const fotoRef   = useRef();

  const notify = msg => { setToast(msg); setTimeout(() => setToast(null), 2600); };

  /* ── helpers imagen ── */
  const handleBanner = e => {
    const f = e.target.files[0];
    if (f) setDraftHero(d => ({ ...d, banner: URL.createObjectURL(f) }));
  };
  const handleFoto = e => {
    const f = e.target.files[0];
    if (f) setDraftHero(d => ({ ...d, foto: URL.createObjectURL(f) }));
  };

  /* ── HERO ── */
  const abrirHero = () => {
    setDraftHero({
      nombre: vet.nombre, especialidad: vet.especialidad,
      ciudad: vet.ciudad, estado: vet.estado,
      experiencia: vet.experiencia, disponible: vet.disponible,
      foto: vet.foto, banner: vet.banner,
    });
    setEditHero(true);
  };
  const guardarHero = () => {
    setVet(v => ({ ...v, ...draftHero }));
    setEditHero(false);
    notify("Información principal actualizada");
  };
  const cancelarHero = () => setEditHero(false);

  /* ── DESC ── */
  const abrirDesc = () => { setDraftDesc(vet.descripcion); setEditDesc(true); };
  const guardarDesc = () => { setVet(v => ({ ...v, descripcion: draftDesc })); setEditDesc(false); notify("Descripción actualizada"); };
  const cancelarDesc = () => setEditDesc(false);

  /* ── SERVICIO editar ── */
  const abrirSrv = (i) => { setDraftSrv({ nombre: vet.servicios[i].nombre, precio: vet.servicios[i].precio }); setEditServicio(i); };
  const guardarSrv = (i) => {
    setVet(v => {
      const srvs = [...v.servicios];
      srvs[i] = { ...srvs[i], ...draftSrv };
      return { ...v, servicios: srvs };
    });
    setEditServicio(null);
    notify("Servicio actualizado");
  };
  const eliminarSrv = (i) => {
    setVet(v => ({ ...v, servicios: v.servicios.filter((_, idx) => idx !== i) }));
    notify("Servicio eliminado");
  };

  /* ── SERVICIO agregar ── */
  const guardarNuevoSrv = () => {
    if (!newSrv.nombre.trim()) return;
    setVet(v => ({
      ...v,
      servicios: [...v.servicios, {
        icon: SrvIcons.consulta, iconKey: "consulta",
        nombre: newSrv.nombre, precio: newSrv.precio,
      }],
    }));
    setNewSrv({ nombre: "", precio: "" });
    setAddServicio(false);
    notify("Servicio agregado");
  };

  /* ── disponible toggle ── */
  const toggleDisponible = () => {
    if (editHero) {
      setDraftHero(d => ({ ...d, disponible: !d.disponible }));
    } else {
      setVet(v => ({ ...v, disponible: !v.disponible }));
    }
  };

  const disponibleActual = editHero ? draftHero.disponible : vet.disponible;

  return (
    <div className="pv-page">

      {/* ══════ HERO ══════ */}
      <div className="pv-hero">

        {/* Banner */}
        <div className="pv-banner">
          <img src={editHero && draftHero.banner ? draftHero.banner : vet.banner} alt="banner" />
          <div className="pv-banner-overlay" />
          <div className="pv-banner-brand" />

          {/* Botón cambiar banner — solo en edición */}
          {editHero && (
            <>
              <button className="pv-banner-edit-btn" onClick={() => bannerRef.current.click()}>
                <IcoCamera /> Cambiar portada
              </button>
              <input ref={bannerRef} type="file" accept="image/*" style={{ display:'none' }} onChange={handleBanner} />
            </>
          )}
        </div>

        {/* Foto perfil */}
        <div className="pv-foto-wrap">
          <img className="pv-foto" src={editHero && draftHero.foto ? draftHero.foto : vet.foto} alt={vet.nombre} />
          <span
            className={`pv-disponible-badge ${disponibleActual ? "on" : "off"}`}
            onClick={toggleDisponible}
            style={{ cursor: 'pointer' }}
            title="Clic para cambiar disponibilidad"
          >
            <span className="pv-badge-dot" />
            {disponibleActual ? "Disponible" : "Ocupado"}
          </span>
          {/* Botón cambiar foto — solo en edición */}
          {editHero && (
            <>
              <button className="pv-foto-edit-btn" onClick={() => fotoRef.current.click()} title="Cambiar foto">
                <IcoCamera />
              </button>
              <input ref={fotoRef} type="file" accept="image/*" style={{ display:'none' }} onChange={handleFoto} />
            </>
          )}
        </div>

        {/* Acciones hero */}
        <div className="pv-acciones">
          <EditBtn
            editando={editHero}
            onEdit={abrirHero}
            onSave={guardarHero}
            onCancel={cancelarHero}
          />
        </div>
      </div>

      {/* ══════ HEADER INFO ══════ */}
      <div className="pv-header-info">
        <div className="pv-header-left">
          {editHero ? (
            <div className="pv-hero-edit-form">
              <input
                className="pv-hero-input pv-hero-input-nombre"
                value={draftHero.nombre}
                onChange={e => setDraftHero(d => ({ ...d, nombre: e.target.value }))}
                placeholder="Nombre completo"
              />
              <input
                className="pv-hero-input"
                value={draftHero.especialidad}
                onChange={e => setDraftHero(d => ({ ...d, especialidad: e.target.value }))}
                placeholder="Especialidad"
              />
              <div className="pv-hero-row">
                <input
                  className="pv-hero-input"
                  value={draftHero.ciudad}
                  onChange={e => setDraftHero(d => ({ ...d, ciudad: e.target.value }))}
                  placeholder="Ciudad"
                />
                <input
                  className="pv-hero-input"
                  value={draftHero.estado}
                  onChange={e => setDraftHero(d => ({ ...d, estado: e.target.value }))}
                  placeholder="Departamento"
                />
                <input
                  className="pv-hero-input pv-hero-input-sm"
                  type="number"
                  value={draftHero.experiencia}
                  onChange={e => setDraftHero(d => ({ ...d, experiencia: Number(e.target.value) }))}
                  placeholder="Años exp."
                />
              </div>
            </div>
          ) : (
            <>
              <h1 className="pv-nombre">{vet.nombre}</h1>
              <p className="pv-especialidad">{vet.especialidad}</p>
              <div className="pv-meta-row">
                <span className="pv-meta-item">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
                  </svg>
                  {vet.ciudad}, {vet.estado}
                </span>
                <span className="pv-meta-item">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                  </svg>
                  {vet.experiencia} años de experiencia
                </span>
              </div>
            </>
          )}
        </div>

        <div className="pv-rating-box">
          <span className="pv-rating-num">{vet.calificacion}</span>
          <Estrellas valor={vet.calificacion} size={17} />
          <span className="pv-rating-count">{vet.totalResenas} reseñas</span>
        </div>
      </div>

      {/* ══════ TABS ══════ */}
      <div className="pv-tabs">
        {[
          { key: "info",      label: "Información" },
          { key: "servicios", label: "Servicios"   },
          { key: "resenas",   label: `Reseñas (${vet.resenas.length})` },
        ].map((t) => (
          <button
            key={t.key}
            className={`pv-tab ${tab === t.key ? "activa" : ""}`}
            onClick={() => setTab(t.key)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ══════ BODY ══════ */}
      <div className="pv-body">

        {/* ── INFO ── */}
        {tab === "info" && (
          <div className="pv-tab-info">
            <div className="pv-card">
              <div className="pv-card-header">
                <h3 className="pv-card-title">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                  </svg>
                  Sobre mí
                </h3>
                <EditBtn
                  editando={editDesc}
                  onEdit={abrirDesc}
                  onSave={guardarDesc}
                  onCancel={cancelarDesc}
                />
              </div>

              {editDesc ? (
                <textarea
                  className="pv-desc-textarea"
                  value={draftDesc}
                  onChange={e => setDraftDesc(e.target.value)}
                  rows={5}
                />
              ) : (
                <p className="pv-desc">{vet.descripcion}</p>
              )}
            </div>

            <div className="pv-stats-grid">
              {[
                { num: vet.experiencia,       label: "Años de experiencia"   },
                { num: vet.totalResenas,      label: "Reseñas recibidas"     },
                { num: vet.calificacion,      label: "Calificación promedio" },
                { num: vet.servicios.length,  label: "Servicios ofrecidos"   },
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
        {tab === "servicios" && (
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

            {/* Modal agregar servicio */}
            {addServicio && (
              <div className="pv-add-srv-form">
                <input
                  className="pv-srv-input"
                  placeholder="Nombre del servicio"
                  value={newSrv.nombre}
                  onChange={e => setNewSrv(s => ({ ...s, nombre: e.target.value }))}
                />
                <input
                  className="pv-srv-input"
                  placeholder="Precio (ej: Desde $40.000)"
                  value={newSrv.precio}
                  onChange={e => setNewSrv(s => ({ ...s, precio: e.target.value }))}
                />
                <div className="pv-add-srv-btns">
                  <button className="pv-edit-save" onClick={guardarNuevoSrv}><IcoSave /> Guardar</button>
                  <button className="pv-edit-cancel" onClick={() => setAddServicio(false)}><IcoCancel /> Cancelar</button>
                </div>
              </div>
            )}

            <div className="pv-servicios-grid">
              {vet.servicios.map((srv, i) => (
                <div className="pv-srv-card" key={i}>
                  <div className="pv-srv-accent" />
                  <div className="pv-srv-icon-wrap">{srv.icon}</div>

                  {editServicio === i ? (
                    <div className="pv-srv-edit-form">
                      <input
                        className="pv-srv-input"
                        value={draftSrv.nombre}
                        onChange={e => setDraftSrv(d => ({ ...d, nombre: e.target.value }))}
                        placeholder="Nombre"
                      />
                      <input
                        className="pv-srv-input"
                        value={draftSrv.precio}
                        onChange={e => setDraftSrv(d => ({ ...d, precio: e.target.value }))}
                        placeholder="Precio"
                      />
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
                        <button className="pv-srv-icon-btn" onClick={() => abrirSrv(i)} title="Editar"><IcoEdit /></button>
                        <button className="pv-srv-icon-btn del" onClick={() => eliminarSrv(i)} title="Eliminar"><IcoTrash /></button>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── RESEÑAS ── */}
        {tab === "resenas" && (
          <div className="pv-tab-resenas">
            {/* aviso de solo lectura */}
            <div className="pv-resenas-notice">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              Las reseñas son generadas por los dueños de mascotas y no pueden editarse.
            </div>

            <div className="pv-rating-summary">
              <div className="pv-rating-big">
                <span className="pv-rating-big-num">{vet.calificacion}</span>
                <Estrellas valor={vet.calificacion} size={20} />
                <span className="pv-rating-big-sub">{vet.totalResenas} reseñas</span>
              </div>
              <div className="pv-bars">
                {[{s:5,p:78},{s:4,p:14},{s:3,p:5},{s:2,p:2},{s:1,p:1}].map((b) => (
                  <div className="pv-bar-row" key={b.s}>
                    <span className="pv-bar-label">{b.s}★</span>
                    <div className="pv-bar-track">
                      <div className="pv-bar-fill" style={{ width: `${b.p}%` }} />
                    </div>
                    <span className="pv-bar-pct">{b.p}%</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pv-resenas-list">
              {vet.resenas.map((r) => (
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
          </div>
        )}
      </div>

      <Toast msg={toast} />
    </div>
  );
}