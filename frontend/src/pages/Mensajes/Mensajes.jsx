import { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { getConversations, getMessages, sendMessage } from '../../services/message.service';
import './Mensajes.css';

const formatHora = (ts) =>
  new Date(ts).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' });

const formatFecha = (ts) => {
  const d   = new Date(ts);
  const hoy = new Date();
  if (d.toDateString() === hoy.toDateString()) return formatHora(ts);
  return d.toLocaleDateString('es-CO', { day: '2-digit', month: 'short' });
};

const AvatarPlaceholder = ({ nombre, size = 46 }) => (
  <div
    className="conversacion-item__avatar-placeholder"
    style={{ width: size, height: size, fontSize: size * 0.38 }}
  >
    {nombre?.charAt(0).toUpperCase() || '?'}
  </div>
);

export default function Mensajes() {
  const usuarioActual = JSON.parse(localStorage.getItem('user') || '{}');
  const location      = useLocation();
  const preset        = location.state; // { destinatario_id, destinatario_nombre, destinatario_foto, solicitud_id }
  console.log('preset recibido:', preset); 

  const [conversaciones, setConversaciones] = useState([]);
  const [chatActivo,     setChatActivo]     = useState(null);
  const [mensajes,       setMensajes]       = useState([]);
  const [contenido,      setContenido]      = useState('');
  const [loadingConvs,   setLoadingConvs]   = useState(true);
  const [loadingMsgs,    setLoadingMsgs]    = useState(false);
  const [enviando,       setEnviando]       = useState(false);
  const [confirmacion,   setConfirmacion]   = useState(false);
  const bottomRef = useRef(null);

  // Carga conversaciones
  useEffect(() => {
    const fetchConversaciones = async () => {
      try {
        const data = await getConversations();
        setConversaciones(data);

        // Si llegamos desde el historial con un destinatario preset:
        if (preset?.destinatario_id) {
          // Busca si ya existe conversación con ese usuario
          const existente = data.find(c => c.interlocutor_id === preset.destinatario_id);
          if (existente) {
            setChatActivo(existente);
          } else {
            // No existe aún — crea un objeto temporal para abrir el chat en blanco
            setChatActivo({
              interlocutor_id:     preset.destinatario_id,
              interlocutor_nombre: preset.destinatario_nombre || 'Paseador',
              interlocutor_foto:   preset.destinatario_foto || null,
              solicitud_id:        preset.solicitud_id || null,
              ultimo_mensaje:      '',
              no_leidos:           0,
            });
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingConvs(false);
      }
    };
    fetchConversaciones();
  }, []);

  // Carga mensajes cuando cambia el chat activo
  useEffect(() => {
    if (!chatActivo) return;
    const fetchMensajes = async () => {
      setLoadingMsgs(true);
      try {
        const data = await getMessages(chatActivo.interlocutor_id);
        setMensajes(data);
        setConversaciones(prev =>
          prev.map(c =>
            c.interlocutor_id === chatActivo.interlocutor_id
              ? { ...c, no_leidos: 0 }
              : c
          )
        );
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingMsgs(false);
      }
    };
    fetchMensajes();
  }, [chatActivo]);

  // Scroll al último mensaje
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [mensajes]);

  const handleOpenChat = (conv) => {
    setChatActivo(conv);
    setMensajes([]);
  };

  const handleSend = async () => {
    if (!contenido.trim() || !chatActivo || enviando) return;
    setEnviando(true);
    try {
      const res = await sendMessage({
        solicitud_id:    chatActivo.solicitud_id || preset?.solicitud_id || null,
        destinatario_id: chatActivo.interlocutor_id,
        contenido:       contenido.trim(),
      });

      const nuevoMensaje = res.data;
      setMensajes(prev => [...prev, nuevoMensaje]);

      // Actualiza o agrega la conversación en el sidebar
      setConversaciones(prev => {
        const existe = prev.find(c => c.interlocutor_id === chatActivo.interlocutor_id);
        if (existe) {
          return prev.map(c =>
            c.interlocutor_id === chatActivo.interlocutor_id
              ? { ...c, ultimo_mensaje: contenido.trim(), fecha_envio: nuevoMensaje.fecha_envio, remitente_id: usuarioActual.id }
              : c
          );
        }
        // Primera vez — agrega la conversación al sidebar
        return [{
          interlocutor_id:     chatActivo.interlocutor_id,
          interlocutor_nombre: chatActivo.interlocutor_nombre,
          interlocutor_foto:   chatActivo.interlocutor_foto,
          ultimo_mensaje:      contenido.trim(),
          fecha_envio:         nuevoMensaje.fecha_envio,
          remitente_id:        usuarioActual.id,
          no_leidos:           0,
        }, ...prev];
      });

      setContenido('');
      setConfirmacion(true);
      setTimeout(() => setConfirmacion(false), 2500);
    } catch (err) {
      alert(err.message);
    } finally {
      setEnviando(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className={`mensajes-page${chatActivo ? ' chat-abierto' : ''}`}>

      {/* ── Sidebar ── */}
      <aside className="mensajes-sidebar">
        <div className="mensajes-sidebar__header">
          <h2>Mensajes</h2>
          <p>Tus conversaciones activas</p>
        </div>

        <div className="mensajes-sidebar__list">
          {loadingConvs && <p className="mensajes-loading">Cargando conversaciones…</p>}

          {!loadingConvs && conversaciones.length === 0 && !preset && (
            <p className="mensajes-loading">Aún no tienes conversaciones.</p>
          )}

          {conversaciones.map(conv => (
            <div
              key={conv.interlocutor_id}
              className={`conversacion-item${chatActivo?.interlocutor_id === conv.interlocutor_id ? ' activa' : ''}`}
              onClick={() => handleOpenChat(conv)}
            >
              {conv.interlocutor_foto ? (
                <img
                  src={`http://localhost:3006/uploads/${conv.interlocutor_foto}`}
                  alt={conv.interlocutor_nombre}
                  className="conversacion-item__avatar"
                />
              ) : (
                <AvatarPlaceholder nombre={conv.interlocutor_nombre} />
              )}

              <div className="conversacion-item__info">
                <div className="conversacion-item__nombre">{conv.interlocutor_nombre}</div>
                <div className="conversacion-item__ultimo">
                  {conv.remitente_id === usuarioActual.id ? 'Tú: ' : ''}
                  {conv.ultimo_mensaje}
                </div>
              </div>

              <div className="conversacion-item__meta">
                <span className="conversacion-item__fecha">{formatFecha(conv.fecha_envio)}</span>
                {conv.no_leidos > 0 && (
                  <span className="badge-noleidos">{conv.no_leidos}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </aside>

      {/* ── Panel chat ── */}
      <section className="mensajes-chat">
        {!chatActivo ? (
          <div className="mensajes-chat__empty">
            <span className="mensajes-chat__empty-icon">💬</span>
            <p>Selecciona una conversación para comenzar</p>
          </div>
        ) : (
          <>
            <div className="mensajes-chat__header">
              {chatActivo.interlocutor_foto ? (
                <img
                  src={`http://localhost:3006/uploads/${chatActivo.interlocutor_foto}`}
                  alt={chatActivo.interlocutor_nombre}
                  className="mensajes-chat__header-avatar"
                />
              ) : (
                <AvatarPlaceholder nombre={chatActivo.interlocutor_nombre} size={40} />
              )}
              <span className="mensajes-chat__header-nombre">
                {chatActivo.interlocutor_nombre}
              </span>
            </div>

            <div className="mensajes-chat__body">
              {loadingMsgs && <p className="mensajes-loading">Cargando mensajes…</p>}

              {!loadingMsgs && mensajes.length === 0 && (
                <p className="mensajes-loading">
                  Sé el primero en escribir 👋
                </p>
              )}

              {mensajes.map(msg => {
                const esMio = msg.remitente_id === usuarioActual.id;
                return (
                  <div key={msg.id} className={`mensaje-burbuja ${esMio ? 'enviado' : 'recibido'}`}>
                    {msg.contenido}
                    <div className="mensaje-burbuja__hora">{formatHora(msg.fecha_envio)}</div>
                  </div>
                );
              })}

              {confirmacion && (
                <div className="mensaje-confirmacion">✓ Mensaje enviado</div>
              )}

              <div ref={bottomRef} />
            </div>

            <div className="mensajes-chat__footer">
              <textarea
                className="mensajes-chat__input"
                placeholder="Escribe un mensaje…"
                value={contenido}
                onChange={e => setContenido(e.target.value)}
                onKeyDown={handleKeyDown}
                rows={1}
              />
              <button
                className="mensajes-chat__send-btn"
                onClick={handleSend}
                disabled={!contenido.trim() || enviando}
                title="Enviar"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M22 2L11 13" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                  <path d="M22 2L15 22L11 13L2 9L22 2Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>
          </>
        )}
      </section>
    </div>
  );
}