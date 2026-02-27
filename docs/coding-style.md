# コーディングスタイル

## 絶対に順守しなければならないルール

### 1. 関数型で書く（クラス禁止）

本プロジェクトでは **`class` キーワードを使用しない**。
すべてのロジックを **関数 + プレーンオブジェクト** で表現すること。

#### ドメインエンティティ

```typescript
// ❌ 禁止
export class Task {
  constructor(private props: TaskProps) {}
  update(patch: Partial<TaskProps>): Task { ... }
}

// ✅ 正しい
export interface Task {
  id: string;
  title: string;
  // ...
}

export function createTask(input: CreateTaskInput, createdBy: string, id: string): Task {
  return { id, title: input.title, /* ... */ };
}

export function updateTask(task: Task, patch: Partial<CreateTaskInput>): Task {
  return { ...task, ...patch, updatedAt: new Date() };
}
```

#### リポジトリ実装

```typescript
// ❌ 禁止
export class FirestoreTaskRepository implements ITaskRepository {
  async findAll() { ... }
}

// ✅ 正しい：ファクトリ関数 + インターフェースを満たすオブジェクト
export function createFirestoreTaskRepository(): ITaskRepository {
  return {
    findAll: async (filter?) => { ... },
    save: async (task) => { ... },
    // ...
  };
}

// ✅ モジュールレベルのシングルトンとしてエクスポートも可
export const taskRepository: ITaskRepository = createFirestoreTaskRepository();
```

#### ユースケース

```typescript
// ❌ 禁止
export class CreateTaskUseCase {
  constructor(private repo: ITaskRepository) {}
  async execute(input: CreateTaskInput) { ... }
}

// ✅ 正しい：リポジトリを引数で受け取る関数
export async function createTaskUseCase(
  repository: ITaskRepository,
  input: CreateTaskInput,
  createdBy: string,
): Promise<Task> {
  const id = repository.generateId();
  const task = createTask(input, createdBy, id);
  await repository.save(task);
  return task;
}
```

### 2. エラーハンドリング

`try-catch` を使用する。エラーは `throw` して呼び出し元でキャッチする。

```typescript
export async function findTaskById(
  repository: ITaskRepository,
  id: string,
): Promise<Task | null> {
  try {
    return await repository.findById(id);
  } catch (error) {
    console.error('Failed to find task:', error);
    throw error;
  }
}
```

### 3. TypeScript インターフェース

- `interface` は引き続き使用可能（型定義）
- クラスの代替としての `interface` + 関数パターンを推奨

### 4. React コンポーネント

React コンポーネントは関数コンポーネントで書く（もともと class component は使わない）。

```typescript
// ✅ 正しい
export function TaskCard({ task }: { task: Task }) {
  return <div>{task.title}</div>;
}
```

---

## 採用する理由

- **テスタビリティ**: 関数は純粋関数として単体テストしやすい
- **Tree-shakability**: 使われていない関数は bundle から除外される
- **シンプルさ**: `this` バインドや継承の複雑さがない
- **型安全**: TypeScript の interface + 関数で十分な型安全性を確保できる
