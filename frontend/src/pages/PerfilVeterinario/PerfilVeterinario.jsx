import { useState } from "react";
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

const VET = {
  nombre: "Dra. Ana Mora",
  especialidad: "Medicina Veterinaria General",
  foto: "https://i.pravatar.cc/300?img=51",
  banner: "https://images.unsplash.com/photo-1628009368231-7bb7cfcb0def?w=1200&q=80",
  ciudad: "Cali",
  estado: "Valle del Cauca",
  disponible: true,
  calificacion: 4.8,
  totalResenas: 124,
  experiencia: 9,
  descripcion:
    "Soy veterinaria con más de 9 años de experiencia en medicina de pequeños animales. Me especializo en prevención, diagnóstico y tratamiento de perros y gatos. Mi prioridad es el bienestar de tu mascota y brindarte información clara en cada consulta.",
  servicios: [
    { icon: SrvIcons.consulta,    nombre: "Consulta General",  precio: "Desde $40.000" },
    { icon: SrvIcons.vacuna,      nombre: "Vacunación",         precio: "Desde $25.000" },
    { icon: SrvIcons.parasito,    nombre: "Desparasitación",    precio: "Desde $20.000" },
    { icon: SrvIcons.peluqueria,  nombre: "Peluquería",         precio: "Desde $35.000" },
    { icon: SrvIcons.dental,      nombre: "Limpieza Dental",    precio: "Desde $60.000" },
    { icon: SrvIcons.laboratorio, nombre: "Laboratorio",        precio: "Desde $45.000" },
  ],
  resenas: [
    { id: 1, cliente: "Valentina Ríos",    avatar: "https://i.pravatar.cc/60?img=5",  fecha: "15 mar 2025", estrellas: 5, comentario: "Excelente atención. La Dra. Mora explicó todo con paciencia y mi perro quedó muy bien. Super recomendada." },
    { id: 2, cliente: "Mateo Gómez",       avatar: "https://i.pravatar.cc/60?img=11", fecha: "2 feb 2025",  estrellas: 5, comentario: "Llevé a mi gata por una consulta de urgencia y me atendieron rápido. Muy profesional y amable." },
    { id: 3, cliente: "Camila Herrera",    avatar: "https://i.pravatar.cc/60?img=9",  fecha: "18 ene 2025", estrellas: 4, comentario: "Buen servicio, instalaciones limpias. El precio es justo para la calidad que ofrecen." },
    { id: 4, cliente: "Sebastián Torres",  avatar: "https://i.pravatar.cc/60?img=15", fecha: "5 ene 2025",  estrellas: 5, comentario: "Mi mascota siempre sale contenta de las consultas. La doctora tiene mucha paciencia con los animales." },
  ],
};

function Estrellas({ valor, size = 15 }) {
  return (
    <span className="pv-stars" style={{ fontSize: size }}>
      {[1,2,3,4,5].map((i) => (
        <span key={i} className={i <= Math.round(valor) ? "star on" : "star"}>★</span>
      ))}
    </span>
  );
}

export default function PerfilVeterinario() {
  const [favorito, setFavorito]   = useState(false);
  const [contactado, setContactado] = useState(false);
  const [tab, setTab]             = useState("info");

  return (
    <div className="pv-page">

      {/* ══════ HERO ══════ */}
      <div className="pv-hero">

        {/* Banner con overlay de marca */}
        <div className="pv-banner">
          <img src={VET.banner} alt="banner" />
          <div className="pv-banner-overlay" />
          {/* Degradado de marca en la parte inferior del banner */}
          <div className="pv-banner-brand" />
        </div>

        {/* Foto */}
        <div className="pv-foto-wrap">
          <img className="pv-foto" src={VET.foto} alt={VET.nombre} />
          <span className={`pv-disponible-badge ${VET.disponible ? "on" : "off"}`}>
            <span className="pv-badge-dot" />
            {VET.disponible ? "Disponible" : "Ocupado"}
          </span>
        </div>

        {/* Acciones */}
        <div className="pv-acciones">
          <button
            className={`pv-btn-fav ${favorito ? "on" : ""}`}
            onClick={() => setFavorito(!favorito)}
          >
            <svg width="16" height="16" viewBox="0 0 24 24"
              fill={favorito ? "currentColor" : "none"}
              stroke="currentColor" strokeWidth="2"
              strokeLinecap="round" strokeLinejoin="round">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
            </svg>
            {favorito ? "Guardado" : "Guardar"}
          </button>

          <button
            className={`pv-btn-contactar ${contactado ? "ok" : ""}`}
            onClick={() => setContactado(true)}
          >
            {contactado ? (
              <>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
                Mensaje enviado
              </>
            ) : (
              <>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                </svg>
                Contactar
              </>
            )}
          </button>
        </div>
      </div>

      {/* ══════ HEADER INFO ══════ */}
      <div className="pv-header-info">
        <div className="pv-header-left">
          <h1 className="pv-nombre">{VET.nombre}</h1>
          <p className="pv-especialidad">{VET.especialidad}</p>
          <div className="pv-meta-row">
            <span className="pv-meta-item">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
              </svg>
              {VET.ciudad}, {VET.estado}
            </span>
            <span className="pv-meta-item">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
              </svg>
              {VET.experiencia} años de experiencia
            </span>
          </div>
        </div>

        <div className="pv-rating-box">
          <span className="pv-rating-num">{VET.calificacion}</span>
          <Estrellas valor={VET.calificacion} size={17} />
          <span className="pv-rating-count">{VET.totalResenas} reseñas</span>
        </div>
      </div>

      {/* ══════ TABS ══════ */}
      <div className="pv-tabs">
        {[
          { key: "info",      label: "Información" },
          { key: "servicios", label: "Servicios"   },
          { key: "resenas",   label: `Reseñas (${VET.resenas.length})` },
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

      {/* ══════ CONTENIDO ══════ */}
      <div className="pv-body">

        {/* INFO */}
        {tab === "info" && (
          <div className="pv-tab-info">
            <div className="pv-card">
              <h3 className="pv-card-title">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                Sobre mí
              </h3>
              <p className="pv-desc">{VET.descripcion}</p>
            </div>

            <div className="pv-stats-grid">
              {[
                { num: VET.experiencia,    label: "Años de experiencia"  },
                { num: VET.totalResenas,   label: "Reseñas recibidas"    },
                { num: VET.calificacion,   label: "Calificación promedio"},
                { num: VET.servicios.length, label: "Servicios ofrecidos"},
              ].map((s, i) => (
                <div className="pv-stat" key={i}>
                  <span className="pv-stat-num">{s.num}</span>
                  <span className="pv-stat-label">{s.label}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SERVICIOS */}
        {tab === "servicios" && (
          <div className="pv-tab-servicios">
            <div className="pv-servicios-header">
              <h3 className="pv-section-title">Servicios disponibles</h3>
              <p className="pv-section-sub">Contáctame para agendar una cita o consultar disponibilidad.</p>
            </div>
            <div className="pv-servicios-grid">
              {VET.servicios.map((srv, i) => (
                <div className="pv-srv-card" key={i}>
                  {/* Acento izquierdo de marca */}
                  <div className="pv-srv-accent" />
                  <div className="pv-srv-icon-wrap">
                    {srv.icon}
                  </div>
                  <div className="pv-srv-info">
                    <span className="pv-srv-nombre">{srv.nombre}</span>
                    <span className="pv-srv-precio">{srv.precio}</span>
                  </div>
                  <button className="pv-srv-btn" onClick={() => setContactado(true)}>
                    Agendar
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* RESEÑAS */}
        {tab === "resenas" && (
          <div className="pv-tab-resenas">
            <div className="pv-rating-summary">
              <div className="pv-rating-big">
                <span className="pv-rating-big-num">{VET.calificacion}</span>
                <Estrellas valor={VET.calificacion} size={20} />
                <span className="pv-rating-big-sub">{VET.totalResenas} reseñas</span>
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
              {VET.resenas.map((r) => (
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
    </div>
  );
}