import React, { useState } from 'react';
import ChatBubble from '../components/ChatBubble';

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
    <div className="min-h-screen flex flex-col p-4">
      <div className="flex-1 overflow-y-auto mb-4">
        {messages.map((m, idx) => (
          <ChatBubble key={idx} message={m.content} fromUser={m.fromUser} />
        ))}
      </div>
      <div className="flex items-center space-x-2">
        <input
          className="flex-1 p-2 rounded bg-gray-800"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={suggestions[messages.length % suggestions.length]}
        />
        <button
          className="px-4 py-2 bg-blue-600 rounded"
          onClick={sendMessage}
        >
          Send
        </button>
      </div>
    </div>
  );
}
