import React from 'react';
import Button from '../components/Button';
import Head from 'next/head';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center">
      <Head>
        <title>Olga Yasovsky - CV</title>
      </Head>
      <h1 className="text-4xl font-bold mb-2">Olga Yasovsky</h1>
      <h2 className="mb-6">R&D Leader & Engineer</h2>
      <div className="space-x-4">
        <a href="/Olga_Yasovsky_CV.pdf" download>
          <Button>📄 View Classic CV</Button>
        </a>
        <a href="/game">
          <Button>🤖 Enter Game Mode</Button>
        </a>
      </div>
      <p className="mt-10 opacity-75">Innovator, Leader, Storyteller</p>
    </div>
  );
}
