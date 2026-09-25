'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { User } from '@/lib/types';
import { authService, userService } from '@/lib/services';
import type { LoginRequest } from '@/lib/types';
import { isDemoMode, enterDemoMode, exitDemoMode } from '@/lib/demoMode';
import { DEMO_USER } from '@/lib/demoData';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

interface AuthContextType {
    user: User | null;
    token: string | null;
    isLoading: boolean;
    isDemoMode: boolean;
    login: (data: LoginRequest) => Promise<void>;
    loginDemo: () => void;
    register: (data: LoginRequest) => Promise<string>;
    loginWithOAuth2: (provider: 'google' | 'github') => void;
    handleOAuth2Callback: (token: string, username: string, userId: string) => Promise<void>;
    logout: () => void;
    refreshUser: () => Promise<void>;
    updateUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [demoMode, setDemoMode] = useState(false);

    useEffect(() => {
        // Check if demo mode is active (e.g. page refresh during demo)
        if (isDemoMode()) {
            const storedUser = localStorage.getItem('user');
            if (storedUser) {
                try {
                    setUser(JSON.parse(storedUser));
                } catch {
                    setUser(DEMO_USER);
                    localStorage.setItem('user', JSON.stringify(DEMO_USER));
                }
            } else {
                setUser(DEMO_USER);
                localStorage.setItem('user', JSON.stringify(DEMO_USER));
            }
            setToken('demo-token');
            setDemoMode(true);
            setIsLoading(false);
            return;
        }

        const storedToken = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');
        if (storedToken && storedUser) {
            setToken(storedToken);
            try {
                setUser(JSON.parse(storedUser));
            } catch { /* empty */ }
        }
        setIsLoading(false);
    }, []);

    const login = useCallback(async (data: LoginRequest) => {
        const res = await authService.login(data);
        setToken(res.token);
        setUser(res.user);
        localStorage.setItem('token', res.token);
        localStorage.setItem('user', JSON.stringify(res.user));
    }, []);

    /**
     * Demo Mode Login — bypasses backend entirely.
     * Sets a fake user and enables demo mode flag.
     */
    const loginDemo = useCallback(() => {
        enterDemoMode();
        setDemoMode(true);
        setUser(DEMO_USER);
        setToken('demo-token');
        localStorage.setItem('token', 'demo-token');
        localStorage.setItem('user', JSON.stringify(DEMO_USER));
    }, []);

    const register = useCallback(async (data: LoginRequest) => {
        return authService.register(data);
    }, []);

    // Redirect to backend OAuth2 authorization endpoint
    const loginWithOAuth2 = useCallback((provider: 'google' | 'github') => {
        window.location.href = `${API_BASE_URL}/oauth2/authorization/${provider}`;
    }, []);

    // Handle the OAuth2 callback — store JWT and fetch full user data
    const handleOAuth2Callback = useCallback(async (jwtToken: string, username: string, userId: string) => {
        // Store the token first so API calls work
        localStorage.setItem('token', jwtToken);
        setToken(jwtToken);

        try {
            // Fetch full user data from the /api/user/me endpoint
            const fullUser = await userService.getMe();
            setUser(fullUser);
            localStorage.setItem('user', JSON.stringify(fullUser));
        } catch {
            // Fallback: create a minimal user object from the URL params
            const minimalUser: User = {
                id: userId,
                userName: username,
                rooms: [],
                profilePhoto: null,
            };
            setUser(minimalUser);
            localStorage.setItem('user', JSON.stringify(minimalUser));
        }
    }, []);

    const logout = useCallback(() => {
        // Always clear demo mode on logout
        exitDemoMode();
        setDemoMode(false);
        setToken(null);
        setUser(null);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
    }, []);

    const refreshUser = useCallback(async () => {
        if (isDemoMode()) {
            // In demo mode, just return the demo user
            return;
        }
        try {
            const freshUser = await userService.getMe();
            setUser(freshUser);
            localStorage.setItem('user', JSON.stringify(freshUser));
        } catch { /* empty */ }
    }, []);

    const updateUser = useCallback((u: User) => {
        setUser(u);
        localStorage.setItem('user', JSON.stringify(u));
    }, []);

    return (
        <AuthContext.Provider value={{
            user, token, isLoading,
            isDemoMode: demoMode,
            login, loginDemo, register, loginWithOAuth2, handleOAuth2Callback,
            logout, refreshUser, updateUser
        }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used within AuthProvider');
    return context;
}
