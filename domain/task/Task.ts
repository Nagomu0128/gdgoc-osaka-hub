import { TaskStatus, TASK_STATUS } from './TaskStatus';

export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  assigneeUid: string | null;
  assigneeName: string | null;
  deadline: Date | null;
  parentTaskId: string | null;
  calendarEventId: string | null;
  calendarEventUpdatedAt: Date | null;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateTaskInput {
  title: string;
  description: string;
  status?: TaskStatus;
  assigneeUid?: string | null;
  assigneeName?: string | null;
  deadline?: Date | null;
  parentTaskId?: string | null;
}

export function createTask(
  input: CreateTaskInput,
  createdBy: string,
  id: string,
): Task {
  const now = new Date();
  return {
    id,
    title: input.title,
    description: input.description,
    status: input.status ?? TASK_STATUS.REMAINING,
    assigneeUid: input.assigneeUid ?? null,
    assigneeName: input.assigneeName ?? null,
    deadline: input.deadline ?? null,
    parentTaskId: input.parentTaskId ?? null,
    calendarEventId: null,
    calendarEventUpdatedAt: null,
    createdBy,
    createdAt: now,
    updatedAt: now,
  };
}

export function updateTask(task: Task, patch: Partial<CreateTaskInput>): Task {
  return { ...task, ...patch, updatedAt: new Date() };
}

export function updateTaskCalendarEvent(
  task: Task,
  eventId: string | null,
): Task {
  return {
    ...task,
    calendarEventId: eventId,
    calendarEventUpdatedAt: eventId ? new Date() : null,
    updatedAt: new Date(),
  };
}

export function isTaskOverdue(task: Task): boolean {
  if (!task.deadline) return false;
  if (task.status === TASK_STATUS.DONE) return false;
  return task.deadline < new Date();
}
