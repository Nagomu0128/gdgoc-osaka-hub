import { Timestamp } from 'firebase/firestore';

export type TaskStatus = 'remaining' | 'in_progress' | 'blocked' | 'done';

export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  assigneeUid: string | null;
  assigneeName: string | null;
  deadline: Timestamp | null;
  parentTaskId: string | null;
  calendarEventId: string | null;
  calendarEventUpdatedAt: Timestamp | null;
  createdBy: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export type TaskFormData = {
  title: string;
  description: string;
  status: TaskStatus;
  assigneeUid: string | null;
  assigneeName: string | null;
  deadline: Date | null;
  parentTaskId: string | null;
};
