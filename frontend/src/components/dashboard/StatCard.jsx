import React from 'react';
import { motion } from 'framer-motion';

const StatCard = ({ label, value, icon: Icon, color = 'blue', delay = 0 }) => {
  const colorMap = {
    blue: {
      bg: 'from-pro-blue/20 to-pro-blue/5',
      text: 'text-pro-blue',
      border: 'border-pro-blue/20',
      shadow: 'shadow-pro-blue/10',
      glow: 'from-pro-blue/20'
    },
    green: {
      bg: 'from-tech-lime/20 to-tech-lime/5',
      text: 'text-tech-lime',
      border: 'border-tech-lime/20',
      shadow: 'shadow-tech-lime/10',
      glow: 'from-tech-lime/20'
    },
    red: {
      bg: 'from-tech-rose/20 to-tech-rose/5',
      text: 'text-tech-rose',
      border: 'border-tech-rose/20',
      shadow: 'shadow-tech-rose/10',
      glow: 'from-tech-rose/20'
    },
  };

  const theme = colorMap[color] || colorMap.blue;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className={`relative group p-6 rounded-2xl bg-pro-surface border border-pro-border overflow-hidden transition-all hover:border-pro-blue/30`}
    >
      {/* 3D Inner Shadow / Depth */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />
      
      {/* Background Glow */}
      <div className={`absolute -right-8 -bottom-8 w-32 h-32 bg-gradient-to-br ${theme.glow} blur-[40px] opacity-20 group-hover:opacity-40 transition-opacity`} />

      <div className="relative flex items-center justify-between gap-4">
        <div className="flex-1">
          <p className="text-[10px] font-black text-pro-sub uppercase tracking-[0.2em] mb-1">
            {label}
          </p>
          <div className="flex items-baseline gap-2">
            <h3 className="text-3xl font-black text-white tracking-tighter">
              {value}
            </h3>
            <span className={`text-[10px] font-bold ${theme.text} uppercase tracking-wider`}>
              Units
            </span>
          </div>
          {/* Metadata Readout */}
          <div className="mt-4 flex gap-3">
             <div className="flex items-center gap-1">
                <div className={`w-1 h-1 rounded-full ${theme.text} animate-pulse`} />
                <span className="text-[8px] font-bold text-pro-sub uppercase">Load: 12%</span>
             </div>
             <div className="flex items-center gap-1">
                <div className={`w-1 h-1 rounded-full ${theme.text} opacity-50`} />
                <span className="text-[8px] font-bold text-pro-sub uppercase">Parity: 0.98</span>
             </div>
          </div>
        </div>

        <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${theme.bg} border ${theme.border} flex items-center justify-center relative overflow-hidden group-hover:scale-110 transition-transform`}>
           <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity" />
           <Icon className={`w-7 h-7 ${theme.text}`} />
           
           {/* Decorative elements */}
           <div className="absolute top-1 left-1 w-1.5 h-1.5 border-t border-l border-white/20" />
           <div className="absolute bottom-1 right-1 w-1.5 h-1.5 border-b border-r border-white/20" />
        </div>
      </div>

      {/* Progress Line Decoration */}
      <div className="absolute bottom-0 left-0 w-full h-[2px] bg-pro-border overflow-hidden">
        <motion.div 
          initial={{ x: '-100%' }}
          animate={{ x: '100%' }}
          transition={{ duration: 3, repeat: Infinity, ease: "linear", delay: delay * 2 }}
          className={`w-1/3 h-full bg-gradient-to-r from-transparent via-current to-transparent ${theme.text}`}
        />
      </div>
    </motion.div>
  );
};

export default StatCard;
