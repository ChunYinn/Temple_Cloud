import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/db';

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

    // Get time range from query params
    const searchParams = request.nextUrl.searchParams;
    const range = searchParams.get('range') || 'month'; // week, month, year

    // Calculate date ranges
    const now = new Date();
    let startDate: Date;
    let previousStartDate: Date;

    switch (range) {
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        previousStartDate = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
        break;
      case 'year':
        startDate = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
        previousStartDate = new Date(now.getFullYear() - 2, now.getMonth(), now.getDate());
        break;
      case 'month':
      default:
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        previousStartDate = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);
        break;
    }

    // Get current period stats
    const currentStats = await prisma.temple_stats.aggregate({
      where: {
        temple_id: templeId,
        date: {
          gte: startDate,
          lte: now,
        },
      },
      _sum: {
        views: true,
        unique_visitors: true,
        donations_amount: true,
        orders_count: true,
      },
    });

    // Get previous period stats for comparison
    const previousStats = await prisma.temple_stats.aggregate({
      where: {
        temple_id: templeId,
        date: {
          gte: previousStartDate,
          lt: startDate,
        },
      },
      _sum: {
        views: true,
        unique_visitors: true,
        donations_amount: true,
        orders_count: true,
      },
    });

    // Get daily stats for charts
    const dailyStats = await prisma.temple_stats.findMany({
      where: {
        temple_id: templeId,
        date: {
          gte: startDate,
          lte: now,
        },
      },
      orderBy: {
        date: 'asc',
      },
    });

    // Calculate growth percentages
    const calculateGrowth = (current: number | null, previous: number | null) => {
      if (!current || !previous || previous === 0) return 0;
      return Math.round(((current - previous) / previous) * 100);
    };

    // Get order breakdown by type
    const ordersByType = await prisma.orders.groupBy({
      by: ['order_type'],
      where: {
        temple_id: templeId,
        created_at: {
          gte: startDate,
        },
      },
      _count: {
        _all: true,
      },
      _sum: {
        amount: true,
      },
    });

    // Get upcoming events count
    const upcomingEvents = await prisma.events.count({
      where: {
        temple_id: templeId,
        event_date: {
          gt: now,
        },
      },
    });

    // Format response
    const stats = {
      revenue: {
        total: currentStats._sum.donations_amount || 0,
        growth: calculateGrowth(
          currentStats._sum.donations_amount,
          previousStats._sum.donations_amount
        ),
        chartData: dailyStats.map(stat => ({
          date: stat.date,
          amount: stat.donations_amount,
        })),
      },
      visitors: {
        total: currentStats._sum.unique_visitors || 0,
        views: currentStats._sum.views || 0,
        growth: calculateGrowth(
          currentStats._sum.unique_visitors,
          previousStats._sum.unique_visitors
        ),
        chartData: dailyStats.map(stat => ({
          date: stat.date,
          count: stat.unique_visitors,
          views: stat.views,
        })),
      },
      orders: {
        total: currentStats._sum.orders_count || 0,
        growth: calculateGrowth(
          currentStats._sum.orders_count,
          previousStats._sum.orders_count
        ),
        breakdown: {
          service: ordersByType.find(o => o.order_type === 'service')?._count._all || 0,
          event: ordersByType.find(o => o.order_type === 'event')?._count._all || 0,
          donation: ordersByType.find(o => o.order_type === 'donation')?._count._all || 0,
        },
        revenueByType: {
          service: ordersByType.find(o => o.order_type === 'service')?._sum.amount || 0,
          event: ordersByType.find(o => o.order_type === 'event')?._sum.amount || 0,
          donation: ordersByType.find(o => o.order_type === 'donation')?._sum.amount || 0,
        },
      },
      events: {
        total: await prisma.events.count({
          where: {
            temple_id: templeId,
            created_at: {
              gte: startDate,
            },
          },
        }),
        upcoming: upcomingEvents,
        growth: 0, // Calculate if we track historical event counts
      },
    };

    return NextResponse.json({
      success: true,
      stats,
      range,
    });
  } catch (error) {
    console.error('Stats API error:', error);
    return NextResponse.json(
      { error: '無法獲取統計資料' },
      { status: 500 }
    );
  }
}