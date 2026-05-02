export function ChatPanel() {
  return (
    <section>
      <h2>Chat with Drive</h2>
      <div className="card">
        <p>Ask questions about indexed files.</p>
      </div>
      <textarea rows={5} placeholder="Ask DriveMind something..." />
      <div style={{ marginTop: 12 }}>
        <button>Ask</button>
      </div>
    </section>
  );
}
