import { NextRequest, NextResponse } from 'next/server';
import { getAdminFirestore } from '@/infrastructure/firebase/admin';
import { fetchCalendarEvents } from '@/infrastructure/calendar/GoogleCalendarService';
import { Timestamp } from 'firebase-admin/firestore';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const uid = searchParams.get('uid');
    const timeMin = searchParams.get('timeMin');
    const timeMax = searchParams.get('timeMax');

    if (!uid || !timeMin || !timeMax) {
      return NextResponse.json({ error: 'Missing params' }, { status: 400 });
    }

    const db = getAdminFirestore();
    const userDoc = await db.collection('users').doc(uid).get();
    const user = userDoc.data();

    if (!user?.calendarTokens?.accessToken) {
      return NextResponse.json({ error: 'Calendar not connected' }, { status: 400 });
    }

    const events = await fetchCalendarEvents(
      user.calendarTokens.accessToken,
      new Date(timeMin),
      new Date(timeMax),
    );

    return NextResponse.json({ events });
  } catch (error) {
    console.error('Calendar events API failed:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
