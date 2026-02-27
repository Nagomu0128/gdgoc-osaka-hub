import { redirect } from 'next/navigation';

// ダッシュボード概要は /dashboard/page.tsx に移動済み
export default function DashboardRootPage() {
  redirect('/dashboard');
}
