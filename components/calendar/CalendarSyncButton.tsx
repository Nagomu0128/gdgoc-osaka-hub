'use client';

import { RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCalendarSync } from '@/hooks/useCalendarSync';
import { Task } from '@/domain/task/Task';

export function CalendarSyncButton({ task }: { task: Task }) {
  const { syncing, syncTask, removeFromCalendar } = useCalendarSync();

  if (!task.deadline) return null;

  if (task.calendarEventId) {
    return (
      <Button
        variant="ghost"
        size="sm"
        className="gap-1 text-muted-foreground"
        disabled={syncing}
        onClick={() => removeFromCalendar(task.id)}
      >
        <RefreshCw className="w-3.5 h-3.5" />
        カレンダーから削除
      </Button>
    );
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      className="gap-1"
      disabled={syncing}
      onClick={() => syncTask(task.id)}
    >
      <RefreshCw className={`w-3.5 h-3.5 ${syncing ? 'animate-spin' : ''}`} />
      カレンダーに追加
    </Button>
  );
}
