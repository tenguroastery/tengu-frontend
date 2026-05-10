import { useEffect } from 'react';
import { Link } from 'react-router-dom';

import { setStructuredData, clearStructuredData, SEO_DEFAULTS } from '../lib/seo';

export type Crumb = {
  label: string;
  href?: string;
};

type Props = {
  items: Crumb[];
  /** ID único para JSON-LD; si la página tiene múltiples breadcrumbs, distinguir */
  structuredDataId?: string;
};

export default function Breadcrumbs({ items, structuredDataId = 'breadcrumbs' }: Props) {
  useEffect(() => {
    const list = items.map((item, idx) => ({
      '@type': 'ListItem',
      position: idx + 1,
      name: item.label,
      item: item.href ? `${SEO_DEFAULTS.siteUrl}${item.href}` : undefined,
    }));
    setStructuredData(structuredDataId, {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: list,
    });
    return () => clearStructuredData(structuredDataId);
  }, [items, structuredDataId]);

  return (
    <nav aria-label="Migas de pan" className="text-xs text-tengu-dark/60">
      <ol className="flex flex-wrap items-center gap-1">
        {items.map((item, idx) => {
          const last = idx === items.length - 1;
          return (
            <li key={`${item.label}-${idx}`} className="flex items-center gap-1">
              {item.href && !last ? (
                <Link to={item.href} className="hover:text-tengu-ink">
                  {item.label}
                </Link>
              ) : (
                <span className={last ? 'text-tengu-dark' : ''}>{item.label}</span>
              )}
              {!last && <span aria-hidden="true">/</span>}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
