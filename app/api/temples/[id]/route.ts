import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/db';

// Update temple settings
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: '請先登入' }, { status: 401 });
    }

    const { id: templeId } = await params;
    const data = await request.json();

    // Check if user has permission to update this temple
    const member = await prisma.temple_members.findFirst({
      where: {
        temple_id: templeId,
        auth_user_id: userId,
        role: { in: ['admin', 'staff'] },
      },
    });

    if (!member) {
      return NextResponse.json({ error: '您沒有權限修改此寺廟' }, { status: 403 });
    }

    // Extract only the fields that can be updated
    const allowedFields = [
      'name',
      'slug',
      'intro',
      'full_description',
      'address',
      'phone',
      'email',
      'hours',
      'cover_image_url',
      'avatar_emoji',
      'logo_url',
      'favicon_url',
      'gallery_photos',
      'facebook_url',
      'line_id',
      'instagram_url',
      'is_active'
    ];

    // Create update data with only allowed fields
    const updateData: any = {};
    for (const field of allowedFields) {
      if (field in data) {
        updateData[field] = data[field];
      }
    }

    // Update temple
    const updatedTemple = await prisma.temples.update({
      where: { id: templeId },
      data: updateData,
    });

    return NextResponse.json({
      success: true,
      temple: updatedTemple,
    });
  } catch (error) {
    console.error('Temple update error:', error);
    return NextResponse.json(
      { error: '更新失敗，請稍後再試' },
      { status: 500 }
    );
  }
}

// Get temple details
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: '請先登入' }, { status: 401 });
    }

    const { id: templeId } = await params;

    // Check if user has permission to view this temple
    const member = await prisma.temple_members.findFirst({
      where: {
        temple_id: templeId,
        auth_user_id: userId,
      },
    });

    if (!member) {
      return NextResponse.json({ error: '您沒有權限查看此寺廟' }, { status: 403 });
    }

    // Get temple details
    const temple = await prisma.temples.findUnique({
      where: { id: templeId },
      include: {
        members: true,
        services: {
          where: { is_active: true },
          orderBy: { sort_order: 'asc' },
        },
        events: {
          where: { is_active: true },
          orderBy: { event_date: 'asc' },
          take: 10,
        },
      },
    });

    if (!temple) {
      return NextResponse.json({ error: '寺廟不存在' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      temple,
    });
  } catch (error) {
    console.error('Temple fetch error:', error);
    return NextResponse.json(
      { error: '獲取資料失敗，請稍後再試' },
      { status: 500 }
    );
  }
}