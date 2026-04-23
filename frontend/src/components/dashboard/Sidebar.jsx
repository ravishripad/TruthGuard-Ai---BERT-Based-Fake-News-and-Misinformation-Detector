import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Shield, 
  LogOut, 
  User,
  Cpu,
  ChevronLeft,
  ChevronRight,
  X,
  Scan,
  History as HistoryIcon,
  Sun,
  Moon
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { Link } from 'react-router-dom';

const Sidebar = ({ isCollapsed, toggleCollapse, isMobileOpen, closeMobile, activeTab, setActiveTab }) => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  const menuItems = [
    { id: 'analysis', label: 'Neural Scan', icon: Scan, sub: 'Protocol 01' },
    { id: 'workflow', label: 'Workflow', icon: Cpu, sub: 'Protocol 02' },
    { id: 'history', label: 'Archive', icon: HistoryIcon, sub: 'Tactical Logs' },
  ];

  return (
    <motion.aside 
      initial={false}
      animate={{ 
        width: isCollapsed ? 80 : 260,
        x: isMobileOpen ? 0 : (window.innerWidth < 1024 ? -260 : 0)
      }}
      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      className={`fixed inset-y-0 left-0 z-50 
        bg-pro-bg/80 backdrop-blur-3xl border-r border-pro-border 
        flex flex-col p-4`}
    >
      {/* Mobile Close */}
      <button onClick={closeMobile} className="lg:hidden absolute top-6 right-6 p-2 text-pro-sub hover:text-pro-text transition-colors">
        <X className="w-6 h-6" />
      </button>

      {/* Brand Section */}
      <div className="mb-10 flex items-center justify-between p-2">
        <Link to="/" className="flex items-center gap-4 group overflow-hidden">
          <div className="relative w-10 h-10 shrink-0">
            <div className="absolute inset-0 bg-pro-blue/20 blur-xl rounded-xl" />
            <div className="relative w-10 h-10 bg-pro-surface border border-pro-border rounded-xl flex items-center justify-center overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-pro-blue/10 to-transparent" />
              <Shield className="w-5 h-5 text-pro-blue group-hover:text-pro-text transition-colors" />
              {/* Restored Scanning Animation */}
              <motion.div 
                animate={{ y: [0, 40, 0] }}
                transition={{ duration: 2.5, repeat: Infinity, ease: "linear" }}
                className="absolute top-0 left-0 w-full h-[1px] bg-pro-blue/50 shadow-[0_0_8px_#0071e3]"
              />
            </div>
          </div>
          {!isCollapsed && (
            <motion.h1 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-lg font-black text-pro-text tracking-tightest uppercase italic pr-4"
            >
            TruthGuard <span className="text-pro-blue">AI</span>
            </motion.h1>
          )}
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-2 px-1">
        {menuItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id);
                if (window.innerWidth < 1024) closeMobile();
              }}
              className={`w-full flex items-center gap-4 p-3 rounded-xl transition-all relative group ${
                isActive 
                  ? 'bg-pro-blue text-white shadow-lg shadow-pro-blue/20' 
                  : 'text-pro-sub hover:text-pro-text hover:bg-white/5'
              } ${isCollapsed ? 'justify-center' : ''}`}
            >
              {isActive && (
                <motion.div 
                  layoutId="active-nav-pill"
                  className="absolute left-0 w-1 h-6 bg-white rounded-full"
                />
              )}
              <item.icon className={`w-5 h-5 shrink-0 ${isActive ? 'text-white' : 'group-hover:text-pro-blue'}`} />
              {!isCollapsed && (
                <div className="text-left">
                  <p className="text-xs font-black uppercase tracking-widest leading-none">{item.label}</p>
                  <p className={`text-[8px] font-bold uppercase mt-1 opacity-60 ${isActive ? 'text-white' : 'text-pro-sub'}`}>{item.sub}</p>
                </div>
              )}
            </button>
          );
        })}
      </nav>

      {/* Collapse Toggle - Desktop Only */}
      <button 
        onClick={toggleCollapse}
        className="hidden lg:flex items-center gap-4 p-3 rounded-xl text-pro-sub hover:text-pro-text hover:bg-white/5 mb-4 px-4"
      >
        {isCollapsed ? <ChevronRight className="w-5 h-5 mx-auto" /> : (
          <>
            <ChevronLeft className="w-5 h-5" />
            <span className="text-[10px] font-black uppercase tracking-widest">Collapse</span>
          </>
        )}
      </button>

      {/* Theme Toggle & User Section */}
      <div className="mt-auto px-1 space-y-3">
        {/* Theme Switcher Button */}
        <button
          onClick={toggleTheme}
          className={`w-full flex items-center gap-4 p-3 rounded-xl transition-all group relative border border-pro-border/50 hover:border-pro-blue/40 hover:bg-white/5 ${isCollapsed ? 'justify-center' : ''}`}
        >
          <div className="relative w-5 h-5 flex items-center justify-center">
            <AnimatePresence mode="wait">
              {isDark ? (
                <motion.div key="moon" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.2 }}>
                  <Moon className="w-5 h-5 text-pro-blue" />
                </motion.div>
              ) : (
                <motion.div key="sun" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.2 }}>
                  <Sun className="w-5 h-5 text-amber-500" />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          {!isCollapsed && (
            <div className="text-left flex-1 flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-widest text-pro-text">Theme Mode</span>
              <span className="text-[8px] font-bold uppercase text-pro-sub">{isDark ? 'Midnight' : 'Daylight'}</span>
            </div>
          )}
        </button>

        <div className={`p-3 rounded-2xl bg-pro-surface border border-pro-border mb-3 overflow-hidden ${isCollapsed ? 'flex justify-center' : ''}`}>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-pro-blue/20 flex items-center justify-center shrink-0">
               <User className="w-4 h-4 text-pro-blue" />
            </div>
            {!isCollapsed && (
              <div className="min-w-0">
                <p className="text-[10px] font-black text-pro-text truncate uppercase tracking-tight">{user?.username || 'Agent'}</p>
                <p className="text-[8px] font-bold text-pro-sub uppercase flex items-center gap-1 tracking-widest">
                  <span className="w-1 h-1 rounded-full bg-green-500 animate-pulse" /> Online
                </p>
              </div>
            )}
          </div>
        </div>

        <button
          onClick={logout}
          className={`w-full flex items-center gap-4 p-3 rounded-xl text-pro-sub hover:text-red-500 hover:bg-red-500/10 transition-all font-bold text-sm ${isCollapsed ? 'justify-center' : ''}`}
        >
          <LogOut className="w-5 h-5 shrink-0" />
          {!isCollapsed && <span className="text-[10px] font-black uppercase tracking-widest">Exit</span>}
        </button>
      </div>
    </motion.aside>
  );
};

export default Sidebar;
