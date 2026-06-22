import { useState } from "react";

export default function ChatbotInput({ onSend }) {
  const [message, setMessage] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!message.trim()) return;

    onSend(message);
    setMessage("");
  };

  return (
    <form
      className="ap-chatbot-input-container"
      onSubmit={handleSubmit}
    >
      <input
        type="text"
        placeholder="Escribe un mensaje..."
        value={message}
        onChange={(e) => setMessage(e.target.value)}
      />

      <button type="submit">
        ➤
      </button>
    </form>
  );
}