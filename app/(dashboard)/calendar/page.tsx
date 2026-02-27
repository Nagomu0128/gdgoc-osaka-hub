'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect } from 'react';
import { useTasks } from '@/hooks/useTasks';
import { useCalendarSync } from '@/hooks/useCalendarSync';
import { useAuth } from '@/hooks/useAuth';
import { CalendarView } from '@/components/calendar/CalendarView';
import { CalendarAuthButton } from '@/components/calendar/CalendarAuthButton';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';

export default function CalendarPage() {
  const { tasks, loading } = useTasks();
  const { events, loadingEvents, fetchEvents } = useCalendarSync();
  const { appUser } = useAuth();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (searchParams.get('connected') === 'true') {
      toast.success('Google Calendar を連携しました');
    }
    if (searchParams.get('error')) {
      toast.error('Google Calendar の連携に失敗しました');
    }
  }, [searchParams]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <p className="text-sm text-muted-foreground">
          タスクの締切と Google Calendar の予定を表示します
        </p>
        <CalendarAuthButton />
      </div>

      {loading ? (
        <Skeleton className="h-[600px] rounded-lg" />
      ) : (
        <CalendarView
          tasks={tasks}
          calendarEvents={appUser?.calendarConnected ? events : []}
          onRangeChange={(start, end) => {
            if (appUser?.calendarConnected) {
              fetchEvents(start, end);
            }
          }}
        />
      )}
    </div>
  );
}
