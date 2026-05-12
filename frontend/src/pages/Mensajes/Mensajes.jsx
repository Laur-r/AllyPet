import { useState, useEffect, useRef } from 'react';
import { getConversations, getMessages, sendMessage } from '../../services/message.service';
import './Mensajes.css';

// Formatea timestamp a hora HH:MM
const formatHora = (ts) =>
  new Date(ts).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' });

// Formatea timestamp a fecha relativa
const formatFecha = (ts) => {
  const d = new Date(ts);
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

  const [conversaciones, setConversaciones]   = useState([]);
  const [chatActivo, setChatActivo]           = useState(null); // objeto conversación
  const [mensajes, setMensajes]               = useState([]);
  const [contenido, setContenido]             = useState('');
  const [loadingConvs, setLoadingConvs]       = useState(true);
  const [loadingMsgs, setLoadingMsgs]         = useState(false);
  const [enviando, setEnviando]               = useState(false);
  const [confirmacion, setConfirmacion]       = useState(false);
  const bottomRef = useRef(null);

  // Carga conversaciones al montar
  useEffect(() => {
    const fetchConversaciones = async () => {
      try {
        const data = await getConversations();
        setConversaciones(data);
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
        // Actualiza badge de no leídos en la conversación
        setConversaciones((prev) =>
          prev.map((c) =>
            c.interlocutor_id === chatActivo.interlocutor_id ? { ...c, no_leidos: 0 } : c
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
        destinatario_id: chatActivo.interlocutor_id,
        contenido: contenido.trim(),
      });
      // Agrega el mensaje optimistamente
      setMensajes((prev) => [...prev, res.data]);
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

      {/* ---- Sidebar: conversaciones ---- */}
      <aside className="mensajes-sidebar">
        <div className="mensajes-sidebar__header">
          <h2>Mensajes</h2>
          <p>Tus conversaciones activas</p>
        </div>

        <div className="mensajes-sidebar__list">
          {loadingConvs && <p className="mensajes-loading">Cargando conversaciones…</p>}

          {!loadingConvs && conversaciones.length === 0 && (
            <p className="mensajes-loading">Aún no tienes conversaciones.</p>
          )}

          {conversaciones.map((conv) => (
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

      {/* ---- Panel derecho: chat ---- */}
      <section className="mensajes-chat">
        {!chatActivo ? (
          <div className="mensajes-chat__empty">
            <span className="mensajes-chat__empty-icon">💬</span>
            <p>Selecciona una conversación para comenzar</p>
          </div>
        ) : (
          <>
            {/* Header */}
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

            {/* Mensajes */}
            <div className="mensajes-chat__body">
              {loadingMsgs && <p className="mensajes-loading">Cargando mensajes…</p>}

              {!loadingMsgs && mensajes.length === 0 && (
                <p className="mensajes-loading">Sé el primero en escribir 👋</p>
              )}

              {mensajes.map((msg) => {
                const esMio = msg.remitente_id === usuarioActual.id;
                return (
                  <div
                    key={msg.id}
                    className={`mensaje-burbuja ${esMio ? 'enviado' : 'recibido'}`}
                  >
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

            {/* Input */}
            <div className="mensajes-chat__footer">
              <textarea
                className="mensajes-chat__input"
                placeholder="Escribe un mensaje…"
                value={contenido}
                onChange={(e) => setContenido(e.target.value)}
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