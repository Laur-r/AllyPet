import { useState, useEffect, useRef } from 'react';
import { getNotifications, markAsRead, markAllAsRead, getUnreadCount } from '../../services/notification.service';
import './NotificationDropdown.css';

const ICONOS = {
  nueva_solicitud:      '📅',
  mensaje_nuevo:        '💬',
  solicitud_aceptada:   '✅',
  solicitud_rechazada:  '❌',
  solicitud_completada: '🏁',
};

const LABELS = {
  nueva_solicitud:      'Nueva solicitud',
  mensaje_nuevo:        'Mensaje nuevo',
  solicitud_aceptada:   'Solicitud aceptada',
  solicitud_rechazada:  'Solicitud rechazada',
  solicitud_completada: 'Servicio completado',
};

const COLOR_TIPO = {
  nueva_solicitud:      '#7B2D8B',
  mensaje_nuevo:        '#3B82F6',
  solicitud_aceptada:   '#22C55E',
  solicitud_rechazada:  '#EF4444',
  solicitud_completada: '#F59E0B',
};

const formatFecha = (ts) => {
  const date = new Date(ts);
  const now = new Date();
  const diff = (now - date) / 1000; // seconds
  if (diff < 60) return 'Hace un momento';
  if (diff < 3600) return `Hace ${Math.floor(diff / 60)} min`;
  if (diff < 86400) return `Hace ${Math.floor(diff / 3600)} h`;
  return date.toLocaleDateString('es-CO', { day: '2-digit', month: 'short' });
};

export default function NotificationDropdown({ bellClassName = 'nd-bell' }) {
  const [open, setOpen]                   = useState(false);
  const [notificaciones, setNotificaciones] = useState([]);
  const [unreadCount, setUnreadCount]     = useState(0);
  const [loading, setLoading]             = useState(false);
  const [marcando, setMarcando]           = useState(false);
  const dropdownRef                       = useRef(null);

  // Poll unread count every 30 s
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;

    const fetch_ = async () => {
      try { setUnreadCount(await getUnreadCount()); } catch { /* silent */ }
    };
    fetch_();
    const iv = setInterval(fetch_, 30000);
    return () => clearInterval(iv);
  }, []);

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const [error, setError] = useState(null);

  const handleToggle = async () => {
    if (!open) {
      setLoading(true);
      setError(null);
      try {
        const data = await getNotifications();
        setNotificaciones(data || []);
        const count = (data || []).filter(n => !n.leido).length;
        setUnreadCount(count);
      } catch (err) {
        console.error('NotificationDropdown error:', err);
        setError('No se pudieron cargar las notificaciones.');
      } finally {
        setLoading(false);
      }
    }
    setOpen(prev => !prev);
  };

  const handleClick = async (notif) => {
    if (notif.leido) return;
    try {
      await markAsRead(notif.id);
      setNotificaciones(prev => prev.map(n => n.id === notif.id ? { ...n, leido: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch { /* silent */ }
  };

  const handleMarkAll = async () => {
    setMarcando(true);
    try {
      await markAllAsRead();
      setNotificaciones(prev => prev.map(n => ({ ...n, leido: true })));
      setUnreadCount(0);
    } catch { /* silent */ } finally {
      setMarcando(false);
    }
  };

  const hayNoLeidas = notificaciones.some(n => !n.leido);

  return (
    <div className="nd-wrapper" ref={dropdownRef}>
      {/* Bell button */}
      <button
        className={`${bellClassName} nd-trigger`}
        onClick={handleToggle}
        title="Notificaciones"
        aria-label={`Notificaciones${unreadCount > 0 ? ` (${unreadCount} sin leer)` : ''}`}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
          <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
        </svg>
        {unreadCount > 0 && (
          <span className="nd-badge">{unreadCount > 99 ? '99+' : unreadCount}</span>
        )}
      </button>

      {/* Dropdown panel */}
      {open && (
        <div className="nd-panel">
          {/* Header */}
          <div className="nd-panel__head">
            <div className="nd-panel__title">
              <span>Notificaciones</span>
              {unreadCount > 0 && <span className="nd-panel__count">{unreadCount} nuevas</span>}
            </div>
            {hayNoLeidas && (
              <button className="nd-mark-all" onClick={handleMarkAll} disabled={marcando}>
                {marcando ? 'Marcando…' : 'Marcar todas'}
              </button>
            )}
          </div>

          {/* Body */}
          <div className="nd-panel__body">
            {loading && (
              <div className="nd-loading">
                <div className="nd-spinner" />
                <span>Cargando…</span>
              </div>
            )}

            {!loading && error && (
              <div className="nd-empty">
                <span className="nd-empty__icon">⚠️</span>
                <p>{error}</p>
              </div>
            )}

            {!loading && !error && notificaciones.length === 0 && (
              <div className="nd-empty">
                <span className="nd-empty__icon">🔔</span>
                <p>No tienes notificaciones por el momento</p>
              </div>
            )}

            {!loading && !error && notificaciones.map(notif => (
              <div
                key={notif.id}
                className={`nd-item${notif.leido ? '' : ' nd-item--unread'}`}
                onClick={() => handleClick(notif)}
              >
                <div
                  className="nd-item__icon"
                  style={{ background: `${COLOR_TIPO[notif.tipo] || '#7B2D8B'}18`, color: COLOR_TIPO[notif.tipo] || '#7B2D8B' }}
                >
                  {ICONOS[notif.tipo] || '🔔'}
                </div>
                <div className="nd-item__body">
                  <span className="nd-item__tipo" style={{ color: COLOR_TIPO[notif.tipo] || '#7B2D8B' }}>
                    {LABELS[notif.tipo] || notif.tipo}
                  </span>
                  <p className="nd-item__desc">{notif.descripcion}</p>
                  <span className="nd-item__time">{formatFecha(notif.fecha)}</span>
                </div>
                {!notif.leido && <div className="nd-item__dot" />}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
