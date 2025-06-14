import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import AddFinancialTemplates from '@/components/admin/AddFinancialTemplates';
import ChatDebugPanel from '@/components/admin/ChatDebugPanel';

const Settings = () => {
  const { user } = useAuth();
  
  // Check if user is an admin with the new email
  const isAdmin = user && user.email === 'david@memphisearthmovers.com';
  
  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <h1 className="text-3xl font-bold mb-6">Settings</h1>
      
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>User Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-zinc-400">User settings will be implemented in a future update.</p>
        </CardContent>
      </Card>
      
      {isAdmin && (
        <Card>
          <CardHeader>
            <CardTitle>Admin Tools</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <AddFinancialTemplates />
            
            <Separator />
            
            <div>
              <h3 className="text-lg font-semibold mb-3">Other Admin Tools</h3>
              <p className="text-zinc-400">Additional admin tools will be implemented in future updates.</p>
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Chat Integration Debug Panel */}
      <section>
        <h2 className="text-xl font-semibold mb-4">Chat Integration</h2>
        <ChatDebugPanel />
      </section>
    </div>
  );
};

export default Settings;
