'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { motion } from 'framer-motion';
import { MessageCircle, ArrowRight, Eye, EyeOff, Loader2 } from 'lucide-react';
import Link from 'next/link';
import ThemeToggle from '@/components/ThemeToggle';

export default function LoginPage() {
    const [userName, setUserName] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { login } = useAuth();
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!userName.trim() || !password.trim()) {
            setError('Please fill in all fields');
            return;
        }
        setError('');
        setIsLoading(true);
        try {
            await login({ userName: userName.trim(), password });
            router.push('/dashboard');
        } catch (err: unknown) {
            const msg = (err as { response?: { data?: string } })?.response?.data;
            setError(typeof msg === 'string' ? msg : 'Invalid credentials. Please try again.');
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

            {/* Left: Branding */}
            <div className="hidden lg:flex lg:w-1/2 items-center justify-center relative overflow-hidden"
                style={{ background: 'linear-gradient(135deg, #7C9A82 0%, #5A7D62 50%, #4A6B52 100%)' }}>
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-20 left-20 w-64 h-64 rounded-full" style={{ background: 'rgba(255,255,255,0.1)', filter: 'blur(60px)' }} />
                    <div className="absolute bottom-40 right-20 w-80 h-80 rounded-full" style={{ background: 'rgba(255,255,255,0.08)', filter: 'blur(80px)' }} />
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
                    <h1 className="text-4xl font-bold text-white mb-4 tracking-tight">ChatApp</h1>
                    <p className="text-lg text-white/70 max-w-sm mx-auto leading-relaxed">
                        Real-time conversations, beautifully crafted. Connect with your team in elegant rooms.
                    </p>
                    <div className="mt-12 flex items-center justify-center gap-3">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="w-2 h-2 rounded-full"
                                style={{ background: i === 1 ? 'rgba(255,255,255,0.8)' : 'rgba(255,255,255,0.3)' }} />
                        ))}
                    </div>
                </motion.div>
            </div>

            {/* Right: Form */}
            <div className="flex-1 flex items-center justify-center px-6 py-12">
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="w-full max-w-md"
                >
                    {/* Mobile logo */}
                    <div className="lg:hidden flex items-center gap-3 mb-10">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'var(--accent-sage)' }}>
                            <MessageCircle className="w-5 h-5 text-white" />
                        </div>
                        <span className="text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>ChatApp</span>
                    </div>

                    <h2 className="text-2xl font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>Welcome back</h2>
                    <p className="mb-8" style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
                        Sign in to continue to your conversations
                    </p>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>Username</label>
                            <input
                                id="login-username"
                                type="text"
                                value={userName}
                                onChange={(e) => setUserName(e.target.value)}
                                placeholder="Enter your username"
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
                                    id="login-password"
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Enter your password"
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

                        <motion.button
                            id="login-submit"
                            type="submit"
                            disabled={isLoading}
                            whileHover={{ scale: 1.01 }}
                            whileTap={{ scale: 0.98 }}
                            className="w-full py-3 rounded-xl text-sm font-medium text-white flex items-center justify-center gap-2 transition-all duration-200 disabled:opacity-60"
                            style={{ background: 'var(--accent-sage)', boxShadow: '0 2px 8px rgba(124,154,130,0.3)' }}
                        >
                            {isLoading ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                <>Sign In <ArrowRight className="w-4 h-4" /></>
                            )}
                        </motion.button>
                    </form>

                    <p className="text-center mt-8 text-sm" style={{ color: 'var(--text-tertiary)' }}>
                        Don&apos;t have an account?{' '}
                        <Link href="/register" className="font-medium transition-colors hover:underline"
                            style={{ color: 'var(--accent-sage)' }}>
                            Create one
                        </Link>
                    </p>
                </motion.div>
            </div>
        </div>
    );
}
