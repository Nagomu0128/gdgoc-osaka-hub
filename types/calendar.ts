export interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  taskId?: string;
  description?: string;
}

export interface GoogleCalendarEvent {
  id: string;
  summary: string;
  description?: string;
  start: {
    dateTime: string;
    timeZone?: string;
  };
  end: {
    dateTime: string;
    timeZone?: string;
  };
  extendedProperties?: {
    private?: {
      taskId?: string;
    };
  };
}
