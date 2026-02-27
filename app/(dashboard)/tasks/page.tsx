'use client';

import { useState } from 'react';
import { useTasks } from '@/hooks/useTasks';
import { useUsers } from '@/hooks/useUsers';
import { TaskBoard } from '@/components/task/TaskBoard';
import { TaskFilters } from '@/components/task/TaskFilters';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { TaskStatus } from '@/domain/task/TaskStatus';
import { TaskCard } from '@/components/task/TaskCard';

export default function TasksPage() {
  const [view, setView] = useState<'board' | 'list'>('board');
  const [statusFilter, setStatusFilter] = useState<TaskStatus | ''>('');
  const [assigneeFilter, setAssigneeFilter] = useState('');

  const { tasks, loading } = useTasks();
  const { users } = useUsers();

  const filtered = tasks.filter((t) => {
    if (statusFilter && t.status !== statusFilter) return false;
    if (assigneeFilter && t.assigneeUid !== assigneeFilter) return false;
    return true;
  });

  return (
    <div className="space-y-4 h-full flex flex-col">
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <TaskFilters
          statusFilter={statusFilter}
          assigneeFilter={assigneeFilter}
          users={users}
          onStatusChange={setStatusFilter}
          onAssigneeChange={setAssigneeFilter}
        />
        <div className="sm:ml-auto">
          <Tabs value={view} onValueChange={(v) => setView(v as 'board' | 'list')}>
            <TabsList>
              <TabsTrigger value="board">カンバン</TabsTrigger>
              <TabsTrigger value="list">リスト</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-lg" />
          ))}
        </div>
      ) : view === 'board' ? (
        <div className="flex-1">
          <TaskBoard tasks={filtered} />
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.length === 0 ? (
            <p className="text-muted-foreground text-sm text-center py-12">
              タスクがありません
            </p>
          ) : (
            filtered.map((task) => <TaskCard key={task.id} task={task} />)
          )}
        </div>
      )}
    </div>
  );
}
