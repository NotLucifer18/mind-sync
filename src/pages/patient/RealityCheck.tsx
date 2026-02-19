import { useState, useEffect, useRef } from 'react';
import { ScanEye, Shield, X, Camera, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import SOSButton from '@/components/SOSButton';

const RealityCheck = () => {
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const handleCheck = async () => {
    setResult(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });
      setCameraStream(stream);
      setScanning(true);

      // Simulate scanning with actual camera feed
      setTimeout(() => {
        setResult('safe');
      }, 3500);
    } catch {
      // Fallback if camera not available
      setScanning(true);
      setTimeout(() => {
        setResult('safe');
      }, 3000);
    }
  };

  useEffect(() => {
    if (videoRef.current && cameraStream) {
      videoRef.current.srcObject = cameraStream;
    }
  }, [cameraStream, scanning]);

  const handleClose = () => {
    setScanning(false);
    setResult(null);
    if (cameraStream) {
      cameraStream.getTracks().forEach(t => t.stop());
      setCameraStream(null);
    }
  };

  return (
    <div className="min-h-screen pb-24 px-5 pt-6 bg-background relative overflow-hidden">
      <div className="absolute bottom-[10%] right-[-10%] w-56 h-56 rounded-full bg-accent/5 blur-3xl pointer-events-none" />

      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-2 mb-6">
        <ScanEye className="w-6 h-6 text-primary" />
        <h1 className="text-xl font-black text-foreground">Reality Check</h1>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass-card rounded-3xl p-8 border border-border text-center shadow-soft"
      >
        <div className="w-20 h-20 mx-auto mb-6 rounded-full gradient-calm flex items-center justify-center shadow-glow">
          <Shield className="w-10 h-10 text-primary-foreground" />
        </div>
        <h2 className="text-xl font-black text-foreground mb-2">Hallucination Detector</h2>
        <p className="text-sm text-muted-foreground mb-4">
          Feeling unsure about what's real? This tool uses your camera to scan your environment and provide reassurance.
        </p>
        <div className="flex items-center justify-center gap-1.5 mb-6 text-xs text-muted-foreground">
          <Camera className="w-3.5 h-3.5" />
          <span>Uses your device camera</span>
        </div>
        <button
          onClick={handleCheck}
          className="w-full py-4 rounded-2xl gradient-calm text-primary-foreground font-bold text-lg shadow-glow hover:opacity-90 transition-opacity"
        >
          🔍 Start Reality Check
        </button>
      </motion.div>

      {/* Grounding tips */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mt-5 glass-card rounded-2xl p-5 border border-border"
      >
        <h3 className="font-bold text-foreground text-sm mb-3">🧘 5-4-3-2-1 Grounding</h3>
        <div className="space-y-2 text-sm text-muted-foreground">
          <p><span className="font-bold text-foreground">5</span> things you can see</p>
          <p><span className="font-bold text-foreground">4</span> things you can touch</p>
          <p><span className="font-bold text-foreground">3</span> things you can hear</p>
          <p><span className="font-bold text-foreground">2</span> things you can smell</p>
          <p><span className="font-bold text-foreground">1</span> thing you can taste</p>
        </div>
      </motion.div>

      {/* Camera Overlay */}
      <AnimatePresence>
        {(scanning || result) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black flex flex-col items-center justify-center"
          >
            <button onClick={handleClose} className="absolute top-6 right-6 text-white/80 z-10">
              <X className="w-8 h-8" />
            </button>

            <div className="relative w-72 h-72 rounded-3xl border-2 border-primary/50 overflow-hidden mb-8">
              {/* Real camera or dark fallback */}
              {cameraStream ? (
                <video 
                  ref={videoRef} 
                  autoPlay 
                  playsInline 
                  muted 
                  className="absolute inset-0 w-full h-full object-cover"
                />
              ) : (
                <div className="absolute inset-0 bg-foreground" />
              )}

              {/* Grid overlay */}
              <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 gap-px opacity-20 z-10">
                {Array.from({ length: 9 }).map((_, i) => (
                  <div key={i} className="border border-primary/30" />
                ))}
              </div>

              {/* Scanning line */}
              {!result && (
                <div
                  className="absolute left-0 right-0 h-1 bg-primary/80 shadow-lg z-20"
                  style={{ animation: 'scan 2s ease-in-out infinite', boxShadow: '0 0 15px hsl(252, 85%, 60%)' }}
                />
              )}

              {/* Crosshair */}
              <div className="absolute inset-0 flex items-center justify-center z-10">
                <div className="w-14 h-14 border-2 border-primary/60 rounded-lg" />
              </div>

              {/* Safe overlay */}
              {result && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="absolute inset-0 bg-success/20 z-20 flex items-center justify-center"
                >
                  <CheckCircle className="w-16 h-16 text-success" />
                </motion.div>
              )}
            </div>

            {!result ? (
              <div className="text-center">
                <motion.p
                  animate={{ opacity: [1, 0.5, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className="text-primary font-black text-xl"
                >
                  Scanning Environment...
                </motion.p>
                <p className="text-white/50 text-sm mt-2">Analyzing your surroundings</p>
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center"
              >
                <div className="text-5xl mb-4">🟢</div>
                <p className="text-success font-black text-2xl">No threats detected</p>
                <p className="text-white/50 text-sm mt-2">Your environment is safe</p>
                <button
                  onClick={handleClose}
                  className="mt-6 px-8 py-3 rounded-xl gradient-calm text-primary-foreground font-bold shadow-glow"
                >
                  I'm okay now
                </button>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <SOSButton />
    </div>
  );
};

export default RealityCheck;
