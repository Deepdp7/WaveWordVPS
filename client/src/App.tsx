import { BrowserRouter, Routes, Route, Link, useNavigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useEffect } from 'react';

import { AuthProvider, useAuth } from './context/AuthContext';
import { PlansPage } from './pages/public/PlansPage';
import { CheckoutPage } from './pages/public/CheckoutPage';
import { InvoicePage } from './pages/public/InvoicePage';
import { LoginPage } from './pages/auth/LoginPage';
import { SignupPage } from './pages/auth/SignupPage';
import { DashboardPage } from './pages/dashboard/DashboardPage';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { Footer } from './components/Footer';

const Navbar = () => {
  const { isAuthenticated, logout, user } = useAuth();
  
  return (
    <nav className="fixed w-full z-50 glass border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-2 group">
              <img src="/logo.png" alt="Wave Word Logo" className="h-8 w-8" />
              <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-text to-muted">
                Wave Word VPS Hosting
              </span>
            </Link>
          </div>
          <div className="hidden md:block">
            <div className="ml-10 flex items-center space-x-8">
              <Link to="/plans/static" className="text-muted hover:text-text transition-colors">Shared Hosting</Link>
              <Link to="/plans/lite_vps" className="text-muted hover:text-text transition-colors">Lite VPS</Link>
              <Link to="/plans/vps" className="text-muted hover:text-text transition-colors">VPS Hosting</Link>
              {isAuthenticated ? (
                <>
                  <Link to="/dashboard" className="text-muted hover:text-text transition-colors">Dashboard</Link>
                  {user?.role === 'admin' && <Link to="/admin" className="text-primary hover:text-primary-hover transition-colors font-medium">Admin</Link>}
                  
                  <div className="flex items-center gap-6 border-l border-border pl-6">
                    <button onClick={logout} className="text-red-400 hover:text-red-300 transition-colors">Logout</button>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-center gap-6 border-l border-border pl-6">
                    <Link to="/login" className="text-muted hover:text-text transition-colors">Login</Link>
                  </div>
                  <Link to="/signup" className="bg-primary hover:bg-primary-hover text-white px-4 py-2 rounded-lg font-medium transition-colors">
                    Get Started
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

const LandingPage = () => (
  <div className="pt-24 min-h-screen flex flex-col items-center justify-center text-center px-4">
    <div className="inline-block bg-surface border border-border rounded-full px-4 py-1.5 mb-6">
      <span className="text-sm font-medium text-primary">✨ Next generation hosting platform</span>
    </div>
    <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-8">
      Host your ideas with <br />
      <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-500">
        blazing fast performance
      </span>
    </h1>
    <p className="text-lg md:text-xl text-muted max-w-2xl mb-10">
      Premium static hosting and dedicated VPS infrastructure. Launch your next project in seconds with our highly optimized servers.
    </p>
    <div className="flex gap-4">
      <Link to="/plans/vps" className="bg-primary hover:bg-primary-hover text-white px-8 py-4 rounded-xl font-medium text-lg transition-all transform hover:scale-105 shadow-xl shadow-primary/20">
        Deploy VPS Now
      </Link>
      <Link to="/plans/lite_vps" className="bg-surface hover:bg-border text-text px-8 py-4 rounded-xl font-medium text-lg border border-border transition-all">
        View Lite VPS
      </Link>
    </div>
  </div>
);

const AutoLogout = () => {
  const { isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) return;

    let timeoutId: number;

    const resetTimer = () => {
      window.clearTimeout(timeoutId);
      // 5 minutes = 300,000 ms
      timeoutId = window.setTimeout(() => {
        logout();
        navigate('/login');
      }, 300000);
    };

    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
    
    const handleActivity = () => {
      resetTimer();
    };

    events.forEach(event => document.addEventListener(event, handleActivity));
    resetTimer(); // Start the timer

    return () => {
      events.forEach(event => document.removeEventListener(event, handleActivity));
      window.clearTimeout(timeoutId);
    };
  }, [isAuthenticated, logout, navigate]);

  return null;
};

const App = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <div className="min-h-screen bg-background text-text transition-colors duration-300 flex flex-col">
          <AutoLogout />
          <Toaster position="top-right" />
          <Navbar />
          <div className="flex-grow">
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/plans/:type" element={<PlansPage />} />
              <Route path="/checkout/:planId" element={<CheckoutPage />} />
              <Route path="/invoice/:id" element={<InvoicePage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignupPage />} />
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/admin" element={<AdminDashboard />} />
            </Routes>
          </div>
          <Footer />
        </div>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
