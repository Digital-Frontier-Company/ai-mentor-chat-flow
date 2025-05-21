
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { toast } from 'sonner';
import { useQuery } from '@tanstack/react-query';
import { AlertCircle, CreditCard, Check, X } from 'lucide-react';

const UserProfile: React.FC = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  
  useEffect(() => {
    if (user) {
      setEmail(user.email || '');
    }
  }, [user]);

  // Fetch subscription information
  const { data: subscription, isLoading: subscriptionLoading, refetch: refetchSubscription } = useQuery({
    queryKey: ['subscription', user?.id],
    queryFn: async () => {
      if (!user) return null;
      
      try {
        const { data, error } = await supabase
          .from('subscribers')
          .select('*')
          .eq('user_id', user.id)
          .single();
          
        if (error) throw error;
        return data;
      } catch (error) {
        console.error('Error fetching subscription:', error);
        return null;
      }
    },
    enabled: !!user,
  });

  const handleUpdateEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    
    try {
      setLoading(true);
      const { error } = await supabase.auth.updateUser({ email });
      
      if (error) throw error;
      
      toast.success('Email update initiated. Please check your new email for a confirmation link.');
    } catch (error) {
      console.error('Error updating email:', error);
      toast.error('Failed to update email. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password || !newPassword) return;
    
    try {
      setLoading(true);
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      
      if (error) throw error;
      
      toast.success('Password updated successfully.');
      setPassword('');
      setNewPassword('');
    } catch (error) {
      console.error('Error updating password:', error);
      toast.error('Failed to update password. Please try again.');
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
      
      // Redirect to Stripe Customer Portal
      if (data?.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error('Error managing subscription:', error);
      toast.error('Failed to open subscription management. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut();
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
      toast.error('Failed to sign out. Please try again.');
    }
  };

  if (!user) {
    return (
      <div className="flex justify-center items-center min-h-[70vh]">
        <Alert className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Authentication required</AlertTitle>
          <AlertDescription>
            Please log in to access your account settings.
            <Button 
              variant="link" 
              className="pl-0" 
              onClick={() => navigate('/auth')}
            >
              Go to login
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container max-w-4xl mx-auto py-12 px-4">
      <h1 className="text-3xl font-bold mb-8">Account Settings</h1>
      
      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="grid grid-cols-2 mb-8">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="subscription">Subscription</TabsTrigger>
        </TabsList>
        
        <TabsContent value="profile">
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Email Address</CardTitle>
                <CardDescription>
                  Update your email address. You'll need to verify the new email.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleUpdateEmail} className="space-y-4">
                  <Input
                    type="email"
                    placeholder="Email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                  <Button type="submit" disabled={loading || !email}>
                    {loading ? 'Updating...' : 'Update Email'}
                  </Button>
                </form>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Change Password</CardTitle>
                <CardDescription>
                  Update your password to a new secure one.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleUpdatePassword} className="space-y-4">
                  <Input
                    type="password"
                    placeholder="New password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    minLength={6}
                  />
                  <Button 
                    type="submit" 
                    disabled={loading || !newPassword}
                  >
                    {loading ? 'Updating...' : 'Update Password'}
                  </Button>
                </form>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Account Actions</CardTitle>
                <CardDescription>
                  Manage your account sessions and data.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button 
                  variant="destructive" 
                  onClick={handleLogout}
                >
                  Sign Out
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="subscription">
          <Card>
            <CardHeader>
              <CardTitle>Subscription Status</CardTitle>
              <CardDescription>
                Manage your current subscription and billing information.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {subscriptionLoading ? (
                <div className="flex items-center space-x-4 py-6">
                  <div className="h-5 w-5 animate-spin rounded-full border-b-2 border-lime-500"></div>
                  <p>Loading subscription information...</p>
                </div>
              ) : subscription ? (
                <div className="space-y-6">
                  <div className="rounded-lg border p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-lg font-medium">Current Plan</h3>
                      {subscription.subscribed ? (
                        <div className="flex items-center text-green-500">
                          <Check className="h-4 w-4 mr-1" />
                          <span>Active</span>
                        </div>
                      ) : (
                        <div className="flex items-center text-red-500">
                          <X className="h-4 w-4 mr-1" />
                          <span>Inactive</span>
                        </div>
                      )}
                    </div>
                    
                    {subscription.subscribed && (
                      <>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <span className="text-zinc-400">Subscription Tier:</span>
                          <span>{subscription.subscription_tier || 'Basic'}</span>
                          
                          <span className="text-zinc-400">Renewal Date:</span>
                          <span>
                            {subscription.subscription_end 
                              ? new Date(subscription.subscription_end).toLocaleDateString() 
                              : 'Not available'}
                          </span>
                        </div>
                      </>
                    )}
                  </div>
                  
                  <Button 
                    onClick={handleManageSubscription} 
                    disabled={loading}
                    className="w-full"
                  >
                    <CreditCard className="mr-2 h-4 w-4" />
                    {subscription.subscribed 
                      ? 'Manage Subscription' 
                      : 'View Subscription Options'}
                  </Button>
                  
                  <Button 
                    variant="outline"
                    onClick={() => refetchSubscription()}
                    disabled={subscriptionLoading}
                    className="w-full"
                  >
                    Refresh Subscription Status
                  </Button>
                </div>
              ) : (
                <div className="text-center py-6">
                  <p className="mb-4">You don't have an active subscription yet.</p>
                  <Button 
                    onClick={() => navigate('/pricing')}
                    className="bg-gradient-to-r from-lime-500 to-lime-400 text-zinc-900"
                  >
                    View Pricing Plans
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default UserProfile;
