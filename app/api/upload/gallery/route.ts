import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { uploadGalleryPhoto, validateImage, UPLOAD_CONFIG } from '@/lib/upload-utils';
import { prisma } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: '請先登入' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const templeId = formData.get('templeId') as string;

    if (!file || !templeId) {
      return NextResponse.json({ error: '請選擇圖片檔案並提供寺廟ID' }, { status: 400 });
    }

    // Check if user has permission to upload to this temple
    const temple = await prisma.temples.findFirst({
      where: {
        id: templeId,
        members: {
          some: {
            auth_user_id: userId,
          },
        },
      },
      select: {
        id: true,
        gallery_photos: true,
      },
    });

    if (!temple) {
      return NextResponse.json({ error: '您沒有權限上傳到此寺廟' }, { status: 403 });
    }

    // Check gallery limit
    const currentPhotos = temple.gallery_photos || [];
    if (currentPhotos.length >= UPLOAD_CONFIG.GALLERY.MAX_COUNT) {
      return NextResponse.json({
        error: `相簿已達上限 (最多 ${UPLOAD_CONFIG.GALLERY.MAX_COUNT} 張照片)`
      }, { status: 400 });
    }

    // Validate image
    const validation = validateImage(file);
    if (!validation.isValid) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    // Upload photo
    const result = await uploadGalleryPhoto(templeId, file);

    if (!result.success) {
      return NextResponse.json({ error: result.error || '上傳失敗' }, { status: 500 });
    }

    // Update temple gallery_photos array
    await prisma.temples.update({
      where: { id: templeId },
      data: {
        gallery_photos: {
          push: result.photoUrl!,
        },
      },
    });

    return NextResponse.json({
      success: true,
      photoUrl: result.photoUrl,
      totalPhotos: currentPhotos.length + 1,
    });
  } catch (error) {
    console.error('Gallery upload API error:', error);
    return NextResponse.json({ error: '伺服器錯誤，請稍後再試' }, { status: 500 });
  }
}

// Delete gallery photo
export async function DELETE(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: '請先登入' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const templeId = searchParams.get('templeId');
    const photoUrl = searchParams.get('photoUrl');

    if (!templeId || !photoUrl) {
      return NextResponse.json({ error: '缺少必要參數' }, { status: 400 });
    }

    // Check if user has permission
    const temple = await prisma.temples.findFirst({
      where: {
        id: templeId,
        members: {
          some: {
            auth_user_id: userId,
          },
        },
      },
      select: {
        id: true,
        gallery_photos: true,
      },
    });

    if (!temple) {
      return NextResponse.json({ error: '您沒有權限管理此寺廟' }, { status: 403 });
    }

    // Remove photo from array
    const updatedPhotos = (temple.gallery_photos || []).filter(url => url !== photoUrl);

    await prisma.temples.update({
      where: { id: templeId },
      data: {
        gallery_photos: updatedPhotos,
      },
    });

    // Note: We're not deleting from R2 to avoid accidental data loss
    // Could add a cleanup job later if needed

    return NextResponse.json({
      success: true,
      totalPhotos: updatedPhotos.length,
    });
  } catch (error) {
    console.error('Gallery delete API error:', error);
    return NextResponse.json({ error: '伺服器錯誤，請稍後再試' }, { status: 500 });
  }
}

export const runtime = 'nodejs';
export const maxDuration = 30;