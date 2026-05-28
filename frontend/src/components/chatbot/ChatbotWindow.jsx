import { useEffect, useRef, useState } from "react";
import ChatbotMessage from "./ChatbotMessage";
import ChatbotInput from "./ChatbotInput";
import { useCurrentUser } from "../../hooks/useCurrentUser";

export default function ChatbotWindow({ closeChat }) {
  const { user } = useCurrentUser();

  const messagesEndRef = useRef(null);

  const [loading, setLoading] = useState(false);

  const [messages, setMessages] = useState([
    {
      sender: "bot",
      text: `¡Hola ${
        user?.nombre?.split(" ")[0] || ""
      }!  Soy AllyBot.

Puedo ayudarte con:
• Información de tus mascotas
• Vacunas e historial médico
• Paseadores y veterinarios
• Servicios y solicitudes

¿En qué te ayudo hoy?`,
    },
  ]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages]);

  const handleSend = async (text) => {
    if (!text.trim() || loading) return;

    const userMessage = {
      sender: "user",
      text,
    };

    setMessages((prev) => [...prev, userMessage]);

    setLoading(true);

    try {
      const token = localStorage.getItem("token");

      const response = await fetch(
        "http://localhost:3014/api/chatbot",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },

          body: JSON.stringify({
            message: text,

            userId: user?.id,
            userName: user?.nombre,
            userRole: user?.rol,
            userCity: user?.ciudad,
          }),
        }
      );

      const data = await response.json();

      const botReply = {
        sender: "bot",
        text:
          data.reply ||
          "No pude responder en este momento.",
      };

      setMessages((prev) => [
        ...prev,
        botReply,
      ]);

    } catch (error) {
      console.error("CHATBOT ERROR:", error);

      setMessages((prev) => [
        ...prev,
        {
          sender: "bot",
          text:
            "Ocurrió un error conectando con AllyBot.",
        },
      ]);

    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="ap-chatbot-window">

      {/* HEADER */}
      <div className="ap-chatbot-header">
        <div>
          <h3>AllyBot</h3>
          <span>
            Asistente virtual de AllyPet
          </span>
        </div>

        <button onClick={closeChat}>
          ✕
        </button>
      </div>

      {/* MENSAJES */}
      <div className="ap-chatbot-messages">

        {messages.map((msg, index) => (
          <ChatbotMessage
            key={index}
            message={msg}
          />
        ))}

        {loading && (
          <ChatbotMessage
            message={{
              sender: "bot",
              text: "Escribiendo...",
            }}
          />
        )}

        <div ref={messagesEndRef} />

      </div>

      {/* INPUT */}
      <ChatbotInput
        onSend={handleSend}
      />

    </div>
  );
}