import { ITaskRepository, TaskFilter } from '@/domain/task/ITaskRepository';
import { Task } from '@/domain/task/Task';

export async function getTasksUseCase(
  repository: ITaskRepository,
  filter?: TaskFilter,
): Promise<Task[]> {
  try {
    return await repository.findAll(filter);
  } catch (error) {
    console.error('getTasksUseCase failed:', error);
    throw error;
  }
}

export async function getTaskByIdUseCase(
  repository: ITaskRepository,
  id: string,
): Promise<Task | null> {
  try {
    return await repository.findById(id);
  } catch (error) {
    console.error('getTaskByIdUseCase failed:', error);
    throw error;
  }
}
