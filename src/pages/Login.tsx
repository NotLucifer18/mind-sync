import { useState } from 'react';
import { useApp, UserRole } from '@/context/AppContext';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Brain, Sparkles, Mail, Lock, Loader2, ArrowLeft, ArrowRight, Heart, Users, Stethoscope } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

const roles: { role: UserRole; label: string; icon: typeof Heart; desc: string; gradient: string }[] = [
  { role: 'patient', label: 'Member', icon: Heart, desc: 'Track mood, journal & get AI support', gradient: 'from-purple-500 to-cyan-400' },
  { role: 'caretaker', label: 'Parent', icon: Users, desc: 'Monitor wellbeing & get AI advice', gradient: 'from-pink-500 to-purple-500' },
  { role: 'doctor', label: 'Doctor', icon: Stethoscope, desc: 'AI-powered patient analytics', gradient: 'from-cyan-400 to-blue-500' },
];

const Login = () => {
  const { setRole } = useApp();
  const { session } = useAuth();
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [isMagicLink, setIsMagicLink] = useState(false);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isMagicLink) {
        const { error } = await supabase.auth.signInWithOtp({
          email,
          options: {
            shouldCreateUser: false,
            data: { role: selectedRole },
            emailRedirectTo: window.location.origin,
          }
        });
        if (error) throw error;
        toast.success('✨ Magic Link sent! Check your email.');
      } else if (isSignUp) {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              role: selectedRole,
            },
            emailRedirectTo: window.location.origin,
          },
        });
        if (error) throw error;

        if (data.session) {
          toast.success('Welcome! Account created successfully.');
        } else {
          toast.success('Check your email to confirm your account!');
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        toast.success('Welcome back!');
        // Role will be set by AppRoutes effect based on metadata
      }
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-background relative overflow-hidden">
      {/* Dynamic Background */}
      <div className="absolute top-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-primary/20 blur-[100px] animate-pulse" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[400px] h-[400px] rounded-full bg-secondary/20 blur-[100px] animate-pulse" style={{ animationDelay: '1s' }} />

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="flex flex-col items-center mb-10 z-10 text-center"
      >
        <div className="w-24 h-24 rounded-3xl gradient-calm flex items-center justify-center shadow-glow mb-6 animate-float relative group cursor-default">
          <div className="absolute inset-0 bg-white/20 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <Brain className="w-12 h-12 text-white relative z-10" />
        </div>
        <h1 className="text-5xl font-black text-foreground tracking-tight mb-3">Mind Sync</h1>
        <div className="flex items-center gap-2 px-6 py-2 rounded-full bg-surface/50 border border-white/40 backdrop-blur-md shadow-sm">
          <Sparkles className="w-4 h-4 text-primary animate-pulse" />
          <p className="text-muted-foreground text-sm font-medium">Synchronize your mind & mood</p>
        </div>
      </motion.div>

      <AnimatePresence mode="wait">
        {!selectedRole ? (
          <motion.div
            key="role-selection"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="w-full max-w-md space-y-4 z-10"
          >
            <p className="text-center text-sm font-bold text-muted-foreground uppercase tracking-widest mb-6 opacity-80">Choose your journey</p>
            {roles.map(({ role, label, icon: Icon, desc, gradient }, i) => (
              <motion.button
                key={role}
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.1 * i }}
                onClick={() => setSelectedRole(role)}
                className="group relative w-full flex items-center gap-5 p-4 pr-6 rounded-[2rem] glass-card hover:bg-white/60 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] text-left border border-white/30 shadow-sm hover:shadow-soft"
              >
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center shadow-md group-hover:rotate-6 transition-transform duration-300`}>
                  <Icon className="w-8 h-8 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-extrabold text-foreground text-xl mb-0.5">{label}</div>
                  <p className="text-sm text-muted-foreground leading-tight line-clamp-2">{desc}</p>
                </div>
                <div className="w-8 h-8 rounded-full bg-white/50 flex items-center justify-center backdrop-blur-sm opacity-0 group-hover:opacity-100 transform translate-x-2 group-hover:translate-x-0 transition-all duration-300">
                  <ArrowRight className="w-4 h-4 text-primary" />
                </div>
              </motion.button>
            ))}
          </motion.div>
        ) : (
          <motion.div
            key="auth-form"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="w-full max-w-sm z-10 glass-card p-8 rounded-[2rem] shadow-xl border border-white/40"
          >
            <div className="flex items-center gap-4 mb-6">
              <button onClick={() => setSelectedRole(null)} className="p-2 rounded-full hover:bg-black/5 transition-colors">
                <ArrowLeft className="w-5 h-5 text-muted-foreground" />
              </button>
              <h2 className="text-2xl font-bold text-foreground">
                {isSignUp ? `Join as ${roles.find(r => r.role === selectedRole)?.label}` : 'Welcome Back'}
              </h2>
            </div>

            <form onSubmit={handleAuth} className="space-y-4">
              {!isMagicLink && (
                <div className="space-y-2">
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
                    <Input
                      type="email"
                      placeholder="Email"
                      className="pl-10 h-12 rounded-xl bg-white/50 border-white/30 focus:bg-white transition-all"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
                    <Input
                      type="password"
                      placeholder="Password"
                      className="pl-10 h-12 rounded-xl bg-white/50 border-white/30 focus:bg-white transition-all"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>
                </div>
              )}

              {isMagicLink && (
                <div className="space-y-2">
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
                    <Input
                      type="email"
                      placeholder="Enter your email for Magic Link"
                      className="pl-10 h-12 rounded-xl bg-white/50 border-white/30 focus:bg-white transition-all"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  <p className="text-xs text-muted-foreground text-center">
                    We'll send you a special link to sign in instantly.
                  </p>
                </div>
              )}

              <Button
                type="submit"
                disabled={loading}
                className="w-full h-12 rounded-xl gradient-calm text-white font-bold text-lg shadow-lg hover:shadow-glow transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                {loading ? <Loader2 className="animate-spin" /> : (
                  isMagicLink ? 'Send Magic Link' : (isSignUp ? 'Sign Up' : 'Sign In')
                )}
              </Button>

              <div className="flex flex-col gap-2 mt-4">
                <button
                  type="button"
                  onClick={() => setIsMagicLink(!isMagicLink)}
                  className="text-sm text-primary font-bold hover:underline"
                >
                  {isMagicLink ? 'Back to Password Login' : '✨ Sign in with Magic Link'}
                </button>

                {!isSignUp && !isMagicLink && (
                  <button
                    type="button"
                    onClick={async () => {
                      if (!email) return toast.error('Enter email first');
                      setLoading(true);
                      const { error } = await supabase.auth.resend({
                        type: 'signup',
                        email,
                      });
                      setLoading(false);
                      if (error) toast.error(error.message);
                      else toast.success('Verification email resent!');
                    }}
                    className="text-xs text-muted-foreground hover:text-primary transition-colors"
                  >
                    Resend Verification Email
                  </button>
                )}
              </div>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-muted-foreground">
                {isSignUp ? "Already have an account?" : "Don't have an account?"}
                <button
                  onClick={() => setIsSignUp(!isSignUp)}
                  className="ml-1 text-primary font-bold hover:underline focus:outline-none"
                >
                  {isSignUp ? 'Sign In' : 'Sign Up'}
                </button>
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <p className="absolute bottom-8 text-center text-xs text-muted-foreground opacity-60">
        © 2026 Mind Sync. Secure & Private.
      </p>
    </div>
  );
};

export default Login;
