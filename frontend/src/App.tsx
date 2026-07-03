import { useState, useEffect } from "react";
import ChatWindow from "./components/ChatWindow";
import MessageInput from "./components/MessageInput";
import logo from "./assets/logo.png";
import {
  API_URL,
  getSessions,
  createSession,
  getSessionMessages,
  deleteSession,
  type ChatSession,
  type ChatMessage
} from "./services/api";
import "./App.css";

function App() {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string>("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async (selectFirst = true) => {
    try {
      const data = await getSessions();
      setSessions(data);
      if (data.length > 0) {
        if (selectFirst && !activeSessionId) {
          setActiveSessionId(data[0].id);
        }
      } else {
        handleNewChat();
      }
    } catch (error) {
      console.error("Error loading chat sessions:", error);
    }
  };

  useEffect(() => {
    if (activeSessionId) {
      if (activeSessionId.startsWith("temp-")) {
        return;
      }
      setMessages([]); 
      loadHistory(activeSessionId);
    }
  }, [activeSessionId]);

  const loadHistory = async (sessionId: string) => {
    try {
      const history = await getSessionMessages(sessionId);
      if (history.length === 0) {
        setMessages([
          {
            sender: "bot",
            text: "Hello! I'm NETSOL's AI Assistant. How can I help you today?",
          },
        ]);
      } else {
        setMessages(history);
      }
    } catch (error) {
      console.error("Error loading messages:", error);
    }
  };

  const handleNewChat = async () => {
    const tempId = "temp-" + Date.now();
    const tempSession: ChatSession = {
      id: tempId,
      title: "New Chat",
      created_at: new Date().toISOString()
    };
    
    setSessions((prev) => [tempSession, ...prev]);
    setActiveSessionId(tempId);
    setMessages([
      {
        sender: "bot",
        text: "Hello! I'm NETSOL's AI Assistant. How can I help you today?",
      },
    ]);
    
    try {
      const realSession = await createSession("New Chat");
      
      setSessions((prev) => 
        prev.map((s) => (s.id === tempId ? realSession : s))
      );
      
      setActiveSessionId((current) => (current === tempId ? realSession.id : current));
    } catch (error) {
      console.error("Error creating session in database:", error);
      setSessions((prev) => prev.filter((s) => s.id !== tempId));
      fetchSessions();
    }
  };


  // Updated
    // Send message and STREAM the tokens back dynamically
  const handleSend = async (userMessage: string) => {
    if (!activeSessionId) return;

    // Save history array before sending to help title check
    const currentMessagesLength = messages.length;

    // Display user message instantly
    const newMessages: ChatMessage[] = [
      ...messages,
      { text: userMessage, sender: "user" },
    ];
    setMessages(newMessages);
    setLoading(true); // Keep typing indicator active during fetch

    try {
      // Fetch stream from backend
      const response = await fetch(`${API_URL}/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: userMessage,
          session_id: activeSessionId,
        }),
      });

      if (!response.body) throw new Error("No response body");
      
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let botResponse = "";
      let hasAddedBotMessage = false;

      // Loop to read stream chunks
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        
        const chunk = decoder.decode(value, { stream: true });
        
        // Add the bot message element ONLY when the first word actually arrives
        if (!hasAddedBotMessage) {
          setLoading(false); // Hide bouncing dots
          setMessages((prev) => [...prev, { sender: "bot", text: chunk }]);
          hasAddedBotMessage = true;
          botResponse = chunk;
        } else {
          botResponse += chunk;
          setMessages((prev) => {
            const updated = [...prev];
            if (updated.length > 0) {
              updated[updated.length - 1] = { sender: "bot", text: botResponse };
            }
            return updated;
          });
        }
      }

      // Reload sessions list to update title if it was first message
      const isFirstMessage = currentMessagesLength <= 1;
      if (isFirstMessage) {
        fetchSessions(false);
      }
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          text: "Something went wrong. Please try again.",
          sender: "bot",
        },
      ]);
      setLoading(false);
    }
  };

  const handleDeleteSession = async (sessionId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!window.confirm("Are you sure you want to delete this conversation?")) return;

    try {
      await deleteSession(sessionId);
      const updatedSessions = sessions.filter((s) => s.id !== sessionId);
      setSessions(updatedSessions);

      if (activeSessionId === sessionId) {
        if (updatedSessions.length > 0) {
          setActiveSessionId(updatedSessions[0].id);
        } else {
          handleNewChat();
        }
      }
    } catch (error) {
      console.error("Error deleting session:", error);
    }
  };

  const activeSession = sessions.find((s) => s.id === activeSessionId);
  const activeTitle = activeSession ? activeSession.title : "New Chat";

  return (
    <div className="app-layout">
      {/* Sidebar - Lighter theme */}
      <aside className={`app-sidebar ${sidebarOpen ? "open" : "collapsed"}`}>
        <div className="sidebar-header">
          <button className="new-chat-button" onClick={handleNewChat}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            New Chat
          </button>
        </div>
        
        <div className="sessions-list">
          {sessions.map((session) => (
            <div
              key={session.id}
              className={`session-item ${session.id === activeSessionId ? "active" : ""}`}
              onClick={() => setActiveSessionId(session.id)}
            >
              <div className="session-item-left">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
                <span className="session-title" title={session.title}>
                  {session.title}
                </span>
              </div>
              <button
                className="delete-session-btn"
                onClick={(e) => handleDeleteSession(session.id, e)}
                title="Delete Chat"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="3 6 5 6 21 6" />
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      </aside>

      {/* Main Chat Panel */}
      <div className="main-chat-container">
        <header className="app-header">
          <div className="header-left">
            <button className="sidebar-toggle" onClick={() => setSidebarOpen(!sidebarOpen)}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            </button>
            <div className="header-text">
              <span className="header-title">{activeTitle}</span>
              <span className="header-subtitle">NETSOL AI Assistant</span>
            </div>
          </div>
          <div className="header-status">
            <span className="status-dot" />
            Active
          </div>
        </header>

        {/* Chat window */}
        <ChatWindow messages={messages} />

        {loading && (
          <div className="typing-indicator-container">
            <img src={logo} alt="N" className="typing-indicator-avatar" />
            <div className="typing-indicator">
              <span />
              <span />
              <span />
            </div>
          </div>
        )}

        <MessageInput onSend={handleSend} disabled={loading} />
      </div>
    </div>
  );
}

export default App;