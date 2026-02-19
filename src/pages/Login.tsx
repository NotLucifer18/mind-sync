import { useState, useEffect } from 'react';
import { useApp, UserRole } from '@/context/AppContext';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Brain, Sparkles, Mail, Lock, Loader2, ArrowLeft, ArrowRight, Heart, Users, Stethoscope, Shield } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';

const roles: { role: UserRole; label: string; icon: typeof Heart; desc: string; gradient: string }[] = [
  { role: 'patient', label: 'Member', icon: Heart, desc: 'Track mood, journal & get AI support', gradient: 'from-purple-500 to-cyan-400' },
  { role: 'caretaker', label: 'Parent', icon: Users, desc: 'Monitor wellbeing & get AI advice', gradient: 'from-pink-500 to-purple-500' },
  { role: 'doctor', label: 'Doctor', icon: Stethoscope, desc: 'AI-powered patient analytics', gradient: 'from-cyan-400 to-blue-500' },
  { role: 'admin', label: 'Admin/Cyber', icon: Shield, desc: 'Audit AI logs & monitor security', gradient: 'from-slate-700 to-slate-900' },
];

const Login = () => {
  const { setRole } = useApp();
  const { session } = useAuth();
  const [loading, setLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [isSignUp, setIsSignUp] = useState(false);
  const [emailOrUsername, setEmailOrUsername] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');

  // Auto-fill admin credentials when role is selected
  useEffect(() => {
    if (selectedRole === 'admin') {
      setEmailOrUsername('lucifer');
    } else {
      // Don't clear it if we just swapped to/from signup in the same role
      // but if we change role, reset
    }
  }, [selectedRole]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (selectedRole === 'admin') {
        const adminID = 'lucifer';
        const adminPass = 'notlucifer18';

        if (emailOrUsername.toLowerCase() !== adminID || password !== adminPass) {
          throw new Error('Security Breach: Administrative credentials rejected.');
        }

        // Attempt to find the real email for 'lucifer' but fallback to demo email
        let targetEmail = 'admin@mind-sync.com';
        try {
          const { data } = await (supabase.rpc as any)('get_email_by_username', {
            username_input: adminID
          });
          if (data) targetEmail = data as string;
        } catch (e) {
          console.error("Bypass lookup error:", e);
        }

        const { error } = await supabase.auth.signInWithPassword({
          email: targetEmail,
          password: adminPass,
        });

        if (error) {
          // If fallback also fails, report system error without leaking passwords
          throw new Error(`Admin Authorization Failed: ${error.message}`);
        }

        toast.success('Admin authorized. Access granted.');
        return;
      }

      let finalEmail = emailOrUsername;

      // If not an email, try to lookup as username
      if (!isSignUp && !emailOrUsername.includes('@')) {
        const { data, error: lookupError } = await (supabase.rpc as any)('get_email_by_username', {
          username_input: emailOrUsername
        });

        if (lookupError || !data) {
          throw new Error('Username not found. Please use your email.');
        }
        finalEmail = data as string;
      }

      if (isSignUp) {
        const { data, error } = await supabase.auth.signUp({
          email: emailOrUsername,
          password,
          options: {
            data: {
              role: selectedRole,
              username: username || emailOrUsername.split('@')[0],
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
          email: finalEmail,
          password,
        });
        if (error) throw error;
        toast.success('Welcome back!');
      }
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-[#020617] relative overflow-hidden font-sans">
      {/* Premium Dynamic Background */}
      <div className="absolute inset-0 bg-slate-950 overflow-hidden pointer-events-none">
        <motion.div
          animate={{
            x: [0, 100, 0],
            y: [0, -50, 0],
            scale: [1, 1.2, 1],
            rotate: [0, 90, 0]
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute -top-[10%] -right-[10%] w-[600px] h-[600px] rounded-full bg-indigo-600/20 blur-[120px]"
        />
        <motion.div
          animate={{
            x: [0, -100, 0],
            y: [0, 80, 0],
            scale: [1, 1.1, 1],
            rotate: [180, 270, 180]
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute top-[20%] -left-[10%] w-[500px] h-[500px] rounded-full bg-cyan-500/10 blur-[100px]"
        />
        <motion.div
          animate={{
            x: [50, -50, 50],
            y: [50, -100, 50],
            scale: [1, 1.3, 1]
          }}
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -bottom-[10%] right-[10%] w-[450px] h-[450px] rounded-full bg-purple-600/20 blur-[110px]"
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, ease: "easeOut" }}
        className="flex flex-col items-center mb-12 z-10 text-center"
      >
        <div className="relative mb-8 pt-2">
          <div className="absolute -inset-4 bg-gradient-to-r from-cyan-400 to-purple-600 rounded-[2.5rem] blur-2xl opacity-20 animate-pulse" />
          <div className="w-28 h-28 rounded-[2rem] bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-3xl border border-white/20 flex items-center justify-center shadow-2xl relative group cursor-default overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-tr from-cyan-400/20 to-purple-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
            <Brain className="w-14 h-14 text-white relative z-10 drop-shadow-[0_0_15px_rgba(255,255,255,0.5)]" />
          </div>
        </div>

        <h1 className="text-6xl font-black text-white tracking-tighter mb-4 selection:bg-cyan-500/30">
          Mind <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-purple-300">Sync</span>
        </h1>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 }}
          className="flex items-center gap-2 px-6 py-2.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl shadow-2xl"
        >
          <Sparkles className="w-4 h-4 text-cyan-400 animate-pulse" />
          <p className="text-slate-300 text-sm font-semibold tracking-wide">AI-Powered Neuro-Synchronization</p>
        </motion.div>
      </motion.div>

      <AnimatePresence mode="wait">
        {!selectedRole ? (
          <motion.div
            key="role-selection"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, filter: "blur(10px)" }}
            className="w-full max-w-xl grid grid-cols-1 md:grid-cols-2 gap-5 z-10"
          >
            <div className="col-span-1 md:col-span-2 text-center mb-4">
              <span className="px-4 py-1.5 rounded-full bg-cyan-500/10 text-cyan-300 text-[10px] font-black uppercase tracking-[0.3em] border border-cyan-500/20">
                Identify Access Role
              </span>
            </div>
            {roles.map(({ role, label, icon: Icon, desc, gradient }, i) => (
              <motion.button
                key={role}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 * i }}
                onClick={() => setSelectedRole(role)}
                className="group relative flex flex-col items-start gap-4 p-6 rounded-[2.5rem] bg-white/[0.03] hover:bg-white/[0.08] transition-all duration-500 border border-white/10 hover:border-white/30 backdrop-blur-3xl shadow-[0_8px_32px_rgba(0,0,0,0.5)] overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/5 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 ease-in-out" />
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:rotate-6 transition-all duration-500`}>
                  <Icon className="w-7 h-7 text-white" />
                </div>
                <div>
                  <div className="font-black text-white text-2xl mb-1 tracking-tight">{label}</div>
                  <p className="text-xs text-slate-400 font-medium leading-relaxed opacity-80 group-hover:opacity-100 transition-opacity">{desc}</p>
                </div>
                <div className="absolute top-6 right-6 w-10 h-10 rounded-full bg-white/5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                  <ArrowRight className="w-5 h-5 text-white" />
                </div>
              </motion.button>
            ))}
          </motion.div>
        ) : (
          <motion.div
            key="auth-form"
            initial={{ opacity: 0, scale: 0.9, filter: "blur(10px)" }}
            animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: 20 }}
            className="w-full max-w-sm z-10 bg-white/[0.02] backdrop-blur-[40px] p-10 rounded-[3rem] shadow-[0_20px_50px_rgba(0,0,0,0.8)] border border-white/10 relative overflow-hidden"
          >
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-[1px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_15px_rgba(34,211,238,0.5)]" />

            <div className="flex items-center gap-4 mb-10 relative">
              <button
                type="button"
                onClick={() => {
                  setSelectedRole(null);
                  setIsSignUp(false);
                }}
                className="w-10 h-10 rounded-2xl bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors border border-white/10"
              >
                <ArrowLeft className="w-5 h-5 text-white" />
              </button>
              <div>
                <h2 className="text-2xl font-black text-white tracking-tight">
                  {isSignUp ? 'New Account' : 'Security Access'}
                </h2>
                <p className="text-[10px] font-bold text-cyan-400 uppercase tracking-widest mt-0.5">
                  Role: {roles.find(r => r.role === selectedRole)?.label}
                </p>
              </div>
            </div>

            <form onSubmit={handleAuth} className="space-y-6 relative">
              <div className="space-y-4">
                <div className="relative group">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500/30 to-purple-500/30 rounded-2xl blur opacity-0 group-focus-within:opacity-100 transition duration-500" />
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 z-10" />
                  <Input
                    type="text"
                    placeholder={selectedRole === 'admin' ? "ID: lucifer" : (isSignUp ? "Institutional Email" : "Identity (Username/Email)")}
                    className="relative h-14 pl-12 rounded-2xl bg-black/40 border-white/10 text-white placeholder:text-slate-600 focus:ring-cyan-500/20 focus:border-cyan-500/40 transition-all text-base"
                    value={emailOrUsername}
                    onChange={(e) => setEmailOrUsername(e.target.value)}
                    required
                    readOnly={selectedRole === 'admin'}
                  />
                </div>

                {isSignUp && selectedRole !== 'admin' && (
                  <div className="relative group">
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500/30 to-purple-500/30 rounded-2xl blur opacity-0 group-focus-within:opacity-100 transition duration-500" />
                    <Brain className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 z-10" />
                    <Input
                      type="text"
                      placeholder="Create Global Username"
                      className="relative h-14 pl-12 rounded-2xl bg-black/40 border-white/10 text-white placeholder:text-slate-600 focus:ring-cyan-500/20 focus:border-cyan-500/40 transition-all text-base"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      required
                    />
                  </div>
                )}

                <div className="relative group">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500/30 to-purple-500/30 rounded-2xl blur opacity-0 group-focus-within:opacity-100 transition duration-500" />
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 z-10" />
                  <Input
                    type="password"
                    placeholder="Secure Password"
                    className="relative h-14 pl-12 rounded-2xl bg-black/40 border-white/10 text-white placeholder:text-slate-600 focus:ring-cyan-500/20 focus:border-cyan-500/40 transition-all text-base"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="group relative w-full h-14 overflow-hidden rounded-2xl bg-gradient-to-r from-cyan-500 to-purple-600 p-px shadow-[0_10px_30px_rgba(6,182,212,0.3)] hover:shadow-[0_15px_40px_rgba(6,182,212,0.5)] transition-all active:scale-[0.98]"
              >
                <div className="relative h-full w-full rounded-[15px] bg-slate-950/20 group-hover:bg-transparent transition-colors flex items-center justify-center">
                  {loading ? (
                    <Loader2 className="w-6 h-6 animate-spin text-white" />
                  ) : (
                    <span className="text-white font-black text-lg tracking-tight uppercase">
                      {selectedRole === 'admin' ? 'BYPASS SECURITY' : (isSignUp ? 'ESTABLISH IDENTITY' : 'PROCEED')}
                    </span>
                  )}
                </div>
              </button>

              <div className="flex flex-col gap-4 mt-8">
                {selectedRole !== 'admin' && !isSignUp && (
                  <button
                    type="button"
                    onClick={async () => {
                      if (!emailOrUsername) return toast.error('Enter email first');
                      setLoading(true);
                      const { error } = await supabase.auth.resend({ type: 'signup', email: emailOrUsername });
                      setLoading(false);
                      if (error) toast.error(error.message);
                      else toast.success('Verification link re-dispatched!');
                    }}
                    className="text-[10px] text-slate-600 font-black tracking-widest hover:text-white transition-colors uppercase"
                  >
                    Resend Authorization Email
                  </button>
                )}
              </div>
            </form>

            {selectedRole !== 'admin' && (
              <div className="mt-10 pt-6 border-t border-white/5 text-center">
                <p className="text-sm text-slate-500">
                  {isSignUp ? "Known identity?" : "New sync candidate?"}
                  <button
                    onClick={() => setIsSignUp(!isSignUp)}
                    className="ml-2 text-white font-black hover:text-cyan-400 transition-colors"
                  >
                    {isSignUp ? 'SIGN IN' : 'REGISTER'}
                  </button>
                </p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="absolute bottom-10 flex flex-col items-center gap-2 opacity-30 select-none pointer-events-none">
        <p className="text-[10px] font-black text-white tracking-[0.5em] uppercase">
          Mind Sync Systems v3.0
        </p>
        <div className="flex gap-2">
          <div className="w-1 h-1 rounded-full bg-cyan-400 animate-ping" />
          <div className="w-1 h-1 rounded-full bg-purple-400 animate-ping" style={{ animationDelay: '0.4s' }} />
          <div className="w-1 h-1 rounded-full bg-white animate-ping" style={{ animationDelay: '0.8s' }} />
        </div>
      </div>
    </div>
  );
};

export default Login;
