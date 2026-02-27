import { AllowedEmail } from './AllowedEmail';

export interface IAllowedEmailRepository {
  findAll(): Promise<AllowedEmail[]>;
  exists(email: string): Promise<boolean>;
  add(allowedEmail: AllowedEmail): Promise<void>;
  remove(email: string): Promise<void>;
  subscribeAll(callback: (emails: AllowedEmail[]) => void): () => void;
}
