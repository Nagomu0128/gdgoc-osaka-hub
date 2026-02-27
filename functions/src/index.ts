import * as admin from 'firebase-admin';

admin.initializeApp();

export { onUserCreate } from './auth/onUserCreate';
export { onTaskWrite } from './tasks/onTaskWrite';
export { calendarWebhook } from './calendar/webhook';
