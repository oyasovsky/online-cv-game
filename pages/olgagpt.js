import React, { useState, useEffect, useMemo } from 'react';
import ChatBubble from '../components/ChatBubble';
import ParallaxBackground from '../components/ParallaxBackground';

export default function Game() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [askedQuestions, setAskedQuestions] = useState(new Set());
  const [isClient, setIsClient] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  
  // Ensure component only renders on client side to prevent hydration errors
  useEffect(() => {
    setIsClient(true);
  }, []);

  const sampleQuestions = [
    "How do you build teams that ship — even in chaos?",
    "What's the smartest way you've used GenAI in production?",
    "What makes your leadership style different?",
    "How do you drive innovation when everything's on fire?",
    "What's your favorite failure — and why?",
    "How do you stay technical without becoming the bottleneck?",
    "How do you turn conflict into culture?",
    "What's your approach to remote team management?",
    "How do you measure team success?",
    "What's your secret to high team retention?",
    "How do you stay current with AI trends?",
    "What's your take on AI replacing developers?",
    "How do you evaluate new AI tools for the team?",
    "What's the biggest AI mistake you've seen?",
    "How do you build AI literacy in your teams?",
    "What's your AI strategy for the next 2 years?",
    "What's your approach to risk-taking?",
    "How do you create a culture of learning?",
    "What's the best advice you've ever received?",
    "How do you help teams recover from setbacks?",
    "What's your philosophy on experimentation?",
    "How do you balance innovation with stability?",
    "How do you encourage creativity in your teams?",
    "What's your process for evaluating new ideas?",
    "How do you balance innovation with delivery?",
    "What's the most innovative project you've led?",
    "How do you handle resistance to change?",
    "What's your innovation budget strategy?",
    "How do you stay current with technology?",
    "What's your code review philosophy?",
    "How do you handle technical debt?",
    "What's your approach to architecture decisions?",
    "How do you balance speed with quality?",
    "What's your testing strategy?",
    "Tell me more about your management philosophy",
    "What's your biggest professional achievement?",
    "How do you handle stress and pressure?",
    "What's your communication style?",
    "How do you make difficult decisions?",
    "What drives you as a leader?"
  ];

  // Categorize questions into leadership and technical buckets
  const questionCategories = {
    leadership: [
      "How do you build teams that ship — even in chaos?",
      "What makes your leadership style different?",
      "How do you drive innovation when everything's on fire?",
      "What's your favorite failure — and why?",
      "How do you turn conflict into culture?",
      "What's your approach to remote team management?",
      "How do you measure team success?",
      "What's your secret to high team retention?",
      "What's your approach to risk-taking?",
      "How do you create a culture of learning?",
      "What's the best advice you've ever received?",
      "How do you help teams recover from setbacks?",
      "What's your philosophy on experimentation?",
      "How do you balance innovation with stability?",
      "How do you encourage creativity in your teams?",
      "What's your process for evaluating new ideas?",
      "How do you balance innovation with delivery?",
      "What's the most innovative project you've led?",
      "How do you handle resistance to change?",
      "What's your innovation budget strategy?",
      "Tell me more about your management philosophy",
      "What's your biggest professional achievement?",
      "How do you handle stress and pressure?",
      "What's your communication style?",
      "How do you make difficult decisions?",
      "What drives you as a leader?"
    ],
    technical: [
      "What's the smartest way you've used GenAI in production?",
      "How do you stay technical without becoming the bottleneck?",
      "How do you stay current with AI trends?",
      "What's your take on AI replacing developers?",
      "How do you evaluate new AI tools for the team?",
      "What's the biggest AI mistake you've seen?",
      "How do you build AI literacy in your teams?",
      "What's your AI strategy for the next 2 years?",
      "How do you stay current with technology?",
      "What's your code review philosophy?",
      "How do you handle technical debt?",
      "What's your approach to architecture decisions?",
      "How do you balance speed with quality?",
      "What's your testing strategy?"
    ]
  };

  // Get balanced questions (3 leadership + 3 technical) - memoized
  const getBalancedQuestions = useMemo(() => {
    const leadershipUnasked = questionCategories.leadership.filter(q => !askedQuestions.has(q));
    const technicalUnasked = questionCategories.technical.filter(q => !askedQuestions.has(q));
    
    // If we've asked all questions in a category, reset that category
    if (leadershipUnasked.length === 0) {
      leadershipUnasked.push(...questionCategories.leadership.slice(0, 3));
    }
    if (technicalUnasked.length === 0) {
      technicalUnasked.push(...questionCategories.technical.slice(0, 3));
    }
    
    // Take 3 from each category
    const leadershipQuestions = leadershipUnasked.slice(0, 3);
    const technicalQuestions = technicalUnasked.slice(0, 3);
    
    // Combine questions - use deterministic order during SSR, random on client
    const combined = [...leadershipQuestions, ...technicalQuestions];
    
    if (isClient) {
      // Only shuffle on client side to prevent hydration errors
      return combined.sort(() => Math.random() - 0.5);
    } else {
      // Return in deterministic order during SSR
      return combined;
    }
  }, [askedQuestions, isClient]);

  // Contextual follow-up questions based on conversation
  const getContextualQuestions = useMemo(() => {
    if (messages.length === 0) return getBalancedQuestions;
    
    const lastMessage = messages[messages.length - 1];
    if (!lastMessage || lastMessage.fromUser) return getBalancedQuestions;
    
    const content = lastMessage.content.toLowerCase();
    
    // Helper function to filter out asked questions and ensure balance
    const filterUnaskedAndBalance = (leadershipQs, technicalQs) => {
      const leadershipUnasked = leadershipQs.filter(q => !askedQuestions.has(q));
      const technicalUnasked = technicalQs.filter(q => !askedQuestions.has(q));
      
      // Take up to 3 from each category
      const leadershipSelected = leadershipUnasked.slice(0, 3);
      const technicalSelected = technicalUnasked.slice(0, 3);
      
      // If we don't have enough from one category, fill with balanced questions
      if (leadershipSelected.length < 3 || technicalSelected.length < 3) {
        const balanced = getBalancedQuestions;
        const leadershipNeeded = 3 - leadershipSelected.length;
        const technicalNeeded = 3 - technicalSelected.length;
        
        const balancedLeadership = balanced.filter(q => 
          questionCategories.leadership.includes(q) && 
          !leadershipSelected.includes(q)
        ).slice(0, leadershipNeeded);
        
        const balancedTechnical = balanced.filter(q => 
          questionCategories.technical.includes(q) && 
          !technicalSelected.includes(q)
        ).slice(0, technicalNeeded);
        
        return [...leadershipSelected, ...balancedLeadership, ...technicalSelected, ...balancedTechnical];
      }
      
      // Shuffle the combined array for variety
      const combined = [...leadershipSelected, ...technicalSelected];
      
      if (isClient) {
        // Only shuffle on client side to prevent hydration errors
        return combined.sort(() => Math.random() - 0.5);
      } else {
        // Return in deterministic order during SSR
        return combined;
      }
    };
    
    // Contextual questions based on the last answer
    if (content.includes('leadership') || content.includes('team')) {
      return filterUnaskedAndBalance([
        "How do you handle difficult team members?",
        "What's your approach to remote team management?",
        "How do you measure team success?",
        "Tell me about a time you had to let someone go",
        "How do you balance technical and people leadership?",
        "What's your secret to high team retention?"
      ], [
        "How do you stay current with technology?",
        "What's your code review philosophy?",
        "How do you handle technical debt?",
        "What's your approach to architecture decisions?",
        "How do you balance speed with quality?",
        "What's your testing strategy?"
      ]);
    }
    
    if (content.includes('genai') || content.includes('ai') || content.includes('artificial intelligence')) {
      return filterUnaskedAndBalance([
        "How do you create a culture of learning?",
        "What's your philosophy on experimentation?",
        "How do you balance innovation with stability?",
        "How do you encourage creativity in your teams?",
        "What's your process for evaluating new ideas?",
        "How do you handle resistance to change?"
      ], [
        "How do you stay current with AI trends?",
        "What's your take on AI replacing developers?",
        "How do you evaluate new AI tools for the team?",
        "What's the biggest AI mistake you've seen?",
        "How do you build AI literacy in your teams?",
        "What's your AI strategy for the next 2 years?"
      ]);
    }
    
    if (content.includes('failure') || content.includes('mistake') || content.includes('learn')) {
      return filterUnaskedAndBalance([
        "What's your approach to risk-taking?",
        "How do you create a culture of learning?",
        "What's the best advice you've ever received?",
        "How do you help teams recover from setbacks?",
        "What's your philosophy on experimentation?",
        "How do you balance innovation with stability?"
      ], [
        "How do you handle technical debt?",
        "What's your approach to architecture decisions?",
        "How do you balance speed with quality?",
        "What's your testing strategy?",
        "How do you stay current with technology?",
        "What's your code review philosophy?"
      ]);
    }
    
    if (content.includes('innovation') || content.includes('creative') || content.includes('new')) {
      return filterUnaskedAndBalance([
        "How do you encourage creativity in your teams?",
        "What's your process for evaluating new ideas?",
        "How do you balance innovation with delivery?",
        "What's the most innovative project you've led?",
        "How do you handle resistance to change?",
        "What's your innovation budget strategy?"
      ], [
        "How do you stay current with technology?",
        "What's your code review philosophy?",
        "How do you handle technical debt?",
        "What's your approach to architecture decisions?",
        "How do you balance speed with quality?",
        "What's your testing strategy?"
      ]);
    }
    
    if (content.includes('technical') || content.includes('code') || content.includes('development')) {
      return filterUnaskedAndBalance([
        "How do you balance technical and people leadership?",
        "What's your approach to remote team management?",
        "How do you measure team success?",
        "How do you handle difficult team members?",
        "What's your secret to high team retention?",
        "Tell me about a time you had to let someone go"
      ], [
        "How do you stay current with technology?",
        "What's your code review philosophy?",
        "How do you handle technical debt?",
        "What's your approach to architecture decisions?",
        "How do you balance speed with quality?",
        "What's your testing strategy?"
      ]);
    }
    
    // Default contextual questions - use balanced questions
    return getBalancedQuestions;
  }, [messages, askedQuestions, getBalancedQuestions]);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;
    
    // Track the asked question
    setAskedQuestions(prev => {
      const newSet = new Set([...prev, input.trim()]);
      console.log('📝 Tracking custom question:', input.trim());
      console.log('📊 Total asked questions:', newSet.size);
      return newSet;
    });
    
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
          history: messages,
          sessionId: sessionId
        })
      });

      // Race between fetch and timeout
      const res = await Promise.race([fetchPromise, timeoutPromise]);
      
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      
      const data = await res.json();
      
      // Store session ID if returned from API
      if (data.sessionId && !sessionId) {
        setSessionId(data.sessionId);
      }
      
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
    // Track the asked question
    setAskedQuestions(prev => {
      const newSet = new Set([...prev, question]);
      console.log('📝 Tracking asked question:', question);
      console.log('📊 Total asked questions:', newSet.size);
      return newSet;
    });
    setInput(question);
  };

  const startOver = () => {
    setMessages([]);
    setInput('');
    setAskedQuestions(new Set());
    setSessionId(null);
  };

  // Check if we should show follow-up questions (after the last message is from OlgaGPT)
  const shouldShowFollowUp = messages.length > 0 && 
    messages[messages.length - 1] && 
    !messages[messages.length - 1].fromUser && 
    !isLoading;

  return (
    <>
      <ParallaxBackground />
      <div className="min-h-screen flex flex-col p-6 relative z-10 w-full lg:w-1/2 lg:mx-auto">
        {/* Header */}
        <div className="glass-card p-6 mb-6 text-center">
          <h1 className="section-title">OlgaGPT - Interactive CV</h1>
          <p className="body-text">Ask me anything about my leadership, experience, or values!</p>
          <div className="mt-4">
            <a 
              href="/data/olga-yasovsky-cv.pdf" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center space-x-2 text-blue-300 hover:text-blue-200 transition-colors text-sm"
            >
              <span>📄</span>
              <span>View Classic CV</span>
            </a>
          </div>
        </div>
        
        {/* Show loading state during SSR to prevent hydration errors */}
        {!isClient ? (
          <div className="glass-card p-6 mb-6">
            <div className="flex items-center justify-center space-x-2 text-blue-300">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-300"></div>
              <span className="body-text">Loading...</span>
            </div>
          </div>
        ) : (
          <>
            {/* Sample Questions - Only show on first visit */}
            {messages.length === 0 && (
              <div className="glass-card p-6 mb-6">
                <h3 className="text-lg font-semibold mb-4 text-white">💡 Try asking me about:</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {getContextualQuestions.map((question, index) => {
                    const isLeadership = questionCategories.leadership.includes(question);
                    const isTechnical = questionCategories.technical.includes(question);
                    return (
                      <button
                        key={index}
                        onClick={() => handleSampleQuestion(question)}
                        className={`text-left p-3 rounded-lg transition-colors border ${
                          isLeadership 
                            ? 'bg-blue-500/10 hover:bg-blue-500/20 border-blue-500/20 hover:border-blue-500/40' 
                            : 'bg-green-500/10 hover:bg-green-500/20 border-green-500/20 hover:border-green-500/40'
                        }`}
                      >
                        <div className="flex items-center space-x-2">
                          <span className={`text-xs px-1 py-0.5 rounded ${
                            isLeadership 
                              ? 'bg-blue-500/20 text-blue-300' 
                              : 'bg-green-500/20 text-green-300'
                          }`}>
                            {isLeadership ? '👥' : '⚙️'}
                          </span>
                          <span className="body-text">{question}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
            
            {/* Chat messages container */}
            {(messages.length > 0 || isLoading) && (
              <div className="flex-1 overflow-y-auto mb-6 glass-card p-6">
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
            )}
            
            {/* Follow-up Questions - Show after each answer */}
            {shouldShowFollowUp && (
              <div className="glass-card p-4 mb-6 animate-in fade-in duration-300">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <h4 className="text-sm font-medium text-white/80">💭 What would you like to know next?</h4>
                    <span className="text-xs text-white/50">
                      ({askedQuestions.size}/{sampleQuestions.length} asked)
                    </span>
                    <div className="flex items-center space-x-1 text-xs">
                      <span className="text-blue-300">👥 {Array.from(askedQuestions).filter(q => questionCategories.leadership.includes(q)).length}</span>
                      <span className="text-white/30">|</span>
                      <span className="text-green-300">⚙️ {Array.from(askedQuestions).filter(q => questionCategories.technical.includes(q)).length}</span>
                    </div>
                  </div>
                  <button 
                    onClick={startOver} 
                    className="text-xs text-white/60 hover:text-white/80 transition-colors"
                  >
                    Start over
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {getContextualQuestions.map((question, index) => {
                    const isLeadership = questionCategories.leadership.includes(question);
                    const isTechnical = questionCategories.technical.includes(question);
                    return (
                      <button
                        key={index}
                        onClick={() => handleSampleQuestion(question)}
                        className={`text-left p-2 rounded-md transition-all duration-200 border text-sm hover:scale-[1.02] ${
                          isLeadership 
                            ? 'bg-blue-500/10 hover:bg-blue-500/20 border-blue-500/20 hover:border-blue-500/40' 
                            : 'bg-green-500/10 hover:bg-green-500/20 border-green-500/20 hover:border-green-500/40'
                        }`}
                      >
                        <div className="flex items-center space-x-2">
                          <span className={`text-xs px-1 py-0.5 rounded ${
                            isLeadership 
                              ? 'bg-blue-500/20 text-blue-300' 
                              : 'bg-green-500/20 text-green-300'
                          }`}>
                            {isLeadership ? '👥' : '⚙️'}
                          </span>
                          <span className="body-text text-sm">{question}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
                {askedQuestions.size >= sampleQuestions.length && (
                  <div className="mt-3 text-xs text-white/50 text-center">
                    ✨ You've seen all the questions! Click "Start over" to begin again.
                  </div>
                )}
              </div>
            )}
            
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
          </>
        )}
      </div>
    </>
  );
}
