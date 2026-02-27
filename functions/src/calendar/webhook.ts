import * as admin from 'firebase-admin';
import { https } from 'firebase-functions/v2';
import { google } from 'googleapis';

export const calendarWebhook = https.onRequest(async (req, res) => {
  if (req.method !== 'POST') {
    res.status(405).send('Method Not Allowed');
    return;
  }

  const channelId = req.headers['x-goog-channel-id'];
  const resourceId = req.headers['x-goog-resource-id'];
  const resourceState = req.headers['x-goog-resource-state'];

  if (resourceState === 'sync') {
    res.status(200).send('OK');
    return;
  }

  try {
    const db = admin.firestore();

    // channelId に uid を埋め込む想定（channel 登録時に uid を含める）
    const uid = String(channelId).split(':')[0];
    if (!uid) {
      res.status(400).send('Invalid channel');
      return;
    }

    const userDoc = await db.collection('users').doc(uid).get();
    const userData = userDoc.data();
    if (!userData?.calendarTokens?.refreshToken) {
      res.status(200).send('OK');
      return;
    }

    const oAuth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CALENDAR_CLIENT_ID,
      process.env.GOOGLE_CALENDAR_CLIENT_SECRET,
    );
    oAuth2Client.setCredentials({
      refresh_token: userData.calendarTokens.refreshToken,
    });
    const { credentials } = await oAuth2Client.refreshAccessToken();
    oAuth2Client.setCredentials(credentials);

    const calendar = google.calendar({ version: 'v3', auth: oAuth2Client });

    // 更新されたイベントを取得
    const eventsRes = await calendar.events.list({
      calendarId: 'primary',
      updatedMin: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
      singleEvents: true,
    });

    for (const event of eventsRes.data.items ?? []) {
      const taskId = event.extendedProperties?.private?.taskId;
      if (!taskId) continue;

      const startTime = event.start?.dateTime;
      if (!startTime) continue;

      await db.collection('tasks').doc(taskId).update({
        deadline: admin.firestore.Timestamp.fromDate(new Date(startTime)),
        updatedAt: admin.firestore.Timestamp.now(),
      });
    }

    res.status(200).send('OK');
  } catch (error) {
    console.error('calendarWebhook failed:', error);
    res.status(500).send('Internal Server Error');
  }
});
