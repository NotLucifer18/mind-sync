import { useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { useAI } from '@/hooks/useAI';
import { BarChart3, ArrowLeft, Brain, Loader2, RefreshCw } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const Analytics = () => {
  const { moodHistory, patients } = useApp();
  const { ask, loading, response } = useAI();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const patientId = searchParams.get('patient') || '1';
  const patient = patients.find(p => p.id === patientId) || patients[0];

  const fetchInsights = () => {
    ask('doctor', { moodHistory });
  };

  useEffect(() => {
    fetchInsights();
  }, []);

  return (
    <div className="min-h-screen pb-24 px-5 pt-6 bg-background">
      <button onClick={() => navigate('/')} className="flex items-center gap-1 text-primary font-semibold text-sm mb-4">
        <ArrowLeft className="w-4 h-4" /> Back
      </button>

      <div className="flex items-center gap-2 mb-6">
        <BarChart3 className="w-6 h-6 text-primary" />
        <h1 className="text-xl font-extrabold text-foreground">{patient.name}</h1>
      </div>

      {/* AI Insights */}
      <div className="bg-primary/5 rounded-2xl p-5 border border-primary/20 mb-5">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-primary" />
            <span className="text-sm font-bold text-foreground">AI Clinical Insights</span>
          </div>
          <button
            onClick={fetchInsights}
            disabled={loading}
            className="w-7 h-7 rounded-lg bg-secondary flex items-center justify-center text-muted-foreground hover:text-primary transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
        {loading ? (
          <div className="flex items-center gap-2 py-2">
            <Loader2 className="w-4 h-4 text-primary animate-spin" />
            <span className="text-xs text-muted-foreground">Analyzing patient data...</span>
          </div>
        ) : response ? (
          <p className="text-sm text-foreground leading-relaxed whitespace-pre-line">{response}</p>
        ) : (
          <p className="text-xs text-muted-foreground">Tap refresh for AI analysis.</p>
        )}
      </div>

      {/* Mood Chart */}
      <div className="bg-card rounded-2xl p-5 border border-border mb-5 shadow-soft">
        <h3 className="font-bold text-foreground text-sm mb-4">📈 Mood History</h3>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={moodHistory}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(174, 15%, 88%)" />
              <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="hsl(210, 10%, 45%)" />
              <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} stroke="hsl(210, 10%, 45%)" />
              <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid hsl(174, 15%, 88%)', fontSize: 12 }} />
              <Line type="monotone" dataKey="mood" stroke="hsl(174, 62%, 40%)" strokeWidth={3} dot={{ fill: 'hsl(174, 62%, 40%)', r: 5 }} activeDot={{ r: 7 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Sleep Chart */}
      <div className="bg-card rounded-2xl p-5 border border-border shadow-soft">
        <h3 className="font-bold text-foreground text-sm mb-4">😴 Sleep Hours</h3>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={moodHistory}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(174, 15%, 88%)" />
              <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="hsl(210, 10%, 45%)" />
              <YAxis domain={[0, 12]} tick={{ fontSize: 12 }} stroke="hsl(210, 10%, 45%)" />
              <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid hsl(174, 15%, 88%)', fontSize: 12 }} />
              <Bar dataKey="sleep" fill="hsl(174, 40%, 85%)" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
