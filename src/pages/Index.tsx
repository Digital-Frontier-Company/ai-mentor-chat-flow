
import React from 'react';
import { Link } from 'react-router-dom';
import { MentorProvider } from '@/contexts/MentorContext';
import MentorApp from '@/components/MentorApp';
import Logo from '@/components/ui/logo';
import { Button } from '@/components/ui/button';
import { HomeIcon, MessageCircle, Settings, UserCircle } from 'lucide-react';

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
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Logo size="md" />
            </div>
            
            <nav className="hidden md:flex space-x-4">
              <Button variant="ghost" size="sm" asChild>
                <Link to="/" className="flex items-center gap-2">
                  <HomeIcon size={18} />
                  <span>Home</span>
                </Link>
              </Button>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/app" className="flex items-center gap-2">
                  <MessageCircle size={18} />
                  <span>Chat</span>
                </Link>
              </Button>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/settings" className="flex items-center gap-2">
                  <Settings size={18} />
                  <span>Settings</span>
                </Link>
              </Button>
            </nav>
            
            <div>
              <Button variant="outline" size="sm" className="flex items-center gap-2">
                <UserCircle size={18} />
                <span>Sign in</span>
              </Button>
            </div>
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
