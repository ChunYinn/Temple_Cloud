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

  // Get current date for stats calculation
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  // Get temple data with authorization check and include related data
  const temple = await prisma.temples.findFirst({
    where: {
      id,
      members: {
        some: {
          auth_user_id: userId,
        },
      },
    },
    include: {
      // Get events
      events: {
        orderBy: { event_date: 'desc' },
        take: 10,
      },
      // Get recent orders
      orders: {
        orderBy: { created_at: 'desc' },
        take: 5,
      },
      // Get monthly stats
      stats: {
        where: {
          date: {
            gte: startOfMonth,
          },
        },
      },
    },
  });

  if (!temple) {
    redirect('/admin');
  }

  // Calculate aggregated stats
  const monthlyStats = {
    views: temple.stats.reduce((sum, stat) => sum + stat.views, 0),
    uniqueVisitors: temple.stats.reduce((sum, stat) => sum + stat.unique_visitors, 0),
    donationsAmount: temple.stats.reduce((sum, stat) => sum + stat.donations_amount, 0),
    ordersCount: temple.stats.reduce((sum, stat) => sum + stat.orders_count, 0),
  };

  // Get event registrations count
  const eventRegistrations = temple.events.reduce(
    (sum, event) => sum + event.current_registrations,
    0
  );

  // Prepare temple data with stats
  const templeWithStats = {
    ...temple,
    monthlyStats,
    eventRegistrations,
  };

  return (
    <div className="min-h-screen bg-stone-50">
      <Navigation />
      <div className="pt-14">
        <TempleManagement temple={templeWithStats} />
      </div>
    </div>
  );
}