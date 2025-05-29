
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { useN8nIntegration, N8N_CONFIG } from '@/config/n8nConfig';
import { sendMessageToN8n } from '@/utils/n8nApi';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';

const ChatDebugPanel: React.FC = () => {
  const [testMessage, setTestMessage] = useState('Hello, this is a test message');
  const [testResponse, setTestResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const isN8nEnabled = useN8nIntegration();

  const testN8nConnection = async () => {
    if (!N8N_CONFIG.webhookUrl) {
      toast({
        title: "Configuration Error",
        description: "n8n webhook URL is not configured",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setTestResponse('');

    try {
      const response = await sendMessageToN8n(
        testMessage,
        [],
        { name: 'Test User', goal: 'Testing', experience: 'Beginner' },
        {
          id: 'test-mentor',
          name: 'Test Mentor',
          description: 'A test mentor for debugging',
          category: 'technology',
          icon: '🤖',
          gradient: 'from-blue-500 to-purple-600',
          expertise: 'Testing',
          learningPath: [],
        },
        null,
        'test-user'
      );

      setTestResponse(response.output);
      toast({
        title: "Success",
        description: "n8n connection test successful",
        variant: "default",
      });
    } catch (error) {
      console.error('n8n test failed:', error);
      setTestResponse(`Error: ${error.message}`);
      toast({
        title: "Test Failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Chat Debug Panel
          <Badge variant={isN8nEnabled ? "default" : "secondary"}>
            {isN8nEnabled ? "n8n Enabled" : "Edge Function Only"}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <strong>n8n Webhook URL:</strong>
            <p className="text-muted-foreground break-all">
              {N8N_CONFIG.webhookUrl || 'Not configured'}
            </p>
          </div>
          <div>
            <strong>Status:</strong>
            <p className={isN8nEnabled ? 'text-green-600' : 'text-orange-600'}>
              {isN8nEnabled ? 'Ready' : 'Disabled'}
            </p>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Test Message:</label>
          <Textarea
            value={testMessage}
            onChange={(e) => setTestMessage(e.target.value)}
            placeholder="Enter a test message..."
            className="min-h-[80px]"
          />
        </div>

        <Button 
          onClick={testN8nConnection}
          disabled={!N8N_CONFIG.webhookUrl || isLoading}
          className="w-full"
        >
          {isLoading ? 'Testing...' : 'Test n8n Connection'}
        </Button>

        {testResponse && (
          <div className="space-y-2">
            <label className="text-sm font-medium">Response:</label>
            <div className="p-3 bg-muted rounded-md">
              <pre className="text-sm whitespace-pre-wrap">{testResponse}</pre>
            </div>
          </div>
        )}

        <div className="pt-4 border-t">
          <h4 className="font-medium mb-2">Environment Variables Needed:</h4>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• VITE_N8N_WEBHOOK_URL - Your n8n webhook URL</li>
            <li>• VITE_N8N_ENABLED - Set to 'true' to enable n8n</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default ChatDebugPanel;
