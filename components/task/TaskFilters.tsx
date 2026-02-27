'use client';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ALL_TASK_STATUSES, TASK_STATUS_LABELS, TaskStatus } from '@/domain/task/TaskStatus';
import { User } from '@/domain/user/User';

interface TaskFiltersProps {
  statusFilter: TaskStatus | '';
  assigneeFilter: string;
  users: User[];
  onStatusChange: (v: TaskStatus | '') => void;
  onAssigneeChange: (v: string) => void;
}

export function TaskFilters({
  statusFilter,
  assigneeFilter,
  users,
  onStatusChange,
  onAssigneeChange,
}: TaskFiltersProps) {
  return (
    <div className="flex flex-wrap gap-2">
      <Select
        value={statusFilter || 'all'}
        onValueChange={(v) => onStatusChange(v === 'all' ? '' : v as TaskStatus)}
      >
        <SelectTrigger className="w-40">
          <SelectValue placeholder="ステータス: 全て" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">全てのステータス</SelectItem>
          {ALL_TASK_STATUSES.map((s) => (
            <SelectItem key={s} value={s}>
              {TASK_STATUS_LABELS[s]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={assigneeFilter || 'all'}
        onValueChange={(v) => onAssigneeChange(v === 'all' ? '' : v)}
      >
        <SelectTrigger className="w-40">
          <SelectValue placeholder="担当者: 全て" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">全ての担当者</SelectItem>
          {users.map((u) => (
            <SelectItem key={u.uid} value={u.uid}>
              {u.displayName}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
