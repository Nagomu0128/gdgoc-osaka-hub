import { redirect } from 'next/navigation';

// app/(dashboard)/page.tsx と URL 競合するため、/dashboard へ転送
export default function RootPage() {
  redirect('/dashboard');
}
