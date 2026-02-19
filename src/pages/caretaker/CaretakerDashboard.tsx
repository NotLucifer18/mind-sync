import { useApp } from '@/context/AppContext';
import { Cloud, Sun, CloudLightning, Heart, Users } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

const weatherConfig = {
  sunny: {
    emoji: '☀️',
    label: 'Sunny',
    desc: 'Your child is feeling great today!',
    bg: 'bg-success/10',
    border: 'border-success/30',
    textColor: 'text-success',
    icon: Sun,
  },
  cloudy: {
    emoji: '☁️',
    label: 'Cloudy',
    desc: 'Moderate mood — stay present and gentle.',
    bg: 'bg-warning/10',
    border: 'border-warning/30',
    textColor: 'text-warning',
    icon: Cloud,
  },
  stormy: {
    emoji: '⛈️',
    label: 'Stormy',
    desc: 'Risk detected — your child may need support.',
    bg: 'bg-destructive/10',
    border: 'border-destructive/30',
    textColor: 'text-destructive',
    icon: CloudLightning,
  },
};

const CaretakerDashboard = () => {
  const { weather, currentMood, pendingRequests, approveRequest, rejectRequest, linkChild } = useApp();
  const [pairingCodeInput, setPairingCodeInput] = useState('');
  const config = weatherConfig[weather];
  const WeatherIcon = config.icon;

  return (
    <div className="min-h-screen pb-24 px-5 pt-8 bg-background relative overflow-hidden">
      {/* Noise Texture */}
      <div className="bg-noise" />

      {/* Floating Background blobs */}
      <div className="absolute top-[-10%] right-[-15%] w-[400px] h-[400px] rounded-full bg-primary/20 blur-[100px] pointer-events-none animate-blob opacity-60" />
      <div className="absolute bottom-[20%] left-[-20%] w-[350px] h-[350px] rounded-full bg-secondary/20 blur-[100px] pointer-events-none animate-blob animation-delay-2000 opacity-60" />

      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="relative z-10">
        <div className="flex items-center gap-2 mb-2">
          <Heart className="w-6 h-6 text-primary" />
          <h1 className="text-2xl font-black text-foreground">Caretaker View</h1>
        </div>
        <p className="text-sm text-muted-foreground mb-6 font-medium">Monitoring & Approvals</p>

        {/* Link Child Section */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card rounded-2xl p-5 border border-primary/20 mb-8 shadow-sm group"
        >
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
              <Users className="w-4 h-4" />
            </div>
            <h2 className="text-sm font-bold text-foreground">Link Child Account</h2>
          </div>
          <p className="text-xs text-muted-foreground mb-4">
            Enter the pairing code from your child's dashboard to synchronize their health data.
          </p>
          <div className="flex gap-2">
            <Input
              placeholder="E.g. AB12CD"
              value={pairingCodeInput}
              onChange={(e) => setPairingCodeInput(e.target.value.toUpperCase())}
              className="h-10 rounded-xl bg-white/50 border-white/40 focus:bg-white uppercase text-center font-bold tracking-widest"
              maxLength={6}
            />
            <Button
              onClick={() => {
                linkChild(pairingCodeInput);
                setPairingCodeInput('');
              }}
              className="rounded-xl gradient-calm px-6 font-bold shadow-md hover:shadow-glow transition-all"
            >
              Link
            </Button>
          </div>
        </motion.div>

        {/* Pending Requests Section */}
        <AnimatePresence>
          {pendingRequests && pendingRequests.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-8"
            >
              <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-3 pl-2">Medical Access Requests</h2>
              <div className="space-y-3 px-1">
                {pendingRequests.map(req => (
                  <div key={req.id} className="glass-card p-4 rounded-2xl border-l-4 border-amber-400 flex items-center justify-between shadow-sm">
                    <div>
                      <p className="text-[10px] font-bold text-amber-600 uppercase mb-0.5 tracking-tight">Doctor Access Request</p>
                      <p className="text-sm font-extrabold text-foreground">{req.doctorName}</p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => rejectRequest(req.id)}
                        className="px-3 py-1.5 rounded-full bg-black/5 text-muted-foreground font-bold text-[10px] hover:bg-black/10 transition-colors"
                      >
                        Decline
                      </button>
                      <button
                        onClick={() => approveRequest(req.id)}
                        className="px-4 py-1.5 rounded-full bg-primary text-white font-bold text-[10px] hover:bg-primary/90 shadow-md shadow-primary/20 transition-all active:scale-95"
                      >
                        Approve
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Weather Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className={`rounded-3xl p-8 border ${config.bg} ${config.border} text-center shadow-soft mb-6`}
        >
          <div className="text-7xl mb-4" style={{ animation: 'float 3s ease-in-out infinite' }}>{config.emoji}</div>
          <h2 className={`text-2xl font-black ${config.textColor} mb-1`}>{config.label}</h2>
          <p className="text-muted-foreground text-sm">{config.desc}</p>
        </motion.div>

        {/* Mood gauge */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-card rounded-2xl p-5 border border-border mb-4"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-bold text-foreground">Child's Mood Level</span>
            <span className={`text-sm font-black ${config.textColor}`}>{currentMood}/100</span>
          </div>
          <div className="h-3 bg-secondary rounded-full overflow-hidden">
            <motion.div
              className="h-full rounded-full gradient-calm"
              initial={{ width: 0 }}
              animate={{ width: `${currentMood}%` }}
              transition={{ duration: 1, ease: 'easeOut' }}
            />
          </div>
        </motion.div>

        {/* Info */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-card rounded-2xl p-5 border border-border"
        >
          <div className="flex items-center gap-2 mb-2">
            <WeatherIcon className={`w-5 h-5 ${config.textColor}`} />
            <span className="text-sm font-bold text-foreground">What does this mean?</span>
          </div>
          <p className="text-sm text-muted-foreground">
            The weather report reflects your child's emotional state. It's calculated from their mood scores
            and journal entries. No raw journal text is ever shown to protect their privacy.
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default CaretakerDashboard;
