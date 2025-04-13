
import React from 'react';
import { MentorProvider } from '@/contexts/MentorContext';
import MentorApp from '@/components/MentorApp';

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-50 to-zinc-100 dark:from-zinc-900 dark:to-zinc-800">
      <header className="py-6 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-zinc-950 shadow-sm">
        <div className="container">
          <div className="flex justify-center">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-500 to-purple-600 bg-clip-text text-transparent">
              AI Mentor Chat Flow
            </h1>
          </div>
        </div>
      </header>
      
      <main>
        <MentorProvider>
          <MentorApp />
        </MentorProvider>
      </main>
      
      <footer className="py-6 text-center text-sm text-muted-foreground">
        <div className="container">
          <p>© {new Date().getFullYear()} AI Mentor Chat Flow. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
