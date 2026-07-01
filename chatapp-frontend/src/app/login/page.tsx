'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { motion } from 'framer-motion';
import { MessageCircle, ArrowRight, Eye, EyeOff, Loader2 } from 'lucide-react';
import Link from 'next/link';
import ThemeToggle from '@/components/ThemeToggle';
import toast from 'react-hot-toast';
import { getErrorMessage } from '@/lib/errorHandler';
import { Suspense } from 'react';

// Google SVG Icon
const GoogleIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
);

// GitHub SVG Icon
const GitHubIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="currentColor">
        <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
    </svg>
);

function LoginPageContent() {
    const [userName, setUserName] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [oauthLoading, setOauthLoading] = useState<string | null>(null);
    const { login, loginWithOAuth2 } = useAuth();
    const router = useRouter();
    const searchParams = useSearchParams();

    // Check for OAuth2 error in URL params
    useEffect(() => {
        const oauthError = searchParams.get('error');
        if (oauthError) {
            const errorMsg = oauthError === 'oauth2_failed'
                ? 'OAuth2 authentication failed. Please try again.'
                : oauthError === 'oauth2_user_not_found'
                    ? 'Could not find your account after OAuth2 login.'
                    : 'Authentication error. Please try again.';
            setError(errorMsg);
            toast.error(errorMsg);
        }
    }, [searchParams]);

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
            toast.success('Signed in successfully');
            router.push('/dashboard');
        } catch (err: unknown) {
            const errorMsg = getErrorMessage(err, 'Invalid username or password');
            setError(errorMsg);
            toast.error(errorMsg);
        } finally {
            setIsLoading(false);
        }
    };

    const handleOAuth2Login = (provider: 'google' | 'github') => {
        setOauthLoading(provider);
        setError('');
        loginWithOAuth2(provider);
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
                            disabled={isLoading || oauthLoading !== null}
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

                    {/* Divider */}
                    <div className="relative my-6">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full" style={{ borderTop: '1px solid var(--border-subtle)' }} />
                        </div>
                        <div className="relative flex justify-center">
                            <span className="px-4 text-xs font-medium" style={{
                                background: 'var(--bg-primary)',
                                color: 'var(--text-tertiary)',
                            }}>
                                or continue with
                            </span>
                        </div>
                    </div>

                    {/* OAuth2 Buttons */}
                    <div className="space-y-3">
                        <motion.button
                            id="login-google"
                            type="button"
                            onClick={() => handleOAuth2Login('google')}
                            disabled={oauthLoading !== null || isLoading}
                            whileHover={{ scale: 1.01 }}
                            whileTap={{ scale: 0.98 }}
                            className="w-full py-3 px-4 rounded-xl text-sm font-medium flex items-center justify-center gap-3 transition-all duration-200 disabled:opacity-60"
                            style={{
                                background: 'var(--bg-card)',
                                border: '1px solid var(--border-subtle)',
                                color: 'var(--text-primary)',
                                boxShadow: 'var(--shadow-sm)',
                            }}
                        >
                            {oauthLoading === 'google' ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                <GoogleIcon />
                            )}
                            Continue with Google
                        </motion.button>

                        <motion.button
                            id="login-github"
                            type="button"
                            onClick={() => handleOAuth2Login('github')}
                            disabled={oauthLoading !== null || isLoading}
                            whileHover={{ scale: 1.01 }}
                            whileTap={{ scale: 0.98 }}
                            className="w-full py-3 px-4 rounded-xl text-sm font-medium flex items-center justify-center gap-3 transition-all duration-200 disabled:opacity-60"
                            style={{
                                background: 'var(--bg-card)',
                                border: '1px solid var(--border-subtle)',
                                color: 'var(--text-primary)',
                                boxShadow: 'var(--shadow-sm)',
                            }}
                        >
                            {oauthLoading === 'github' ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                <GitHubIcon />
                            )}
                            Continue with GitHub
                        </motion.button>
                    </div>

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

export default function LoginPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-primary)' }}>
                <Loader2 className="w-8 h-8 animate-spin" style={{ color: 'var(--accent-sage)' }} />
            </div>
        }>
            <LoginPageContent />
        </Suspense>
    );
}
