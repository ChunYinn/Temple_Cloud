import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/db';

// GET single order
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string; orderId: string }> }
) {
  try {
    const { userId } = await auth();
    const { id: templeId, orderId } = await context.params;

    if (!userId) {
      return NextResponse.json({ error: '請先登入' }, { status: 401 });
    }

    // Verify user has access to this temple
    const temple = await prisma.temples.findFirst({
      where: {
        id: templeId,
        members: {
          some: {
            auth_user_id: userId,
          },
        },
      },
    });

    if (!temple) {
      return NextResponse.json({ error: '無權限查看此寺廟' }, { status: 403 });
    }

    // Get order with relations
    const order = await prisma.orders.findFirst({
      where: {
        id: orderId,
        temple_id: templeId,
      },
      include: {
        service: true,
        event: true,
      },
    });

    if (!order) {
      return NextResponse.json({ error: '訂單不存在' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      order,
    });
  } catch (error) {
    console.error('Get order error:', error);
    return NextResponse.json(
      { error: '無法獲取訂單資料' },
      { status: 500 }
    );
  }
}

// PATCH update order status
export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string; orderId: string }> }
) {
  try {
    const { userId } = await auth();
    const { id: templeId, orderId } = await context.params;

    if (!userId) {
      return NextResponse.json({ error: '請先登入' }, { status: 401 });
    }

    // Verify user has access to this temple
    const temple = await prisma.temples.findFirst({
      where: {
        id: templeId,
        members: {
          some: {
            auth_user_id: userId,
          },
        },
      },
    });

    if (!temple) {
      return NextResponse.json({ error: '無權限修改此寺廟' }, { status: 403 });
    }

    const body = await request.json();
    const { status, payment_status, notes } = body;

    // Update order
    const order = await prisma.orders.update({
      where: {
        id: orderId,
      },
      data: {
        ...(status && { status }),
        ...(payment_status && { payment_status }),
        ...(notes !== undefined && { notes }),
      },
      include: {
        service: true,
        event: true,
      },
    });

    return NextResponse.json({
      success: true,
      order,
    });
  } catch (error) {
    console.error('Update order error:', error);
    return NextResponse.json(
      { error: '無法更新訂單' },
      { status: 500 }
    );
  }
}

// DELETE order
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string; orderId: string }> }
) {
  try {
    const { userId } = await auth();
    const { id: templeId, orderId } = await context.params;

    if (!userId) {
      return NextResponse.json({ error: '請先登入' }, { status: 401 });
    }

    // Verify user has access to this temple
    const temple = await prisma.temples.findFirst({
      where: {
        id: templeId,
        members: {
          some: {
            auth_user_id: userId,
          },
        },
      },
    });

    if (!temple) {
      return NextResponse.json({ error: '無權限刪除此訂單' }, { status: 403 });
    }

    // Delete order (cascade will handle relationships)
    await prisma.orders.delete({
      where: {
        id: orderId,
      },
    });

    return NextResponse.json({
      success: true,
      message: '訂單已刪除',
    });
  } catch (error) {
    console.error('Delete order error:', error);
    return NextResponse.json(
      { error: '無法刪除訂單' },
      { status: 500 }
    );
  }
}