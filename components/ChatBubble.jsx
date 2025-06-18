import React from 'react';

export default function ChatBubble({ message, fromUser }) {
  const alignment = fromUser ? 'items-end text-right' : 'items-start text-left';
  const bubbleStyle = fromUser 
    ? 'bg-gradient-to-r from-white/20 to-white/15 border-white/30' 
    : 'bg-white/10 border-white/20';
  
  return (
    <div className={`flex flex-col ${alignment} my-4`}>
      <div className={`p-4 rounded-lg ${bubbleStyle} max-w-md backdrop-blur-sm border`}>
        <span className="body-text">{message}</span>
      </div>
    </div>
  );
}
