import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, AlertCircle, Loader2, Shield, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import { duration, ease } from '../motion/config';
import ThreeBackground from '../components/ThreeBackground';

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
      window.location.href = '/dashboard';
    } catch (err) {
      setError(err.response?.data?.detail || 'Login failed. Please try again.');
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
        <Link to="/" className="inline-flex items-center gap-2 text-pro-sub hover:text-pro-blue transition-colors mb-10 text-[11px] font-bold uppercase tracking-widest">
          <ArrowLeft className="w-4 h-4" />
          Back to Portal
        </Link>

        {/* Brand */}
        <div className="text-center mb-12">
          <motion.div
            className="inline-flex items-center justify-center w-20 h-20 bg-black rounded-3xl mb-6 border border-pro-border shadow-sm"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
          >
            <Shield className="w-10 h-10 text-pro-blue" />
          </motion.div>
          <h1 className="text-3xl font-black text-white tracking-tight uppercase italic">Welcome</h1>
          <p className="text-pro-sub mt-2 text-[11px] font-bold uppercase tracking-[0.2em]">Neural Node Authentication</p>
        </div>

        {/* Error */}
        {error && (
          <motion.div
            className="bg-red-500/10 border border-red-500/20 text-red-500 p-4 rounded-2xl mb-8 flex items-center gap-3 text-xs font-bold"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span>{error}</span>
          </motion.div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="block text-[10px] font-black text-pro-sub uppercase tracking-[0.2em] ml-1">
              Identity
            </label>
            <div className="relative">
              <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-pro-sub" />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="input-pro !pl-14"
                placeholder="operative@truthlens.ai"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-[10px] font-black text-pro-sub uppercase tracking-[0.2em] ml-1">
              Cipher
            </label>
            <div className="relative">
              <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-pro-sub" />
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                className="input-pro !pl-14"
                placeholder="••••••••"
              />
            </div>
          </div>

          <motion.button
            type="submit"
            disabled={loading}
            className="btn-pro w-full !py-5 !rounded-2xl !text-[11px] uppercase tracking-[0.2em] mt-6"
            whileTap={{ scale: 0.98 }}
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              'Initialize Session'
            )}
          </motion.button>
        </form>

        {/* Footer Link */}
        <p className="text-center text-pro-sub text-[11px] font-bold uppercase tracking-widest mt-12">
          New Operative?{' '}
          <Link to="/register" className="text-pro-blue hover:underline ml-1">
            Request Access
          </Link>
        </p>
      </motion.div>
    </div>
  );
};

export default Login;
