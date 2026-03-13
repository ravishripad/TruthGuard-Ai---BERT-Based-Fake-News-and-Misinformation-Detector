import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authAPI } from '../api';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Lock, AlertCircle, Loader2, Shield, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import { duration, ease } from '../motion/config';
import ThreeBackground from '../components/ThreeBackground';

const Register = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
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

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      await authAPI.register({
        username: formData.username,
        email: formData.email,
        password: formData.password
      });
      
      await login({
        email: formData.email,
        password: formData.password
      });
      
      window.location.href = '/dashboard';
    } catch (err) {
      setError(err.response?.data?.detail || 'Registration failed. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-6 relative overflow-hidden">
      <ThreeBackground />

      <motion.div
        className="relative pro-card w-full max-w-md p-10 sm:p-12"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      >
        {/* Back Link */}
        <Link to="/" className="inline-flex items-center gap-2 text-pro-sub hover:text-pro-blue transition-colors mb-8 text-[11px] font-bold uppercase tracking-widest">
          <ArrowLeft className="w-4 h-4" />
          Back to Portal
        </Link>

        {/* Brand */}
        <div className="text-center mb-10">
          <motion.div
            className="inline-flex items-center justify-center w-16 h-16 bg-black rounded-2xl mb-5 border border-pro-border shadow-sm"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
          >
            <Shield className="w-8 h-8 text-pro-blue" />
          </motion.div>
          <h1 className="text-3xl font-black text-white tracking-tight uppercase italic">Recruit</h1>
          <p className="text-pro-sub mt-2 text-[10px] font-black uppercase tracking-[0.2em]">Initialize Operative Profile</p>
        </div>

        {/* Error */}
        {error && (
          <motion.div
            className="bg-red-500/10 border border-red-500/20 text-red-500 p-4 rounded-2xl mb-6 flex items-center gap-3 text-xs font-bold"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span>{error}</span>
          </motion.div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="block text-[10px] font-black text-pro-sub uppercase tracking-[0.2em] ml-1">
              Designation
            </label>
            <div className="relative">
              <User className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-pro-sub" />
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                required
                className="input-pro !pl-14 !py-3.5"
                placeholder="Agent Name"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-[10px] font-black text-pro-sub uppercase tracking-[0.2em] ml-1">
              Communication
            </label>
            <div className="relative">
              <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-pro-sub" />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="input-pro !pl-14 !py-3.5"
                placeholder="unit@truthlens.ai"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-[10px] font-black text-pro-sub uppercase tracking-[0.2em] ml-1">
              Security Key
            </label>
            <div className="relative">
              <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-pro-sub" />
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                className="input-pro !pl-14 !py-3.5"
                placeholder="••••••••"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-[10px] font-black text-pro-sub uppercase tracking-[0.2em] ml-1">
              Verify Key
            </label>
            <div className="relative">
              <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-pro-sub" />
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                className="input-pro !pl-14 !py-3.5"
                placeholder="••••••••"
              />
            </div>
          </div>

          <motion.button
            type="submit"
            disabled={loading}
            className="btn-pro w-full !py-4.5 !rounded-2xl !text-[11px] uppercase tracking-[0.2em] mt-6"
            whileTap={{ scale: 0.98 }}
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              'Create Intelligence Profile'
            )}
          </motion.button>
        </form>

        {/* Footer Link */}
        <p className="text-center text-pro-sub text-[11px] font-bold uppercase tracking-widest mt-10">
          Already Recruited?{' '}
          <Link to="/login" className="text-pro-blue hover:underline ml-1">
            Sign In
          </Link>
        </p>
      </motion.div>
    </div>
  );
};

export default Register;
