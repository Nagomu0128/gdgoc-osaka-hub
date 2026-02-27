'use client';

import { useTasks } from '@/hooks/useTasks';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TaskStatusBadge } from '@/components/task/TaskStatusBadge';
import { Skeleton } from '@/components/ui/skeleton';
import { CheckSquare, Clock, AlertCircle, ListTodo } from 'lucide-react';
import { TASK_STATUS } from '@/domain/task/TaskStatus';
import { isTaskOverdue } from '@/domain/task/Task';
import Link from 'next/link';

export default function DashboardPage() {
  const { tasks, loading } = useTasks();
  const { appUser } = useAuth();

  const stats = {
    total: tasks.length,
    inProgress: tasks.filter((t) => t.status === TASK_STATUS.IN_PROGRESS).length,
    done: tasks.filter((t) => t.status === TASK_STATUS.DONE).length,
    overdue: tasks.filter(isTaskOverdue).length,
  };

  const recentTasks = tasks.slice(0, 5);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">
          こんにちは、{appUser?.displayName ?? 'ゲスト'} さん
        </h2>
        <p className="text-muted-foreground text-sm mt-1">タスクの概要です</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-xl" />
          ))
        ) : (
          <>
            <StatCard
              title="全タスク"
              value={stats.total}
              icon={<ListTodo className="w-5 h-5 text-muted-foreground" />}
            />
            <StatCard
              title="進行中"
              value={stats.inProgress}
              icon={<Clock className="w-5 h-5 text-blue-500" />}
            />
            <StatCard
              title="完了"
              value={stats.done}
              icon={<CheckSquare className="w-5 h-5 text-green-500" />}
            />
            <StatCard
              title="期限超過"
              value={stats.overdue}
              icon={<AlertCircle className="w-5 h-5 text-destructive" />}
              highlight={stats.overdue > 0}
            />
          </>
        )}
      </div>

      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold">最近のタスク</h3>
          <Link href="/tasks" className="text-sm text-primary hover:underline">
            すべて表示
          </Link>
        </div>
        <div className="space-y-2">
          {loading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-16 rounded-lg" />
            ))
          ) : recentTasks.length === 0 ? (
            <p className="text-muted-foreground text-sm py-8 text-center">
              タスクがありません
            </p>
          ) : (
            recentTasks.map((task) => (
              <Link key={task.id} href={`/tasks/${task.id}`}>
                <div className="flex items-center justify-between p-3 rounded-lg border hover:bg-accent transition-colors">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{task.title}</p>
                    {task.assigneeName && (
                      <p className="text-xs text-muted-foreground">
                        担当: {task.assigneeName}
                      </p>
                    )}
                  </div>
                  <TaskStatusBadge status={task.status} />
                </div>
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({
  title,
  value,
  icon,
  highlight,
}: {
  title: string;
  value: number;
  icon: React.ReactNode;
  highlight?: boolean;
}) {
  return (
    <Card className={highlight ? 'border-destructive' : undefined}>
      <CardHeader className="flex flex-row items-center justify-between pb-1 pt-4 px-4">
        <CardTitle className="text-xs font-medium text-muted-foreground">
          {title}
        </CardTitle>
        {icon}
      </CardHeader>
      <CardContent className="px-4 pb-4">
        <p className="text-2xl font-bold">{value}</p>
      </CardContent>
    </Card>
  );
}
