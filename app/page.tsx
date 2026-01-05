import Link from 'next/link';
import {
  SignedIn,
  SignedOut,
  SignInButton,
  SignUpButton,
  UserButton
} from '@clerk/nextjs';

import { CreateTempleForm } from './create-temple-form';
import { rootDomain } from '@/lib/utils';

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-blue-50 to-white">
      <header className="flex justify-between items-center p-4">
        <div className="flex flex-col">
          <span className="text-sm text-gray-500">寺廟連結平台</span>
          <h1 className="text-xl font-semibold text-gray-900">{rootDomain}</h1>
        </div>
        <div className="flex items-center gap-3">
          <SignedOut>
            <SignInButton>
              <button className="text-sm text-gray-700 hover:text-gray-900">
                登入
              </button>
            </SignInButton>
            <SignUpButton>
              <button className="rounded-md bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700">
                註冊
              </button>
            </SignUpButton>
          </SignedOut>
          <SignedIn>
            <Link
              href="/admin"
              className="text-sm text-gray-700 hover:text-gray-900"
            >
              管理寺廟
            </Link>
            <UserButton />
          </SignedIn>
        </div>
      </header>

      <main className="flex flex-1 items-center justify-center px-4 pb-10">
        <div className="w-full max-w-3xl space-y-8">
          <div className="text-center space-y-2">
            <p className="text-3xl font-bold tracking-tight text-gray-900">
              建立專屬於您寺廟的網頁
            </p>
            <p className="text-lg text-gray-600">
              登入後建立寺廟頁面，獲得專屬網址連結，方便分享活動與接受香油錢
            </p>
          </div>

          <SignedIn>
            <CreateTempleForm />
          </SignedIn>

          <SignedOut>
            <div className="text-center text-sm text-gray-600">
              請先登入以建立您的寺廟頁面
            </div>
          </SignedOut>
        </div>
      </main>
    </div>
  );
}
