'use client';

import { SignInButton } from '@clerk/nextjs';
import { motion } from 'framer-motion';

export function LandingHero() {
  return (
    <section className="relative min-h-screen lg:min-h-[90vh] flex items-center justify-center overflow-hidden py-20 lg:py-0">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-red-900 via-red-800 to-stone-900">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[300px] md:w-[600px] h-[300px] md:h-[600px] bg-amber-500/20 rounded-full blur-[60px] md:blur-[100px]" />
        <div className="absolute bottom-0 right-0 w-[200px] md:w-[400px] h-[200px] md:h-[400px] bg-red-500/10 rounded-full blur-[40px] md:blur-[80px]" />
      </div>

      <div className="relative z-10 text-center px-4 sm:px-6 max-w-4xl mx-auto w-full">
        {/* Logo */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="mb-6 md:mb-8 flex justify-center"
        >
          <div className="relative">
            <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-gradient-to-br from-amber-300 via-amber-400 to-amber-600 flex items-center justify-center shadow-2xl shadow-amber-500/30">
              <span className="text-4xl md:text-5xl">🪷</span>
            </div>
            <div
              className="absolute -inset-2 rounded-full border-2 border-amber-400/30 animate-ping"
              style={{ animationDuration: '3s' }}
            />
          </div>
        </motion.div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-amber-50 mb-3 md:mb-4 tracking-tight">
            廟務雲
            <span className="text-xl sm:text-2xl md:text-3xl font-normal text-amber-200/80 mt-1 md:mt-2 block">
              寺廟數位管理平台
            </span>
          </h1>

          <p className="text-lg sm:text-xl md:text-2xl text-amber-100/90 mb-3 md:mb-4 leading-relaxed">
            為您的寺廟打造專屬數位門戶
          </p>
          <p className="text-sm sm:text-base md:text-lg text-amber-200/70 mb-8 md:mb-10 max-w-2xl mx-auto px-4">
            一個連結，連接信眾與寺廟。線上香油錢、活動報名、法會資訊，一鍵分享
          </p>
        </motion.div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="flex justify-center items-center px-4 sm:px-0"
        >
          <SignInButton>
            <button className="px-8 sm:px-10 py-3 sm:py-4 bg-gradient-to-r from-amber-500 to-amber-600 rounded-xl text-stone-900 font-bold text-base sm:text-lg shadow-xl shadow-amber-500/30 hover:shadow-amber-500/50 transition-all hover:scale-105">
              免費開始使用
            </button>
          </SignInButton>
        </motion.div>

        {/* Statistics */}
        <motion.div
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          className="mt-12 md:mt-16 grid grid-cols-3 gap-4 sm:gap-6 md:gap-8 max-w-md mx-auto"
        >
          {[
            { number: '500+', label: '合作寺廟' },
            { number: '10萬+', label: '服務信眾' },
            { number: '99.9%', label: '穩定運作' },
          ].map((stat, i) => (
            <div key={i} className="text-center">
              <div className="text-2xl sm:text-3xl font-bold text-amber-400">{stat.number}</div>
              <div className="text-xs sm:text-sm text-amber-200/60">{stat.label}</div>
            </div>
          ))}
        </motion.div>
      </div>

      {/* Bottom Wave */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 120" className="w-full h-auto fill-stone-50">
          <path d="M0,64 C480,120 960,0 1440,64 L1440,120 L0,120 Z" />
        </svg>
      </div>
    </section>
  );
}