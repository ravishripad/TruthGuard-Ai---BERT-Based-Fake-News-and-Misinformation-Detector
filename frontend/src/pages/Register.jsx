import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authAPI } from '../api';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Lock, AlertCircle, Loader2, Shield, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import { duration, ease } from '../motion/config';
import { useTheme } from '../context/ThemeContext';
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
  const { theme } = useTheme();
  const isDark = theme === 'dark';

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
    <div className="min-h-screen bg-pro-bg flex items-center justify-center p-6 relative overflow-hidden">
      <ThreeBackground />

      <motion.div
        className="relative pro-card w-full max-w-[400px] p-6 sm:p-8 z-10"
        initial={{ opacity: 0, y: 30, filter: 'blur(10px)' }}
        animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      >
        {/* Back Link */}
        <Link to="/" className="inline-flex items-center gap-2 text-pro-sub hover:text-pro-text transition-colors mb-6 text-[10px] font-black uppercase tracking-widest">
          <ArrowLeft className="w-3.5 h-3.5" />
          Portal
        </Link>

        {/* Brand */}
        <div className="text-center mb-6">
          <motion.div
            className={`inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-4 border shadow-sm ${isDark ? 'bg-pro-bg border-pro-border' : 'bg-indigo-50 border-indigo-100'}`}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
          >
            <Shield className="w-7 h-7 text-pro-blue" />
          </motion.div>
          <h1 className="text-2xl font-black text-pro-text tracking-tight uppercase italic">Recruit</h1>
          <p className="text-pro-sub mt-1 text-[9px] font-black uppercase tracking-[0.2em]">Operative Initialization</p>
        </div>

        {/* Error */}
        {error && (
          <motion.div
            className="bg-red-500/10 border border-red-500/20 text-red-500 p-3 rounded-xl mb-4 flex items-center gap-3 text-[10px] font-bold"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </motion.div>
        )}

        {/* Form */}
        <motion.form 
          onSubmit={handleSubmit} 
          className="space-y-3"
          initial="hidden"
          animate="visible"
          variants={{
            hidden: { opacity: 0 },
            visible: { opacity: 1, transition: { staggerChildren: 0.08, delayChildren: 0.2 } }
          }}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <motion.div className="space-y-1" variants={{ hidden: { opacity: 0, y: 15 }, visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } } }}>
              <label className="block text-[9px] font-black text-pro-sub uppercase tracking-[0.2em] ml-1">Designation</label>
              <div className="relative group">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-pro-sub group-focus-within:text-pro-blue transition-colors" />
                <input type="text" name="username" value={formData.username} onChange={handleChange} required className="input-pro !pl-10 !py-2 text-sm" placeholder="Agent" />
              </div>
            </motion.div>

            <motion.div className="space-y-1" variants={{ hidden: { opacity: 0, y: 15 }, visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } } }}>
              <label className="block text-[9px] font-black text-pro-sub uppercase tracking-[0.2em] ml-1">Communication</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-pro-sub group-focus-within:text-pro-blue transition-colors" />
                <input type="email" name="email" value={formData.email} onChange={handleChange} required className="input-pro !pl-10 !py-2 text-sm" placeholder="email@link" />
              </div>
            </motion.div>
          </div>

          <motion.div className="space-y-1" variants={{ hidden: { opacity: 0, y: 15 }, visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } } }}>
            <label className="block text-[9px] font-black text-pro-sub uppercase tracking-[0.2em] ml-1">Security Cipher</label>
            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-pro-sub group-focus-within:text-pro-blue transition-colors" />
              <input type="password" name="password" value={formData.password} onChange={handleChange} required className="input-pro !pl-10 !py-2 text-sm" placeholder="••••••••" />
            </div>
          </motion.div>

          <motion.div className="space-y-1" variants={{ hidden: { opacity: 0, y: 15 }, visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } } }}>
            <label className="block text-[9px] font-black text-pro-sub uppercase tracking-[0.2em] ml-1">Verify Cipher</label>
            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-pro-sub group-focus-within:text-pro-blue transition-colors" />
              <input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} required className="input-pro !pl-10 !py-2 text-sm" placeholder="••••••••" />
            </div>
          </motion.div>

          <motion.div variants={{ hidden: { opacity: 0, y: 15 }, visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } } }}>
            <motion.button
              type="submit"
              disabled={loading}
              className="btn-pro w-full !py-3.5 !rounded-xl !text-[10px] uppercase font-black tracking-[0.2em] mt-4"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                'Create Operative Profile'
              )}
            </motion.button>
          </motion.div>
        </motion.form>

        {/* Footer Link */}
        <p className="text-center text-pro-sub text-[10px] font-black uppercase tracking-widest mt-6">
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
