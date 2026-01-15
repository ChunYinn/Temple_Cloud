import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { Storage } from '@google-cloud/storage';
import sharp from 'sharp';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Initialize Google Cloud Storage
const storage = new Storage({
  projectId: process.env.GCP_PROJECT_ID,
  keyFilename: process.env.GCP_KEY_FILE, // Path to service account JSON
});

const bucketName = process.env.GCS_BUCKET_NAME || '';
const bucket = storage.bucket(bucketName);

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get('file') as File;
    const templeId = formData.get('templeId') as string;
    const oldImageUrl = formData.get('oldImageUrl') as string | null;

    if (!file || !templeId) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if user has access to this temple
    const membership = await prisma.temple_members.findFirst({
      where: {
        temple_id: templeId,
        user_id: session.user.id,
        role: { in: ['owner', 'admin'] }
      }
    });

    if (!membership) {
      return NextResponse.json(
        { success: false, error: 'You do not have permission to manage this temple' },
        { status: 403 }
      );
    }

    // Convert File to Buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Process the image with Sharp
    const processedImage = await sharp(buffer)
      .resize(1920, 1080, {
        fit: 'cover',
        position: 'center',
      })
      .jpeg({ quality: 90, progressive: true })
      .toBuffer();

    // Create a unique filename
    const timestamp = Date.now();
    const filename = `temples/${templeId}/events/event-${timestamp}.jpg`;

    // Upload to Google Cloud Storage
    const gcsFile = bucket.file(filename);
    await gcsFile.save(processedImage, {
      metadata: {
        contentType: 'image/jpeg',
        cacheControl: 'public, max-age=31536000',
      },
    });

    // Make the file publicly accessible
    await gcsFile.makePublic();

    // Get the public URL
    const publicUrl = `https://storage.googleapis.com/${bucketName}/${filename}`;

    // Delete old image if provided
    if (oldImageUrl && oldImageUrl.includes('storage.googleapis.com')) {
      try {
        const oldFilename = oldImageUrl.split(`${bucketName}/`)[1];
        if (oldFilename) {
          const oldFile = bucket.file(oldFilename);
          await oldFile.delete().catch(() => {
            // Ignore deletion errors - file might not exist
          });
        }
      } catch (err) {
        // Ignore deletion errors
      }
    }

    return NextResponse.json({
      success: true,
      imageUrl: publicUrl,
    });
  } catch (error) {
    console.error('Event image upload error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to upload image' },
      { status: 500 }
    );
  }
}