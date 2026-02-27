import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/40 p-4">
      <Card className="w-full max-w-sm text-center">
        <CardHeader>
          <CardTitle className="text-xl">アクセスが拒否されました</CardTitle>
          <CardDescription>
            このアプリへのアクセス権限がありません。
            管理者にメールアドレスの登録を依頼してください。
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild variant="outline" className="w-full">
            <Link href="/login">ログインページへ戻る</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
