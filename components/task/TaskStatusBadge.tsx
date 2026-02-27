import { Badge } from '@/components/ui/badge';
import { TaskStatus, TASK_STATUS_LABELS } from '@/domain/task/TaskStatus';
import { cn } from '@/lib/utils';

const STATUS_STYLES: Record<TaskStatus, string> = {
  remaining: 'bg-slate-100 text-slate-700 hover:bg-slate-100',
  in_progress: 'bg-blue-100 text-blue-700 hover:bg-blue-100',
  blocked: 'bg-red-100 text-red-700 hover:bg-red-100',
  done: 'bg-green-100 text-green-700 hover:bg-green-100',
};

export function TaskStatusBadge({ status }: { status: TaskStatus }) {
  return (
    <Badge
      variant="secondary"
      className={cn('text-xs font-medium', STATUS_STYLES[status])}
    >
      {TASK_STATUS_LABELS[status]}
    </Badge>
  );
}
