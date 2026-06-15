'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { User } from '@/lib/types';
import { authService, userService } from '@/lib/services';
import type { LoginRequest } from '@/lib/types';

interface AuthContextType {
    user: User | null;
    token: string | null;
    isLoading: boolean;
    login: (data: LoginRequest) => Promise<void>;
    register: (data: LoginRequest) => Promise<string>;
    logout: () => void;
    refreshUser: () => Promise<void>;
    updateUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
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

    const register = useCallback(async (data: LoginRequest) => {
        return authService.register(data);
    }, []);

    const logout = useCallback(() => {
        setToken(null);
        setUser(null);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
    }, []);

    const refreshUser = useCallback(async () => {
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
        <AuthContext.Provider value={{ user, token, isLoading, login, register, logout, refreshUser, updateUser }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used within AuthProvider');
    return context;
}
