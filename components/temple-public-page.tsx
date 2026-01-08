"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { BRAND_NAME, BRAND_URL } from "@/lib/branding";

const FacebookIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 48 48"
    aria-hidden="true"
    {...props}
  >
    <path fill="#039be5" d="M24 5A19 19 0 1 0 24 43A19 19 0 1 0 24 5Z"></path>
    <path
      fill="#fff"
      d="M26.572,29.036h4.917l0.772-4.995h-5.69v-2.73c0-2.075,0.678-3.915,2.619-3.915h3.119v-4.359c-0.548-0.074-1.707-0.236-3.897-0.236c-4.573,0-7.254,2.415-7.254,7.917v3.323h-4.701v4.995h4.701v13.729C22.089,42.905,23.032,43,24,43c0.875,0,1.729-0.08,2.572-0.194V29.036z"
    ></path>
  </svg>
);

const InstagramIcon = (props: React.SVGProps<SVGSVGElement>) => {
  const gradientId = React.useId();
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 48 48"
      aria-hidden="true"
      {...props}
    >
      <defs>
        <radialGradient id={gradientId} cx="0.3" cy="0.2" r="1">
          <stop offset="0%" stopColor="#feda75" />
          <stop offset="35%" stopColor="#fa7e1e" />
          <stop offset="65%" stopColor="#d62976" />
          <stop offset="85%" stopColor="#962fbf" />
          <stop offset="100%" stopColor="#4f5bd5" />
        </radialGradient>
      </defs>
      <rect
        x="6"
        y="6"
        width="36"
        height="36"
        rx="10"
        fill={`url(#${gradientId})`}
      />
      <rect
        x="14"
        y="14"
        width="20"
        height="20"
        rx="6"
        fill="none"
        stroke="#fff"
        strokeWidth="2"
      />
      <circle cx="24" cy="24" r="6" fill="none" stroke="#fff" strokeWidth="2" />
      <circle cx="31" cy="17" r="1.5" fill="#fff" />
    </svg>
  );
};

const LineIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 48 48"
    aria-hidden="true"
    {...props}
  >
    <path
      fill="#00c300"
      d="M12.5,42h23c3.59,0,6.5-2.91,6.5-6.5v-23C42,8.91,39.09,6,35.5,6h-23C8.91,6,6,8.91,6,12.5v23C6,39.09,8.91,42,12.5,42z"
    ></path>
    <path
      fill="#fff"
      d="M37.113,22.417c0-5.865-5.88-10.637-13.107-10.637s-13.108,4.772-13.108,10.637c0,5.258,4.663,9.662,10.962,10.495c0.427,0.092,1.008,0.282,1.155,0.646c0.132,0.331,0.086,0.85,0.042,1.185c0,0-0.153,0.925-0.187,1.122c-0.057,0.331-0.263,1.296,1.135,0.707c1.399-0.589,7.548-4.445,10.298-7.611h-0.001C36.203,26.879,37.113,24.764,37.113,22.417z M18.875,25.907h-2.604c-0.379,0-0.687-0.308-0.687-0.688V20.01c0-0.379,0.308-0.687,0.687-0.687c0.379,0,0.687,0.308,0.687,0.687v4.521h1.917c0.379,0,0.687,0.308,0.687,0.687C19.562,25.598,19.254,25.907,18.875,25.907z M21.568,25.219c0,0.379-0.308,0.688-0.687,0.688s-0.687-0.308-0.687-0.688V20.01c0-0.379,0.308-0.687,0.687-0.687s0.687,0.308,0.687,0.687V25.219z M27.838,25.219c0,0.297-0.188,0.559-0.47,0.652c-0.071,0.024-0.145,0.036-0.218,0.036c-0.215,0-0.42-0.103-0.549-0.275l-2.669-3.635v3.222c0,0.379-0.308,0.688-0.688,0.688c-0.379,0-0.688-0.308-0.688-0.688V20.01c0-0.296,0.189-0.558,0.47-0.652c0.071-0.024,0.144-0.035,0.218-0.035c0.214,0,0.42,0.103,0.549,0.275l2.67,3.635V20.01c0-0.379,0.309-0.687,0.688-0.687c0.379,0,0.687,0.308,0.687,0.687V25.219z M32.052,21.927c0.379,0,0.688,0.308,0.688,0.688c0,0.379-0.308,0.687-0.688,0.687h-1.917v1.23h1.917c0.379,0,0.688,0.308,0.688,0.687c0,0.379-0.309,0.688-0.688,0.688h-2.604c-0.378,0-0.687-0.308-0.687-0.688v-2.603c0-0.001,0-0.001,0-0.001c0,0,0-0.001,0-0.001v-2.601c0-0.001,0-0.001,0-0.002c0-0.379,0.308-0.687,0.687-0.687h2.604c0.379,0,0.688,0.308,0.688,0.687s-0.308,0.687-0.688,0.687h-1.917v1.23H32.052z"
    ></path>
  </svg>
);

const GoogleMapsIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 48 48"
    aria-hidden="true"
    {...props}
  >
    <path
      fill="#48b564"
      d="M35.76,26.36h0.01c0,0-3.77,5.53-6.94,9.64c-2.74,3.55-3.54,6.59-3.77,8.06	C24.97,44.6,24.53,45,24,45s-0.97-0.4-1.06-0.94c-0.23-1.47-1.03-4.51-3.77-8.06c-0.42-0.55-0.85-1.12-1.28-1.7L28.24,22l8.33-9.88	C37.49,14.05,38,16.21,38,18.5C38,21.4,37.17,24.09,35.76,26.36z"
    ></path>
    <path
      fill="#fcc60e"
      d="M28.24,22L17.89,34.3c-2.82-3.78-5.66-7.94-5.66-7.94h0.01c-0.3-0.48-0.57-0.97-0.8-1.48L19.76,15	c-0.79,0.95-1.26,2.17-1.26,3.5c0,3.04,2.46,5.5,5.5,5.5C25.71,24,27.24,23.22,28.24,22z"
    ></path>
    <path
      fill="#2c85eb"
      d="M28.4,4.74l-8.57,10.18L13.27,9.2C15.83,6.02,19.69,4,24,4C25.54,4,27.02,4.26,28.4,4.74z"
    ></path>
    <path
      fill="#ed5748"
      d="M19.83,14.92L19.76,15l-8.32,9.88C10.52,22.95,10,20.79,10,18.5c0-3.54,1.23-6.79,3.27-9.3	L19.83,14.92z"
    ></path>
    <path
      fill="#5695f6"
      d="M28.24,22c0.79-0.95,1.26-2.17,1.26-3.5c0-3.04-2.46-5.5-5.5-5.5c-1.71,0-3.24,0.78-4.24,2L28.4,4.74	c3.59,1.22,6.53,3.91,8.17,7.38L28.24,22z"
    ></path>
  </svg>
);

// =============================================
// Temple Public Page - Responsive Design
// =============================================

type TempleData = {
  name: string;
  slug: string;
  intro?: string | null;
  address?: string | null;
  phone?: string | null;
};

export function TemplePublicPage({ temple }: { temple: TempleData }) {
  const [activeTab, setActiveTab] = useState("home");
  const [activeSection, setActiveSection] = useState("home");
  const currentYear = new Date().getFullYear();

  // Enhanced temple data with mock fields
  const templeData = {
    ...temple,
    subtitle: "主祀玉皇大帝",
    avatar: "🏛️",
    coverImage:
      "https://images.unsplash.com/photo-1545569341-9eb8b30979d9?w=1200&h=800&fit=crop",
    email: `contact@${temple.slug}.temple.tw`,
    hours: "每日 06:00 - 21:00",
    social: {
      facebook: "#",
      line: "#",
      instagram: "#",
    },
    fullDescription: temple.intro
      ? `${temple.intro} 本宮秉持「慈悲濟世、普渡眾生」之精神，致力於弘揚傳統文化，服務地方信眾。廟內供奉玉皇大帝、觀世音菩薩、關聖帝君等諸神，建築莊嚴肅穆，雕樑畫棟，充分展現台灣傳統廟宇之美。`
      : "本宮秉持「慈悲濟世、普渡眾生」之精神，致力於弘揚傳統文化，服務地方信眾。廟內供奉玉皇大帝、觀世音菩薩、關聖帝君等諸神，建築莊嚴肅穆，雕樑畫棟，充分展現台灣傳統廟宇之美。",
  };

  const events = [
    {
      id: 1,
      title: "觀音誕辰祈福法會",
      date: "2024/03/24",
      time: "09:00",
      location: "大雄寶殿",
      desc: "恭祝觀世音菩薩聖誕，誦經祈福，消災延壽。",
      image:
        "https://images.unsplash.com/photo-1547981609-4b6bfe67ca0b?w=600&h=400&fit=crop",
    },
    {
      id: 2,
      title: "清明超薦法會",
      date: "2024/04/04",
      time: "08:00",
      location: "大雄寶殿",
      desc: "清明慎終追遠，超薦先人，功德迴向。",
      image:
        "https://images.unsplash.com/photo-1574236170878-f66e35f83207?w=600&h=400&fit=crop",
    },
    {
      id: 3,
      title: "媽祖聖誕遶境",
      date: "2024/04/23",
      time: "06:00",
      location: "廟埕集合",
      desc: "恭迎媽祖聖駕出巡，祈求國泰民安。",
      image:
        "https://images.unsplash.com/photo-1548013146-72479768bada?w=600&h=400&fit=crop",
    },
  ];

  const services = [
    {
      id: 1,
      icon: "🪔",
      name: "光明燈",
      price: "500",
      unit: "年",
      desc: "點燈祈福，光明吉祥，照亮前程",
      popular: true,
    },
    {
      id: 2,
      icon: "🐲",
      name: "太歲燈",
      price: "800",
      unit: "年",
      desc: "安太歲，消災解厄，保佑平安",
    },
    {
      id: 3,
      icon: "📿",
      name: "平安符",
      price: "100",
      unit: "個",
      desc: "隨身攜帶，趨吉避凶",
    },
    {
      id: 4,
      icon: "🙏",
      name: "祈福法會",
      price: "1,000",
      unit: "場",
      desc: "消災解厄，祈求平安",
    },
    {
      id: 5,
      icon: "🕯️",
      name: "藥師燈",
      price: "600",
      unit: "年",
      desc: "消災延壽，身體健康",
    },
    {
      id: 6,
      icon: "💫",
      name: "文昌燈",
      price: "500",
      unit: "年",
      desc: "金榜題名，學業進步",
    },
  ];

  const gallery = [
    {
      url: "https://images.unsplash.com/photo-1545569341-9eb8b30979d9?w=800&h=600&fit=crop",
      caption: "廟宇正殿",
    },
    {
      url: "https://images.unsplash.com/photo-1547981609-4b6bfe67ca0b?w=800&h=600&fit=crop",
      caption: "神明聖像",
    },
    {
      url: "https://images.unsplash.com/photo-1574236170878-f66e35f83207?w=800&h=600&fit=crop",
      caption: "法會活動",
    },
    {
      url: "https://images.unsplash.com/photo-1548013146-72479768bada?w=800&h=600&fit=crop",
      caption: "建築細節",
    },
    {
      url: "https://images.unsplash.com/photo-1518998053901-5348d3961a04?w=800&h=600&fit=crop",
      caption: "夜間燈火",
    },
    {
      url: "https://images.unsplash.com/photo-1528164344705-47542687000d?w=800&h=600&fit=crop",
      caption: "慶典活動",
    },
  ];

  const navItems = [
    { id: "home", icon: "🏠", label: "首頁" },
    { id: "services", icon: "🪔", label: "服務" },
    { id: "events", icon: "📅", label: "活動" },
    { id: "about", icon: "ℹ️", label: "關於" },
  ];

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Desktop/Tablet Header - Hidden on Mobile */}
      <header className="hidden md:block sticky top-0 z-50 bg-white border-b border-stone-200 shadow-sm">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-600 to-red-700 flex items-center justify-center text-xl shadow-md">
                {templeData.avatar}
              </div>
              <div>
                <h1 className="font-bold text-stone-800">{templeData.name}</h1>
                <p className="text-xs text-stone-500">{templeData.subtitle}</p>
              </div>
            </div>

            {/* Desktop Navigation */}
            <nav className="flex items-center gap-1">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveSection(item.id)}
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${
                    activeSection === item.id
                      ? "bg-red-50 text-red-700"
                      : "text-stone-600 hover:bg-stone-100"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </nav>

            {/* CTA Button */}
            <button className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 text-stone-900 rounded-xl font-medium shadow-md hover:shadow-lg transition-all flex items-center gap-2">
              <span>💰</span>
              <span>線上香油錢</span>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Header - Hidden on Desktop */}
      <header className="md:hidden sticky top-0 z-50 bg-gradient-to-r from-red-800 to-red-900 text-white shadow-lg">
        <div className="px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-300 to-amber-500 flex items-center justify-center text-xl shadow-md">
              {templeData.avatar}
            </div>
            <div>
              <h1 className="font-bold text-lg leading-tight">
                {templeData.name}
              </h1>
              <p className="text-amber-200/80 text-xs">{templeData.subtitle}</p>
            </div>
          </div>
          <button className="p-2 rounded-full hover:bg-white/10 transition-colors">
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
              />
            </svg>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="pb-20 md:pb-0">
        <div className="md:hidden">
          {activeTab === "home" && (
            <MobileHome
              temple={templeData}
              events={events}
              services={services}
            />
          )}
          {activeTab === "services" && <MobileServices services={services} />}
          {activeTab === "events" && <MobileEvents events={events} />}
          {activeTab === "about" && (
            <MobileAbout temple={templeData} gallery={gallery} />
          )}
        </div>

        <div className="hidden md:block">
          {activeSection === "home" && (
            <DesktopHome
              temple={templeData}
              events={events}
              services={services}
              gallery={gallery}
            />
          )}
          {activeSection === "services" && (
            <DesktopServices services={services} />
          )}
          {activeSection === "events" && <DesktopEvents events={events} />}
          {activeSection === "about" && (
            <DesktopAbout temple={templeData} gallery={gallery} />
          )}
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-stone-200 shadow-lg z-50">
        <div className="flex">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex-1 py-3 flex flex-col items-center gap-0.5 transition-colors relative ${
                activeTab === item.id ? "text-red-700" : "text-stone-400"
              }`}
            >
              <span className="text-xl">{item.icon}</span>
              <span className="text-xs font-medium">{item.label}</span>
              {activeTab === item.id && (
                <motion.div
                  layoutId="mobile-tab"
                  className="absolute bottom-0 w-12 h-0.5 bg-red-700 rounded-full"
                />
              )}
            </button>
          ))}
        </div>
      </nav>

      {/* Mobile Floating Donate Button */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        className="md:hidden fixed bottom-24 right-4 w-14 h-14 bg-gradient-to-br from-amber-400 to-amber-500 rounded-full shadow-xl shadow-amber-500/30 flex items-center justify-center text-2xl z-40"
      >
        💰
      </motion.button>
    </div>
  );
}

// =============================================
// MOBILE COMPONENTS
// =============================================

const MobileHome = ({ temple, events, services }: any) => (
  <div>
    {/* Hero Cover */}
    <div className="relative h-48">
      <img
        src={temple.coverImage}
        alt={temple.name}
        className="w-full h-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
      <div className="absolute bottom-4 left-4 right-4 flex gap-3" />
    </div>

    {/* Quick Actions */}
    <div className="px-4 -mt-6 relative z-10">
      <div className="bg-white rounded-2xl shadow-lg p-4">
        <div className="grid grid-cols-4 gap-2">
          {[
            {
              icon: "💰",
              label: "香油錢",
              color: "from-amber-400 to-amber-500",
            },
            { icon: "🪔", label: "點燈", color: "from-red-400 to-red-500" },
            { icon: "📅", label: "活動", color: "from-blue-400 to-blue-500" },
            {
              icon: "📍",
              label: "導航",
              color: "from-emerald-400 to-emerald-500",
            },
          ].map((action, i) => (
            <motion.button
              key={i}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              className="flex flex-col items-center gap-1.5 group"
            >
              <div
                className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${action.color} flex items-center justify-center text-xl shadow-md transition-transform`}
              >
                {action.icon}
              </div>
              <span className="text-xs text-stone-600 font-medium">
                {action.label}
              </span>
            </motion.button>
          ))}
        </div>
      </div>
    </div>

    {/* Description */}
    <div className="px-4 mt-6">
      <p className="text-stone-600 leading-relaxed text-sm">
        {temple.intro ||
          "歡迎來到" +
            temple.name +
            "，這裡是地方重要的信仰中心，提供各式祈福服務。"}
      </p>
    </div>

    {/* Events Preview */}
    <section className="mt-8 px-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-stone-800">近期活動</h2>
        <button className="text-red-700 text-sm font-medium">查看全部</button>
      </div>
      <div className="space-y-3">
        {events.slice(0, 2).map((event: any) => (
          <motion.div
            key={event.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl p-4 shadow-sm border border-stone-100 flex items-center gap-4"
          >
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-red-500 to-red-600 flex flex-col items-center justify-center text-white">
              <span className="text-xs font-medium">
                {event.date.split("/")[1]}月
              </span>
              <span className="text-lg font-bold leading-none">
                {event.date.split("/")[2]}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-stone-800 truncate">
                {event.title}
              </h3>
              <p className="text-stone-500 text-sm">{event.time} 開始</p>
            </div>
            <button className="px-3 py-1.5 bg-red-50 text-red-700 rounded-lg text-sm font-medium">
              報名
            </button>
          </motion.div>
        ))}
      </div>
    </section>

    {/* Services Preview */}
    <section className="mt-8 px-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-stone-800">祈福服務</h2>
        <button className="text-red-700 text-sm font-medium">查看全部</button>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {services.slice(0, 4).map((service: any) => (
          <motion.div
            key={service.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl p-4 shadow-sm border border-stone-100"
          >
            <div className="text-3xl mb-2">{service.icon}</div>
            <h3 className="font-bold text-stone-800">{service.name}</h3>
            <p className="text-amber-600 font-medium text-sm mt-1">
              ${service.price}
              <span className="text-stone-400">/{service.unit}</span>
            </p>
          </motion.div>
        ))}
      </div>
    </section>

    {/* Contact */}
    <section className="mt-8 px-4 pb-8">
      <h2 className="text-lg font-bold text-stone-800 mb-4">參拜資訊</h2>
      <div className="bg-white rounded-xl shadow-sm border border-stone-100 divide-y divide-stone-100">
        {[
          { icon: "📍", label: "地址", value: temple.address || "台灣" },
          { icon: "⏰", label: "開放時間", value: temple.hours },
          { icon: "📞", label: "聯絡電話", value: temple.phone || "待更新" },
        ].map((item, i) => (
          <div key={i} className="p-4 flex items-center gap-3">
            <span className="text-xl">{item.icon}</span>
            <div>
              <p className="text-xs text-stone-400">{item.label}</p>
              <p className="text-stone-700">{item.value}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  </div>
);

const MobileServices = ({ services }: any) => (
  <div className="px-4 py-6">
    <h2 className="text-xl font-bold text-stone-800 mb-2">祈福服務</h2>
    <p className="text-stone-500 text-sm mb-6">線上登記，方便快速</p>

    {/* Donation Banner */}
    <div className="bg-gradient-to-r from-amber-400 to-amber-500 rounded-2xl p-5 mb-6 shadow-lg">
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center text-3xl">
          💰
        </div>
        <div className="flex-1">
          <h3 className="text-stone-900 font-bold text-lg">線上香油錢</h3>
          <p className="text-stone-800/70 text-sm">隨喜捐獻，功德無量</p>
        </div>
        <button className="px-4 py-2 bg-stone-900 text-white rounded-xl font-medium">
          捐獻
        </button>
      </div>
    </div>

    <div className="space-y-3">
      {services.map((service: any) => (
        <ServiceCard key={service.id} service={service} />
      ))}
    </div>
  </div>
);

const MobileEvents = ({ events }: any) => (
  <div className="px-4 py-6">
    <h2 className="text-xl font-bold text-stone-800 mb-2">法會活動</h2>
    <p className="text-stone-500 text-sm mb-6">歡迎信眾報名參加</p>
    <div className="space-y-4">
      {events.map((event: any) => (
        <EventCard key={event.id} event={event} />
      ))}
    </div>
  </div>
);

const MobileAbout = ({ temple, gallery }: any) => {
  const currentYear = new Date().getFullYear();
  return (
    <div className="pb-8">
      <div className="bg-gradient-to-br from-red-700 to-red-900 p-6 text-white text-center">
        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-amber-300 to-amber-500 flex items-center justify-center text-5xl mx-auto mb-4 shadow-xl">
          {temple.avatar}
        </div>
        <h1 className="text-2xl font-bold">{temple.name}</h1>
        <p className="text-amber-200/80 mt-1">{temple.subtitle}</p>
      </div>

      <section className="px-4 py-6">
        <h2 className="text-lg font-bold text-stone-800 mb-3">關於本宮</h2>
        <p className="text-stone-600 leading-relaxed">
          {temple.intro || "歡迎來到" + temple.name}
        </p>
        <p className="text-stone-600 leading-relaxed mt-4">
          {temple.fullDescription}
        </p>
      </section>

      <section className="px-4">
        <h2 className="text-lg font-bold text-stone-800 mb-3">宮廟相簿</h2>
        <div className="grid grid-cols-2 gap-2">
          {gallery.slice(0, 4).map((img: any, i: number) => (
            <div
              key={i}
              className={`rounded-xl overflow-hidden ${
                i === 0 ? "col-span-2 h-40" : "h-32"
              }`}
            >
              <img
                src={img.url}
                alt={img.caption}
                className="w-full h-full object-cover"
              />
            </div>
          ))}
        </div>
      </section>

      <section className="px-4 mt-6">
        <h2 className="text-lg font-bold text-stone-800 mb-3">追蹤我們</h2>
        <div className="flex gap-3">
          {[
            { icon: FacebookIcon, label: "Facebook", color: "bg-blue-500" },
            { icon: LineIcon, label: "LINE", color: "bg-green-500" },
            { icon: InstagramIcon, label: "Instagram", color: "bg-pink-500" },
          ].map((social, i) => {
            const Icon = social.icon;
            return (
              <button
                key={i}
                className={`flex-1 ${social.color} text-white py-3 rounded-xl font-medium flex items-center justify-center gap-2`}
              >
                <Icon className="h-5 w-5" />
                <span>{social.label}</span>
              </button>
            );
          })}
        </div>
      </section>

      <footer className="mt-8 text-center text-stone-400 text-sm">
        <p>
          © {currentYear}, All Rights Reserved. Powered by{" "}
          <a
            className="text-stone-500 hover:text-stone-700 underline-offset-2 hover:underline"
            href={BRAND_URL}
            target="_blank"
            rel="noreferrer"
          >
            {BRAND_NAME}
          </a>
        </p>
      </footer>
    </div>
  );
};

// =============================================
// DESKTOP COMPONENTS
// =============================================

const DesktopHome = ({ temple, events, services, gallery }: any) => {
  const currentYear = new Date().getFullYear();
  return (
    <div>
      {/* Hero Section */}
      <div className="relative h-[400px] lg:h-[500px]">
        <img
          src={temple.coverImage}
          alt={temple.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />

        {/* Hero Content */}
        <div className="absolute bottom-0 left-0 right-0 p-8 lg:p-12">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-end justify-between">
              <div className="text-white">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-amber-300 to-amber-500 flex items-center justify-center text-4xl shadow-xl">
                    {temple.avatar}
                  </div>
                  <div>
                    <h1 className="text-4xl lg:text-5xl font-bold">
                      {temple.name}
                    </h1>
                    <p className="text-amber-200 text-lg mt-1">
                      {temple.subtitle}
                    </p>
                  </div>
                </div>
                <p className="text-white/80 max-w-2xl text-lg">
                  {temple.intro ||
                    "歡迎來到" + temple.name + "，這裡是地方重要的信仰中心。"}
                </p>
              </div>

              {/* Stats removed from public page */}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions Bar */}
      <div className="bg-white border-b border-stone-200 sticky top-16 z-40">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex gap-3">
              {[
                {
                  icon: "💰",
                  label: "線上香油錢",
                  color: "from-amber-500 to-amber-600",
                  primary: true,
                },
                {
                  icon: "🪔",
                  label: "點燈祈福",
                  color: "from-red-500 to-red-600",
                },
                {
                  icon: "📅",
                  label: "活動報名",
                  color: "from-blue-500 to-blue-600",
                },
              ].map((action, i) => (
                <button
                  key={i}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium transition-all ${
                    action.primary
                      ? `bg-gradient-to-r ${action.color} text-white shadow-lg hover:shadow-xl`
                      : "bg-stone-100 text-stone-700 hover:bg-stone-200"
                  }`}
                >
                  <span className="text-lg">{action.icon}</span>
                  <span>{action.label}</span>
                </button>
              ))}
            </div>
            <div className="flex items-center gap-4 text-stone-500">
              {temple.phone && (
                <>
                  <a
                    href={`tel:${temple.phone}`}
                    className="flex items-center gap-2 hover:text-stone-700"
                  >
                    <span>📞</span> {temple.phone}
                  </a>
                  <span className="text-stone-300">|</span>
                </>
              )}
              <span className="flex items-center gap-2">
                <span>⏰</span> {temple.hours}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Events & Services */}
          <div className="lg:col-span-2 space-y-10">
            {/* Events Section */}
            <section>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-stone-800">近期活動</h2>
                <button className="text-red-700 font-medium hover:underline">
                  查看全部活動 →
                </button>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                {events.slice(0, 2).map((event: any) => (
                  <motion.div
                    key={event.id}
                    whileHover={{ y: -4 }}
                    className="bg-white rounded-2xl overflow-hidden shadow-sm border border-stone-100 hover:shadow-md transition-shadow"
                  >
                    {event.image && (
                      <img
                        src={event.image}
                        alt={event.title}
                        className="w-full h-40 object-cover"
                      />
                    )}
                    <div className="p-5">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-500 to-red-600 flex flex-col items-center justify-center text-white">
                          <span className="text-xs">
                            {event.date.split("/")[1]}月
                          </span>
                          <span className="text-lg font-bold leading-none">
                            {event.date.split("/")[2]}
                          </span>
                        </div>
                        <div>
                          <h3 className="font-bold text-stone-800">
                            {event.title}
                          </h3>
                          <p className="text-stone-500 text-sm">
                            {event.time} · {event.location}
                          </p>
                        </div>
                      </div>
                      <p className="text-stone-600 text-sm mb-4">
                        {event.desc}
                      </p>
                      <button className="w-full py-2.5 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 transition-colors">
                        立即報名
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </section>

            {/* Services Section */}
            <section>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-stone-800">祈福服務</h2>
                <button className="text-red-700 font-medium hover:underline">
                  查看全部服務 →
                </button>
              </div>
              <div className="grid md:grid-cols-3 gap-4">
                {services.slice(0, 6).map((service: any) => (
                  <motion.div
                    key={service.id}
                    whileHover={{ y: -4 }}
                    className="bg-white rounded-2xl p-5 shadow-sm border border-stone-100 hover:shadow-md transition-shadow group"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-red-100 to-amber-100 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                        {service.icon}
                      </div>
                      {service.popular && (
                        <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-xs font-medium rounded-full">
                          熱門
                        </span>
                      )}
                    </div>
                    <h3 className="font-bold text-stone-800 text-lg">
                      {service.name}
                    </h3>
                    <p className="text-stone-500 text-sm mt-1 mb-3">
                      {service.desc}
                    </p>
                    <div className="flex items-center justify-between">
                      <p className="text-amber-600 font-bold text-lg">
                        ${service.price}
                        <span className="text-stone-400 font-normal text-sm">
                          /{service.unit}
                        </span>
                      </p>
                      <button className="px-4 py-1.5 bg-red-50 text-red-700 rounded-lg text-sm font-medium hover:bg-red-100 transition-colors">
                        登記
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </section>

            {/* Gallery Preview */}
            <section>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-stone-800">宮廟相簿</h2>
                <button className="text-red-700 font-medium hover:underline">
                  查看更多 →
                </button>
              </div>
              <div className="grid grid-cols-4 gap-3">
                {gallery.slice(0, 4).map((img: any, i: number) => (
                  <motion.div
                    key={i}
                    whileHover={{ scale: 1.05 }}
                    className={`rounded-2xl overflow-hidden cursor-pointer transition-opacity ${
                      i === 0 ? "col-span-2 row-span-2 h-64" : "h-[120px]"
                    }`}
                  >
                    <img
                      src={img.url}
                      alt={img.caption}
                      className="w-full h-full object-cover"
                    />
                  </motion.div>
                ))}
              </div>
            </section>
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6">
            {/* Donation Card */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-gradient-to-br from-amber-400 to-amber-500 rounded-2xl p-6 shadow-xl"
            >
              <div className="text-center">
                <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-4">
                  💰
                </div>
                <h3 className="text-stone-900 font-bold text-xl mb-2">
                  線上香油錢
                </h3>
                <p className="text-stone-800/70 mb-4">隨喜捐獻，功德無量</p>
                <button className="w-full py-3 bg-stone-900 text-white rounded-xl font-medium hover:bg-stone-800 transition-colors">
                  立即捐獻
                </button>
              </div>
            </motion.div>

            {/* Contact Info */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-stone-100">
              <h3 className="font-bold text-stone-800 mb-4">參拜資訊</h3>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center">
                    📍
                  </div>
                  <div>
                    <p className="text-xs text-stone-400">地址</p>
                    <p className="text-stone-700">{temple.address || "台灣"}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
                    ⏰
                  </div>
                  <div>
                    <p className="text-xs text-stone-400">開放時間</p>
                    <p className="text-stone-700">{temple.hours}</p>
                  </div>
                </div>
                {temple.phone && (
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
                      📞
                    </div>
                    <div>
                      <p className="text-xs text-stone-400">聯絡電話</p>
                      <p className="text-stone-700">{temple.phone}</p>
                    </div>
                  </div>
                )}
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                    📧
                  </div>
                  <div>
                    <p className="text-xs text-stone-400">電子信箱</p>
                    <p className="text-stone-700">{temple.email}</p>
                  </div>
                </div>
              </div>
              <button className="w-full mt-4 py-2.5 border border-stone-300 text-stone-700 rounded-xl font-medium hover:bg-stone-50 transition-colors flex items-center justify-center gap-2">
                <GoogleMapsIcon className="h-5 w-5" /> 在 Google Maps 開啟
              </button>
            </div>

            {/* Social Links */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-stone-100">
              <h3 className="font-bold text-stone-800 mb-4">追蹤我們</h3>
              <div className="space-y-2">
                {[
                  {
                    icon: FacebookIcon,
                    label: "Facebook 粉絲專頁",
                    color: "hover:bg-blue-50 hover:text-blue-600",
                  },
                  {
                    icon: LineIcon,
                    label: "LINE 官方帳號",
                    color: "hover:bg-green-50 hover:text-green-600",
                  },
                  {
                    icon: InstagramIcon,
                    label: "Instagram",
                    color: "hover:bg-pink-50 hover:text-pink-600",
                  },
                ].map((social, i) => {
                  const Icon = social.icon;
                  return (
                    <button
                      key={i}
                      className={`w-full py-3 px-4 rounded-xl font-medium flex items-center gap-3 border border-stone-200 text-stone-700 transition-colors ${social.color}`}
                    >
                      <Icon className="h-5 w-5" />
                      <span>{social.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-stone-900 text-white py-12">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400 to-amber-500 flex items-center justify-center text-2xl">
                {temple.avatar}
              </div>
              <div>
                <h3 className="font-bold text-lg">{temple.name}</h3>
                <p className="text-stone-400 text-sm">{temple.subtitle}</p>
              </div>
            </div>
            <div className="text-stone-400 text-sm text-center">
              <p>
                © {currentYear}, All Rights Reserved. Powered by{" "}
                <a
                  className="text-stone-300 hover:text-white underline-offset-2 hover:underline"
                  href={BRAND_URL}
                  target="_blank"
                  rel="noreferrer"
                >
                  {BRAND_NAME}
                </a>
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

const DesktopServices = ({ services }: any) => (
  <div className="max-w-6xl mx-auto px-6 py-12">
    <div className="text-center mb-12">
      <h1 className="text-3xl font-bold text-stone-800 mb-3">祈福服務</h1>
      <p className="text-stone-500 text-lg">誠心祈願，功德圓滿</p>
    </div>

    {/* Donation Banner */}
    <div className="bg-gradient-to-r from-amber-400 to-amber-500 rounded-3xl p-8 mb-12 shadow-xl">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-6">
          <div className="w-20 h-20 bg-white/20 rounded-2xl flex items-center justify-center text-4xl">
            💰
          </div>
          <div>
            <h2 className="text-stone-900 font-bold text-2xl">線上香油錢</h2>
            <p className="text-stone-800/70 mt-1">
              隨喜捐獻，累積功德，護持道場
            </p>
          </div>
        </div>
        <button className="px-8 py-4 bg-stone-900 text-white rounded-2xl font-medium text-lg hover:bg-stone-800 transition-colors">
          立即捐獻
        </button>
      </div>
    </div>

    {/* Services Grid */}
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
      {services.map((service: any) => (
        <motion.div
          key={service.id}
          whileHover={{ y: -4 }}
          className="bg-white rounded-2xl p-6 shadow-sm border border-stone-100 hover:shadow-lg transition-all group"
        >
          <div className="flex items-start justify-between mb-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-red-100 to-amber-100 flex items-center justify-center text-3xl group-hover:scale-110 transition-transform">
              {service.icon}
            </div>
            {service.popular && (
              <span className="px-3 py-1 bg-amber-100 text-amber-700 text-sm font-medium rounded-full">
                熱門
              </span>
            )}
          </div>
          <h3 className="font-bold text-stone-800 text-xl mb-2">
            {service.name}
          </h3>
          <p className="text-stone-500 mb-4">{service.desc}</p>
          <div className="flex items-center justify-between pt-4 border-t border-stone-100">
            <p className="text-amber-600 font-bold text-2xl">
              ${service.price}
              <span className="text-stone-400 font-normal text-base">
                /{service.unit}
              </span>
            </p>
            <button className="px-6 py-2.5 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 transition-colors">
              立即登記
            </button>
          </div>
        </motion.div>
      ))}
    </div>
  </div>
);

const DesktopEvents = ({ events }: any) => (
  <div className="max-w-6xl mx-auto px-6 py-12">
    <div className="text-center mb-12">
      <h1 className="text-3xl font-bold text-stone-800 mb-3">法會活動</h1>
      <p className="text-stone-500 text-lg">歡迎十方信眾蒞臨參加</p>
    </div>

    <div className="space-y-6">
      {events.map((event: any) => (
        <motion.div
          key={event.id}
          whileHover={{ x: 4 }}
          className="bg-white rounded-2xl overflow-hidden shadow-sm border border-stone-100 hover:shadow-lg transition-all"
        >
          <div className="md:flex">
            {event.image && (
              <div className="md:w-72 h-48 md:h-auto">
                <img
                  src={event.image}
                  alt={event.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            <div className="flex-1 p-6 md:p-8">
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-red-500 to-red-600 flex flex-col items-center justify-center text-white shadow-lg">
                  <span className="text-sm">{event.date.split("/")[1]}月</span>
                  <span className="text-2xl font-bold leading-none">
                    {event.date.split("/")[2]}
                  </span>
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-stone-800 text-xl mb-2">
                    {event.title}
                  </h3>
                  <div className="flex items-center gap-4 text-stone-500 text-sm mb-3">
                    <span>📅 {event.date}</span>
                    <span>⏰ {event.time}</span>
                    <span>📍 {event.location}</span>
                  </div>
                  <p className="text-stone-600">{event.desc}</p>
                </div>
                <button className="px-6 py-3 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 transition-colors">
                  立即報名
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  </div>
);

const DesktopAbout = ({ temple, gallery }: any) => (
  <div>
    {/* Hero */}
    <div className="bg-gradient-to-br from-red-700 to-red-900 py-16 text-white text-center">
      <div className="max-w-4xl mx-auto px-6">
        <div className="w-28 h-28 rounded-full bg-gradient-to-br from-amber-300 to-amber-500 flex items-center justify-center text-6xl mx-auto mb-6 shadow-2xl">
          {temple.avatar}
        </div>
        <h1 className="text-4xl font-bold mb-2">{temple.name}</h1>
        <p className="text-amber-200 text-xl">{temple.subtitle}</p>
      </div>
    </div>

    <div className="max-w-6xl mx-auto px-6 py-12">
      <div className="grid lg:grid-cols-3 gap-12">
        {/* Main Content */}
        <div className="lg:col-span-2">
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-stone-800 mb-4">關於本宮</h2>
            <div className="prose prose-stone max-w-none">
              <p className="text-stone-600 leading-relaxed text-lg">
                {temple.intro || "歡迎來到" + temple.name}
              </p>
              <p className="text-stone-600 leading-relaxed text-lg mt-4">
                {temple.fullDescription}
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-stone-800 mb-6">宮廟相簿</h2>
            <div className="grid grid-cols-3 gap-4">
              {gallery.map((img: any, i: number) => (
                <motion.div
                  key={i}
                  whileHover={{ scale: 1.05 }}
                  className={`rounded-2xl overflow-hidden cursor-pointer transition-opacity ${
                    i === 0 ? "col-span-2 row-span-2 h-80" : "h-40"
                  }`}
                >
                  <img
                    src={img.url}
                    alt={img.caption}
                    className="w-full h-full object-cover"
                  />
                </motion.div>
              ))}
            </div>
          </section>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-stone-100">
            <h3 className="font-bold text-stone-800 mb-4">聯絡資訊</h3>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center">
                  📍
                </div>
                <div>
                  <p className="text-xs text-stone-400">地址</p>
                  <p className="text-stone-700">{temple.address || "台灣"}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
                  ⏰
                </div>
                <div>
                  <p className="text-xs text-stone-400">開放時間</p>
                  <p className="text-stone-700">{temple.hours}</p>
                </div>
              </div>
              {temple.phone && (
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
                    📞
                  </div>
                  <div>
                    <p className="text-xs text-stone-400">聯絡電話</p>
                    <p className="text-stone-700">{temple.phone}</p>
                  </div>
                </div>
              )}
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                  📧
                </div>
                <div>
                  <p className="text-xs text-stone-400">電子信箱</p>
                  <p className="text-stone-700">{temple.email}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Map Placeholder */}
          <div className="bg-stone-200 rounded-2xl h-64 flex items-center justify-center">
            <span className="text-stone-400 flex items-center gap-2">
              <GoogleMapsIcon className="h-5 w-5" /> Google Maps
            </span>
          </div>

          {/* Social */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-stone-100">
            <h3 className="font-bold text-stone-800 mb-4">追蹤我們</h3>
            <div className="flex gap-3">
              {[FacebookIcon, LineIcon, InstagramIcon].map((Icon, i) => (
                <button
                  key={i}
                  className="flex-1 py-3 border border-stone-200 rounded-xl hover:bg-stone-50 transition-colors flex items-center justify-center"
                >
                  <Icon className="h-6 w-6" />
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

// =============================================
// SHARED COMPONENTS
// =============================================

const ServiceCard = ({ service }: any) => (
  <div className="bg-white rounded-xl p-4 shadow-sm border border-stone-100">
    <div className="flex items-start gap-4">
      <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-red-100 to-amber-100 flex items-center justify-center text-2xl">
        {service.icon}
      </div>
      <div className="flex-1">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-stone-800">{service.name}</h3>
          <p className="text-amber-600 font-bold">
            ${service.price}
            <span className="text-stone-400 font-normal text-sm">
              /{service.unit}
            </span>
          </p>
        </div>
        <p className="text-stone-500 text-sm mt-1">{service.desc}</p>
        <button className="mt-3 w-full py-2 bg-red-50 text-red-700 rounded-lg font-medium hover:bg-red-100 transition-colors">
          立即登記
        </button>
      </div>
    </div>
  </div>
);

const EventCard = ({ event }: any) => (
  <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-stone-100">
    <div className="bg-gradient-to-r from-red-600 to-red-700 p-4 text-white">
      <div className="flex items-center gap-3">
        <div className="w-16 h-16 bg-white/20 rounded-xl flex flex-col items-center justify-center">
          <span className="text-sm">{event.date.split("/")[1]}月</span>
          <span className="text-2xl font-bold">{event.date.split("/")[2]}</span>
        </div>
        <div>
          <h3 className="font-bold text-lg">{event.title}</h3>
          <p className="text-white/80 text-sm mt-0.5">
            {event.date} {event.time}
          </p>
        </div>
      </div>
    </div>
    <div className="p-4">
      <p className="text-stone-600 text-sm mb-4">{event.desc}</p>
      <div className="flex gap-2">
        <button className="flex-1 py-2.5 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 transition-colors">
          立即報名
        </button>
        <button className="px-4 py-2.5 border border-stone-300 text-stone-600 rounded-xl font-medium hover:bg-stone-50 transition-colors">
          詳情
        </button>
      </div>
    </div>
  </div>
);
