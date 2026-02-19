import { MapPin } from 'lucide-react';
import { toast } from 'sonner';

const SOSButton = () => {
  const handleSOS = () => {
    toast.success('📍 Location Sent!', {
      description: 'Your emergency contacts and caretaker have been notified.',
      duration: 4000,
    });
  };

  return (
    <button
      onClick={handleSOS}
      className="fixed bottom-24 right-5 z-50 group relative flex items-center justify-center"
      aria-label="Emergency SOS"
    >
      {/* Radar Rings */}
      <div className="absolute inset-0 rounded-full bg-destructive/20 animate-ping opacity-75 duration-1000" />
      <div className="absolute inset-[-4px] rounded-full bg-destructive/10 animate-pulse delay-75" />

      {/* Main Button */}
      <div className="relative w-16 h-16 rounded-full bg-gradient-to-br from-red-500 to-rose-600 shadow-[0_0_20px_rgba(239,68,68,0.6)] flex flex-col items-center justify-center text-white transition-transform hover:scale-105 active:scale-95 border-4 border-white/20 backdrop-blur-sm">
        <MapPin className="w-6 h-6 mb-0.5" />
        <span className="text-[10px] font-black tracking-wider">SOS</span>
      </div>
    </button>
  );
};

export default SOSButton;
