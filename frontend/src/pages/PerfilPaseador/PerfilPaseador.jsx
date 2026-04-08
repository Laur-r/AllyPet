import { useState, useRef } from "react";
import "./PerfilPaseados.css";

/* ─── SVG icons para servicios ─── */
const SrvIcons = {
  paseo: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 12h18M3 12l4-4M3 12l4 4M13 5l4 4-4 4"/>
    </svg>
  ),
  individual: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="4" r="2"/><circle cx="18" cy="8" r="2"/>
      <path d="M9.27 7.26 4 17"/><path d="m15 17-2.15-5.4"/>
      <path d="M4 17h16"/><path d="m11 17 3-6 3.27 3.27"/>
    </svg>
  ),
  grupal: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
      <circle cx="9" cy="7" r="4"/>
      <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>
    </svg>
  ),
  guarderia: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
      <polyline points="9 22 9 12 15 12 15 22"/>
    </svg>
  ),
  adiestramiento: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
    </svg>
  ),
  visita: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2"/>
      <line x1="16" y1="2" x2="16" y2="6"/>
      <line x1="8" y1="2" x2="8" y2="6"/>
      <line x1="3" y1="10" x2="21" y2="10"/>
      <path d="M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01M16 18h.01"/>
    </svg>
  ),
};

const PASEADOR_INICIAL = {
  nombre:           "Alexander Vélez",
  especialidad:     "Paseador Profesional de Mascotas",
  foto:             "https://i.pravatar.cc/300?img=57",
  banner:           "https://images.unsplash.com/photo-1601758124510-52d02ddb7cbd?w=1200&q=80",
  ciudad:           "Cali",
  estado:           "Valle del Cauca",
  disponible:       true,
  calificacion:     4.9,
  totalResenas:     98,
  experiencia:      5,
  mascotasMax:      4,
  descripcion:
    "Soy paseador profesional con más de 5 años de experiencia cuidando y paseando perros de todas las razas y tamaños. Me apasiona el bienestar animal y me comprometo a brindar paseos seguros, divertidos y llenos de actividad. Cada mascota recibe atención personalizada y actualizaciones en tiempo real para su dueño.",
  zonas:            ["Granada", "San Fernando", "El Peñón", "Normandía", "Ciudad Jardín"],
  razas:            ["Todas las razas", "Razas pequeñas", "Razas medianas", "Razas grandes"],
  servicios: [
    { icon: SrvIcons.individual,     iconKey: "individual",     nombre: "Paseo Individual",     precio: "Desde $15.000" },
    { icon: SrvIcons.grupal,         iconKey: "grupal",         nombre: "Paseo Grupal",         precio: "Desde $10.000" },
    { icon: SrvIcons.guarderia,      iconKey: "guarderia",      nombre: "Guardería en Casa",    precio: "Desde $40.000" },
    { icon: SrvIcons.adiestramiento, iconKey: "adiestramiento", nombre: "Adiestramiento",       precio: "Desde $35.000" },
    { icon: SrvIcons.visita,         iconKey: "visita",         nombre: "Visita Domiciliaria",  precio: "Desde $20.000" },
    { icon: SrvIcons.paseo,          iconKey: "paseo",          nombre: "Paseo Extendido",      precio: "Desde $25.000" },
  ],
  resenas: [
    { id: 1, cliente: "Laura Cifuentes",   avatar: "https://i.pravatar.cc/60?img=5",  fecha: "20 mar 2025", estrellas: 5, comentario: "Alexander es increíble. Mi golden retriever regresa feliz y agotado de cada paseo. Muy puntual y siempre manda fotos del paseo." },
    { id: 2, cliente: "Carlos Ríos",       avatar: "https://i.pravatar.cc/60?img=11", fecha: "8 feb 2025",  estrellas: 5, comentario: "Muy profesional y se nota que ama a los animales. Mi perro, que normalmente es tímido, se va con él feliz desde el primer día." },
    { id: 3, cliente: "Mariana Ospina",    avatar: "https://i.pravatar.cc/60?img=9",  fecha: "15 ene 2025", estrellas: 5, comentario: "Excelente servicio. Puntual, cariñoso con los perritos y muy responsable. Lo recomiendo 100%." },
    { id: 4, cliente: "Felipe Gutiérrez",  avatar: "https://i.pravatar.cc/60?img=15", fecha: "3 ene 2025",  estrellas: 4, comentario: "Muy buen servicio. Alexander cuida muy bien a mi bulldog y siempre llega a tiempo. Buen precio también." },
  ],
};

/* ── íconos UI ── */
const IcoEdit   = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>;
const IcoSave   = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>;
const IcoCancel = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 6L6 18M6 6l12 12"/></svg>;
const IcoCamera = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>;
const IcoPlus   = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>;
const IcoTrash  = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/></svg>;
const IcoX      = () => <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 6L6 18M6 6l12 12"/></svg>;

function Estrellas({ valor, size = 15 }) {
  return (
    <span className="pp-stars" style={{ fontSize: size }}>
      {[1, 2, 3, 4, 5].map((i) => (
        <span key={i} className={i <= Math.round(valor) ? "star on" : "star"}>★</span>
      ))}
    </span>
  );
}

function EditBtn({ editando, onEdit, onSave, onCancel }) {
  if (!editando) return (
    <button className="pp-edit-trigger" onClick={onEdit} title="Editar">
      <IcoEdit /> Editar
    </button>
  );
  return (
    <div className="pp-edit-actions">
      <button className="pp-edit-save" onClick={onSave}><IcoSave /> Guardar</button>
      <button className="pp-edit-cancel" onClick={onCancel}><IcoCancel /> Cancelar</button>
    </div>
  );
}

function Toast({ msg }) {
  return msg ? (
    <div className="pp-toast">
      <IcoSave /> {msg}
    </div>
  ) : null;
}

/* ════════════════════════════════════════════════════════ */
export default function PerfilPaseador() {
  const [pas, setPas]             = useState(PASEADOR_INICIAL);
  const [tab, setTab]             = useState("info");
  const [toast, setToast]         = useState(null);

  const [editHero,     setEditHero]     = useState(false);
  const [editDesc,     setEditDesc]     = useState(false);
  const [editServicio, setEditServicio] = useState(null);
  const [addServicio,  setAddServicio]  = useState(false);
  const [editZonas,    setEditZonas]    = useState(false);

  const [draftHero, setDraftHero] = useState({});
  const [draftDesc, setDraftDesc] = useState("");
  const [draftSrv,  setDraftSrv]  = useState({ nombre: "", precio: "" });
  const [newSrv,    setNewSrv]    = useState({ nombre: "", precio: "" });
  const [draftZonas, setDraftZonas] = useState([]);
  const [newZona,    setNewZona]   = useState("");

  const bannerRef = useRef();
  const fotoRef   = useRef();

  const notify = (msg) => { setToast(msg); setTimeout(() => setToast(null), 2600); };

  /* ── imagen ── */
  const handleBanner = (e) => {
    const f = e.target.files[0];
    if (f) setDraftHero((d) => ({ ...d, banner: URL.createObjectURL(f) }));
  };
  const handleFoto = (e) => {
    const f = e.target.files[0];
    if (f) setDraftHero((d) => ({ ...d, foto: URL.createObjectURL(f) }));
  };

  /* ── HERO ── */
  const abrirHero = () => {
    setDraftHero({
      nombre: pas.nombre, especialidad: pas.especialidad,
      ciudad: pas.ciudad, estado: pas.estado,
      experiencia: pas.experiencia, disponible: pas.disponible,
      mascotasMax: pas.mascotasMax,
      foto: pas.foto, banner: pas.banner,
    });
    setEditHero(true);
  };
  const guardarHero   = () => { setPas((p) => ({ ...p, ...draftHero })); setEditHero(false); notify("Información principal actualizada"); };
  const cancelarHero  = () => setEditHero(false);

  /* ── DESC ── */
  const abrirDesc    = () => { setDraftDesc(pas.descripcion); setEditDesc(true); };
  const guardarDesc  = () => { setPas((p) => ({ ...p, descripcion: draftDesc })); setEditDesc(false); notify("Descripción actualizada"); };
  const cancelarDesc = () => setEditDesc(false);

  /* ── SERVICIOS ── */
  const abrirSrv  = (i) => { setDraftSrv({ nombre: pas.servicios[i].nombre, precio: pas.servicios[i].precio }); setEditServicio(i); };
  const guardarSrv = (i) => {
    setPas((p) => { const s = [...p.servicios]; s[i] = { ...s[i], ...draftSrv }; return { ...p, servicios: s }; });
    setEditServicio(null); notify("Servicio actualizado");
  };
  const eliminarSrv = (i) => {
    setPas((p) => ({ ...p, servicios: p.servicios.filter((_, idx) => idx !== i) }));
    notify("Servicio eliminado");
  };
  const guardarNuevoSrv = () => {
    if (!newSrv.nombre.trim()) return;
    setPas((p) => ({
      ...p,
      servicios: [...p.servicios, { icon: SrvIcons.paseo, iconKey: "paseo", nombre: newSrv.nombre, precio: newSrv.precio }],
    }));
    setNewSrv({ nombre: "", precio: "" }); setAddServicio(false); notify("Servicio agregado");
  };

  /* ── ZONAS ── */
  const abrirZonas   = () => { setDraftZonas([...pas.zonas]); setEditZonas(true); };
  const guardarZonas = () => { setPas((p) => ({ ...p, zonas: draftZonas })); setEditZonas(false); notify("Zonas actualizadas"); };
  const cancelarZonas = () => setEditZonas(false);
  const agregarZona  = () => {
    if (!newZona.trim() || draftZonas.includes(newZona.trim())) return;
    setDraftZonas((z) => [...z, newZona.trim()]); setNewZona("");
  };
  const eliminarZona = (i) => setDraftZonas((z) => z.filter((_, idx) => idx !== i));

  /* ── disponible toggle ── */
  const toggleDisponible = () => {
    if (editHero) setDraftHero((d) => ({ ...d, disponible: !d.disponible }));
    else setPas((p) => ({ ...p, disponible: !p.disponible }));
  };
  const disponibleActual = editHero ? draftHero.disponible : pas.disponible;

  return (
    <div className="pp-page">

      {/* ══════ HERO ══════ */}
      <div className="pp-hero">
        <div className="pp-banner">
          <img src={editHero && draftHero.banner ? draftHero.banner : pas.banner} alt="banner" />
          <div className="pp-banner-overlay" />
          <div className="pp-banner-brand" />

          {editHero && (
            <>
              <button className="pp-banner-edit-btn" onClick={() => bannerRef.current.click()}>
                <IcoCamera /> Cambiar portada
              </button>
              <input ref={bannerRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleBanner} />
            </>
          )}
        </div>

        <div className="pp-foto-wrap">
          <img className="pp-foto" src={editHero && draftHero.foto ? draftHero.foto : pas.foto} alt={pas.nombre} />
          <span
            className={`pp-disponible-badge ${disponibleActual ? "on" : "off"}`}
            onClick={toggleDisponible}
            style={{ cursor: "pointer" }}
            title="Clic para cambiar disponibilidad"
          >
            <span className="pp-badge-dot" />
            {disponibleActual ? "Disponible" : "Ocupado"}
          </span>
          {editHero && (
            <>
              <button className="pp-foto-edit-btn" onClick={() => fotoRef.current.click()} title="Cambiar foto">
                <IcoCamera />
              </button>
              <input ref={fotoRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleFoto} />
            </>
          )}
        </div>

        <div className="pp-acciones">
          <EditBtn editando={editHero} onEdit={abrirHero} onSave={guardarHero} onCancel={cancelarHero} />
        </div>
      </div>

      {/* ══════ HEADER INFO ══════ */}
      <div className="pp-header-info">
        <div className="pp-header-left">
          {editHero ? (
            <div className="pp-hero-edit-form">
              <input
                className="pp-hero-input pp-hero-input-nombre"
                value={draftHero.nombre}
                onChange={(e) => setDraftHero((d) => ({ ...d, nombre: e.target.value }))}
                placeholder="Nombre completo"
              />
              <input
                className="pp-hero-input"
                value={draftHero.especialidad}
                onChange={(e) => setDraftHero((d) => ({ ...d, especialidad: e.target.value }))}
                placeholder="Especialidad / Título"
              />
              <div className="pp-hero-row">
                <input
                  className="pp-hero-input"
                  value={draftHero.ciudad}
                  onChange={(e) => setDraftHero((d) => ({ ...d, ciudad: e.target.value }))}
                  placeholder="Ciudad"
                />
                <input
                  className="pp-hero-input"
                  value={draftHero.estado}
                  onChange={(e) => setDraftHero((d) => ({ ...d, estado: e.target.value }))}
                  placeholder="Departamento"
                />
                <input
                  className="pp-hero-input pp-hero-input-sm"
                  type="number" min="1"
                  value={draftHero.experiencia}
                  onChange={(e) => setDraftHero((d) => ({ ...d, experiencia: Number(e.target.value) }))}
                  placeholder="Años exp."
                />
                <input
                  className="pp-hero-input pp-hero-input-sm"
                  type="number" min="1"
                  value={draftHero.mascotasMax}
                  onChange={(e) => setDraftHero((d) => ({ ...d, mascotasMax: Number(e.target.value) }))}
                  placeholder="Máx. mascotas"
                />
              </div>
            </div>
          ) : (
            <>
              <h1 className="pp-nombre">{pas.nombre}</h1>
              <p className="pp-especialidad">{pas.especialidad}</p>
              <div className="pp-meta-row">
                <span className="pp-meta-item">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
                  </svg>
                  {pas.ciudad}, {pas.estado}
                </span>
                <span className="pp-meta-item">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                  </svg>
                  {pas.experiencia} años de experiencia
                </span>
                <span className="pp-meta-item">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="11" cy="4" r="2"/><circle cx="18" cy="8" r="2"/>
                    <path d="M9.27 7.26 4 17m11-6-2.15 5.4M4 17h16m-5 0 3-6 3.27 3.27"/>
                  </svg>
                  Máx. {pas.mascotasMax} mascotas por paseo
                </span>
              </div>
            </>
          )}
        </div>

        <div className="pp-rating-box">
          <span className="pp-rating-num">{pas.calificacion}</span>
          <Estrellas valor={pas.calificacion} size={17} />
          <span className="pp-rating-count">{pas.totalResenas} reseñas</span>
        </div>
      </div>

      {/* ══════ TABS ══════ */}
      <div className="pp-tabs">
        {[
          { key: "info",      label: "Información" },
          { key: "servicios", label: "Servicios"   },
          { key: "resenas",   label: `Reseñas (${pas.resenas.length})` },
        ].map((t) => (
          <button
            key={t.key}
            className={`pp-tab ${tab === t.key ? "activa" : ""}`}
            onClick={() => setTab(t.key)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ══════ BODY ══════ */}
      <div className="pp-body">

        {/* ── INFO ── */}
        {tab === "info" && (
          <div className="pp-tab-info">

            {/* Descripción */}
            <div className="pp-card">
              <div className="pp-card-header">
                <h3 className="pp-card-title">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                  </svg>
                  Sobre mí
                </h3>
                <EditBtn editando={editDesc} onEdit={abrirDesc} onSave={guardarDesc} onCancel={cancelarDesc} />
              </div>
              {editDesc ? (
                <textarea
                  className="pp-desc-textarea"
                  value={draftDesc}
                  onChange={(e) => setDraftDesc(e.target.value)}
                  rows={5}
                />
              ) : (
                <p className="pp-desc">{pas.descripcion}</p>
              )}
            </div>

            {/* Stats */}
            <div className="pp-stats-grid">
              {[
                { num: pas.experiencia,      label: "Años de experiencia"   },
                { num: pas.totalResenas,     label: "Reseñas recibidas"     },
                { num: pas.calificacion,     label: "Calificación promedio" },
                { num: pas.mascotasMax,      label: "Mascotas por paseo"    },
              ].map((s, i) => (
                <div className="pp-stat" key={i}>
                  <span className="pp-stat-num">{s.num}</span>
                  <span className="pp-stat-label">{s.label}</span>
                </div>
              ))}
            </div>

            {/* Zonas de cobertura */}
            <div className="pp-card">
              <div className="pp-card-header">
                <h3 className="pp-card-title">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
                  </svg>
                  Zonas de cobertura
                </h3>
                <EditBtn editando={editZonas} onEdit={abrirZonas} onSave={guardarZonas} onCancel={cancelarZonas} />
              </div>

              {editZonas ? (
                <div className="pp-zonas-edit">
                  <div className="pp-zonas-chips">
                    {draftZonas.map((z, i) => (
                      <span className="pp-zona-chip editable" key={i}>
                        {z}
                        <button className="pp-zona-x" onClick={() => eliminarZona(i)}><IcoX /></button>
                      </span>
                    ))}
                  </div>
                  <div className="pp-zona-add-row">
                    <input
                      className="pp-srv-input"
                      placeholder="Agregar zona (ej: El Poblado)"
                      value={newZona}
                      onChange={(e) => setNewZona(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && agregarZona()}
                    />
                    <button className="pp-btn-add-zona" onClick={agregarZona}><IcoPlus /> Agregar</button>
                  </div>
                </div>
              ) : (
                <div className="pp-zonas-chips">
                  {pas.zonas.map((z, i) => (
                    <span className="pp-zona-chip" key={i}>{z}</span>
                  ))}
                </div>
              )}
            </div>

            {/* Razas aceptadas */}
            <div className="pp-card">
              <div className="pp-card-header">
                <h3 className="pp-card-title">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="11" cy="4" r="2"/><circle cx="18" cy="8" r="2"/>
                    <path d="M9.27 7.26 4 17m11-6-2.15 5.4M4 17h16m-5 0 3-6 3.27 3.27"/>
                  </svg>
                  Razas aceptadas
                </h3>
              </div>
              <div className="pp-zonas-chips">
                {pas.razas.map((r, i) => (
                  <span className="pp-zona-chip raza" key={i}>{r}</span>
                ))}
              </div>
            </div>

          </div>
        )}

        {/* ── SERVICIOS ── */}
        {tab === "servicios" && (
          <div className="pp-tab-servicios">
            <div className="pp-servicios-header">
              <div>
                <h3 className="pp-section-title">Servicios disponibles</h3>
                <p className="pp-section-sub">Edita, elimina o agrega los servicios que ofreces.</p>
              </div>
              <button className="pp-btn-add-srv" onClick={() => setAddServicio(true)}>
                <IcoPlus /> Agregar servicio
              </button>
            </div>

            {addServicio && (
              <div className="pp-add-srv-form">
                <input
                  className="pp-srv-input"
                  placeholder="Nombre del servicio"
                  value={newSrv.nombre}
                  onChange={(e) => setNewSrv((s) => ({ ...s, nombre: e.target.value }))}
                />
                <input
                  className="pp-srv-input"
                  placeholder="Precio (ej: Desde $15.000)"
                  value={newSrv.precio}
                  onChange={(e) => setNewSrv((s) => ({ ...s, precio: e.target.value }))}
                />
                <div className="pp-add-srv-btns">
                  <button className="pp-edit-save" onClick={guardarNuevoSrv}><IcoSave /> Guardar</button>
                  <button className="pp-edit-cancel" onClick={() => setAddServicio(false)}><IcoCancel /> Cancelar</button>
                </div>
              </div>
            )}

            <div className="pp-servicios-grid">
              {pas.servicios.map((srv, i) => (
                <div className="pp-srv-card" key={i}>
                  <div className="pp-srv-accent" />
                  <div className="pp-srv-icon-wrap">{srv.icon}</div>

                  {editServicio === i ? (
                    <div className="pp-srv-edit-form">
                      <input
                        className="pp-srv-input"
                        value={draftSrv.nombre}
                        onChange={(e) => setDraftSrv((d) => ({ ...d, nombre: e.target.value }))}
                        placeholder="Nombre"
                      />
                      <input
                        className="pp-srv-input"
                        value={draftSrv.precio}
                        onChange={(e) => setDraftSrv((d) => ({ ...d, precio: e.target.value }))}
                        placeholder="Precio"
                      />
                      <div className="pp-srv-edit-btns">
                        <button className="pp-edit-save sm" onClick={() => guardarSrv(i)}><IcoSave /></button>
                        <button className="pp-edit-cancel sm" onClick={() => setEditServicio(null)}><IcoCancel /></button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="pp-srv-info">
                        <span className="pp-srv-nombre">{srv.nombre}</span>
                        <span className="pp-srv-precio">{srv.precio}</span>
                      </div>
                      <div className="pp-srv-card-actions">
                        <button className="pp-srv-icon-btn" onClick={() => abrirSrv(i)} title="Editar"><IcoEdit /></button>
                        <button className="pp-srv-icon-btn del" onClick={() => eliminarSrv(i)} title="Eliminar"><IcoTrash /></button>
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
          <div className="pp-tab-resenas">
            <div className="pp-resenas-notice">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              Las reseñas son generadas por los dueños de mascotas y no pueden editarse.
            </div>

            <div className="pp-rating-summary">
              <div className="pp-rating-big">
                <span className="pp-rating-big-num">{pas.calificacion}</span>
                <Estrellas valor={pas.calificacion} size={20} />
                <span className="pp-rating-big-sub">{pas.totalResenas} reseñas</span>
              </div>
              <div className="pp-bars">
                {[{ s: 5, p: 85 }, { s: 4, p: 10 }, { s: 3, p: 3 }, { s: 2, p: 1 }, { s: 1, p: 1 }].map((b) => (
                  <div className="pp-bar-row" key={b.s}>
                    <span className="pp-bar-label">{b.s}★</span>
                    <div className="pp-bar-track">
                      <div className="pp-bar-fill" style={{ width: `${b.p}%` }} />
                    </div>
                    <span className="pp-bar-pct">{b.p}%</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pp-resenas-list">
              {pas.resenas.map((r) => (
                <div className="pp-resena" key={r.id}>
                  <div className="pp-resena-head">
                    <img className="pp-resena-avatar" src={r.avatar} alt={r.cliente} />
                    <div className="pp-resena-meta">
                      <span className="pp-resena-nombre">{r.cliente}</span>
                      <span className="pp-resena-fecha">{r.fecha}</span>
                    </div>
                    <Estrellas valor={r.estrellas} size={13} />
                  </div>
                  <p className="pp-resena-txt">{r.comentario}</p>
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