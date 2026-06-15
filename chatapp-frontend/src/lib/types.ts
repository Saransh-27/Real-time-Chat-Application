export interface User {
  id: string;
  userName: string;
  password?: string;
  rooms: Room[];
  profilePhoto: string | null;
}

export interface Room {
  id: string;
  roomId: string;
  messages: Message[];
}

export interface Message {
  id?: string;
  sender: string;
  content: string;
  timestamp: string;
  senderProfilePhoto?: string | null;
  attachmentFileName?: string | null;
  attachmentData?: string | null;
}

export interface LoginRequest {
  userName: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: User;
}

export interface MessageRequest {
  sender: string;
  content: string;
  roomId: string;
}
