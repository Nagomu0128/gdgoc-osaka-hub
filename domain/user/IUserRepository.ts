import { User, CalendarTokens } from './User';

export interface IUserRepository {
  findById(uid: string): Promise<User | null>;
  findAll(): Promise<User[]>;
  save(user: User): Promise<void>;
  updateLastLogin(uid: string): Promise<void>;
  updateCalendarTokens(uid: string, tokens: CalendarTokens | null): Promise<void>;
  subscribeById(uid: string, callback: (user: User | null) => void): () => void;
}
