import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireTemplePermission } from '@/lib/api-auth';
import { ServiceCode } from '@/lib/prayer-form/types';

// Public endpoint - no auth required for reading
export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    // Fetch temple prayer services settings
    const prayerServices = await prisma.temple_prayer_services.findMany({
      where: {
        temple_id: id,
      },
      select: {
        service_code: true,
        is_enabled: true,
        custom_price: true,
        max_quantity: true,
        annual_limit: true,
        current_count: true,
      },
    });

    // Fetch donation settings
    const donationSettings = await prisma.temple_donation_settings.findUnique({
      where: {
        temple_id: id,
      },
      select: {
        is_enabled: true,
        min_amount: true,
        suggested_amounts: true,
        allow_anonymous: true,
        custom_message: true,
      },
    });

    // Transform prayer services to match frontend expectations
    const services = Object.values(ServiceCode).map(serviceCode => {
      const dbService = prayerServices.find(
        s => s.service_code === serviceCode as any
      );

      return {
        serviceCode,
        isEnabled: dbService?.is_enabled || false, // No fallback - default to false
        customPrice: dbService?.custom_price || null,
        maxQuantity: dbService?.max_quantity || null,
        annualLimit: dbService?.annual_limit || null,
        currentCount: dbService?.current_count || 0,
      };
    });

    return NextResponse.json({
      services,
      donation: donationSettings ? {
        isEnabled: donationSettings.is_enabled,
        minAmount: donationSettings.min_amount,
        suggestedAmounts: donationSettings.suggested_amounts,
        allowCustomAmount: true, // Always allow custom amount
        allowAnonymous: donationSettings.allow_anonymous,
        customMessage: donationSettings.custom_message,
      } : {
        // Default donation settings if not configured
        isEnabled: false,
        minAmount: 100,
        suggestedAmounts: [100, 300, 500, 1000, 3000, 5000],
        allowCustomAmount: true,
        allowAnonymous: true,
        customMessage: null,
      }
    });
  } catch (error) {
    console.error('Failed to fetch prayer services:', error);
    return NextResponse.json(
      { error: 'Failed to fetch prayer services' },
      { status: 500 }
    );
  }
}

// Update settings - requires temple admin permission
export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    // Check permission
    try {
      await requireTemplePermission(id, ['admin']);
    } catch (error) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { services, donation } = body;

    // Update prayer services in a transaction
    await prisma.$transaction(async (tx) => {
      // Update each service
      for (const service of services) {
        await tx.temple_prayer_services.upsert({
          where: {
            temple_id_service_code: {
              temple_id: id,
              service_code: service.serviceCode,
            }
          },
          update: {
            is_enabled: service.isEnabled,
            custom_price: service.customPrice,
            max_quantity: service.maxQuantity,
            annual_limit: service.annualLimit,
          },
          create: {
            temple_id: id,
            service_code: service.serviceCode,
            is_enabled: service.isEnabled,
            custom_price: service.customPrice,
            max_quantity: service.maxQuantity,
            annual_limit: service.annualLimit,
          }
        });
      }

      // Update donation settings
      if (donation) {
        await tx.temple_donation_settings.upsert({
          where: {
            temple_id: id,
          },
          update: {
            is_enabled: donation.isEnabled,
            min_amount: donation.minAmount,
            suggested_amounts: donation.suggestedAmounts,
            allow_anonymous: donation.allowAnonymous,
            custom_message: donation.customMessage,
          },
          create: {
            temple_id: id,
            is_enabled: donation.isEnabled,
            min_amount: donation.minAmount,
            suggested_amounts: donation.suggestedAmounts,
            allow_anonymous: donation.allowAnonymous,
            custom_message: donation.customMessage,
          }
        });
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to update prayer services:', error);
    return NextResponse.json(
      { error: 'Failed to update prayer services' },
      { status: 500 }
    );
  }
}