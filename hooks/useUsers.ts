'use client';

import { useState, useEffect } from 'react';
import { userRepository } from '@/infrastructure/repositories/FirestoreUserRepository';
import { User } from '@/domain/user/User';

export function useUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    userRepository
      .findAll()
      .then((u) => {
        setUsers(u);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return { users, loading };
}
