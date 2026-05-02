import { useState, useRef, useEffect } from "react";
import type { SearchableFileRecord } from "../lib/mockData";

interface Message {
  role: "user" | "assistant";
  text: string;
}

interface ChatPanelProps {
  selectedFile: SearchableFileRecord | null;
  onClearFile: () => void;
}

function buildContextPacket(file: SearchableFileRecord, question: string): string {
  return [
    `[Context file: ${file.path}]`,
    `[Snippet: "${(file.text ?? "").slice(0, 400)}"]`,
    ``,
    `User question: ${question}`
  ].join("\n");
}

function mockLLMResponse(file: SearchableFileRecord | null, question: string): string {
  if (!file) {
    return "No file selected. Connect a drive and select a file to ask questions about it.";
  }
  const snippet = (file.text ?? "").slice(0, 200);
  return (
    `Based on **${file.name}** (${file.path}):\n\n` +
    `> ${snippet}…\n\n` +
    `This file appears relevant to your question: "${question}". ` +
    `(Mock response — connect a real LLM API key to get live answers.)`
  );
}

export function ChatPanel({ selectedFile, onClearFile }: ChatPanelProps) {
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to latest message
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  function handleAsk() {
    const q = question.trim();
    if (!q) return;

    const userMessage: Message = { role: "user", text: q };
    setMessages((prev) => [...prev, userMessage]);
    setQuestion("");
    setLoading(true);

    // Simulate async LLM call
    setTimeout(() => {
      const answer = mockLLMResponse(selectedFile, q);
      setMessages((prev) => [...prev, { role: "assistant", text: answer }]);
      setLoading(false);
    }, 600);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleAsk();
    }
  }

  const contextPacketPreview =
    selectedFile && question.trim()
      ? buildContextPacket(selectedFile, question.trim())
      : null;
  void contextPacketPreview; // will be used when real API is wired

  return (
    <section className="chat-panel">
      <h2>Chat with Drive</h2>

      {/* Context badge */}
      {selectedFile ? (
        <div className="chat-context-badge">
          <span className="chat-context-icon">📄</span>
          <span className="chat-context-name">{selectedFile.name}</span>
          <button
            className="chat-context-clear"
            onClick={onClearFile}
            aria-label="Clear file context"
          >
            ✕
          </button>
        </div>
      ) : (
        <p className="chat-no-context">No file selected. Select a file to add context.</p>
      )}

      {/* Message history */}
      <div className="chat-history">
        {messages.length === 0 && (
          <p className="chat-empty">
            {selectedFile
              ? `Ask anything about ${selectedFile.name}.`
              : "Select a file, then ask a question."}
          </p>
        )}
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`chat-bubble chat-bubble--${msg.role}`}
          >
            <span className="chat-bubble-role">
              {msg.role === "user" ? "You" : "DriveMind"}
            </span>
            <p>{msg.text}</p>
          </div>
        ))}
        {loading && (
          <div className="chat-bubble chat-bubble--assistant chat-bubble--loading">
            <span className="chat-bubble-role">DriveMind</span>
            <p className="chat-loading-dots">···</p>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="chat-input-row">
        <textarea
          rows={3}
          placeholder={selectedFile ? `Ask about ${selectedFile.name}…` : "Select a file first…"}
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <button
          className="chat-ask-btn"
          onClick={handleAsk}
          disabled={!question.trim() || loading}
        >
          Ask
        </button>
      </div>
    </section>
  );
}
