'use client';

import { useState, useCallback } from 'react';
import { CalendarEvent } from '@/domain/calendar/CalendarEvent';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

export function useCalendarSync() {
  const [syncing, setSyncing] = useState(false);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loadingEvents, setLoadingEvents] = useState(false);
  const { firebaseUser } = useAuth();

  const syncTask = useCallback(
    async (taskId: string) => {
      if (!firebaseUser) return;
      setSyncing(true);
      try {
        const res = await fetch('/api/calendar/sync', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ taskId, uid: firebaseUser.uid, action: 'sync' }),
        });
        if (!res.ok) throw new Error(await res.text());
        toast.success('カレンダーに同期しました');
      } catch {
        toast.error('カレンダーの同期に失敗しました');
      } finally {
        setSyncing(false);
      }
    },
    [firebaseUser],
  );

  const removeFromCalendar = useCallback(
    async (taskId: string) => {
      if (!firebaseUser) return;
      setSyncing(true);
      try {
        const res = await fetch('/api/calendar/sync', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ taskId, uid: firebaseUser.uid, action: 'remove' }),
        });
        if (!res.ok) throw new Error(await res.text());
        toast.success('カレンダーから削除しました');
      } catch {
        toast.error('カレンダーからの削除に失敗しました');
      } finally {
        setSyncing(false);
      }
    },
    [firebaseUser],
  );

  const fetchEvents = useCallback(
    async (timeMin: Date, timeMax: Date) => {
      if (!firebaseUser) return;
      setLoadingEvents(true);
      try {
        const params = new URLSearchParams({
          uid: firebaseUser.uid,
          timeMin: timeMin.toISOString(),
          timeMax: timeMax.toISOString(),
        });
        const res = await fetch(`/api/calendar/events?${params}`);
        if (!res.ok) throw new Error(await res.text());
        const { events: fetched } = await res.json() as { events: Array<{ id: string; title: string; start: string; end: string; taskId?: string; description?: string }> };
        setEvents(
          fetched.map((e) => ({
            id: e.id,
            title: e.title,
            start: new Date(e.start),
            end: new Date(e.end),
            taskId: e.taskId,
            description: e.description,
          })),
        );
      } catch {
        toast.error('カレンダーイベントの取得に失敗しました');
      } finally {
        setLoadingEvents(false);
      }
    },
    [firebaseUser],
  );

  return { syncing, events, loadingEvents, syncTask, removeFromCalendar, fetchEvents };
}
