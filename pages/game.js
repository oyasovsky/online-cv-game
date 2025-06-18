import React, { useState } from 'react';
import ChatBubble from '../components/ChatBubble';
import ParallaxBackground from '../components/ParallaxBackground';

export default function Game() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const suggestions = [
    "What's your leadership style?",
    'Tell me about a project you led.',
    "What's your biggest failure?"
  ];

  const sendMessage = async () => {
    if (!input) return;
    const userMessage = { fromUser: true, content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: input, history: messages })
    });
    const data = await res.json();
    setMessages((prev) => [...prev, { fromUser: false, content: data.reply }]);
  };

  return (
    <>
      <ParallaxBackground />
      <div className="min-h-screen flex flex-col p-6 relative z-10">
        {/* Header */}
        <div className="glass-card p-6 mb-6 text-center">
          <h1 className="section-title">Interactive CV Game</h1>
          <p className="body-text">Ask me anything about my experience!</p>
        </div>
        
        {/* Chat messages container */}
        <div className="flex-1 overflow-y-auto mb-6 glass-card p-6">
          {messages.length === 0 && (
            <div className="text-center body-text opacity-75 mb-4">
              Start the conversation by asking me a question!
            </div>
          )}
          {messages.map((m, idx) => (
            <ChatBubble key={idx} message={m.content} fromUser={m.fromUser} />
          ))}
        </div>
        
        {/* Input container */}
        <div className="glass-card p-6">
          <div className="flex items-center space-x-4">
            <input
              className="flex-1 cv-input"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={suggestions[messages.length % suggestions.length]}
              onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
            />
            <button
              className="cv-button"
              onClick={sendMessage}
            >
              Send
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
