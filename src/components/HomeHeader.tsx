
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import Logo from '@/components/ui/logo';
import { useAuth } from '@/contexts/AuthContext';
import { LogOut, Settings } from 'lucide-react';

const HomeHeader: React.FC = () => {
  const { user, signOut } = useAuth();

  return (
    <header className="py-4 px-6">
      <div className="max-w-6xl mx-auto flex justify-between items-center">
        <Logo size="lg" />
        <div className="space-x-2">
          {user ? (
            <>
              <Link to="/app">
                <Button variant="ghost" className="text-zinc-400 hover:text-white">
                  My Mentors
                </Button>
              </Link>
              <Link to="/settings">
                <Button variant="ghost" className="text-zinc-400 hover:text-white">
                  <Settings className="h-4 w-4 mr-2" />
                  Settings
                </Button>
              </Link>
              <Button 
                variant="outline" 
                className="text-zinc-300 border-zinc-700 hover:bg-zinc-800"
                onClick={() => signOut()}
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </>
          ) : (
            <>
              <Link to="/auth">
                <Button variant="ghost" className="text-zinc-400 hover:text-white">
                  Login
                </Button>
              </Link>
              <Link to="/auth">
                <Button className="bg-lime-500 hover:bg-lime-600 text-zinc-900">
                  Get Started
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default HomeHeader;
