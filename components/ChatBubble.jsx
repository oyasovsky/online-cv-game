import React from 'react';

export default function ChatBubble({ message, fromUser }) {
  const alignment = fromUser ? 'items-end text-right' : 'items-start text-left';
  const bubbleColor = fromUser ? 'bg-blue-700' : 'bg-gray-800';
  return (
    <div className={`flex flex-col ${alignment} my-2`}>
      <div className={`p-3 rounded-lg ${bubbleColor} max-w-md`}>{message}</div>
    </div>
  );
}
