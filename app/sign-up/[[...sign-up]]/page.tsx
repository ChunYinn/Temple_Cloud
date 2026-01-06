"use client";

import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-red-900 via-red-800 to-stone-900 p-4">
      <div className="relative">
        {/* Background effects */}
        <div className="absolute -inset-4 bg-amber-500/20 rounded-3xl blur-xl" />

        {/* Sign Up Component */}
        <div className="relative">
          <SignUp
            appearance={{
              elements: {
                rootBox: "mx-auto",
                card: "bg-white/95 backdrop-blur-sm shadow-2xl"
              }
            }}
          />
        </div>
      </div>
    </div>
  );
}
