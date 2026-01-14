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

  const metadata: Metadata = {
    title: temple.name,
    description: temple.intro || `歡迎來到${temple.name}`,
  };

  // Add favicon if available
  if (temple.favicon_url) {
    metadata.icons = {
      icon: temple.favicon_url,
      shortcut: temple.favicon_url,
      apple: temple.favicon_url,
    };
  }

  return metadata;
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
