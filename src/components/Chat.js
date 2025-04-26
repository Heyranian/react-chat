import React, { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import './Chat.css';

function Chat({ apiUrl = 'http://192.168.0.231:4444/query', defaultTheme = 'dark', userId: propUserId }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [theme, setTheme] = useState(defaultTheme);
  const [userId] = useState(propUserId || 'کاربر_' + Math.random().toString(36).substr(2, 9));
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = {
      userId,
      text: input,
      type: 'sent',
      timestamp: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ question: input }),
      });

      if (!response.ok) throw new Error('API request failed');

      const data = await response.json();
      const apiMessage = {
        userId: 'ربات',
        text: data.answer || 'بدون پاسخ از API',
        type: 'received',
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, apiMessage]);
    } catch (error) {
      console.error('خطا در ارسال پیام:', error);
      const errorMessage = {
        userId: 'ربات',
        text: 'عدم موفقیت در دریافت پاسخ از API',
        type: 'received',
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    }

    setIsLoading(false);
    setInput('');
    scrollToBottom();
  };

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  return (
    <div className="Chat" data-theme={theme}>
      <header className="App-header">
        <div className="header-controls">
          <h1>دستیار هوشمند آموزش و پرورش</h1>
          <button className="theme-toggle" onClick={toggleTheme} title={`تغییر به تم ${theme === 'dark' ? 'روشن' : 'تیره'}`}>
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>
        </div>
        <div className="chat-window">
          <div className="messages">
            {messages.map((msg, index) => (
              <div key={index} className={`message ${msg.type}`}>
                <span className="user">{msg.userId}</span>
                <div className="message-content">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {msg.text}
                  </ReactMarkdown>
                </div>
                <span className="timestamp">
                  {new Date(msg.timestamp).toLocaleTimeString('fa-IR')}
                </span>
              </div>
            ))}
            {isLoading && (
              <div className="loading">
                <div className="spinner"></div>
                <span>در حال پردازش...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
          <form onSubmit={sendMessage} className="message-input">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="هر چیزی بپرسید (پشتیبانی از Markdown)..."
            />
            <button type="submit" disabled={isLoading}>
              {isLoading ? '...' : 'ارسال'}
            </button>
          </form>
        </div>
      </header>
    </div>
  );
}

export default Chat;