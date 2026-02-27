'use client';

import { CalendarCheck, CalendarX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';

export function CalendarAuthButton() {
  const { appUser, firebaseUser } = useAuth();
  const connected = appUser?.calendarConnected ?? false;

  function handleConnect() {
    if (!firebaseUser) return;
    window.location.href = `/api/auth/calendar?uid=${firebaseUser.uid}`;
  }

  if (connected) {
    return (
      <div className="flex items-center gap-2 text-sm text-green-600">
        <CalendarCheck className="w-4 h-4" />
        Google Calendar 連携済み
      </div>
    );
  }

  return (
    <Button variant="outline" size="sm" className="gap-2" onClick={handleConnect}>
      <CalendarX className="w-4 h-4" />
      Google Calendar を連携する
    </Button>
  );
}
