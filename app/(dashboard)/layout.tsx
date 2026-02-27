'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { MobileNav } from '@/components/layout/MobileNav';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { AlertCircle, RefreshCw } from 'lucide-react';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { firebaseUser, loading, authError, retryAuth } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // firebaseUser が null かつ loading 完了 = 未ログイン → /login へ
    // authError がある場合は Firestore 側の問題なのでリダイレクトしない
    if (!loading && !firebaseUser && !authError) {
      router.replace('/login');
    }
  }, [firebaseUser, loading, authError, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Skeleton className="w-48 h-8" />
      </div>
    );
  }

  // Firebase Auth は成功したが Firestore チェックが失敗した場合
  if (authError) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 p-4">
        <AlertCircle className="w-10 h-10 text-destructive" />
        <p className="font-semibold text-lg">データの読み込みに失敗しました</p>
        <p className="text-sm text-muted-foreground max-w-md text-center">
          Firestore のセキュリティルールが未デプロイか、ネットワークエラーの可能性があります。
        </p>
        <details className="text-xs text-muted-foreground bg-muted rounded p-2 max-w-md w-full">
          <summary className="cursor-pointer">エラー詳細</summary>
          <pre className="mt-1 whitespace-pre-wrap break-all">{authError}</pre>
        </details>
        <Button onClick={retryAuth} className="gap-2">
          <RefreshCw className="w-4 h-4" />
          再試行
        </Button>
      </div>
    );
  }

  if (!firebaseUser) return null;

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Header />
        <main className="flex-1 p-4 md:p-6 pb-20 md:pb-6 overflow-auto">
          {children}
        </main>
      </div>
      <MobileNav />
    </div>
  );
}
