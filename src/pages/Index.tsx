
import React from 'react';
import { Link } from 'react-router-dom';
import { MentorProvider } from '@/contexts/MentorContext';
import MentorApp from '@/components/MentorApp';
import Logo from '@/components/ui/logo';
import { Button } from '@/components/ui/button';
import { HomeIcon, MessageCircle, Settings, LogOut } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import LoadingState from '@/components/mentor/LoadingState';
import SkipToContent from '@/components/accessibility/SkipToContent';
import MetaTags from '@/components/SEO/MetaTags';
import { OrganizationSchema } from '@/components/SEO/StructuredData';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { cn } from '@/lib/utils';

const Index = () => {
  const { user, signOut, loading } = useAuth();
  
  // Show loading state while auth is being checked
  if (loading) {
    return <LoadingState message="Loading your dashboard..." withBackdrop={true} />;
  }
  
  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      {/* Add SEO meta tags */}
      <MetaTags 
        title="MakeMentors.io - Your AI Mentoring Dashboard"
        description="Access your personalized AI mentors to accelerate your learning and growth."
        keywords="AI mentor, dashboard, personalized learning, mentorship"
      />
      
      {/* Add structured data for better search engine understanding */}
      <OrganizationSchema
        name="MakeMentors.io"
        url="https://makementors.io"
        logo="/lovable-uploads/bd0c9938-869e-417d-8441-834fe7445b8b.png"
        description="MakeMentors.io helps you create personalized AI mentors for any subject, skill, or goal."
      />

      <SkipToContent />
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
            
            <nav aria-label="Main Navigation" className="hidden md:block">
              <NavigationMenu>
                <NavigationMenuList>
                  <NavigationMenuItem>
                    <NavigationMenuLink asChild className={navigationMenuTriggerStyle()}>
                      <Link to="/">
                        <HomeIcon size={18} className="mr-2" />
                        <span>Home</span>
                      </Link>
                    </NavigationMenuLink>
                  </NavigationMenuItem>
                  
                  <NavigationMenuItem>
                    <NavigationMenuLink asChild className={navigationMenuTriggerStyle()}>
                      <Link to="/app">
                        <MessageCircle size={18} className="mr-2" />
                        <span>Chat</span>
                      </Link>
                    </NavigationMenuLink>
                  </NavigationMenuItem>
                  
                  <NavigationMenuItem>
                    <NavigationMenuLink asChild className={navigationMenuTriggerStyle()}>
                      <Link to="/settings">
                        <Settings size={18} className="mr-2" />
                        <span>Settings</span>
                      </Link>
                    </NavigationMenuLink>
                  </NavigationMenuItem>
                </NavigationMenuList>
              </NavigationMenu>
            </nav>
            
            <div>
              {user ? (
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex items-center gap-2"
                  onClick={() => signOut()}
                >
                  <LogOut size={18} />
                  <span>Sign out</span>
                </Button>
              ) : (
                <Button variant="outline" size="sm" asChild className="flex items-center gap-2">
                  <Link to="/auth">
                    Sign in
                  </Link>
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>
      
      <main id="main-content" className="py-8">
        <MentorProvider>
          <MentorApp />
        </MentorProvider>
      </main>
      
      <footer className="py-6 text-center text-sm text-zinc-500 border-t border-zinc-800" role="contentinfo">
        <div className="container">
          <p>© {new Date().getFullYear()} MakeMentors.io. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
