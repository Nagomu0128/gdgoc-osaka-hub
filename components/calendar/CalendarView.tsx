'use client';

import { useEffect, useMemo } from 'react';
import { Calendar, dateFnsLocalizer, View } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay, startOfMonth, endOfMonth } from 'date-fns';
import { ja } from 'date-fns/locale';
import { CalendarEvent } from '@/domain/calendar/CalendarEvent';
import { Task } from '@/domain/task/Task';
import { TASK_STATUS } from '@/domain/task/TaskStatus';
import 'react-big-calendar/lib/css/react-big-calendar.css';

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { locale: ja }),
  getDay,
  locales: { ja },
});

interface CalendarViewProps {
  tasks: Task[];
  calendarEvents: CalendarEvent[];
  onRangeChange: (start: Date, end: Date) => void;
}

export function CalendarView({ tasks, calendarEvents, onRangeChange }: CalendarViewProps) {
  useEffect(() => {
    const now = new Date();
    onRangeChange(startOfMonth(now), endOfMonth(now));
  }, []);

  const taskEvents = useMemo(
    () =>
      tasks
        .filter((t) => t.deadline && t.status !== TASK_STATUS.DONE)
        .map((t) => ({
          id: t.id,
          title: `📌 ${t.title}`,
          start: t.deadline!,
          end: t.deadline!,
          allDay: true,
          resource: { type: 'task', taskId: t.id },
        })),
    [tasks],
  );

  const googleEvents = useMemo(
    () =>
      calendarEvents
        .filter((e) => !e.taskId)
        .map((e) => ({
          id: e.id,
          title: `📅 ${e.title}`,
          start: e.start,
          end: e.end,
          resource: { type: 'google' },
        })),
    [calendarEvents],
  );

  const allEvents = [...taskEvents, ...googleEvents];

  function handleRangeChange(range: Date[] | { start: Date; end: Date }) {
    if (Array.isArray(range)) {
      onRangeChange(range[0], range[range.length - 1]);
    } else {
      onRangeChange(range.start, range.end);
    }
  }

  return (
    <div className="h-[600px]">
      <Calendar
        localizer={localizer}
        events={allEvents}
        defaultView="month"
        views={['month', 'week', 'agenda'] as View[]}
        culture="ja"
        onRangeChange={handleRangeChange}
        messages={{
          month: '月',
          week: '週',
          day: '日',
          agenda: 'リスト',
          today: '今日',
          previous: '前',
          next: '次',
          noEventsInRange: 'この期間にイベントはありません',
        }}
      />
    </div>
  );
}
