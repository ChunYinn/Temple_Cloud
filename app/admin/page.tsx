import type { Metadata } from 'next';
import { AdminDashboardV2 } from '@/components/admin-dashboard-v2';
import { auth, currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { getUserTemples } from '@/lib/subdomains';

export const metadata: Metadata = {
  title: `管理後台 | 廟務雲`,
  description: `管理您的寺廟頁面`
};

export default async function AdminPage() {
  const { userId } = await auth();
  const user = await currentUser();

  if (!userId) {
    redirect('/sign-in');
  }

  const tenants = (await getUserTemples(userId)).map((tenant) => ({
    ...tenant,
    created_at: tenant.created_at.toISOString()
  }));

  const userName = user?.firstName || user?.username || '使用者';

  return <AdminDashboardV2 tenants={tenants} userName={userName} />;
}
