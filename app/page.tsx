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
  const currentYear = new Date().getFullYear();

  return (
    <footer className="py-3 bg-stone-50">
      <div className="text-center text-stone-400 text-xs">
        © {currentYear} 廟務雲
      </div>
    </footer>
  );
}