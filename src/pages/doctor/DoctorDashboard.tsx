import { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { useAuth } from '@/context/AuthContext';
import { Users, ChevronRight, Activity, Plus, X, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

const DoctorDashboard = () => {
  const { patients, requestPatientAccess } = useApp();
  const { session } = useAuth();
  const navigate = useNavigate();
  const [isAdding, setIsAdding] = useState(false);
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAddPatient = async () => {
    if (!email.trim() || !session?.user) return;
    setLoading(true);

    try {
      await requestPatientAccess(email);
      setIsAdding(false);
      setEmail('');
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'Failed to link patient');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pb-24 px-5 pt-6 bg-background relative overflow-hidden">
      <div className="bg-noise" />
      <div className="absolute top-[-10%] left-[-20%] w-[500px] h-[500px] rounded-full bg-blue-500/5 blur-[100px] pointer-events-none animate-blob" />
      <div className="absolute bottom-[20%] right-[-20%] w-[400px] h-[400px] rounded-full bg-purple-500/5 blur-[100px] pointer-events-none animate-blob animation-delay-4000" />

      <div className="relative z-10 flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-primary/10 text-primary">
            <Users className="w-6 h-6" />
          </div>
          <h1 className="text-xl font-extrabold text-foreground">Member List</h1>
        </div>

        <Dialog open={isAdding} onOpenChange={setIsAdding}>
          <DialogTrigger asChild>
            <Button size="sm" className="rounded-full shadow-lg">
              <Plus className="w-4 h-4 mr-1" /> Add
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Link Patient</DialogTitle>
            </DialogHeader>
            <div className="flex items-center space-x-2">
              <div className="grid flex-1 gap-2">
                <Input
                  placeholder="Enter Email or Pairing Code..."
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <Button onClick={handleAddPatient} disabled={loading}>
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Link'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-3 relative z-10">
        {patients.length === 0 ? (
          <div className="text-center p-8 glass-card rounded-2xl">
            <p className="text-muted-foreground">No patients linked yet.</p>
            <p className="text-xs text-muted-foreground mt-1">Tap "+ Add" to link a user by name.</p>
          </div>
        ) : (
          patients.map((patient) => (
            <button
              key={patient.id}
              onClick={() => navigate(`/analytics?patient=${patient.id}`)}
              className="w-full flex items-center gap-4 p-4 rounded-2xl bg-card/50 backdrop-blur-md border border-border hover:border-primary/40 hover:shadow-soft transition-all group"
            >
              <div className="w-12 h-12 rounded-xl gradient-calm flex items-center justify-center text-primary-foreground font-bold text-lg">
                {patient.name.charAt(0)}
              </div>
              <div className="flex-1 text-left">
                <p className="font-bold text-foreground">{patient.name}</p>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  {patient.status === 'pending' ? (
                    <span className="text-amber-500 font-bold flex items-center gap-1">
                      • Pending Approval
                    </span>
                  ) : (
                    <>
                      <Activity className="w-3 h-3" />
                      <span>Active</span>
                    </>
                  )}
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
            </button>
          ))
        )}
      </div>
    </div>
  );
};

export default DoctorDashboard;
