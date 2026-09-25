'use client';

import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Eye, ExternalLink, X } from 'lucide-react';

const GITHUB_REPO_URL = 'https://github.com/Saransh-27/Real-time-Chat-Application';

export default function DemoBanner() {
    const { isDemoMode, logout } = useAuth();
    const router = useRouter();

    if (!isDemoMode) return null;

    const handleExitDemo = () => {
        logout();
        router.push('/login');
    };

    return (
        <div
            className="relative z-50 w-full backdrop-blur-sm"
            style={{
                background: 'linear-gradient(90deg, rgba(124,154,130,0.15) 0%, rgba(139,115,175,0.15) 50%, rgba(124,154,130,0.15) 100%)',
                borderBottom: '1px solid rgba(124,154,130,0.3)',
            }}
        >
            <div className="max-w-7xl mx-auto px-4 py-2.5 flex items-center justify-between gap-3 flex-wrap">
                {/* Left: Info */}
                <div className="flex items-center gap-2.5 min-w-0">
                    <div
                        className="flex items-center gap-1.5 px-2.5 py-1 rounded-full shrink-0"
                        style={{ background: 'var(--accent-sage)', color: 'white' }}
                    >
                        <Eye className="w-3.5 h-3.5" />
                        <span className="text-[10px] font-black uppercase tracking-wider">Demo Mode</span>
                    </div>
                    <p className="text-xs font-medium truncate" style={{ color: 'var(--text-tertiary)' }}>
                        Viewing with sample data — backend services are offline.
                    </p>
                </div>

                {/* Right: Actions */}
                <div className="flex items-center gap-2 shrink-0">
                    <a
                        href={GITHUB_REPO_URL}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all"
                        style={{
                            background: 'var(--bg-card)',
                            border: '1px solid var(--border-subtle)',
                            color: 'var(--text-secondary)',
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.borderColor = 'var(--accent-sage)';
                            e.currentTarget.style.color = 'var(--text-primary)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.borderColor = 'var(--border-subtle)';
                            e.currentTarget.style.color = 'var(--text-secondary)';
                        }}
                    >
                        <ExternalLink className="w-3.5 h-3.5" style={{ color: 'var(--accent-sage)' }} />
                        View Source Code
                    </a>
                    <button
                        onClick={handleExitDemo}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all"
                        style={{ color: 'var(--text-tertiary)' }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.background = 'var(--bg-hover)';
                            e.currentTarget.style.color = 'var(--text-primary)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'transparent';
                            e.currentTarget.style.color = 'var(--text-tertiary)';
                        }}
                    >
                        <X className="w-3.5 h-3.5" />
                        Exit Demo
                    </button>
                </div>
            </div>
        </div>
    );
}
