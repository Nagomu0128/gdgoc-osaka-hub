import { NextRequest, NextResponse } from 'next/server';
import { getAdminFirestore } from '@/infrastructure/firebase/admin';
import { pushTaskToCalendar, deleteCalendarEvent } from '@/infrastructure/calendar/GoogleCalendarService';
import { Timestamp } from 'firebase-admin/firestore';

export async function POST(req: NextRequest) {
  try {
    const { taskId, uid, action } = await req.json() as {
      taskId: string;
      uid: string;
      action: 'sync' | 'remove';
    };

    const db = getAdminFirestore();
    const [taskDoc, userDoc] = await Promise.all([
      db.collection('tasks').doc(taskId).get(),
      db.collection('users').doc(uid).get(),
    ]);

    if (!taskDoc.exists) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    const task = taskDoc.data()!;
    const user = userDoc.data();

    if (!user?.calendarTokens?.accessToken) {
      return NextResponse.json({ error: 'Calendar not connected' }, { status: 400 });
    }

    const domainTask = {
      id: taskId,
      title: task.title,
      description: task.description ?? '',
      deadline: task.deadline instanceof Timestamp ? task.deadline.toDate() : null,
      calendarEventId: task.calendarEventId ?? null,
    };

    if (action === 'remove') {
      if (domainTask.calendarEventId) {
        await deleteCalendarEvent(user.calendarTokens.accessToken, domainTask.calendarEventId);
        await db.collection('tasks').doc(taskId).update({
          calendarEventId: null,
          calendarEventUpdatedAt: null,
          updatedAt: Timestamp.now(),
        });
      }
      return NextResponse.json({ success: true });
    }

    // sync
    const eventId = await pushTaskToCalendar(user.calendarTokens.accessToken, domainTask as Parameters<typeof pushTaskToCalendar>[1]);
    if (eventId) {
      await db.collection('tasks').doc(taskId).update({
        calendarEventId: eventId,
        calendarEventUpdatedAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });
    }
    return NextResponse.json({ success: true, eventId });
  } catch (error) {
    console.error('Calendar sync API failed:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
