import api from './api';
import type { LoginRequest, LoginResponse, User, Room, Message } from './types';

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
        const res = await api.get<User>('/api/user/me');
        return res.data;
    },
    updateProfilePhoto: async (photoData: string): Promise<User> => {
        const res = await api.put<User>('/api/user/profile-photo', { profilePhoto: photoData });
        return res.data;
    },
    updateUsername: async (newUserName: string): Promise<User> => {
        const res = await api.put<User>('/api/user/update-username', { newUserName });
        return res.data;
    },
    updatePassword: async (currentPassword: string, newPassword: string): Promise<string> => {
        const res = await api.put('/api/user/update-password', { currentPassword, newPassword });
        return res.data;
    },
    deleteAccount: async (): Promise<string> => {
        const res = await api.delete('/api/user/delete');
        return res.data;
    },
};

// ── Rooms ──
export const roomService = {
    getRooms: async (): Promise<Room[]> => {
        const res = await api.get<Room[]>('/apis/v1/rooms/getrooms');
        return res.data;
    },
    createRoom: async (roomId: string): Promise<Room> => {
        const res = await api.post<Room>('/apis/v1/rooms/create', roomId, {
            headers: { 'Content-Type': 'text/plain' },
        });
        return res.data;
    },
    joinRoom: async (roomId: string): Promise<string> => {
        const res = await api.get(`/apis/v1/rooms/join/${roomId}`);
        return res.data;
    },
    leaveRoom: async (roomId: string): Promise<string> => {
        const res = await api.get(`/apis/v1/rooms/leave/${roomId}`);
        return res.data;
    },
    getMessages: async (roomId: string): Promise<Message[]> => {
        const res = await api.get<Message[]>(`/apis/v1/rooms/${roomId}/messages`);
        return res.data;
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
