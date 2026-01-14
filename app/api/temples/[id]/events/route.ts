import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/db';

// Get all events for a temple
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

    // Check if user has permission
    const member = await prisma.temple_members.findFirst({
      where: {
        temple_id: templeId,
        auth_user_id: userId,
      },
    });

    if (!member) {
      return NextResponse.json({ error: '您沒有權限查看此寺廟活動' }, { status: 403 });
    }

    // Get events
    const events = await prisma.events.findMany({
      where: { temple_id: templeId },
      orderBy: { event_date: 'desc' },
    });

    return NextResponse.json({
      success: true,
      events,
    });
  } catch (error) {
    console.error('Events fetch error:', error);
    return NextResponse.json(
      { error: '獲取活動失敗' },
      { status: 500 }
    );
  }
}

// Create a new event
export async function POST(
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

    // Check if user has permission (admin/staff only)
    const member = await prisma.temple_members.findFirst({
      where: {
        temple_id: templeId,
        auth_user_id: userId,
        role: { in: ['admin', 'staff'] },
      },
    });

    if (!member) {
      return NextResponse.json({ error: '您沒有權限新增活動' }, { status: 403 });
    }

    // Create event
    const event = await prisma.events.create({
      data: {
        temple_id: templeId,
        title: data.title,
        description: data.description,
        image_url: data.image_url,
        event_date: new Date(data.event_date),
        event_time: data.event_time,
        location: data.location,
        max_capacity: data.max_capacity || null,
        registration_deadline: data.registration_deadline ? new Date(data.registration_deadline) : null,
        is_active: data.is_active ?? true,
      },
    });

    return NextResponse.json({
      success: true,
      event,
    });
  } catch (error) {
    console.error('Event create error:', error);
    return NextResponse.json(
      { error: '建立活動失敗' },
      { status: 500 }
    );
  }
}

// Update an event
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
    const { eventId, ...data } = await request.json();

    if (!eventId) {
      return NextResponse.json({ error: '缺少活動 ID' }, { status: 400 });
    }

    // Check if user has permission
    const member = await prisma.temple_members.findFirst({
      where: {
        temple_id: templeId,
        auth_user_id: userId,
        role: { in: ['admin', 'staff'] },
      },
    });

    if (!member) {
      return NextResponse.json({ error: '您沒有權限修改活動' }, { status: 403 });
    }

    // Prepare update data
    const updateData: any = {};
    if (data.title !== undefined) updateData.title = data.title;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.image_url !== undefined) updateData.image_url = data.image_url;
    if (data.event_date !== undefined) updateData.event_date = new Date(data.event_date);
    if (data.event_time !== undefined) updateData.event_time = data.event_time;
    if (data.location !== undefined) updateData.location = data.location;
    if (data.max_capacity !== undefined) updateData.max_capacity = data.max_capacity;
    if (data.registration_deadline !== undefined) {
      updateData.registration_deadline = data.registration_deadline ? new Date(data.registration_deadline) : null;
    }
    if (data.is_active !== undefined) updateData.is_active = data.is_active;

    // Update event
    const event = await prisma.events.update({
      where: { id: eventId },
      data: updateData,
    });

    return NextResponse.json({
      success: true,
      event,
    });
  } catch (error) {
    console.error('Event update error:', error);
    return NextResponse.json(
      { error: '更新活動失敗' },
      { status: 500 }
    );
  }
}

// Delete an event
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: '請先登入' }, { status: 401 });
    }

    const templeId = params.id;
    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get('eventId');

    if (!eventId) {
      return NextResponse.json({ error: '缺少活動 ID' }, { status: 400 });
    }

    // Check if user has permission
    const member = await prisma.temple_members.findFirst({
      where: {
        temple_id: templeId,
        auth_user_id: userId,
        role: { in: ['admin', 'staff'] },
      },
    });

    if (!member) {
      return NextResponse.json({ error: '您沒有權限刪除活動' }, { status: 403 });
    }

    // Delete event
    await prisma.events.delete({
      where: { id: eventId },
    });

    return NextResponse.json({
      success: true,
      message: '活動已刪除',
    });
  } catch (error) {
    console.error('Event delete error:', error);
    return NextResponse.json(
      { error: '刪除活動失敗' },
      { status: 500 }
    );
  }
}