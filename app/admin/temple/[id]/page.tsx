import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { Navigation } from '@/components/navigation';
import { TempleManagement } from './temple-management';
import { db } from '@/lib/db';

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
  const temple = await db.temples.findFirst({
    where: {
      id,
      member: {
        some: {
          user_id: userId,
        },
      },
    },
    include: {
      page: {
        include: {
          blocks: true,
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