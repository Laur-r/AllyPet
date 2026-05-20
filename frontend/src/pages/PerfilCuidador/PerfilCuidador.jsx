import { useState, useRef, useEffect } from "react";
import "./PerfilCuidador.css";

/* ── Iconos ── */
const IcoEdit   = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>;
const IcoSave   = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>;
const IcoCancel = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 6L6 18M6 6l12 12"/></svg>;
const IcoCamera = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>;

const API = import.meta.env.VITE_CUID_SERVICE_URL || "http://localhost:3011";

/* ── Subcomponentes ── */
function Estrellas({ valor, size = 15 }) {
  return (
    <span className="pc-stars" style={{ fontSize: size }}>
      {[1, 2, 3, 4, 5].map(i => (
        <span key={i} className={i <= Math.round(valor) ? "star on" : "star"}>★</span>
      ))}
    </span>
  );
}

function EditBtn({ editando, onEdit, onSave, onCancel, loading }) {
  if (!editando)
    return <button className="pc-edit-trigger" onClick={onEdit}><IcoEdit /> Editar</button>;
  return (
    <div className="pc-edit-actions">
      <button className="pc-edit-save" onClick={onSave} disabled={loading}>
        <IcoSave /> {loading ? "Guardando…" : "Guardar"}
      </button>
      <button className="pc-edit-cancel" onClick={onCancel} disabled={loading}>
        <IcoCancel /> Cancelar
      </button>
    </div>
  );
}

function Toast({ msg }) {
  return msg ? <div className="pc-toast"><IcoSave /> {msg}</div> : null;
}

export default function PerfilCuidador() {
  const [cuid,     setCuid]     = useState(null);
  const [cargando, setCargando] = useState(true);
  const [saving,   setSaving]   = useState(false);
  const [tab,      setTab]      = useState("info");
  const [toast,    setToast]    = useState(null);
  const [resenas,  setResenas]  = useState([]);
  const [cargandoResenas, setCargandoResenas] = useState(false);

  const [editHero, setEditHero] = useState(false);
  const [editDesc, setEditDesc] = useState(false);

  const [draftHero, setDraftHero] = useState({});
  const [draftDesc, setDraftDesc] = useState("");

  const bannerRef = useRef();
  const fotoRef   = useRef();

  const user      = JSON.parse(localStorage.getItem("user") || "{}");
  const usuarioId = user?.id || user?.usuario_id;
  const token     = localStorage.getItem("token");
  const hdrs      = { "Content-Type": "application/json", Authorization: `Bearer ${token}` };

  const notify = (msg) => { setToast(msg); setTimeout(() => setToast(null), 2800); };

  /* ── Carga inicial ── */
  useEffect(() => {
    if (!usuarioId) { setCargando(false); return; }
    const cargar = async () => {
      try {
        const res  = await fetch(`${API}/api/perfil-cuidador/${usuarioId}`, { headers: hdrs });
        const data = await res.json();
        if (res.ok) setCuid({ ...data, nombre: data.nombre || "Cuidador" });
        else notify("Error al cargar el perfil");
      } catch {
        notify("Error de conexión con el servidor");
      } finally {
        setCargando(false);
      }
    };
    cargar();
  }, [usuarioId]);

  /* ── Cargar reseñas al abrir la tab ── */
  useEffect(() => {
    if (tab !== "resenas" || !usuarioId) return;
    setCargandoResenas(true);
    fetch(`${API}/api/perfil-cuidador/${usuarioId}/resenas`)
      .then(r => r.json())
      .then(d => setResenas(Array.isArray(d.data) ? d.data : []))
      .catch(() => setResenas([]))
      .finally(() => setCargandoResenas(false));
  }, [tab, usuarioId]);

  /* ── PUT genérico ── */
  const putPerfil = async (body) => {
    const res  = await fetch(`${API}/api/perfil-cuidador/${usuarioId}`, {
      method: "PUT", headers: hdrs, body: JSON.stringify(body),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Error del servidor");
    return data;
  };

  const subirImagen = async (campo, file) => {
    const fd = new FormData();
    fd.append("imagen", file);
    const res  = await fetch(`${API}/api/perfil-cuidador/${usuarioId}/imagen/${campo}`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: fd,
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error);
    return data.url;
  };

  const handleBanner = (e) => {
    const f = e.target.files[0];
    if (f) setDraftHero(d => ({ ...d, banner: URL.createObjectURL(f), _bannerFile: f }));
  };
  const handleFoto = (e) => {
    const f = e.target.files[0];
    if (f) setDraftHero(d => ({ ...d, foto_perfil: URL.createObjectURL(f), _fotoFile: f }));
  };

  /* ══ HERO ══ */
  const abrirHero = () => {
    setDraftHero({
      nombre:        cuid.nombre,
      especialidad:  cuid.especialidad,
      ciudad:        cuid.ciudad,
      estado:        cuid.estado,
      experiencia:   cuid.experiencia,
      disponible:    cuid.disponible,
      tarifa:        cuid.tarifa,
      foto_perfil:   cuid.foto_perfil,
      banner:        cuid.banner,
    });
    setEditHero(true);
  };

  const guardarHero = async () => {
    setSaving(true);
    try {
      let bannerUrl   = draftHero.banner;
      let fotoUrl     = draftHero.foto_perfil;
      if (draftHero._bannerFile) bannerUrl = await subirImagen("banner",     draftHero._bannerFile);
      if (draftHero._fotoFile)   fotoUrl   = await subirImagen("foto_perfil", draftHero._fotoFile);

      const payload = { ...draftHero, banner: bannerUrl, foto_perfil: fotoUrl };
      delete payload._bannerFile;
      delete payload._fotoFile;

      await putPerfil(payload);
      setCuid(c => ({ ...c, ...payload }));

      if (payload.nombre) {
        const u = JSON.parse(localStorage.getItem("user") || "{}");
        u.nombre = payload.nombre;
        localStorage.setItem("user", JSON.stringify(u));
        window.dispatchEvent(new Event("storage"));
      }

      setEditHero(false);
      notify("Información actualizada ✓");
    } catch (e) {
      notify("Error: " + e.message);
    } finally {
      setSaving(false);
    }
  };

  /* ══ DISPONIBILIDAD ══ */
  const toggleDisponible = async () => {
    if (editHero) { setDraftHero(d => ({ ...d, disponible: !d.disponible })); return; }
    const nuevo = !cuid.disponible;
    try {
      await fetch(`${API}/api/perfil-cuidador/${usuarioId}/disponibilidad`, {
        method: "PATCH", headers: hdrs, body: JSON.stringify({ disponible: nuevo }),
      });
      setCuid(c => ({ ...c, disponible: nuevo }));
    } catch {
      notify("Error al cambiar disponibilidad");
    }
  };

  /* ══ DESCRIPCIÓN ══ */
  const abrirDesc   = () => { setDraftDesc(cuid.descripcion || ""); setEditDesc(true); };
  const guardarDesc = async () => {
    setSaving(true);
    try {
      await putPerfil({ descripcion: draftDesc });
      setCuid(c => ({ ...c, descripcion: draftDesc }));
      setEditDesc(false);
      notify("Descripción actualizada ✓");
    } catch (e) {
      notify("Error: " + e.message);
    } finally {
      setSaving(false);
    }
  };

  /* ── Loading / Error ── */
  if (cargando) return (
    <div className="pc-loading">
      <div className="pc-spinner" />
      <span>Cargando perfil…</span>
    </div>
  );
  if (!cuid) return <div className="pc-loading">No se encontró el perfil.</div>;

  const dispActual = editHero ? draftHero.disponible : cuid.disponible;
  const fotoSrc    = (editHero && draftHero.foto_perfil)
    ? draftHero.foto_perfil
    : cuid.foto_perfil
      ? (cuid.foto_perfil.startsWith("/uploads/") ? `${API}${cuid.foto_perfil}` : cuid.foto_perfil)
      : null;
  const bannerSrc  = (editHero && draftHero.banner)
    ? draftHero.banner
    : cuid.banner
      ? (cuid.banner.startsWith("/uploads/") ? `${API}${cuid.banner}` : cuid.banner)
      : "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=1200&q=80";

  return (
    <div className="pc-page">

      {/* ══ HERO ══ */}
      <div className="pc-hero">
        <div className="pc-banner">
          <img src={bannerSrc} alt="banner" />
          <div className="pc-banner-overlay" />
          <div className="pc-banner-brand" />
          {editHero && (
            <>
              <button className="pc-banner-edit-btn" onClick={() => bannerRef.current.click()}>
                <IcoCamera /> Cambiar portada
              </button>
              <input ref={bannerRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleBanner} />
            </>
          )}
        </div>

        <div className="pc-foto-wrap">
          {fotoSrc
            ? <img className="pc-foto" src={fotoSrc} alt={cuid.nombre} />
            : <div className="pc-foto-inicial">{cuid.nombre?.[0]?.toUpperCase() || "C"}</div>
          }
          <span
            className={`pc-disponible-badge ${dispActual ? "on" : "off"}`}
            onClick={toggleDisponible}
            title="Clic para cambiar disponibilidad"
          >
            <span className="pc-badge-dot" />
            {dispActual ? "Disponible" : "Ocupado"}
          </span>
          {editHero && (
            <>
              <button className="pc-foto-edit-btn" onClick={() => fotoRef.current.click()} title="Cambiar foto">
                <IcoCamera />
              </button>
              <input ref={fotoRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleFoto} />
            </>
          )}
        </div>

        <div className="pc-acciones">
          <EditBtn editando={editHero} onEdit={abrirHero} onSave={guardarHero} onCancel={() => setEditHero(false)} loading={saving} />
        </div>
      </div>

      {/* ══ HEADER INFO ══ */}
      <div className="pc-header-info">
        <div className="pc-header-left">
          {editHero ? (
            <div className="pc-hero-edit-form">
              <input
                className="pc-hero-input pc-hero-input-nombre"
                value={draftHero.nombre || ""}
                onChange={e => setDraftHero(d => ({ ...d, nombre: e.target.value }))}
                placeholder="Nombre completo"
              />
              <input
                className="pc-hero-input"
                value={draftHero.especialidad || ""}
                onChange={e => setDraftHero(d => ({ ...d, especialidad: e.target.value }))}
                placeholder="Especialidad (ej: Cuidado en casa, Guardería)"
              />
              <div className="pc-hero-row">
                <input
                  className="pc-hero-input"
                  value={draftHero.ciudad || ""}
                  onChange={e => setDraftHero(d => ({ ...d, ciudad: e.target.value }))}
                  placeholder="Ciudad"
                />
                <input
                  className="pc-hero-input"
                  value={draftHero.estado || ""}
                  onChange={e => setDraftHero(d => ({ ...d, estado: e.target.value }))}
                  placeholder="Departamento"
                />
                <input
                  className="pc-hero-input pc-hero-input-sm"
                  type="number" min="1"
                  value={draftHero.experiencia || ""}
                  onChange={e => setDraftHero(d => ({ ...d, experiencia: Number(e.target.value) }))}
                  placeholder="Años exp."
                />
                <input
                  className="pc-hero-input pc-hero-input-sm"
                  value={draftHero.tarifa || ""}
                  onChange={e => setDraftHero(d => ({ ...d, tarifa: e.target.value }))}
                  placeholder="Tarifa (ej: 25000)"
                />
              </div>
              <input
                className="pc-hero-input"
                value={draftHero.disponibilidad || ""}
                onChange={e => setDraftHero(d => ({ ...d, disponibilidad: e.target.value }))}
                placeholder="Horario de disponibilidad (ej: Lun-Vie 8am-6pm)"
              />
            </div>
          ) : (
            <>
              <h1 className="pc-nombre">{cuid.nombre}</h1>
              {cuid.especialidad && <p className="pc-especialidad">{cuid.especialidad}</p>}
              <div className="pc-meta-row">
                {(cuid.ciudad || cuid.estado) && (
                  <span className="pc-meta-item">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                    {cuid.ciudad}{cuid.estado ? `, ${cuid.estado}` : ""}
                  </span>
                )}
                {cuid.experiencia > 0 && (
                  <span className="pc-meta-item">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                    {cuid.experiencia} años de experiencia
                  </span>
                )}
                {cuid.tarifa && (
                  <span className="pc-meta-item">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
                    Desde ${Number(cuid.tarifa).toLocaleString("es-CO")} / día
                  </span>
                )}
                {cuid.disponibilidad && (
                  <span className="pc-meta-item">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                    {cuid.disponibilidad}
                  </span>
                )}
              </div>
            </>
          )}
        </div>

        <div className="pc-rating-box">
          <span className="pc-rating-num">
            {cuid.calificacion ? Number(cuid.calificacion).toFixed(1) : "0.0"}
          </span>
          <Estrellas valor={cuid.calificacion || 0} size={17} />
          <span className="pc-rating-count">{cuid.total_resenas || 0} reseñas</span>
        </div>
      </div>

      {/* ══ TABS ══ */}
      <div className="pc-tabs">
        {[
          { key: "info",    label: "Información" },
          { key: "resenas", label: `Reseñas (${cuid.total_resenas || 0})` },
        ].map(t => (
          <button
            key={t.key}
            className={`pc-tab ${tab === t.key ? "activa" : ""}`}
            onClick={() => setTab(t.key)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ══ BODY ══ */}
      <div className="pc-body">

        {tab === "info" && (
          <div className="pc-tab-info">

            {/* Descripción */}
            <div className="pc-card">
              <div className="pc-card-header">
                <h3 className="pc-card-title">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                  Sobre mí
                </h3>
                <EditBtn editando={editDesc} onEdit={abrirDesc} onSave={guardarDesc} onCancel={() => setEditDesc(false)} loading={saving} />
              </div>
              {editDesc
                ? <textarea className="pc-desc-textarea" value={draftDesc} onChange={e => setDraftDesc(e.target.value)} rows={5} placeholder="Cuéntales a los dueños sobre ti, tu experiencia y cómo cuidas a sus mascotas…" />
                : <p className="pc-desc">{cuid.descripcion || "Sin descripción aún."}</p>
              }
            </div>

            {/* Stats */}
            <div className="pc-stats-grid">
              {[
                { num: cuid.experiencia || 0,                          label: "Años de experiencia"   },
                { num: cuid.total_resenas || 0,                        label: "Reseñas recibidas"     },
                { num: Number(cuid.calificacion || 0).toFixed(1),      label: "Calificación promedio" },
                { num: cuid.tarifa ? `$${Number(cuid.tarifa).toLocaleString("es-CO")}` : "—", label: "Tarifa por día" },
              ].map((s, i) => (
                <div className="pc-stat" key={i}>
                  <span className="pc-stat-num">{s.num}</span>
                  <span className="pc-stat-label">{s.label}</span>
                </div>
              ))}
            </div>

            {/* Info de contacto — solo lectura (correo y ciudad no editables en este bloque) */}
            <div className="pc-card">
              <div className="pc-card-header">
                <h3 className="pc-card-title">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                  Información de contacto
                </h3>
              </div>
              <div className="pc-info-lista">
                {[
                  { label: "Correo",    valor: cuid.correo   || "—", nota: "No modificable" },
                  { label: "Teléfono",  valor: cuid.telefono || "—" },
                  { label: "Ciudad",    valor: cuid.ciudad   || "—" },
                  { label: "Horario",   valor: cuid.disponibilidad || "—" },
                ].map((item, i) => (
                  <div key={i} className="pc-info-row">
                    <span className="pc-info-label">{item.label}</span>
                    <span className="pc-info-valor">
                      {item.valor}
                      {item.nota && <em className="pc-info-nota"> ({item.nota})</em>}
                    </span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

        {tab === "resenas" && (
          <div className="pc-tab-resenas">
            {cargandoResenas ? (
              <div className="pc-loading" style={{ padding: "20px" }}>
                <div className="pc-spinner" /><span>Cargando reseñas…</span>
              </div>
            ) : resenas.length === 0 ? (
              <div className="pc-resenas-empty">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                <p>Aún no tienes reseñas. ¡Completa tus primeros servicios para que los dueños puedan calificarte!</p>
              </div>
            ) : (
              <div className="pc-resenas-lista">
                {resenas.map(r => (
                  <div key={r.id} className="pc-resena-card">
                    <div className="pc-resena-avatar">
                      {r.dueno_foto
                        ? <img src={r.dueno_foto.startsWith("/uploads/") ? `${API}${r.dueno_foto}` : r.dueno_foto} alt={r.dueno_nombre} />
                        : <div className="pc-resena-inicial">{r.dueno_nombre?.[0]?.toUpperCase() || "D"}</div>
                      }
                    </div>
                    <div className="pc-resena-body">
                      <div className="pc-resena-top">
                        <span className="pc-resena-nombre">{r.dueno_nombre}</span>
                        <Estrellas valor={r.calificacion} size={13} />
                      </div>
                      {r.comentario && <p className="pc-resena-comentario">"{r.comentario}"</p>}
                      <span className="pc-resena-fecha">
                        {new Date(r.fecha).toLocaleDateString("es-CO", { day: "numeric", month: "long", year: "numeric" })}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <Toast msg={toast} />
    </div>
  );
}