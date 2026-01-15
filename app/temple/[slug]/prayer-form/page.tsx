import { PrayerForm } from '@/components/prayer-form/PrayerForm';
import { prisma } from '@/lib/db';
import { notFound } from 'next/navigation';

interface PrayerFormPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function PrayerFormPage({ params }: PrayerFormPageProps) {
  const { slug } = await params;

  // Fetch temple data
  const temple = await prisma.temples.findUnique({
    where: { slug: slug },
    select: {
      id: true,
      name: true,
      slug: true,
    }
  });

  if (!temple) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-stone-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Temple Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-stone-800">{temple.name}</h1>
          <p className="text-stone-600 mt-2">線上祈福申請</p>
        </div>

        {/* Prayer Form */}
        <PrayerForm
          templeId={temple.id}
          templeSlug={temple.slug}
        />
      </div>
    </div>
  );
}