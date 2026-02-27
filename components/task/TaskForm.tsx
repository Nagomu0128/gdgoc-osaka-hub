'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format } from 'date-fns';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ALL_TASK_STATUSES, TASK_STATUS_LABELS } from '@/domain/task/TaskStatus';
import { Task, CreateTaskInput } from '@/domain/task/Task';
import { User } from '@/domain/user/User';

const schema = z.object({
  title: z.string().min(1, 'タイトルは必須です'),
  description: z.string(),
  status: z.enum(['remaining', 'in_progress', 'blocked', 'done']),
  assigneeUid: z.string().nullable(),
  deadline: z.string().nullable(),
  parentTaskId: z.string().nullable(),
});

type FormValues = z.infer<typeof schema>;

interface TaskFormProps {
  defaultValues?: Partial<Task>;
  users: User[];
  tasks: Task[];
  onSubmit: (input: CreateTaskInput) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}

export function TaskForm({
  defaultValues,
  users,
  tasks,
  onSubmit,
  onCancel,
  loading,
}: TaskFormProps) {
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: defaultValues?.title ?? '',
      description: defaultValues?.description ?? '',
      status: defaultValues?.status ?? 'remaining',
      assigneeUid: defaultValues?.assigneeUid ?? null,
      deadline: defaultValues?.deadline
        ? format(defaultValues.deadline, 'yyyy-MM-dd')
        : null,
      parentTaskId: defaultValues?.parentTaskId ?? null,
    },
  });

  async function handleSubmit(values: FormValues) {
    const assignee = users.find((u) => u.uid === values.assigneeUid);
    await onSubmit({
      title: values.title,
      description: values.description,
      status: values.status,
      assigneeUid: values.assigneeUid ?? null,
      assigneeName: assignee?.displayName ?? null,
      deadline: values.deadline ? new Date(values.deadline) : null,
      parentTaskId: values.parentTaskId ?? null,
    });
  }

  const otherTasks = tasks.filter((t) => t.id !== defaultValues?.id);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>タイトル *</FormLabel>
              <FormControl>
                <Input placeholder="タスクのタイトル" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>メモ</FormLabel>
              <FormControl>
                <Textarea placeholder="タスクの詳細や備考" rows={3} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>ステータス</FormLabel>
                <Select value={field.value} onValueChange={field.onChange}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {ALL_TASK_STATUSES.map((s) => (
                      <SelectItem key={s} value={s}>
                        {TASK_STATUS_LABELS[s]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="assigneeUid"
            render={({ field }) => (
              <FormItem>
                <FormLabel>担当者</FormLabel>
                <Select
                  value={field.value ?? 'none'}
                  onValueChange={(v) => field.onChange(v === 'none' ? null : v)}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="未割り当て" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="none">未割り当て</SelectItem>
                    {users.map((u) => (
                      <SelectItem key={u.uid} value={u.uid}>
                        {u.displayName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="deadline"
            render={({ field }) => (
              <FormItem>
                <FormLabel>締切</FormLabel>
                <FormControl>
                  <Input
                    type="date"
                    {...field}
                    value={field.value ?? ''}
                    onChange={(e) => field.onChange(e.target.value || null)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="parentTaskId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>親タスク（依存関係）</FormLabel>
                <Select
                  value={field.value ?? 'none'}
                  onValueChange={(v) => field.onChange(v === 'none' ? null : v)}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="なし" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="none">なし</SelectItem>
                    {otherTasks.map((t) => (
                      <SelectItem key={t.id} value={t.id}>
                        {t.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex gap-2 pt-2">
          <Button type="submit" disabled={loading}>
            {loading ? '保存中...' : '保存'}
          </Button>
          <Button type="button" variant="outline" onClick={onCancel}>
            キャンセル
          </Button>
        </div>
      </form>
    </Form>
  );
}
