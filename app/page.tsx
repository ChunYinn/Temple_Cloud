import { SignedIn, SignedOut } from '@clerk/nextjs';
import { Navigation } from '@/components/navigation';
import { LandingHero } from '@/components/landing-hero';
import { LandingFeatures } from '@/components/landing-features';
import { redirect } from 'next/navigation';
import { auth } from '@clerk/nextjs/server';

export default async function HomePage() {
  const { userId } = await auth();

  if (userId) {
    redirect('/admin');
  }

  return (
    <div className="min-h-screen bg-stone-50 font-sans">
      <Navigation />
      <div className="pt-14">
        <SignedOut>
          <LandingHero />
          <LandingFeatures />
          <Footer />
        </SignedOut>
        <SignedIn>
          <div className="min-h-screen flex items-center justify-center">
            <div className="text-center">
              <p className="text-lg text-stone-600">正在載入...</p>
            </div>
          </div>
        </SignedIn>
      </div>
    </div>
  );
}

function Footer() {
  return (
    <footer className="py-12 px-4 bg-stone-900">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🏮</span>
          <span className="text-amber-100 font-bold">廟務雲</span>
        </div>
        <div className="text-stone-500 text-sm">
          © 2024 廟務雲
        </div>
      </div>
    </footer>
  );
}