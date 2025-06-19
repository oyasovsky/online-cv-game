import React, { useState } from 'react';
import ChatBubble from '../components/ChatBubble';
import ParallaxBackground from '../components/ParallaxBackground';

export default function Game() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const sampleQuestions = [
    "How do you lead teams?",
    "What's your take on GenAI?",
    "Tell me about a challenging project you led.",
    "How do you handle conflict in teams?",
    "What's your leadership philosophy?",
    "How do you approach innovation?",
    "What's your biggest failure and what did you learn?",
    "How do you balance technical and people leadership?"
  ];

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;
    
    const userMessage = { fromUser: true, content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // Create a timeout promise
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Request timeout')), 20000) // 20 second timeout
      );

      // Create the fetch promise
      const fetchPromise = fetch('/api/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message: input, 
          history: messages 
        })
      });

      // Race between fetch and timeout
      const res = await Promise.race([fetchPromise, timeoutPromise]);
      
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      
      const data = await res.json();
      
      if (data.reply) {
        setMessages((prev) => [...prev, { 
          fromUser: false, 
          content: data.reply,
          sources: data.sources,
          confidence: data.confidence
        }]);
      } else {
        throw new Error('No reply received');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      
      let errorMessage = "I'm sorry, I'm having trouble connecting right now. Please try again in a moment.";
      
      if (error.message === 'Request timeout') {
        errorMessage = "I'm taking longer than usual to respond. This might be due to high demand. Please try again or ask a simpler question.";
      } else if (error.message.includes('rate limit')) {
        errorMessage = "I'm getting a lot of requests right now. Please try again in a moment.";
      }
      
      setMessages((prev) => [...prev, { 
        fromUser: false, 
        content: errorMessage
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSampleQuestion = (question) => {
    setInput(question);
  };

  return (
    <>
      <ParallaxBackground />
      <div className="min-h-screen flex flex-col p-6 relative z-10 w-full lg:w-1/2 lg:mx-auto">
        {/* Header */}
        <div className="glass-card p-6 mb-6 text-center">
          <h1 className="section-title">OlgaGPT - Interactive CV</h1>
          <p className="body-text">Ask me anything about my leadership, experience, or values!</p>
        </div>
        
        {/* Sample Questions */}
        {messages.length === 0 && (
          <div className="glass-card p-6 mb-6">
            <h3 className="text-lg font-semibold mb-4 text-white">💡 Try asking me about:</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {sampleQuestions.map((question, index) => (
                <button
                  key={index}
                  onClick={() => handleSampleQuestion(question)}
                  className="text-left p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors border border-white/10 hover:border-white/20"
                >
                  <span className="body-text">{question}</span>
                </button>
              ))}
            </div>
          </div>
        )}
        
        {/* Chat messages container */}
        <div className="flex-1 overflow-y-auto mb-6 glass-card p-6">
          {messages.length === 0 && (
            <div className="text-center body-text opacity-75 mb-4">
              Start the conversation by asking me a question!
            </div>
          )}
          {messages.map((m, idx) => (
            <ChatBubble 
              key={idx} 
              message={m.content} 
              fromUser={m.fromUser}
              sources={m.sources}
              confidence={m.confidence}
            />
          ))}
          {isLoading && (
            <div className="flex items-center space-x-2 text-blue-300">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-300"></div>
              <span className="body-text">OlgaGPT is thinking...</span>
            </div>
          )}
        </div>
        
        {/* Input container */}
        <div className="glass-card p-6">
          <div className="flex items-center space-x-4">
            <input
              className="flex-1 cv-input"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask me about my leadership, experience, or values..."
              onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
              disabled={isLoading}
            />
            <button
              className="cv-button disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={sendMessage}
              disabled={isLoading || !input.trim()}
            >
              {isLoading ? 'Sending...' : 'Send'}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
