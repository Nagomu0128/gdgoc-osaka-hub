import { Timestamp } from 'firebase/firestore';

export interface CalendarTokens {
  accessToken: string;
  refreshToken: string;
  expiresAt: Timestamp;
}

export interface User {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string | null;
  isAdmin: boolean;
  calendarConnected: boolean;
  calendarTokens: CalendarTokens | null;
  createdAt: Timestamp;
  lastLoginAt: Timestamp;
}

export interface AllowedEmail {
  email: string;
  addedBy: string;
  addedAt: Timestamp;
}
