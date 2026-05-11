import { useState, useEffect } from "react";
import "./MenuDueno.css";
import logoNavbar from "../../../assets/menus/logonavbar.png";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import avatarDefault from "../../../assets/menus/menudefault.png";

export default function MenuDueno() {
  const [serviciosOpen, setServiciosOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [search, setSearch] = useState("");
  const [user, setUser] = useState(null);

  const navigate = useNavigate();
  const location = useLocation();

  const getActiveFromPath = (path) => {
    if (path.includes("mascotas")) return "mascotas";
    if (path.includes("configuracion")) return "configuracion";
    if (path.includes("reservas")) return "reservas";
    if (path.includes("historial-solicitudes")) return "solicitudes";
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

  const getRolNombre = (rol) => {
    const roles = {
      dueno: "Dueño de mascota",
      paseador: "Paseador",
      veterinario: "Veterinario",
    };
    return roles[rol] || "Usuario";
  };

const navItems = [
  {
    key: "inicio", label: "Inicio",
    icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
  },
  {
    key: "mascotas", label: "Mascotas",
    icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="4" r="2"/><circle cx="18" cy="8" r="2"/><circle cx="4" cy="8" r="2"/><path d="M9.27 7.26 4 17"/><path d="m15 17-2.15-5.4"/><path d="M4 17h16"/><path d="m11 17 3-6 3.27 3.27"/></svg>,
  },
  {
    key: "solicitudes", label: "Mis Solicitudes",
    icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>,
  },
  {
    key: "servicios", label: "Servicios", hasChildren: true,
    icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>,
  },
  {
    key: "reservas", label: "Reservas",
    icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
  },
  {
    key: "calificar", label: "Calificar",
    icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>,
  },
  {
    key: "mensajes", label: "Mensajes",
    icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>,
  },
  {
    key: "configuracion", label: "Configuración",
    icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>,
  },
];

  const subServicios = [
    {
      key: "veterinario",
      label: "Veterinario",
      path: "/menu/dueno/buscar/veterinarias",
    },
    {
      key: "paseador",
      label: "Paseador",
      path: "/menu/dueno/buscar/paseadores",
    },
    { key: "cuidador", label: "Cuidador", path: null },
  ];

  const isServicioActive =
    activeItem === "servicios" ||
    subServicios.some((s) => s.key === activeItem);

  return (
    <div className="md-layout">
      {/* SIDEBAR */}
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
              <span className="md-profile-name">
                {user?.nombre || "Usuario"}
              </span>
              <span className="md-profile-role">
                {getRolNombre(user?.rol)}
              </span>
            </div>
          )}
        </div>

        {sidebarOpen && (
          <span className="md-nav-section-label">NAVEGACIÓN</span>
        )}

        <nav className="md-nav">
          {navItems.map((item) => (
            <div key={item.key}>
              <button
                className={`md-nav-item ${
                  item.key === "servicios"
                    ? isServicioActive
                      ? "active"
                      : ""
                    : activeItem === item.key
                    ? "active"
                    : ""
                }`}
                onClick={() => {
                  if (item.hasChildren) {
                    setServiciosOpen(!serviciosOpen);
                    setActiveItem("servicios");
                  } else {
                    setActiveItem(item.key);
                    setServiciosOpen(false);

                    if (item.key === "mascotas")
                      navigate("/menu/dueno/mascotas");
                    if (item.key === "inicio") navigate("/menu/dueno");
                    if (item.key === "solicitudes")
                      navigate("/menu/dueno/historial-solicitudes");
                    if (item.key === "calificar")
                      navigate("calificaciones");
                  }
                }}
              >
                <span className="md-nav-icon">{item.icon}</span>
                {sidebarOpen && (
                  <span className="md-nav-label">{item.label}</span>
                )}
              </button>

              {item.hasChildren && serviciosOpen && sidebarOpen && (
                <div className="md-submenu">
                  {subServicios.map((sub) => (
                    <button
                      key={sub.key}
                      className={`md-sub-item ${
                        activeItem === sub.key ? "active" : ""
                      }`}
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
          ))}
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

      {/* MAIN */}
      <div className="md-main">
        {/* NAVBAR */}
        <header className="md-navbar">
          <div className="md-navbar-left">
            <button
              className="md-toggle"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            </button>

            <div className="md-searchbar">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
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
            <div
              className="md-user-chip"
              onClick={() => navigate("/profile")}
            >
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