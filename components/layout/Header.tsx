'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

const PAGE_TITLES: Record<string, string> = {
  '/dashboard': 'ダッシュボード',
  '/tasks': 'タスク',
  '/tasks/new': '新規タスク',
  '/calendar': 'カレンダー',
  '/admin': '管理者パネル',
};

export function Header() {
  const pathname = usePathname();
  const title = PAGE_TITLES[pathname] ?? 'GDGoC Osaka Hub';
  const isTasksPage = pathname === '/tasks';

  return (
    <header className="border-b bg-card px-4 md:px-6 h-14 flex items-center justify-between sticky top-0 z-10">
      <h2 className="font-semibold text-base">{title}</h2>
      {isTasksPage && (
        <Button asChild size="sm" className="gap-1">
          <Link href="/tasks/new">
            <Plus className="w-4 h-4" />
            新規タスク
          </Link>
        </Button>
      )}
    </header>
  );
}
