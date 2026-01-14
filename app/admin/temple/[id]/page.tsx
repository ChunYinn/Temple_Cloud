import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { Navigation } from '@/components/navigation';
import { TempleManagement } from './temple-management';
import { prisma } from '@/lib/db';

export default async function TemplePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { userId } = await auth();
  const { id } = await params;

  if (!userId) {
    redirect('/sign-in');
  }

  // Get temple data with authorization check
  const temple = await prisma.temples.findFirst({
    where: {
      id,
      members: {
        some: {
          auth_user_id: userId,
        },
      },
    },
  });

  if (!temple) {
    redirect('/admin');
  }

  return (
    <div className="min-h-screen bg-stone-50">
      <Navigation />
      <div className="pt-14">
        <TempleManagement temple={temple} />
      </div>
    </div>
  );
}