import { useState } from "react";
import "./MenuPaseador.css";
import logoNavbar from "../../../assets/menus/logonavbar.png";

export default function MenuPaseador({ children }) {
  const [activeItem, setActiveItem] = useState("inicio");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [search, setSearch] = useState("");

  const navItems = [
    {
      key: "inicio", label: "Inicio",
      icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
    },
    {
      key: "perfil", label: "Mi Perfil", tag: "Comercial",
      icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
    },
    {
      key: "reservas", label: "Reservas", badge: 5,
      icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
    },
    {
      key: "mensajes", label: "Mensajes", badge: 2,
      icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>,
    },
    {
      key: "configuracion", label: "Configuración",
      icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>,
    },
  ];

  return (
    <div className="mp-layout">

      <aside className={`mp-sidebar ${sidebarOpen ? "" : "collapsed"}`}>

        <div className="mp-logo">
          <img src={logoNavbar} alt="AllyPet" className={sidebarOpen ? "mp-logo-img" : "mp-logo-img-small"} />
        </div>

        <div className="mp-profile">
          <div className="mp-avatar-wrap">
            <img className="mp-avatar" src="https://i.pravatar.cc/80?img=12" alt="Carlos" />
            <span className="mp-avatar-dot" />
          </div>
          {sidebarOpen && (
            <div className="mp-profile-info">
              <span className="mp-profile-name">Carlos Ruiz</span>
              <span className="mp-profile-role">Paseador</span>
            </div>
          )}
        </div>

        {sidebarOpen && <span className="mp-nav-section-label">NAVEGACIÓN</span>}

        <nav className="mp-nav">
          {navItems.map((item) => (
            <button
              key={item.key}
              className={`mp-nav-item ${activeItem === item.key ? "active" : ""}`}
              onClick={() => setActiveItem(item.key)}
            >
              <span className="mp-nav-icon">{item.icon}</span>
              {sidebarOpen && (
                <>
                  <span className="mp-nav-label">{item.label}</span>
                  {item.badge && <span className="mp-badge">{item.badge}</span>}
                  {item.tag  && <span className="mp-tag">{item.tag}</span>}
                </>
              )}
            </button>
          ))}
        </nav>

        <div className="mp-sidebar-footer">
          <button className="mp-logout">
            <span className="mp-nav-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                <polyline points="16 17 21 12 16 7"/>
                <line x1="21" y1="12" x2="9" y2="12"/>
              </svg>
            </span>
            {sidebarOpen && <span className="mp-nav-label">Cerrar Sesión</span>}
          </button>
        </div>
      </aside>

      <div className="mp-main">
        <header className="mp-navbar">
          <div className="mp-navbar-left">
            <button className="mp-toggle" onClick={() => setSidebarOpen(!sidebarOpen)}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
              </svg>
            </button>
            <div className="mp-searchbar">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
              <input
                type="text"
                placeholder="Buscar solicitudes, clientes, zonas..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
          <div className="mp-navbar-right">
            <div className="mp-status-pill">
              <span className="mp-status-dot" />
              Disponible
            </div>
            <button className="mp-bell">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
              </svg>
              <span className="mp-bell-dot" />
            </button>
            <div className="mp-user-chip">
              <img src="https://i.pravatar.cc/80?img=12" alt="Carlos" />
              <span>Carlos R.</span>
            </div>
          </div>
        </header>

        <main className="mp-content">{children}</main>
      </div>
    </div>
  );
}