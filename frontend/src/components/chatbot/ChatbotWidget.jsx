import { useState } from "react";
import "./Chatbot.css";
import ChatbotWindow from "./ChatbotWindow";

export default function ChatbotWidget() {
  const [open, setOpen] = useState(false);

  return (
    <>
      {open && <ChatbotWindow closeChat={() => setOpen(false)} />}

      <button
        className={`ap-chatbot-fab ${open ? "hidden" : ""}`}
        onClick={() => setOpen(true)}
      >
        <svg
          width="28"
          height="28"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
        </svg>
      </button>
    </>
  );
}