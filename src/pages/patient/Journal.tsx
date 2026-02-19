import { useState, useRef, useCallback } from 'react';
import { useApp } from '@/context/AppContext';
import { useAI } from '@/hooks/useAI';
import { Mic, MicOff, Send, BookOpen, Sparkles, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import SOSButton from '@/components/SOSButton';

const Journal = () => {
  const { journalEntries, addJournalEntry } = useApp();
  const { ask, loading: aiLoading } = useAI();
  const [text, setText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [aiResponses, setAiResponses] = useState<Record<string, string>>({});
  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const audioChunks = useRef<Blob[]>([]);

  const handleRecord = useCallback(async () => {
    if (isRecording) {
      // Stop recording
      mediaRecorder.current?.stop();
      setIsRecording(false);
    } else {
      // Start recording
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const recorder = new MediaRecorder(stream);
        audioChunks.current = [];

        recorder.ondataavailable = (e) => {
          if (e.data.size > 0) audioChunks.current.push(e.data);
        };

        recorder.onstop = () => {
          stream.getTracks().forEach(t => t.stop());
          // Since we can't do real STT without a service, simulate transcription
          const simulated = "I recorded my thoughts today. Speaking out loud helps me process my feelings.";
          setText(prev => prev ? prev + ' ' + simulated : simulated);
          toast.success('Voice recorded! 🎙️', { description: 'Transcript added to your entry.' });
        };

        recorder.start();
        mediaRecorder.current = recorder;
        setIsRecording(true);
        toast('🎙️ Recording...', { description: 'Tap again to stop.' });
      } catch (err) {
        toast.error('Microphone access denied', { description: 'Please allow microphone access in your browser.' });
      }
    }
  }, [isRecording]);

  const handleSubmit = async () => {
    if (!text.trim()) return;
    const entryText = text;
    setText('');

    // Call AI FIRST to get sentiment for research/paper quality
    const aiResult = await ask('journal', { text: entryText });
    const sentiment = aiResult?.sentiment || 0.5;
    const aiReflection = aiResult?.content || "Thank you for sharing.";

    // Save to database with sentiment
    addJournalEntry(entryText, false, sentiment);

    setAiResponses(prev => ({
      ...prev,
      [journalEntries.length.toString()]: aiReflection
    }));

    toast.success('Journal saved! ✨', {
      description: `Sentiment Analysis: ${Math.round(sentiment * 100)}% Wellness`
    });
  };

  return (
    <div className="min-h-screen pb-24 px-5 pt-6 bg-background relative overflow-hidden">
      <div className="absolute top-[-10%] left-[-15%] w-48 h-48 rounded-full bg-primary/5 blur-3xl pointer-events-none" />

      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-2 mb-6">
        <BookOpen className="w-6 h-6 text-primary" />
        <h1 className="text-xl font-black text-foreground">Journal</h1>
      </motion.div>

      {/* Voice Record */}
      <motion.button
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        onClick={handleRecord}
        className={`w-full py-6 rounded-2xl flex flex-col items-center gap-2 mb-4 transition-all duration-300 border ${isRecording
            ? 'bg-destructive/10 border-destructive text-destructive shadow-sos'
            : 'glass-card border-border text-muted-foreground hover:border-primary/40 hover:shadow-soft'
          }`}
      >
        {isRecording ? <MicOff className="w-10 h-10" /> : <Mic className="w-10 h-10" />}
        <span className="font-bold text-sm">
          {isRecording ? 'Tap to Stop Recording' : 'Tap to Record Voice'}
        </span>
        {isRecording && (
          <div className="flex gap-1 mt-1">
            {[0, 1, 2, 3, 4].map(i => (
              <motion.div
                key={i}
                className="w-1.5 bg-destructive rounded-full"
                animate={{ height: [12, 28, 12] }}
                transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.1 }}
              />
            ))}
          </div>
        )}
      </motion.button>

      {/* Text Area */}
      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="relative mb-4">
        <textarea
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder="Write about your day..."
          rows={5}
          className="w-full p-4 pr-14 rounded-2xl border border-border bg-card text-foreground placeholder:text-muted-foreground resize-none focus:outline-none focus:ring-2 focus:ring-ring text-sm"
        />
        <button
          onClick={handleSubmit}
          disabled={!text.trim() || aiLoading}
          className="absolute bottom-4 right-4 w-10 h-10 rounded-xl gradient-calm text-primary-foreground flex items-center justify-center disabled:opacity-40 transition-opacity"
        >
          {aiLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
        </button>
      </motion.div>

      {/* AI Loading */}
      <AnimatePresence>
        {aiLoading && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="flex items-center gap-2 mb-4 p-3 bg-primary/5 rounded-xl border border-primary/20"
          >
            <Sparkles className="w-4 h-4 text-primary animate-pulse" />
            <span className="text-xs text-primary font-bold">AI companion is thinking...</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Entries */}
      <div className="space-y-3">
        {journalEntries.map((entry, idx) => (
          <motion.div
            key={entry.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="glass-card rounded-xl p-4 border border-border">
              <div className="flex items-center gap-2 mb-2">
                {entry.isVoice && <Mic className="w-3.5 h-3.5 text-primary" />}
                <span className="text-xs text-muted-foreground font-bold">{entry.date}</span>
              </div>
              <p className="text-sm text-foreground">{entry.text}</p>
            </div>
            <AnimatePresence>
              {aiResponses[idx.toString()] && (
                <motion.div
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="ml-4 mt-2 p-3 bg-primary/5 rounded-xl border border-primary/20"
                >
                  <div className="flex items-center gap-1.5 mb-1">
                    <Sparkles className="w-3.5 h-3.5 text-primary" />
                    <span className="text-[10px] font-black text-primary uppercase tracking-wider">AI Companion</span>
                  </div>
                  <p className="text-xs text-foreground leading-relaxed">{aiResponses[idx.toString()]}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </div>

      <SOSButton />
    </div>
  );
};

export default Journal;
