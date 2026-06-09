import { useEffect } from 'react';
import { SITE_URL, SITE_NAME, type PageSeo } from '../utils/seo';

function upsertMeta(attr: 'name' | 'property', key: string, content: string) {
  let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

function upsertCanonical(href: string) {
  let el = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  if (!el) {
    el = document.createElement('link');
    el.setAttribute('rel', 'canonical');
    document.head.appendChild(el);
  }
  el.setAttribute('href', href);
}

function upsertJsonLd(data: object) {
  const id = 'seo-page-jsonld';
  let el = document.getElementById(id) as HTMLScriptElement | null;
  if (!el) {
    el = document.createElement('script');
    el.id = id;
    el.type = 'application/ld+json';
    document.head.appendChild(el);
  }
  el.textContent = JSON.stringify(data);
}

/**
 * Keeps the document head in sync with the current route: title, meta
 * description, canonical URL, Open Graph / Twitter tags, and a per-page
 * LearningResource JSON-LD block. Search engines that execute JavaScript
 * (Google, Bing) index these per-route values; the static defaults in
 * index.html cover the initial HTML response.
 */
export function useSeo({ title, description, path }: PageSeo) {
  useEffect(() => {
    const url = `${SITE_URL}${path}`;

    document.title = title;
    upsertMeta('name', 'description', description);
    upsertCanonical(url);

    upsertMeta('property', 'og:title', title);
    upsertMeta('property', 'og:description', description);
    upsertMeta('property', 'og:url', url);
    upsertMeta('name', 'twitter:title', title);
    upsertMeta('name', 'twitter:description', description);

    upsertJsonLd({
      '@context': 'https://schema.org',
      '@type': 'LearningResource',
      name: title,
      description,
      url,
      learningResourceType: 'Interactive visualization',
      educationalLevel: 'Beginner to advanced',
      isAccessibleForFree: true,
      isPartOf: {
        '@type': 'WebApplication',
        name: SITE_NAME,
        url: SITE_URL,
      },
    });
  }, [title, description, path]);
}
