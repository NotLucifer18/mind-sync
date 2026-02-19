import React, { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export type UserRole = 'patient' | 'caretaker' | 'doctor' | 'admin' | null;

export interface JournalEntry {
  id: string;
  text: string;
  date: string;
  isVoice: boolean;
  sentiment?: number;
}

export interface MoodEntry {
  date: string;
  mood: number;
  sleep: number;
}

interface AppState {
  role: UserRole;
  setRole: (role: UserRole) => void;
  logout: () => void;
  // Patient
  currentMood: number;
  setCurrentMood: (mood: number) => void;
  streak: number;
  journalEntries: JournalEntry[];
  addJournalEntry: (text: string, isVoice: boolean, sentiment?: number) => void;
  moodHistory: MoodEntry[];
  // Caretaker
  weather: 'sunny' | 'cloudy' | 'stormy';
  stressAdvice: string;
  // Doctor
  // Doctor
  patients: { id: string; name: string; status: 'pending' | 'approved' | 'rejected' }[];

  // Caretaker / Patient Approval
  pendingRequests: { id: string; doctorName: string }[];
  approveRequest: (requestId: string) => void;
  rejectRequest: (requestId: string) => void;

  // New features
  pairingCode: string | null;
  linkChild: (code: string) => Promise<void>;
  requestPatientAccess: (identifier: string) => Promise<void>;
  // Admin
  aiLogs: any[];
}

const AppContext = createContext<AppState | undefined>(undefined);

const TRIGGER_WORDS = ['whisper', 'voice', 'scared'];

const initialMoodHistory: MoodEntry[] = [
  { date: 'Mon', mood: 65, sleep: 7 },
  { date: 'Tue', mood: 72, sleep: 6 },
  { date: 'Wed', mood: 45, sleep: 5 },
  { date: 'Thu', mood: 80, sleep: 8 },
  { date: 'Fri', mood: 55, sleep: 6 },
  { date: 'Sat', mood: 90, sleep: 9 },
  { date: 'Sun', mood: 68, sleep: 7 },
];

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const { session, signOut } = useAuth();
  const [role, setRole] = useState<UserRole>(null);
  const [currentMood, setCurrentMoodState] = useState(65);
  const [streak, setStreak] = useState(0);
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([]);
  const [moodHistory, setMoodHistory] = useState<MoodEntry[]>(initialMoodHistory);
  const [weather, setWeather] = useState<'sunny' | 'cloudy' | 'stormy'>('cloudy');
  const [stressAdvice, setStressAdvice] = useState('Status: Moderate Stress. Advice: Offer a calming activity together.');
  const [pairingCode, setPairingCode] = useState<string | null>(null);
  const [aiLogs, setAiLogs] = useState<any[]>([]);

  // Fetch Data on Load
  useEffect(() => {
    if (!session?.user) return;

    const fetchData = async () => {
      try {
        // Fetch Profile for Role & Pairing Code
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();

        if (profileError || !profileData) throw profileError || new Error('Profile not found');
        const profile = profileData as { role: string; pairing_code: string };
        setRole(profile.role as UserRole);
        setPairingCode(profile.pairing_code);

        // Fetch Moods
        const { data, error: moodError } = await supabase
          .from('mood_logs')
          .select('*')
          .eq('user_id', session.user.id)
          .order('created_at', { ascending: false });

        if (moodError) throw moodError;

        const moods = data as any[];

        if (moods && moods.length > 0) {
          setCurrentMoodState(moods[0].mood_score);
          // Calculate Streak (consecutive days with entries)
          // Simplified streak logic for demo
          setStreak(Math.min(moods.length, 5));

          // Map to History (simplified for demo - taking last 7)
          const history = moods.slice(0, 7).reverse().map((m: any) => ({
            date: new Date(m.created_at).toLocaleDateString('en-US', { weekday: 'short' }),
            mood: m.mood_score,
            sleep: m.sleep_hours || 7
          }));
          if (history.length > 0) setMoodHistory(history);
        }

        // Fetch Journals
        const { data: journalData, error: journalError } = await supabase
          .from('journal_entries')
          .select('*')
          .eq('user_id', session.user.id)
          .order('created_at', { ascending: false });

        if (journalError) throw journalError;

        const journals = journalData as any[];

        if (journals) {
          setJournalEntries(journals.map((j: any) => ({
            id: j.id,
            text: j.content,
            date: new Date(j.created_at).toLocaleDateString(),
            isVoice: j.is_voice
          })));
        }

        if (profile.role === 'admin') {
          const { data: logs, error: logsError } = await supabase
            .from('ai_logs')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(100);
          if (!logsError && logs) setAiLogs(logs);
        }

      } catch (error) {
        console.error('Error fetching data:', error);
        // Don't show toast error here to avoid annoying user if tables don't exist yet
      }
    };

    fetchData();
  }, [session]);

  const setCurrentMood = useCallback(async (mood: number) => {
    setCurrentMoodState(mood);

    // Update local weather/advice immediately
    if (mood > 80) {
      setWeather('sunny');
      setStressAdvice('Status: Low Stress. Advice: Great time for a walk or fun activity together! 🎉');
    } else if (mood > 40) {
      setWeather('cloudy');
      setStressAdvice('Status: Moderate Stress. Advice: Offer a calming activity together.');
    } else {
      setWeather('stormy');
      setStressAdvice('Status: High Stress. Advice: Do not argue. Offer a snack. Stay nearby quietly. 🤍');
    }

    if (!session?.user) return;

    try {
      const { error } = await (supabase as any).from('mood_logs').insert({
        user_id: session.user.id,
        mood_score: mood,
        sleep_hours: 7 // Default for now
      });

      if (error) throw error;
      toast.success('Mood logged!');
    } catch (error) {
      console.error('Error saving mood:', error);
      toast.error('Failed to save mood');
    }
  }, [session]);

  const addJournalEntry = useCallback(async (text: string, isVoice: boolean, sentiment?: number) => {
    // Optimistic Update
    const newEntry: JournalEntry = {
      id: Date.now().toString(),
      text,
      date: new Date().toLocaleDateString(),
      isVoice,
      sentiment
    };
    setJournalEntries(prev => [newEntry, ...prev]);

    // Check Trigger Words
    const lower = text.toLowerCase();
    if (TRIGGER_WORDS.some(w => lower.includes(w))) {
      setWeather('stormy');
      setStressAdvice('Status: High Stress. Advice: Do not argue. Offer a snack. Stay nearby quietly. 🤍');
    }

    if (!session?.user) return;

    try {
      const { error } = await (supabase as any).from('journal_entries').insert({
        user_id: session.user.id,
        content: text,
        is_voice: isVoice,
        sentiment_score: sentiment || 0.5
      });

      if (error) throw error;
      toast.success('Journal saved!');
    } catch (error) {
      console.error('Error saving journal:', error);
      toast.error('Failed to save journal');
    }
  }, [session]);

  const logout = useCallback(async () => {
    await signOut();
    setRole(null);
    setJournalEntries([]);
  }, [signOut]);

  // Doctor: Fetch Patients
  useEffect(() => {
    if (!session?.user || role !== 'doctor') return;

    const fetchPatients = async () => {
      try {
        const { data, error } = await (supabase as any)
          .from('patient_access')
          .select(`
            status,
            patient:profiles!patient_id (
              id,
              full_name,
              avatar_url
            )
          `)
          .eq('provider_id', session.user.id);

        if (error) throw error;

        if (data) {
          const mappedPatients = data.map((item: any) => ({
            id: item.patient.id,
            name: item.patient.full_name || 'Anonymous User',
            status: item.status
          }));
          setPatients(mappedPatients);
        }
      } catch (err) {
        console.error('Error fetching patients:', err);
      }
    };

    fetchPatients();
  }, [session, role]);

  // Caretaker: Fetch Requests
  useEffect(() => {
    if (!session?.user || role !== 'caretaker') return;

    const fetchRequests = async () => {
      try {
        // Find requests where I am the PATIENT (or caretaker acting as patient proxy?)
        // Wait, the schema says: patient_id and provider_id.
        // If I am the CARES for the patient, I need to approve? 
        // OR is the Caretaker the "patient_id" in this context (acting as the user)?
        // For simplicity in this demo: The "Patient" user logs in and approves. 
        // OR the "Caretaker" logs in. 
        // Let's assume the Doctor requests access to a PROFILE.
        // If the current user's ID matches 'patient_id' in the link table, they get the request.

        const { data, error } = await (supabase as any)
          .from('patient_access')
          .select(`
            id,
            status,
            doctor:profiles!provider_id (
              full_name
            )
          `)
          .eq('patient_id', session.user.id)
          .eq('status', 'pending');

        if (error) throw error;

        if (data) {
          setPendingRequests(data.map((item: any) => ({
            id: item.id,
            doctorName: item.doctor.full_name
          })));
        }
      } catch (err) {
        console.error('Error fetching requests:', err);
      }
    };

    fetchRequests();
  }, [session, role]);

  const [patients, setPatients] = useState<{ id: string; name: string; status: 'pending' | 'approved' }[]>([]);
  const [pendingRequests, setPendingRequests] = useState<{ id: string; doctorName: string }[]>([]);

  const approveRequest = async (requestId: string) => {
    try {
      const { error } = await (supabase as any)
        .from('patient_access')
        .update({ status: 'approved' })
        .eq('id', requestId);

      if (error) throw error;

      setPendingRequests(prev => prev.filter(r => r.id !== requestId));
      toast.success('Request approved!');
    } catch (err) {
      console.error(err);
      toast.error('Failed to approve');
    }
  };

  const rejectRequest = async (requestId: string) => {
    try {
      const { error } = await (supabase as any)
        .from('patient_access')
        .update({ status: 'rejected' })
        .eq('id', requestId);

      if (error) throw error;

      setPendingRequests(prev => prev.filter(r => r.id !== requestId));
      toast.success('Request declined');
    } catch (err) {
      console.error(err);
      toast.error('Failed to decline');
    }
  };

  const linkChild = async (code: string) => {
    if (!session?.user) return;
    try {
      // 1. Find child by code
      const { data: child, error: findError } = await supabase
        .from('profiles')
        .select('id, full_name')
        .eq('pairing_code', code.toUpperCase())
        .single();

      if (findError || !child) throw new Error('Invalid pairing code');

      const childProfile = child as any;

      // 2. Link with auto-approval (since they have the code)
      const { error: linkError } = await (supabase as any)
        .from('patient_access')
        .insert({
          patient_id: childProfile.id,
          provider_id: session.user.id,
          status: 'approved'
        });

      if (linkError) {
        if (linkError.code === '23505') throw new Error('Child already linked');
        throw linkError;
      }

      toast.success(`Successfully linked to ${childProfile.full_name}!`);
      // Trigger a refresh or local state update if needed
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const requestPatientAccess = async (identifier: string) => {
    if (!session?.user) return;
    try {
      // Find patient by code or email
      const query = identifier.includes('@')
        ? supabase.from('profiles').select('id, full_name').eq('email', identifier)
        : supabase.from('profiles').select('id, full_name').eq('pairing_code', identifier.toUpperCase());

      const { data: patient, error: findError } = await query.single();

      if (findError || !patient) throw new Error('Patient not found');

      const targetPatient = patient as any;

      // Create pending request
      const { error: reqError } = await (supabase as any)
        .from('patient_access')
        .insert({
          patient_id: targetPatient.id,
          provider_id: session.user.id,
          status: 'pending'
        });

      if (reqError) {
        if (reqError.code === '23505') throw new Error('Request already exists');
        throw reqError;
      }

      toast.success(`Relay request sent to ${targetPatient.full_name}!`);
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  return (
    <AppContext.Provider value={{
      role, setRole, logout,
      currentMood, setCurrentMood, streak,
      journalEntries, addJournalEntry, moodHistory,
      weather, stressAdvice,
      patients, pendingRequests, approveRequest, rejectRequest,
      pairingCode, linkChild, requestPatientAccess,
      aiLogs
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be inside AppProvider');
  return ctx;
};
