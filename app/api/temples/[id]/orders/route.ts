import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/db';

// GET all orders for a temple
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    const { id: templeId } = await context.params;

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

    // Get query parameters for filtering
    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get('search');
    const status = searchParams.get('status');
    const dateFilter = searchParams.get('dateFilter');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    // Build where clause
    const where: any = {
      temple_id: templeId,
    };

    // Add search filter
    if (search) {
      where.OR = [
        { order_number: { contains: search, mode: 'insensitive' } },
        { customer_name: { contains: search, mode: 'insensitive' } },
        { customer_email: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Add status filter
    if (status && status !== 'all') {
      where.status = status;
    }

    // Add date filter
    const now = new Date();
    if (dateFilter === 'today') {
      const startOfDay = new Date(now.setHours(0, 0, 0, 0));
      where.created_at = { gte: startOfDay };
    } else if (dateFilter === 'week') {
      const weekAgo = new Date(now.setDate(now.getDate() - 7));
      where.created_at = { gte: weekAgo };
    } else if (dateFilter === 'month') {
      const monthAgo = new Date(now.setMonth(now.getMonth() - 1));
      where.created_at = { gte: monthAgo };
    }

    // Get total count
    const totalCount = await prisma.orders.count({ where });

    // Get paginated orders
    const orders = await prisma.orders.findMany({
      where,
      orderBy: { created_at: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
      include: {
        service: true,
        event: true,
      },
    });

    // Calculate stats
    const stats = await prisma.orders.aggregate({
      where: { temple_id: templeId },
      _count: { _all: true },
      _sum: { amount: true },
    });

    const pendingCount = await prisma.orders.count({
      where: { temple_id: templeId, status: 'pending' },
    });

    const avgOrderValue = stats._count._all > 0
      ? (stats._sum.amount || 0) / stats._count._all
      : 0;

    return NextResponse.json({
      success: true,
      orders,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
      },
      stats: {
        totalOrders: stats._count._all,
        totalRevenue: stats._sum.amount || 0,
        pendingOrders: pendingCount,
        avgOrderValue: Math.round(avgOrderValue),
      },
    });
  } catch (error) {
    console.error('Orders API error:', error);
    return NextResponse.json(
      { error: '無法獲取訂單資料' },
      { status: 500 }
    );
  }
}

// POST create new order
export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    const { id: templeId } = await context.params;

    if (!userId) {
      return NextResponse.json({ error: '請先登入' }, { status: 401 });
    }

    const body = await request.json();
    const {
      order_type,
      service_id,
      event_id,
      customer_name,
      customer_email,
      customer_phone,
      amount,
      notes,
    } = body;

    // Verify temple exists
    const temple = await prisma.temples.findUnique({
      where: { id: templeId },
    });

    if (!temple) {
      return NextResponse.json({ error: '寺廟不存在' }, { status: 404 });
    }

    // Generate order number
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substr(2, 4).toUpperCase();
    const order_number = `${temple.slug.toUpperCase()}-${timestamp}${random}`;

    // Create order
    const order = await prisma.orders.create({
      data: {
        order_number,
        temple_id: templeId,
        order_type,
        service_id,
        event_id,
        customer_name,
        customer_email,
        customer_phone,
        amount,
        status: 'pending',
        payment_status: 'pending',
        notes,
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
    console.error('Create order error:', error);
    return NextResponse.json(
      { error: '無法建立訂單' },
      { status: 500 }
    );
  }
}