import { useApp } from '@/context/AppContext';
import { Cloud, Sun, CloudLightning, Heart } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

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
  const { weather, currentMood, pendingRequests, approveRequest } = useApp();
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

        {/* Pending Requests Section */}
        <AnimatePresence>
          {pendingRequests && pendingRequests.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-8"
            >
              <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-3">Pending Requests</h2>
              <div className="space-y-3">
                {pendingRequests.map(req => (
                  <div key={req.id} className="glass-card p-4 rounded-2xl border-l-4 border-amber-400 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-amber-600 mb-0.5">Doctor Access Request</p>
                      <p className="text-sm font-bold text-foreground">{req.doctorName}</p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => approveRequest(req.id)}
                        className="px-3 py-1.5 rounded-full bg-green-500/10 text-green-700 font-bold text-xs hover:bg-green-500/20 transition-colors"
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
