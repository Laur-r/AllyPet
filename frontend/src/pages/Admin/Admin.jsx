import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Admin.css';

const ADMIN_SERVICE_URL = import.meta.env.VITE_ADMIN_SERVICE_URL || 'http://localhost:3002';

const MENU_ITEMS = [
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'usuarios', label: 'Usuarios' },
  { id: 'mascotas', label: 'Mascotas' },
];

const readStoredUser = () => {
  try {
    const rawUser = localStorage.getItem('user');
    return rawUser ? JSON.parse(rawUser) : null;
  } catch (_error) {
    return null;
  }
};

const formatDateTime = (value) => {
  if (!value) {
    return '-';
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return '-';
  }

  return new Intl.DateTimeFormat('es-CO', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date);
};

export default function Admin() {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('dashboard');
  const [dashboard, setDashboard] = useState(null);
  const [users, setUsers] = useState([]);
  const [loadingDashboard, setLoadingDashboard] = useState(true);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [error, setError] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);

  const token = localStorage.getItem('token');
  const storedUser = useMemo(() => readStoredUser(), []);
  const userRole = String(storedUser?.role || storedUser?.rol || '').toLowerCase();

  const clearSessionAndRedirect = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const authHeaders = {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  };

  const fetchDashboard = async () => {
    setLoadingDashboard(true);
    setError('');

    try {
      const response = await fetch(`${ADMIN_SERVICE_URL}/api/admin/dashboard`, {
        method: 'GET',
        headers: authHeaders,
      });

      if (response.status === 401 || response.status === 403) {
        clearSessionAndRedirect();
        return;
      }

      const data = await response.json();

      if (!response.ok) {
        setError(data?.message || 'No se pudo cargar el dashboard');
        return;
      }

      setDashboard(data);
    } catch (requestError) {
      console.error('Admin dashboard error:', requestError);
      setError('Error conectando con admin-service');
    } finally {
      setLoadingDashboard(false);
    }
  };

  const fetchUsers = async () => {
    setLoadingUsers(true);
    setError('');

    try {
      const response = await fetch(`${ADMIN_SERVICE_URL}/api/admin/users`, {
        method: 'GET',
        headers: authHeaders,
      });

      if (response.status === 401 || response.status === 403) {
        clearSessionAndRedirect();
        return;
      }

      const data = await response.json();

      if (!response.ok) {
        setError(data?.message || 'No se pudo cargar la lista de usuarios');
        return;
      }

      setUsers(Array.isArray(data?.users) ? data.users : []);
    } catch (requestError) {
      console.error('Admin users error:', requestError);
      setError('Error conectando con admin-service');
    } finally {
      setLoadingUsers(false);
    }
  };

  useEffect(() => {
    if (!token || userRole !== 'admin') {
      navigate('/login');
      return;
    }

    fetchDashboard();
  }, []);

  useEffect(() => {
    if (activeSection === 'usuarios' && users.length === 0) {
      fetchUsers();
    }
  }, [activeSection]);

  const handleMenuClick = (sectionId) => {
    setActiveSection(sectionId);
    setMenuOpen(false);
  };

  const renderDashboard = () => {
    if (loadingDashboard) {
      return <p className="admin-content__hint">Cargando dashboard...</p>;
    }

    return (
      <>
        <div className="admin-stats-grid">
          <article className="admin-stat-card">
            <p>Total Usuarios</p>
            <strong>{dashboard?.totalUsers ?? 0}</strong>
          </article>

          <article className="admin-stat-card">
            <p>Admins</p>
            <strong>{dashboard?.adminUsers ?? 0}</strong>
          </article>

          <article className="admin-stat-card">
            <p>Mascotas Registradas</p>
            <strong>{dashboard?.totalPets ?? 0}</strong>
          </article>
        </div>

        <div className="admin-panel-note">
          <h3>Resumen</h3>
          <p>
            Este panel consume endpoints protegidos por JWT en <code>/api/admin</code> y valida rol <code>admin</code>{' '}
            desde backend.
          </p>
        </div>
      </>
    );
  };

  const renderUsers = () => {
    if (loadingUsers) {
      return <p className="admin-content__hint">Cargando usuarios...</p>;
    }

    if (users.length === 0) {
      return <p className="admin-content__hint">No hay usuarios para mostrar.</p>;
    }

    return (
      <div className="admin-table-wrap">
        <table className="admin-users-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Nombre</th>
              <th>Email</th>
              <th>Rol</th>
              <th>Telefono</th>
              <th>Ciudad</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id}>
                <td>{user.id}</td>
                <td>{user.nombre || '-'}</td>
                <td>{user.email}</td>
                <td>
                  <span className={`admin-role-chip admin-role-chip--${String(user.role).toLowerCase()}`}>
                    {user.role}
                  </span>
                </td>
                <td>{user.telefono || '-'}</td>
                <td>{user.ciudad || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  const renderMascotas = () => {
    return (
      <div className="admin-panel-note">
        <h3>Mascotas</h3>
        <p>
          Total registradas: <strong>{dashboard?.totalPets ?? 0}</strong>
        </p>
        <p className="admin-content__hint">Puedes extender aqui la gestion de mascotas cuando habilites endpoints dedicados.</p>
      </div>
    );
  };

  return (
    <div className="admin-layout">
      <button className="admin-mobile-toggle" onClick={() => setMenuOpen((prev) => !prev)} type="button">
        Menu
      </button>

      <aside className={`admin-sidebar ${menuOpen ? 'admin-sidebar--open' : ''}`}>
        <div className="admin-sidebar__brand">
          <h2>AllyPet</h2>
          <span>Panel Admin</span>
        </div>

        <nav className="admin-sidebar__menu">
          {MENU_ITEMS.map((item) => (
            <button
              key={item.id}
              className={`admin-menu-btn ${activeSection === item.id ? 'admin-menu-btn--active' : ''}`}
              type="button"
              onClick={() => handleMenuClick(item.id)}
            >
              {item.label}
            </button>
          ))}
        </nav>

        <button className="admin-logout-btn" type="button" onClick={clearSessionAndRedirect}>
          Cerrar sesion
        </button>
      </aside>

      <main className="admin-content">
        <header className="admin-content__header">
          <h1>{activeSection === 'dashboard' ? 'Dashboard' : activeSection === 'usuarios' ? 'Usuarios' : 'Mascotas'}</h1>
          <p>
            Admin: <strong>{storedUser?.email || 'sin-email'}</strong>
          </p>
        </header>

        {error && <div className="admin-content__error">{error}</div>}

        {activeSection === 'dashboard' && renderDashboard()}
        {activeSection === 'usuarios' && renderUsers()}
        {activeSection === 'mascotas' && renderMascotas()}

        <p className="admin-content__timestamp">Ultima actualizacion: {formatDateTime(new Date().toISOString())}</p>
      </main>
    </div>
  );
}
