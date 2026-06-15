'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { motion } from 'framer-motion';
import { MessageCircle, ArrowRight, Eye, EyeOff, Loader2, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import ThemeToggle from '@/components/ThemeToggle';

export default function RegisterPage() {
    const [userName, setUserName] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { register } = useAuth();
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!userName.trim() || !password.trim()) {
            setError('Please fill in all fields');
            return;
        }
        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }
        if (password.length < 4) {
            setError('Password must be at least 4 characters');
            return;
        }
        setError('');
        setSuccess('');
        setIsLoading(true);
        try {
            const msg = await register({ userName: userName.trim(), password });
            setSuccess(msg || 'Account created! Redirecting to login...');
            setTimeout(() => router.push('/login'), 1500);
        } catch (err: unknown) {
            const msg = (err as { response?: { data?: string } })?.response?.data;
            setError(typeof msg === 'string' ? msg : 'Registration failed. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex relative" style={{ background: 'var(--bg-primary)' }}>
            {/* Theme Toggle Floating */}
            <div className="absolute top-6 right-6 z-50">
                <ThemeToggle />
            </div>

            {/* Right: Form first on mobile */}
            <div className="flex-1 flex items-center justify-center px-6 py-12 order-1 lg:order-none">
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="w-full max-w-md"
                >
                    {/* Mobile logo */}
                    <div className="lg:hidden flex items-center gap-3 mb-10">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'var(--accent-coral)' }}>
                            <MessageCircle className="w-5 h-5 text-white" />
                        </div>
                        <span className="text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>ChatApp</span>
                    </div>

                    <h2 className="text-2xl font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>Create your account</h2>
                    <p className="mb-8" style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
                        Join the conversation in just a moment
                    </p>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>Username</label>
                            <input
                                id="register-username"
                                type="text"
                                value={userName}
                                onChange={(e) => setUserName(e.target.value)}
                                placeholder="Choose a username"
                                className="w-full px-4 py-3 rounded-xl text-sm transition-all duration-200"
                                style={{
                                    background: 'var(--bg-input)',
                                    border: '1px solid var(--border-subtle)',
                                    color: 'var(--text-primary)',
                                }}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>Password</label>
                            <div className="relative">
                                <input
                                    id="register-password"
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Choose a password"
                                    className="w-full px-4 py-3 pr-12 rounded-xl text-sm transition-all duration-200"
                                    style={{
                                        background: 'var(--bg-input)',
                                        border: '1px solid var(--border-subtle)',
                                        color: 'var(--text-primary)',
                                    }}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-lg transition-colors"
                                    style={{ color: 'var(--text-tertiary)' }}
                                >
                                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>Confirm Password</label>
                            <input
                                id="register-confirm-password"
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="Confirm your password"
                                className="w-full px-4 py-3 rounded-xl text-sm transition-all duration-200"
                                style={{
                                    background: 'var(--bg-input)',
                                    border: '1px solid var(--border-subtle)',
                                    color: 'var(--text-primary)',
                                }}
                            />
                        </div>

                        {error && (
                            <motion.div
                                initial={{ opacity: 0, y: -8 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="px-4 py-3 rounded-xl text-sm"
                                style={{ background: 'rgba(199,92,92,0.08)', color: 'var(--error)', border: '1px solid rgba(199,92,92,0.15)' }}
                            >
                                {error}
                            </motion.div>
                        )}

                        {success && (
                            <motion.div
                                initial={{ opacity: 0, y: -8 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="px-4 py-3 rounded-xl text-sm flex items-center gap-2"
                                style={{ background: 'rgba(124,154,130,0.08)', color: 'var(--success)', border: '1px solid rgba(124,154,130,0.15)' }}
                            >
                                <CheckCircle2 className="w-4 h-4" /> {success}
                            </motion.div>
                        )}

                        <motion.button
                            id="register-submit"
                            type="submit"
                            disabled={isLoading}
                            whileHover={{ scale: 1.01 }}
                            whileTap={{ scale: 0.98 }}
                            className="w-full py-3 rounded-xl text-sm font-medium text-white flex items-center justify-center gap-2 transition-all duration-200 disabled:opacity-60"
                            style={{ background: 'var(--accent-coral)', boxShadow: '0 2px 8px rgba(212,132,122,0.3)' }}
                        >
                            {isLoading ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                <>Create Account <ArrowRight className="w-4 h-4" /></>
                            )}
                        </motion.button>
                    </form>

                    <p className="text-center mt-8 text-sm" style={{ color: 'var(--text-tertiary)' }}>
                        Already have an account?{' '}
                        <Link href="/login" className="font-medium transition-colors hover:underline"
                            style={{ color: 'var(--accent-coral)' }}>
                            Sign in
                        </Link>
                    </p>
                </motion.div>
            </div>

            {/* Left: Branding */}
            <div className="hidden lg:flex lg:w-1/2 items-center justify-center relative overflow-hidden order-2"
                style={{ background: 'linear-gradient(135deg, #D4847A 0%, #B06B62 50%, #9A5950 100%)' }}>
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-32 right-20 w-72 h-72 rounded-full" style={{ background: 'rgba(255,255,255,0.1)', filter: 'blur(60px)' }} />
                    <div className="absolute bottom-20 left-32 w-56 h-56 rounded-full" style={{ background: 'rgba(255,255,255,0.08)', filter: 'blur(80px)' }} />
                </div>
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                    className="relative z-10 text-center px-12"
                >
                    <div className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-8"
                        style={{ background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(10px)' }}>
                        <MessageCircle className="w-10 h-10 text-white" />
                    </div>
                    <h1 className="text-4xl font-bold text-white mb-4 tracking-tight">Join ChatApp</h1>
                    <p className="text-lg text-white/70 max-w-sm mx-auto leading-relaxed">
                        Create rooms, share files, and have meaningful conversations with your team.
                    </p>
                </motion.div>
            </div>
        </div>
    );
}
