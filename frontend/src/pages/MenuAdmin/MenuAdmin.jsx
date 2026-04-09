import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './MenuAdmin.css';
import logo from '../../assets/admin/logo_fondo_oscuro.png';

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
  if (role === 'admin') {
    return 'admin';
  }
  if (role === 'proveedor' || role === 'paseador' || role === 'veterinario') {
    return 'proveedor';
  }
  return 'user';
};

export default function MenuAdmin() {
  const navigate = useNavigate();

  const [activeSection, setActiveSection] = useState('usuarios');
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState(null);

  const [searchValue, setSearchValue] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);

  const token = localStorage.getItem('token');
  const user = useMemo(() => readStoredUser(), []);

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
      throw new Error('Sesion no autorizada');
    }

    const payload = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(payload?.message || 'Error en admin-service');
    }

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

  const approveProvider = async (userId) => {
    setActionLoadingId(userId);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const response = await requestAdmin(`/api/admin/users/${userId}/approve`, { method: 'PUT' });
      updateUserLocalState(userId, { providerApproved: true });
      setSuccessMessage(response?.message || 'Usuario aprobado');
    } catch (error) {
      setErrorMessage(error.message || 'No fue posible aprobar el usuario');
    } finally {
      setActionLoadingId(null);
    }
  };

  const rejectProvider = async (userId) => {
    setActionLoadingId(userId);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const response = await requestAdmin(`/api/admin/users/${userId}/reject`, { method: 'PUT' });
      updateUserLocalState(userId, { providerApproved: false });
      setSuccessMessage(response?.message || 'Usuario desaprobado');
    } catch (error) {
      setErrorMessage(error.message || 'No fue posible desaprobar el usuario');
    } finally {
      setActionLoadingId(null);
    }
  };

  const activateUser = async (userId) => {
    setActionLoadingId(userId);
    setErrorMessage('');
    setSuccessMessage('');

    try {
        const response = await requestAdmin(`/api/admin/users/${userId}/activate`, { method: 'PATCH' });
        updateUserLocalState(userId, { active: true, estado: true, status: 'activo' });
        setSuccessMessage(response?.message || 'Usuario activado');
    } catch (error) {
        setErrorMessage(error.message || 'No fue posible activar la cuenta');
    } finally {
        setActionLoadingId(null);
    }
  };

  const deactivateUser = async (userId) => {
    const confirmed = window.confirm('Deseas desactivar esta cuenta?');
    if (!confirmed) {
      return;
    }

    setActionLoadingId(userId);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const response = await requestAdmin(`/api/admin/users/${userId}/deactivate`, { method: 'PATCH' });
      updateUserLocalState(userId, { active: false, estado: false, status: 'inactivo' });
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
      const fullName = String(item?.nombre || '').toLowerCase();
      const email = String(item?.email || '').toLowerCase();
      const roleCategory = getRoleCategory(item?.role);
      const status = (item?.estado ?? item?.active) ? 'activo' : 'inactivo';

      const searchOk =
        !normalizedSearch || fullName.includes(normalizedSearch) || email.includes(normalizedSearch);

      const roleOk = roleFilter === 'all' || roleCategory === roleFilter;
      const statusOk = statusFilter === 'all' || status === statusFilter;

      return searchOk && roleOk && statusOk;
    });
  }, [users, searchValue, roleFilter, statusFilter]);

  const showFilters = activeSection === 'filtros' || activeSection === 'usuarios';

  const getSectionTitle = () => 'Gestión de usuarios';

  return (
    <div className="menu-admin-layout">
      <button className="menu-admin-mobile-toggle" type="button" onClick={() => setMenuOpen((prev) => !prev)}>
        Menu
      </button>

      <aside className={`menu-admin-sidebar ${menuOpen ? 'menu-admin-sidebar--open' : ''}`}>
        <div className="menu-admin-brand">
          <img src={logo} alt="AllyPet" className="menu-admin-brand__logo" />
          <span>Panel administrador</span>
        </div>

        <nav className="menu-admin-nav">
          {MENU_OPTIONS.map((option) => (
            <button
              key={option.id}
              type="button"
              className={`menu-admin-nav__btn ${activeSection === option.id ? 'menu-admin-nav__btn--active' : ''}`}
              onClick={() => {
                setActiveSection(option.id);
                setMenuOpen(false);
              }}
            >
              {option.label}
            </button>
          ))}
        </nav>

        <button className="menu-admin-logout" type="button" onClick={logout}>
          Cerrar sesion
        </button>
      </aside>

      <main className="menu-admin-content">
        <header className="menu-admin-content__header">
          <h1>{getSectionTitle()}</h1>
          <p>
            Admin: <strong>{user?.email || 'sin-email'}</strong>
          </p>
        </header>

        {showFilters && (
          <section className="menu-admin-filters">
            <input
              type="text"
              placeholder="Buscar por nombre o correo"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
            />

            <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
              <option value="all">Todos los roles</option>
              <option value="user">User</option>
              <option value="admin">Admin</option>
              <option value="proveedor">Proveedor</option>
            </select>

            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="all">Todos los estados</option>
              <option value="activo">Activo</option>
              <option value="inactivo">Inactivo</option>
            </select>
          </section>
        )}

        {successMessage && <div className="menu-admin-alert menu-admin-alert--success">{successMessage}</div>}
        {errorMessage && <div className="menu-admin-alert menu-admin-alert--error">{errorMessage}</div>}

        {loadingUsers ? (
          <p className="menu-admin-content__hint">Cargando usuarios...</p>
        ) : filteredUsers.length === 0 ? (
          <p className="menu-admin-content__hint">No hay usuarios para mostrar con los filtros actuales.</p>
        ) : (
          <div className="menu-admin-table-wrap">
            <table className="menu-admin-table">
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Correo</th>
                  <th>Rol</th>
                  <th>Estado</th>
                  <th>Aprobacion</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((item) => {
                  const roleCategory = getRoleCategory(item.role);
                  const isProvider = roleCategory === 'proveedor';
                  const isActive = Boolean(item.estado ?? item.active);
                  const isLoadingRow = actionLoadingId === item.id;

                  return (
                    <tr key={item.id}>
                      <td>{item.nombre || '-'}</td>
                      <td>{item.email || '-'}</td>
                      <td>{item.role || '-'}</td>
                      <td>
                        <span className={`menu-admin-chip ${isActive ? 'menu-admin-chip--ok' : 'menu-admin-chip--off'}`}>
                          {isActive ? 'activo' : 'inactivo'}
                        </span>
                      </td>
                      <td>
                        {isProvider ? (
                          <span
                            className={`menu-admin-chip ${item.providerApproved ? 'menu-admin-chip--ok' : 'menu-admin-chip--warn'}`}
                          >
                            {item.providerApproved ? 'aprobado' : 'desaprobado'}
                          </span>
                        ) : (
                          '-'
                        )}
                      </td>
                      <td>
                        <div className="menu-admin-actions">
                          {isProvider && (
                            <>
                              <button
                                className="menu-admin-btn menu-admin-btn--approve"
                                type="button"
                                disabled={isLoadingRow}
                                onClick={() => approveProvider(item.id)}
                              >
                                Aprobar
                              </button>

                              <button
                                className="menu-admin-btn menu-admin-btn--reject"
                                type="button"
                                disabled={isLoadingRow}
                                onClick={() => rejectProvider(item.id)}
                              >
                                Desaprobar
                              </button>
                            </>
                          )}

                          {isActive ? (
                            <button
                              className="menu-admin-btn menu-admin-btn--deactivate"
                              type="button"
                              disabled={isLoadingRow}
                              onClick={() => deactivateUser(item.id)}
                            >
                              Desactivar
                            </button>
                          ) : (
                            <button
                              className="menu-admin-btn menu-admin-btn--approve"
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
  );
}
