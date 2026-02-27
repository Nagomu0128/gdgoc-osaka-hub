import { ITaskRepository } from '@/domain/task/ITaskRepository';
import { Task, CreateTaskInput, updateTask } from '@/domain/task/Task';

export async function updateTaskUseCase(
  repository: ITaskRepository,
  id: string,
  patch: Partial<CreateTaskInput>,
): Promise<Task> {
  try {
    const existing = await repository.findById(id);
    if (!existing) throw new Error(`Task not found: ${id}`);
    const updated = updateTask(existing, patch);
    await repository.save(updated);
    return updated;
  } catch (error) {
    console.error('updateTaskUseCase failed:', error);
    throw error;
  }
}
