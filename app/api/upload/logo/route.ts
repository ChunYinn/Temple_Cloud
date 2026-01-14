import { NextRequest } from 'next/server';
import { requireAuth, handleApiError, handleApiSuccess } from '@/lib/api-auth';
import { uploadTempleLogo } from '@/lib/upload-utils';
import { validateImage } from '@/lib/upload-validation';
import { ERROR_MESSAGES } from '@/lib/error-messages';
import { generateUniqueFilename } from '@/lib/image-validation';

export async function POST(request: NextRequest) {
  try {
    const userId = await requireAuth();

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const templeId = formData.get('templeId') as string;
    const oldLogoUrl = formData.get('oldLogoUrl') as string | null;
    const oldFaviconUrl = formData.get('oldFaviconUrl') as string | null;

    if (!file) {
      throw new Error(ERROR_MESSAGES.UPLOAD.NO_FILE);
    }

    // Use a generated ID if templeId is not provided or is temporary
    const uploadId = templeId && !templeId.startsWith('temp-')
      ? templeId
      : generateUniqueFilename('temp', 'upload');

    // Validate image
    const validation = validateImage(file);
    if (!validation.isValid) {
      throw new Error(validation.error || ERROR_MESSAGES.UPLOAD.INVALID_FORMAT);
    }

    // Upload logo (and delete old ones if they exist)
    const result = await uploadTempleLogo(uploadId, file, oldLogoUrl, oldFaviconUrl);

    if (!result.success) {
      throw new Error(result.error || ERROR_MESSAGES.UPLOAD.UPLOAD_FAILED);
    }

    return handleApiSuccess({
      logoUrl: result.logoUrl,
      faviconUrl: result.faviconUrl,
    });
  } catch (error) {
    return handleApiError(error);
  }
}

export const runtime = 'nodejs';
export const maxDuration = 30;