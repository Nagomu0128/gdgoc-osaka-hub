'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTasks } from '@/hooks/useTasks';
import { useUsers } from '@/hooks/useUsers';
import { TaskForm } from '@/components/task/TaskForm';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CreateTaskInput } from '@/domain/task/Task';

export default function NewTaskPage() {
  const router = useRouter();
  const { tasks, createTask } = useTasks();
  const { users } = useUsers();
  const [loading, setLoading] = useState(false);

  async function handleSubmit(input: CreateTaskInput) {
    setLoading(true);
    try {
      await createTask(input);
      router.push('/tasks');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>新規タスク作成</CardTitle>
        </CardHeader>
        <CardContent>
          <TaskForm
            users={users}
            tasks={tasks}
            onSubmit={handleSubmit}
            onCancel={() => router.back()}
            loading={loading}
          />
        </CardContent>
      </Card>
    </div>
  );
}
