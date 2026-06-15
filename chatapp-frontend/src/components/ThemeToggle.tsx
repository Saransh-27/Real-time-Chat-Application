'use client';

import { useTheme } from '@/contexts/ThemeContext';
import { Sun, Moon } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ThemeToggle() {
    const { theme, toggleTheme } = useTheme();

    return (
        <button
            id="theme-toggle"
            onClick={toggleTheme}
            className="relative w-14 h-7 rounded-full p-0.5 transition-colors duration-300 focus:outline-none"
            style={{
                background: theme === 'dark'
                    ? 'linear-gradient(135deg, #4A3F6B, #6B5B95)'
                    : 'linear-gradient(135deg, #A8C4AE, #7C9A82)',
            }}
            title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
        >
            <motion.div
                layout
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                className="w-6 h-6 rounded-full flex items-center justify-center"
                style={{
                    background: theme === 'dark' ? '#2D2640' : '#FFFFFF',
                    marginLeft: theme === 'dark' ? 'auto' : '0',
                    boxShadow: '0 1px 4px rgba(0,0,0,0.15)',
                }}
            >
                {theme === 'dark' ? (
                    <Moon className="w-3.5 h-3.5" style={{ color: '#B5ABDB' }} />
                ) : (
                    <Sun className="w-3.5 h-3.5" style={{ color: '#C4A86C' }} />
                )}
            </motion.div>
        </button>
    );
}
