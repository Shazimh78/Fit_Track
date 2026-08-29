import { useEffect, useRef, useState } from "react";
import { chatApi } from "../api/endpoints";

export default function Chat() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function handleSend(e) {
    e.preventDefault();
    const text = input.trim();
    if (!text || sending) return;

    setError("");
    setInput("");
    setMessages((prev) => [...prev, { role: "user", text }]);
    setSending(true);

    try {
      const { data } = await chatApi.send(text);
      setMessages((prev) => {
        // Prefer the server's authoritative history when it comes back;
        // fall back to appending locally if history is empty for some reason.
        if (data.history?.length) return data.history;
        return [...prev, { role: "assistant", text: data.reply }];
      });
    } catch (err) {
      setError(err.response?.data?.detail ?? "Couldn't reach the assistant. Try again.");
      setMessages((prev) => prev.slice(0, -1)); // roll back the optimistic user message
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="flex flex-col h-[calc(100vh-6.5rem)] md:h-[calc(100vh-5rem)]">
      <div className="mb-4">
        <h1 className="font-display text-4xl tracking-wide mb-1">Diet & fitness chat</h1>
        <p className="text-mute text-sm">
          Ask about meal planning, nutrition basics, or general workout questions. Not a
          substitute for a doctor or registered dietitian.
        </p>
      </div>

      <div className="flex-1 overflow-y-auto bg-panel border border-line rounded-lg p-5 space-y-4">
        {messages.length === 0 && (
          <p className="text-mute text-sm">Ask something like "what should I eat before a workout?"</p>
        )}
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
            <div
              className={[
                "max-w-[85%] sm:max-w-[75%] rounded-lg px-4 py-2.5 text-sm leading-relaxed whitespace-pre-wrap",
                m.role === "user" ? "bg-volt text-ink" : "bg-panel2 text-bone",
              ].join(" ")}
            >
              {m.text}
            </div>
          </div>
        ))}
        {sending && <p className="text-mute text-sm">Thinking...</p>}
        <div ref={bottomRef} />
      </div>

      {error && (
        <div className="bg-ember/10 border border-ember/30 text-ember text-sm rounded-md px-4 py-2 mt-3">
          {error}
        </div>
      )}

      <form onSubmit={handleSend} className="flex gap-2 mt-3">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type a message..."
          className="input flex-1"
        />
        <button type="submit" disabled={sending || !input.trim()} className="btn-primary shrink-0">
          Send
        </button>
      </form>
    </div>
  );
}
