
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery, useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { extendedSupabase } from '@/integrations/supabase/extended-client';
import { Subscriber } from '@/types/supabase-extensions';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, CreditCard, Settings as SettingsIcon, LogOut } from 'lucide-react';

const SettingsPage = () => {
  const { user, signOut } = useAuth();
  const [firstName, setFirstName] = React.useState('');
  const [lastName, setLastName] = React.useState('');
  const [avatarUrl, setAvatarUrl] = React.useState<string | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Fetch user profile
  const { data: profile, isLoading: profileLoading, refetch: refetchProfile } = useQuery({
    queryKey: ['profile', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  // Fetch subscription info
  const { data: subscription, isLoading: subscriptionLoading } = useQuery({
    queryKey: ['subscription', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      // Use the extended supabase client for the subscribers table
      const { data, error } = await extendedSupabase
        .from('subscribers')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data as Subscriber | null;
    },
    enabled: !!user?.id,
  });

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: async ({ firstName, lastName }: { firstName: string; lastName: string }) => {
      if (!user?.id) throw new Error('No user ID');

      const { error } = await supabase
        .from('profiles')
        .upsert({ 
          id: user.id,
          first_name: firstName,
          last_name: lastName,
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'id'
        });

      if (error) throw error;
      return { success: true };
    },
    onSuccess: () => {
      toast({ title: "Profile updated", description: "Your profile has been successfully updated." });
      refetchProfile();
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: `Failed to update profile: ${error.message}`
      });
    }
  });

  // Upload avatar mutation
  const uploadAvatarMutation = useMutation({
    mutationFn: async (file: File) => {
      if (!user?.id) throw new Error('No user ID');

      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/avatar.${fileExt}`;
      
      const { error: uploadError } = await supabase
        .storage
        .from('avatars')
        .upload(fileName, file, {
          upsert: true
        });

      if (uploadError) throw uploadError;

      const { data: urlData } = await supabase
        .storage
        .from('avatars')
        .getPublicUrl(fileName);

      return { avatarUrl: urlData.publicUrl };
    },
    onSuccess: (data) => {
      setAvatarUrl(data.avatarUrl);
      toast({ title: "Avatar updated", description: "Your avatar has been successfully updated." });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: `Failed to upload avatar: ${error.message}`
      });
    }
  });

  // Create checkout session
  const createCheckoutSession = async (priceId: string) => {
    try {
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: {
          priceId,
          userId: user.id,
          returnUrl: window.location.origin + '/settings'
        }
      });

      if (error) throw error;
      
      // Redirect to Stripe Checkout
      window.location.href = data.url;
    } catch (error: any) {
      console.error('Error creating checkout session:', error);
      toast({
        variant: "destructive",
        title: "Payment Error",
        description: `Could not process payment: ${error.message}`
      });
    }
  };

  // Manage existing subscription
  const manageSubscription = async () => {
    try {
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase.functions.invoke('manage-subscription', {
        body: {
          action: 'portal',
          returnUrl: window.location.origin + '/settings'
        }
      });

      if (error) throw error;
      
      // Redirect to Stripe Customer Portal
      window.location.href = data.url;
    } catch (error: any) {
      console.error('Error accessing subscription portal:', error);
      toast({
        variant: "destructive",
        title: "Subscription Error",
        description: `Could not access subscription management: ${error.message}`
      });
    }
  };

  // Set form values when profile loads
  React.useEffect(() => {
    if (profile) {
      setFirstName(profile.first_name || '');
      setLastName(profile.last_name || '');
    }
  }, [profile]);

  // Load avatar URL
  React.useEffect(() => {
    if (user) {
      const fetchAvatar = async () => {
        try {
          const { data } = await supabase.storage.from('avatars').list(user.id);
          if (data && data.length > 0) {
            const { data: urlData } = await supabase.storage.from('avatars').getPublicUrl(`${user.id}/avatar.${data[0].name.split('.').pop()}`);
            setAvatarUrl(urlData.publicUrl);
          }
        } catch (error) {
          console.error('Error fetching avatar:', error);
        }
      };
      
      fetchAvatar();
    }
  }, [user]);

  // Handle avatar file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      uploadAvatarMutation.mutate(e.target.files[0]);
    }
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfileMutation.mutate({ firstName, lastName });
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Please log in to view your settings</h1>
          <Button asChild>
            <a href="/auth">Login</a>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <header className="py-4 border-b border-zinc-800 bg-zinc-900">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">Settings</h1>
            <Button variant="outline" size="sm" onClick={() => signOut()}>
              <LogOut className="mr-2 h-4 w-4" /> Sign Out
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Tabs defaultValue="profile" className="w-full max-w-4xl mx-auto">
          <TabsList className="grid grid-cols-2 w-[400px] mb-8">
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <SettingsIcon className="h-4 w-4" /> Profile
            </TabsTrigger>
            <TabsTrigger value="subscription" className="flex items-center gap-2">
              <CreditCard className="h-4 w-4" /> Subscription
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="profile">
            <Card className="bg-zinc-900 border-zinc-800">
              <CardHeader>
                <CardTitle>Profile Settings</CardTitle>
                <CardDescription>Manage your account details and preferences.</CardDescription>
              </CardHeader>
              <CardContent>
                {profileLoading ? (
                  <div className="flex items-center justify-center p-8">
                    <Loader2 className="h-8 w-8 animate-spin text-lime-500" />
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="flex flex-col items-center space-y-4 mb-8">
                      <Avatar className="h-24 w-24 border-2 border-lime-500">
                        <AvatarImage src={avatarUrl || undefined} alt="Profile" />
                        <AvatarFallback className="text-2xl bg-lime-700">
                          {firstName && lastName 
                            ? firstName[0] + lastName[0] 
                            : user.email ? user.email[0].toUpperCase() : 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <input
                          type="file"
                          ref={fileInputRef}
                          onChange={handleFileChange}
                          accept="image/*"
                          className="hidden"
                        />
                        <Button 
                          type="button" 
                          variant="outline"
                          onClick={() => fileInputRef.current?.click()}
                          disabled={uploadAvatarMutation.isPending}
                        >
                          {uploadAvatarMutation.isPending ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Uploading...
                            </>
                          ) : (
                            <>Change Avatar</>
                          )}
                        </Button>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          type="email"
                          value={user.email || ''}
                          disabled
                          className="bg-zinc-800 border-zinc-700"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="userId">User ID</Label>
                        <Input
                          id="userId"
                          type="text"
                          value={user.id}
                          disabled
                          className="bg-zinc-800 border-zinc-700 text-zinc-400"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="firstName">First Name</Label>
                        <Input
                          id="firstName"
                          type="text"
                          value={firstName}
                          onChange={(e) => setFirstName(e.target.value)}
                          placeholder="Enter your first name"
                          className="bg-zinc-800 border-zinc-700"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lastName">Last Name</Label>
                        <Input
                          id="lastName"
                          type="text"
                          value={lastName}
                          onChange={(e) => setLastName(e.target.value)}
                          placeholder="Enter your last name"
                          className="bg-zinc-800 border-zinc-700"
                        />
                      </div>
                    </div>
                    
                    <Button 
                      type="submit" 
                      className="w-full md:w-auto bg-lime-600 hover:bg-lime-700"
                      disabled={updateProfileMutation.isPending}
                    >
                      {updateProfileMutation.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>Save Changes</>
                      )}
                    </Button>
                  </form>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="subscription">
            <Card className="bg-zinc-900 border-zinc-800">
              <CardHeader>
                <CardTitle>Subscription Management</CardTitle>
                <CardDescription>Manage your subscription plan and billing details.</CardDescription>
              </CardHeader>
              <CardContent>
                {subscriptionLoading ? (
                  <div className="flex items-center justify-center p-8">
                    <Loader2 className="h-8 w-8 animate-spin text-lime-500" />
                  </div>
                ) : subscription && subscription.subscribed ? (
                  <div className="space-y-6">
                    <div className="p-4 bg-zinc-800 rounded-lg border border-zinc-700">
                      <div className="flex justify-between items-center">
                        <div>
                          <h3 className="font-semibold text-lime-500">
                            {subscription.subscription_tier || 'Infinite'}
                          </h3>
                          <p className="text-sm text-zinc-400">
                            Current subscription active until{' '}
                            {subscription.subscription_end 
                              ? new Date(subscription.subscription_end).toLocaleDateString() 
                              : 'N/A'}
                          </p>
                        </div>
                        <div className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-lime-600 text-white hover:bg-lime-700 h-10 px-4 py-2">
                          Active
                        </div>
                      </div>
                    </div>
                    
                    <Button 
                      onClick={manageSubscription}
                      className="w-full md:w-auto"
                      variant="outline"
                    >
                      <CreditCard className="mr-2 h-4 w-4" />
                      Manage Subscription
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="p-4 bg-zinc-800 rounded-lg border border-zinc-700">
                      <p className="mb-4">You don't have an active subscription. Subscribe to unlock premium features!</p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Card className="bg-zinc-800 border-zinc-700">
                          <CardHeader>
                            <CardTitle>3 Mentors</CardTitle>
                            <div className="text-3xl font-bold">$29.99<span className="text-sm text-zinc-400">/month</span></div>
                          </CardHeader>
                          <CardContent>
                            <ul className="space-y-2 mb-4">
                              <li className="flex items-center">
                                <svg className="w-5 h-5 text-lime-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                                Use up to 3 mentors
                              </li>
                              <li className="flex items-center">
                                <svg className="w-5 h-5 text-lime-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                                Basic customization
                              </li>
                              <li className="flex items-center">
                                <svg className="w-5 h-5 text-lime-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                                Standard support
                              </li>
                            </ul>
                          </CardContent>
                          <CardFooter>
                            <Button 
                              onClick={() => createCheckoutSession('price_1RDBtOLdC3hp2fnCZFFd86j1')}
                              className="w-full bg-lime-600 hover:bg-lime-700"
                            >
                              Subscribe Now
                            </Button>
                          </CardFooter>
                        </Card>
                      
                        <Card className="bg-zinc-800 border-zinc-700 border-lime-500">
                          <CardHeader>
                            <div className="flex justify-between items-center">
                              <CardTitle>Infinite</CardTitle>
                              <span className="bg-lime-600 text-white text-xs px-2 py-1 rounded-full">Best Value</span>
                            </div>
                            <div className="text-3xl font-bold">$99.99<span className="text-sm text-zinc-400">/month</span></div>
                          </CardHeader>
                          <CardContent>
                            <ul className="space-y-2 mb-4">
                              <li className="flex items-center">
                                <svg className="w-5 h-5 text-lime-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                                Unlimited mentors
                              </li>
                              <li className="flex items-center">
                                <svg className="w-5 h-5 text-lime-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                                Advanced customization
                              </li>
                              <li className="flex items-center">
                                <svg className="w-5 h-5 text-lime-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                                Priority support
                              </li>
                              <li className="flex items-center">
                                <svg className="w-5 h-5 text-lime-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                                Exclusive Infinite features
                              </li>
                            </ul>
                          </CardContent>
                          <CardFooter>
                            <Button 
                              onClick={() => createCheckoutSession('price_1RDBwHLdC3hp2fnCnUVGgTQO')}
                              className="w-full bg-lime-600 hover:bg-lime-700"
                            >
                              Subscribe Now
                            </Button>
                          </CardFooter>
                        </Card>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default SettingsPage;
