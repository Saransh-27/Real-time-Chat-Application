import api from './api';
import type { LoginRequest, LoginResponse, User, Room, Message } from './types';
import { isDemoMode } from './demoMode';
import { DEMO_USER, DEMO_ROOMS, getDemoMessages } from './demoData';
import toast from 'react-hot-toast';

// ── Helper: block mutations in demo mode ──
function demoBlock(action: string): void {
    toast(`${action} is not available in demo mode.`, {
        icon: 'ℹ️',
    });
}

// ── Auth ──
export const authService = {
    login: async (data: LoginRequest): Promise<LoginResponse> => {
        const res = await api.post<LoginResponse>('/api/auth/login', data);
        return res.data;
    },
    register: async (data: LoginRequest): Promise<string> => {
        const res = await api.post('/api/auth/register', data);
        return res.data;
    },
};

// ── User ──
export const userService = {
    getMe: async (): Promise<User> => {
        if (isDemoMode()) {
            return DEMO_USER;
        }
        const res = await api.get<User>('/api/user/me');
        return res.data;
    },
    updateProfilePhoto: async (photoData: string): Promise<User> => {
        if (isDemoMode()) {
            demoBlock('Profile photo upload');
            return DEMO_USER;
        }
        const res = await api.put<User>('/api/user/profile-photo', { profilePhoto: photoData });
        return res.data;
    },
    updateUsername: async (newUserName: string): Promise<User> => {
        if (isDemoMode()) {
            demoBlock('Username update');
            return { ...DEMO_USER, userName: newUserName };
        }
        const res = await api.put<User>('/api/user/update-username', { newUserName });
        return res.data;
    },
    updatePassword: async (currentPassword: string, newPassword: string): Promise<string> => {
        if (isDemoMode()) {
            demoBlock('Password update');
            return 'Demo mode — update skipped';
        }
        const res = await api.put('/api/user/update-password', { currentPassword, newPassword });
        return res.data;
    },
    deleteAccount: async (): Promise<string> => {
        if (isDemoMode()) {
            demoBlock('Account deletion');
            return 'Demo mode — delete skipped';
        }
        const res = await api.delete('/api/user/delete');
        return res.data;
    },
};

// ── Rooms ──
export const roomService = {
    getRooms: async (): Promise<Room[]> => {
        if (isDemoMode()) {
            return DEMO_ROOMS;
        }
        try {
            const res = await api.get<Room[]>('/apis/v1/rooms/getrooms');
            return res.data;
        } catch (error) {
            if (isDemoMode()) return DEMO_ROOMS;
            throw error;
        }
    },
    createRoom: async (roomId: string): Promise<Room> => {
        if (isDemoMode()) {
            demoBlock('Room creation');
            return { id: `demo-${Date.now()}`, roomId, messages: [] };
        }
        const res = await api.post<Room>('/apis/v1/rooms/create', roomId, {
            headers: { 'Content-Type': 'text/plain' },
        });
        return res.data;
    },
    joinRoom: async (roomId: string): Promise<string> => {
        if (isDemoMode()) {
            demoBlock('Room join');
            return 'Demo mode — join skipped';
        }
        const res = await api.get(`/apis/v1/rooms/join/${roomId}`);
        return res.data;
    },
    leaveRoom: async (roomId: string): Promise<string> => {
        if (isDemoMode()) {
            demoBlock('Room leave');
            return 'Demo mode — leave skipped';
        }
        const res = await api.get(`/apis/v1/rooms/leave/${roomId}`);
        return res.data;
    },
    getMessages: async (roomId: string): Promise<Message[]> => {
        if (isDemoMode()) {
            return getDemoMessages(roomId);
        }
        try {
            const res = await api.get<Message[]>(`/apis/v1/rooms/${roomId}/messages`);
            return res.data;
        } catch (error) {
            if (isDemoMode()) return getDemoMessages(roomId);
            throw error;
        }
    },
};

// ── Chat (REST file upload) ──
export const chatService = {
    sendMessageWithFile: async (
        roomId: string,
        sender: string,
        content: string,
        file?: File
    ): Promise<Message> => {
        if (isDemoMode()) {
            demoBlock('File upload');
            return {
                sender,
                content: content || '(File upload not available in demo mode)',
                timestamp: new Date().toISOString(),
                senderProfilePhoto: null,
                attachmentFileName: null,
                attachmentData: null,
            };
        }
        const formData = new FormData();
        formData.append('roomId', roomId);
        formData.append('sender', sender);
        formData.append('content', content || '');
        if (file) formData.append('file', file);

        const res = await api.post<Message>('/api/v1/chat/send', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        return res.data;
    },
};
