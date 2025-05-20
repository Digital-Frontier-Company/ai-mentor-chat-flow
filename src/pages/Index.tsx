
import React from 'react';
import { MentorProvider } from '@/contexts/MentorContext';
import MentorApp from '@/components/MentorApp';
import Logo from '@/components/ui/logo';

const Index = () => {
  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <header 
        className="py-4 border-b border-zinc-800 bg-zinc-900"
        style={{
          backgroundImage: `url('/lovable-uploads/75b303a0-d06c-44da-9531-3cfb842f4ba4.png')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          position: 'relative',
        }}
      >
        <div className="absolute inset-0 bg-black bg-opacity-50"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="flex justify-center">
            <Logo size="md" />
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
          <p>© {new Date().getFullYear()} MakeMentors.io. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
