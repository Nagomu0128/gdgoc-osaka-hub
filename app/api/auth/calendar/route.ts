import { NextRequest, NextResponse } from 'next/server';
import { createGoogleOAuth2Client, getCalendarAuthUrl } from '@/infrastructure/calendar/GoogleCalendarClient';

export async function GET(req: NextRequest) {
  try {
    const uid = req.nextUrl.searchParams.get('uid');
    if (!uid) {
      return NextResponse.json({ error: 'uid is required' }, { status: 400 });
    }

    const oAuth2Client = createGoogleOAuth2Client();
    const url = getCalendarAuthUrl(oAuth2Client);

    // uid を state パラメータに埋め込む（コールバックで取り出す）
    const authUrl = new URL(url);
    authUrl.searchParams.set('state', uid);

    return NextResponse.redirect(authUrl.toString());
  } catch (error) {
    console.error('Calendar auth initiation failed:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
