'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface AuthTabsProps {
  activeTab: 'signin' | 'signup';
  onChange: (tab: 'signin' | 'signup') => void;
}

export const AuthTabs = ({ activeTab, onChange }: AuthTabsProps) => {
  return (
    <div
      className="flex p-1 rounded-xl w-fit mx-auto mb-8"
      style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)' }}
    >
      <button
        onClick={() => onChange('signin')}
        className="relative px-6 py-2 text-xs font-black uppercase tracking-widest rounded-lg transition-all duration-300"
        style={{ color: activeTab === 'signin' ? 'var(--background)' : 'var(--muted)' }}
      >
        {activeTab === 'signin' && (
          <motion.div
            layoutId="activeTabIndicator"
            className="absolute inset-0 shadow-lg"
            transition={{ type: "spring", bounce: 0.15, duration: 0.5 }}
            style={{ borderRadius: '8px', backgroundColor: 'var(--accent)' }}
          />
        )}
        <span className="relative z-10">Sign In</span>
      </button>
      <button
        onClick={() => onChange('signup')}
        className="relative px-6 py-2 text-xs font-black uppercase tracking-widest rounded-lg transition-all duration-300"
        style={{ color: activeTab === 'signup' ? 'var(--background)' : 'var(--muted)' }}
      >
        {activeTab === 'signup' && (
          <motion.div
            layoutId="activeTabIndicator"
            className="absolute inset-0 shadow-lg"
            transition={{ type: "spring", bounce: 0.15, duration: 0.5 }}
            style={{ borderRadius: '8px', backgroundColor: 'var(--accent)' }}
          />
        )}
        <span className="relative z-10">Sign Up</span>
      </button>
    </div>
  );
};

export default AuthTabs;
