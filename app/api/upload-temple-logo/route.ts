import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { uploadTempleLogo, uploadTempleFavicon } from '@/lib/upload-utils';
import { validateImage } from '@/lib/upload-validation';

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { error: '請先登入' },
        { status: 401 }
      );
    }

    // Parse form data
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const templeId = formData.get('templeId') as string;

    if (!file) {
      return NextResponse.json(
        { error: '請選擇圖片檔案' },
        { status: 400 }
      );
    }

    // Use a generated ID if templeId is not provided or is temporary
    // This is for pre-upload before temple creation
    const uploadId = templeId && !templeId.startsWith('temp-')
      ? templeId
      : `upload-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // Validate image
    const validation = validateImage(file);
    if (!validation.isValid) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      );
    }

    // Upload logo and generate favicon
    const logoResult = await uploadTempleLogo(uploadId, file);

    if (!logoResult.success) {
      return NextResponse.json(
        { error: logoResult.error || '上傳失敗' },
        { status: 500 }
      );
    }

    // Also generate favicon
    const faviconResult = await uploadTempleFavicon(uploadId, file);

    return NextResponse.json({
      success: true,
      logoUrl: logoResult.logoUrl,
      faviconUrl: faviconResult.success ? faviconResult.faviconUrl : undefined,
    });
  } catch (error) {
    console.error('Upload API error:', error);
    return NextResponse.json(
      { error: '伺服器錯誤，請稍後再試' },
      { status: 500 }
    );
  }
}

// Configure max file size for Next.js
export const runtime = 'nodejs';
export const maxDuration = 30; // 30 seconds timeout