import { prisma } from '@/lib/db';

export async function getTempleBySlug(slug: string) {
  return prisma.temples.findUnique({
    where: { slug },
    include: {
      events: {
        where: {
          is_active: true,
          event_date: {
            gte: new Date() // Only get future/today's events
          }
        },
        orderBy: {
          event_date: 'asc'
        },
        take: 10 // Limit to 10 upcoming events
      },
      services: {
        where: {
          is_active: true
        },
        orderBy: {
          sort_order: 'asc'
        }
      }
    }
  });
}

export async function getUserTemples(authUserId: string) {
  return prisma.temples.findMany({
    where: { created_by_auth_user_id: authUserId },
    orderBy: { created_at: 'desc' }
  });
}

export async function isSlugTaken(slug: string) {
  const existing = await prisma.temples.findUnique({
    where: { slug },
    select: { id: true }
  });

  return Boolean(existing);
}
