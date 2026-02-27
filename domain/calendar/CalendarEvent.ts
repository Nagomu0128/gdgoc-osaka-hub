export interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  taskId?: string;
  description?: string;
}

export function createCalendarEventFromTask(params: {
  id: string;
  taskId: string;
  title: string;
  deadline: Date;
  description?: string;
}): CalendarEvent {
  const start = params.deadline;
  const end = new Date(params.deadline.getTime() + 60 * 60 * 1000); // +1 hour
  return {
    id: params.id,
    title: params.title,
    start,
    end,
    taskId: params.taskId,
    description: params.description,
  };
}
