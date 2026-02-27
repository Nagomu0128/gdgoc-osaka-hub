# 実装計画: Firebase タスク管理ダッシュボード

## Context

GDGoC Osaka Hub のタスク管理 Web アプリを Firebase を用いて実装する。
PRD に基づき、Google 認証・タスク管理・Admin パネル・Google Calendar 双方向同期を持つ
モバイル対応ダッシュボードを Next.js 16 App Router + shadcn/ui で構築する。

**アーキテクチャ**: 三層 DDD を採用。詳細は [architecture.md](./architecture.md) を参照。

---

## 技術スタック

| 項目 | 採用技術 |
|---|---|
| フロントエンド | Next.js 16.1.6 (App Router), React 19, TypeScript |
| スタイル | Tailwind CSS v4, shadcn/ui |
| 認証 | Firebase Auth (Google Sign-In) |
| DB | Firestore |
| ホスティング | Firebase Hosting (Next.js フレームワーク対応) |
| サーバー処理 | Cloud Functions for Firebase (Node.js 20) |
| Calendar | Google Calendar API v3 |

---

## ディレクトリ構成（三層 DDD 対応版）

```
gdgoc-osaka-hub/
│
├── app/                           # [Presentation] Next.js App Router
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   └── unauthorized/page.tsx
│   ├── (dashboard)/
│   │   ├── layout.tsx             # ルートガード + Sidebar + Header
│   │   ├── page.tsx               # ダッシュボード（統計・概要）
│   │   ├── tasks/
│   │   │   ├── page.tsx           # タスク一覧（カンバン / テーブル切替）
│   │   │   ├── new/page.tsx
│   │   │   └── [taskId]/page.tsx
│   │   ├── calendar/page.tsx
│   │   └── admin/page.tsx
│   ├── api/auth/calendar/
│   │   ├── route.ts
│   │   └── callback/route.ts
│   ├── layout.tsx                 # Root layout (AuthProvider)
│   └── globals.css
│
├── components/                    # [Presentation] UIコンポーネント
│   ├── ui/                       # shadcn/ui 生成
│   ├── layout/
│   │   ├── Sidebar.tsx
│   │   ├── Header.tsx
│   │   └── MobileNav.tsx
│   ├── task/
│   │   ├── TaskBoard.tsx
│   │   ├── TaskCard.tsx
│   │   ├── TaskForm.tsx
│   │   ├── TaskStatusBadge.tsx
│   │   ├── TaskFilters.tsx
│   │   └── TaskDependencyPicker.tsx
│   ├── calendar/
│   │   ├── CalendarView.tsx
│   │   ├── CalendarAuthButton.tsx
│   │   └── CalendarSyncButton.tsx
│   └── admin/
│       ├── AllowedEmailsTable.tsx
│       └── UsersTable.tsx
│
├── contexts/                      # [Presentation] React Context
│   └── AuthContext.tsx
│
├── hooks/                         # [Presentation] カスタムフック
│   ├── useAuth.ts
│   ├── useTasks.ts
│   ├── useTask.ts
│   ├── useUsers.ts
│   ├── useAllowedEmails.ts
│   └── useCalendarSync.ts
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
│   │   ├── Task.ts
│   │   ├── TaskStatus.ts
│   │   └── ITaskRepository.ts
│   ├── user/
│   │   ├── User.ts
│   │   ├── AllowedEmail.ts
│   │   ├── IUserRepository.ts
│   │   └── IAllowedEmailRepository.ts
│   └── calendar/
│       └── CalendarEvent.ts
│
├── infrastructure/                # [Infrastructure] リポジトリ実装・外部連携
│   ├── firebase/
│   │   ├── config.ts
│   │   ├── auth.ts
│   │   └── admin.ts
│   ├── repositories/
│   │   ├── FirestoreTaskRepository.ts
│   │   ├── FirestoreUserRepository.ts
│   │   └── FirestoreAllowedEmailRepository.ts
│   └── calendar/
│       ├── GoogleCalendarClient.ts
│       └── GoogleCalendarService.ts
│
├── lib/
│   └── utils.ts                  # cn() など共通ユーティリティ
│
├── types/                        # 共通型定義（DTO等）
│   ├── task.ts
│   ├── user.ts
│   └── calendar.ts
│
├── functions/                    # Cloud Functions
│   ├── src/
│   │   ├── index.ts
│   │   ├── auth/onUserCreate.ts
│   │   ├── tasks/onTaskWrite.ts
│   │   └── calendar/webhook.ts
│   ├── package.json
│   └── tsconfig.json
│
├── firebase.json
├── .firebaserc
├── firestore.rules
├── firestore.indexes.json
└── components.json
```

---

## Firestore データモデル

### `allowedEmails/{email}`
```
email: string          # ドキュメント ID と同一
addedBy: string        # 追加した Admin の UID
addedAt: Timestamp
```

### `users/{uid}`
```
uid: string
email: string
displayName: string
photoURL: string | null
isAdmin: boolean
calendarConnected: boolean
calendarTokens: { accessToken, refreshToken, expiresAt } | null
createdAt: Timestamp
lastLoginAt: Timestamp
```

### `tasks/{taskId}`
```
title: string
description: string
status: 'remaining' | 'in_progress' | 'blocked' | 'done'
assigneeUid: string | null
assigneeName: string | null
deadline: Timestamp | null
parentTaskId: string | null
calendarEventId: string | null
calendarEventUpdatedAt: Timestamp | null
createdBy: string
createdAt: Timestamp
updatedAt: Timestamp
```

---

## 認証フロー

```
1. ユーザーが Google サインイン
2. Firebase Auth 完了 → onAuthStateChanged 発火
3. Firestore: allowedEmails/{user.email} 存在チェック
   - 存在しない → signOut() → /unauthorized へリダイレクト
   - 存在する  → 続行
4. Firestore: users/{uid} doc 作成 or 更新 (lastLoginAt)
5. users/{uid}.isAdmin を読み取り AuthContext にセット
6. (dashboard) layout.tsx のルートガードが通過を許可
```

---

## Google Calendar 双方向同期

### Task → Calendar（クライアント側）
- タスクの deadline が設定/変更された時
- `SyncCalendarUseCase` を呼び出し
- Calendar イベントの `extendedProperties.private.taskId` にタスク ID を保存
- 返却された eventId を `tasks/{taskId}.calendarEventId` に保存

### Calendar → Task（Cloud Functions）
- Google Calendar push notification を webhook で受信
- `extendedProperties.private.taskId` でタスクを特定
- `tasks/{taskId}.deadline` を更新

---

## 実装フェーズ

### Phase 0: 基盤セットアップ ✅
- 依存パッケージインストール
- `app/globals.css` に shadcn CSS 変数追加
- `.env.local` 作成
- `types/` 全ファイル作成
- `lib/utils.ts` (cn helper)
- `components.json` (shadcn/ui 設定)
- `firebase.json`, `.firebaserc`, `firestore.rules`, `firestore.indexes.json`

### Phase 1: Domain 層
- `domain/task/Task.ts`, `TaskStatus.ts`, `ITaskRepository.ts`
- `domain/user/User.ts`, `AllowedEmail.ts`, `IUserRepository.ts`, `IAllowedEmailRepository.ts`
- `domain/calendar/CalendarEvent.ts`

### Phase 2: Infrastructure 層
- `infrastructure/firebase/config.ts`, `auth.ts`, `admin.ts`
- `infrastructure/repositories/FirestoreTaskRepository.ts`
- `infrastructure/repositories/FirestoreUserRepository.ts`
- `infrastructure/repositories/FirestoreAllowedEmailRepository.ts`
- `infrastructure/calendar/GoogleCalendarClient.ts`
- `infrastructure/calendar/GoogleCalendarService.ts`

### Phase 3: Application 層
- `application/task/CreateTaskUseCase.ts`
- `application/task/UpdateTaskUseCase.ts`
- `application/task/DeleteTaskUseCase.ts`
- `application/task/GetTasksUseCase.ts`
- `application/auth/AuthenticateUseCase.ts`
- `application/calendar/SyncCalendarUseCase.ts`

### Phase 4: 認証・AuthContext（Presentation）
- `contexts/AuthContext.tsx`
- `hooks/useAuth.ts`
- `app/layout.tsx` 更新（AuthProvider）
- `app/(auth)/login/page.tsx`
- `app/(auth)/unauthorized/page.tsx`
- `app/(dashboard)/layout.tsx`（ルートガード）

### Phase 5: レイアウトコンポーネント（Presentation）
- `components/layout/Sidebar.tsx`
- `components/layout/Header.tsx`
- `components/layout/MobileNav.tsx`
- `app/(dashboard)/page.tsx`

### Phase 6: タスク管理（Presentation）
- `hooks/useTasks.ts`, `useTask.ts`, `useUsers.ts`
- `components/task/` 全コンポーネント
- `app/(dashboard)/tasks/` 全ページ

### Phase 7: Admin パネル（Presentation）
- `hooks/useAllowedEmails.ts`
- `components/admin/` 全コンポーネント
- `app/(dashboard)/admin/page.tsx`

### Phase 8: Google Calendar 連携（Presentation + Infrastructure）
- `app/api/auth/calendar/` OAuth ルート
- `hooks/useCalendarSync.ts`
- `components/calendar/` 全コンポーネント
- `app/(dashboard)/calendar/page.tsx`

### Phase 9: Cloud Functions（Infrastructure）
- `functions/` 全ファイル

---

## Firestore セキュリティルール

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    function isAdmin() {
      return request.auth != null &&
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.isAdmin == true;
    }
    function isAllowedUser() {
      return request.auth != null &&
        exists(/databases/$(database)/documents/allowedEmails/$(request.auth.token.email));
    }

    match /allowedEmails/{email} {
      allow read: if request.auth.token.email == email || isAdmin();
      allow write: if isAdmin();
    }
    match /users/{uid} {
      allow read: if isAllowedUser();
      allow create: if request.auth.uid == uid;
      allow update: if request.auth.uid == uid || isAdmin();
    }
    match /tasks/{taskId} {
      allow read, write: if isAllowedUser();
    }
  }
}
```

---

## 環境変数（.env.local）

```
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
FIREBASE_ADMIN_PRIVATE_KEY=
FIREBASE_ADMIN_CLIENT_EMAIL=
GOOGLE_CALENDAR_CLIENT_ID=
GOOGLE_CALENDAR_CLIENT_SECRET=
GOOGLE_CALENDAR_REDIRECT_URI=http://localhost:3000/api/auth/calendar/callback
```
