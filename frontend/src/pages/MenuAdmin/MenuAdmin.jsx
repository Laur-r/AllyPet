import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './MenuAdmin.css';
import logoNavbar from '../../assets/menus/logonavbar.png';
import avatarDefault from '../../assets/menus/menudefault.png';

const ADMIN_SERVICE_URL = import.meta.env.VITE_ADMIN_SERVICE_URL || 'http://localhost:3002';

const MENU_OPTIONS = [
  { id: 'usuarios', label: 'Gestión de usuarios' },
];

const readStoredUser = () => {
  try {
    const raw = localStorage.getItem('user');
    return raw ? JSON.parse(raw) : null;
  } catch (_error) {
    return null;
  }
};

const getRoleCategory = (roleValue) => {
  const role = String(roleValue || '').toLowerCase();
  if (role === 'admin') return 'admin';
  if (role === 'proveedor' || role === 'paseador' || role === 'veterinario') return 'proveedor';
  return 'user';
};

export default function MenuAdmin() {
  const navigate = useNavigate();

  const [activeSection,    setActiveSection]    = useState('usuarios');
  const [users,            setUsers]            = useState([]);
  const [loadingUsers,     setLoadingUsers]     = useState(true);
  const [actionLoadingId,  setActionLoadingId]  = useState(null);
  const [searchValue,      setSearchValue]      = useState('');
  const [roleFilter,       setRoleFilter]       = useState('all');
  const [statusFilter,     setStatusFilter]     = useState('all');
  const [errorMessage,     setErrorMessage]     = useState('');
  const [successMessage,   setSuccessMessage]   = useState('');
  const [sidebarOpen,      setSidebarOpen]      = useState(true);

  const token = localStorage.getItem('token');
  const user  = useMemo(() => readStoredUser(), []);
  const userRole = String(user?.role || user?.rol || '').toLowerCase();

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const requestAdmin = async (path, options = {}) => {
    const response = await fetch(`${ADMIN_SERVICE_URL}${path}`, {
      ...options,
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        ...(options.headers || {}),
      },
    });

    if (response.status === 401 || response.status === 403) {
      logout();
      throw new Error('Sesión no autorizada');
    }

    const payload = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(payload?.message || 'Error en admin-service');
    return payload;
  };

  const loadUsers = async () => {
    setLoadingUsers(true);
    setErrorMessage('');
    try {
      const data = await requestAdmin('/api/admin/users');
      setUsers(Array.isArray(data?.users) ? data.users : []);
    } catch (error) {
      setErrorMessage(error.message || 'No fue posible cargar usuarios');
    } finally {
      setLoadingUsers(false);
    }
  };

  const updateUserLocalState = (userId, patch) => {
    setUsers((prev) => prev.map((item) => (item.id === userId ? { ...item, ...patch } : item)));
  };

  const activateUser = async (userId) => {
    setActionLoadingId(userId);
    setErrorMessage('');
    setSuccessMessage('');
    try {
      const response = await requestAdmin(`/api/admin/users/${userId}/activate`, { method: 'PATCH' });
      updateUserLocalState(userId, { estado: true });
      setSuccessMessage(response?.message || 'Usuario activado');
    } catch (error) {
      setErrorMessage(error.message || 'No fue posible activar la cuenta');
    } finally {
      setActionLoadingId(null);
    }
  };

  const deactivateUser = async (userId) => {
    const confirmed = window.confirm('¿Deseas desactivar esta cuenta?');
    if (!confirmed) return;
    setActionLoadingId(userId);
    setErrorMessage('');
    setSuccessMessage('');
    try {
      const response = await requestAdmin(`/api/admin/users/${userId}/deactivate`, { method: 'PATCH' });
      updateUserLocalState(userId, { estado: false });
      setSuccessMessage(response?.message || 'Usuario desactivado');
    } catch (error) {
      setErrorMessage(error.message || 'No fue posible desactivar la cuenta');
    } finally {
      setActionLoadingId(null);
    }
  };

  useEffect(() => {
    if (!token || userRole !== 'admin') {
      navigate('/login');
      return;
    }
    loadUsers();
  }, []);

  const filteredUsers = useMemo(() => {
    const normalizedSearch = searchValue.trim().toLowerCase();
    return users.filter((item) => {
      const fullName     = String(item?.nombre || '').toLowerCase();
      const email        = String(item?.email  || '').toLowerCase();
      const roleCategory = getRoleCategory(item?.role);
      const status       = item?.estado ? 'activo' : 'inactivo';
      const searchOk     = !normalizedSearch || fullName.includes(normalizedSearch) || email.includes(normalizedSearch);
      const roleOk       = roleFilter   === 'all' || roleCategory === roleFilter;
      const statusOk     = statusFilter === 'all' || status       === statusFilter;
      return searchOk && roleOk && statusOk;
    });
  }, [users, searchValue, roleFilter, statusFilter]);

  return (
    <div className="ma-layout">

      {/* SIDEBAR */}
      <aside className={`ma-sidebar ${sidebarOpen ? '' : 'collapsed'}`}>

        <div className="ma-logo">
          <img
            src={logoNavbar}
            alt="AllyPet"
            className={sidebarOpen ? 'ma-logo-img' : 'ma-logo-img-small'}
          />
        </div>

        <div className="ma-profile">
          <div className="ma-avatar-wrap">
            <img className="ma-avatar" src={avatarDefault} alt="avatar" />
            <span className="ma-avatar-dot" />
          </div>
          {sidebarOpen && (
            <div className="ma-profile-info">
              <span className="ma-profile-name">{user?.nombre || user?.email || 'Admin'}</span>
              <span className="ma-profile-role">Administrador</span>
            </div>
          )}
        </div>

        {sidebarOpen && <span className="ma-nav-section-label">NAVEGACIÓN</span>}

        <nav className="ma-nav">
          {MENU_OPTIONS.map((option) => (
            <button
              key={option.id}
              type="button"
              className={`ma-nav-item ${activeSection === option.id ? 'active' : ''}`}
              onClick={() => setActiveSection(option.id)}
            >
              {sidebarOpen && <span className="ma-nav-label">{option.label}</span>}
            </button>
          ))}
        </nav>

        <div className="ma-sidebar-footer">
          <button className="ma-logout" type="button" onClick={logout}>
            {sidebarOpen && <span>Cerrar Sesión</span>}
          </button>
        </div>
      </aside>

      {/* MAIN */}
      <div className="ma-main">

        {/* NAVBAR */}
        <header className="ma-navbar">
          <div className="ma-navbar-left">
            <button className="ma-toggle" onClick={() => setSidebarOpen(!sidebarOpen)}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="3" y1="6" x2="21" y2="6"/>
                <line x1="3" y1="12" x2="21" y2="12"/>
                <line x1="3" y1="18" x2="21" y2="18"/>
              </svg>
            </button>
            <div className="ma-searchbar">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"/>
                <line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
              <input
                type="text"
                placeholder="Buscar por nombre o correo..."
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
              />
            </div>
          </div>

          <div className="ma-navbar-right">
            <div className="ma-user-chip">
              <img className="ma-avatar" src={avatarDefault} alt="avatar" />
              <span>{user?.nombre || user?.email || 'Admin'}</span>
            </div>
          </div>
        </header>

        {/* CONTENIDO */}
        <main className="ma-content">

          {/* FILTROS */}
          <div className="ma-filters">
            <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
              <option value="all">Todos los roles</option>
              <option value="user">Usuario</option>
              <option value="admin">Admin</option>
              <option value="proveedor">Proveedor</option>
            </select>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="all">Todos los estados</option>
              <option value="activo">Activo</option>
              <option value="inactivo">Inactivo</option>
            </select>
          </div>

          {successMessage && <div className="ma-alert ma-alert--success">{successMessage}</div>}
          {errorMessage   && <div className="ma-alert ma-alert--error">{errorMessage}</div>}

          {loadingUsers ? (
            <p className="ma-hint">Cargando usuarios...</p>
          ) : filteredUsers.length === 0 ? (
            <p className="ma-hint">No hay usuarios para mostrar con los filtros actuales.</p>
          ) : (
            <div className="ma-table-wrap">
              <table className="ma-table">
                <thead>
                  <tr>
                    <th>Nombre</th>
                    <th>Correo</th>
                    <th>Rol</th>
                    <th>Estado</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((item) => {
                    const isActive    = Boolean(item.estado);
                    const isLoadingRow = actionLoadingId === item.id;
                    return (
                      <tr key={item.id}>
                        <td>{item.nombre || '-'}</td>
                        <td>{item.email  || '-'}</td>
                        <td>{item.role   || '-'}</td>
                        <td>
                          <span className={`ma-chip ${isActive ? 'ma-chip--ok' : 'ma-chip--off'}`}>
                            {isActive ? 'activo' : 'inactivo'}
                          </span>
                        </td>
                        <td>
                          <div className="ma-actions">
                            {isActive ? (
                              <button
                                className="ma-btn ma-btn--deactivate"
                                type="button"
                                disabled={isLoadingRow}
                                onClick={() => deactivateUser(item.id)}
                              >
                                Desactivar
                              </button>
                            ) : (
                              <button
                                className="ma-btn ma-btn--activate"
                                type="button"
                                disabled={isLoadingRow}
                                onClick={() => activateUser(item.id)}
                              >
                                Activar
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}