import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, AlertCircle, Loader2, Shield, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import { duration, ease } from '../motion/config';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(formData);
      // Use window.location for reliable redirect after state update
      window.location.href = '/dashboard';
    } catch (err) {
      setError(err.response?.data?.detail || 'Login failed. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-dark-950 flex items-center justify-center p-5 relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 grid-pattern opacity-30" />
      <div className="absolute inset-0 mesh-gradient" />

      {/* ── Animated SVG Background ─────────────────────── */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none select-none"
        viewBox="0 0 800 900"
        preserveAspectRatio="xMidYMid slice"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <defs>
          <filter id="ln-glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="4" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
          <linearGradient id="ln-scan" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%"   stopColor="transparent" />
            <stop offset="30%"  stopColor="rgba(99,102,241,0.9)" />
            <stop offset="70%"  stopColor="rgba(139,92,246,0.9)" />
            <stop offset="100%" stopColor="transparent" />
          </linearGradient>
        </defs>

        {/* Large orbit ring 1 — extends well beyond card */}
        <circle cx="400" cy="450" r="320" fill="none" stroke="rgba(99,102,241,0.35)" strokeWidth="1.5" strokeDasharray="8 12">
          <animateTransform attributeName="transform" type="rotate" from="0 400 450" to="360 400 450" dur="18s" repeatCount="indefinite" />
        </circle>
        {/* Node on ring 1 */}
        <circle cx="720" cy="450" r="5" fill="rgba(99,102,241,1)" filter="url(#ln-glow)">
          <animateTransform attributeName="transform" type="rotate" from="0 400 450" to="360 400 450" dur="18s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.6;1;0.6" dur="2s" repeatCount="indefinite" />
        </circle>

        {/* Large orbit ring 2 — counter-clockwise */}
        <circle cx="400" cy="450" r="390" fill="none" stroke="rgba(139,92,246,0.25)" strokeWidth="1" strokeDasharray="5 18">
          <animateTransform attributeName="transform" type="rotate" from="0 400 450" to="-360 400 450" dur="30s" repeatCount="indefinite" />
        </circle>
        {/* Node on ring 2 */}
        <circle cx="790" cy="450" r="4" fill="rgba(139,92,246,1)" filter="url(#ln-glow)">
          <animateTransform attributeName="transform" type="rotate" from="-70 400 450" to="290 400 450" dur="30s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.5;1;0.5" dur="3s" repeatCount="indefinite" />
        </circle>

        {/* Center pulsing node — visible at top/bottom edges of card */}
        <circle cx="400" cy="450" r="6" fill="rgba(99,102,241,0.9)" filter="url(#ln-glow)">
          <animate attributeName="r" values="5;10;5" dur="2.5s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.5;0.9;0.5" dur="2.5s" repeatCount="indefinite" />
        </circle>

        {/* Corner nodes — top-left */}
        <circle cx="60" cy="70" r="5" fill="rgba(99,102,241,0.9)" filter="url(#ln-glow)">
          <animate attributeName="opacity" values="0.4;1;0.4" dur="3s" begin="0s" repeatCount="indefinite" />
          <animate attributeName="r" values="4;7;4" dur="3s" begin="0s" repeatCount="indefinite" />
        </circle>
        <circle cx="130" cy="120" r="3" fill="rgba(139,92,246,0.8)" filter="url(#ln-glow)">
          <animate attributeName="opacity" values="0.3;0.9;0.3" dur="4s" begin="0.5s" repeatCount="indefinite" />
        </circle>

        {/* Corner nodes — top-right */}
        <circle cx="740" cy="60" r="5" fill="rgba(139,92,246,0.9)" filter="url(#ln-glow)">
          <animate attributeName="opacity" values="0.4;1;0.4" dur="3.5s" begin="1s" repeatCount="indefinite" />
          <animate attributeName="r" values="4;7;4" dur="3.5s" begin="1s" repeatCount="indefinite" />
        </circle>
        <circle cx="680" cy="110" r="3" fill="rgba(59,130,246,0.8)" filter="url(#ln-glow)">
          <animate attributeName="opacity" values="0.3;0.9;0.3" dur="4.5s" begin="0.8s" repeatCount="indefinite" />
        </circle>

        {/* Corner nodes — bottom-left */}
        <circle cx="55" cy="830" r="5" fill="rgba(16,185,129,0.9)" filter="url(#ln-glow)">
          <animate attributeName="opacity" values="0.4;1;0.4" dur="4s" begin="2s" repeatCount="indefinite" />
          <animate attributeName="r" values="4;7;4" dur="4s" begin="2s" repeatCount="indefinite" />
        </circle>
        <circle cx="120" cy="780" r="3" fill="rgba(99,102,241,0.8)" filter="url(#ln-glow)">
          <animate attributeName="opacity" values="0.3;0.85;0.3" dur="5s" begin="1.2s" repeatCount="indefinite" />
        </circle>

        {/* Corner nodes — bottom-right */}
        <circle cx="745" cy="840" r="5" fill="rgba(139,92,246,0.9)" filter="url(#ln-glow)">
          <animate attributeName="opacity" values="0.4;1;0.4" dur="3.8s" begin="1.5s" repeatCount="indefinite" />
          <animate attributeName="r" values="4;7;4" dur="3.8s" begin="1.5s" repeatCount="indefinite" />
        </circle>
        <circle cx="680" cy="790" r="3" fill="rgba(59,130,246,0.8)" filter="url(#ln-glow)">
          <animate attributeName="opacity" values="0.3;0.9;0.3" dur="4.2s" begin="0.6s" repeatCount="indefinite" />
        </circle>

        {/* Mid-edge nodes */}
        <circle cx="30" cy="450" r="4" fill="rgba(99,102,241,0.8)" filter="url(#ln-glow)">
          <animate attributeName="opacity" values="0.35;0.9;0.35" dur="5s" begin="2.5s" repeatCount="indefinite" />
        </circle>
        <circle cx="770" cy="200" r="4" fill="rgba(139,92,246,0.8)" filter="url(#ln-glow)">
          <animate attributeName="opacity" values="0.35;0.9;0.35" dur="4.5s" begin="0.4s" repeatCount="indefinite" />
        </circle>
        <circle cx="770" cy="700" r="4" fill="rgba(99,102,241,0.8)" filter="url(#ln-glow)">
          <animate attributeName="opacity" values="0.35;0.9;0.35" dur="3.8s" begin="1.8s" repeatCount="indefinite" />
        </circle>
        <circle cx="400" cy="30" r="4" fill="rgba(16,185,129,0.8)" filter="url(#ln-glow)">
          <animate attributeName="opacity" values="0.3;0.85;0.3" dur="5.5s" begin="0.9s" repeatCount="indefinite" />
        </circle>
        <circle cx="400" cy="870" r="4" fill="rgba(99,102,241,0.8)" filter="url(#ln-glow)">
          <animate attributeName="opacity" values="0.3;0.85;0.3" dur="4.8s" begin="2.2s" repeatCount="indefinite" />
        </circle>

        {/* Visible connection lines from center to corners */}
        <line x1="400" y1="450" x2="60" y2="70" stroke="rgba(99,102,241,0.3)" strokeWidth="1">
          <animate attributeName="opacity" values="0.15;0.4;0.15" dur="5s" repeatCount="indefinite" />
        </line>
        <line x1="400" y1="450" x2="740" y2="60" stroke="rgba(139,92,246,0.3)" strokeWidth="1">
          <animate attributeName="opacity" values="0.1;0.35;0.1" dur="6s" begin="1s" repeatCount="indefinite" />
        </line>
        <line x1="400" y1="450" x2="55" y2="830" stroke="rgba(16,185,129,0.25)" strokeWidth="1">
          <animate attributeName="opacity" values="0.1;0.3;0.1" dur="7s" begin="2s" repeatCount="indefinite" />
        </line>
        <line x1="400" y1="450" x2="745" y2="840" stroke="rgba(99,102,241,0.25)" strokeWidth="1">
          <animate attributeName="opacity" values="0.1;0.3;0.1" dur="5.5s" begin="0.5s" repeatCount="indefinite" />
        </line>

        {/* Scanning line — sweeps top to bottom */}
        <rect x="0" y="-4" width="800" height="3" fill="url(#ln-scan)">
          <animate attributeName="y" values="-10;910" dur="6s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0;1;1;0" keyTimes="0;0.03;0.97;1" dur="6s" repeatCount="indefinite" />
        </rect>
      </svg>

      <motion.div
        className="relative glass-card w-full max-w-md p-8 sm:p-10"
        initial={{ opacity: 0, y: 24, scale: 0.97, filter: 'blur(8px)' }}
        animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
        transition={{ duration: duration.slow, ease: ease.out }}
      >
        {/* Back Button */}
        <Link to="/" className="inline-flex items-center gap-2 text-dark-400 hover:text-accent transition-colors mb-8 text-sm font-medium">
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>

        {/* Logo */}
        <div className="text-center mb-9">
          <motion.div
            className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-cyber-500 to-accent rounded-2xl mb-5 shadow-lg shadow-accent/20"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: duration.base, ease: ease.out, delay: 0.1 }}
          >
            <Shield className="w-8 h-8 text-white" />
          </motion.div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Welcome Back</h1>
          <p className="text-dark-400 mt-2 text-sm">Sign in to TruthLens</p>
        </div>

        {/* Error Message */}
        {error && (
          <motion.div
            className="bg-danger/10 border border-danger/30 text-danger p-4 rounded-xl mb-6 flex items-center gap-2.5 text-sm"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: duration.fast }}
          >
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span>{error}</span>
          </motion.div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5" autoComplete="on">
          <div>
            <label className="block text-sm font-medium text-dark-300 mb-2">
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-dark-500" />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                autoComplete="email"
                className="input-dark w-full !pl-11"
                placeholder="your@email.com"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-dark-300 mb-2">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-dark-500" />
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                autoComplete="current-password"
                className="input-dark w-full !pl-11"
                placeholder="••••••••"
              />
            </div>
          </div>

          <motion.button
            type="submit"
            disabled={loading}
            className="btn-primary w-full rounded-full !py-3.5 text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            whileTap={{ scale: 0.98 }}
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Signing in…
              </>
            ) : (
              'Sign In'
            )}
          </motion.button>
        </form>

        {/* Register Link */}
        <p className="text-center text-dark-400 text-sm mt-8">
          Don't have an account?{' '}
          <Link to="/register" className="text-accent hover:text-accent-hover hover:underline font-medium transition-colors">
            Sign Up
          </Link>
        </p>
      </motion.div>
    </div>
  );
};

export default Login;
