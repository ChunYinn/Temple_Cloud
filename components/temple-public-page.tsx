"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Copy, Check } from "lucide-react";
import {
  BRAND,
  TEMPLE_DEFAULTS,
  NAV_ITEMS,
  QUICK_ACTIONS,
  MOCK_EVENTS,
  MOCK_SERVICES,
  MOCK_GALLERY,
  COLORS,
  IMAGE_SIZES,
} from "@/lib/constants";

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


// =============================================
// Temple Public Page - Responsive Design
// =============================================

type EventData = {
  id: string;
  title: string;
  description?: string | null;
  image_url?: string | null;
  event_date: Date | string;
  event_time: string;
  location: string;
  max_capacity?: number | null;
  current_registrations: number;
  registration_deadline?: Date | string | null;
};

type ServiceData = {
  id: string;
  icon: string;
  name: string;
  description?: string | null;
  price: number;
  unit: string;
  is_popular: boolean;
};

type TempleData = {
  name: string;
  slug: string;
  intro?: string | null;
  full_description?: string | null;
  address?: string | null;
  phone?: string | null;
  hours?: string | null;
  email?: string | null;
  avatar_emoji?: string | null;
  logo_url?: string | null;
  favicon_url?: string | null;
  cover_image_url?: string | null;
  gallery_photos?: string[] | null;
  facebook_url?: string | null;
  line_id?: string | null;
  instagram_url?: string | null;
  events?: EventData[];
  services?: ServiceData[];
};

export function TemplePublicPage({ temple }: { temple: TempleData }) {
  const [activeTab, setActiveTab] = useState("home");
  const [activeSection, setActiveSection] = useState("home");
  const currentYear = new Date().getFullYear();

  // Enhanced temple data with default values from constants
  const templeData = {
    ...temple,
    avatar: temple.avatar_emoji || TEMPLE_DEFAULTS.avatar,
    coverImage: temple.cover_image_url || TEMPLE_DEFAULTS.coverImage,
    email: temple.email || `contact@${temple.slug}.temple.tw`,
    hours: temple.hours || TEMPLE_DEFAULTS.hours,
    social: {
      facebook: temple.facebook_url || "#",
      line: temple.line_id || "#",
      instagram: temple.instagram_url || "#",
    },
    fullDescription: temple.full_description || temple.intro ||
      "本宮秉持「慈悲濟世、普渡眾生」之精神，致力於弘揚傳統文化，服務地方信眾。廟內供奉玉皇大帝、觀世音菩薩、關聖帝君等諸神，建築莊嚴肅穆，雕樑畫棟，充分展現台灣傳統廟宇之美。",
  };

  // Format events data from database
  const formatEventDate = (date: Date | string) => {
    const d = new Date(date);
    return `${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, '0')}/${String(d.getDate()).padStart(2, '0')}`;
  };

  const events = temple.events && temple.events.length > 0
    ? temple.events.map(event => ({
        id: event.id,
        title: event.title,
        date: formatEventDate(event.event_date),
        time: event.event_time,
        location: event.location,
        desc: event.description || '歡迎參加',
        image: event.image_url,
        registrationRequired: event.max_capacity !== null,
        registrationLimit: event.max_capacity || 0,
        currentRegistrations: event.current_registrations,
        registrationDeadline: event.registration_deadline
      }))
    : MOCK_EVENTS;

  // Use mock services for now (as requested)
  const services = MOCK_SERVICES;

  // Use real gallery photos if available, otherwise use mock
  const gallery = temple.gallery_photos && temple.gallery_photos.length > 0
    ? temple.gallery_photos.map((url, index) => ({
        id: index + 1,
        url,
        caption: `寺廟照片 ${index + 1}`,
        category: 'temple'
      }))
    : MOCK_GALLERY;

  const navItems = NAV_ITEMS;

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Desktop/Tablet Header - Hidden on Mobile */}
      <header className="hidden md:block sticky top-0 z-50 bg-white border-b border-stone-200 shadow-sm">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-3">
              {temple.logo_url ? (
                <img
                  src={temple.logo_url}
                  alt={templeData.name}
                  className="w-10 h-10 rounded-xl object-cover shadow-md"
                />
              ) : (
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-600 to-red-700 flex items-center justify-center text-xl shadow-md">
                  {templeData.avatar}
                </div>
              )}
              <div>
                <h1 className="font-bold text-stone-800">{templeData.name}</h1>
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
      <header
        className={`md:hidden sticky top-0 z-50 ${COLORS.header.mobile} text-white shadow-lg`}
      >
        <div className="px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {temple.logo_url ? (
              <img
                src={temple.logo_url}
                alt={templeData.name}
                className="w-10 h-10 rounded-full object-cover shadow-md"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-300 to-amber-500 flex items-center justify-center text-xl shadow-md">
                {templeData.avatar}
              </div>
            )}
            <div>
              <h1 className="font-bold text-lg leading-tight">
                {templeData.name}
              </h1>
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

const MobileHome = ({ temple, events, services }: any) => {
  const [copiedAddress, setCopiedAddress] = useState(false);

  const handleCopyAddress = (address: string) => {
    navigator.clipboard.writeText(address);
    setCopiedAddress(true);
    setTimeout(() => setCopiedAddress(false), 2000);
  };

  return (
  <div>
    {/* Hero Cover */}
    <div className={`relative ${IMAGE_SIZES.hero.mobile}`}>
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
          {QUICK_ACTIONS.map((action, i) => (
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
              {event.registrationRequired && event.registrationLimit && (
                <p className="text-stone-400 text-xs mt-0.5">
                  {event.currentRegistrations}/{event.registrationLimit} 名額
                </p>
              )}
            </div>
            <button
              className={`px-3 py-1.5 rounded-lg text-sm font-medium ${
                event.currentRegistrations >= event.registrationLimit
                  ? 'bg-stone-100 text-stone-400'
                  : 'bg-red-50 text-red-700'
              }`}
              disabled={event.registrationRequired && event.currentRegistrations >= event.registrationLimit}
            >
              {event.currentRegistrations >= event.registrationLimit ? '已滿' : '報名'}
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
        {/* Address with Copy button */}
        <div className="p-4 flex items-center gap-3">
          <span className="text-xl">📍</span>
          <div className="flex-1">
            <p className="text-xs text-stone-400 mb-1">地址</p>
            <div className="flex items-start gap-2">
              <p className="text-stone-700 flex-1">{temple.address || "台灣"}</p>
              {temple.address && (
                <button
                  onClick={() => handleCopyAddress(temple.address!)}
                  className="text-xs text-stone-500 hover:text-stone-700 flex items-center gap-1 transition-colors px-2 py-0.5 border border-stone-200 rounded-md hover:bg-stone-50"
                >
                  {copiedAddress ? (
                    <><Check className="w-3 h-3" />已複製</>
                  ) : (
                    <><Copy className="w-3 h-3" />複製</>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Opening Hours */}
        <div className="p-4 flex items-center gap-3">
          <span className="text-xl">⏰</span>
          <div>
            <p className="text-xs text-stone-400">開放時間</p>
            <p className="text-stone-700">{temple.hours}</p>
          </div>
        </div>

        {/* Phone */}
        <div className="p-4 flex items-center gap-3">
          <span className="text-xl">📞</span>
          <div>
            <p className="text-xs text-stone-400">聯絡電話</p>
            <p className="text-stone-700">{temple.phone || "待更新"}</p>
          </div>
        </div>
      </div>
    </section>
  </div>
  );
};

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
      {/* Hero with Cover Image or Gradient Fallback */}
      <div className="relative h-48 overflow-hidden">
        {temple.coverImage ? (
          <>
            <img
              src={temple.coverImage}
              alt={temple.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent" />
          </>
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-red-700 to-red-900" />
        )}
        <div className="absolute inset-0 flex items-center justify-center text-white text-center p-6">
          <div>
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-amber-300 to-amber-500 flex items-center justify-center text-5xl mx-auto mb-4 shadow-xl">
              {temple.avatar}
            </div>
            <h1 className="text-2xl font-bold">{temple.name}</h1>
          </div>
        </div>
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
        <div className="flex justify-center gap-4">
          {temple.facebook_url && (
            <a
              href={temple.facebook_url}
              target="_blank"
              rel="noopener noreferrer"
              className="w-12 h-12 bg-blue-600 hover:bg-blue-700 text-white rounded-full flex items-center justify-center shadow-lg transition-all hover:scale-110"
              aria-label="Facebook"
            >
              <FacebookIcon className="h-6 w-6" />
            </a>
          )}
          {temple.line_id && (
            <a
              href={`https://line.me/R/ti/p/${temple.line_id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-12 h-12 bg-green-500 hover:bg-green-600 text-white rounded-full flex items-center justify-center shadow-lg transition-all hover:scale-110"
              aria-label="LINE"
            >
              <LineIcon className="h-6 w-6" />
            </a>
          )}
          {temple.instagram_url && (
            <a
              href={temple.instagram_url}
              target="_blank"
              rel="noopener noreferrer"
              className="w-12 h-12 bg-gradient-to-br from-purple-600 via-pink-600 to-orange-600 hover:opacity-90 text-white rounded-full flex items-center justify-center shadow-lg transition-all hover:scale-110"
              aria-label="Instagram"
            >
              <InstagramIcon className="h-6 w-6" />
            </a>
          )}
        </div>
      </section>

      <footer className="mt-8 pb-4 text-center text-stone-400 text-xs">
        <p>© {currentYear} {BRAND.name}</p>
      </footer>
    </div>
  );
};

// =============================================
// DESKTOP COMPONENTS
// =============================================

const DesktopHome = ({ temple, events, services, gallery }: any) => {
  const currentYear = new Date().getFullYear();
  const [copiedAddress, setCopiedAddress] = useState(false);

  const handleCopyAddress = (address: string) => {
    navigator.clipboard.writeText(address);
    setCopiedAddress(true);
    setTimeout(() => setCopiedAddress(false), 2000);
  };

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
                      <p className="text-stone-600 text-sm mb-3">
                        {event.desc}
                      </p>
                      {event.registrationRequired && event.registrationLimit && (
                        <div className="flex items-center justify-between text-sm mb-3">
                          <span className="text-stone-500">
                            👥 {event.currentRegistrations}/{event.registrationLimit} 名額
                          </span>
                          {event.currentRegistrations >= event.registrationLimit && (
                            <span className="text-red-600 font-medium">已額滿</span>
                          )}
                        </div>
                      )}
                      <button
                        className={`w-full py-2.5 rounded-xl font-medium transition-colors ${
                          event.currentRegistrations >= event.registrationLimit
                            ? 'bg-stone-400 text-white cursor-not-allowed'
                            : 'bg-red-600 text-white hover:bg-red-700'
                        }`}
                        disabled={event.registrationRequired && event.currentRegistrations >= event.registrationLimit}
                      >
                        {event.registrationRequired
                          ? (event.currentRegistrations >= event.registrationLimit ? '已額滿' : '立即報名')
                          : '查看詳情'
                        }
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
            <div className="bg-white rounded-2xl shadow-sm border border-stone-100 overflow-hidden">
              <div className="px-6 py-4 bg-gradient-to-r from-stone-50 to-white border-b border-stone-100">
                <h3 className="font-bold text-stone-800">參拜資訊</h3>
              </div>
              <div className="p-6 space-y-5">
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-red-50 flex items-center justify-center text-lg">
                    📍
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-stone-600 mb-1">地址</p>
                    <div className="flex items-start gap-2">
                      <p className="text-base text-stone-900 break-words flex-1">{temple.address || "台灣"}</p>
                      {temple.address && (
                        <button
                          onClick={() => handleCopyAddress(temple.address!)}
                          className="text-xs text-stone-500 hover:text-stone-700 flex items-center gap-1 transition-colors px-2 py-1 border border-stone-200 rounded-md hover:bg-stone-50"
                        >
                          {copiedAddress ? (
                            <><Check className="w-3 h-3" />已複製</>
                          ) : (
                            <><Copy className="w-3 h-3" />複製</>
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center text-lg">
                    ⏰
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-stone-600 mb-1">開放時間</p>
                    <p className="text-base text-stone-900">{temple.hours || "每日 06:00 - 21:00"}</p>
                  </div>
                </div>
                {temple.phone && (
                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center text-lg">
                      📞
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-stone-600 mb-1">聯絡電話</p>
                      <p className="text-base text-stone-900">{temple.phone}</p>
                    </div>
                  </div>
                )}
                {temple.email && (
                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-lg">
                      📧
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-stone-600 mb-1">電子信箱</p>
                      <p className="text-base text-stone-900 break-all">{temple.email}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Social Links */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-stone-100">
              <h3 className="font-bold text-stone-800 mb-4">追蹤我們</h3>
              <div className="space-y-2">
                {temple.facebook_url && (
                  <a
                    href={temple.facebook_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-3 px-4 rounded-xl font-medium flex items-center gap-3 border border-stone-200 text-stone-700 transition-colors hover:bg-blue-50 hover:text-blue-600"
                  >
                    <FacebookIcon className="h-5 w-5" />
                    <span>Facebook 粉絲專頁</span>
                  </a>
                )}
                {temple.line_id && (
                  <a
                    href={`https://line.me/R/ti/p/${temple.line_id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-3 px-4 rounded-xl font-medium flex items-center gap-3 border border-stone-200 text-stone-700 transition-colors hover:bg-green-50 hover:text-green-600"
                  >
                    <LineIcon className="h-5 w-5" />
                    <span>LINE 官方帳號</span>
                  </a>
                )}
                {temple.instagram_url && (
                  <a
                    href={temple.instagram_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-3 px-4 rounded-xl font-medium flex items-center gap-3 border border-stone-200 text-stone-700 transition-colors hover:bg-pink-50 hover:text-pink-600"
                  >
                    <InstagramIcon className="h-5 w-5" />
                    <span>Instagram</span>
                  </a>
                )}
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
              </div>
            </div>
            <div className="text-stone-400 text-sm text-center">
              <p>
                {BRAND.copyright(currentYear)} Powered by{" "}
                <a
                  className="text-stone-300 hover:text-white underline-offset-2 hover:underline"
                  href={BRAND.url}
                  target="_blank"
                  rel="noreferrer"
                >
                  {BRAND.name}
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

const DesktopAbout = ({ temple, gallery }: any) => {
  const [copiedAddress, setCopiedAddress] = useState(false);

  const handleCopyAddress = (address: string) => {
    navigator.clipboard.writeText(address);
    setCopiedAddress(true);
    setTimeout(() => setCopiedAddress(false), 2000);
  };

  return (
    <div>
    {/* Hero with Cover Image or Gradient Fallback */}
    <div className="relative h-64 overflow-hidden">
      {temple.coverImage ? (
        <>
          <img
            src={temple.coverImage}
            alt={temple.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent" />
        </>
      ) : (
        <div className="w-full h-full bg-gradient-to-br from-red-700 to-red-900" />
      )}
      <div className="absolute inset-0 flex items-center justify-center text-white text-center">
        <div>
          <div className="w-28 h-28 rounded-full bg-gradient-to-br from-amber-300 to-amber-500 flex items-center justify-center text-6xl mx-auto mb-6 shadow-2xl">
            {temple.avatar}
          </div>
          <h1 className="text-4xl font-bold mb-2">{temple.name}</h1>
        </div>
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
          <div className="bg-white rounded-2xl shadow-sm border border-stone-100 overflow-hidden">
            <div className="px-6 py-4 bg-gradient-to-r from-stone-50 to-white border-b border-stone-100">
              <h3 className="font-bold text-stone-800">聯絡資訊</h3>
            </div>
            <div className="p-6 space-y-5">
              {/* Address with Copy */}
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-red-50 flex items-center justify-center text-lg">
                  📍
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-stone-600 mb-1">地址</p>
                  <div className="flex items-start gap-2">
                    <p className="text-base text-stone-900 break-words flex-1">{temple.address || "台灣"}</p>
                    {temple.address && (
                      <button
                        onClick={() => handleCopyAddress(temple.address!)}
                        className="text-xs text-stone-500 hover:text-stone-700 flex items-center gap-1 transition-colors px-2 py-1 border border-stone-200 rounded-md hover:bg-stone-50"
                      >
                        {copiedAddress ? (
                          <>
                            <Check className="w-3 h-3" />
                            已複製
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            複製
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Hours */}
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center text-lg">
                  ⏰
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-stone-600 mb-1">開放時間</p>
                  <p className="text-base text-stone-900">{temple.hours || "每日 06:00 - 21:00"}</p>
                </div>
              </div>

              {/* Phone */}
              {temple.phone && (
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center text-lg">
                    📞
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-stone-600 mb-1">聯絡電話</p>
                    <p className="text-base text-stone-900">{temple.phone}</p>
                  </div>
                </div>
              )}

              {/* Email */}
              {temple.email && (
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-lg">
                    📧
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-stone-600 mb-1">電子信箱</p>
                    <p className="text-base text-stone-900 break-all">{temple.email}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Google Maps */}
          {temple.address && (
            <div className="rounded-2xl overflow-hidden h-64 shadow-sm border border-stone-100">
              <iframe
                width="100%"
                height="100%"
                style={{ border: 0 }}
                src={`https://www.google.com/maps/embed/v1/place?key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8&q=${encodeURIComponent(temple.address)}&zoom=15`}
                allowFullScreen
                title="Temple Location"
              />
            </div>
          )}

          {/* Social */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-stone-100">
            <h3 className="font-bold text-stone-800 mb-4">追蹤我們</h3>
            <div className="flex gap-3">
              {temple.facebook_url && (
                <a
                  href={temple.facebook_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 py-3 border border-stone-200 rounded-xl hover:bg-stone-50 transition-colors flex items-center justify-center"
                >
                  <FacebookIcon className="h-6 w-6" />
                </a>
              )}
              {temple.line_id && (
                <a
                  href={`https://line.me/R/ti/p/${temple.line_id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 py-3 border border-stone-200 rounded-xl hover:bg-stone-50 transition-colors flex items-center justify-center"
                >
                  <LineIcon className="h-6 w-6" />
                </a>
              )}
              {temple.instagram_url && (
                <a
                  href={temple.instagram_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 py-3 border border-stone-200 rounded-xl hover:bg-stone-50 transition-colors flex items-center justify-center"
                >
                  <InstagramIcon className="h-6 w-6" />
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  );
};

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
        <div className="flex-1">
          <h3 className="font-bold text-lg">{event.title}</h3>
          <p className="text-white/80 text-sm mt-0.5">
            {event.date} {event.time}
          </p>
        </div>
        {event.registrationRequired && event.registrationLimit && (
          <div className="text-right">
            <p className="text-white/90 text-xs">報名人數</p>
            <p className="text-white font-bold">
              {event.currentRegistrations}/{event.registrationLimit}
            </p>
          </div>
        )}
      </div>
    </div>
    <div className="p-4">
      <p className="text-stone-600 text-sm mb-3">{event.desc}</p>
      {event.registrationRequired && event.registrationLimit && (
        <div className="mb-3">
          <div className="w-full bg-stone-200 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-red-500 to-red-600 h-2 rounded-full transition-all"
              style={{ width: `${Math.min((event.currentRegistrations / event.registrationLimit) * 100, 100)}%` }}
            />
          </div>
          <p className="text-xs text-stone-500 mt-1">
            {event.currentRegistrations >= event.registrationLimit
              ? '名額已滿'
              : `剩餘 ${event.registrationLimit - event.currentRegistrations} 個名額`
            }
          </p>
        </div>
      )}
      <div className="flex gap-2">
        <button
          className={`flex-1 py-2.5 rounded-xl font-medium transition-colors ${
            event.registrationRequired && event.currentRegistrations >= event.registrationLimit
              ? 'bg-stone-400 text-white cursor-not-allowed'
              : 'bg-red-600 text-white hover:bg-red-700'
          }`}
          disabled={event.registrationRequired && event.currentRegistrations >= event.registrationLimit}
        >
          {event.registrationRequired
            ? (event.currentRegistrations >= event.registrationLimit ? '已額滿' : '立即報名')
            : '自由參加'
          }
        </button>
        <button className="px-4 py-2.5 border border-stone-300 text-stone-600 rounded-xl font-medium hover:bg-stone-50 transition-colors">
          詳情
        </button>
      </div>
    </div>
  </div>
);
