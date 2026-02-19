import { useApp } from '@/context/AppContext';
import { NavLink } from '@/components/NavLink';
import { Home, BookOpen, ScanEye, LayoutDashboard, HeartPulse, Users, BarChart3, LogOut } from 'lucide-react';

const patientLinks = [
  { to: '/', icon: Home, label: 'Home' },
  { to: '/journal', icon: BookOpen, label: 'Journal' },
  { to: '/reality', icon: ScanEye, label: 'Check' },
];

const caretakerLinks = [
  { to: '/', icon: LayoutDashboard, label: 'Weather' },
  { to: '/empathy', icon: HeartPulse, label: 'Advice' },
];

const doctorLinks = [
  { to: '/', icon: Users, label: 'Members' },
  { to: '/analytics', icon: BarChart3, label: 'Analytics' },
];

const BottomNav = () => {
  const { role, logout } = useApp();
  const links = role === 'patient' ? patientLinks : role === 'caretaker' ? caretakerLinks : doctorLinks;

  return (
    <nav className="fixed bottom-6 left-6 right-6 z-50">
      <div className="glass-card rounded-[2rem] shadow-float border border-white/40 flex items-center justify-around px-4 h-20 max-w-lg mx-auto backdrop-blur-xl">
        {links.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end
            className={({ isActive }) => `
              relative flex flex-col items-center gap-1.5 px-4 py-2 rounded-2xl transition-all duration-300
              ${isActive ? 'text-primary transform -translate-y-2' : 'text-muted-foreground hover:text-primary/70'}
            `}
          >
            {({ isActive }) => (
              <>
                <div className={`
                    w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300
                    ${isActive ? 'bg-primary/10 shadow-glow' : 'bg-transparent'}
                `}>
                  <Icon className={`w-6 h-6 ${isActive ? 'fill-primary/20' : ''}`} />
                </div>
                {isActive && (
                  <span className="absolute -bottom-6 text-[10px] font-black tracking-wide text-primary animate-fade-in-up">
                    {label}
                  </span>
                )}
              </>
            )}
          </NavLink>
        ))}
        <button
          onClick={logout}
          className="flex flex-col items-center gap-1 px-3 py-2 rounded-xl text-muted-foreground hover:text-destructive transition-colors opacity-50 hover:opacity-100"
        >
          <LogOut className="w-6 h-6" />
        </button>
      </div>
    </nav>
  );
};

export default BottomNav;
