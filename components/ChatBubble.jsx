import React from 'react';

export default function ChatBubble({ message, fromUser, sources, confidence }) {
  const alignment = fromUser ? 'items-end text-right' : 'items-start text-left';
  const bubbleStyle = fromUser 
    ? 'bg-gradient-to-r from-white/20 to-white/15 border-white/30' 
    : 'bg-white/10 border-white/20';
  
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
  
  return (
    <div className={`flex flex-col ${alignment} my-4`}>
      <div className={`p-4 rounded-lg ${bubbleStyle} max-w-md backdrop-blur-sm border`}>
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
                �� Confidence: {Math.max(...confidence)}%
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
