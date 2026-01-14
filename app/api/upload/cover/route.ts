import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { uploadTempleCover } from '@/lib/upload-utils';
import { validateImage } from '@/lib/upload-validation';

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: '請先登入' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const templeId = formData.get('templeId') as string;

    if (!file) {
      return NextResponse.json({ error: '請選擇圖片檔案' }, { status: 400 });
    }

    // Use a generated ID if templeId is not provided or is temporary
    const uploadId = templeId && !templeId.startsWith('temp-')
      ? templeId
      : `upload-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // Validate image
    const validation = validateImage(file);
    if (!validation.isValid) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    // Upload cover image
    const result = await uploadTempleCover(uploadId, file);

    if (!result.success) {
      return NextResponse.json({ error: result.error || '上傳失敗' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      coverUrl: result.coverUrl,
    });
  } catch (error) {
    console.error('Cover upload API error:', error);
    return NextResponse.json({ error: '伺服器錯誤，請稍後再試' }, { status: 500 });
  }
}

export const runtime = 'nodejs';
export const maxDuration = 30;