import { createGoogleCalendarClient } from './GoogleCalendarClient';
import { Task } from '@/domain/task/Task';
import { CalendarEvent } from '@/domain/calendar/CalendarEvent';

export async function pushTaskToCalendar(
  accessToken: string,
  task: Task,
): Promise<string | null> {
  if (!task.deadline) return null;

  try {
    const calendar = createGoogleCalendarClient(accessToken);
    const end = new Date(task.deadline.getTime() + 60 * 60 * 1000);

    const eventBody = {
      summary: task.title,
      description: task.description || undefined,
      start: { dateTime: task.deadline.toISOString() },
      end: { dateTime: end.toISOString() },
      extendedProperties: {
        private: { taskId: task.id },
      },
    };

    if (task.calendarEventId) {
      const res = await calendar.events.update({
        calendarId: 'primary',
        eventId: task.calendarEventId,
        requestBody: eventBody,
      });
      return res.data.id ?? null;
    } else {
      const res = await calendar.events.insert({
        calendarId: 'primary',
        requestBody: eventBody,
      });
      return res.data.id ?? null;
    }
  } catch (error) {
    console.error('Failed to push task to calendar:', error);
    throw error;
  }
}

export async function deleteCalendarEvent(
  accessToken: string,
  eventId: string,
): Promise<void> {
  try {
    const calendar = createGoogleCalendarClient(accessToken);
    await calendar.events.delete({ calendarId: 'primary', eventId });
  } catch (error) {
    console.error('Failed to delete calendar event:', error);
    throw error;
  }
}

export async function fetchCalendarEvents(
  accessToken: string,
  timeMin: Date,
  timeMax: Date,
): Promise<CalendarEvent[]> {
  try {
    const calendar = createGoogleCalendarClient(accessToken);
    const res = await calendar.events.list({
      calendarId: 'primary',
      timeMin: timeMin.toISOString(),
      timeMax: timeMax.toISOString(),
      singleEvents: true,
      orderBy: 'startTime',
    });

    return (res.data.items ?? []).map((item) => ({
      id: item.id ?? '',
      title: item.summary ?? '(no title)',
      start: new Date(item.start?.dateTime ?? item.start?.date ?? ''),
      end: new Date(item.end?.dateTime ?? item.end?.date ?? ''),
      taskId: item.extendedProperties?.private?.taskId,
      description: item.description ?? undefined,
    }));
  } catch (error) {
    console.error('Failed to fetch calendar events:', error);
    throw error;
  }
}
