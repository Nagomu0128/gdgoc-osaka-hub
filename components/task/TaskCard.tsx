'use client';

import Link from 'next/link';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';
import { Calendar, User, AlertCircle, GitBranch } from 'lucide-react';
import { Task, isTaskOverdue } from '@/domain/task/Task';
import { TaskStatusBadge } from './TaskStatusBadge';
import { cn } from '@/lib/utils';

export function TaskCard({ task }: { task: Task }) {
  const overdue = isTaskOverdue(task);

  return (
    <Link href={`/tasks/${task.id}`}>
      <div
        className={cn(
          'p-3 rounded-lg border bg-card hover:shadow-sm transition-shadow cursor-pointer space-y-2',
          overdue && 'border-destructive/50',
        )}
      >
        <div className="flex items-start justify-between gap-2">
          <p className="text-sm font-medium leading-snug line-clamp-2 flex-1">
            {task.title}
          </p>
          <TaskStatusBadge status={task.status} />
        </div>

        {task.description && (
          <p className="text-xs text-muted-foreground line-clamp-2">
            {task.description}
          </p>
        )}

        <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
          {task.assigneeName && (
            <span className="flex items-center gap-1">
              <User className="w-3 h-3" />
              {task.assigneeName}
            </span>
          )}
          {task.deadline && (
            <span
              className={cn(
                'flex items-center gap-1',
                overdue && 'text-destructive font-medium',
              )}
            >
              {overdue ? (
                <AlertCircle className="w-3 h-3" />
              ) : (
                <Calendar className="w-3 h-3" />
              )}
              {format(task.deadline, 'M/d', { locale: ja })}
            </span>
          )}
          {task.parentTaskId && (
            <span className="flex items-center gap-1">
              <GitBranch className="w-3 h-3" />
              依存あり
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
