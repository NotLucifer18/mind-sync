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

      const { data: result, error } = await supabase.functions.invoke('ai-chat', {
        body: { type, data, userId },
      });
      if (error) throw error;
      if (result?.error) {
        toast.error(result.error);
        return null;
      }
      setResponse(result.content);
      return { content: result.content, sentiment: result.sentiment };
    } catch (e: any) {
      console.error('AI error:', e);
      toast.error('AI is unavailable right now. Please try again.');
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { ask, loading, response };
};
