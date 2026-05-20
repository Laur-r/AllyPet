import { useState, useEffect } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import "./MenuPaseador.css";

import logoNavbar from "../../../assets/menus/logonavbar.png";
import avatarDefault from "../../../assets/menus/menudefault.png";

import { useCurrentUser } from "../../../hooks/useCurrentUser";

import { getUnreadCount as getUnreadMessages } from "../../../services/message.service";
import { getUnreadCount as getUnreadNotifications } from "../../../services/notification.service";

export default function MenuPaseador() {

  const navigate = useNavigate();
  const location = useLocation();

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [search, setSearch] = useState("");

  const { user } = useCurrentUser();

  const [mensajesSinLeer, setMensajesSinLeer] = useState(0);
  const [notificacionesSinLeer, setNotificacionesSinLeer] = useState(0);

  // ─────────────────────────────────────────────
  // POLLING BADGES
  // ─────────────────────────────────────────────

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

      } catch {
        // silencioso
      }
    };

    fetchBadges();

    const interval = setInterval(fetchBadges, 30000);

    return () => clearInterval(interval);

  }, []);

  // ─────────────────────────────────────────────
  // ACTIVE MENU
  // ─────────────────────────────────────────────

  const getActive = () => {

    const path = location.pathname;

    if (path.includes("/perfil"))         return "perfil";
    if (path.includes("/solicitudes"))    return "solicitudes";
    if (path.includes("/historial"))      return "historial";
    if (path.includes("/reservas"))       return "reservas";
    if (path.includes("/pagos"))          return "pagos";
    if (path.includes("/mensajes"))       return "mensajes";
    if (path.includes("/notificaciones")) return "notificaciones";
    if (path.includes("/configuracion"))  return "configuracion";

    return "inicio";
  };

  const activeItem = getActive();

  // ─────────────────────────────────────────────
  // NAV ITEMS
  // ─────────────────────────────────────────────

  const navItems = [

    {
      key: "inicio",
      label: "Inicio",
      path: "/menu/paseador",

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
      path: "/menu/paseador/perfil",
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
      path: "/menu/paseador/solicitudes",

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
      key: "historial",
      label: "Historial",
      path: "/menu/paseador/historial",

      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
          <polyline points="14 2 14 8 20 8"/>
          <line x1="16" y1="13" x2="8" y2="13"/>
          <line x1="16" y1="17" x2="8" y2="17"/>
        </svg>
      ),
    },

    {
      key: "reservas",
      label: "Reservas",
      path: "/menu/paseador/reservas",
      badge: 5,

      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="4" width="18" height="18" rx="2"/>
          <line x1="16" y1="2" x2="16" y2="6"/>
          <line x1="8" y1="2" x2="8" y2="6"/>
          <line x1="3" y1="10" x2="21" y2="10"/>
        </svg>
      ),
    },

    // ─────────────────────────────────────────────
    // PAGOS
    // ─────────────────────────────────────────────

    {
      key: "pagos",
      label: "Pagos",
      path: "/menu/paseador/pagos",

      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="5" width="20" height="14" rx="2"/>
          <line x1="2" y1="10" x2="22" y2="10"/>
        </svg>
      ),
    },

    {
      key: "mensajes",
      label: "Mensajes",
      path: "/menu/paseador/mensajes",

      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
        </svg>
      ),
    },

    {
      key: "configuracion",
      label: "Configuración",
      path: "/menu/paseador/configuracion",

      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="3"/>
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
        </svg>
      ),
    },

  ];

  // ─────────────────────────────────────────────
  // BADGES
  // ─────────────────────────────────────────────

  const getBadgeCount = (key) => {

    if (key === "mensajes") {
      return mensajesSinLeer;
    }

    return 0;
  };

  return (
    <div className="mp-layout">

      {/* ───────────────────────────────────────────── */}
      {/* SIDEBAR */}
      {/* ───────────────────────────────────────────── */}

      <aside className={`mp-sidebar ${sidebarOpen ? "" : "collapsed"}`}>

        <div className="mp-logo">
          <img
            src={logoNavbar}
            alt="AllyPet"
            className={sidebarOpen ? "mp-logo-img" : "mp-logo-img-small"}
          />
        </div>

        <div className="mp-profile">

          <div className="mp-avatar-wrap">
            <img
              className="mp-avatar"
              src={
                user?.foto_perfil
                  ? `http://localhost:3004${user.foto_perfil}`
                  : avatarDefault
              }
              alt="avatar"
            />
            <span className="mp-avatar-dot" />
          </div>

          {sidebarOpen && (
            <div className="mp-profile-info">
              <span className="mp-profile-name">
                {user?.nombre || "Usuario"}
              </span>

              <span className="mp-profile-role">
                Paseador
              </span>
            </div>
          )}

        </div>

        {sidebarOpen && (
          <span className="mp-nav-section-label">
            NAVEGACIÓN
          </span>
        )}

        <nav className="mp-nav">

          {navItems.map((item) => {

            const dynamicBadge = getBadgeCount(item.key);

            return (
              <button
                key={item.key}
                className={`mp-nav-item ${activeItem === item.key ? "active" : ""}`}
                onClick={() => navigate(item.path)}
              >

                <span
                  className="mp-nav-icon"
                  style={{ position: "relative" }}
                >
                  {item.icon}

                  {!sidebarOpen && dynamicBadge > 0 && (
                    <span className="mp-badge-dot" />
                  )}
                </span>

                {sidebarOpen && (
                  <>
                    <span className="mp-nav-label">
                      {item.label}
                    </span>

                    {item.badge && dynamicBadge === 0 && (
                      <span className="mp-badge">
                        {item.badge}
                      </span>
                    )}

                    {dynamicBadge > 0 && (
                      <span className="mp-badge">
                        {dynamicBadge}
                      </span>
                    )}

                    {item.tag && (
                      <span className="mp-tag">
                        {item.tag}
                      </span>
                    )}
                  </>
                )}

              </button>
            );
          })}

        </nav>

        {/* ───────────────────────────────────────────── */}
        {/* FOOTER */}
        {/* ───────────────────────────────────────────── */}

        <div className="mp-sidebar-footer">

          <button
            className="mp-logout"
            onClick={() => {

              localStorage.removeItem("token");
              localStorage.removeItem("user");

              navigate("/login");
            }}
          >

            <span className="mp-nav-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                <polyline points="16 17 21 12 16 7"/>
                <line x1="21" y1="12" x2="9" y2="12"/>
              </svg>
            </span>

            {sidebarOpen && (
              <span className="mp-nav-label">
                Cerrar Sesión
              </span>
            )}

          </button>

        </div>

      </aside>

      {/* ───────────────────────────────────────────── */}
      {/* MAIN */}
      {/* ───────────────────────────────────────────── */}

      <div className="mp-main">

        <header className="mp-navbar">

          <div className="mp-navbar-left">

            <button
              className="mp-toggle"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            </button>

            <div className="mp-searchbar">

              <input
                type="text"
                placeholder="Buscar reservas, clientes, zonas..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />

            </div>

          </div>

          <div className="mp-navbar-right">

            <button
              className="mp-bell"
              onClick={() => navigate("/menu/paseador/notificaciones")}
              title="Notificaciones"
            >

              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
              </svg>

              {notificacionesSinLeer > 0 && (
                <span className="mp-bell-count">
                  {notificacionesSinLeer}
                </span>
              )}

            </button>

            <div
              className="mp-user-chip"
              onClick={() => navigate("/profile")}
            >

              <img
                src={
                  user?.foto_perfil
                    ? `http://localhost:3004${user.foto_perfil}`
                    : avatarDefault
                }
                alt="avatar"
              />

              <span>
                {user?.nombre || "Usuario"}
              </span>

            </div>

          </div>

        </header>

        <main className="mp-content">
          <Outlet />
        </main>

      </div>

    </div>
  );
}