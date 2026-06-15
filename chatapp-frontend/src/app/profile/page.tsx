'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { userService } from '@/lib/services';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ArrowLeft, Camera, User as UserIcon, Save, Loader2, CheckCircle2,
    MessageCircle, Shield, Trash2, Key, Edit2, X, AlertTriangle
} from 'lucide-react';
import Link from 'next/link';
import ThemeToggle from '@/components/ThemeToggle';

export default function ProfilePage() {
    const { user, token, isLoading: authLoading, updateUser, logout } = useAuth();
    const router = useRouter();
    const [isUploading, setIsUploading] = useState(false);
    const [success, setSuccess] = useState('');
    const [error, setError] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Update Username State
    const [showUserModal, setShowUserModal] = useState(false);
    const [newUserName, setNewUserName] = useState('');
    const [userModalLoading, setUserModalLoading] = useState(false);

    // Change Password State
    const [showPassModal, setShowPassModal] = useState(false);
    const [passData, setPassData] = useState({ current: '', new: '', confirm: '' });
    const [passModalLoading, setPassModalLoading] = useState(false);

    // Delete Account State
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleteModalLoading, setDeleteModalLoading] = useState(false);

    if (!authLoading && !token) {
        router.replace('/login');
        return null;
    }

    const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.size > 2 * 1024 * 1024) {
            setError('Image must be under 2MB');
            return;
        }

        setIsUploading(true);
        setError('');
        setSuccess('');

        try {
            const reader = new FileReader();
            reader.onload = async () => {
                const dataUrl = reader.result as string;
                try {
                    const updatedUser = await userService.updateProfilePhoto(dataUrl);
                    updateUser(updatedUser);
                    setSuccess('Profile photo updated!');
                    setTimeout(() => setSuccess(''), 3000);
                } catch {
                    setError('Failed to upload photo');
                } finally {
                    setIsUploading(false);
                }
            };
            reader.readAsDataURL(file);
        } catch {
            setError('Failed to read file');
            setIsUploading(false);
        }
    };

    const handleUpdateUsername = async () => {
        if (!newUserName.trim()) return;
        setUserModalLoading(true);
        setError('');
        try {
            const updatedUser = await userService.updateUsername(newUserName.trim());
            updateUser(updatedUser);
            setShowUserModal(false);
            setSuccess('Username updated successfully!');
            setTimeout(() => setSuccess(''), 3000);
        } catch (err: any) {
            setError(err.response?.data || 'Failed to update username');
        } finally {
            setUserModalLoading(false);
        }
    };

    const handleChangePassword = async () => {
        if (passData.new !== passData.confirm) {
            setError('Passwords do not match');
            return;
        }
        setPassModalLoading(true);
        setError('');
        try {
            await userService.updatePassword(passData.current, passData.new);
            setShowPassModal(false);
            setPassData({ current: '', new: '', confirm: '' });
            setSuccess('Password changed successfully!');
            setTimeout(() => setSuccess(''), 3000);
        } catch (err: any) {
            setError(err.response?.data || 'Failed to change password');
        } finally {
            setPassModalLoading(false);
        }
    };

    const handleDeleteAccount = async () => {
        setDeleteModalLoading(true);
        try {
            await userService.deleteAccount();
            logout();
            router.push('/login');
        } catch (err: any) {
            setError(err.response?.data || 'Failed to delete account');
            setShowDeleteModal(false);
        } finally {
            setDeleteModalLoading(false);
        }
    };

    if (authLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-primary)' }}>
                <Loader2 className="w-6 h-6 animate-spin" style={{ color: 'var(--accent-sage)' }} />
            </div>
        );
    }

    return (
        <div className="min-h-screen pb-20" style={{ background: 'var(--bg-primary)' }}>
            {/* Header */}
            <header className="sticky top-0 z-40 glass-strong" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                <div className="max-w-2xl mx-auto px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Link href="/dashboard" className="p-2 rounded-xl transition-colors" style={{ color: 'var(--text-secondary)' }}
                            onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
                            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                            <ArrowLeft className="w-5 h-5" />
                        </Link>
                        <h1 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>Settings</h1>
                    </div>
                    <ThemeToggle />
                </div>
            </header>

            <main className="max-w-2xl mx-auto px-6 py-10">
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                    className="space-y-6"
                >
                    {/* Profile Card */}
                    <section className="rounded-2xl p-8 text-center"
                        style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', boxShadow: 'var(--shadow-md)' }}>
                        <div className="relative inline-block mb-6">
                            <div className="w-28 h-28 rounded-full overflow-hidden mx-auto"
                                style={{ background: 'var(--bg-hover)', border: '3px solid var(--border-subtle)' }}>
                                {user?.profilePhoto ? (
                                    <img src={user.profilePhoto} alt="Profile" className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center"
                                        style={{ background: 'linear-gradient(135deg, var(--accent-sage-light), var(--accent-purple-light))' }}>
                                        <UserIcon className="w-12 h-12 text-white" />
                                    </div>
                                )}
                            </div>
                            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
                            <button
                                id="upload-photo-btn"
                                onClick={() => fileInputRef.current?.click()}
                                disabled={isUploading}
                                className="absolute bottom-0 right-0 w-9 h-9 rounded-full flex items-center justify-center text-white transition-all"
                                style={{ background: 'var(--accent-sage)', boxShadow: 'var(--shadow-md)', border: '2px solid var(--bg-card)' }}
                            >
                                {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Camera className="w-4 h-4" />}
                            </button>
                        </div>

                        <h2 className="text-xl font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>
                            {user?.userName}
                        </h2>
                        <p className="text-sm mb-6" style={{ color: 'var(--text-tertiary)' }}>
                            Active participant in {user?.rooms?.length || 0} rooms
                        </p>

                        <div className="flex justify-center gap-3">
                            <button
                                onClick={() => { setShowUserModal(true); setNewUserName(user?.userName || ''); }}
                                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all"
                                style={{ background: 'var(--bg-hover)', color: 'var(--text-primary)', border: '1px solid var(--border-subtle)' }}
                            >
                                <Edit2 className="w-4 h-4" /> Edit Username
                            </button>
                        </div>

                        {success && (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-4 flex items-center justify-center gap-2 text-sm" style={{ color: 'var(--success)' }}>
                                <CheckCircle2 className="w-4 h-4" /> {success}
                            </motion.div>
                        )}
                        {error && (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-4 px-4 py-2 rounded-xl text-sm" style={{ color: 'var(--error)', background: 'rgba(199,92,92,0.08)' }}>
                                {error}
                            </motion.div>
                        )}
                    </section>

                    {/* Security Section */}
                    <section className="rounded-2xl overflow-hidden"
                        style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)' }}>
                        <div className="px-6 py-4 border-b flex items-center gap-2" style={{ borderColor: 'var(--border-subtle)' }}>
                            <Shield className="w-4 h-4" style={{ color: 'var(--accent-purple)' }} />
                            <h3 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Security & Privacy</h3>
                        </div>
                        <div className="p-2">
                            <button
                                onClick={() => setShowPassModal(true)}
                                className="w-full flex items-center justify-between p-4 rounded-xl hover:bg-[var(--bg-hover)] transition-colors group text-left"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(139,126,200,0.1)' }}>
                                        <Key className="w-5 h-5" style={{ color: 'var(--accent-purple)' }} />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>Change Password</p>
                                        <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>Keep your account secure</p>
                                    </div>
                                </div>
                                <Edit2 className="w-4 h-4 opacity-0 group-hover:opacity-60 transition-opacity" />
                            </button>

                            <button
                                onClick={() => setShowDeleteModal(true)}
                                className="w-full flex items-center justify-between p-4 rounded-xl hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors group text-left"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(199,92,92,0.1)' }}>
                                        <Trash2 className="w-5 h-5" style={{ color: 'var(--error)' }} />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium" style={{ color: 'var(--error)' }}>Delete Account</p>
                                        <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>This action is permanent</p>
                                    </div>
                                </div>
                            </button>
                        </div>
                    </section>
                </motion.div>
            </main>

            {/* Username Modal */}
            <AnimatePresence>
                {showUserModal && (
                    <Modal title="Edit Username" onClose={() => setShowUserModal(false)} accent="var(--accent-sage)">
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-semibold mb-2 ml-1" style={{ color: 'var(--text-tertiary)' }}>NEW USERNAME</label>
                                <input
                                    type="text"
                                    value={newUserName}
                                    onChange={e => setNewUserName(e.target.value)}
                                    placeholder="Enter new username"
                                    className="w-full px-4 py-3 rounded-xl text-sm"
                                    style={{ background: 'var(--bg-input)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)' }}
                                />
                            </div>
                            <button onClick={handleUpdateUsername} disabled={userModalLoading}
                                className="w-full py-3 rounded-xl text-sm font-medium text-white flex items-center justify-center gap-2"
                                style={{ background: 'var(--accent-sage)' }}>
                                {userModalLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save Changes'}
                            </button>
                        </div>
                    </Modal>
                )}
            </AnimatePresence>

            {/* Password Modal */}
            <AnimatePresence>
                {showPassModal && (
                    <Modal title="Change Password" onClose={() => setShowPassModal(false)} accent="var(--accent-purple)">
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-semibold mb-1.5 ml-1" style={{ color: 'var(--text-tertiary)' }}>CURRENT PASSWORD</label>
                                <input
                                    type="password"
                                    value={passData.current}
                                    onChange={e => setPassData({ ...passData, current: e.target.value })}
                                    className="w-full px-4 py-3 rounded-xl text-sm"
                                    style={{ background: 'var(--bg-input)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)' }}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold mb-1.5 ml-1" style={{ color: 'var(--text-tertiary)' }}>NEW PASSWORD</label>
                                <input
                                    type="password"
                                    value={passData.new}
                                    onChange={e => setPassData({ ...passData, new: e.target.value })}
                                    className="w-full px-4 py-3 rounded-xl text-sm"
                                    style={{ background: 'var(--bg-input)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)' }}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold mb-1.5 ml-1" style={{ color: 'var(--text-tertiary)' }}>CONFIRM NEW PASSWORD</label>
                                <input
                                    type="password"
                                    value={passData.confirm}
                                    onChange={e => setPassData({ ...passData, confirm: e.target.value })}
                                    className="w-full px-4 py-3 rounded-xl text-sm"
                                    style={{ background: 'var(--bg-input)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)' }}
                                />
                            </div>
                            <button onClick={handleChangePassword} disabled={passModalLoading}
                                className="w-full py-3 rounded-xl text-sm font-medium text-white flex items-center justify-center gap-2"
                                style={{ background: 'var(--accent-purple)' }}>
                                {passModalLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Update Password'}
                            </button>
                        </div>
                    </Modal>
                )}
            </AnimatePresence>

            {/* Delete Modal */}
            <AnimatePresence>
                {showDeleteModal && (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center px-4"
                        style={{ background: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(4px)' }}
                        onClick={() => setShowDeleteModal(false)}
                    >
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
                            className="w-full max-w-sm p-8 rounded-2xl text-center"
                            style={{ background: 'var(--bg-card)', boxShadow: 'var(--shadow-xl)', border: '1px solid var(--border-subtle)' }}
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6"
                                style={{ background: 'rgba(199,92,92,0.1)' }}>
                                <AlertTriangle className="w-8 h-8" style={{ color: 'var(--error)' }} />
                            </div>
                            <h3 className="text-xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>Delete Account?</h3>
                            <p className="text-sm mb-8" style={{ color: 'var(--text-tertiary)' }}>
                                This action is permanent and cannot be undone. All your message history and room memberships will be lost.
                            </p>
                            <div className="flex gap-4">
                                <button onClick={() => setShowDeleteModal(false)}
                                    className="flex-1 py-3 rounded-xl text-sm font-bold transition-all"
                                    style={{ background: 'var(--bg-hover)', color: 'var(--text-primary)' }}>
                                    Cancel
                                </button>
                                <button onClick={handleDeleteAccount} disabled={deleteModalLoading}
                                    className="flex-1 py-3 rounded-xl text-sm font-bold text-white transition-all"
                                    style={{ background: 'var(--error)' }}>
                                    {deleteModalLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Delete'}
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

function Modal({ title, children, onClose, accent }: { title: string; children: React.ReactNode; onClose: () => void; accent: string; }) {
    return (
        <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center px-4"
            style={{ background: 'rgba(0,0,0,0.2)', backdropFilter: 'blur(4px)' }}
            onClick={onClose}
        >
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 10 }}
                className="w-full max-w-sm p-6 rounded-2xl"
                style={{ background: 'var(--bg-card)', boxShadow: 'var(--shadow-xl)', border: '1px solid var(--border-subtle)' }}
                onClick={e => e.stopPropagation()}
            >
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>{title}</h3>
                    <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-[var(--bg-hover)] transition-colors">
                        <X className="w-4 h-4" style={{ color: 'var(--text-tertiary)' }} />
                    </button>
                </div>
                {children}
            </motion.div>
        </motion.div>
    );
}
