
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Menu, X, LogIn, User, CreditCard, Home, MessageCircle, Settings } from 'lucide-react';
import Logo from '@/components/ui/logo';
import { useAuth } from '@/contexts/AuthContext';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

const HomeHeader: React.FC = () => {
  const {
    user,
    signOut
  } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };
  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };
  return <header className="py-4 border-b border-zinc-800 bg-zinc-900/95 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between">
          <div>
            <Link to="/" className="flex items-center gap-2">
              <Logo size="md" />
            </Link>
          </div>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            <Button variant="ghost" size="sm" asChild>
              <Link to="/">Home</Link>
            </Button>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/pricing">Pricing</Link>
            </Button>
            {user && <>
                <Button variant="ghost" size="sm" asChild>
                  <Link to="/app">Dashboard</Link>
                </Button>
              </>}
            <Button variant="ghost" size="sm" asChild>
              <Link to="/legal/terms">Terms</Link>
            </Button>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/legal/privacy">Privacy</Link>
            </Button>
          </nav>
          
          {/* User Actions */}
          <div className="hidden md:block">
            {user ? <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="flex items-center gap-2">
                    <User size={16} />
                    <span className="max-w-[100px] truncate">{user.email}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate('/app')}>
                    <Home className="mr-2 h-4 w-4" />
                    <span>Dashboard</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/app')}>
                    <MessageCircle className="mr-2 h-4 w-4" />
                    <span>My Mentors</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/settings')}>
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/pricing')}>
                    <CreditCard className="mr-2 h-4 w-4" />
                    <span>Subscription</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut}>
                    <LogIn className="mr-2 h-4 w-4" />
                    <span>Sign out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu> : <div className="flex gap-3">
                <Button size="sm" variant="default" asChild>
                  <Link to="/auth">
                    Sign in
                  </Link>
                </Button>
                <Button size="sm" variant="default" asChild>
                  <Link to="/auth?signup=true">
                    Sign up free
                  </Link>
                </Button>
              </div>}
          </div>
          
          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <Button variant="ghost" size="icon" onClick={toggleMobileMenu}>
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </Button>
          </div>
        </div>
        
        {/* Mobile Menu */}
        {mobileMenuOpen && <div className="md:hidden py-4 border-t border-zinc-800 mt-4">
            <nav className="flex flex-col space-y-3">
              <Button variant="ghost" size="sm" asChild onClick={toggleMobileMenu}>
                <Link to="/">Home</Link>
              </Button>
              <Button variant="ghost" size="sm" asChild onClick={toggleMobileMenu}>
                <Link to="/pricing">Pricing</Link>
              </Button>
              {user && <>
                  <Button variant="ghost" size="sm" asChild onClick={toggleMobileMenu}>
                    <Link to="/app">Dashboard</Link>
                  </Button>
                  <Button variant="ghost" size="sm" asChild onClick={toggleMobileMenu}>
                    <Link to="/settings">Settings</Link>
                  </Button>
                </>}
              <Button variant="ghost" size="sm" asChild onClick={toggleMobileMenu}>
                <Link to="/legal/terms">Terms</Link>
              </Button>
              <Button variant="ghost" size="sm" asChild onClick={toggleMobileMenu}>
                <Link to="/legal/privacy">Privacy</Link>
              </Button>
              
              <div className="pt-3 border-t border-zinc-800">
                {user ? <div className="space-y-3">
                    <div className="text-sm text-zinc-400">
                      Signed in as: <span className="font-medium text-white">{user.email}</span>
                    </div>
                    <Button variant="default" size="sm" className="w-full" onClick={() => {
                handleSignOut();
                toggleMobileMenu();
              }}>
                      Sign out
                    </Button>
                  </div> : <div className="flex flex-col gap-3">
                    <Button size="sm" variant="default" asChild onClick={toggleMobileMenu}>
                      <Link to="/auth">
                        Sign in
                      </Link>
                    </Button>
                    <Button size="sm" variant="default" asChild onClick={toggleMobileMenu}>
                      <Link to="/auth?signup=true">
                        Sign up free
                      </Link>
                    </Button>
                  </div>}
              </div>
            </nav>
          </div>}
      </div>
    </header>;
};

export default HomeHeader;
