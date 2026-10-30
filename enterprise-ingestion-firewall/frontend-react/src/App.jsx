import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";

// const API_URL = "http://127.0.0.1:8000";
const API_URL = import.meta.env.VITE_API_URL;

const suggestions = [
  "My payment was deducted twice.",
  "Where is my order?",
  "How can I reset my password?",
  "What is your refund policy?",
];

function formatRelativeTime(dateValue) {
  if (!dateValue) {
    return "";
  }

  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const now = new Date();
  const diffMs = now - date;

  if (diffMs < 0) {
    return "Just now";
  }

  const seconds = Math.floor(diffMs / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (seconds < 10) {
    return "Just now";
  }

  if (seconds < 60) {
    return `${seconds} sec ago`;
  }

  if (minutes < 60) {
    return minutes === 1 ? "1 min ago" : `${minutes} mins ago`;
  }

  if (hours < 24) {
    return hours === 1 ? "1 hr ago" : `${hours} hrs ago`;
  }

  if (days === 1) {
    return "1 day ago";
  }

  return `${days} days ago`;
}

function App() {
  // ================= CHAT STATE =================

  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [sessionId, setSessionId] = useState(null);
  const [loading, setLoading] = useState(false);

  // ================= CONVERSATIONS =================

  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] =
    useState(null);

  // ================= AI INSIGHTS =================

  const [insights, setInsights] = useState({
    intent: "Waiting for message",
    risk_profile: "—",
    priority: "—",
    requires_action: "—",
    estimated_input_tokens: "—",
  });

  // ================= TIME REFRESH =================

  const [, setTimeTick] = useState(0);

  useEffect(() => {
    loadConversations();

    const timer = setInterval(() => {
      setTimeTick((value) => value + 1);
    }, 30000);

    return () => clearInterval(timer);
  }, []);

  // ================= LOAD CONVERSATIONS =================

  const loadConversations = async () => {
    try {
      const response = await fetch(
        `${API_URL}/api/conversations`
      );

      if (!response.ok) {
        throw new Error("Failed to load conversations");
      }

      const data = await response.json();

      const conversationList = Array.isArray(data)
        ? data
        : data.conversations || [];

      setConversations(conversationList);
    } catch (error) {
      console.error(
        "Conversation loading error:",
        error
      );
    }
  };

  // ================= OPEN CONVERSATION =================

  const openConversation = async (conversation) => {
    try {
      setLoading(true);

      const response = await fetch(
        `${API_URL}/api/conversations/${conversation.id}/messages`
      );

      if (!response.ok) {
        throw new Error(
          "Failed to load conversation"
        );
      }

      const data = await response.json();

      const conversationMessages = Array.isArray(data)
        ? data
        : data.messages || [];

      setSelectedConversation(conversation);

      setSessionId(conversation.id);

      setMessages(
        conversationMessages.map((item) => ({
          id: `${item.id}-${item.role}`,
          role: item.role,
          content: item.content,
          created_at: item.created_at,
        }))
      );

      setInsights({
        intent: "Waiting for message",
        risk_profile: "—",
        priority: "—",
        requires_action: "—",
        estimated_input_tokens: "—",
      });

      setMessage("");
    } catch (error) {
      console.error(
        "Open conversation error:",
        error
      );
    } finally {
      setLoading(false);
    }
  };

  // ================= NEW CHAT =================

  const startNewConversation = () => {
    setSessionId(null);
    setSelectedConversation(null);
    setMessages([]);
    setMessage("");

    setInsights({
      intent: "Waiting for message",
      risk_profile: "—",
      priority: "—",
      requires_action: "—",
      estimated_input_tokens: "—",
    });
  };

  // ================= SEND MESSAGE =================

  const sendMessage = async () => {
    const trimmedMessage = message.trim();

    if (!trimmedMessage || loading) {
      return;
    }

    const currentSessionId = sessionId;

    // Immediately show user's message.
    const userMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content: trimmedMessage,
      created_at: new Date().toISOString(),
    };

    setMessages((previous) => [
      ...previous,
      userMessage,
    ]);

    setMessage("");
    setLoading(true);

    try {
      const response = await fetch(
        `${API_URL}/api/analyze`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            message: trimmedMessage,
            session_id: currentSessionId,
          }),
        }
      );

      if (!response.ok) {
        let errorMessage =
          "The backend could not process your request.";

        try {
          const errorData = await response.json();

          if (errorData?.detail) {
            if (typeof errorData.detail === "string") {
              errorMessage = errorData.detail;
            }
          }
        } catch {
          // Keep default error message.
        }

        throw new Error(errorMessage);
      }

      const data = await response.json();

      // ================= SESSION =================

      const returnedSessionId = data.session_id;

      setSessionId(returnedSessionId);

      // ================= INSIGHTS =================

      setInsights({
        intent: data.intent || "unknown",

        risk_profile:
          data.risk_profile || "unknown",

        priority:
          data.priority || "unknown",

        requires_action:
          data.requires_action === true
            ? "Yes"
            : data.requires_action === false
              ? "No"
              : "—",

        estimated_input_tokens:
          data.token_metadata
            ?.estimated_input_tokens ?? "—",
      });

      // ================= AI RESPONSE =================

      const responseText =
        data.response_markdown ||
        data.response ||
        "";

      const assistantMessageId =
        `assistant-${Date.now()}`;

      setMessages((previous) => [
        ...previous,
        {
          id: assistantMessageId,
          role: "assistant",
          content: "",
          created_at: new Date().toISOString(),
        },
      ]);

      // ================= WORD-BY-WORD DISPLAY =================

      const words = responseText.split(/(\s+)/);

      let currentText = "";

      for (let i = 0; i < words.length; i++) {
        currentText += words[i];

        const textSnapshot = currentText;

        setMessages((previous) =>
          previous.map((item) =>
            item.id === assistantMessageId
              ? {
                  ...item,
                  content: textSnapshot,
                }
              : item
          )
        );

        await new Promise((resolve) =>
          setTimeout(resolve, 30)
        );
      }

      // ================= REFRESH HISTORY =================

      await loadConversations();

    } catch (error) {
      console.error(
        "Send message error:",
        error
      );

      // Remove empty assistant response if any.
      setMessages((previous) =>
        previous.filter(
          (item) =>
            !(
              item.role === "assistant" &&
              item.content === ""
            )
        )
      );

      // Show actual error.
      setMessages((previous) => [
        ...previous,
        {
          id: `error-${Date.now()}`,
          role: "assistant",
          content:
            error.message ||
            "Sorry, I could not process your request. Please check that the backend is running.",
          created_at: new Date().toISOString(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  // ================= ENTER KEY =================

  const handleKeyDown = (event) => {
    if (
      event.key === "Enter" &&
      !event.shiftKey
    ) {
      event.preventDefault();
      sendMessage();
    }
  };

  // ================= RENDER MESSAGE =================

  const renderMessage = (item) => {
    if (!item.content) {
      return null;
    }

    // USER MESSAGE
    if (item.role === "user") {
      return (
        <p className="user-message-text">
          {item.content}
        </p>
      );
    }

    // AI MESSAGE
    return (
      <div className="markdown-content">
        <ReactMarkdown>
          {item.content}
        </ReactMarkdown>
      </div>
    );
  };

  return (
    <div className="app-shell">

      {/* ================= LEFT SIDEBAR ================= */}

      <aside className="sidebar">

        <div className="brand">
          <div className="brand-mark">
            E
          </div>

          <div>
            <h1>Enterprise AI</h1>
            <p>Support Intelligence</p>
          </div>
        </div>

        <button
          className="new-chat-button"
          onClick={startNewConversation}
        >
          <span className="new-chat-icon">
            +
          </span>

          New conversation
        </button>

        <div className="sidebar-section">

          <div className="section-heading">
            <span>
              Recent conversations
            </span>
          </div>

          <div className="conversation-list">

            {conversations.map(
              (conversation) => (

                <button
                  className={
                    "conversation-item" +
                    (
                      selectedConversation?.id ===
                      conversation.id
                        ? " active"
                        : ""
                    )
                  }
                  key={conversation.id}
                  onClick={() =>
                    openConversation(
                      conversation
                    )
                  }
                >

                  <div className="conversation-icon">
                    ◇
                  </div>

                  <div className="conversation-content">

                    <span className="conversation-title">
                      {conversation.title}
                    </span>

                    <span className="conversation-time">
                      {formatRelativeTime(
                        conversation.updated_at ||
                        conversation.created_at
                      )}
                    </span>

                  </div>

                </button>

              )
            )}

          </div>
        </div>

        <div className="sidebar-bottom">

          <div className="system-status">

            <span className="status-indicator"></span>

            <div>

              <strong>
                System online
              </strong>

              <span>
                FastAPI · Groq · MySQL
              </span>

            </div>

          </div>

          <div className="sidebar-footer">
            Enterprise Ingestion Firewall
          </div>

        </div>

      </aside>

      {/* ================= MAIN CONTENT ================= */}

      <main className="main-content">

        <header className="topbar">

          <div className="topbar-content">

            <span className="topbar-label">
              CUSTOMER SUPPORT
            </span>

            <h2>
              AI Support Workspace
            </h2>

          </div>

        </header>

        {/* ================= CHAT ================= */}

        <section className="chat-panel">

          <div className="chat-scroll">

            {messages.length === 0 ? (

              <div className="welcome-state">

                <div className="welcome-icon">
                  ✦
                </div>

                <span className="welcome-label">
                  INTELLIGENT SUPPORT
                </span>

                <h3>
                  How can we help your customer today?
                </h3>

                <p>
                  Ask about orders, payments,
                  refunds, delivery, billing,
                  or account support.
                </p>

                <div className="suggestion-grid">

                  {suggestions.map(
                    (suggestion) => (

                      <button
                        key={suggestion}
                        className="suggestion-card"
                        onClick={() =>
                          setMessage(
                            suggestion
                          )
                        }
                      >

                        <span>
                          {suggestion}
                        </span>

                        <span className="suggestion-arrow">
                          →
                        </span>

                      </button>

                    )
                  )}

                </div>

              </div>

            ) : (

              <div className="message-list">

                {messages.map((item) => (

                  <div
                    key={item.id}
                    className={
                      item.role === "user"
                        ? "message-row user-message-row"
                        : "message-row assistant-message-row"
                    }
                  >

                    <div
                      className={
                        item.role === "user"
                          ? "user-message"
                          : "assistant-message"
                      }
                    >

                      {renderMessage(item)}

                    </div>

                  </div>

                ))}

                {loading && (
                  <div className="message-row assistant-message-row">
                    <div className="assistant-message typing-message">
                      Thinking...
                    </div>
                  </div>
                )}

              </div>

            )}

          </div>

          {/* ================= INPUT ================= */}

          <div className="composer-wrapper">

            <div className="composer">

              <textarea
                value={message}
                onChange={(event) =>
                  setMessage(
                    event.target.value
                  )
                }
                onKeyDown={handleKeyDown}
                placeholder="Ask a customer-support question..."
                rows="1"
                disabled={loading}
              />

              <button
                className="send-button"
                onClick={sendMessage}
                disabled={
                  loading ||
                  !message.trim()
                }
              >
                ↑
              </button>

            </div>

            <p className="composer-hint">
              Enter to send · Shift + Enter for a new line
            </p>

          </div>

        </section>

      </main>

      {/* ================= RIGHT SIDEBAR ================= */}

      <aside className="insights-panel">

        <div className="insights-header">

          <div>

            <span className="insights-label">
              AI ANALYSIS
            </span>

            <h3>
              Message insights
            </h3>

          </div>

          <div className="insights-symbol">
            ◇
          </div>

        </div>

        <p className="insights-description">
          Structured analysis from the message
          classification layer will appear here.
        </p>

        {/* INTENT */}

        <div className="insight-card">

          <div className="insight-top">

            <span>
              Intent
            </span>

            <span className="insight-icon">
              ◇
            </span>

          </div>

          <strong
            className={
              insights.intent ===
              "Waiting for message"
                ? "insight-value muted-value"
                : "insight-value"
            }
          >
            {insights.intent}
          </strong>

        </div>

        {/* RISK */}

        <div className="insight-card">

          <div className="insight-top">

            <span>
              Risk profile
            </span>

            <span className="insight-icon">
              ◉
            </span>

          </div>

          <strong className="insight-value">
            {insights.risk_profile}
          </strong>

        </div>

        {/* PRIORITY */}

        <div className="insight-card">

          <div className="insight-top">

            <span>
              Priority
            </span>

            <span className="insight-icon">
              ⚑
            </span>

          </div>

          <strong className="insight-value">
            {insights.priority}
          </strong>

        </div>

        {/* ACTION */}

        <div className="insight-card">

          <div className="insight-top">

            <span>
              Action required
            </span>

            <span className="insight-icon">
              ✓
            </span>

          </div>

          <strong className="insight-value">
            {insights.requires_action}
          </strong>

        </div>

        {/* TOKEN */}

        <div className="token-card">

          <div>

            <span className="token-label">
              ESTIMATED INPUT
            </span>

            <strong>
              {insights.estimated_input_tokens}
            </strong>

          </div>

          <span className="token-unit">
            tokens
          </span>

        </div>

        <div className="insights-note">
          These values are generated from the
          structured LLM classification response.
        </div>

      </aside>

    </div>
  );
}

export default App;