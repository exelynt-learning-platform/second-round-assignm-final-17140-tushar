import React, { useState, useRef, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { sendMessage, addUserMessage, clearError, deleteMessage } from './store/chatSlice';
import { Send, Bot, User, AlertCircle, Loader2, Trash2, MessageSquare, Menu, X } from 'lucide-react';
import './App.css';

function App() {
  const [input, setInput] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  const dispatch = useDispatch();
  const { messages, isLoading, error } = useSelector((state) => state.chat);
  
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    dispatch(addUserMessage(input));
    dispatch(sendMessage(input));
    setInput('');
  };

  return (
    <div className="app-container">
      
      {/* Corner User History Panel */}
      <div className={`history-sidebar ${isSidebarOpen ? 'open' : ''}`}>
        <div className="history-header">
          <MessageSquare size={20} className="history-icon" />
          <h2>User History</h2>
          <button className="close-sidebar-btn" onClick={() => setIsSidebarOpen(false)}>
            <X size={20} />
          </button>
        </div>
        <div className="history-list">
          {messages.filter(m => m.role === 'user').map((msg) => (
            <div key={`history-${msg.id}`} className="history-item">
              <span className="history-text">
                {msg.content.length > 25 ? msg.content.substring(0, 25) + '...' : msg.content}
              </span>
            </div>
          ))}
          {messages.filter(m => m.role === 'user').length === 0 && (
            <p className="no-history">No history found</p>
          )}
        </div>
      </div>

      <div className="chat-windows-container">
        <header className="chat-header">
          <button className="mobile-menu-btn" onClick={() => setIsSidebarOpen(true)}>
            <Menu size={24} />
          </button>
          <Bot className="bot-icon-header" size={28} />
          <h1>AI Assistant</h1>
        </header>

        <div className="messages-container">
          
          {messages.length === 0 && (
            <div className="empty-state">
              <Bot size={48} className="empty-icon" />
              <h2>Welcome to AI Assistant</h2>
              <p>Send a message to start the conversation.</p>
            </div>
          )}

          {messages.map((message) => (
            <div
              key={message.id}
              className={`message-wrapper ${message.role === 'user' ? 'user-message' : 'ai-message'}`}
            >
              <div className="message-bubble">
                {message.role === 'user' && (
                  <div className="avatar user-avatar">
                    <User size={18} />
                  </div>
                )}
                {message.role === 'assistant' && (
                  <div className="avatar bot-avatar">
                    <Bot size={18} />
                  </div>
                )}
                <div className="message-content">
                  <p>{message.content}</p>
                </div>
                <button 
                  onClick={() => dispatch(deleteMessage(message.id))}
                  className="delete-msg-btn"
                  title="Delete message"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="message-wrapper ai-message">
              <div className="message-bubble">
                <div className="avatar bot-avatar">
                  <Bot size={18} />
                </div>
                <div className="message-content loading-content">
                  <Loader2 className="spinner" size={18} />
                  <p>AI is thinking...</p>
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="error-container">
              <AlertCircle size={20} className="error-icon" />
              <div className="error-text">
                <p><strong>Error:</strong> {error}</p>
                <button 
                  onClick={() => dispatch(clearError())} 
                  className="error-dismiss"
                >
                  Dismiss
                </button>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <form onSubmit={handleSubmit} className="input-form">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..."
            className="chat-input"
            disabled={isLoading}
          />
          <button
            type="submit"
            className="send-button"
            disabled={!input.trim() || isLoading}
          >
            <Send size={20} />
          </button>
        </form>

      </div>
    </div>
  );
}

export default App;
