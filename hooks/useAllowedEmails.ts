'use client';

import { useState, useEffect, useCallback } from 'react';
import { allowedEmailRepository } from '@/infrastructure/repositories/FirestoreAllowedEmailRepository';
import { createAllowedEmail } from '@/domain/user/AllowedEmail';
import { AllowedEmail } from '@/domain/user/AllowedEmail';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

export function useAllowedEmails() {
  const [emails, setEmails] = useState<AllowedEmail[]>([]);
  const [loading, setLoading] = useState(true);
  const { firebaseUser } = useAuth();

  useEffect(() => {
    setLoading(true);
    const unsubscribe = allowedEmailRepository.subscribeAll((updated) => {
      setEmails(updated);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const addEmail = useCallback(
    async (email: string) => {
      if (!firebaseUser) return;
      try {
        const allowed = createAllowedEmail(email, firebaseUser.uid);
        await allowedEmailRepository.add(allowed);
        toast.success(`${email} を追加しました`);
      } catch {
        toast.error('メールアドレスの追加に失敗しました');
      }
    },
    [firebaseUser],
  );

  const removeEmail = useCallback(async (email: string) => {
    try {
      await allowedEmailRepository.remove(email);
      toast.success(`${email} を削除しました`);
    } catch {
      toast.error('メールアドレスの削除に失敗しました');
    }
  }, []);

  return { emails, loading, addEmail, removeEmail };
}
