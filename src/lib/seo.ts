import { useEffect } from 'react';

type SeoOptions = {
  title: string;
  description: string;
  /** Path relative to site, e.g. "/shop/colombia-corazon" */
  canonical?: string;
  /** OpenGraph image URL (absolute or root-relative). */
  image?: string;
  type?: 'website' | 'product' | 'article';
};

const SITE_NAME = 'Tengu Roastery';
const SITE_URL = 'https://tenguroastery.cl';
const DEFAULT_IMAGE = '/og-image.jpg';

function setMeta(name: string, content: string, attr: 'name' | 'property' = 'name') {
  if (!content) return;
  let tag = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${name}"]`);
  if (!tag) {
    tag = document.createElement('meta');
    tag.setAttribute(attr, name);
    document.head.appendChild(tag);
  }
  tag.content = content;
}

function setLink(rel: string, href: string) {
  let tag = document.head.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`);
  if (!tag) {
    tag = document.createElement('link');
    tag.rel = rel;
    document.head.appendChild(tag);
  }
  tag.href = href;
}

export function useSeo({ title, description, canonical, image, type = 'website' }: SeoOptions) {
  useEffect(() => {
    const fullTitle = title.includes(SITE_NAME) ? title : `${title} · ${SITE_NAME}`;
    const url = canonical ? `${SITE_URL}${canonical}` : SITE_URL;
    const ogImage = (image ?? DEFAULT_IMAGE).startsWith('http') ? (image ?? DEFAULT_IMAGE) : `${SITE_URL}${image ?? DEFAULT_IMAGE}`;

    document.title = fullTitle;
    setMeta('description', description);

    setMeta('og:title', fullTitle, 'property');
    setMeta('og:description', description, 'property');
    setMeta('og:type', type, 'property');
    setMeta('og:url', url, 'property');
    setMeta('og:image', ogImage, 'property');
    setMeta('og:site_name', SITE_NAME, 'property');
    setMeta('og:locale', 'es_CL', 'property');

    setMeta('twitter:card', 'summary_large_image');
    setMeta('twitter:title', fullTitle);
    setMeta('twitter:description', description);
    setMeta('twitter:image', ogImage);

    setLink('canonical', url);
  }, [title, description, canonical, image, type]);
}

export function setStructuredData(id: string, data: object) {
  const existing = document.head.querySelector(`script[data-jsonld="${id}"]`);
  if (existing) existing.remove();
  const script = document.createElement('script');
  script.type = 'application/ld+json';
  script.dataset.jsonld = id;
  script.text = JSON.stringify(data);
  document.head.appendChild(script);
}

export function clearStructuredData(id: string) {
  document.head.querySelector(`script[data-jsonld="${id}"]`)?.remove();
}

export const SEO_DEFAULTS = {
  siteName: SITE_NAME,
  siteUrl: SITE_URL,
  defaultImage: DEFAULT_IMAGE,
};
