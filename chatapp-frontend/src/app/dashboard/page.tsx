'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { roomService } from '@/lib/services';
import type { Room } from '@/lib/types';
import { motion, AnimatePresence } from 'framer-motion';
import {
    MessageCircle, Plus, LogIn, LogOut as LogOutIcon, Hash, Users, Clock,
    Search, Loader2, X, User as UserIcon, ChevronRight
} from 'lucide-react';
import Link from 'next/link';
import ThemeToggle from '@/components/ThemeToggle';
import toast from 'react-hot-toast';
import { getErrorMessage } from '@/lib/errorHandler';

export default function DashboardPage() {
    const { user, token, isLoading: authLoading, logout } = useAuth();
    const router = useRouter();
    const [rooms, setRooms] = useState<Room[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showJoinModal, setShowJoinModal] = useState(false);
    const [newRoomId, setNewRoomId] = useState('');
    const [joinRoomId, setJoinRoomId] = useState('');
    const [modalError, setModalError] = useState('');
    const [modalLoading, setModalLoading] = useState(false);

    useEffect(() => {
        if (!authLoading && !token) {
            router.replace('/login');
        }
    }, [authLoading, token, router]);

    const fetchRooms = useCallback(async () => {
        if (!token) return;
        setIsLoading(true);
        try {
            const data = await roomService.getRooms();
            setRooms((data || []).filter(Boolean));
        } catch {
            /* empty */
        } finally {
            setIsLoading(false);
        }
    }, [token]);

    useEffect(() => {
        fetchRooms();
    }, [fetchRooms]);

    const handleCreate = async () => {
        if (!newRoomId.trim()) { setModalError('Room ID is required'); return; }
        setModalError(''); setModalLoading(true);
        try {
            await roomService.createRoom(newRoomId.trim());
            await roomService.joinRoom(newRoomId.trim());
            toast.success(`Room "${newRoomId.trim()}" created successfully!`);
            setShowCreateModal(false); setNewRoomId('');
            fetchRooms();
        } catch (err: unknown) {
            const errorMsg = getErrorMessage(err, 'Failed to create room');
            setModalError(errorMsg);
            toast.error(errorMsg);
        } finally { setModalLoading(false); }
    };

    const handleJoin = async () => {
        if (!joinRoomId.trim()) { setModalError('Room ID is required'); return; }
        setModalError(''); setModalLoading(true);
        try {
            await roomService.joinRoom(joinRoomId.trim());
            toast.success(`Joined room "${joinRoomId.trim()}" successfully!`);
            setShowJoinModal(false); setJoinRoomId('');
            fetchRooms();
        } catch (err: unknown) {
            const errorMsg = getErrorMessage(err, 'Failed to join room');
            setModalError(errorMsg);
            toast.error(errorMsg);
        } finally { setModalLoading(false); }
    };

    const filteredRooms = rooms.filter(r =>
        r?.roomId?.toLowerCase().includes(search.toLowerCase())
    );

    if (authLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-primary)' }}>
                <Loader2 className="w-6 h-6 animate-spin" style={{ color: 'var(--accent-sage)' }} />
            </div>
        );
    }

    return (
        <div className="min-h-screen" style={{ background: 'var(--bg-primary)' }}>
            {/* Header */}
            <header className="sticky top-0 z-40 glass-strong" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'var(--accent-sage)' }}>
                            <MessageCircle className="w-5 h-5 text-white" />
                        </div>
                        <h1 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>ChatApp</h1>
                    </div>
                    <div className="flex items-center gap-4">
                        <ThemeToggle />
                        <Link href="/profile" className="flex items-center gap-2 px-3 py-2 rounded-xl transition-colors"
                            style={{ color: 'var(--text-secondary)' }}
                            onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
                            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                            {user?.profilePhoto ? (
                                <img src={user.profilePhoto} alt="" className="w-7 h-7 rounded-full object-cover" />
                            ) : (
                                <div className="w-7 h-7 rounded-full flex items-center justify-center"
                                    style={{ background: 'var(--accent-purple-light)', color: 'var(--accent-purple)' }}>
                                    <UserIcon className="w-3.5 h-3.5" />
                                </div>
                            )}
                            <span className="text-sm font-medium hidden sm:inline">{user?.userName}</span>
                        </Link>
                        <button onClick={logout}
                            className="p-2 rounded-xl transition-colors"
                            style={{ color: 'var(--text-tertiary)' }}
                            onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
                            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                            title="Sign out">
                            <LogOutIcon className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </header>

            {/* Main */}
            <main className="max-w-6xl mx-auto px-6 py-8">
                {/* Welcome & Actions */}
                <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                    className="mb-8"
                >
                    <h2 className="text-2xl font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>
                        Welcome, {user?.userName}
                    </h2>
                    <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>
                        {rooms.length} room{rooms.length !== 1 ? 's' : ''} joined
                    </p>
                </motion.div>

                {/* Action buttons */}
                <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.1 }}
                    className="flex flex-wrap gap-3 mb-8"
                >
                    <button
                        id="create-room-btn"
                        onClick={() => { setShowCreateModal(true); setModalError(''); }}
                        className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium text-white transition-all"
                        style={{ background: 'var(--accent-sage)', boxShadow: '0 2px 8px rgba(124,154,130,0.25)' }}
                    >
                        <Plus className="w-4 h-4" /> Create Room
                    </button>
                    <button
                        id="join-room-btn"
                        onClick={() => { setShowJoinModal(true); setModalError(''); }}
                        className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all"
                        style={{
                            background: 'var(--bg-card)',
                            border: '1px solid var(--border-subtle)',
                            color: 'var(--text-primary)',
                            boxShadow: 'var(--shadow-sm)',
                        }}
                    >
                        <LogIn className="w-4 h-4" /> Join Room
                    </button>
                </motion.div>

                {/* Search */}
                <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.15 }}
                    className="mb-6"
                >
                    <div className="relative max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--text-tertiary)' }} />
                        <input
                            id="search-rooms"
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search rooms..."
                            className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm transition-all duration-200"
                            style={{
                                background: 'var(--bg-card)',
                                border: '1px solid var(--border-subtle)',
                                color: 'var(--text-primary)',
                            }}
                        />
                    </div>
                </motion.div>

                {/* Room Grid */}
                {isLoading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="skeleton h-32 rounded-2xl" />
                        ))}
                    </div>
                ) : filteredRooms.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-center py-20"
                    >
                        <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
                            style={{ background: 'var(--bg-hover)' }}>
                            <Hash className="w-7 h-7" style={{ color: 'var(--text-tertiary)' }} />
                        </div>
                        <h3 className="text-lg font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                            {search ? 'No rooms match your search' : 'No rooms yet'}
                        </h3>
                        <p className="text-sm max-w-sm mx-auto" style={{ color: 'var(--text-tertiary)' }}>
                            {search ? 'Try a different search term' : 'Create a new room or join an existing one to start chatting'}
                        </p>
                    </motion.div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {filteredRooms.map((room, idx) => (
                            <motion.div
                                key={room.id}
                                initial={{ opacity: 0, y: 16 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.3, delay: idx * 0.05 }}
                            >
                                <Link href={`/chat/${room.roomId}`}
                                    className="block p-5 rounded-2xl transition-all duration-200 group"
                                    style={{
                                        background: 'var(--bg-card)',
                                        border: '1px solid var(--border-subtle)',
                                        boxShadow: 'var(--shadow-sm)',
                                    }}
                                    onMouseEnter={e => {
                                        e.currentTarget.style.boxShadow = 'var(--shadow-md)';
                                        e.currentTarget.style.borderColor = 'var(--accent-sage-light)';
                                        e.currentTarget.style.transform = 'translateY(-2px)';
                                    }}
                                    onMouseLeave={e => {
                                        e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
                                        e.currentTarget.style.borderColor = 'var(--border-subtle)';
                                        e.currentTarget.style.transform = 'translateY(0)';
                                    }}>
                                    <div className="flex items-start justify-between mb-3">
                                        <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                                            style={{ background: `${['var(--accent-sage)', 'var(--accent-coral)', 'var(--accent-purple)', 'var(--accent-gold)'][idx % 4]}20` }}>
                                            <Hash className="w-5 h-5" style={{ color: ['var(--accent-sage)', 'var(--accent-coral)', 'var(--accent-purple)', 'var(--accent-gold)'][idx % 4] }} />
                                        </div>
                                        <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: 'var(--text-tertiary)' }} />
                                    </div>
                                    <h3 className="text-base font-semibold mb-1 truncate" style={{ color: 'var(--text-primary)' }}>
                                        {room.roomId}
                                    </h3>
                                    <div className="flex items-center gap-3 text-xs" style={{ color: 'var(--text-tertiary)' }}>
                                        <span className="flex items-center gap-1">
                                            <Users className="w-3 h-3" /> Room
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <Clock className="w-3 h-3" /> {room.messages?.length || 0} messages
                                        </span>
                                    </div>
                                </Link>
                            </motion.div>
                        ))}
                    </div>
                )}
            </main>

            {/* Create Room Modal */}
            <AnimatePresence>
                {showCreateModal && (
                    <Modal
                        title="Create a new room"
                        onClose={() => setShowCreateModal(false)}
                        accent="var(--accent-sage)"
                    >
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>Room ID</label>
                                <input
                                    id="create-room-input"
                                    type="text"
                                    value={newRoomId}
                                    onChange={e => setNewRoomId(e.target.value)}
                                    onKeyDown={e => e.key === 'Enter' && handleCreate()}
                                    placeholder="e.g. team-general"
                                    autoFocus
                                    className="w-full px-4 py-3 rounded-xl text-sm transition-all duration-200"
                                    style={{ background: 'var(--bg-input)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)' }}
                                />
                            </div>
                            {modalError && <div className="text-sm px-3 py-2 rounded-lg" style={{ color: 'var(--error)', background: 'rgba(199,92,92,0.08)' }}>{modalError}</div>}
                            <button id="create-room-submit" onClick={handleCreate} disabled={modalLoading}
                                className="w-full py-3 rounded-xl text-sm font-medium text-white flex items-center justify-center gap-2 disabled:opacity-60"
                                style={{ background: 'var(--accent-sage)' }}>
                                {modalLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Plus className="w-4 h-4" /> Create Room</>}
                            </button>
                        </div>
                    </Modal>
                )}
            </AnimatePresence>

            {/* Join Room Modal */}
            <AnimatePresence>
                {showJoinModal && (
                    <Modal
                        title="Join an existing room"
                        onClose={() => setShowJoinModal(false)}
                        accent="var(--accent-purple)"
                    >
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>Room ID</label>
                                <input
                                    id="join-room-input"
                                    type="text"
                                    value={joinRoomId}
                                    onChange={e => setJoinRoomId(e.target.value)}
                                    onKeyDown={e => e.key === 'Enter' && handleJoin()}
                                    placeholder="Enter room ID to join"
                                    autoFocus
                                    className="w-full px-4 py-3 rounded-xl text-sm transition-all duration-200"
                                    style={{ background: 'var(--bg-input)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)' }}
                                />
                            </div>
                            {modalError && <div className="text-sm px-3 py-2 rounded-lg" style={{ color: 'var(--error)', background: 'rgba(199,92,92,0.08)' }}>{modalError}</div>}
                            <button id="join-room-submit" onClick={handleJoin} disabled={modalLoading}
                                className="w-full py-3 rounded-xl text-sm font-medium text-white flex items-center justify-center gap-2 disabled:opacity-60"
                                style={{ background: 'var(--accent-purple)' }}>
                                {modalLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><LogIn className="w-4 h-4" /> Join Room</>}
                            </button>
                        </div>
                    </Modal>
                )}
            </AnimatePresence>
        </div>
    );
}

// ── Modal Component ──
function Modal({ title, children, onClose, accent }: {
    title: string; children: React.ReactNode; onClose: () => void; accent: string;
}) {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center px-4"
            style={{ background: 'rgba(0,0,0,0.2)', backdropFilter: 'blur(4px)' }}
            onClick={onClose}
        >
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 8 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 8 }}
                transition={{ duration: 0.2 }}
                className="w-full max-w-md p-6 rounded-2xl"
                style={{ background: 'var(--bg-card)', boxShadow: 'var(--shadow-xl)', border: '1px solid var(--border-subtle)' }}
                onClick={e => e.stopPropagation()}
            >
                <div className="flex items-center justify-between mb-5">
                    <h3 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>{title}</h3>
                    <button onClick={onClose} className="p-1.5 rounded-lg transition-colors" style={{ color: 'var(--text-tertiary)' }}
                        onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                        <X className="w-4 h-4" />
                    </button>
                </div>
                {children}
            </motion.div>
        </motion.div>
    );
}
