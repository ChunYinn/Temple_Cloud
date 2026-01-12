import { prisma } from '@/lib/db';

export async function getTempleBySlug(slug: string) {
  return prisma.temples.findUnique({
    where: { slug }
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
