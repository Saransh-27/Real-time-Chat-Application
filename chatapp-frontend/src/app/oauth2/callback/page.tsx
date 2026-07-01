'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { motion } from 'framer-motion';
import { Loader2, CheckCircle2, XCircle, MessageCircle } from 'lucide-react';
import { Suspense } from 'react';

function OAuth2CallbackContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { handleOAuth2Callback } = useAuth();
    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
    const [message, setMessage] = useState('Completing sign in...');

    useEffect(() => {
        const processCallback = async () => {
            const token = searchParams.get('token');
            const username = searchParams.get('username');
            const userId = searchParams.get('userId');
            const error = searchParams.get('error');

            if (error) {
                setStatus('error');
                setMessage(
                    error === 'oauth2_user_not_found'
                        ? 'Could not find your account. Please try again.'
                        : 'Authentication failed. Please try again.'
                );
                setTimeout(() => router.push('/login'), 3000);
                return;
            }

            if (!token || !username || !userId) {
                setStatus('error');
                setMessage('Invalid callback parameters. Redirecting to login...');
                setTimeout(() => router.push('/login'), 2000);
                return;
            }

            try {
                await handleOAuth2Callback(token, username, userId);
                setStatus('success');
                setMessage(`Welcome, ${username}! Redirecting...`);
                setTimeout(() => router.push('/dashboard'), 1500);
            } catch {
                setStatus('error');
                setMessage('Something went wrong. Redirecting to login...');
                setTimeout(() => router.push('/login'), 3000);
            }
        };

        processCallback();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-primary)' }}>
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4 }}
                className="text-center p-10 rounded-2xl max-w-sm w-full mx-4"
                style={{
                    background: 'var(--bg-card)',
                    boxShadow: 'var(--shadow-xl)',
                    border: '1px solid var(--border-subtle)',
                }}
            >
                {/* Logo */}
                <div className="w-14 h-14 rounded-xl flex items-center justify-center mx-auto mb-6"
                    style={{ background: 'var(--accent-sage)', opacity: 0.9 }}>
                    <MessageCircle className="w-7 h-7 text-white" />
                </div>

                {/* Status Icon */}
                <div className="mb-5">
                    {status === 'loading' && (
                        <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                            className="inline-block"
                        >
                            <Loader2 className="w-10 h-10" style={{ color: 'var(--accent-sage)' }} />
                        </motion.div>
                    )}
                    {status === 'success' && (
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: 'spring', stiffness: 300, damping: 15 }}
                        >
                            <CheckCircle2 className="w-10 h-10" style={{ color: 'var(--success)' }} />
                        </motion.div>
                    )}
                    {status === 'error' && (
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: 'spring', stiffness: 300, damping: 15 }}
                        >
                            <XCircle className="w-10 h-10" style={{ color: 'var(--error)' }} />
                        </motion.div>
                    )}
                </div>

                {/* Message */}
                <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                    {message}
                </p>

                {/* Progress bar for loading state */}
                {status === 'loading' && (
                    <div className="mt-5 h-1 rounded-full overflow-hidden" style={{ background: 'var(--bg-hover)' }}>
                        <motion.div
                            className="h-full rounded-full"
                            style={{ background: 'var(--accent-sage)' }}
                            initial={{ width: '0%' }}
                            animate={{ width: '80%' }}
                            transition={{ duration: 2, ease: 'easeInOut' }}
                        />
                    </div>
                )}
            </motion.div>
        </div>
    );
}

export default function OAuth2CallbackPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-primary)' }}>
                <Loader2 className="w-8 h-8 animate-spin" style={{ color: 'var(--accent-sage)' }} />
            </div>
        }>
            <OAuth2CallbackContent />
        </Suspense>
    );
}
