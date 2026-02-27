import { NextRequest, NextResponse } from 'next/server';
import { createGoogleOAuth2Client } from '@/infrastructure/calendar/GoogleCalendarClient';
import { getAdminFirestore } from '@/infrastructure/firebase/admin';
import { Timestamp } from 'firebase-admin/firestore';

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const code = searchParams.get('code');
  const uid = searchParams.get('state');

  if (!code || !uid) {
    return NextResponse.redirect(new URL('/calendar?error=missing_params', req.url));
  }

  try {
    const oAuth2Client = createGoogleOAuth2Client();
    const { tokens } = await oAuth2Client.getToken(code);

    if (!tokens.access_token || !tokens.refresh_token) {
      return NextResponse.redirect(new URL('/calendar?error=no_tokens', req.url));
    }

    const expiresAt = tokens.expiry_date
      ? Timestamp.fromMillis(tokens.expiry_date)
      : Timestamp.fromDate(new Date(Date.now() + 3600 * 1000));

    const db = getAdminFirestore();
    await db.collection('users').doc(uid).update({
      calendarConnected: true,
      calendarTokens: {
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token,
        expiresAt,
      },
    });

    return NextResponse.redirect(new URL('/calendar?connected=true', req.url));
  } catch (error) {
    console.error('Calendar OAuth callback failed:', error);
    return NextResponse.redirect(new URL('/calendar?error=callback_failed', req.url));
  }
}
