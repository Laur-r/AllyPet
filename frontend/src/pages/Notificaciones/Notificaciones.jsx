import { useState, useEffect } from 'react';
import { getNotifications, markAsRead, markAllAsRead } from '../../services/notification.service';
import './Notificaciones.css';

const ICONOS = {
  mensaje_nuevo:        '💬',
  solicitud_aceptada:   '✅',
  solicitud_rechazada:  '❌',
  solicitud_completada: '🏁',
};

const LABELS = {
  mensaje_nuevo:        'Mensaje nuevo',
  solicitud_aceptada:   'Solicitud aceptada',
  solicitud_rechazada:  'Solicitud rechazada',
  solicitud_completada: 'Servicio completado',
};

const formatFecha = (ts) =>
  new Date(ts).toLocaleString('es-CO', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

export default function Notificaciones() {
  const [notificaciones, setNotificaciones] = useState([]);
  const [loading, setLoading]               = useState(true);
  const [marcando, setMarcando]             = useState(false);

  const hayNoLeidas = notificaciones.some((n) => !n.leido);

  useEffect(() => {
    const fetchNotificaciones = async () => {
      try {
        const data = await getNotifications();
        setNotificaciones(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchNotificaciones();
  }, []);

  // Marca una notificación como leída al hacer clic (H10.7)
  const handleClick = async (notif) => {
    if (notif.leido) return;
    try {
      await markAsRead(notif.id);
      setNotificaciones((prev) =>
        prev.map((n) => (n.id === notif.id ? { ...n, leido: true } : n))
      );
    } catch (err) {
      console.error(err);
    }
  };

  // Marcar todas como leídas (H10.7)
  const handleMarkAll = async () => {
    setMarcando(true);
    try {
      await markAllAsRead();
      setNotificaciones((prev) => prev.map((n) => ({ ...n, leido: true })));
    } catch (err) {
      console.error(err);
    } finally {
      setMarcando(false);
    }
  };

  return (
    <div className="notificaciones-page">
      <div className="notificaciones-page__header">
        <div>
          <h1>Notificaciones</h1>
          <p>Revisa todos los eventos de tu cuenta</p>
        </div>
        {hayNoLeidas && (
          <button
            className="btn-marcar-todas"
            onClick={handleMarkAll}
            disabled={marcando}
          >
            {marcando ? 'Marcando…' : 'Marcar todas como leídas'}
          </button>
        )}
      </div>

      {loading && <p className="notificaciones-loading">Cargando notificaciones…</p>}

      {!loading && notificaciones.length === 0 && (
        <div className="notificaciones-empty">
          <span className="notificaciones-empty__icon">🔔</span>
          <p>No tienes notificaciones por el momento.</p>
        </div>
      )}

      {!loading && notificaciones.length > 0 && (
        <div className="notificaciones-lista">
          {notificaciones.map((notif) => (
            <div
              key={notif.id}
              className={`notificacion-item${notif.leido ? '' : ' no-leida'}`}
              onClick={() => handleClick(notif)}
            >
              {/* Icono */}
              <div className={`notificacion-item__icono ${notif.tipo}`}>
                {ICONOS[notif.tipo] || '🔔'}
              </div>

              {/* Contenido */}
              <div className="notificacion-item__cuerpo">
                <div className={`notificacion-item__tipo ${notif.tipo}`}>
                  {LABELS[notif.tipo] || notif.tipo}
                </div>
                <p className="notificacion-item__descripcion">{notif.descripcion}</p>
                <div className="notificacion-item__fecha">{formatFecha(notif.fecha)}</div>
              </div>

              {/* Punto si no leída */}
              {!notif.leido && <div className="notificacion-item__dot" />}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}