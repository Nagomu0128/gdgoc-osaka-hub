'use client';

import { useState, useEffect } from 'react';
import { taskRepository } from '@/infrastructure/repositories/FirestoreTaskRepository';
import { Task } from '@/domain/task/Task';

export function useTask(id: string) {
  const [task, setTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    taskRepository
      .findById(id)
      .then((t) => {
        setTask(t);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id]);

  return { task, loading };
}
