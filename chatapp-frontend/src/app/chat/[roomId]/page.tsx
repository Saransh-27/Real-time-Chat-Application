'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useWebSocket } from '@/hooks/useWebSocket';
import { roomService, chatService } from '@/lib/services';
import type { Message } from '@/lib/types';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ArrowLeft, Send, Paperclip, X, Hash, Wifi, WifiOff,
    Download, FileText, Image as ImageIcon, Loader2, LogOut as LogOutIcon,
    User as UserIcon
} from 'lucide-react';
import Link from 'next/link';
import ThemeToggle from '@/components/ThemeToggle';

export default function ChatRoomPage() {
    const params = useParams();
    const roomId = params.roomId as string;
    const router = useRouter();
    const { user, token, isLoading: authLoading } = useAuth();
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [file, setFile] = useState<File | null>(null);
    const [isSending, setIsSending] = useState(false);
    const [isLoadingMessages, setIsLoadingMessages] = useState(true);
    const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        if (!authLoading && !token) router.replace('/login');
    }, [authLoading, token, router]);

    // Fetch existing messages
    useEffect(() => {
        if (!token || !roomId) return;
        setIsLoadingMessages(true);
        roomService.getMessages(roomId)
            .then(data => setMessages(Array.isArray(data) ? data : []))
            .catch(() => { })
            .finally(() => setIsLoadingMessages(false));
    }, [token, roomId]);

    // WebSocket handler
    const handleNewMessage = useCallback((msg: Message) => {
        setMessages(prev => {
            // Prevent duplicates
            if (prev.some(m => m.timestamp === msg.timestamp && m.sender === msg.sender && m.content === msg.content)) {
                return prev;
            }
            return [...prev, msg];
        });
    }, []);

    const { connected, sendMessage: wsSendMessage } = useWebSocket({
        roomId,
        onMessage: handleNewMessage,
    });

    // Auto-scroll
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Auto-resize textarea
    const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setInput(e.target.value);
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 120) + 'px';
        }
    };

    const handleSend = async () => {
        if ((!input.trim() && !file) || !user) return;
        setIsSending(true);

        try {
            if (file) {
                // Use REST endpoint for file upload
                const msg = await chatService.sendMessageWithFile(roomId, user.userName, input.trim(), file);
                setMessages(prev => [...prev, msg]);
            } else {
                // Use WebSocket for text-only
                wsSendMessage(user.userName, input.trim(), user.profilePhoto);
            }
            setInput('');
            setFile(null);
            if (textareaRef.current) textareaRef.current.style.height = 'auto';
        } catch {
            /* empty */
        } finally {
            setIsSending(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const handleLeave = async () => {
        try {
            await roomService.leaveRoom(roomId);
            router.push('/dashboard');
        } catch { /* empty */ }
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const f = e.target.files?.[0];
        if (f) setFile(f);
    };

    const formatTime = (ts: string) => {
        try {
            const d = new Date(ts);
            return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        } catch { return ''; }
    };

    const isImage = (filename: string | null | undefined) => {
        if (!filename) return false;
        return /\.(jpg|jpeg|png|gif|webp|svg|bmp)$/i.test(filename);
    };

    if (authLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-primary)' }}>
                <Loader2 className="w-6 h-6 animate-spin" style={{ color: 'var(--accent-sage)' }} />
            </div>
        );
    }

    return (
        <div className="h-screen flex flex-col" style={{ background: 'var(--bg-primary)' }}>
            {/* Header */}
            <header className="flex-shrink-0 glass-strong z-30" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                <div className="px-4 sm:px-6 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Link href="/dashboard" className="p-2 rounded-xl transition-colors" style={{ color: 'var(--text-secondary)' }}
                            onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
                            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                            <ArrowLeft className="w-5 h-5" />
                        </Link>
                        <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                            style={{ background: 'var(--accent-sage)', opacity: 0.15 }}>
                        </div>
                        <div className="-ml-9">
                            <div className="w-9 h-9 rounded-xl flex items-center justify-center">
                                <Hash className="w-5 h-5" style={{ color: 'var(--accent-sage)' }} />
                            </div>
                        </div>
                        <div>
                            <h2 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{roomId}</h2>
                            <div className="flex items-center gap-1.5">
                                <span className={`connection-dot ${connected ? 'connected' : 'disconnected'}`} />
                                <span className="text-xs" style={{ color: connected ? 'var(--success)' : 'var(--error)' }}>
                                    {connected ? 'Connected' : 'Reconnecting...'}
                                </span>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <ThemeToggle />
                        <button
                            id="leave-room-btn"
                            onClick={() => setShowLeaveConfirm(true)}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-colors"
                            style={{ color: 'var(--error)', border: '1px solid rgba(199,92,92,0.2)' }}
                            onMouseEnter={e => e.currentTarget.style.background = 'rgba(199,92,92,0.06)'}
                            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                            <LogOutIcon className="w-3.5 h-3.5" /> Leave
                        </button>
                    </div>
                </div>
            </header>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4">
                {isLoadingMessages ? (
                    <div className="space-y-4">
                        {[1, 2, 3].map(i => <div key={i} className="skeleton h-16 rounded-2xl" />)}
                    </div>
                ) : messages.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center">
                        <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
                            style={{ background: 'var(--bg-hover)' }}>
                            <Hash className="w-7 h-7" style={{ color: 'var(--text-tertiary)' }} />
                        </div>
                        <h3 className="text-lg font-medium mb-1" style={{ color: 'var(--text-primary)' }}>
                            Welcome to #{roomId}
                        </h3>
                        <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>
                            Be the first to send a message!
                        </p>
                    </div>
                ) : (
                    <div className="max-w-3xl mx-auto space-y-1">
                        {messages.map((msg, idx) => {
                            const isOwn = msg.sender === user?.userName;
                            const showAvatar = idx === 0 || messages[idx - 1].sender !== msg.sender;
                            return (
                                <motion.div
                                    key={`${msg.timestamp}-${idx}`}
                                    initial={{ opacity: 0, y: 8 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.2 }}
                                    className={`flex ${isOwn ? 'justify-end' : 'justify-start'} ${showAvatar ? 'mt-4' : 'mt-0.5'}`}
                                >
                                    <div className={`flex ${isOwn ? 'flex-row-reverse' : 'flex-row'} gap-2 max-w-[80%]`}>
                                        {/* Avatar */}
                                        {showAvatar ? (
                                            <div className="flex-shrink-0 mt-1">
                                                {msg.senderProfilePhoto ? (
                                                    <img src={msg.senderProfilePhoto} alt="" className="w-8 h-8 rounded-full object-cover" />
                                                ) : (
                                                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium"
                                                        style={{
                                                            background: isOwn ? 'var(--accent-sage-light)' : 'var(--accent-purple-light)',
                                                            color: isOwn ? 'var(--accent-sage-dark)' : 'var(--accent-purple)',
                                                        }}>
                                                        {msg.sender?.[0]?.toUpperCase() || <UserIcon className="w-3.5 h-3.5" />}
                                                    </div>
                                                )}
                                            </div>
                                        ) : (
                                            <div className="w-8 flex-shrink-0" />
                                        )}

                                        <div>
                                            {showAvatar && (
                                                <div className={`flex items-center gap-2 mb-1 ${isOwn ? 'justify-end' : ''}`}>
                                                    <span className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>
                                                        {isOwn ? 'You' : msg.sender}
                                                    </span>
                                                    <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                                                        {formatTime(msg.timestamp)}
                                                    </span>
                                                </div>
                                            )}
                                            <div className="rounded-2xl px-4 py-2.5"
                                                style={{
                                                    background: isOwn ? 'var(--accent-sage)' : 'var(--bg-card)',
                                                    color: isOwn ? 'white' : 'var(--text-primary)',
                                                    border: isOwn ? 'none' : '1px solid var(--border-subtle)',
                                                    borderTopRightRadius: isOwn && !showAvatar ? '8px' : undefined,
                                                    borderTopLeftRadius: !isOwn && !showAvatar ? '8px' : undefined,
                                                }}>
                                                {msg.content && (
                                                    <p className="text-sm whitespace-pre-wrap break-words leading-relaxed">{msg.content}</p>
                                                )}
                                                {/* File attachment */}
                                                {msg.attachmentData && (
                                                    <div className="mt-2">
                                                        {isImage(msg.attachmentFileName) ? (
                                                            <img
                                                                src={msg.attachmentData}
                                                                alt={msg.attachmentFileName || 'Image'}
                                                                className="max-w-full rounded-xl max-h-64 object-cover"
                                                            />
                                                        ) : (
                                                            <a
                                                                href={msg.attachmentData}
                                                                download={msg.attachmentFileName || 'file'}
                                                                className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs transition-colors"
                                                                style={{
                                                                    background: isOwn ? 'rgba(255,255,255,0.15)' : 'var(--bg-hover)',
                                                                    color: isOwn ? 'white' : 'var(--text-primary)',
                                                                }}>
                                                                <FileText className="w-4 h-4" />
                                                                <span className="truncate max-w-[150px]">{msg.attachmentFileName}</span>
                                                                <Download className="w-3.5 h-3.5 ml-auto" />
                                                            </a>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}
                        <div ref={messagesEndRef} />
                    </div>
                )}
            </div>

            {/* Composer */}
            <div className="flex-shrink-0 px-4 sm:px-6 pb-4 pt-2">
                <div className="max-w-3xl mx-auto">
                    {/* File preview */}
                    <AnimatePresence>
                        {file && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="mb-2 flex items-center gap-2 px-4 py-2.5 rounded-xl"
                                style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)' }}
                            >
                                {file.type.startsWith('image/') ? (
                                    <ImageIcon className="w-4 h-4 flex-shrink-0" style={{ color: 'var(--accent-coral)' }} />
                                ) : (
                                    <FileText className="w-4 h-4 flex-shrink-0" style={{ color: 'var(--accent-purple)' }} />
                                )}
                                <span className="text-sm truncate flex-1" style={{ color: 'var(--text-primary)' }}>{file.name}</span>
                                <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                                    {(file.size / 1024).toFixed(1)}KB
                                </span>
                                <button onClick={() => setFile(null)} className="p-1 rounded-lg transition-colors"
                                    style={{ color: 'var(--text-tertiary)' }}
                                    onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
                                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                                    <X className="w-3.5 h-3.5" />
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <div className="flex items-end gap-2 p-2 rounded-2xl"
                        style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', boxShadow: 'var(--shadow-md)' }}>
                        <input
                            ref={fileInputRef}
                            type="file"
                            className="hidden"
                            onChange={handleFileSelect}
                        />
                        <button
                            id="attach-file-btn"
                            onClick={() => fileInputRef.current?.click()}
                            className="p-2.5 rounded-xl flex-shrink-0 transition-colors"
                            style={{ color: 'var(--text-tertiary)' }}
                            onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
                            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                            title="Attach file"
                        >
                            <Paperclip className="w-5 h-5" />
                        </button>

                        <textarea
                            ref={textareaRef}
                            id="message-input"
                            value={input}
                            onChange={handleInputChange}
                            onKeyDown={handleKeyDown}
                            placeholder="Write a message..."
                            rows={1}
                            className="flex-1 resize-none text-sm py-2.5 px-2 bg-transparent border-none outline-none"
                            style={{ color: 'var(--text-primary)', maxHeight: '120px' }}
                        />

                        <motion.button
                            id="send-message-btn"
                            onClick={handleSend}
                            disabled={(!input.trim() && !file) || isSending}
                            whileTap={{ scale: 0.92 }}
                            className="p-2.5 rounded-xl flex-shrink-0 text-white transition-all duration-200 disabled:opacity-40"
                            style={{
                                background: (input.trim() || file) ? 'var(--accent-sage)' : 'var(--bg-hover)',
                                color: (input.trim() || file) ? 'white' : 'var(--text-tertiary)',
                            }}
                        >
                            {isSending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                        </motion.button>
                    </div>
                </div>
            </div>

            {/* Leave Confirm Modal */}
            <AnimatePresence>
                {showLeaveConfirm && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center px-4"
                        style={{ background: 'rgba(0,0,0,0.2)', backdropFilter: 'blur(4px)' }}
                        onClick={() => setShowLeaveConfirm(false)}
                    >
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="w-full max-w-sm p-6 rounded-2xl text-center"
                            style={{ background: 'var(--bg-card)', boxShadow: 'var(--shadow-xl)', border: '1px solid var(--border-subtle)' }}
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-4"
                                style={{ background: 'rgba(199,92,92,0.08)' }}>
                                <LogOutIcon className="w-6 h-6" style={{ color: 'var(--error)' }} />
                            </div>
                            <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>Leave room?</h3>
                            <p className="text-sm mb-6" style={{ color: 'var(--text-tertiary)' }}>
                                You&apos;ll be removed from <strong>#{roomId}</strong>. You can rejoin anytime.
                            </p>
                            <div className="flex gap-3">
                                <button onClick={() => setShowLeaveConfirm(false)}
                                    className="flex-1 py-2.5 rounded-xl text-sm font-medium transition-colors"
                                    style={{ background: 'var(--bg-hover)', color: 'var(--text-primary)' }}>
                                    Cancel
                                </button>
                                <button id="confirm-leave-btn" onClick={handleLeave}
                                    className="flex-1 py-2.5 rounded-xl text-sm font-medium text-white transition-colors"
                                    style={{ background: 'var(--error)' }}>
                                    Leave Room
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
