import { useState, useEffect } from "react";
import "./MenuVeterinario.css";
import logoNavbar from "../../../assets/menus/logonavbar.png";
import avatarDefault from "../../../assets/menus/menudefault.png";

export default function MenuVeterinario({ children }) {
  const [activeItem, setActiveItem] = useState("inicio");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [search, setSearch] = useState("");
  const [user, setUser] = useState(null);

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) setUser(JSON.parse(userData));
  }, []);

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
      key: "citas", label: "Citas", badge: 4,
      icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
    },
    {
      key: "mensajes", label: "Mensajes", badge: 1,
      icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>,
    },
    {
      key: "configuracion", label: "Configuración",
      icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>,
    },
  ];

  return (
    <div className="mv-layout">

      <aside className={`mv-sidebar ${sidebarOpen ? "" : "collapsed"}`}>

        <div className="mv-logo">
          <img src={logoNavbar} alt="AllyPet" className={sidebarOpen ? "mv-logo-img" : "mv-logo-img-small"} />
        </div>

        <div className="mv-profile">
          <div className="mv-avatar-wrap">
            <img className="mv-avatar" src={avatarDefault} alt="avatar" />
            <span className="mv-avatar-dot" />
          </div>
          {sidebarOpen && (
            <div className="mv-profile-info">
              <span className="mv-profile-name">{user?.nombre || "Usuario"}</span>
              <span className="mv-profile-role">Veterinario</span>
            </div>
          )}
        </div>

        {sidebarOpen && <span className="mv-nav-section-label">NAVEGACIÓN</span>}

        <nav className="mv-nav">
          {navItems.map((item) => (
            <button
              key={item.key}
              className={`mv-nav-item ${activeItem === item.key ? "active" : ""}`}
              onClick={() => setActiveItem(item.key)}
            >
              <span className="mv-nav-icon">{item.icon}</span>
              {sidebarOpen && (
                <>
                  <span className="mv-nav-label">{item.label}</span>
                  {item.badge && <span className="mv-badge">{item.badge}</span>}
                  {item.tag   && <span className="mv-tag">{item.tag}</span>}
                </>
              )}
            </button>
          ))}
        </nav>

        <div className="mv-sidebar-footer">
          <button
            className="mv-logout"
            onClick={() => {
              localStorage.removeItem("token");
              localStorage.removeItem("user");
              window.location.href = "/login";
            }}
          >
            <span className="mv-nav-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                <polyline points="16 17 21 12 16 7"/>
                <line x1="21" y1="12" x2="9" y2="12"/>
              </svg>
            </span>
            {sidebarOpen && <span className="mv-nav-label">Cerrar Sesión</span>}
          </button>
        </div>
      </aside>

      <div className="mv-main">
        <header className="mv-navbar">
          <div className="mv-navbar-left">
            <button className="mv-toggle" onClick={() => setSidebarOpen(!sidebarOpen)}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="3" y1="6" x2="21" y2="6"/>
                <line x1="3" y1="12" x2="21" y2="12"/>
                <line x1="3" y1="18" x2="21" y2="18"/>
              </svg>
            </button>
            <div className="mv-searchbar">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"/>
                <line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
              <input
                type="text"
                placeholder="Buscar pacientes, citas, historial médico..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          <div className="mv-navbar-right">
            <div className="mv-status-pill">
              <span className="mv-status-dot" />
              Consultorio Abierto
            </div>
            <button className="mv-bell">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
              </svg>
              <span className="mv-bell-dot" />
            </button>
            <div className="mv-user-chip">
              <img src={avatarDefault} alt="avatar" />
              <span>{user?.nombre || "Usuario"}</span>
            </div>
          </div>
        </header>

        <main className="mv-content">{children}</main>
      </div>
    </div>
  );
}