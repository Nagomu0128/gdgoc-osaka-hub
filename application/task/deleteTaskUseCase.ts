import { ITaskRepository } from '@/domain/task/ITaskRepository';

export async function deleteTaskUseCase(
  repository: ITaskRepository,
  id: string,
): Promise<void> {
  try {
    await repository.delete(id);
  } catch (error) {
    console.error('deleteTaskUseCase failed:', error);
    throw error;
  }
}
