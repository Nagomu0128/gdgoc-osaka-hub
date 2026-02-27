'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  CheckSquare,
  Calendar,
  Settings,
  LogOut,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';

const navItems = [
  { href: '/dashboard', label: 'ダッシュボード', icon: LayoutDashboard },
  { href: '/tasks', label: 'タスク', icon: CheckSquare },
  { href: '/calendar', label: 'カレンダー', icon: Calendar },
];

export function Sidebar() {
  const pathname = usePathname();
  const { appUser, isAdmin, signOut } = useAuth();

  return (
    <aside className="hidden md:flex flex-col w-60 border-r bg-card h-screen sticky top-0">
      <div className="p-4">
        <h1 className="font-bold text-lg text-primary">GDGoC Osaka Hub</h1>
      </div>
      <Separator />
      <nav className="flex-1 p-3 space-y-1">
        {navItems.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground',
              pathname === href
                ? 'bg-accent text-accent-foreground'
                : 'text-muted-foreground',
            )}
          >
            <Icon className="w-4 h-4" />
            {label}
          </Link>
        ))}
        {isAdmin && (
          <Link
            href="/admin"
            className={cn(
              'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground',
              pathname === '/admin'
                ? 'bg-accent text-accent-foreground'
                : 'text-muted-foreground',
            )}
          >
            <Settings className="w-4 h-4" />
            管理者パネル
          </Link>
        )}
      </nav>
      <Separator />
      <div className="p-3">
        <div className="flex items-center gap-3 px-3 py-2 mb-2">
          <Avatar className="w-8 h-8">
            <AvatarImage src={appUser?.photoURL ?? undefined} />
            <AvatarFallback>
              {appUser?.displayName?.charAt(0) ?? 'U'}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{appUser?.displayName}</p>
            <p className="text-xs text-muted-foreground truncate">{appUser?.email}</p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start gap-3 text-muted-foreground"
          onClick={signOut}
        >
          <LogOut className="w-4 h-4" />
          サインアウト
        </Button>
      </div>
    </aside>
  );
}
