
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';

const AddFinancialTemplates = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const { toast } = useToast();

  const handleAddTemplates = async () => {
    try {
      setIsLoading(true);
      
      // Call our edge function to add the templates
      const response = await fetch('https://bapditcjlxctrisoixpg.supabase.co/functions/v1/add-financial-templates', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`
        },
        body: JSON.stringify({})
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to add templates');
      }
      
      const data = await response.json();
      setResult(data);
      
      toast({
        title: "Success!",
        description: "Financial mentor templates were added successfully",
        variant: "default",
      });
    } catch (error) {
      console.error('Error adding financial templates:', error);
      toast({
        title: "Failed to add templates",
        description: error instanceof Error ? error.message : 'An unexpected error occurred',
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Add Financial Mentor Templates</h3>
        <Button 
          onClick={handleAddTemplates} 
          disabled={isLoading}
          className="bg-lime-500 hover:bg-lime-600 text-black"
        >
          {isLoading ? "Processing..." : "Add Financial Templates"}
        </Button>
      </div>
      
      {result && (
        <div className="border border-zinc-800 rounded-md p-4 bg-zinc-900">
          <h4 className="text-sm font-medium mb-2">Results:</h4>
          <div className="space-y-2">
            {result.results.map((item: any, index: number) => (
              <div key={index} className="flex items-center gap-2">
                <Badge className={item.status === 'error' ? 'bg-red-500' : 'bg-lime-500'}>
                  {item.status}
                </Badge>
                <span className="text-sm">{item.template_id}</span>
                {item.message && <span className="text-xs text-red-400">{item.message}</span>}
              </div>
            ))}
          </div>
        </div>
      )}
      
      <div className="text-sm text-zinc-400 mt-2">
        <p>This will add four financial education mentor templates:</p>
        <ul className="list-disc pl-5 mt-1 space-y-1">
          <li>Wyckoff Crypto Day Trader</li>
          <li>Macro Crypto Investor</li>
          <li>Wyckoff Stock Day Trader</li>
          <li>Macro Stock Investor</li>
        </ul>
      </div>
    </div>
  );
};

export default AddFinancialTemplates;
