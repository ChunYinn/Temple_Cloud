import type { Metadata } from 'next';
import { AdminDashboard } from './dashboard';
import { rootDomain } from '@/lib/utils';
import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { getUserTemples } from '@/lib/subdomains';

export const metadata: Metadata = {
  title: `Admin Dashboard | ${rootDomain}`,
  description: `Manage subdomains for ${rootDomain}`
};

export default async function AdminPage() {
  const { userId } = auth();

  if (!userId) {
    redirect('/sign-in');
  }

  const tenants = (await getUserTemples(userId)).map((tenant) => ({
    ...tenant,
    created_at: tenant.created_at.toISOString()
  }));

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <AdminDashboard tenants={tenants} />
    </div>
  );
}
