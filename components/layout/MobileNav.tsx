'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, CheckSquare, Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/dashboard', label: 'ホーム', icon: LayoutDashboard },
  { href: '/tasks', label: 'タスク', icon: CheckSquare },
  { href: '/calendar', label: 'カレンダー', icon: Calendar },
];

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="md:hidden fixed bottom-0 inset-x-0 border-t bg-card z-10">
      <div className="flex">
        {navItems.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              'flex-1 flex flex-col items-center gap-1 py-2 text-xs font-medium transition-colors',
              pathname === href
                ? 'text-primary'
                : 'text-muted-foreground hover:text-foreground',
            )}
          >
            <Icon className="w-5 h-5" />
            {label}
          </Link>
        ))}
      </div>
    </nav>
  );
}
