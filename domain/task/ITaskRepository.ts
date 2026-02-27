import { Task, CreateTaskInput } from './Task';
import { TaskStatus } from './TaskStatus';

export interface TaskFilter {
  status?: TaskStatus;
  assigneeUid?: string;
}

export interface ITaskRepository {
  findAll(filter?: TaskFilter): Promise<Task[]>;
  findById(id: string): Promise<Task | null>;
  save(task: Task): Promise<void>;
  delete(id: string): Promise<void>;
  subscribeAll(
    callback: (tasks: Task[]) => void,
    filter?: TaskFilter,
  ): () => void;
  generateId(): string;
}
