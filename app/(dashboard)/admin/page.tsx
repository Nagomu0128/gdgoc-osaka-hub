'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useAllowedEmails } from '@/hooks/useAllowedEmails';
import { useUsers } from '@/hooks/useUsers';
import { AllowedEmailsTable } from '@/components/admin/AllowedEmailsTable';
import { UsersTable } from '@/components/admin/UsersTable';
import { Separator } from '@/components/ui/separator';

export default function AdminPage() {
  const { isAdmin, loading: authLoading } = useAuth();
  const router = useRouter();
  const { emails, loading: emailsLoading, addEmail, removeEmail } = useAllowedEmails();
  const { users, loading: usersLoading } = useUsers();

  useEffect(() => {
    if (!authLoading && !isAdmin) {
      router.replace('/');
    }
  }, [isAdmin, authLoading, router]);

  if (authLoading || !isAdmin) return null;

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div>
        <h2 className="text-xl font-semibold">管理者パネル</h2>
        <p className="text-sm text-muted-foreground mt-1">
          アクセス許可の管理とユーザーの確認ができます
        </p>
      </div>

      <AllowedEmailsTable
        emails={emails}
        loading={emailsLoading}
        onAdd={addEmail}
        onRemove={removeEmail}
      />

      <Separator />

      <UsersTable users={users} loading={usersLoading} />
    </div>
  );
}
