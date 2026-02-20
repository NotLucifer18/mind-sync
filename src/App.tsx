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
import AdminDashboard from "@/pages/admin/AdminDashboard";
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

const AdminRoutes = () => (
  <Routes>
    <Route path="/" element={<AdminDashboard />} />
    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes>
);

const AppRoutes = () => {
  const { role, setRole } = useApp();
  const { session, loading } = useAuth();

  // EMERGENCY BYPASS: If session is missing but a role is manually set (e.g., from Login bypass), allow entry
  if (!session && !role && !loading) return <Login />;

  // Wait for loading but show Login if no session/role after load
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Final check: if no session AND no role, go to Login
  if (!session && !role) return <Login />;

  // If we have a role (even without session), render the routes
  if (role) {
    return (
      <>
        {role === 'patient' && <PatientRoutes />}
        {role === 'caretaker' && <CaretakerRoutes />}
        {role === 'doctor' && <DoctorRoutes />}
        {role === 'admin' && <AdminRoutes />}
        <BottomNav />
      </>
    );
  }

  return <Login />;

  return (
    <>
      {role === 'patient' && <PatientRoutes />}
      {role === 'caretaker' && <CaretakerRoutes />}
      {role === 'doctor' && <DoctorRoutes />}
      {role === 'admin' && <AdminRoutes />}
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
