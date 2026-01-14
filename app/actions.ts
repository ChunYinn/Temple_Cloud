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
  _prevState: ActionState | null,
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
  const full_description = (formData.get('full_description') as string)?.trim() || null;
  const address = (formData.get('address') as string)?.trim() || null;
  const phone = (formData.get('phone') as string)?.trim() || null;
  const email = (formData.get('email') as string)?.trim() || null;
  const hours = (formData.get('hours') as string)?.trim() || '每日 06:00 - 21:00';
  const avatar_emoji = (formData.get('avatar_emoji') as string)?.trim() || '🏛️';
  const logo_url = (formData.get('logo_url') as string)?.trim() || null;
  const favicon_url = (formData.get('favicon_url') as string)?.trim() || null;
  const cover_image_url = (formData.get('cover_image_url') as string)?.trim() || null;
  const facebook_url = (formData.get('facebook_url') as string)?.trim() || null;
  const line_id = (formData.get('line_id') as string)?.trim() || null;
  const instagram_url = (formData.get('instagram_url') as string)?.trim() || null;

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
        full_description,
        address,
        phone,
        email,
        hours,
        avatar_emoji,
        logo_url,
        favicon_url,
        cover_image_url,
        facebook_url,
        line_id,
        instagram_url,
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
