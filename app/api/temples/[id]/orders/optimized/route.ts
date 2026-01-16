import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireTemplePermission } from '@/lib/api-auth';

// Optimized orders endpoint with pagination and filtering
export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    // Check permission
    try {
      await requireTemplePermission(id, ['admin', 'staff']);
    } catch {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Parse query parameters
    const searchParams = req.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = Math.min(parseInt(searchParams.get('limit') || '10', 10), 100); // Max 100 items
    const status = searchParams.get('status') || undefined;
    const type = searchParams.get('type') || undefined;
    const search = searchParams.get('search') || undefined;
    const startDate = searchParams.get('startDate') || undefined;
    const endDate = searchParams.get('endDate') || undefined;

    // Build where clause
    const where: any = {
      temple_id: id,
    };

    if (status && status !== 'all') {
      where.status = status;
    }

    if (type && type !== 'all') {
      where.order_type = type;
    }

    if (search) {
      where.OR = [
        { order_number: { contains: search, mode: 'insensitive' } },
        { customer_name: { contains: search, mode: 'insensitive' } },
        { customer_email: { contains: search, mode: 'insensitive' } },
        { customer_phone: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (startDate || endDate) {
      where.created_at = {};
      if (startDate) {
        where.created_at.gte = new Date(startDate);
      }
      if (endDate) {
        where.created_at.lte = new Date(endDate);
      }
    }

    // Execute queries in parallel
    const [orders, totalCount, stats] = await Promise.all([
      // Get paginated orders with minimal fields
      prisma.orders.findMany({
        where,
        select: {
          id: true,
          order_number: true,
          order_type: true,
          customer_name: true,
          customer_email: true,
          customer_phone: true,
          amount: true,
          status: true,
          payment_status: true,
          payment_method: true,
          notes: true,
          created_at: true,
          updated_at: true,
          // Include related data only if needed
          service: {
            select: {
              name: true,
              icon: true,
            },
          },
          event: {
            select: {
              title: true,
              event_date: true,
            },
          },
        },
        orderBy: {
          created_at: 'desc',
        },
        skip: (page - 1) * limit,
        take: limit,
      }),

      // Get total count for pagination
      prisma.orders.count({ where }),

      // Get aggregated stats
      prisma.orders.aggregate({
        where: {
          temple_id: id,
        },
        _sum: {
          amount: true,
        },
        _count: {
          id: true,
        },
        _avg: {
          amount: true,
        },
      }),
    ]);

    // Get status counts for filters
    const statusCounts = await prisma.orders.groupBy({
      by: ['status'],
      where: {
        temple_id: id,
      },
      _count: {
        id: true,
      },
    });

    const statusMap = statusCounts.reduce((acc, curr) => {
      acc[curr.status] = curr._count.id;
      return acc;
    }, {} as Record<string, number>);

    // Transform orders for frontend
    const transformedOrders = orders.map(order => ({
      id: order.id,
      order_number: order.order_number,
      type: order.order_type as 'service' | 'event',
      service_name: order.service?.name,
      service_icon: order.service?.icon,
      event_name: order.event?.title,
      event_date: order.event?.event_date,
      customer_name: order.customer_name,
      customer_email: order.customer_email || '',
      customer_phone: order.customer_phone || '',
      amount: order.amount,
      status: order.status,
      payment_status: order.payment_status || 'pending',
      payment_method: order.payment_method,
      notes: order.notes,
      created_at: order.created_at.toISOString(),
      updated_at: order.updated_at.toISOString(),
    }));

    // Calculate pagination metadata
    const totalPages = Math.ceil(totalCount / limit);
    const hasNextPage = page < totalPages;
    const hasPreviousPage = page > 1;

    return NextResponse.json({
      success: true,
      orders: transformedOrders,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages,
        hasNextPage,
        hasPreviousPage,
      },
      stats: {
        totalOrders: stats._count.id || 0,
        totalRevenue: stats._sum.amount || 0,
        avgOrderValue: Math.round(stats._avg.amount || 0),
        pendingOrders: statusMap['pending'] || 0,
        completedOrders: statusMap['completed'] || 0,
        cancelledOrders: statusMap['cancelled'] || 0,
      },
      filters: {
        statusCounts: statusMap,
      },
    });
  } catch (error) {
    console.error('Failed to fetch orders:', error);
    return NextResponse.json(
      { error: 'Failed to fetch orders' },
      { status: 500 }
    );
  }
}