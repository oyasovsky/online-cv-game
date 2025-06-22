import React from 'react';
import Button from '../components/Button';
import ParallaxBackground from '../components/ParallaxBackground';
import TypewriterEffect from '../components/TypewriterEffect';
import Head from 'next/head';

export default function Home() {
  return (
    <>
      <ParallaxBackground backgroundImage="/bg-o.jpg"/>
      <div className="min-h-screen flex flex-col items-center justify-center text-center relative z-10 px-2 sm:px-4 w-full lg:w-1/2 lg:mx-auto">
        <Head>
          <title>Olga Yasovsky - R&D Leader & Technology Executive | Interactive CV</title>
          <meta name="description" content="Explore Olga Yasovsky's leadership philosophy, technical expertise, and authentic approach to building great teams. Interactive CV with AI-powered chat." />
        </Head>
        
        {/* Main hero section */}
        <div className="p-4 sm:p-8 md:p-12 mb-4 sm:mb-8 max-w-2xl">
          <h1 className="hero-title text-3xl sm:text-5xl sm:leading-tight mb-4">Olga Yasovsky</h1>
          
          {/* Typewriter effect for role descriptions */}
          <div className="mb-8">
            <TypewriterEffect />
          </div>
        </div>
        
        {/* Action buttons - mobile friendly */}
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-center">
          <a
            href="/Olga_Yasovsky_CV.pdf"
            target="_blank"
            rel="noopener noreferrer"
            className="cv-button w-full sm:w-auto"
          >
            📄 View Classic CV
          </a>
          <a href="/olgagpt" className="w-full sm:w-auto">
            <Button>Chat with OlgaGPT</Button>
          </a>
        </div>
        
      </div>
    </>
  );
}
