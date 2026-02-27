'use client';

import { format } from 'date-fns';
import { ja } from 'date-fns/locale';
import { User } from '@/domain/user/User';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

export function UsersTable({ users, loading }: { users: User[]; loading: boolean }) {
  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold">登録ユーザー</h3>
      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ユーザー</TableHead>
              <TableHead className="hidden sm:table-cell">最終ログイン</TableHead>
              <TableHead>権限</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={3} className="text-center text-muted-foreground">
                  読み込み中...
                </TableCell>
              </TableRow>
            ) : users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} className="text-center text-muted-foreground">
                  ユーザーがいません
                </TableCell>
              </TableRow>
            ) : (
              users.map((u) => (
                <TableRow key={u.uid}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Avatar className="w-7 h-7">
                        <AvatarImage src={u.photoURL ?? undefined} />
                        <AvatarFallback className="text-xs">
                          {u.displayName.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">{u.displayName}</p>
                        <p className="text-xs text-muted-foreground truncate">{u.email}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell text-muted-foreground text-sm">
                    {format(u.lastLoginAt, 'yyyy/MM/dd HH:mm', { locale: ja })}
                  </TableCell>
                  <TableCell>
                    {u.isAdmin ? (
                      <Badge className="text-xs">Admin</Badge>
                    ) : (
                      <Badge variant="secondary" className="text-xs">
                        Member
                      </Badge>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
