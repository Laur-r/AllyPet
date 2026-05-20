import { Navigate } from 'react-router-dom';

const parseStoredUser = () => {
  try {
    const raw = localStorage.getItem('user');
    return raw ? JSON.parse(raw) : null;
  } catch (_error) {
    return null;
  }
};

const parseJwtPayload = (token) => {
  try {
    const payloadPart = token.split('.')[1];
    if (!payloadPart) {
      return null;
    }

    const base64 = payloadPart.replace(/-/g, '+').replace(/_/g, '/');
    const decoded = atob(base64);
    return JSON.parse(decoded);
  } catch (_error) {
    return null;
  }
};

const clearSession = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};

export default function ProtectedRoute({ children, requireAdmin = false, adminOnly = false }) {
  const adminRequired = Boolean(requireAdmin || adminOnly);
  const token = localStorage.getItem('token');
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  const payload = parseJwtPayload(token);
  if (!payload) {
    clearSession();
    return <Navigate to="/login" replace />;
  }

  if (payload.exp && Date.now() >= payload.exp * 1000) {
    clearSession();
    return <Navigate to="/login" replace />;
  }

  const user = parseStoredUser();
  if (!user) {
    clearSession();
    return <Navigate to="/login" replace />;
  }

  const role = String(user.role || user.rol || payload.role || payload.rol || '').toLowerCase();

  if (adminRequired && role !== 'admin') {
    return <Navigate to="/login" replace />;
  }

  return children;
}
