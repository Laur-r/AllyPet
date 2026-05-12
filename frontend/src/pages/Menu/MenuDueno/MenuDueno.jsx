import { useState, useEffect } from "react";
import "./MenuDueno.css";
import logoNavbar from "../../../assets/menus/logonavbar.png";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import avatarDefault from "../../../assets/menus/menudefault.png";

// Servicios de badge (H10.5)
import { getUnreadCount as getUnreadMessages }      from "../../../services/message.service";
import { getUnreadCount as getUnreadNotifications } from "../../../services/notification.service";

export default function MenuDueno() {
  const [serviciosOpen, setServiciosOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen]     = useState(true);
  const [search, setSearch]               = useState("");
  const [user, setUser]                   = useState(null);

  // Badges
  const [mensajesSinLeer, setMensajesSinLeer]             = useState(0);
  const [notificacionesSinLeer, setNotificacionesSinLeer] = useState(0);

  const navigate = useNavigate();
  const location = useLocation();

  const getActiveFromPath = (path) => {
    if (path.includes("mascotas"))            return "mascotas";
    if (path.includes("configuracion"))       return "configuracion";
    if (path.includes("reservas"))            return "reservas";
    if (path.includes("historial-solicitudes")) return "solicitudes";
    if (path.includes("mensajes"))            return "mensajes";
    if (path.includes("notificaciones"))      return "notificaciones";
    if (path.includes("calificaciones"))      return "calificar";
    return "inicio";
  };

  const [activeItem, setActiveItem] = useState(() =>
    getActiveFromPath(location.pathname)
  );

  useEffect(() => {
    setActiveItem(getActiveFromPath(location.pathname));
  }, [location.pathname]);

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) setUser(JSON.parse(userData));
  }, []);

  // Polling de badges cada 30 segundos
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
        // silencioso: el badge simplemente no aparece si falla
      }
    };

    fetchBadges();
    const interval = setInterval(fetchBadges, 30000);
    return () => clearInterval(interval);
  }, []);

  const getRolNombre = (rol) => {
    const roles = {
      dueno:       "Dueño de mascota",
      paseador:    "Paseador",
      veterinario: "Veterinario",
    };
    return roles[rol] || "Usuario";
  };

  const navItems = [
    { key: "inicio",        label: "Inicio" },
    { key: "mascotas",      label: "Mascotas" },
    { key: "solicitudes",   label: "Mis Solicitudes" },
    { key: "servicios",     label: "Servicios", hasChildren: true },
    { key: "reservas",      label: "Reservas" },
    { key: "calificar",     label: "Calificar" },
    { key: "mensajes",      label: "Mensajes" },
    { key: "configuracion", label: "Configuración" },
  ];

  const subServicios = [
    { key: "veterinario", label: "Veterinario", path: "/menu/dueno/buscar/veterinarias" },
    { key: "paseador",    label: "Paseador",    path: "/menu/dueno/buscar/paseadores" },
    { key: "cuidador",    label: "Cuidador",    path: null },
  ];

  const isServicioActive =
    activeItem === "servicios" ||
    subServicios.some((s) => s.key === activeItem);

  const handleNavClick = (item) => {
    if (item.hasChildren) {
      setServiciosOpen(!serviciosOpen);
      setActiveItem("servicios");
      return;
    }

    setActiveItem(item.key);
    setServiciosOpen(false);

    const routes = {
      inicio:        "/menu/dueno",
      mascotas:      "/menu/dueno/mascotas",
      solicitudes:   "/menu/dueno/historial-solicitudes",
      calificar:     "/menu/dueno/calificaciones",
      mensajes:      "/menu/dueno/mensajes",
      notificaciones: "/menu/dueno/notificaciones",
    };

    if (routes[item.key]) navigate(routes[item.key]);
  };

  return (
    <div className="md-layout">
      {/* ── SIDEBAR ── */}
      <aside className={`md-sidebar ${sidebarOpen ? "" : "collapsed"}`}>
        <div className="md-logo">
          <img
            src={logoNavbar}
            alt="AllyPet"
            className={sidebarOpen ? "md-logo-img" : "md-logo-img-small"}
          />
        </div>

        <div className="md-profile">
          <div className="md-avatar-wrap">
            <img className="md-avatar" src={avatarDefault} alt="avatar" />
            <span className="md-avatar-dot" />
          </div>
          {sidebarOpen && (
            <div className="md-profile-info">
              <span className="md-profile-name">{user?.nombre || "Usuario"}</span>
              <span className="md-profile-role">{getRolNombre(user?.rol)}</span>
            </div>
          )}
        </div>

        {sidebarOpen && <span className="md-nav-section-label">NAVEGACIÓN</span>}

        <nav className="md-nav">
          {navItems.map((item) => {
            const isActive =
              item.key === "servicios"
                ? isServicioActive
                : activeItem === item.key;

            return (
              <div key={item.key}>
                <button
                  className={`md-nav-item ${isActive ? "active" : ""}`}
                  onClick={() => handleNavClick(item)}
                >
                  {sidebarOpen && (
                    <span className="md-nav-label-wrap">
                      {item.label}

                      {/* Badge mensajes en el sidebar */}
                      {item.key === "mensajes" && mensajesSinLeer > 0 && (
                        <span className="md-badge">{mensajesSinLeer}</span>
                      )}
                    </span>
                  )}

                  {/* Badge cuando sidebar está colapsado (solo punto) */}
                  {!sidebarOpen && item.key === "mensajes" && mensajesSinLeer > 0 && (
                    <span className="md-badge-dot" />
                  )}
                </button>

                {item.hasChildren && serviciosOpen && sidebarOpen && (
                  <div className="md-submenu">
                    {subServicios.map((sub) => (
                      <button
                        key={sub.key}
                        className={`md-sub-item ${activeItem === sub.key ? "active" : ""}`}
                        onClick={() => {
                          setActiveItem(sub.key);
                          if (sub.path) navigate(sub.path);
                        }}
                      >
                        {sub.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        <div className="md-sidebar-footer">
          <button
            className="md-logout"
            onClick={() => {
              localStorage.removeItem("token");
              localStorage.removeItem("user");
              navigate("/login");
            }}
          >
            {sidebarOpen && <span>Cerrar Sesión</span>}
          </button>
        </div>
      </aside>

      {/* ── MAIN ── */}
      <div className="md-main">
        {/* HEADER */}
        <header className="md-navbar">
          <div className="md-navbar-left">
            <button className="md-toggle" onClick={() => setSidebarOpen(!sidebarOpen)}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2"
                strokeLinecap="round" strokeLinejoin="round">
                <line x1="3"  y1="6"  x2="21" y2="6"  />
                <line x1="3"  y1="12" x2="21" y2="12" />
                <line x1="3"  y1="18" x2="21" y2="18" />
              </svg>
            </button>

            <div className="md-searchbar">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2"
                strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                type="text"
                placeholder="Buscar mascotas, servicios, reservas..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          <div className="md-navbar-right">
            {/* Campana de notificaciones */}
            <button
              className="md-icon-btn"
              onClick={() => navigate("/menu/dueno/notificaciones")}
              title="Notificaciones"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2"
                strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                <path d="M13.73 21a2 2 0 0 1-3.46 0" />
              </svg>
              {notificacionesSinLeer > 0 && (
                <span className="md-badge-header">{notificacionesSinLeer}</span>
              )}
            </button>

            <div className="md-user-chip" onClick={() => navigate("/profile")}>
              <img className="md-avatar" src={avatarDefault} alt="avatar" />
              <span>{user?.nombre || "Usuario"}</span>
            </div>
          </div>
        </header>

        <main className="md-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}