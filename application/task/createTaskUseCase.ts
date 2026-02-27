import { ITaskRepository } from '@/domain/task/ITaskRepository';
import { Task, CreateTaskInput, createTask } from '@/domain/task/Task';

export async function createTaskUseCase(
  repository: ITaskRepository,
  input: CreateTaskInput,
  createdBy: string,
): Promise<Task> {
  try {
    const id = repository.generateId();
    const task = createTask(input, createdBy, id);
    await repository.save(task);
    return task;
  } catch (error) {
    console.error('createTaskUseCase failed:', error);
    throw error;
  }
}
