
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { CreditCard, Home, Settings as SettingsIcon, User } from 'lucide-react';

const Settings: React.FC = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [username, setUsername] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }
    
    try {
      setLoading(true);
      
      // Update password via Supabase Auth
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });
      
      if (error) throw error;
      
      toast.success('Password updated successfully');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error: any) {
      toast.error(error.message || 'Failed to update password');
    } finally {
      setLoading(false);
    }
  };

  const handleManageSubscription = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.functions.invoke('manage-subscription', {
        body: {
          action: 'portal',
          returnUrl: window.location.origin + '/settings'
        }
      });
      
      if (error) throw error;
      
      if (data?.url) {
        window.location.href = data.url;
      }
    } catch (error: any) {
      console.error('Error opening customer portal:', error);
      toast.error('Failed to open subscription management portal');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-10 max-w-5xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Account Settings</h1>
        <p className="text-zinc-400">Manage your account, profile, and subscription settings</p>
      </div>
      
      <div className="grid gap-8 md:grid-cols-4">
        <Card className="md:col-span-1 bg-zinc-900 border-zinc-800">
          <CardContent className="p-4">
            <nav className="space-y-2">
              <Button variant="ghost" className="w-full justify-start" onClick={() => navigate('/app')}>
                <Home className="mr-2 h-4 w-4" />
                Dashboard
              </Button>
              <Button variant="ghost" className="w-full justify-start text-lime-500" onClick={() => navigate('/settings')}>
                <SettingsIcon className="mr-2 h-4 w-4" />
                Settings
              </Button>
              <Button variant="ghost" className="w-full justify-start" onClick={() => navigate('/user-profile')}>
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
              <CardTitle>Your Account</CardTitle>
              <CardDescription>Manage your account settings and change your password</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="password">
                <TabsList className="grid w-full grid-cols-2 bg-zinc-800">
                  <TabsTrigger value="account">Account Info</TabsTrigger>
                  <TabsTrigger value="password">Password</TabsTrigger>
                </TabsList>
                
                <TabsContent value="account" className="pt-4">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input 
                        id="email" 
                        value={user?.email || ''} 
                        disabled 
                        className="bg-zinc-800"
                      />
                      <p className="text-xs text-zinc-500 mt-1">Email cannot be changed</p>
                    </div>
                    
                    <div>
                      <Label htmlFor="username">Username</Label>
                      <Input 
                        id="username" 
                        value={username} 
                        onChange={(e) => setUsername(e.target.value)}
                        className="bg-zinc-800"
                        placeholder="Set a username"
                      />
                    </div>
                    
                    <Button disabled={loading}>
                      Save Changes
                    </Button>
                  </div>
                </TabsContent>
                
                <TabsContent value="password" className="pt-4">
                  <form onSubmit={handleUpdatePassword} className="space-y-4">
                    <div>
                      <Label htmlFor="current-password">Current Password</Label>
                      <Input 
                        id="current-password" 
                        type="password" 
                        value={currentPassword} 
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        className="bg-zinc-800"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="new-password">New Password</Label>
                      <Input 
                        id="new-password" 
                        type="password" 
                        value={newPassword} 
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="bg-zinc-800"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="confirm-password">Confirm New Password</Label>
                      <Input 
                        id="confirm-password" 
                        type="password" 
                        value={confirmPassword} 
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="bg-zinc-800"
                      />
                    </div>
                    
                    <Button type="submit" disabled={loading}>
                      Update Password
                    </Button>
                  </form>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
          
          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader>
              <CardTitle>Subscription Management</CardTitle>
              <CardDescription>View and manage your current subscription</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p>Manage your subscription through the Stripe Customer Portal.</p>
                <Button 
                  onClick={handleManageSubscription} 
                  disabled={loading}
                  className="bg-gradient-to-r from-lime-500 to-lime-400 text-zinc-900"
                >
                  Manage Subscription
                </Button>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader>
              <CardTitle>Danger Zone</CardTitle>
              <CardDescription>Actions that can't be undone</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Button variant="destructive" onClick={signOut}>
                  Sign Out
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Settings;
