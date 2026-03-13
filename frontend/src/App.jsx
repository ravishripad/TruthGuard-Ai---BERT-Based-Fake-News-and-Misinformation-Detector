import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { AuthProvider, useAuth } from './context/AuthContext';
import { pageTransition } from './motion/config';

// Route-level code splitting
const Home      = lazy(() => import('./pages/Home'));
const Login     = lazy(() => import('./pages/Login'));
const Register  = lazy(() => import('./pages/Register'));
const Dashboard = lazy(() => import('./pages/Dashboard'));

// Shared loading spinner
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-dark-950">
    <div className="absolute inset-0 mesh-gradient opacity-50" />
    <div className="relative flex flex-col items-center gap-5">
      <div className="w-12 h-12 rounded-full border-[3px] border-white/[0.08] border-t-accent animate-spin" />
      <p className="text-sm text-dark-400 font-medium tracking-wide">Loading…</p>
    </div>
  </div>
);

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <PageLoader />;
  }
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
};

// Public Route (redirect to dashboard if logged in)
const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <PageLoader />;
  }
  
  if (user) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return children;
};

// Animated route wrapper
const PageWrapper = ({ children }) => (
  <motion.div {...pageTransition} style={{ willChange: 'transform, opacity, filter' }}>
    {children}
  </motion.div>
);

function AppRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Suspense fallback={<PageLoader />} key={location.pathname}>
        <Routes location={location}>
          <Route path="/" element={
            <PublicRoute>
              <PageWrapper><Home /></PageWrapper>
            </PublicRoute>
          } />
          <Route path="/login" element={
            <PublicRoute>
              <PageWrapper><Login /></PageWrapper>
            </PublicRoute>
          } />
          <Route path="/register" element={
            <PublicRoute>
              <PageWrapper><Register /></PageWrapper>
            </PublicRoute>
          } />
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <PageWrapper><Dashboard /></PageWrapper>
            </ProtectedRoute>
          } />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </AnimatePresence>
  );
}

function App() {
  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
