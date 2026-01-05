'use server';

import { auth } from '@clerk/nextjs/server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

import { prisma } from '@/lib/db';
import { protocol, rootDomain, sanitizeSlug } from '@/lib/utils';

type ActionState = {
  error?: string;
  success?: string;
  slug?: string;
};

export async function createTempleAction(
  _prevState: ActionState,
  formData: FormData
) {
  const { userId } = await auth();

  console.log('Debug - userId:', userId); // 除錯用

  if (!userId) {
    return { error: '請先登入以建立寺廟' };
  }

  const name = (formData.get('name') as string)?.trim();
  const rawSlug = (formData.get('slug') as string) ?? '';
  const intro = (formData.get('intro') as string)?.trim() || null;
  const address = (formData.get('address') as string)?.trim() || null;
  const phone = (formData.get('phone') as string)?.trim() || null;
  const timezone = 'Asia/Taipei'; // Fixed for Taiwan

  const slug = sanitizeSlug(rawSlug);

  if (!name || !slug) {
    return { error: '請輸入寺廟名稱和網址名稱' };
  }

  const isTaken = await prisma.temples.findUnique({
    where: { slug },
    select: { id: true }
  });

  if (isTaken) {
    return { error: '此網址名稱已被使用，請選擇其他名稱', slug };
  }

  const temple = await prisma.$transaction(async (tx) => {
    const createdTemple = await tx.temples.create({
      data: {
        name,
        slug,
        intro,
        address,
        phone,
        timezone,
        created_by_auth_user_id: userId
      }
    });

    await tx.temple_members.create({
      data: {
        temple_id: createdTemple.id,
        auth_user_id: userId,
        role: 'admin'
      }
    });

    await tx.temple_pages.create({
      data: {
        temple_id: createdTemple.id,
        theme: 'calm'
      }
    });

    return createdTemple;
  });

  revalidatePath('/admin');
  redirect(`${protocol}://${temple.slug}.${rootDomain}`);
}

export async function deleteTempleAction(
  _prevState: ActionState,
  formData: FormData
) {
  const { userId } = await auth();

  if (!userId) {
    return { error: '請先登入以刪除寺廟' };
  }

  const templeId = formData.get('templeId') as string;

  if (!templeId) {
    return { error: '需要寺廟ID' };
  }

  const temple = await prisma.temples.findFirst({
    where: { id: templeId, created_by_auth_user_id: userId },
    select: { id: true }
  });

  if (!temple) {
    return { error: '找不到寺廟或您沒有權限' };
  }

  await prisma.temples.delete({ where: { id: templeId } });

  revalidatePath('/admin');
  return { success: '寺廟已成功刪除' };
}
