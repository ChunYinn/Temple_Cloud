import type { Metadata } from 'next';
import { Navigation } from '@/components/navigation';
import { AdminDashboard } from './dashboard';
import { rootDomain } from '@/lib/utils';
import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { getUserTemples } from '@/lib/subdomains';

export const metadata: Metadata = {
  title: `管理後台 | 廟務雲`,
  description: `管理您的寺廟頁面`
};

export default async function AdminPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect('/sign-in');
  }

  const tenants = (await getUserTemples(userId)).map((tenant) => ({
    ...tenant,
    created_at: tenant.created_at.toISOString()
  }));

  return (
    <div className="min-h-screen bg-stone-50">
      <Navigation />
      <div className="pt-14">
        <AdminDashboard tenants={tenants} />
      </div>
    </div>
  );
}
