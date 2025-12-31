import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";


export default function AskChat() {
  const navigate = useNavigate();
  const [messages, setMessages] = useState([
    { id: 1, sender: "bot", text: "Hi! I'm KidBot, ask me anything." },
  ]);
  const [input, setInput] = useState("");
  const listRef = useRef(null);
  const [loading, setLoading] = useState(false);

  // Update this if your backend runs on a different port
  const BACKEND_URL = "http://localhost:8000";

  // Auto-scroll to bottom
  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [messages]);

  async function send() {
    const text = input.trim();
    if (!text) return;

    // 1. Add User Message
    const userMsg = { id: Date.now(), sender: "user", text };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch(`${BACKEND_URL}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          estimated_age: 7
        }),
      });

      const data = await res.json();
      const botReply = data.reply || "I'm having trouble thinking right now.";
      
      setMessages((prev) => [
        ...prev, 
        { id: Date.now() + 1, sender: "bot", text: botReply }
      ]);

    } catch (e) {
      console.error("Chat failed:", e);
      setMessages((prev) => [
        ...prev, 
        { id: Date.now() + 1, sender: "bot", text: "Oops, I can't reach the internet right now!" }
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="kidbot-shell">
      <div className="kidbot-background">
        {/* HEADER: Kept simple inline styles for header layout */}
        <header className="w-full p-6 flex items-center justify-between bg-white z-10 shadow-sm">
          <button
            onClick={() => navigate(-1)}
            className="px-6 py-2 bg-white hover:bg-gray-50 rounded-full font-bold text-blue-500 shadow-md border-2 border-gray-100 transition-all"
          >
            ← Back
          </button>
          
          <div className="bg-white px-6 py-2 rounded-full shadow-sm border-2 border-blue-200">
            <h1 className="text-2xl font-black text-blue-500 tracking-tight m-0">KidBot</h1>
          </div>
          
          <div className="w-20" /> {/* Spacer */}
        </header>

        {/* CHAT AREA: Uses your .kidbot-chat-list class */}
        <main className="kidbot-chat-list scrollbar-hide" ref={listRef}>
          {messages.map((m) => (
            <div key={m.id} className={`flex w-full ${m.sender === "user" ? "justify-end" : "justify-start"}`}>
              {/* Uses your .chat-bubble-bot or .chat-bubble-user classes */}
              <div className={m.sender === "user" ? "chat-bubble-user" : "chat-bubble-bot"}>
                {m.text}
              </div>
            </div>
          ))}
          
          {loading && (
            <div className="flex w-full justify-start">
              <div className="chat-bubble-bot animate-pulse">
                Thinking...
              </div>
            </div>
          )}
        </main>

        {/* INPUT AREA: Uses your exact structure for .kidbot-input-container */}
        <div className="w-full flex justify-center pb-8">
          <div className="kidbot-input-container">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && send()}
              placeholder="Ask me anything!"
              disabled={loading}
              autoFocus
            />
            {/* Uses your .send-button class */}
            <button 
              onClick={send} 
              className="send-button"
              disabled={loading || !input.trim()}
            >
              {loading ? "..." : "->"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}