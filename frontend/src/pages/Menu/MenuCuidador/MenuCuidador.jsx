import { useState, useEffect } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import "./MenuCuidador.css";
import logoNavbar    from "../../../assets/menus/logonavbar.png";
import avatarDefault from "../../../assets/menus/menudefault.png";
import { useCurrentUser } from "../../../hooks/useCurrentUser";

import { getUnreadCount as getUnreadMessages }      from "../../../services/message.service";
import { getUnreadCount as getUnreadNotifications } from "../../../services/notification.service";

export default function MenuCuidador() {
  const navigate = useNavigate();
  const location = useLocation();

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { user }                      = useCurrentUser();

  const [mensajesSinLeer,       setMensajesSinLeer]       = useState(0);
  const [notificacionesSinLeer, setNotificacionesSinLeer] = useState(0);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    const fetchBadges = async () => {
      try {
        const [msgs, notifs] = await Promise.all([
          getUnreadMessages(),
          getUnreadNotifications(),
        ]);
        setMensajesSinLeer(msgs);
        setNotificacionesSinLeer(notifs);
      } catch { /* silencioso */ }
    };

    fetchBadges();
    const interval = setInterval(fetchBadges, 30000);
    return () => clearInterval(interval);
  }, []);

  const getActive = () => {
    const path = location.pathname;
    if (path.includes("/perfil"))         return "perfil";
    if (path.includes("/solicitudes"))    return "solicitudes";
    if (path.includes("/mensajes"))       return "mensajes";
    if (path.includes("/notificaciones")) return "notificaciones";
    if (path.includes("/configuracion"))  return "configuracion";
    return "inicio";
  };
  const activeItem = getActive();

  const navItems = [
    {
      key: "inicio",
      label: "Inicio",
      path: "/menu/cuidador",
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
          <polyline points="9 22 9 12 15 12 15 22"/>
        </svg>
      ),
    },
    {
      key: "perfil",
      label: "Mi Perfil",
      path: "/menu/cuidador/perfil",
      tag: "Comercial",
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
          <circle cx="12" cy="7" r="4"/>
        </svg>
      ),
    },
    {
      key: "solicitudes",
      label: "Solicitudes",
      path: "/menu/cuidador/solicitudes",
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
          <polyline points="14 2 14 8 20 8"/>
          <line x1="16" y1="13" x2="8" y2="13"/>
          <line x1="16" y1="17" x2="8" y2="17"/>
          <polyline points="10 9 9 9 8 9"/>
        </svg>
      ),
    },
    {
      key: "mensajes",
      label: "Mensajes",
      path: "/menu/cuidador/mensajes",
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
        </svg>
      ),
    },
    {
      key: "notificaciones",
      label: "Notificaciones",
      path: "/menu/cuidador/notificaciones",
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
          <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
        </svg>
      ),
    },
    {
      key: "configuracion",
      label: "Configuración",
      path: "/menu/cuidador/configuracion",
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="3"/>
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
        </svg>
      ),
    },
  ];

  const getBadgeCount = (key) => {
    if (key === "mensajes")       return mensajesSinLeer;
    if (key === "notificaciones") return notificacionesSinLeer;
    return 0;
  };

  return (
    <div className="mc-layout">
      <aside className={`mc-sidebar ${sidebarOpen ? "" : "collapsed"}`}>
        <div className="mc-logo">
          <img
            src={logoNavbar}
            alt="AllyPet"
            className={sidebarOpen ? "mc-logo-img" : "mc-logo-img-small"}
          />
        </div>

        <div className="mc-profile">
          <div className="mc-avatar-wrap">
            <img
              className="mc-avatar"
              src={user?.foto_perfil ? `http://localhost:3004${user.foto_perfil}` : avatarDefault}
              alt="avatar"
            />
            <span className="mc-avatar-dot" />
          </div>
          {sidebarOpen && (
            <div className="mc-profile-info">
              <span className="mc-profile-name">{user?.nombre || "Usuario"}</span>
              <span className="mc-profile-role">Cuidador</span>
            </div>
          )}
        </div>

        {sidebarOpen && <span className="mc-nav-section-label">NAVEGACIÓN</span>}

        <nav className="mc-nav">
          {navItems.map((item) => {
            const dynamicBadge = getBadgeCount(item.key);
            return (
              <button
                key={item.key}
                className={`mc-nav-item ${activeItem === item.key ? "active" : ""}`}
                onClick={() => navigate(item.path)}
              >
                <span className="mc-nav-icon" style={{ position: "relative" }}>
                  {item.icon}
                  {!sidebarOpen && dynamicBadge > 0 && (
                    <span className="mc-badge-dot" />
                  )}
                </span>
                {sidebarOpen && (
                  <>
                    <span className="mc-nav-label">{item.label}</span>
                    {dynamicBadge > 0 && (
                      <span className="mc-badge">{dynamicBadge}</span>
                    )}
                    {item.tag && <span className="mc-tag">{item.tag}</span>}
                  </>
                )}
              </button>
            );
          })}
        </nav>

        <div className="mc-sidebar-footer">
          <button
            className="mc-logout"
            onClick={() => {
              localStorage.removeItem("token");
              localStorage.removeItem("user");
              navigate("/login");
            }}
          >
            <span className="mc-nav-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                <polyline points="16 17 21 12 16 7"/>
                <line x1="21" y1="12" x2="9" y2="12"/>
              </svg>
            </span>
            {sidebarOpen && <span className="mc-nav-label">Cerrar Sesión</span>}
          </button>
        </div>
      </aside>

      <div className="mc-main">
        <header className="mc-navbar">
          <div className="mc-navbar-left">
            <button className="mc-toggle" onClick={() => setSidebarOpen(!sidebarOpen)}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="3" y1="6"  x2="21" y2="6" />
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            </button>
            <div className="mc-searchbar">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"/>
                <line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
              <input type="text" placeholder="Buscar solicitudes, dueños..." />
            </div>
          </div>

          <div className="mc-navbar-right">
            <button
              className="mc-bell"
              onClick={() => navigate("/menu/cuidador/notificaciones")}
              title="Notificaciones"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
              </svg>
              {notificacionesSinLeer > 0 && (
                <span className="mc-bell-count">{notificacionesSinLeer}</span>
              )}
            </button>

            <div className="mc-user-chip" onClick={() => navigate("/profile")}>
              <img
                src={user?.foto_perfil ? `http://localhost:3004${user.foto_perfil}` : avatarDefault}
                alt="avatar"
              />
              <span>{user?.nombre || "Usuario"}</span>
            </div>
          </div>
        </header>

        <main className="mc-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}