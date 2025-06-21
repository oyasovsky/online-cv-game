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
  const [showSampleQuestions, setShowSampleQuestions] = useState(true);
  const [showFollowUpFooter, setShowFollowUpFooter] = useState(false);
  
  // Ensure component only renders on client side to prevent hydration errors
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Collapse sample questions after first question is asked
  useEffect(() => {
    if (messages.length === 1) {
      setShowSampleQuestions(false);
    }
  }, [messages.length]);

  // Unified questions array with category
  const questions = [
    { id: 'how-did-you-build-this-site', text: "How did you build this site?", category: "technical" },
    { id: 'what-are-your-signature-traits', text: "What are Olga's signature traits?", category: "leadership" },
    { id: 'tell-me-about-volunteering', text: "Tell me about the SpaceIL volunteering project", category: "leadership" },
    { id: 'what-makes-your-leadership-style-different', text: "What makes your leadership style different?", category: "leadership" },
    { id: 'how-do-you-drive-innovation-when-everythings-on-fire', text: "How do you drive innovation?", category: "leadership" },
    { id: 'whats-your-favorite-failure-and-why', text: "What's your favorite failure — and why?", category: "leadership" },
    { id: 'how-do-you-stay-technical-without-becoming-the-bottleneck', text: "How do you stay technical without becoming the bottleneck?", category: "technical" },
    { id: 'whats-your-approach-to-remote-team-management', text: "What's your approach to remote team management?", category: "leadership" },
    { id: 'how-do-you-measure-team-success', text: "How do you measure team success?", category: "leadership" },
    { id: 'how-do-you-stay-current-with-ai-trends', text: "How do you stay current with AI trends?", category: "technical" },
    { id: 'whats-your-take-on-ai-replacing-developers', text: "What's your take on AI replacing developers?", category: "technical" },
    { id: 'how-do-you-build-ai-literacy-in-your-teams', text: "How do you build AI literacy in your teams?", category: "technical" },
    { id: 'whats-your-ai-strategy-for-the-next-2-years', text: "What's your AI strategy for the next 2 years?", category: "technical" },
    { id: 'whats-your-approach-to-risk-taking', text: "What's your approach to risk-taking?", category: "leadership" },
    { id: 'how-do-you-create-a-culture-of-learning', text: "How do you create a culture of learning?", category: "leadership" },
    { id: 'whats-the-best-advice-youve-ever-received', text: "What's the best advice you've ever received?", category: "leadership" },
    { id: 'how-do-you-balance-innovation-with-delivery', text: "How do you balance innovation with delivery?", category: "leadership" },
    { id: 'whats-the-most-innovative-project-youve-led', text: "What's the most innovative project you've led?", category: "leadership" },
    { id: 'how-do-you-stay-current-with-technology', text: "How do you stay current with technology?", category: "technical" },
    { id: 'how-do-you-handle-technical-debt', text: "How do you handle technical debt?", category: "technical" },
    { id: 'how-do-you-balance-speed-with-quality', text: "How do you balance speed with quality?", category: "technical" },
    { id: 'tell-me-more-about-your-management-philosophy', text: "Tell me more about your management philosophy", category: "leadership" },
    { id: 'whats-your-biggest-professional-achievement', text: "What's your biggest professional achievement?", category: "leadership" }
  ];

  // Always show this question first
  const alwaysShowQuestion = questions[0];

  // Derive sampleQuestions (all questions, in order)
  const sampleQuestions = questions.map(q => q.text);

  // Derive questionCategories
  const questionCategories = {
    leadership: questions.filter(q => q.category === 'leadership').map(q => q.text),
    technical: questions.filter(q => q.category === 'technical').map(q => q.text)
  };

  // Get balanced questions (3 leadership + 3 technical, always include alwaysShowQuestion in first batch)
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
    let leadershipQuestions = leadershipUnasked.slice(0, 3);
    let technicalQuestions = technicalUnasked.slice(0, 3);
    // Ensure alwaysShowQuestion is present in the first batch
    if (!leadershipQuestions.includes(alwaysShowQuestion) && !technicalQuestions.includes(alwaysShowQuestion)) {
      technicalQuestions[0] = alwaysShowQuestion;
    }
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
    // Get all unasked questions in order, return full objects
    const unasked = questions.filter(q => !askedQuestions.has(q.id));
    return unasked.slice(0, 6);
  }, [messages, askedQuestions, questions]);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;
    
    // Try to find a matching question ID
    const match = questions.find(q => q.text === input.trim());
    setAskedQuestions(prev => {
      const newSet = new Set([...prev, match ? match.id : input.trim()]);
      console.log('📝 Tracking custom question:', match ? match.id : input.trim());
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
        setTimeout(() => reject(new Error('Request timeout')), 45000) // 45 second timeout
      );

      console.log('📤 Sending message with history length:', messages.length);
      console.log('⏰ Request started at:', new Date().toISOString());
      if (messages.length > 0) {
        console.log('📤 Last 2 messages:', messages.slice(-2).map(msg => `${msg.fromUser ? 'User' : 'Assistant'}: ${msg.content.substring(0, 100)}...`));
      }

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
      
      console.log('✅ Request completed successfully at:', new Date().toISOString());
      
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
        errorMessage = "I'm taking longer than usual to respond (over 45 seconds). This might be due to high demand or a complex query. Please try again with a simpler question or wait a moment and retry.";
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

  const handleSampleQuestion = (questionId) => {
    setAskedQuestions(prev => {
      const newSet = new Set([...prev, questionId]);
      console.log('📝 Tracking asked question:', questionId);
      console.log('📊 Total asked questions:', newSet.size);
      return newSet;
    });
    // Find the question object by id
    const q = questions.find(q => q.id === questionId);
    setInput(q ? q.text : questionId);
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
        {/* Minimalist Navigation - moved inside main container, above first glass-card */}
        <div className="flex justify-between items-center mb-4 w-full">
          <a 
            href="/" 
            className="text-white/60 hover:text-white/80 transition-colors text-sm"
          >
            ← Home
          </a>
          <a 
            href="/Olga_Yasovsky_CV.pdf" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-white/60 hover:text-white/80 transition-colors text-sm"
          >
            📄 View Classic CV
          </a>
        </div>
        {/* Header */}
        <div className="glass-card p-6 mb-6 text-center">
          <h1 className="section-title">OlgaGPT - Interactive CV</h1>
          <p className="body-text">Ask me anything about my leadership, experience, or values!</p>
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
            {/* Sample Questions - Minimalist accordion style */}
            {messages.length === 0 && (
              <div className="follow-up-questions glass-card p-4 mb-6">
                <button
                  className="flex items-center justify-between w-full mb-2 text-base font-normal text-white/80 hover:text-white/90 focus:outline-none bg-transparent border-none px-0 py-0"
                  onClick={() => setShowSampleQuestions((prev) => !prev)}
                  aria-expanded={showSampleQuestions}
                  aria-controls="sample-questions-accordion"
                  style={{ boxShadow: 'none' }}
                >
                  <span className="tracking-tight">💡 Suggested questions</span>
                  <span
                    className={`transition-transform duration-200 ml-2 text-white/60 text-lg ${showSampleQuestions ? 'rotate-180' : 'rotate-0'}`}
                    style={{ display: 'inline-block' }}
                  >
                    {/* Modern chevron SVG icon */}
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 20 20"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      className="inline-block align-middle"
                    >
                      <path d="M6 8l4 4 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </span>
                </button>
                {showSampleQuestions && (
                  <div id="sample-questions-accordion" className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
                    {(() => {
                      // Ensure 'How did you build this site?' is always first and deduplicated, and only 6 questions are shown
                      const initialQs = getContextualQuestions;
                      const deduped = [alwaysShowQuestion, ...initialQs.filter(q => q.id !== alwaysShowQuestion.id)];
                      return deduped.slice(0, 6).map((question, index) => {
                        const isLeadership = questionCategories.leadership.includes(question.text);
                        const isTechnical = questionCategories.technical.includes(question.text);
                        return (
                          <button
                            key={index}
                            onClick={() => handleSampleQuestion(question.id)}
                            className={`text-left p-2 rounded-md transition-colors border border-transparent hover:border-white/10 text-sm bg-white/5 hover:bg-white/10 ${
                              isLeadership 
                                ? 'text-blue-200' 
                                : 'text-green-200'
                            }`}
                            style={{ fontWeight: 400 }}
                          >
                            <div className="flex items-center space-x-2">
                              <span className={`text-xs px-1 py-0.5 rounded ${
                                isLeadership 
                                  ? 'bg-blue-500/10 text-blue-300' 
                                  : 'bg-green-500/10 text-green-300'
                              }`}>
                                {isLeadership ? '👥' : '⚙️'}
                              </span>
                              <span className="body-text text-sm font-normal">{question.text}</span>
                            </div>
                          </button>
                        );
                      });
                    })()}
                  </div>
                )}
              </div>
            )}
            
            {/* Chat messages container */}
            {(messages.length > 0 || isLoading) && (
              <div
                className={`chat-main flex-1 overflow-y-auto mb-6 glass-card p-6`}
                style={shouldShowFollowUp ? { borderBottomLeftRadius: 0, borderBottomRightRadius: 0 } : {}}
              >
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
              <div
                className={`follow-up-questions glass-card mb-6 transition-all duration-300 overflow-hidden rounded-t-none ${showFollowUpFooter ? 'max-h-[500px] opacity-100' : 'max-h-12 opacity-80'}`}
                style={{ borderTopLeftRadius: 0, borderTopRightRadius: 0, marginTop: '-1.5rem' }}
              >
                <button
                  className="flex items-center justify-between w-full px-4 py-2 text-base font-normal text-white/80 hover:text-white/90 focus:outline-none bg-transparent border-none"
                  onClick={() => setShowFollowUpFooter((prev) => !prev)}
                  aria-expanded={showFollowUpFooter}
                  aria-controls="follow-up-footer-accordion"
                  style={{ boxShadow: 'none' }}
                >
                  <span className="tracking-tight">💭 What would you like to know next?</span>
                  <span
                    className={`transition-transform duration-200 ml-2 text-white/60 text-lg ${showFollowUpFooter ? 'rotate-180' : 'rotate-0'}`}
                    style={{ display: 'inline-block' }}
                  >
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 20 20"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      className="inline-block align-middle"
                    >
                      <path d="M6 8l4 4 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </span>
                </button>
                {showFollowUpFooter && (
                  <div id="follow-up-footer-accordion" className="p-4 pt-0 grid grid-cols-1 md:grid-cols-2 gap-2">
                    {getContextualQuestions.slice(0, 6).map((question, index) => {
                      const isLeadership = questionCategories.leadership.includes(question.text);
                      const isTechnical = questionCategories.technical.includes(question.text);
                      return (
                        <button
                          key={index}
                          onClick={() => handleSampleQuestion(question.id)}
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
                            <span className="body-text text-sm">{question.text}</span>
                          </div>
                        </button>
                      );
                    })}
                    {askedQuestions.size >= sampleQuestions.length && (
                      <div className="mt-3 text-xs text-white/50 text-center col-span-2">
                        ✨ You&apos;ve seen all the questions! Click <b>Start over</b> to begin again.
                      </div>
                    )}
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