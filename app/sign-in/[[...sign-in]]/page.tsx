"use client";

import { SignIn } from "@clerk/nextjs";
import Link from "next/link";

export default function SignInPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-red-900 via-red-800 to-stone-900 p-4 relative">
      {/* Background effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-amber-500/20 rounded-full blur-[100px]" />
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-red-500/10 rounded-full blur-[80px]" />
      </div>

      {/* Logo/Brand at top */}
      <div className="absolute top-8 left-1/2 -translate-x-1/2 text-center">
        <Link href="/" className="inline-flex flex-col items-center gap-2">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-300 via-amber-400 to-amber-600 flex items-center justify-center shadow-2xl shadow-amber-500/30">
            <span className="text-3xl">🪷</span>
          </div>
          <span className="text-amber-100 text-xl font-bold">廟務雲</span>
        </Link>
      </div>

      {/* Sign In Component */}
      <div className="relative z-10">
        <SignIn
          appearance={{
            elements: {
              rootBox: "mx-auto",
              card: "bg-white/95 backdrop-blur-sm shadow-2xl border border-amber-500/20",
              headerTitle: "text-stone-800",
              headerSubtitle: "text-stone-600",
              formButtonPrimary: "bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700",
              footerActionLink: "text-amber-600 hover:text-amber-700"
            }
          }}
        />
      </div>
    </div>
  );
}
