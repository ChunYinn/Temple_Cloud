'use client';

import { motion } from 'framer-motion';

const features = [
  {
    id: 'subdomain',
    icon: '🏮',
    title: '專屬子網域',
    desc: '您的寺廟名.miao.link',
    color: 'from-red-500 to-red-600'
  },
  {
    id: 'donation',
    icon: '💰',
    title: '線上香油錢',
    desc: '安全便利的線上捐款',
    color: 'from-amber-500 to-amber-600'
  },
  {
    id: 'lamp',
    icon: '📿',
    title: '點燈服務',
    desc: '光明燈、太歲燈線上登記',
    color: 'from-emerald-500 to-emerald-600'
  },
  {
    id: 'events',
    icon: '📅',
    title: '活動報名',
    desc: '法會、慶典線上報名',
    color: 'from-blue-500 to-blue-600'
  },
  {
    id: 'qrcode',
    icon: '📱',
    title: 'QR Code',
    desc: '一掃即開，方便捐獻',
    color: 'from-purple-500 to-purple-600'
  },
  {
    id: 'reports',
    icon: '📊',
    title: '數據報表',
    desc: '清楚的收支報表',
    color: 'from-stone-600 to-stone-700'
  },
];

export function LandingFeatures() {
  return (
    <section className="py-16 sm:py-20 md:py-24 px-4 bg-stone-50">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-10 sm:mb-12 md:mb-16"
        >
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-stone-800 mb-2 sm:mb-3 md:mb-4">
            專為台灣宮廟設計
          </h2>
          <p className="text-stone-600 text-base sm:text-lg">
            讓傳統與科技完美結合
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
          {features.map((feature) => (
            <motion.div
              key={feature.id}
              initial={{ y: 20, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true }}
              className="group bg-white rounded-xl sm:rounded-2xl p-6 sm:p-8 shadow-lg shadow-stone-200/50 hover:shadow-xl transition-all hover:-translate-y-1"
            >
              <div
                className={`w-14 h-14 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center text-2xl sm:text-3xl mb-4 sm:mb-6 shadow-lg group-hover:scale-110 transition-transform`}
              >
                {feature.icon}
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-stone-800 mb-1 sm:mb-2">
                {feature.title}
              </h3>
              <p className="text-sm sm:text-base text-stone-600">
                {feature.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}