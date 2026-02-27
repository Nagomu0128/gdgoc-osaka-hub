import * as admin from 'firebase-admin';
import { firestore } from 'firebase-functions/v2';
import { google } from 'googleapis';

export const onTaskWrite = firestore
  .document('tasks/{taskId}')
  .onWrite(async (change, context) => {
    const taskId = context.params.taskId;
    const after = change.after.exists ? change.after.data() : null;
    const before = change.before.exists ? change.before.data() : null;

    if (!after) return; // deleted

    const deadlineChanged =
      JSON.stringify(after.deadline) !== JSON.stringify(before?.deadline);
    if (!deadlineChanged || !after.deadline || !after.assigneeUid) return;

    try {
      const db = admin.firestore();
      const userDoc = await db.collection('users').doc(after.assigneeUid).get();
      const userData = userDoc.data();
      if (!userData?.calendarTokens?.refreshToken) return;

      const oAuth2Client = new google.auth.OAuth2(
        process.env.GOOGLE_CALENDAR_CLIENT_ID,
        process.env.GOOGLE_CALENDAR_CLIENT_SECRET,
        process.env.GOOGLE_CALENDAR_REDIRECT_URI,
      );
      oAuth2Client.setCredentials({
        refresh_token: userData.calendarTokens.refreshToken,
      });

      const { credentials } = await oAuth2Client.refreshAccessToken();
      oAuth2Client.setCredentials(credentials);
      const calendar = google.calendar({ version: 'v3', auth: oAuth2Client });

      const deadline = after.deadline.toDate();
      const end = new Date(deadline.getTime() + 60 * 60 * 1000);

      const eventBody = {
        summary: after.title,
        description: after.description || undefined,
        start: { dateTime: deadline.toISOString() },
        end: { dateTime: end.toISOString() },
        extendedProperties: { private: { taskId } },
      };

      if (after.calendarEventId) {
        await calendar.events.update({
          calendarId: 'primary',
          eventId: after.calendarEventId,
          requestBody: eventBody,
        });
      } else {
        const res = await calendar.events.insert({
          calendarId: 'primary',
          requestBody: eventBody,
        });
        if (res.data.id) {
          await db.collection('tasks').doc(taskId).update({
            calendarEventId: res.data.id,
            calendarEventUpdatedAt: admin.firestore.Timestamp.now(),
          });
        }
      }
    } catch (error) {
      console.error('onTaskWrite calendar sync failed:', error);
    }
  });
