import type { MetadataRoute } from "next";

import { siteUrl } from "@/lib/sito";
import { client } from "@/sanity/lib/client";
import { PAGE_SLUGS_QUERY } from "@/sanity/lib/queries";

export const revalidate = 3600;

/** Elenco delle pagine per i motori di ricerca, generato da Sanity. */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const pagine = await client
    .withConfig({ stega: false })
    .fetch<{ slug: string; _updatedAt: string }[]>(PAGE_SLUGS_QUERY);

  return pagine.map((p) => ({
    url: p.slug === "home" ? siteUrl : `${siteUrl}/${p.slug}`,
    lastModified: p._updatedAt,
    priority: p.slug === "home" ? 1 : 0.7,
  }));
}
