import React, { useEffect, useState } from 'react';

export default function ParallaxBackground({ backgroundImage = null }) {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e) => {
      const newPosition = {
        x: (e.clientX / window.innerWidth) * 100,
        y: (e.clientY / window.innerHeight) * 100,
      };
      setMousePosition(newPosition);
      console.log('🖱️ Mouse moved:', newPosition);
    };

    console.log('🎯 ParallaxBackground mounted, adding mouse listener');
    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      console.log('🎯 ParallaxBackground unmounting, removing mouse listener');
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  return (
    <div className="parallax-bg">
      {/* Background image if specified */}
      {backgroundImage && (
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.2), rgba(0, 0, 0, 0.7)), url(${backgroundImage})`,
            transform: `translate(${mousePosition.x * 0.02}px, ${mousePosition.y * 0.02}px)`
          }}
        />
      )}
      
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