import { useState } from "react";
import "./MenuDueno.css";
import logoNavbar from "../../../assets/menus/logonavbar.png";

export default function MenuDueno({ children }) {
  const [activeItem, setActiveItem] = useState("inicio");
  const [serviciosOpen, setServiciosOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [search, setSearch] = useState("");

  const navItems = [
    {
      key: "inicio", label: "Inicio",
      icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
    },
    {
      key: "mascotas", label: "Mascotas",
      icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="4" r="2"/><circle cx="18" cy="8" r="2"/><circle cx="20" cy="16" r="2"/><circle cx="4" cy="8" r="2"/><path d="M12 18c-3 0-6-2-6-5 0-1 .5-2 1.5-3L12 6l4.5 4c1 1 1.5 2 1.5 3 0 3-3 5-6 5z"/></svg>,
    },
    {
      key: "servicios", label: "Servicios", hasChildren: true,
      icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/></svg>,
    },
    {
      key: "reservas", label: "Reservas",
      icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
    },
    {
      key: "mensajes", label: "Mensajes", badge: 3,
      icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>,
    },
    {
      key: "configuracion", label: "Configuración",
      icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>,
    },
  ];

  const subServicios = [
    { key: "veterinario", label: "Veterinario" },
    { key: "paseador",    label: "Paseador"    },
    { key: "cuidador",    label: "Cuidador"    },
  ];

  const isServicioActive =
    activeItem === "servicios" || subServicios.some((s) => s.key === activeItem);

  return (
    <div className="md-layout">

      {/* ══════════ SIDEBAR ══════════ */}
      <aside className={`md-sidebar ${sidebarOpen ? "" : "collapsed"}`}>

        {/* Logo */}
        <div className="md-logo">
          <img
            src={logoNavbar}
            alt="AllyPet"
            className={sidebarOpen ? "md-logo-img" : "md-logo-img-small"}
          />
        </div>

        {/* Perfil */}
        <div className="md-profile">
          <div className="md-avatar-wrap">
            <img className="md-avatar" src="https://i.pravatar.cc/80?img=47" alt="Luisa" />
            <span className="md-avatar-dot" />
          </div>
          {sidebarOpen && (
            <div className="md-profile-info">
              <span className="md-profile-name">Luisa Martínez</span>
              <span className="md-profile-role">Dueño de mascota</span>
            </div>
          )}
        </div>

        {sidebarOpen && <span className="md-nav-section-label">NAVEGACIÓN</span>}

        {/* Nav */}
        <nav className="md-nav">
          {navItems.map((item) => (
            <div key={item.key}>
              <button
                className={`md-nav-item ${
                  item.key === "servicios"
                    ? isServicioActive ? "active" : ""
                    : activeItem === item.key ? "active" : ""
                }`}
                onClick={() => {
                  if (item.hasChildren) {
                    setServiciosOpen(!serviciosOpen);
                    setActiveItem("servicios");
                  } else {
                    setActiveItem(item.key);
                    setServiciosOpen(false);
                  }
                }}
              >
                <span className="md-nav-icon">{item.icon}</span>
                {sidebarOpen && (
                  <>
                    <span className="md-nav-label">{item.label}</span>
                    {item.badge && <span className="md-badge">{item.badge}</span>}
                    {item.hasChildren && (
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                        style={{ transform: serviciosOpen ? "rotate(180deg)" : "rotate(0deg)", transition: "transform .25s" }}>
                        <polyline points="6 9 12 15 18 9"/>
                      </svg>
                    )}
                  </>
                )}
              </button>

              {item.hasChildren && serviciosOpen && sidebarOpen && (
                <div className="md-submenu">
                  {subServicios.map((sub) => (
                    <button
                      key={sub.key}
                      className={`md-sub-item ${activeItem === sub.key ? "active" : ""}`}
                      onClick={() => setActiveItem(sub.key)}
                    >
                      <span className="md-sub-dot" />
                      {sub.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>

        {/* Footer sidebar */}
        <div className="md-sidebar-footer">
          <button className="md-logout">
            <span className="md-nav-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                <polyline points="16 17 21 12 16 7"/>
                <line x1="21" y1="12" x2="9" y2="12"/>
              </svg>
            </span>
            {sidebarOpen && <span className="md-nav-label">Cerrar Sesión</span>}
          </button>
        </div>
      </aside>

      {/* ══════════ MAIN ══════════ */}
      <div className="md-main">

        {/* Navbar */}
        <header className="md-navbar">
          <div className="md-navbar-left">
            <button className="md-toggle" onClick={() => setSidebarOpen(!sidebarOpen)}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="3" y1="6" x2="21" y2="6"/>
                <line x1="3" y1="12" x2="21" y2="12"/>
                <line x1="3" y1="18" x2="21" y2="18"/>
              </svg>
            </button>
            <div className="md-searchbar">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"/>
                <line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
              <input
                type="text"
                placeholder="Buscar veterinarios, paseadores, cuidadores..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
          <div className="md-navbar-right">
            <button className="md-bell">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
              </svg>
              <span className="md-bell-dot" />
            </button>
            <div className="md-user-chip">
              <img src="https://i.pravatar.cc/80?img=47" alt="Luisa" />
              <span>Luisa M.</span>
            </div>
          </div>
        </header>

        <main className="md-content">
          {children}
        </main>
      </div>
    </div>
  );
}