import { S3Client, CreateBucketCommand, PutBucketCorsCommand } from '@aws-sdk/client-s3';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

/**
 * Script to create R2 bucket with APAC region and proper CORS settings
 * Run with: pnpm tsx scripts/setup-r2-bucket.ts
 */

const client = new S3Client({
  region: 'auto',
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
});

async function setupR2Bucket() {
  const bucketName = process.env.R2_BUCKET_NAME || 'temple-assets';

  console.log('🚀 Setting up R2 bucket with APAC region...');

  try {
    // Create bucket with APAC location hint
    await client.send(
      new CreateBucketCommand({
        Bucket: bucketName,
        CreateBucketConfiguration: {
          LocationConstraint: 'apac', // Asia-Pacific region for Taiwan
        },
      })
    );

    console.log(`✅ Bucket "${bucketName}" created in APAC region`);

    // Set CORS configuration for browser uploads
    await client.send(
      new PutBucketCorsCommand({
        Bucket: bucketName,
        CORSConfiguration: {
          CORSRules: [
            {
              AllowedHeaders: ['*'],
              AllowedMethods: ['GET', 'PUT', 'POST', 'DELETE', 'HEAD'],
              AllowedOrigins: [
                'http://localhost:3000',
                'https://*.temple.tw',
                process.env.NEXT_PUBLIC_FRONTEND_URL || 'https://temple.tw',
              ],
              ExposeHeaders: ['ETag'],
              MaxAgeSeconds: 3600,
            },
          ],
        },
      })
    );

    console.log('✅ CORS configuration applied');

    console.log('\n📝 Next steps:');
    console.log('1. Go to Cloudflare R2 dashboard');
    console.log('2. Click on the bucket');
    console.log('3. Go to Settings → Public Access → Allow Public Access');
    console.log('4. Copy the public URL and add to .env as R2_PUBLIC_BUCKET_URL');
    console.log('\nExample: R2_PUBLIC_BUCKET_URL=https://pub-abc123.r2.dev');

  } catch (error: any) {
    if (error.Code === 'BucketAlreadyExists' || error.Code === 'BucketAlreadyOwnedByYou') {
      console.log(`ℹ️ Bucket "${bucketName}" already exists`);
    } else {
      console.error('❌ Error creating bucket:', error.message);
      throw error;
    }
  }
}

// Run the setup with top-level await
try {
  await setupR2Bucket();
} catch (error) {
  console.error(error);
  process.exit(1);
}