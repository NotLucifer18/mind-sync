import { useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { useAI } from '@/hooks/useAI';
import { HeartPulse, Lightbulb, ShieldCheck, Sparkles, Loader2, RefreshCw } from 'lucide-react';

const EmpathyTranslator = () => {
  const { currentMood, weather } = useApp();
  const { ask, loading, response } = useAI();

  const fetchAdvice = () => {
    ask('empathy', { mood: currentMood, weather });
  };

  useEffect(() => {
    fetchAdvice();
  }, []);

  return (
    <div className="min-h-screen pb-24 px-5 pt-6 bg-background">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <HeartPulse className="w-6 h-6 text-primary" />
          <h1 className="text-xl font-extrabold text-foreground">Empathy Translator</h1>
        </div>
        <button
          onClick={fetchAdvice}
          disabled={loading}
          className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center text-muted-foreground hover:text-primary transition-colors"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* AI Card */}
      <div className="bg-card rounded-3xl p-6 border border-border shadow-soft mb-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl gradient-calm flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">AI-Powered Advice</p>
            <p className="font-bold text-foreground">Mood: {currentMood}/100 • {weather}</p>
          </div>
        </div>

        <div className="border-t border-border pt-4">
          {loading ? (
            <div className="flex items-center gap-2 py-4 justify-center">
              <Loader2 className="w-5 h-5 text-primary animate-spin" />
              <span className="text-sm text-muted-foreground font-semibold">Generating advice...</span>
            </div>
          ) : response ? (
            <div className="flex items-start gap-3">
              <Lightbulb className="w-5 h-5 text-warning mt-0.5 flex-shrink-0" />
              <p className="text-sm text-foreground font-medium leading-relaxed whitespace-pre-line">{response}</p>
            </div>
          ) : (
            <div className="flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
              <p className="text-sm text-muted-foreground">Tap refresh to get AI-powered parenting advice.</p>
            </div>
          )}
        </div>
      </div>

      {/* Privacy note */}
      <div className="bg-secondary/50 rounded-2xl p-5 border border-border">
        <p className="text-xs text-muted-foreground text-center">
          🔒 Raw journal entries are never shown. This translation is generated from mood patterns and keyword analysis to protect your child's privacy.
        </p>
      </div>

      {/* Tips */}
      <div className="mt-6 space-y-3">
        <h3 className="font-bold text-foreground text-sm">Quick Guidelines</h3>
        {[
          { emoji: '🤍', text: "Don't force conversation. Be present." },
          { emoji: '🍎', text: 'Offer comfort food or a favorite snack.' },
          { emoji: '🚶', text: 'Suggest a gentle walk together.' },
          { emoji: '🎧', text: 'Put on their favorite calming music.' },
        ].map((tip, i) => (
          <div key={i} className="flex items-center gap-3 bg-card rounded-xl p-3 border border-border">
            <span className="text-lg">{tip.emoji}</span>
            <span className="text-sm text-foreground">{tip.text}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default EmpathyTranslator;
