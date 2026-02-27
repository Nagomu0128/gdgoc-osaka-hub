export interface CalendarTokens {
  accessToken: string;
  refreshToken: string;
  expiresAt: Date;
}

export interface User {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string | null;
  isAdmin: boolean;
  calendarConnected: boolean;
  calendarTokens: CalendarTokens | null;
  createdAt: Date;
  lastLoginAt: Date;
}

export function createUser(
  uid: string,
  email: string,
  displayName: string,
  photoURL: string | null,
): User {
  const now = new Date();
  return {
    uid,
    email,
    displayName,
    photoURL,
    isAdmin: false,
    calendarConnected: false,
    calendarTokens: null,
    createdAt: now,
    lastLoginAt: now,
  };
}

export function updateUserLastLogin(user: User): User {
  return { ...user, lastLoginAt: new Date() };
}

export function connectUserCalendar(user: User, tokens: CalendarTokens): User {
  return { ...user, calendarConnected: true, calendarTokens: tokens };
}

export function disconnectUserCalendar(user: User): User {
  return { ...user, calendarConnected: false, calendarTokens: null };
}
