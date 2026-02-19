import { useState, useEffect, useRef } from 'react';
import { useApp } from '@/context/AppContext';
import { useAI } from '@/hooks/useAI';
import { Flame, Brain, Sparkles, Wind, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import SOSButton from '@/components/SOSButton';

const getMoodEmoji = (mood: number) => {
  if (mood >= 80) return '🤩';
  if (mood >= 60) return '😊';
  if (mood >= 40) return '😐';
  if (mood >= 20) return '😔';
  return '😢';
};

const getMoodLabel = (mood: number) => {
  if (mood >= 80) return 'Amazing!';
  if (mood >= 60) return 'Good';
  if (mood >= 40) return 'Okay';
  if (mood >= 20) return 'Low';
  return 'Struggling';
};

const affirmations = [
  "You are enough, just as you are. 🌟",
  "Every small step counts. Keep going. 💪",
  "It's okay to rest. Healing isn't linear. 🌙",
  "You deserve kindness — especially from yourself. 🤍",
  "This moment will pass. You are stronger than you know. 🌊",
];

import ReactMarkdown from 'react-markdown';
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

const mockMoodHistory = [
  { day: 'Mon', mood: 65 },
  { day: 'Tue', mood: 50 },
  { day: 'Wed', mood: 75 },
  { day: 'Thu', mood: 60 },
  { day: 'Fri', mood: 80 },
  { day: 'Sat', mood: 90 },
  { day: 'Sun', mood: 85 },
];

const PatientHome = () => {
  const { currentMood, setCurrentMood, streak } = useApp();
  const { ask, loading: aiLoading } = useAI();
  const [dailyTip, setDailyTip] = useState<string | null>(null);
  const [affirmation] = useState(() => affirmations[Math.floor(Math.random() * affirmations.length)]);
  const [journalEntry, setJournalEntry] = useState('');

  // Breathing exercise
  const [breathing, setBreathing] = useState(false);
  const [breathPhase, setBreathPhase] = useState<'inhale' | 'hold' | 'exhale' | 'rest'>('inhale');
  const breathTimer = useRef<NodeJS.Timeout | null>(null);

  const startBreathing = () => {
    setBreathing(true);
    const phases: Array<'inhale' | 'hold' | 'exhale' | 'rest'> = ['inhale', 'hold', 'exhale', 'rest'];
    let idx = 0;
    setBreathPhase('inhale');
    breathTimer.current = setInterval(() => {
      idx = (idx + 1) % phases.length;
      setBreathPhase(phases[idx]);
    }, 4000);
    // Stop after 4 cycles (64s)
    setTimeout(() => stopBreathing(), 64000);
  };

  const stopBreathing = () => {
    setBreathing(false);
    if (breathTimer.current) clearInterval(breathTimer.current);
  };

  useEffect(() => () => { if (breathTimer.current) clearInterval(breathTimer.current); }, []);

  const fetchTip = async () => {
    const tip = await ask('journal', { text: `My current mood is ${currentMood}/100. Give me a personalized daily wellness tip.` });
    if (tip) setDailyTip(tip);
  };

  const saveJournal = () => {
    if (!journalEntry.trim()) return;
    toast.success('Journal entry saved!');
    setJournalEntry('');
  };

  return (
    <div className="min-h-screen pb-32 px-6 pt-8 bg-background relative overflow-hidden">
      {/* Noise Texture */}
      <div className="bg-noise" />

      {/* Floating Background blobs */}
      <div className="absolute top-[-10%] right-[-15%] w-[400px] h-[400px] rounded-full bg-primary/20 blur-[100px] pointer-events-none animate-blob opacity-60" />
      <div className="absolute bottom-[10%] left-[-20%] w-[350px] h-[350px] rounded-full bg-secondary/20 blur-[100px] pointer-events-none animate-blob animation-delay-2000 opacity-60" />
      <div className="absolute top-[40%] right-[-20%] w-[300px] h-[300px] rounded-full bg-accent/10 blur-[90px] pointer-events-none animate-blob animation-delay-4000 opacity-50" />

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between mb-8"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl gradient-calm flex items-center justify-center shadow-lg">
            <Brain className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-xl font-black text-foreground leading-none">Mind Sync</h1>
            <p className="text-xs text-muted-foreground font-medium">Daily Check-in</p>
          </div>
        </div>
        <div className="flex items-center gap-2 bg-gradient-to-r from-orange-500/10 to-amber-500/10 border border-orange-500/20 px-3 py-1.5 rounded-full backdrop-blur-md">
          <Flame className="w-4 h-4 text-orange-500" />
          <span className="font-bold text-orange-600 text-sm">{streak} Days</span>
        </div>
      </motion.div>

      {/* Affirmation banner */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
        className="mb-8 p-6 rounded-3xl gradient-aurora text-white text-center shadow-lg relative overflow-hidden"
      >
        <div className="absolute top-0 left-0 w-full h-full bg-white/10" style={{ backgroundImage: 'radial-gradient(circle at 50% 0%, rgba(255,255,255,0.4) 0%, transparent 70%)' }} />
        <Sparkles className="w-5 h-5 absolute top-4 left-4 text-white/70" />
        <p className="text-lg font-bold relative z-10 leading-relaxed">"{affirmation}"</p>
      </motion.div>

      {/* Mood Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="glass-card rounded-[2rem] p-8 text-center shadow-soft mb-8 relative group hover:shadow-glow transition-all duration-500"
      >
        <p className="text-muted-foreground text-xs font-bold mb-6 uppercase tracking-widest">
          How are you feeling?
        </p>
        <motion.div
          key={getMoodEmoji(currentMood)}
          initial={{ scale: 0.5, rotate: -20 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", bounce: 0.5 }}
          className="text-8xl mb-4 drop-shadow-2xl filter cursor-grab active:cursor-grabbing"
          style={{ animation: 'float 4s ease-in-out infinite' }}
          whileHover={{ scale: 1.1, rotate: 5 }}
          whileTap={{ scale: 0.9 }}
        >
          {getMoodEmoji(currentMood)}
        </motion.div>
        <p className="text-3xl font-black text-foreground mb-1">{getMoodLabel(currentMood)}</p>
        <p className="text-muted-foreground font-medium text-sm mb-10">{currentMood}/100</p>

        <div className="relative h-12 flex items-center">
          <div className="absolute w-full h-4 rounded-full bg-muted overflow-hidden">
            <div className="w-full h-full opacity-30" style={{ background: `linear-gradient(to right, hsl(0, 72%, 55%) 0%, hsl(38, 92%, 50%) 50%, hsl(160, 70%, 42%) 100%)` }} />
          </div>
          <input
            type="range"
            min={0}
            max={100}
            value={currentMood}
            onChange={e => setCurrentMood(Number(e.target.value))}
            className="w-full h-4 absolute z-20 opacity-0 cursor-pointer"
          />
          <div
            className="absolute h-8 w-8 bg-white rounded-full shadow-[0_4px_10px_rgba(0,0,0,0.2)] border-4 border-white z-10 pointer-events-none transition-all duration-75 flex items-center justify-center transform -translate-x-1/2"
            style={{
              left: `${currentMood}%`,
              backgroundColor: `hsl(${currentMood * 1.6}, 70%, 50%)`
            }}
          >
            <div className="w-2 h-2 rounded-full bg-white/50" />
          </div>
        </div>

        <div className="flex justify-between text-xs text-muted-foreground mt-4 font-bold px-1">
          <span>😢 Low</span>
          <span>🤩 High</span>
        </div>
      </motion.div>

      <div className="grid grid-cols-2 gap-4 mb-8">
        {/* Breathing Exercise */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-card rounded-[2rem] p-5 relative overflow-hidden h-full flex flex-col justify-between cursor-pointer hover:bg-white/40 transition-colors"
          onClick={!breathing ? startBreathing : undefined}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <div className="absolute top-0 right-0 p-4 opacity-50"><Wind className="w-12 h-12 text-secondary/20" /></div>
          <div>
            <div className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center mb-3 text-secondary">
              <Wind className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-foreground leading-tight mb-1">Breathing</h3>
            <p className="text-xs text-muted-foreground">Calm your mind</p>
          </div>

          <AnimatePresence mode="wait">
            {breathing ? (
              <motion.div
                key="active"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="mt-4 flex flex-col items-center"
              >
                <span className="text-xl font-black text-secondary capitalize mb-2">{breathPhase}</span>
                <button onClick={(e) => { e.stopPropagation(); stopBreathing(); }} className="px-3 py-1 rounded-full bg-destructive/10 text-destructive text-xs font-bold hover:bg-destructive/20 transition-colors">Stop</button>
              </motion.div>
            ) : (
              <div className="mt-4 flex items-center text-xs font-bold text-secondary">
                Start <Loader2 className="w-3 h-3 ml-1" />
              </div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* AI Daily Tip */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-card rounded-[2rem] p-5 relative overflow-hidden h-full flex flex-col cursor-pointer hover:bg-white/40 transition-colors"
          onClick={fetchTip}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <div className="absolute top-0 right-0 p-4 opacity-50"><Sparkles className="w-12 h-12 text-primary/20" /></div>
          <div className="mb-auto">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mb-3 text-primary">
              <Sparkles className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-foreground leading-tight mb-1">Daily Tip</h3>
            <p className="text-xs text-muted-foreground">AI Insights</p>
          </div>

          <div className="mt-4 flex items-center text-xs font-bold text-primary">
            {aiLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Generate →'}
          </div>
        </motion.div>
      </div>

      <AnimatePresence>
        {dailyTip && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="glass-card rounded-[2rem] p-6 border-l-4 border-primary shadow-soft mb-8"
          >
            <div className="flex items-start gap-4">
              <div className="p-2 rounded-full bg-primary/10 text-primary mt-1"><Sparkles className="w-5 h-5" /></div>
              <div className="prose prose-sm max-w-none text-muted-foreground leading-relaxed">
                <h4 className="font-bold text-foreground mb-2 not-prose">Your Insight</h4>
                <ReactMarkdown>{dailyTip}</ReactMarkdown>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Wellness Activities */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="mb-8"
      >
        <h3 className="font-bold text-foreground mb-4 pl-2">Wellness Activities</h3>
        <div className="flex gap-4 overflow-x-auto pb-4 px-2 -mx-2 scrollbar-hide">
          {[
            { title: 'Meditate', icon: '🧘', color: 'bg-purple-100 text-purple-600' },
            { title: 'Walk', icon: '🚶', color: 'bg-green-100 text-green-600' },
            { title: 'Hydrate', icon: '💧', color: 'bg-blue-100 text-blue-600' },
            { title: 'Journal', icon: '📔', color: 'bg-amber-100 text-amber-600' },
            { title: 'Sleep', icon: '😴', color: 'bg-indigo-100 text-indigo-600' },
          ].map((activity, i) => (
            <motion.button
              key={activity.title}
              whileHover={{ scale: 1.05, y: -5 }}
              whileTap={{ scale: 0.95 }}
              className="flex-shrink-0 flex flex-col items-center gap-2 p-4 rounded-3xl glass-card border-white/40 w-24 shadow-sm hover:shadow-md transition-all"
            >
              <div className={`w-12 h-12 rounded-full ${activity.color} flex items-center justify-center text-xl`}>
                {activity.icon}
              </div>
              <span className="text-xs font-bold text-muted-foreground">{activity.title}</span>
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* Mood History Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="glass-card rounded-[2rem] p-6 mb-8"
      >
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center text-accent">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" /></svg>
          </div>
          <h3 className="font-bold text-foreground">Mood Trends</h3>
        </div>
        <div className="h-[200px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={mockMoodHistory}>
              <defs>
                <linearGradient id="colorMood" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'var(--muted-foreground)' }} />
              <YAxis hide domain={[0, 100]} />
              <Tooltip
                contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.8)', borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                itemStyle={{ color: 'var(--primary)', fontWeight: 'bold' }}
              />
              <Area type="monotone" dataKey="mood" stroke="var(--primary)" strokeWidth={3} fillOpacity={1} fill="url(#colorMood)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* Quick Journal */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="glass-card rounded-[2rem] p-6 mb-8"
      >
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-full bg-secondary/10 flex items-center justify-center text-secondary">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
          </div>
          <h3 className="font-bold text-foreground">Quick Journal</h3>
        </div>
        <Textarea
          placeholder="What's on your mind today?"
          value={journalEntry}
          onChange={(e) => setJournalEntry(e.target.value)}
          className="mb-3 bg-white/50 border-white/20 focus:bg-white/80 transition-all resize-none rounded-xl"
        />
        <div className="flex justify-end">
          <Button onClick={saveJournal} size="sm" className="rounded-full bg-secondary hover:bg-secondary/90 text-white font-bold shadow-lg shadow-secondary/20">
            Save Note
          </Button>
        </div>
      </motion.div>

      <SOSButton />
    </div>
  );
};

export default PatientHome;
