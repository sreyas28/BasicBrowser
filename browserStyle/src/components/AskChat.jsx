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

  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

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
    <div className="kidbot-shell fixed inset-0 w-full h-full overflow-hidden">
      <div className="kidbot-background w-full h-full flex flex-col justify-start items-stretch">
        {/* HEADER: Fixed at top */}
        <header className="w-full h-[80px] px-6 flex items-center justify-between bg-white/90 backdrop-blur-sm z-50 shadow-sm flex-none relative border-b border-blue-100/50">
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

        {/* CHAT AREA: Scrollable middle section */}
        {/* Removed bg-gray-50 and radial gradient to show parent background */}
        <div className="flex-1 w-full overflow-y-auto px-4 py-6 scroll-smooth">
          <main className="kidbot-chat-list max-w-4xl mx-auto flex flex-col gap-6 min-h-0 pb-4">
            {messages.map((m) => (
              <div key={m.id} className={`flex w-full ${m.sender === "user" ? "justify-end" : "justify-start"}`}>
                <div className={m.sender === "user" ? "chat-bubble-user" : "chat-bubble-bot shadow-md"}>
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
            <div ref={messagesEndRef} />
          </main>
        </div>

        {/* INPUT AREA: Fixed at bottom */}
        {/* Adjusted background to be slightly transparent */}
        <div className="flex-none w-full bg-white/80 backdrop-blur-md p-4 pb-6 border-t border-white/50 flex justify-center z-50">
          <div className="kidbot-input-container w-full max-w-3xl flex gap-3 shadow-xl">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && send()}
              placeholder="Ask me anything!"
              disabled={loading}
              autoFocus
              className="flex-1 bg-white border-2 border-gray-300 rounded-full px-6 py-3 text-lg focus:outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-100 transition-all"
            />
            {/* Uses your .send-button class */}
            <button
              onClick={send}
              className="send-button bg-red-500 hover:bg-red-600 active:scale-95 text-white font-bold rounded-full w-14 h-14 flex items-center justify-center shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={loading || !input.trim()}
            >
              {loading ? <span className="animate-spin">⌛</span> : "➜"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}