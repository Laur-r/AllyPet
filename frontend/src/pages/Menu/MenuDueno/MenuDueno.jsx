import { useState, useEffect } from "react";
import "./MenuDueno.css";
import logoNavbar from "../../../assets/menus/logonavbar.png";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import avatarDefault from "../../../assets/menus/menudefault.png";
import { useCurrentUser } from "../../../hooks/useCurrentUser";

export default function MenuDueno() {
  const { user } = useCurrentUser();
  const [serviciosOpen, setServiciosOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [search, setSearch] = useState("");

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

  const getRolNombre = (rol) => {
    const roles = {
      dueno: "Dueño de mascota",
      paseador: "Paseador",
      veterinario: "Veterinario",
    };
    return roles[rol] || "Usuario";
  };

  const navItems = [
    { key: "inicio", label: "Inicio" },
    { key: "mascotas", label: "Mascotas" },
    { key: "solicitudes", label: "Mis Solicitudes" },
    { key: "servicios", label: "Servicios", hasChildren: true },
    { key: "reservas", label: "Reservas" },
    { key: "calificar", label: "Calificar" },
    { key: "mensajes", label: "Mensajes" },
    { key: "configuracion", label: "Configuración" },
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
            <img
              className="md-avatar"
              src={user?.foto_perfil ? `http://localhost:3004${user.foto_perfil}` : avatarDefault}
              alt="avatar"
            />
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
                    if (item.key === "configuracion") navigate("/menu/dueno/configuracion");
                  }
                }}
              >
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
            <img
              className="md-avatar"
              src={user?.foto_perfil ? `http://localhost:3004${user.foto_perfil}` : avatarDefault}
              alt="avatar"
            />
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