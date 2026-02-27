'use client';

import { useState, useEffect, useCallback } from 'react';
import { taskRepository } from '@/infrastructure/repositories/FirestoreTaskRepository';
import { createTaskUseCase } from '@/application/task/createTaskUseCase';
import { updateTaskUseCase } from '@/application/task/updateTaskUseCase';
import { deleteTaskUseCase } from '@/application/task/deleteTaskUseCase';
import { Task, CreateTaskInput } from '@/domain/task/Task';
import { TaskFilter } from '@/domain/task/ITaskRepository';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

export function useTasks(filter?: TaskFilter) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const { firebaseUser } = useAuth();

  useEffect(() => {
    setLoading(true);
    const unsubscribe = taskRepository.subscribeAll((updated) => {
      setTasks(updated);
      setLoading(false);
    }, filter);
    return unsubscribe;
  }, [filter?.status, filter?.assigneeUid]);

  const createTask = useCallback(
    async (input: CreateTaskInput) => {
      if (!firebaseUser) return;
      try {
        await createTaskUseCase(taskRepository, input, firebaseUser.uid);
        toast.success('タスクを作成しました');
      } catch {
        toast.error('タスクの作成に失敗しました');
      }
    },
    [firebaseUser],
  );

  const updateTask = useCallback(
    async (id: string, patch: Partial<CreateTaskInput>) => {
      try {
        await updateTaskUseCase(taskRepository, id, patch);
        toast.success('タスクを更新しました');
      } catch {
        toast.error('タスクの更新に失敗しました');
      }
    },
    [],
  );

  const deleteTask = useCallback(async (id: string) => {
    try {
      await deleteTaskUseCase(taskRepository, id);
      toast.success('タスクを削除しました');
    } catch {
      toast.error('タスクの削除に失敗しました');
    }
  }, []);

  return { tasks, loading, createTask, updateTask, deleteTask };
}
