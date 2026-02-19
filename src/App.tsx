import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HashRouter, Routes, Route, Navigate } from "react-router-dom";
import { AppProvider, useApp, UserRole } from "@/context/AppContext";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import Login from "@/pages/Login";
import PatientHome from "@/pages/patient/PatientHome";
import Journal from "@/pages/patient/Journal";
import RealityCheck from "@/pages/patient/RealityCheck";
import CaretakerDashboard from "@/pages/caretaker/CaretakerDashboard";
import EmpathyTranslator from "@/pages/caretaker/EmpathyTranslator";
import DoctorDashboard from "@/pages/doctor/DoctorDashboard";
import Analytics from "@/pages/doctor/Analytics";
import BottomNav from "@/components/BottomNav";

const queryClient = new QueryClient();

const PatientRoutes = () => (
  <Routes>
    <Route path="/" element={<PatientHome />} />
    <Route path="/journal" element={<Journal />} />
    <Route path="/reality" element={<RealityCheck />} />
    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes>
);

const CaretakerRoutes = () => (
  <Routes>
    <Route path="/" element={<CaretakerDashboard />} />
    <Route path="/empathy" element={<EmpathyTranslator />} />
    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes>
);

const DoctorRoutes = () => (
  <Routes>
    <Route path="/" element={<DoctorDashboard />} />
    <Route path="/analytics" element={<Analytics />} />
    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes>
);

const AppRoutes = () => {
  const { role, setRole } = useApp();
  const { session, loading } = useAuth();

  // Sync session with role state
  // Check user metadata for role, default to 'patient' if not found
  if (session && !role && !loading) {
    const savedRole = session.user.user_metadata.role as UserRole;
    setRole(savedRole || 'patient');
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!session) return <Login />;

  // If session exists but role is somehow still null (should be caught above), default to patient view or loading
  if (!role) return null;

  return (
    <>
      {role === 'patient' && <PatientRoutes />}
      {role === 'caretaker' && <CaretakerRoutes />}
      {role === 'doctor' && <DoctorRoutes />}
      <BottomNav />
    </>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <AppProvider>
          <HashRouter>
            <AppRoutes />
          </HashRouter>
        </AppProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
