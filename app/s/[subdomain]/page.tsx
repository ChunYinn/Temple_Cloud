import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTempleBySlug } from "@/lib/subdomains";
import { rootDomain, sanitizeSlug } from "@/lib/utils";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ subdomain: string }>;
}): Promise<Metadata> {
  const { subdomain } = await params;
  const temple = await getTempleBySlug(sanitizeSlug(subdomain));

  if (!temple) {
    return {
      title: '廟務雲',
    };
  }

  return {
    title: `${temple.name} | 廟務雲`,
    description: temple.intro || `歡迎來到${temple.name}`,
  };
}

export default async function SubdomainPage({
  params,
}: {
  params: Promise<{ subdomain: string }>;
}) {
  const { subdomain } = await params;
  const temple = await getTempleBySlug(sanitizeSlug(subdomain));

  if (!temple) {
    notFound();
  }

  // Mock blocks for now - will use real data later
  const mockBlocks = [
    { id: '1', type: 'donation', title: '線上香油錢', subtitle: '隨喜捐獻', icon: '💰', enabled: true, href: '#' },
    { id: '2', type: 'service', title: '光明燈登記', subtitle: '$500/年', icon: '🪔', enabled: true, href: '#' },
    { id: '3', type: 'service', title: '太歲安奉', subtitle: '$800/年', icon: '🐲', enabled: true, href: '#' },
    { id: '5', type: 'link', title: '交通資訊', subtitle: temple.address || '地址與停車', icon: '📍', enabled: true, href: '#' },
  ];

  const blocks = mockBlocks.filter(b => b.enabled);
  const templeEmoji = '🏛️';

  return (
    <div className="min-h-screen bg-gradient-to-b from-red-900 via-red-800 to-stone-900">
      {/* Background Effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-amber-500/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-red-500/10 rounded-full blur-[100px]" />
      </div>

      {/* Content */}
      <div className="relative z-10 flex min-h-screen flex-col items-center justify-center p-4">
        <div className="w-full max-w-md">
          {/* Temple Info */}
          <div className="text-center mb-8">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-amber-300 via-amber-400 to-amber-600 flex items-center justify-center mx-auto mb-4 shadow-2xl shadow-amber-500/30">
              <span className="text-4xl">{templeEmoji}</span>
            </div>
            <h1 className="text-3xl font-bold text-amber-50 mb-2">
              {temple.name}
            </h1>
            <p className="text-amber-200/80 text-lg">
              {temple.intro || '主祀玉皇大帝'}
            </p>
            {temple.phone && (
              <p className="text-amber-200/60 text-sm mt-2">
                電話：{temple.phone}
              </p>
            )}
          </div>

          {/* Blocks */}
          <div className="space-y-3">
            {blocks.map((block) => (
              <a
                key={block.id}
                href={block.href}
                className="block bg-stone-800/80 backdrop-blur-sm rounded-xl p-4 border border-amber-500/20 hover:bg-stone-800/90 hover:border-amber-500/40 transition-all group"
                target={block.href && block.href !== '#' ? "_blank" : undefined}
                rel={block.href && block.href !== '#' ? "noopener noreferrer" : undefined}
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center text-xl shadow-lg group-hover:scale-105 transition-transform">
                    {block.icon}
                  </div>
                  <div className="flex-1">
                    <div className="text-amber-50 font-medium">
                      {block.title}
                    </div>
                    <div className="text-amber-200/60 text-sm">
                      {block.subtitle}
                    </div>
                  </div>
                  <div className="text-amber-400/50 group-hover:text-amber-400 transition-colors">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </a>
            ))}
          </div>

          {/* Footer Brand */}
          <div className="mt-12 text-center">
            <a
              href={`https://${rootDomain}`}
              className="inline-flex items-center gap-1.5 text-amber-200/40 hover:text-amber-200/60 text-sm transition-colors"
            >
              <span>🏮</span>
              <span>廟務雲</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
