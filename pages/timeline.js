import React from 'react';
import Timeline from '../components/Timeline';
import ParallaxBackground from '../components/ParallaxBackground';
import Head from 'next/head';

export default function TimelinePage() {
  return (
    <>
      <Head>
        <title>Career Timeline - Olga Yasovsky | Leadership & Technical Journey</title>
        <meta name="description" content="Explore Olga Yasovsky's career progression from software engineer to VP R&D, showcasing leadership growth and technical expertise." />
      </Head>
      <ParallaxBackground />
      <div className="min-h-screen flex flex-col p-6 relative z-10 w-full lg:w-3/4 lg:mx-auto">
        {/* Navigation */}
        <div className="flex justify-between items-center mb-6 w-full">
          <a 
            href="/" 
            className="text-white/60 hover:text-white/80 transition-colors text-sm"
          >
            ← Home
          </a>
          <a 
            href="/olgagpt" 
            className="text-white/60 hover:text-white/80 transition-colors text-sm"
          >
            Chat with OlgaGPT →
          </a>
        </div>

        {/* Header */}
        <div className="glass-card p-6 mb-8 text-center">
          <h1 className="section-title mb-4">Career Journey</h1>
          <p className="body-text">My path from software engineer to technology leader, with key milestones and lessons learned along the way.</p>
        </div>

        {/* Timeline Component */}
        <div className="glass-card p-8">
          <Timeline />
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-white/60 text-sm">
            Each role has shaped my approach to leadership and technology. 
            <br />
            Want to know more? <a href="/olgagpt" className="text-blue-300 hover:text-blue-200 underline">Chat with OlgaGPT</a> about any specific experience.
          </p>
        </div>
      </div>
    </>
  );
} 