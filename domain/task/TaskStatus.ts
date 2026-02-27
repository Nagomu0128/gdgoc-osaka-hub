export const TASK_STATUS = {
  REMAINING: 'remaining',
  IN_PROGRESS: 'in_progress',
  BLOCKED: 'blocked',
  DONE: 'done',
} as const;

export type TaskStatus = (typeof TASK_STATUS)[keyof typeof TASK_STATUS];

export const TASK_STATUS_LABELS: Record<TaskStatus, string> = {
  remaining: 'Remaining',
  in_progress: 'In Progress',
  blocked: 'Blocked',
  done: 'Done',
};

export const ALL_TASK_STATUSES: TaskStatus[] = [
  TASK_STATUS.REMAINING,
  TASK_STATUS.IN_PROGRESS,
  TASK_STATUS.BLOCKED,
  TASK_STATUS.DONE,
];
