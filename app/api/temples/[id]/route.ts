import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/db';

// Update temple settings
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: '請先登入' }, { status: 401 });
    }

    const templeId = params.id;
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

    // Remove fields that shouldn't be updated directly
    const { id, created_at, created_by_auth_user_id, ...updateData } = data;

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
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: '請先登入' }, { status: 401 });
    }

    const templeId = params.id;

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