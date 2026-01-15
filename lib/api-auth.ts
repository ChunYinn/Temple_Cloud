import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { ERROR_MESSAGES } from '@/lib/error-messages';

/**
 * Require authentication for API routes
 * @returns userId if authenticated
 * @throws Error with 'UNAUTHORIZED' if not authenticated
 */
export async function requireAuth(): Promise<string> {
  const { userId } = await auth();
  if (!userId) {
    throw new Error('UNAUTHORIZED');
  }
  return userId;
}

/**
 * Check temple permission for a user
 * @param userId - The user ID to check
 * @param templeId - The temple ID to check against
 * @param requiredRoles - Array of roles that are allowed (default: ['admin', 'staff'])
 * @returns The temple member object if authorized, null otherwise
 */
export async function checkTemplePermission(
  userId: string,
  templeId: string,
  requiredRoles: ('admin' | 'staff')[] = ['admin', 'staff']
) {
  const member = await prisma.temple_members.findFirst({
    where: {
      temple_id: templeId,
      auth_user_id: userId,
      role: { in: requiredRoles as any },
    },
  });
  return member;
}

/**
 * Require temple permission for API routes
 * @param templeId - The temple ID to check against
 * @param requiredRoles - Array of roles that are allowed
 * @returns userId if authorized
 * @throws Error with 'UNAUTHORIZED' or 'FORBIDDEN' if not authorized
 */
export async function requireTemplePermission(
  templeId: string,
  requiredRoles: ('admin' | 'staff')[] = ['admin', 'staff']
): Promise<string> {
  const userId = await requireAuth();

  const member = await checkTemplePermission(userId, templeId, requiredRoles);
  if (!member) {
    throw new Error('FORBIDDEN');
  }

  return userId;
}

/**
 * Standard error response for API routes
 * @param error - The error object or message
 * @returns NextResponse with appropriate status code and error message
 */
export function handleApiError(error: unknown): NextResponse {
  if (error instanceof Error) {
    switch (error.message) {
      case 'UNAUTHORIZED':
        return NextResponse.json(
          { success: false, error: ERROR_MESSAGES.AUTH.REQUIRED },
          { status: 401 }
        );
      case 'FORBIDDEN':
        return NextResponse.json(
          { success: false, error: ERROR_MESSAGES.AUTH.NO_PERMISSION },
          { status: 403 }
        );
      default:
        console.error('API Error:', error);
        return NextResponse.json(
          { success: false, error: ERROR_MESSAGES.SERVER.GENERIC },
          { status: 500 }
        );
    }
  }

  console.error('Unknown API Error:', error);
  return NextResponse.json(
    { success: false, error: ERROR_MESSAGES.SERVER.GENERIC },
    { status: 500 }
  );
}

/**
 * Standard success response for API routes
 * @param data - The data to return
 * @param message - Optional success message
 * @returns NextResponse with success format
 */
export function handleApiSuccess<T>(data?: T, message?: string): NextResponse {
  return NextResponse.json({
    success: true,
    ...(message && { message }),
    ...(data && { data }),
  });
}