/**
 * Demo Data — Realistic mock data for portfolio demo mode.
 *
 * All dates are generated relative to Date.now() so the demo always looks fresh.
 * These are only used when the backend is NOT running AND demo mode is active.
 */

import type { User, Room, Message } from './types';

// ============================================================
// Helper
// ============================================================
function minutesAgo(minutes: number): string {
    return new Date(Date.now() - minutes * 60 * 1000).toISOString();
}

function hoursAgo(hours: number): string {
    return new Date(Date.now() - hours * 60 * 60 * 1000).toISOString();
}

// ============================================================
// Demo User
// ============================================================
export const DEMO_USER: User = {
    id: 'demo-user-001',
    userName: 'alex.demo',
    email: 'alex@chatapp.demo',
    provider: 'local',
    providerId: null,
    avatarUrl: null,
    rooms: [],
    profilePhoto: null,
};

// ============================================================
// Demo Messages for each room
// ============================================================
const GENERAL_MESSAGES: Message[] = [
    {
        id: 'msg-001',
        sender: 'sarah.chen',
        content: 'Hey everyone! 👋 Welcome to the general channel.',
        timestamp: hoursAgo(5),
        senderProfilePhoto: null,
        attachmentFileName: null,
        attachmentData: null,
    },
    {
        id: 'msg-002',
        sender: 'james.wilson',
        content: 'Thanks Sarah! Excited to be here. This chat app is looking great!',
        timestamp: hoursAgo(4.5),
        senderProfilePhoto: null,
        attachmentFileName: null,
        attachmentData: null,
    },
    {
        id: 'msg-003',
        sender: 'alex.demo',
        content: 'Welcome aboard! Feel free to explore the rooms and features.',
        timestamp: hoursAgo(4),
        senderProfilePhoto: null,
        attachmentFileName: null,
        attachmentData: null,
    },
    {
        id: 'msg-004',
        sender: 'priya.sharma',
        content: 'The real-time messaging is super smooth. Nice work on the WebSocket integration! 🚀',
        timestamp: hoursAgo(3),
        senderProfilePhoto: null,
        attachmentFileName: null,
        attachmentData: null,
    },
    {
        id: 'msg-005',
        sender: 'alex.demo',
        content: 'Thanks Priya! Built it with STOMP over SockJS for reliable real-time communication.',
        timestamp: hoursAgo(2.5),
        senderProfilePhoto: null,
        attachmentFileName: null,
        attachmentData: null,
    },
    {
        id: 'msg-006',
        sender: 'sarah.chen',
        content: 'The file sharing feature is also really convenient. Just tested it with an image upload.',
        timestamp: hoursAgo(1),
        senderProfilePhoto: null,
        attachmentFileName: null,
        attachmentData: null,
    },
    {
        id: 'msg-007',
        sender: 'james.wilson',
        content: 'Love the dark mode support too. The theme toggle is seamless ✨',
        timestamp: minutesAgo(30),
        senderProfilePhoto: null,
        attachmentFileName: null,
        attachmentData: null,
    },
];

const DEV_TEAM_MESSAGES: Message[] = [
    {
        id: 'msg-101',
        sender: 'alex.demo',
        content: 'Sprint planning for this week: Focus on OAuth2 integration and WebSocket improvements.',
        timestamp: hoursAgo(8),
        senderProfilePhoto: null,
        attachmentFileName: null,
        attachmentData: null,
    },
    {
        id: 'msg-102',
        sender: 'james.wilson',
        content: 'I can take the Google OAuth2 flow. Already have experience with Spring Security OAuth2 client.',
        timestamp: hoursAgo(7),
        senderProfilePhoto: null,
        attachmentFileName: null,
        attachmentData: null,
    },
    {
        id: 'msg-103',
        sender: 'priya.sharma',
        content: 'I\'ll handle the GitHub OAuth2 integration. Should follow a similar pattern.',
        timestamp: hoursAgo(6.5),
        senderProfilePhoto: null,
        attachmentFileName: null,
        attachmentData: null,
    },
    {
        id: 'msg-104',
        sender: 'alex.demo',
        content: 'Perfect! Let\'s sync up tomorrow on the progress. The backend endpoints are already set up.',
        timestamp: hoursAgo(6),
        senderProfilePhoto: null,
        attachmentFileName: null,
        attachmentData: null,
    },
    {
        id: 'msg-105',
        sender: 'sarah.chen',
        content: 'Just pushed the profile photo upload feature. Users can now update their avatars! 📸',
        timestamp: hoursAgo(3),
        senderProfilePhoto: null,
        attachmentFileName: null,
        attachmentData: null,
    },
];

const RANDOM_MESSAGES: Message[] = [
    {
        id: 'msg-201',
        sender: 'sarah.chen',
        content: 'Anyone up for a coffee chat? ☕',
        timestamp: hoursAgo(2),
        senderProfilePhoto: null,
        attachmentFileName: null,
        attachmentData: null,
    },
    {
        id: 'msg-202',
        sender: 'alex.demo',
        content: 'Sure! Let me finish this PR review and I\'ll join.',
        timestamp: hoursAgo(1.5),
        senderProfilePhoto: null,
        attachmentFileName: null,
        attachmentData: null,
    },
    {
        id: 'msg-203',
        sender: 'james.wilson',
        content: 'Count me in! Also, has anyone tried the new emoji picker? 🎉🎊🥳',
        timestamp: minutesAgo(45),
        senderProfilePhoto: null,
        attachmentFileName: null,
        attachmentData: null,
    },
];

// ============================================================
// Demo Rooms
// ============================================================
export const DEMO_ROOMS: Room[] = [
    {
        id: 'room-001',
        roomId: 'general',
        messages: GENERAL_MESSAGES,
    },
    {
        id: 'room-002',
        roomId: 'dev-team',
        messages: DEV_TEAM_MESSAGES,
    },
    {
        id: 'room-003',
        roomId: 'random',
        messages: RANDOM_MESSAGES,
    },
];

// ============================================================
// Get messages for a specific room
// ============================================================
export function getDemoMessages(roomId: string): Message[] {
    const room = DEMO_ROOMS.find((r) => r.roomId === roomId);
    return room?.messages || [];
}
