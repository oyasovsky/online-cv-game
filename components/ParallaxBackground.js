import React, { useEffect, useState } from 'react';

export default function ParallaxBackground({ backgroundImage = null }) {
  const [imageLoaded, setImageLoaded] = useState(false);

  useEffect(() => {
    // Preload the background image
    if (backgroundImage) {
      const img = new Image();
      img.onload = () => setImageLoaded(true);
      img.src = backgroundImage;
    }
  }, [backgroundImage]);

  return (
    <div className="parallax-bg">
      {/* Background image if specified */}
      {backgroundImage && (
        <div 
          className={`absolute inset-0 bg-cover bg-center bg-no-repeat transition-opacity duration-1000 ${
            imageLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          style={{
            backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.2), rgba(0, 0, 0, 0.7)), url(${backgroundImage})`
          }}
        />
      )}
      
      {/* Loading fallback - gradient background */}
      {!imageLoaded && backgroundImage && (
        <div 
          className="absolute inset-0 bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900"
        />
      )}
      
      {/* Subtle grid pattern for depth */}
      <div 
        className="absolute inset-0 opacity-3"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255, 255, 255, 0.05) 1px, transparent 1px)
          `,
          backgroundSize: '100px 100px'
        }}
      />
    </div>
  );
} 