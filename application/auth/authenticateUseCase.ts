import { IUserRepository } from '@/domain/user/IUserRepository';
import { IAllowedEmailRepository } from '@/domain/user/IAllowedEmailRepository';
import { User, createUser } from '@/domain/user/User';

export interface AuthenticateInput {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string | null;
}

export interface AuthenticateResult {
  user: User;
  isAllowed: boolean;
}

export async function authenticateUseCase(
  userRepository: IUserRepository,
  allowedEmailRepository: IAllowedEmailRepository,
  input: AuthenticateInput,
): Promise<AuthenticateResult> {
  try {
    const isAllowed = await allowedEmailRepository.exists(input.email);
    if (!isAllowed) {
      return { user: createUser(input.uid, input.email, input.displayName, input.photoURL), isAllowed: false };
    }

    const existing = await userRepository.findById(input.uid);
    if (existing) {
      await userRepository.updateLastLogin(input.uid);
      const updated = { ...existing, lastLoginAt: new Date() };
      return { user: updated, isAllowed: true };
    }

    const newUser = createUser(input.uid, input.email, input.displayName, input.photoURL);
    await userRepository.save(newUser);
    return { user: newUser, isAllowed: true };
  } catch (error) {
    console.error('authenticateUseCase failed:', error);
    throw error;
  }
}
