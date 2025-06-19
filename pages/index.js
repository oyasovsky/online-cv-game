import React from 'react';
import Button from '../components/Button';
import ParallaxBackground from '../components/ParallaxBackground';
import TypewriterEffect from '../components/TypewriterEffect';
import Head from 'next/head';

export default function Home() {
  return (
    <>
      <ParallaxBackground />
      <div className="min-h-screen flex flex-col items-center justify-center text-center relative z-10 px-4 w-full lg:w-1/2 lg:mx-auto">
        <Head>
          <title>Olga Yasovsky - CV</title>
        </Head>
        
        {/* Main hero section */}
        <div className="  p-12 mb-8 max-w-2xl">
          <h1 className="hero-title mb-4">Olga Yasovsky</h1>
          
          {/* Typewriter effect for role descriptions */}
          <div className="mb-8">
            <TypewriterEffect />
          </div>
        </div>
        
        {/* Action buttons */}
        <div className=" p-8 mb-8">
          <div className="space-x-6">
            <a href="/Olga_Yasovsky_CV.pdf" download>
              <Button>View Classic CV</Button>
            </a>
            <a href="/olgagpt">
              <Button>Chat with OlgaGPT</Button>
            </a>
          </div>
        </div>
        
      </div>
    </>
  );
}
