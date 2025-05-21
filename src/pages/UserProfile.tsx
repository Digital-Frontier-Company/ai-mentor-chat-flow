
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { CreditCard, Home, Settings as SettingsIcon, User } from 'lucide-react';

const UserProfile: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [userInitials, setUserInitials] = useState('');
  
  useEffect(() => {
    if (user?.email) {
      // Generate initials from email
      const emailParts = user.email.split('@')[0].split(/[._-]/);
      const initials = emailParts
        .slice(0, 2)
        .map(part => part.charAt(0).toUpperCase())
        .join('');
      
      setUserInitials(initials);
    }
  }, [user]);
  
  return (
    <div className="container py-10 max-w-5xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Your Profile</h1>
        <p className="text-zinc-400">View and manage your personal profile</p>
      </div>
      
      <div className="grid gap-8 md:grid-cols-4">
        <Card className="md:col-span-1 bg-zinc-900 border-zinc-800">
          <CardContent className="p-4">
            <nav className="space-y-2">
              <Button variant="ghost" className="w-full justify-start" onClick={() => navigate('/app')}>
                <Home className="mr-2 h-4 w-4" />
                Dashboard
              </Button>
              <Button variant="ghost" className="w-full justify-start" onClick={() => navigate('/settings')}>
                <SettingsIcon className="mr-2 h-4 w-4" />
                Settings
              </Button>
              <Button variant="ghost" className="w-full justify-start text-lime-500" onClick={() => navigate('/user-profile')}>
                <User className="mr-2 h-4 w-4" />
                Profile
              </Button>
              <Button variant="ghost" className="w-full justify-start" onClick={() => navigate('/pricing')}>
                <CreditCard className="mr-2 h-4 w-4" />
                Subscription
              </Button>
            </nav>
          </CardContent>
        </Card>
        
        <div className="md:col-span-3 space-y-6">
          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader>
              <CardTitle>User Profile</CardTitle>
              <CardDescription>Your personal information and profile details</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center text-center sm:flex-row sm:text-left sm:items-start">
                <Avatar className="h-24 w-24 mb-4 sm:mb-0 sm:mr-6">
                  <AvatarFallback className="text-2xl bg-lime-500 text-zinc-900">{userInitials}</AvatarFallback>
                </Avatar>
                
                <div>
                  <h3 className="text-xl font-medium">{user?.email}</h3>
                  <p className="text-zinc-400 mt-1">Member since {new Date(user?.created_at || Date.now()).toLocaleDateString()}</p>
                  
                  <div className="mt-4 flex flex-wrap gap-2">
                    <Button variant="outline" size="sm" onClick={() => navigate('/settings')}>
                      Edit Profile
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => navigate('/pricing')}>
                      Manage Subscription
                    </Button>
                  </div>
                </div>
              </div>
              
              <div className="mt-10 border-t border-zinc-800 pt-6">
                <h4 className="font-medium mb-4">Account Summary</h4>
                <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <dt className="text-zinc-400 text-sm">Email</dt>
                    <dd>{user?.email}</dd>
                  </div>
                  <div>
                    <dt className="text-zinc-400 text-sm">Account Type</dt>
                    <dd>Standard User</dd>
                  </div>
                  <div>
                    <dt className="text-zinc-400 text-sm">Mentors Created</dt>
                    <dd>0</dd>
                  </div>
                  <div>
                    <dt className="text-zinc-400 text-sm">Total Chat Messages</dt>
                    <dd>0</dd>
                  </div>
                </dl>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader>
              <CardTitle>Learning Stats</CardTitle>
              <CardDescription>Track your learning progress</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-zinc-400">You'll see your learning statistics here once you start using mentors.</p>
              
              <Button className="mt-4" onClick={() => navigate('/app')}>
                Start Learning
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
