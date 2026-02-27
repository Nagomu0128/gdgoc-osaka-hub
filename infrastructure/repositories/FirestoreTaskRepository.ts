import {
  getFirestore,
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  deleteDoc,
  onSnapshot,
  query,
  where,
  orderBy,
  Timestamp,
  DocumentData,
} from 'firebase/firestore';
import { firebaseApp } from '../firebase/config';
import { ITaskRepository, TaskFilter } from '@/domain/task/ITaskRepository';
import { Task } from '@/domain/task/Task';

const db = getFirestore(firebaseApp);
const tasksCol = collection(db, 'tasks');

function toTask(id: string, data: DocumentData): Task {
  return {
    id,
    title: data.title,
    description: data.description ?? '',
    status: data.status,
    assigneeUid: data.assigneeUid ?? null,
    assigneeName: data.assigneeName ?? null,
    deadline:
      data.deadline instanceof Timestamp ? data.deadline.toDate() : null,
    parentTaskId: data.parentTaskId ?? null,
    calendarEventId: data.calendarEventId ?? null,
    calendarEventUpdatedAt:
      data.calendarEventUpdatedAt instanceof Timestamp
        ? data.calendarEventUpdatedAt.toDate()
        : null,
    createdBy: data.createdBy,
    createdAt:
      data.createdAt instanceof Timestamp ? data.createdAt.toDate() : new Date(),
    updatedAt:
      data.updatedAt instanceof Timestamp ? data.updatedAt.toDate() : new Date(),
  };
}

function toFirestore(task: Task): DocumentData {
  return {
    title: task.title,
    description: task.description,
    status: task.status,
    assigneeUid: task.assigneeUid,
    assigneeName: task.assigneeName,
    deadline: task.deadline ? Timestamp.fromDate(task.deadline) : null,
    parentTaskId: task.parentTaskId,
    calendarEventId: task.calendarEventId,
    calendarEventUpdatedAt: task.calendarEventUpdatedAt
      ? Timestamp.fromDate(task.calendarEventUpdatedAt)
      : null,
    createdBy: task.createdBy,
    createdAt: Timestamp.fromDate(task.createdAt),
    updatedAt: Timestamp.fromDate(task.updatedAt),
  };
}

function buildQuery(filter?: TaskFilter) {
  let q = query(tasksCol, orderBy('createdAt', 'desc'));
  if (filter?.status) {
    q = query(q, where('status', '==', filter.status));
  }
  if (filter?.assigneeUid) {
    q = query(q, where('assigneeUid', '==', filter.assigneeUid));
  }
  return q;
}

export function createFirestoreTaskRepository(): ITaskRepository {
  return {
    async findAll(filter?) {
      try {
        const snapshot = await getDocs(buildQuery(filter));
        return snapshot.docs.map((d) => toTask(d.id, d.data()));
      } catch (error) {
        console.error('Failed to findAll tasks:', error);
        throw error;
      }
    },

    async findById(id) {
      try {
        const snapshot = await getDoc(doc(tasksCol, id));
        if (!snapshot.exists()) return null;
        return toTask(snapshot.id, snapshot.data());
      } catch (error) {
        console.error('Failed to findById task:', error);
        throw error;
      }
    },

    async save(task) {
      try {
        await setDoc(doc(tasksCol, task.id), toFirestore(task));
      } catch (error) {
        console.error('Failed to save task:', error);
        throw error;
      }
    },

    async delete(id) {
      try {
        await deleteDoc(doc(tasksCol, id));
      } catch (error) {
        console.error('Failed to delete task:', error);
        throw error;
      }
    },

    subscribeAll(callback, filter?) {
      return onSnapshot(buildQuery(filter), (snapshot) => {
        const tasks = snapshot.docs.map((d) => toTask(d.id, d.data()));
        callback(tasks);
      });
    },

    generateId() {
      return doc(tasksCol).id;
    },
  };
}

export const taskRepository: ITaskRepository = createFirestoreTaskRepository();
