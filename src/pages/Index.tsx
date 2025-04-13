
import React from 'react';
import { MentorProvider } from '@/contexts/MentorContext';
import MentorApp from '@/components/MentorApp';

const Index = () => {
  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <header className="py-4 border-b border-zinc-800 bg-zinc-900">
        <div className="container mx-auto px-4">
          <div className="flex justify-center">
            <h1 className="text-2xl font-bold text-emerald-500">
              AI Mentor Chat Flow
            </h1>
          </div>
        </div>
      </header>
      
      <main className="py-8">
        <MentorProvider>
          <MentorApp />
        </MentorProvider>
      </main>
      
      <footer className="py-6 text-center text-sm text-zinc-500 border-t border-zinc-800">
        <div className="container">
          <p>© {new Date().getFullYear()} AI Mentor Chat Flow. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
