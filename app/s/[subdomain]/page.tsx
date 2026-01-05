import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { getTempleBySlug } from "@/lib/subdomains";
import { protocol, rootDomain, sanitizeSlug } from "@/lib/utils";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ subdomain: string }>;
}): Promise<Metadata> {
  const { subdomain } = await params;
  const temple = await getTempleBySlug(sanitizeSlug(subdomain));

  if (!temple) {
    return {
      title: rootDomain,
    };
  }

  return {
    title: `${temple.name} | ${subdomain}.${rootDomain}`,
    description: temple.intro || `Temple page for ${subdomain}.${rootDomain}`,
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

  const blocks = temple.page?.blocks ?? [];

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-blue-50 to-white p-4">
      <div className="absolute top-4 right-4">
        <Link
          href={`${protocol}://${rootDomain}`}
          className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
        >
          {rootDomain}
        </Link>
      </div>

      <div className="flex-1 flex items-center justify-center">
        <div className="text-center max-w-2xl space-y-4">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900">
            {temple.name}
          </h1>
          <p className="mt-3 text-lg text-gray-600">
            {temple.intro || `歡迎來到 ${temple.name}`}
          </p>
          <div className="text-gray-500 text-sm space-y-1">
            {temple.address && <div>{temple.address}</div>}
            {temple.phone && <div>{temple.phone}</div>}
          </div>

          {blocks.length > 0 && (
            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              {blocks.map((block) => (
                <a
                  key={block.id}
                  href={block.href || "#"}
                  className="bg-white border rounded-lg p-4 text-left shadow-sm hover:shadow-md transition-shadow"
                  target={block.href ? "_blank" : undefined}
                  rel={block.href ? "noopener noreferrer" : undefined}
                >
                  <div className="font-semibold">{block.title}</div>
                  {block.subtitle && (
                    <div className="text-sm text-gray-600 mt-1">
                      {block.subtitle}
                    </div>
                  )}
                </a>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
