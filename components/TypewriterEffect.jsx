import React, { useState, useEffect } from 'react';

export default function TypewriterEffect() {
  const phrases = [
    "I lead R&D teams that turn strategy into scalable solutions.",
    "I build products by building people first.",
    "I drive innovation with clarity, empathy, and technical depth.",
    "I turn complex ideas into products users love."
  ];

  const [currentPhraseIndex, setCurrentPhraseIndex] = useState(0);
  const [currentText, setCurrentText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [typingSpeed, setTypingSpeed] = useState(100);

  useEffect(() => {
    const currentPhrase = phrases[currentPhraseIndex];
    
    if (!isDeleting) {
      // Typing effect
      if (currentText.length < currentPhrase.length) {
        const timeout = setTimeout(() => {
          setCurrentText(currentPhrase.slice(0, currentText.length + 1));
        }, typingSpeed);
        return () => clearTimeout(timeout);
      } else {
        // Pause before deleting
        const timeout = setTimeout(() => {
          setIsDeleting(true);
          setTypingSpeed(50); // Faster deletion
        }, 2000);
        return () => clearTimeout(timeout);
      }
    } else {
      // Deleting effect
      if (currentText.length > 0) {
        const timeout = setTimeout(() => {
          setCurrentText(currentText.slice(0, -1));
        }, typingSpeed);
        return () => clearTimeout(timeout);
      } else {
        // Move to next phrase
        setIsDeleting(false);
        setTypingSpeed(100); // Normal typing speed
        setCurrentPhraseIndex((prevIndex) => (prevIndex + 1) % phrases.length);
      }
    }
  }, [currentText, isDeleting, currentPhraseIndex, typingSpeed, phrases]);

  return (
    <div className="typewriter-container">
      <span className="typewriter-text body-text">
        {currentText}
        <span className="cursor">|</span>
      </span>
    </div>
  );
} 