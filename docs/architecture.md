# アーキテクチャ: 三層 DDD (Domain-Driven Design)

## 概要

本プロジェクトは **三層 DDD** を採用する。
すべての開発者は以下のルールを**絶対に順守**すること。

---

## 三層の定義

```
┌─────────────────────────────────────────────┐
│          Presentation Layer                  │  ← app/, components/, hooks/, contexts/
│  （プレゼンテーション層）                        │
├─────────────────────────────────────────────┤
│          Application Layer                   │  ← application/
│  （アプリケーション層）                          │
├─────────────────────────────────────────────┤
│           Domain Layer                       │  ← domain/
│  （ドメイン層）                                 │
└─────────────────────────────────────────────┘
           ↑ 各層が依存するインフラ
┌─────────────────────────────────────────────┐
│        Infrastructure Layer                  │  ← infrastructure/
│  （インフラストラクチャ層）                        │
└─────────────────────────────────────────────┘
```

---

## 依存関係のルール（最重要）

```
Presentation → Application → Domain ← Infrastructure
```

- **Domain 層は他の層に依存しない**（純粋なビジネスロジックのみ）
- **Application 層は Domain 層にのみ依存する**
- **Infrastructure 層は Domain 層のリポジトリインターフェースを実装する**
- **Presentation 層は Application 層のユースケースを呼び出す**
- 上位層が下位層を知ることは許可するが、下位層が上位層を知ることは**禁止**

---

## ディレクトリ構成

```
gdgoc-osaka-hub/
│
├── app/                           # [Presentation] Next.js App Router
│   ├── (auth)/login/page.tsx
│   ├── (auth)/unauthorized/page.tsx
│   ├── (dashboard)/
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   ├── tasks/
│   │   ├── calendar/page.tsx
│   │   └── admin/page.tsx
│   ├── api/auth/calendar/
│   └── layout.tsx
│
├── components/                    # [Presentation] UIコンポーネント
│   ├── ui/                       # shadcn/ui 自動生成
│   ├── layout/
│   ├── task/
│   ├── calendar/
│   └── admin/
│
├── hooks/                         # [Presentation] カスタムフック（UI状態・Application呼び出し）
├── contexts/                      # [Presentation] React Context
│
├── application/                   # [Application] ユースケース
│   ├── task/
│   │   ├── CreateTaskUseCase.ts
│   │   ├── UpdateTaskUseCase.ts
│   │   ├── DeleteTaskUseCase.ts
│   │   └── GetTasksUseCase.ts
│   ├── auth/
│   │   └── AuthenticateUseCase.ts
│   └── calendar/
│       └── SyncCalendarUseCase.ts
│
├── domain/                        # [Domain] エンティティ・VO・リポジトリIF
│   ├── task/
│   │   ├── Task.ts               # Task エンティティ
│   │   ├── TaskStatus.ts         # TaskStatus 値オブジェクト
│   │   └── ITaskRepository.ts    # リポジトリインターフェース
│   ├── user/
│   │   ├── User.ts               # User エンティティ
│   │   ├── AllowedEmail.ts       # AllowedEmail 値オブジェクト
│   │   ├── IUserRepository.ts
│   │   └── IAllowedEmailRepository.ts
│   └── calendar/
│       └── CalendarEvent.ts      # CalendarEvent 値オブジェクト
│
├── infrastructure/                # [Infrastructure] リポジトリ実装・外部サービス
│   ├── firebase/
│   │   ├── config.ts             # Firebase Client SDK 初期化
│   │   ├── auth.ts               # signInWithGoogle, signOut
│   │   └── admin.ts              # Firebase Admin SDK（API Routes 用）
│   ├── repositories/
│   │   ├── FirestoreTaskRepository.ts
│   │   ├── FirestoreUserRepository.ts
│   │   └── FirestoreAllowedEmailRepository.ts
│   └── calendar/
│       ├── GoogleCalendarClient.ts
│       └── GoogleCalendarService.ts
│
├── lib/
│   └── utils.ts                  # cn() などのユーティリティ（層に属さない共通処理）
│
├── types/                        # 共通型定義（DTO・外部API型など）
│   ├── task.ts
│   ├── user.ts
│   └── calendar.ts
│
└── functions/                    # Cloud Functions（Infrastructure に相当）
    └── src/
        ├── auth/onUserCreate.ts
        ├── tasks/onTaskWrite.ts
        └── calendar/webhook.ts
```

---

## 各層の詳細

### Domain 層（`domain/`）

**責務**: ビジネスルールとドメイン知識を表現する。外部依存ゼロ。

| ファイル種別 | 説明 | 例 |
|---|---|---|
| Entity | 識別子を持つドメインオブジェクト | `Task.ts`, `User.ts` |
| Value Object | 不変・識別子なしのドメイン概念 | `TaskStatus.ts`, `CalendarEvent.ts` |
| Repository Interface | データアクセスの抽象（実装はInfra層） | `ITaskRepository.ts` |

```typescript
// 例: domain/task/ITaskRepository.ts
import { Task } from './Task';

export interface ITaskRepository {
  findAll(): Promise<Task[]>;
  findById(id: string): Promise<Task | null>;
  save(task: Task): Promise<void>;
  delete(id: string): Promise<void>;
  subscribeAll(callback: (tasks: Task[]) => void): () => void;
}
```

### Application 層（`application/`）

**責務**: ユースケースの実装。Domain 層を orchestrate する。UIや永続化の詳細を知らない。

```typescript
// 例: application/task/CreateTaskUseCase.ts
import { ITaskRepository } from '@/domain/task/ITaskRepository';
import { Task } from '@/domain/task/Task';
import { TaskFormData } from '@/types/task';

export class CreateTaskUseCase {
  constructor(private taskRepository: ITaskRepository) {}

  async execute(data: TaskFormData, createdBy: string): Promise<Task> {
    const task = Task.create(data, createdBy);
    await this.taskRepository.save(task);
    return task;
  }
}
```

### Infrastructure 層（`infrastructure/`）

**責務**: Domain のリポジトリインターフェースを Firestore で実装。外部サービスとの通信。

```typescript
// 例: infrastructure/repositories/FirestoreTaskRepository.ts
import { ITaskRepository } from '@/domain/task/ITaskRepository';
import { Task } from '@/domain/task/Task';
import { collection, getDocs, ... } from 'firebase/firestore';

export class FirestoreTaskRepository implements ITaskRepository {
  async findAll(): Promise<Task[]> { ... }
  async save(task: Task): Promise<void> { ... }
  // ...
}
```

### Presentation 層（`app/`, `components/`, `hooks/`, `contexts/`）

**責務**: UIレンダリングとユーザーインタラクション。Application 層のユースケースを呼び出す。

```typescript
// 例: hooks/useTasks.ts
import { CreateTaskUseCase } from '@/application/task/CreateTaskUseCase';
import { FirestoreTaskRepository } from '@/infrastructure/repositories/FirestoreTaskRepository';

const taskRepository = new FirestoreTaskRepository();
const createTaskUseCase = new CreateTaskUseCase(taskRepository);

export function useTasks() {
  // ...
  const createTask = async (data: TaskFormData) => {
    await createTaskUseCase.execute(data, user.uid);
  };
  // ...
}
```

---

## 命名規則

| 層 | ファイル名形式 | 例 |
|---|---|---|
| Domain Entity | `PascalCase.ts` | `Task.ts` |
| Domain Interface | `I + PascalCase.ts` | `ITaskRepository.ts` |
| Application UseCase | `PascalCaseUseCase.ts` | `CreateTaskUseCase.ts` |
| Infrastructure Repository | `PascalCase + Repository.ts` | `FirestoreTaskRepository.ts` |
| Presentation Component | `PascalCase.tsx` | `TaskBoard.tsx` |
| Presentation Hook | `use + PascalCase.ts` | `useTasks.ts` |

---

## 禁止事項

- Domain 層から `firebase`, `react`, `next` などのライブラリを import すること
- Application 層から `firebase/firestore` を直接呼び出すこと（必ずリポジトリ経由）
- Presentation 層（hooks/components）から Firestore を直接呼び出すこと
- Infrastructure 層の具体クラスを Domain / Application 層の型として使うこと

---

## 旧 `lib/firestore/` との対応

旧計画の `lib/firestore/tasks.ts` 等は以下に移行する：

| 旧パス | 新パス |
|---|---|
| `lib/firebase/config.ts` | `infrastructure/firebase/config.ts` |
| `lib/firebase/auth.ts` | `infrastructure/firebase/auth.ts` |
| `lib/firebase/admin.ts` | `infrastructure/firebase/admin.ts` |
| `lib/firestore/tasks.ts` | `infrastructure/repositories/FirestoreTaskRepository.ts` |
| `lib/firestore/users.ts` | `infrastructure/repositories/FirestoreUserRepository.ts` |
| `lib/firestore/allowedEmails.ts` | `infrastructure/repositories/FirestoreAllowedEmailRepository.ts` |
| `lib/calendar/client.ts` | `infrastructure/calendar/GoogleCalendarClient.ts` |
| `lib/calendar/sync.ts` | `infrastructure/calendar/GoogleCalendarService.ts` |
