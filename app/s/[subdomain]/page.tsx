import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTempleBySlug } from "@/lib/subdomains";
import { rootDomain, sanitizeSlug } from "@/lib/utils";
import { TemplePublicPage } from "@/components/temple-public-page";

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

  return <TemplePublicPage temple={temple} />;
}
