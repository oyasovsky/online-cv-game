import React, { useEffect, useState } from 'react';

export default function ParallaxBackground() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth) * 100,
        y: (e.clientY / window.innerHeight) * 100,
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div className="parallax-bg">
      {/* Floating particles with parallax effect */}
      <div 
        className="floating-particle"
        style={{
          transform: `translate(${mousePosition.x * 0.08}px, ${mousePosition.y * 0.08}px)`
        }}
      />
      <div 
        className="floating-particle"
        style={{
          transform: `translate(${mousePosition.x * -0.12}px, ${mousePosition.y * -0.12}px)`
        }}
      />
      <div 
        className="floating-particle"
        style={{
          transform: `translate(${mousePosition.x * 0.15}px, ${mousePosition.y * 0.04}px)`
        }}
      />
      <div 
        className="floating-particle"
        style={{
          transform: `translate(${mousePosition.x * -0.08}px, ${mousePosition.y * 0.15}px)`
        }}
      />
      <div 
        className="floating-particle"
        style={{
          transform: `translate(${mousePosition.x * 0.04}px, ${mousePosition.y * -0.08}px)`
        }}
      />
      
      {/* Subtle grid pattern for depth */}
      <div 
        className="absolute inset-0 opacity-3"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255, 255, 255, 0.05) 1px, transparent 1px)
          `,
          backgroundSize: '100px 100px',
          transform: `translate(${mousePosition.x * 0.01}px, ${mousePosition.y * 0.01}px)`
        }}
      />
    </div>
  );
} 