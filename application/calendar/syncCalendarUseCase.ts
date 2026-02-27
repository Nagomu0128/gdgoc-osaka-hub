import { ITaskRepository } from '@/domain/task/ITaskRepository';
import { IUserRepository } from '@/domain/user/IUserRepository';
import { updateTaskCalendarEvent } from '@/domain/task/Task';
import {
  pushTaskToCalendar,
  deleteCalendarEvent,
} from '@/infrastructure/calendar/GoogleCalendarService';

export async function syncTaskToCalendarUseCase(
  taskRepository: ITaskRepository,
  userRepository: IUserRepository,
  taskId: string,
  uid: string,
): Promise<void> {
  try {
    const [task, user] = await Promise.all([
      taskRepository.findById(taskId),
      userRepository.findById(uid),
    ]);
    if (!task) throw new Error(`Task not found: ${taskId}`);
    if (!user?.calendarTokens?.accessToken) {
      throw new Error('Calendar not connected');
    }

    const eventId = await pushTaskToCalendar(
      user.calendarTokens.accessToken,
      task,
    );
    const updated = updateTaskCalendarEvent(task, eventId);
    await taskRepository.save(updated);
  } catch (error) {
    console.error('syncTaskToCalendarUseCase failed:', error);
    throw error;
  }
}

export async function removeTaskFromCalendarUseCase(
  taskRepository: ITaskRepository,
  userRepository: IUserRepository,
  taskId: string,
  uid: string,
): Promise<void> {
  try {
    const [task, user] = await Promise.all([
      taskRepository.findById(taskId),
      userRepository.findById(uid),
    ]);
    if (!task?.calendarEventId) return;
    if (!user?.calendarTokens?.accessToken) return;

    await deleteCalendarEvent(
      user.calendarTokens.accessToken,
      task.calendarEventId,
    );
    const updated = updateTaskCalendarEvent(task, null);
    await taskRepository.save(updated);
  } catch (error) {
    console.error('removeTaskFromCalendarUseCase failed:', error);
    throw error;
  }
}
