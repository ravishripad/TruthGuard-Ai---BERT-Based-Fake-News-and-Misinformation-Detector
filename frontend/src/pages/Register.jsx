import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, User, AlertCircle, Loader2, Shield, UserCircle, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import { duration, ease } from '../motion/config';

const Register = () => {
  const [formData, setFormData] = useState({
    email: '',
    username: '',
    password: '',
    confirmPassword: '',
    full_name: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      await register({
        email: formData.email,
        username: formData.username,
        password: formData.password,
        full_name: formData.full_name || null
      });
      // Use window.location for reliable redirect after state update
      window.location.href = '/dashboard';
    } catch (err) {
      setError(err.response?.data?.detail || 'Registration failed. Please try again.');
      setLoading(false);
    }
  };

  const inputClass = "input-dark w-full !pl-11";

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
          <filter id="rn-glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="4" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
          <linearGradient id="rn-scan" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%"   stopColor="transparent" />
            <stop offset="30%"  stopColor="rgba(139,92,246,0.9)" />
            <stop offset="70%"  stopColor="rgba(16,185,129,0.8)" />
            <stop offset="100%" stopColor="transparent" />
          </linearGradient>
        </defs>

        {/* Hexagonal outlines — corners, clearly visible */}
        <polygon points="120,110 60,145 0,110 0,40 60,5 120,40" fill="none" stroke="rgba(139,92,246,0.55)" strokeWidth="1.5">
          <animate attributeName="opacity" values="0.4;0.9;0.4" dur="4s" repeatCount="indefinite" />
        </polygon>
        <polygon points="800,110 740,145 680,110 680,40 740,5 800,40" fill="none" stroke="rgba(99,102,241,0.55)" strokeWidth="1.5">
          <animate attributeName="opacity" values="0.35;0.85;0.35" dur="5s" begin="1s" repeatCount="indefinite" />
        </polygon>
        <polygon points="120,900 60,865 0,900 0,830 60,795 120,830" fill="none" stroke="rgba(16,185,129,0.5)" strokeWidth="1.5">
          <animate attributeName="opacity" values="0.35;0.8;0.35" dur="5.5s" begin="2s" repeatCount="indefinite" />
        </polygon>
        <polygon points="800,900 740,865 680,900 680,830 740,795 800,830" fill="none" stroke="rgba(99,102,241,0.5)" strokeWidth="1.5">
          <animate attributeName="opacity" values="0.3;0.8;0.3" dur="4.5s" begin="1.5s" repeatCount="indefinite" />
        </polygon>
        {/* Mid-side hexagons */}
        <polygon points="90,490 30,525 -30,490 -30,420 30,385 90,420" fill="none" stroke="rgba(139,92,246,0.4)" strokeWidth="1.2">
          <animate attributeName="opacity" values="0.3;0.7;0.3" dur="6s" begin="0.8s" repeatCount="indefinite" />
        </polygon>
        <polygon points="830,490 770,525 710,490 710,420 770,385 830,420" fill="none" stroke="rgba(99,102,241,0.4)" strokeWidth="1.2">
          <animate attributeName="opacity" values="0.3;0.7;0.3" dur="5.5s" begin="2.5s" repeatCount="indefinite" />
        </polygon>

        {/* Ripple rings — large enough to be seen around the card */}
        <circle cx="400" cy="450" fill="none" stroke="rgba(139,92,246,0.7)" strokeWidth="2" r="60">
          <animate attributeName="r" values="60;380" dur="5s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.8;0" dur="5s" repeatCount="indefinite" />
        </circle>
        <circle cx="400" cy="450" fill="none" stroke="rgba(139,92,246,0.7)" strokeWidth="2" r="60">
          <animate attributeName="r" values="60;380" dur="5s" begin="1.67s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.8;0" dur="5s" begin="1.67s" repeatCount="indefinite" />
        </circle>
        <circle cx="400" cy="450" fill="none" stroke="rgba(139,92,246,0.7)" strokeWidth="2" r="60">
          <animate attributeName="r" values="60;380" dur="5s" begin="3.34s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.8;0" dur="5s" begin="3.34s" repeatCount="indefinite" />
        </circle>

        {/* Corner glow nodes */}
        <circle cx="60" cy="75" r="6" fill="rgba(139,92,246,1)" filter="url(#rn-glow)">
          <animate attributeName="r" values="5;9;5" dur="3s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.5;1;0.5" dur="3s" repeatCount="indefinite" />
        </circle>
        <circle cx="740" cy="75" r="6" fill="rgba(99,102,241,1)" filter="url(#rn-glow)">
          <animate attributeName="r" values="5;9;5" dur="4s" begin="1s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.5;1;0.5" dur="4s" begin="1s" repeatCount="indefinite" />
        </circle>
        <circle cx="60" cy="825" r="6" fill="rgba(16,185,129,1)" filter="url(#rn-glow)">
          <animate attributeName="r" values="5;9;5" dur="3.5s" begin="2s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.5;1;0.5" dur="3.5s" begin="2s" repeatCount="indefinite" />
        </circle>
        <circle cx="740" cy="825" r="6" fill="rgba(99,102,241,1)" filter="url(#rn-glow)">
          <animate attributeName="r" values="5;9;5" dur="3.8s" begin="0.5s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.5;1;0.5" dur="3.8s" begin="0.5s" repeatCount="indefinite" />
        </circle>
        {/* Edge mid-nodes */}
        <circle cx="30" cy="450" r="5" fill="rgba(139,92,246,0.9)" filter="url(#rn-glow)">
          <animate attributeName="opacity" values="0.4;1;0.4" dur="4.5s" begin="1.5s" repeatCount="indefinite" />
        </circle>
        <circle cx="770" cy="450" r="5" fill="rgba(99,102,241,0.9)" filter="url(#rn-glow)">
          <animate attributeName="opacity" values="0.4;1;0.4" dur="5s" begin="2.5s" repeatCount="indefinite" />
        </circle>
        <circle cx="400" cy="25" r="5" fill="rgba(16,185,129,0.9)" filter="url(#rn-glow)">
          <animate attributeName="opacity" values="0.4;1;0.4" dur="3.8s" begin="0.7s" repeatCount="indefinite" />
        </circle>
        <circle cx="400" cy="875" r="5" fill="rgba(139,92,246,0.9)" filter="url(#rn-glow)">
          <animate attributeName="opacity" values="0.4;1;0.4" dur="4.2s" begin="1.8s" repeatCount="indefinite" />
        </circle>

        {/* Scanning line — sweeps top to bottom */}
        <rect x="0" y="-4" width="800" height="3" fill="url(#rn-scan)">
          <animate attributeName="y" values="-10;910" dur="7s" begin="1s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0;1;1;0" keyTimes="0;0.03;0.97;1" dur="7s" begin="1s" repeatCount="indefinite" />
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
          <h1 className="text-2xl font-bold text-white tracking-tight">Sign Up</h1>
          <p className="text-dark-400 mt-2 text-sm">Join TruthLens today</p>
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
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-dark-300 mb-2">
              Full Name <span className="text-dark-500 font-normal">(Optional)</span>
            </label>
            <div className="relative">
              <UserCircle className="absolute left-3.5 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-dark-500" />
              <input
                type="text"
                name="full_name"
                value={formData.full_name}
                onChange={handleChange}
                className={inputClass}
                placeholder="John Doe"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-dark-300 mb-2">
              Username
            </label>
            <div className="relative">
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-dark-500" />
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                required
                className={inputClass}
                placeholder="johndoe"
              />
            </div>
          </div>

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
                className={inputClass}
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
                className={inputClass}
                placeholder="••••••••"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-dark-300 mb-2">
              Confirm Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-dark-500" />
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                className={inputClass}
                placeholder="••••••••"
              />
            </div>
          </div>

          <motion.button
            type="submit"
            disabled={loading}
            className="btn-primary w-full rounded-full !py-3.5 text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2"
            whileTap={{ scale: 0.98 }}
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Creating account…
              </>
            ) : (
              'Sign Up'
            )}
          </motion.button>
        </form>

        {/* Login Link */}
        <p className="text-center text-dark-400 text-sm mt-8">
          Already have an account?{' '}
          <Link to="/login" className="text-accent hover:text-accent-hover hover:underline font-medium transition-colors">
            Sign In
          </Link>
        </p>
      </motion.div>
    </div>
  );
};

export default Register;
