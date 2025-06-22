import React, { useState } from 'react';

export default function ChatBubble({ message, fromUser, sources, confidence, timeline }) {
  const alignment = fromUser ? 'items-end text-right' : 'items-start text-left';
  const bubbleStyle = fromUser 
    ? 'bg-gradient-to-r from-white/20 to-white/15 border-white/30' 
    : 'bg-white/10 border-white/20';
  
  const [selectedTimelineEntry, setSelectedTimelineEntry] = useState(null);

  // Function to format message with markdown-like formatting
  const formatMessage = (text) => {
    if (!text) return '';
    
    // Convert **bold** to <strong> tags
    let formatted = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    
    // Convert *italic* to <em> tags
    formatted = formatted.replace(/\*(.*?)\*/g, '<em>$1</em>');
    
    // Convert markdown links [text](url) to HTML links
    formatted = formatted.replace(
      /\[([^\]]+)\]\(([^)]+)\)/g, 
      '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-blue-300 hover:text-blue-200 underline">$1</a>'
    );
    
    // Convert line breaks to <br> tags
    formatted = formatted.replace(/\n/g, '<br />');
    
    // Convert double line breaks to paragraph breaks
    formatted = formatted.replace(/\n\n/g, '</p><p>');
    
    // Wrap in paragraph tags
    formatted = `<p>${formatted}</p>`;
    
    return formatted;
  };

  // Render timeline if provided
  const renderTimeline = () => {
    if (!timeline) return null;

    return (
      <div className="mt-6">
        {/* Timeline with full height expansion */}
        <div className="relative">
          {/* Timeline Line */}
          <div className="absolute left-1/2 transform -translate-x-1/2 w-0.5 h-full bg-gradient-to-b from-white/20 via-white/10 to-white/20"></div>
          
          <div className="space-y-4">
            {timeline.map((entry, index) => (
              <div
                key={entry.id}
                className={`relative flex items-center ${
                  index % 2 === 0 ? 'flex-row' : 'flex-row-reverse'
                }`}
              >
                {/* Timeline Dot */}
                <div className="absolute left-1/2 transform -translate-x-1/2 w-3 h-3 bg-white rounded-full border border-white/30 z-10"></div>
                
                {/* Content Card */}
                <div className={`w-5/12 ${index % 2 === 0 ? 'pr-6' : 'pl-6'}`}>
                  <div 
                    className={`glass-card p-4 cursor-pointer transition-all duration-300 hover:scale-105 text-sm ${
                      selectedTimelineEntry?.id === entry.id ? 'ring-2 ring-white/30' : ''
                    }`}
                    onClick={() => setSelectedTimelineEntry(selectedTimelineEntry?.id === entry.id ? null : entry)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-lg font-bold text-white">{entry.year}</span>
                      <span className={`text-xs px-1 py-0.5 rounded ${
                        entry.category === 'leadership' 
                          ? 'bg-blue-500/20 text-blue-300' 
                          : 'bg-green-500/20 text-green-300'
                      }`}>
                        {entry.category === 'leadership' ? '👥' : '⚙️'}
                      </span>
                    </div>
                    <h3 className="text-sm font-semibold text-white mb-1">{entry.title}</h3>
                    <p className="text-white/80 text-xs mb-1">{entry.company}</p>
                    <p className="text-white/70 text-xs">{entry.description}</p>
                    
                    {/* Expanded Content */}
                    {selectedTimelineEntry?.id === entry.id && (
                      <div className="mt-3 pt-3 border-t border-white/10 animate-fadeIn">
                        <div className="mb-2">
                          <h4 className="text-xs font-semibold text-white/90 mb-1">💡 Impact</h4>
                          <p className="text-xs text-white/80">{entry.impact}</p>
                        </div>
                        <div>
                          <h4 className="text-xs font-semibold text-white/90 mb-1">🎯 Key Lesson</h4>
                          <p className="text-xs text-white/80">{entry.lessons}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };
  
  return (
    <div className={`flex flex-col ${alignment} my-4`}>
      <div className={`p-4 rounded-lg ${bubbleStyle} max-w-md border`}>
        <div 
          className="body-text"
          dangerouslySetInnerHTML={{ __html: formatMessage(message) }}
        />
        
        {/* Show sources for AI responses */}
        {!fromUser && sources && sources.length > 0 && (
          <div className="mt-3 pt-3 border-t border-white/10">
            <div className="text-xs text-blue-300 mb-2">
              📚 Sources: {sources.map(s => s.replace('.md', '')).join(', ')}
            </div>
            {confidence && confidence.length > 0 && (
              <div className="text-xs text-green-300">
                🎯 Confidence: {Math.max(...confidence)}%
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* Render timeline outside of chat bubble for full width */}
      {!fromUser && timeline && (
        <div className="w-full mt-4">
          {renderTimeline()}
        </div>
      )}
    </div>
  );
}
