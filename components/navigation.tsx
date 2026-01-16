'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { SignedIn, SignedOut, UserButton, SignInButton } from '@clerk/nextjs';

export function Navigation() {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith('/admin');

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-b from-stone-900/95 to-stone-900/90 backdrop-blur-sm border-b border-amber-600/30">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        {/* Logo and Brand */}
        <Link
          href={isAdmin ? '/admin' : '/'}
          className="flex items-center gap-2 hover:opacity-80 transition-opacity"
        >
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center">
            <span className="text-stone-900 text-lg">🏮</span>
          </div>
          <span className="text-amber-100 font-bold tracking-wide">廟務雲</span>
        </Link>

        <div className="flex items-center gap-3">
          <SignedOut>
            <SignInButton>
              <button className="px-4 py-1.5 bg-amber-600 hover:bg-amber-500 rounded-lg text-white text-sm font-medium transition-colors">
                登入
              </button>
            </SignInButton>
          </SignedOut>

          {/* User Avatar on the right when logged in */}
          <SignedIn>
            <UserButton
              appearance={{
                elements: {
                  avatarBox: "w-12 h-12"
                }
              }}
            />
          </SignedIn>
        </div>
      </div>
    </nav>
  );
}