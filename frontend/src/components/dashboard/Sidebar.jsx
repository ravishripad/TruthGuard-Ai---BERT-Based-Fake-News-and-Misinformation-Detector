import React from 'react';
import { motion } from 'framer-motion';
import { 
  Shield, 
  LayoutDashboard, 
  LogOut, 
  User,
  Cpu,
  ChevronLeft,
  ChevronRight,
  X
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Link, useLocation } from 'react-router-dom';

const Sidebar = ({ isCollapsed, toggleCollapse, isMobileOpen, closeMobile }) => {
  const { user, logout } = useAuth();
  const location = useLocation();

  const menuItems = [
    { id: 'dashboard', label: 'Workspace', icon: LayoutDashboard, path: '/dashboard' },
  ];

  return (
    <motion.aside 
      className={`fixed inset-y-0 left-0 z-50 
        ${isCollapsed ? 'w-20' : 'w-64'} 
        bg-black/80 backdrop-blur-3xl border-r border-pro-border 
        flex flex-col p-5 transition-all duration-500 ease-in-out
        ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
    >
      {/* Mobile Close */}
      <button onClick={closeMobile} className="lg:hidden absolute top-6 right-6 p-2 text-pro-sub">
        <X className="w-6 h-6" />
      </button>

      {/* Brand Section */}
      <div className="mb-12 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-4 group overflow-hidden">
          <div className="relative w-12 h-12 shrink-0">
            <div className="absolute inset-0 bg-pro-blue/20 blur-xl rounded-xl" />
            <div className="relative w-12 h-12 bg-pro-surface border border-pro-border rounded-xl flex items-center justify-center overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-pro-blue/10 to-transparent" />
              <Shield className="w-6 h-6 text-pro-blue group-hover:text-white transition-colors" />
              <motion.div 
                animate={{ y: [0, 48, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                className="absolute top-0 left-0 w-full h-[1px] bg-pro-blue/50 shadow-[0_0_8px_#0071e3]"
              />
            </div>
          </div>
          {!isCollapsed && (
            <motion.h1 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-xl font-black text-white tracking-tightest uppercase italic"
            >
              Truth<span className="text-pro-blue">Lens</span>
            </motion.h1>
          )}
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-2">
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.id}
              to={item.path}
              className={`w-full flex items-center gap-4 p-3.5 rounded-xl transition-all relative group ${
                isActive 
                  ? 'bg-pro-blue/10 text-white' 
                  : 'text-pro-sub hover:text-white hover:bg-white/5'
              } ${isCollapsed ? 'justify-center' : ''}`}
            >
              {isActive && (
                <motion.div 
                  layoutId="active-pill"
                  className="absolute left-0 w-1 h-6 bg-pro-blue rounded-full"
                />
              )}
              <item.icon className={`w-6 h-6 shrink-0 ${isActive ? 'text-pro-blue' : 'group-hover:text-pro-blue'}`} />
              {!isCollapsed && <span className="text-sm font-bold tracking-tight">{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Collapse Toggle - Desktop Only */}
      <button 
        onClick={toggleCollapse}
        className="hidden lg:flex items-center gap-4 p-3.5 rounded-xl text-pro-sub hover:text-white hover:bg-white/5 mb-4"
      >
        {isCollapsed ? <ChevronRight className="w-6 h-6 mx-auto" /> : (
          <>
            <ChevronLeft className="w-6 h-6" />
            <span className="text-sm font-bold">Collapse</span>
          </>
        )}
      </button>

      {/* User Section */}
      <div className="mt-auto">
        <div className={`p-4 rounded-2xl bg-pro-surface border border-pro-border mb-4 overflow-hidden ${isCollapsed ? 'flex justify-center' : ''}`}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-pro-blue/20 flex items-center justify-center shrink-0">
               <User className="w-5 h-5 text-pro-blue" />
            </div>
            {!isCollapsed && (
              <div className="min-w-0">
                <p className="text-xs font-black text-white truncate">{user?.username || 'Agent'}</p>
                <p className="text-[9px] font-bold text-pro-sub uppercase flex items-center gap-1">
                  <Cpu className="w-2 h-2" /> Online
                </p>
              </div>
            )}
          </div>
        </div>

        <button
          onClick={logout}
          className={`w-full flex items-center gap-4 p-3.5 rounded-xl text-pro-sub hover:text-red-500 hover:bg-red-500/10 transition-all font-bold text-sm ${isCollapsed ? 'justify-center' : ''}`}
        >
          <LogOut className="w-6 h-6 shrink-0" />
          {!isCollapsed && <span>Exit</span>}
        </button>
      </div>
    </motion.aside>
  );
};

export default Sidebar;
