import { useState } from "react";
import ReactMarkdown from "react-markdown";

const API_URL = "http://127.0.0.1:8000";

const examples = [
  ["Greeting", "Hi, good morning!"],
  ["Order tracking", "Where is my order?"],
  ["Payment issue", "My payment was deducted twice. Please help urgently."],
  ["Current time", "What time is it now?"],
];

function App() {
  const [message, setMessage] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(
    "Backend: http://127.0.0.1:8000"
  );
  const [error, setError] = useState("");

  const generateResponse = async () => {
    const trimmedMessage = message.trim();

    if (!trimmedMessage) {
      setStatus("Please enter a message first.");
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);
    setStatus("Generating AI response...");

    try {
      const response = await fetch(`${API_URL}/api/respond`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: trimmedMessage,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail || `Request failed (${response.status})`
        );
      }

      setResult(data);
      setStatus("Success — context-aware response generated.");
    } catch (err) {
      setError(err.message);
      setStatus("Request failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="page">
      <header className="hero">
        <div className="eyebrow">
          AI · INTENT · MARKDOWN
        </div>

        <h1>Intent-Based AI Response Generator</h1>

        <p>
          Enter a message. The AI detects its intent and generates a
          context-aware Markdown response.
        </p>
      </header>

      <section className="panel">
        <label htmlFor="message">Your message</label>

        <textarea
          id="message"
          rows="5"
          maxLength="5000"
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          placeholder="Try: Where is my order?"
        />

        <div className="examples">
          {examples.map(([label, value]) => (
            <button
              key={label}
              type="button"
              className="example"
              onClick={() => setMessage(value)}
            >
              {label}
            </button>
          ))}
        </div>

        <button
          className="primary"
          onClick={generateResponse}
          disabled={loading}
        >
          {loading ? "Generating..." : "Generate response"}
          <span aria-hidden="true">→</span>
        </button>

        <p className="status">{status}</p>
      </section>

      {error && (
        <section className="panel error-panel">
          <h2>Error</h2>
          <p>{error}</p>
        </section>
      )}

      {result && (
        <section className="panel result-panel">
          <div className="result-heading">
            <div>
              <div className="eyebrow">AI RESPONSE</div>
              <h2>Markdown Response</h2>
            </div>
          </div>

          <div className="markdown-response">
            <ReactMarkdown>
              {result.response}
            </ReactMarkdown>
          </div>

          <div className="analysis">
            <div className="eyebrow">DETECTED CONTEXT</div>

            <p>
              <strong>Intent:</strong>{" "}
              {result.analysis.intent}
            </p>

            <p>
              <strong>Risk:</strong>{" "}
              {result.analysis.risk_profile}
            </p>

            <p>
              <strong>Priority:</strong>{" "}
              {result.analysis.priority}
            </p>

            <p>
              <strong>Summary:</strong>{" "}
              {result.analysis.summary}
            </p>
          </div>
        </section>
      )}

      <footer>
        Built with React · FastAPI · Groq · Instructor · Pydantic · Markdown
      </footer>
    </main>
  );
}

export default App;