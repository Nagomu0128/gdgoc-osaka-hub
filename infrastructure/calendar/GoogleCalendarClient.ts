import { google } from 'googleapis';

export function createGoogleCalendarClient(accessToken: string) {
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CALENDAR_CLIENT_ID,
    process.env.GOOGLE_CALENDAR_CLIENT_SECRET,
    process.env.GOOGLE_CALENDAR_REDIRECT_URI,
  );
  oauth2Client.setCredentials({ access_token: accessToken });
  return google.calendar({ version: 'v3', auth: oauth2Client });
}

export function createGoogleOAuth2Client() {
  return new google.auth.OAuth2(
    process.env.GOOGLE_CALENDAR_CLIENT_ID,
    process.env.GOOGLE_CALENDAR_CLIENT_SECRET,
    process.env.GOOGLE_CALENDAR_REDIRECT_URI,
  );
}

export function getCalendarAuthUrl(oAuth2Client: ReturnType<typeof createGoogleOAuth2Client>): string {
  return oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: ['https://www.googleapis.com/auth/calendar'],
    prompt: 'consent',
  });
}
