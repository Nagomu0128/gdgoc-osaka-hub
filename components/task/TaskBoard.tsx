'use client';

import { Task } from '@/domain/task/Task';
import { ALL_TASK_STATUSES, TASK_STATUS_LABELS, TaskStatus } from '@/domain/task/TaskStatus';
import { TaskCard } from './TaskCard';
import { ScrollArea } from '@/components/ui/scroll-area';

export function TaskBoard({ tasks }: { tasks: Task[] }) {
  const byStatus: Record<TaskStatus, Task[]> = {
    remaining: [],
    in_progress: [],
    blocked: [],
    done: [],
  };
  for (const task of tasks) {
    byStatus[task.status].push(task);
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 h-full">
      {ALL_TASK_STATUSES.map((status) => (
        <Column key={status} status={status} tasks={byStatus[status]} />
      ))}
    </div>
  );
}

function Column({ status, tasks }: { status: TaskStatus; tasks: Task[] }) {
  return (
    <div className="flex flex-col gap-2 min-h-0">
      <div className="flex items-center justify-between px-1">
        <span className="text-sm font-semibold">{TASK_STATUS_LABELS[status]}</span>
        <span className="text-xs text-muted-foreground bg-muted rounded-full px-2 py-0.5">
          {tasks.length}
        </span>
      </div>
      <ScrollArea className="flex-1">
        <div className="space-y-2 pr-2">
          {tasks.length === 0 ? (
            <p className="text-xs text-muted-foreground text-center py-6 border-2 border-dashed rounded-lg">
              タスクなし
            </p>
          ) : (
            tasks.map((task) => <TaskCard key={task.id} task={task} />)
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
