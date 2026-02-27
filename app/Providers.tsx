'use client';

import dynamic from 'next/dynamic';
import { type ReactNode } from 'react';

const ClientProviders = dynamic(
  () => import('./ClientProviders').then((m) => ({ default: m.ClientProviders })),
  { ssr: false, loading: () => null },
);

export function Providers({ children }: { children: ReactNode }) {
  return <ClientProviders>{children}</ClientProviders>;
}
