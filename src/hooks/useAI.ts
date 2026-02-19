import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const useAI = () => {
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<string | null>(null);

  const ask = async (type: 'journal' | 'empathy' | 'doctor' | 'insight', data: Record<string, any>) => {
    setLoading(true);
    setResponse(null);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const userId = session?.user?.id;

      console.log(`Invoking AI Function: ${type}...`);
      const { data: result, error } = await supabase.functions.invoke('ai-chat', {
        body: { type, data, userId },
      });

      if (error) {
        console.error('Supabase Function Invoke Error:', error);
        throw error;
      }

      if (result?.error) {
        console.error('AI Logic Error returned from Function:', result.error);
        toast.error(`AI Analysis Error: ${result.error}`);
        return null;
      }

      console.log('AI Response successful');
      setResponse(result.content);
      return { content: result.content, sentiment: result.sentiment };
    } catch (e: any) {
      console.error('Critical AI Hook Error:', e);
      const errorMsg = e.message || 'AI relay failed';
      toast.error(`Sync Relay Interrupted: ${errorMsg}`);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { ask, loading, response };
};
