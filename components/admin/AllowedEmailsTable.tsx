'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';
import { Trash2, Plus } from 'lucide-react';
import { AllowedEmail } from '@/domain/user/AllowedEmail';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';

interface AllowedEmailsTableProps {
  emails: AllowedEmail[];
  loading: boolean;
  onAdd: (email: string) => Promise<void>;
  onRemove: (email: string) => Promise<void>;
}

export function AllowedEmailsTable({
  emails,
  loading,
  onAdd,
  onRemove,
}: AllowedEmailsTableProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [saving, setSaving] = useState(false);

  async function handleAdd() {
    if (!newEmail.trim()) return;
    setSaving(true);
    try {
      await onAdd(newEmail.trim());
      setNewEmail('');
      setDialogOpen(false);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">許可メールアドレス</h3>
        <Button size="sm" className="gap-1" onClick={() => setDialogOpen(true)}>
          <Plus className="w-3.5 h-3.5" />
          追加
        </Button>
      </div>

      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>メールアドレス</TableHead>
              <TableHead className="hidden sm:table-cell">追加日時</TableHead>
              <TableHead className="w-16" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={3} className="text-center text-muted-foreground">
                  読み込み中...
                </TableCell>
              </TableRow>
            ) : emails.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} className="text-center text-muted-foreground">
                  登録済みメールアドレスはありません
                </TableCell>
              </TableRow>
            ) : (
              emails.map((e) => (
                <TableRow key={e.email}>
                  <TableCell className="font-mono text-sm">{e.email}</TableCell>
                  <TableCell className="hidden sm:table-cell text-muted-foreground text-sm">
                    {format(e.addedAt, 'yyyy/MM/dd', { locale: ja })}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="w-8 h-8 text-destructive hover:text-destructive"
                      onClick={() => onRemove(e.email)}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>メールアドレスを追加</DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="email">メールアドレス</Label>
            <Input
              id="email"
              type="email"
              placeholder="user@example.com"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              キャンセル
            </Button>
            <Button onClick={handleAdd} disabled={saving || !newEmail.trim()}>
              {saving ? '追加中...' : '追加'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
