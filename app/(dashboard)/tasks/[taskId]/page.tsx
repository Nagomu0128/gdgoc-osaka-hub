'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';
import { Pencil, Trash2, Calendar, User, GitBranch } from 'lucide-react';
import { useTask } from '@/hooks/useTask';
import { useTasks } from '@/hooks/useTasks';
import { useUsers } from '@/hooks/useUsers';
import { TaskForm } from '@/components/task/TaskForm';
import { TaskStatusBadge } from '@/components/task/TaskStatusBadge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { CreateTaskInput, isTaskOverdue } from '@/domain/task/Task';

export default function TaskDetailPage() {
  const { taskId } = useParams<{ taskId: string }>();
  const router = useRouter();
  const { task, loading } = useTask(taskId);
  const { tasks, updateTask, deleteTask } = useTasks();
  const { users } = useUsers();
  const [editing, setEditing] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [saving, setSaving] = useState(false);

  async function handleUpdate(input: CreateTaskInput) {
    setSaving(true);
    try {
      await updateTask(taskId, input);
      setEditing(false);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    await deleteTask(taskId);
    router.push('/tasks');
  }

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-48" />
      </div>
    );
  }

  if (!task) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        タスクが見つかりません
      </div>
    );
  }

  const overdue = isTaskOverdue(task);
  const parentTask = tasks.find((t) => t.id === task.parentTaskId);

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" onClick={() => router.back()}>
          ← 戻る
        </Button>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="gap-1"
            onClick={() => setEditing(!editing)}
          >
            <Pencil className="w-3.5 h-3.5" />
            {editing ? 'キャンセル' : '編集'}
          </Button>
          <Button
            variant="destructive"
            size="sm"
            className="gap-1"
            onClick={() => setDeleteDialog(true)}
          >
            <Trash2 className="w-3.5 h-3.5" />
            削除
          </Button>
        </div>
      </div>

      {editing ? (
        <Card>
          <CardHeader>
            <CardTitle>タスクを編集</CardTitle>
          </CardHeader>
          <CardContent>
            <TaskForm
              defaultValues={task}
              users={users}
              tasks={tasks}
              onSubmit={handleUpdate}
              onCancel={() => setEditing(false)}
              loading={saving}
            />
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between gap-2">
              <CardTitle className="text-xl leading-snug">{task.title}</CardTitle>
              <TaskStatusBadge status={task.status} />
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {task.description && (
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                {task.description}
              </p>
            )}
            <Separator />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              <InfoRow
                icon={<User className="w-4 h-4" />}
                label="担当者"
                value={task.assigneeName ?? '未割り当て'}
              />
              <InfoRow
                icon={<Calendar className="w-4 h-4" />}
                label="締切"
                value={
                  task.deadline
                    ? format(task.deadline, 'yyyy年M月d日', { locale: ja })
                    : 'なし'
                }
                highlight={overdue}
                highlightText="期限超過"
              />
              {parentTask && (
                <InfoRow
                  icon={<GitBranch className="w-4 h-4" />}
                  label="依存タスク"
                  value={parentTask.title}
                />
              )}
            </div>
          </CardContent>
        </Card>
      )}

      <Dialog open={deleteDialog} onOpenChange={setDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>タスクを削除しますか？</DialogTitle>
            <DialogDescription>
              「{task.title}」を削除します。この操作は元に戻せません。
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialog(false)}>
              キャンセル
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              削除する
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function InfoRow({
  icon,
  label,
  value,
  highlight,
  highlightText,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  highlight?: boolean;
  highlightText?: string;
}) {
  return (
    <div className="flex items-center gap-2 text-muted-foreground">
      {icon}
      <span className="font-medium text-foreground">{label}:</span>
      <span className={highlight ? 'text-destructive font-medium' : ''}>
        {value}
        {highlight && highlightText && ` (${highlightText})`}
      </span>
    </div>
  );
}
