export default function ChatbotMessage({ message }) {
  return (
    <div
      className={`ap-chatbot-message ${
        message.sender === "user"
          ? "user"
          : "bot"
      }`}
    >
      <div className="ap-chatbot-bubble">
        {message.text}
      </div>
    </div>
  );
}