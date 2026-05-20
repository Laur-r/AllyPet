import { useState, useRef, useEffect } from "react";
import ListaResenas from "../../components/Resenas/ListaResenas";
import { getResenasUsuario, getPromedioUsuario } from "../../services/resenas.service"; // ✅
import "./PerfilPaseador.css";

/* ─── SVG icons para servicios ─── */
const SrvIcons = {
  paseo: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12h18M3 12l4-4M3 12l4 4M13 5l4 4-4 4"/></svg>,
  individual: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="4" r="2"/><circle cx="18" cy="8" r="2"/><path d="M9.27 7.26 4 17"/><path d="m15 17-2.15-5.4"/><path d="M4 17h16"/><path d="m11 17 3-6 3.27 3.27"/></svg>,
  grupal: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
  guarderia: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
  adiestramiento: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>,
  visita: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/><path d="M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01M16 18h.01"/></svg>,
};

const IcoEdit   = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>;
const IcoSave   = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>;
const IcoCancel = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 6L6 18M6 6l12 12"/></svg>;
const IcoCamera = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>;
const IcoPlus   = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>;
const IcoTrash  = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/></svg>;
const IcoX      = () => <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 6L6 18M6 6l12 12"/></svg>;

const API = import.meta.env.VITE_PAS_SERVICE_URL || "http://localhost:3006";

function Estrellas({ valor, size = 15 }) {
  return (
    <span className="pp-stars" style={{ fontSize: size }}>
      {[1,2,3,4,5].map(i => (
        <span key={i} className={i <= Math.round(valor) ? "star on" : "star"}>★</span>
      ))}
    </span>
  );
}

function EditBtn({ editando, onEdit, onSave, onCancel, loading }) {
  if (!editando) return <button className="pp-edit-trigger" onClick={onEdit}><IcoEdit /> Editar</button>;
  return (
    <div className="pp-edit-actions">
      <button className="pp-edit-save" onClick={onSave} disabled={loading}><IcoSave /> {loading ? "Guardando…" : "Guardar"}</button>
      <button className="pp-edit-cancel" onClick={onCancel} disabled={loading}><IcoCancel /> Cancelar</button>
    </div>
  );
}

function Toast({ msg }) {
  return msg ? <div className="pp-toast"><IcoSave /> {msg}</div> : null;
}

export default function PerfilPaseador() {
  const [pas,      setPas]      = useState(null);
  const [cargando, setCargando] = useState(true);
  const [saving,   setSaving]   = useState(false);
  const [tab,      setTab]      = useState("info");
  const [toast,    setToast]    = useState(null);
  const [resenas,  setResenas]  = useState([]);
  const [cargandoResenas, setCargandoResenas] = useState(false);

  const [editHero,     setEditHero]     = useState(false);
  const [editDesc,     setEditDesc]     = useState(false);
  const [editServicio, setEditServicio] = useState(null);
  const [addServicio,  setAddServicio]  = useState(false);
  const [editZonas,    setEditZonas]    = useState(false);
  const [editRazas,    setEditRazas]    = useState(false);

  const [draftHero,  setDraftHero]  = useState({});
  const [draftDesc,  setDraftDesc]  = useState("");
  const [draftSrv,   setDraftSrv]   = useState({ nombre: "", precio: "" });
  const [newSrv,     setNewSrv]     = useState({ nombre: "", precio: "" });
  const [draftZonas, setDraftZonas] = useState([]);
  const [newZona,    setNewZona]    = useState("");
  const [draftRazas, setDraftRazas] = useState([]);
  const [newRaza,    setNewRaza]    = useState("");

  const bannerRef = useRef();
  const fotoRef   = useRef();

  const user      = JSON.parse(localStorage.getItem("user") || "{}");
  const usuarioId = user?.id || user?.usuario_id;
  const token     = localStorage.getItem("token");
  const hdrs      = { "Content-Type": "application/json", Authorization: `Bearer ${token}` };

  const notify = msg => { setToast(msg); setTimeout(() => setToast(null), 2800); };

  const normalizarServicios = (lista = []) =>
    lista.map(s => ({ ...s, icon: SrvIcons[s.iconKey] || SrvIcons.paseo }));

  /* ── Carga inicial ── */
  useEffect(() => {
    if (!usuarioId) { setCargando(false); return; }

    const cargarTodo = async () => {
      try {
        const resPerfil  = await fetch(`${API}/api/perfil-paseador/${usuarioId}`, { headers: hdrs });
        const dataPerfil = await resPerfil.json();

        // ✅ Usa resenas.service.js → puerto 3008
        let promedioReal = 0;
        let totalReal    = 0;
        try {
          const dataPromedio = await getPromedioUsuario(usuarioId);
          promedioReal = parseFloat(dataPromedio.promedio)      || 0;
          totalReal    = parseInt(dataPromedio.total_resenas)   || 0;
        } catch { /* si falla, usar valores del perfil */ }

        setPas({
          ...dataPerfil,
          nombre:             dataPerfil.nombre || "Usuario",
          servicios:          normalizarServicios(dataPerfil.servicios),
          promedio_estrellas: promedioReal || dataPerfil.promedio_estrellas || 0,
          total_resenas:      totalReal    || dataPerfil.total_resenas      || 0,
        });
      } catch {
        notify("Error al cargar el perfil");
      } finally {
        setCargando(false);
      }
    };

    cargarTodo();
  }, [usuarioId]);

  /* ── Cargar reseñas al abrir la tab ── */
  useEffect(() => {
    if (tab !== "resenas" || !usuarioId) return;
    setCargandoResenas(true);

    // ✅ Usa resenas.service.js → puerto 3008
    getResenasUsuario(usuarioId)
      .then(data => setResenas(Array.isArray(data) ? data : []))
      .catch(() => setResenas([]))
      .finally(() => setCargandoResenas(false));
  }, [tab, usuarioId]);

  /* ── PUT genérico ── */
  const putPerfil = async (body) => {
    const res  = await fetch(`${API}/api/perfil-paseador/${usuarioId}`, { method: "PUT", headers: hdrs, body: JSON.stringify(body) });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Error del servidor");
    return data;
  };

  const subirImagen = async (campo, file) => {
    const fd = new FormData();
    fd.append("imagen", file);
    const res = await fetch(`${API}/api/perfil-paseador/${usuarioId}/imagen/${campo}`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: fd,
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error);
    return data.url;
  };

  const handleBanner = async (e) => {
    const f = e.target.files[0];
    if (!f) return;
    setDraftHero(d => ({ ...d, banner: URL.createObjectURL(f), _bannerFile: f }));
  };
  const handleFoto = async (e) => {
    const f = e.target.files[0];
    if (!f) return;
    setDraftHero(d => ({ ...d, foto_perfil: URL.createObjectURL(f), _fotoFile: f }));
  };

  /* ══ HERO ══ */
  const abrirHero = () => {
    setDraftHero({ nombre: pas.nombre, especialidad: pas.especialidad, ciudad: pas.ciudad, estado: pas.estado, experiencia: pas.experiencia, disponible: pas.disponible, mascotas_max: pas.mascotas_max, foto_perfil: pas.foto_perfil, banner: pas.banner });
    setEditHero(true);
  };
  const guardarHero = async () => {
    setSaving(true);
    try {
      let bannerUrl     = draftHero.banner;
      let fotoperfilUrl = draftHero.foto_perfil;
      if (draftHero._bannerFile) bannerUrl     = await subirImagen("banner",     draftHero._bannerFile);
      if (draftHero._fotoFile)   fotoperfilUrl = await subirImagen("foto_perfil", draftHero._fotoFile);

      const payload = { ...draftHero, banner: bannerUrl, foto_perfil: fotoperfilUrl };
      delete payload._bannerFile;
      delete payload._fotoFile;

      await putPerfil(payload);
      setPas(p => ({ ...p, ...payload }));

      if (payload.nombre) {
        const u = JSON.parse(localStorage.getItem("user") || "{}");
        u.nombre = payload.nombre;
        localStorage.setItem("user", JSON.stringify(u));
        window.dispatchEvent(new Event("storage"));
      }

      setEditHero(false);
      notify("Información principal actualizada ✓");
    } catch (e) { notify("Error: " + e.message); }
    finally { setSaving(false); }
  };

  /* ══ DISPONIBILIDAD ══ */
  const toggleDisponible = async () => {
    if (editHero) { setDraftHero(d => ({ ...d, disponible: !d.disponible })); return; }
    const nuevo = !pas.disponible;
    try {
      await fetch(`${API}/api/perfil-paseador/${usuarioId}/disponibilidad`, {
        method: "PATCH", headers: hdrs, body: JSON.stringify({ disponible: nuevo }),
      });
      setPas(p => ({ ...p, disponible: nuevo }));
    } catch { notify("Error al cambiar disponibilidad"); }
  };

  /* ══ DESCRIPCIÓN ══ */
  const abrirDesc   = () => { setDraftDesc(pas.descripcion || ""); setEditDesc(true); };
  const guardarDesc = async () => {
    setSaving(true);
    try { await putPerfil({ descripcion: draftDesc }); setPas(p => ({ ...p, descripcion: draftDesc })); setEditDesc(false); notify("Descripción actualizada ✓"); }
    catch (e) { notify("Error: " + e.message); }
    finally { setSaving(false); }
  };

  /* ══ SERVICIOS ══ */
  const syncServicios = async (lista) => {
    const payload = lista.map(({ nombre, precio, iconKey }) => ({ nombre, precio, iconKey: iconKey || "paseo" }));
    await fetch(`${API}/api/perfil-paseador/${usuarioId}/servicios`, { method: "PUT", headers: hdrs, body: JSON.stringify({ servicios: payload }) });
  };
  const abrirSrv      = i => { setDraftSrv({ nombre: pas.servicios[i].nombre, precio: pas.servicios[i].precio }); setEditServicio(i); };
  const guardarSrv    = async i => { const lista = pas.servicios.map((s, idx) => idx === i ? { ...s, ...draftSrv } : s); setPas(p => ({ ...p, servicios: lista })); setEditServicio(null); notify("Servicio actualizado ✓"); await syncServicios(lista); };
  const eliminarSrv   = async i => { const lista = pas.servicios.filter((_, idx) => idx !== i); setPas(p => ({ ...p, servicios: lista })); notify("Servicio eliminado ✓"); await syncServicios(lista); };
  const guardarNuevoSrv = async () => {
    if (!newSrv.nombre.trim()) return;
    const lista = [...pas.servicios, { icon: SrvIcons.paseo, iconKey: "paseo", ...newSrv }];
    setPas(p => ({ ...p, servicios: lista })); setNewSrv({ nombre: "", precio: "" }); setAddServicio(false); notify("Servicio agregado ✓");
    await syncServicios(lista);
  };

  /* ══ ZONAS ══ */
  const abrirZonas   = () => { setDraftZonas([...(pas.zonas || [])]); setEditZonas(true); };
  const guardarZonas = async () => {
    setSaving(true);
    try { await fetch(`${API}/api/perfil-paseador/${usuarioId}/zonas`, { method: "PUT", headers: hdrs, body: JSON.stringify({ zonas: draftZonas }) }); setPas(p => ({ ...p, zonas: draftZonas })); setEditZonas(false); notify("Zonas actualizadas ✓"); }
    catch { notify("Error al guardar zonas"); }
    finally { setSaving(false); }
  };
  const agregarZona  = () => { if (!newZona.trim() || draftZonas.includes(newZona.trim())) return; setDraftZonas(z => [...z, newZona.trim()]); setNewZona(""); };
  const eliminarZona = i => setDraftZonas(z => z.filter((_, idx) => idx !== i));

  /* ══ RAZAS ══ */
  const abrirRazas   = () => { setDraftRazas([...(pas.razas || [])]); setEditRazas(true); };
  const guardarRazas = async () => {
    setSaving(true);
    try { await fetch(`${API}/api/perfil-paseador/${usuarioId}/razas`, { method: "PUT", headers: hdrs, body: JSON.stringify({ razas: draftRazas }) }); setPas(p => ({ ...p, razas: draftRazas })); setEditRazas(false); notify("Razas actualizadas ✓"); }
    catch { notify("Error al guardar razas"); }
    finally { setSaving(false); }
  };
  const agregarRaza  = () => { if (!newRaza.trim() || draftRazas.includes(newRaza.trim())) return; setDraftRazas(r => [...r, newRaza.trim()]); setNewRaza(""); };
  const eliminarRaza = i => setDraftRazas(r => r.filter((_, idx) => idx !== i));

  if (cargando) return <div className="pp-loading"><div className="pp-spinner" /><span>Cargando perfil…</span></div>;
  if (!pas)     return <div className="pp-loading">No se encontró el perfil.</div>;

  const dispActual = editHero ? draftHero.disponible : pas.disponible;

  return (
    <div className="pp-page">

      {/* ══════ HERO ══════ */}
      <div className="pp-hero">
        <div className="pp-banner">
          <img src={
            (editHero && draftHero.banner)
              ? draftHero.banner
              : pas.banner
                ? (pas.banner.startsWith("/uploads/") ? `${API}${pas.banner}` : pas.banner)
                : "https://images.unsplash.com/photo-1601758124510-52d02ddb7cbd?w=1200&q=80"
          } alt="banner" />
          <div className="pp-banner-overlay" /><div className="pp-banner-brand" />
          {editHero && (
            <><button className="pp-banner-edit-btn" onClick={() => bannerRef.current.click()}><IcoCamera /> Cambiar portada</button>
            <input ref={bannerRef} type="file" accept="image/*" style={{ display:"none" }} onChange={handleBanner} /></>
          )}
        </div>

        <div className="pp-foto-wrap">
          <img className="pp-foto" src={
            (editHero && draftHero.foto_perfil)
              ? draftHero.foto_perfil
              : pas.foto_perfil
                ? (pas.foto_perfil.startsWith("/uploads/") ? `${API}${pas.foto_perfil}` : pas.foto_perfil)
                : "https://i.pravatar.cc/300?img=57"
          } alt={pas.nombre} />
          <span className={`pp-disponible-badge ${dispActual ? "on" : "off"}`} onClick={toggleDisponible} style={{ cursor:"pointer" }} title="Clic para cambiar">
            <span className="pp-badge-dot" />{dispActual ? "Disponible" : "Ocupado"}
          </span>
          {editHero && (
            <><button className="pp-foto-edit-btn" onClick={() => fotoRef.current.click()} title="Cambiar foto"><IcoCamera /></button>
            <input ref={fotoRef} type="file" accept="image/*" style={{ display:"none" }} onChange={handleFoto} /></>
          )}
        </div>

        <div className="pp-acciones">
          <EditBtn editando={editHero} onEdit={abrirHero} onSave={guardarHero} onCancel={() => setEditHero(false)} loading={saving} />
        </div>
      </div>

      {/* ══════ HEADER INFO ══════ */}
      <div className="pp-header-info">
        <div className="pp-header-left">
          {editHero ? (
            <div className="pp-hero-edit-form">
              <input className="pp-hero-input pp-hero-input-nombre" value={draftHero.nombre || ""} onChange={e => setDraftHero(d => ({ ...d, nombre: e.target.value }))} placeholder="Nombre completo" />
              <input className="pp-hero-input" value={draftHero.especialidad || ""} onChange={e => setDraftHero(d => ({ ...d, especialidad: e.target.value }))} placeholder="Especialidad / Título" />
              <div className="pp-hero-row">
                <input className="pp-hero-input" value={draftHero.ciudad || ""} onChange={e => setDraftHero(d => ({ ...d, ciudad: e.target.value }))} placeholder="Ciudad" />
                <input className="pp-hero-input" value={draftHero.estado || ""} onChange={e => setDraftHero(d => ({ ...d, estado: e.target.value }))} placeholder="Departamento" />
                <input className="pp-hero-input pp-hero-input-sm" type="number" min="1" value={draftHero.experiencia || ""} onChange={e => setDraftHero(d => ({ ...d, experiencia: Number(e.target.value) }))} placeholder="Años exp." />
                <input className="pp-hero-input pp-hero-input-sm" type="number" min="1" value={draftHero.mascotas_max || ""} onChange={e => setDraftHero(d => ({ ...d, mascotas_max: Number(e.target.value) }))} placeholder="Máx. mascotas" />
              </div>
            </div>
          ) : (
            <>
              <h1 className="pp-nombre">{pas.nombre}</h1>
              <p className="pp-especialidad">{pas.especialidad}</p>
              <div className="pp-meta-row">
                <span className="pp-meta-item"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>{pas.ciudad}{pas.estado ? `, ${pas.estado}` : ""}</span>
                <span className="pp-meta-item"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>{pas.experiencia} años de experiencia</span>
                <span className="pp-meta-item"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="4" r="2"/><circle cx="18" cy="8" r="2"/><path d="M9.27 7.26 4 17m11-6-2.15 5.4M4 17h16m-5 0 3-6 3.27 3.27"/></svg>Máx. {pas.mascotas_max} mascotas por paseo</span>
              </div>
            </>
          )}
        </div>
        <div className="pp-rating-box">
          <span className="pp-rating-num">{pas.promedio_estrellas ? Number(pas.promedio_estrellas).toFixed(1) : "0.0"}</span>
          <Estrellas valor={pas.promedio_estrellas || 0} size={17} />
          <span className="pp-rating-count">{pas.total_resenas || 0} reseñas</span>
        </div>
      </div>

      {/* ══════ TABS ══════ */}
      <div className="pp-tabs">
        {[
          { key: "info",      label: "Información" },
          { key: "servicios", label: "Servicios"   },
          { key: "resenas",   label: `Reseñas (${pas.total_resenas || 0})` },
        ].map(t => (
          <button key={t.key} className={`pp-tab ${tab === t.key ? "activa" : ""}`} onClick={() => setTab(t.key)}>{t.label}</button>
        ))}
      </div>

      {/* ══════ BODY ══════ */}
      <div className="pp-body">

        {tab === "info" && (
          <div className="pp-tab-info">
            <div className="pp-card">
              <div className="pp-card-header">
                <h3 className="pp-card-title"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>Sobre mí</h3>
                <EditBtn editando={editDesc} onEdit={abrirDesc} onSave={guardarDesc} onCancel={() => setEditDesc(false)} loading={saving} />
              </div>
              {editDesc
                ? <textarea className="pp-desc-textarea" value={draftDesc} onChange={e => setDraftDesc(e.target.value)} rows={5} />
                : <p className="pp-desc">{pas.descripcion || "Sin descripción aún."}</p>
              }
            </div>

            <div className="pp-stats-grid">
              {[
                { num: pas.experiencia || 0,                           label: "Años de experiencia"   },
                { num: pas.total_resenas || 0,                         label: "Reseñas recibidas"     },
                { num: Number(pas.promedio_estrellas || 0).toFixed(1), label: "Calificación promedio" },
                { num: pas.mascotas_max || 0,                          label: "Mascotas por paseo"    },
              ].map((s, i) => (
                <div className="pp-stat" key={i}>
                  <span className="pp-stat-num">{s.num}</span>
                  <span className="pp-stat-label">{s.label}</span>
                </div>
              ))}
            </div>

            <div className="pp-card">
              <div className="pp-card-header">
                <h3 className="pp-card-title"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>Zonas de cobertura</h3>
                <EditBtn editando={editZonas} onEdit={abrirZonas} onSave={guardarZonas} onCancel={() => setEditZonas(false)} loading={saving} />
              </div>
              {editZonas ? (
                <div className="pp-zonas-edit">
                  <div className="pp-zonas-chips">
                    {draftZonas.map((z, i) => (
                      <span className="pp-zona-chip editable" key={i}>{z}
                        <button className="pp-zona-x" onClick={() => eliminarZona(i)}><IcoX /></button>
                      </span>
                    ))}
                  </div>
                  <div className="pp-zona-add-row">
                    <input className="pp-srv-input" placeholder="Agregar zona (ej: El Poblado)" value={newZona} onChange={e => setNewZona(e.target.value)} onKeyDown={e => e.key === "Enter" && agregarZona()} />
                    <button className="pp-btn-add-zona" onClick={agregarZona}><IcoPlus /> Agregar</button>
                  </div>
                </div>
              ) : (
                <div className="pp-zonas-chips">
                  {(pas.zonas || []).length > 0
                    ? (pas.zonas || []).map((z, i) => <span className="pp-zona-chip" key={i}>{z}</span>)
                    : <em className="pp-empty">Sin zonas registradas</em>
                  }
                </div>
              )}
            </div>

            <div className="pp-card">
              <div className="pp-card-header">
                <h3 className="pp-card-title"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="4" r="2"/><circle cx="18" cy="8" r="2"/><path d="M9.27 7.26 4 17m11-6-2.15 5.4M4 17h16m-5 0 3-6 3.27 3.27"/></svg>Razas aceptadas</h3>
                <EditBtn editando={editRazas} onEdit={abrirRazas} onSave={guardarRazas} onCancel={() => setEditRazas(false)} loading={saving} />
              </div>
              {editRazas ? (
                <div className="pp-zonas-edit">
                  <div className="pp-zonas-chips">
                    {draftRazas.map((r, i) => (
                      <span className="pp-zona-chip raza editable" key={i}>{r}
                        <button className="pp-zona-x raza-x" onClick={() => eliminarRaza(i)}><IcoX /></button>
                      </span>
                    ))}
                  </div>
                  <div className="pp-zona-add-row">
                    <input className="pp-srv-input" placeholder="Agregar raza (ej: Golden Retriever)" value={newRaza} onChange={e => setNewRaza(e.target.value)} onKeyDown={e => e.key === "Enter" && agregarRaza()} />
                    <button className="pp-btn-add-raza" onClick={agregarRaza}><IcoPlus /> Agregar</button>
                  </div>
                </div>
              ) : (
                <div className="pp-zonas-chips">
                  {(pas.razas || []).length > 0
                    ? (pas.razas || []).map((r, i) => <span className="pp-zona-chip raza" key={i}>{r}</span>)
                    : <em className="pp-empty">Sin razas registradas</em>
                  }
                </div>
              )}
            </div>
          </div>
        )}

        {tab === "servicios" && (
          <div className="pp-tab-servicios">
            <div className="pp-servicios-header">
              <div>
                <h3 className="pp-section-title">Servicios disponibles</h3>
                <p className="pp-section-sub">Edita, elimina o agrega los servicios que ofreces.</p>
              </div>
              <button className="pp-btn-add-srv" onClick={() => setAddServicio(true)}><IcoPlus /> Agregar servicio</button>
            </div>
            {addServicio && (
              <div className="pp-add-srv-form">
                <input className="pp-srv-input" placeholder="Nombre del servicio" value={newSrv.nombre} onChange={e => setNewSrv(s => ({ ...s, nombre: e.target.value }))} />
                <input className="pp-srv-input" placeholder="Precio (ej: Desde $15.000)" value={newSrv.precio} onChange={e => setNewSrv(s => ({ ...s, precio: e.target.value }))} />
                <div className="pp-add-srv-btns">
                  <button className="pp-edit-save" onClick={guardarNuevoSrv}><IcoSave /> Guardar</button>
                  <button className="pp-edit-cancel" onClick={() => setAddServicio(false)}><IcoCancel /> Cancelar</button>
                </div>
              </div>
            )}
            <div className="pp-servicios-grid">
              {(pas.servicios || []).map((srv, i) => (
                <div className="pp-srv-card" key={i}>
                  <div className="pp-srv-accent" />
                  <div className="pp-srv-icon-wrap">{srv.icon}</div>
                  {editServicio === i ? (
                    <div className="pp-srv-edit-form">
                      <input className="pp-srv-input" value={draftSrv.nombre} onChange={e => setDraftSrv(d => ({ ...d, nombre: e.target.value }))} placeholder="Nombre" />
                      <input className="pp-srv-input" value={draftSrv.precio} onChange={e => setDraftSrv(d => ({ ...d, precio: e.target.value }))} placeholder="Precio" />
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

        {tab === "resenas" && (
          <div className="pp-tab-resenas">
            {cargandoResenas ? (
              <div className="pp-loading" style={{ padding: "20px" }}><div className="pp-spinner" /><span>Cargando reseñas…</span></div>
            ) : (
              <ListaResenas resenas={resenas} nombreProveedor={pas.nombre} rol="paseador" />
            )}
          </div>
        )}
      </div>

      <Toast msg={toast} />
    </div>
  );
}