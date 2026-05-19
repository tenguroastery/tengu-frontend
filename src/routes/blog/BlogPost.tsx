import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

import Breadcrumbs from '../../components/Breadcrumbs';
import SafeImg from '../../components/SafeImg';
import { api } from '../../lib/api';
import { setStructuredData, useSeo } from '../../lib/seo';
import { useRevalidationTick } from '../../lib/useRevalidateOnFocus';
import type { Post } from '../../types';

export default function BlogPost() {
  const { slug = '' } = useParams();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const tick = useRevalidationTick();

  useEffect(() => {
    setLoading(true);
    api.getPost(slug)
      .then(setPost)
      .catch(() => setPost(null))
      .finally(() => setLoading(false));
  }, [slug, tick]);

  useSeo({
    title: post?.title ?? 'Artículo',
    description: post?.meta_description ?? 'Tengu Roastery — Blog',
    canonical: `/blog/${slug}`,
    image: post?.cover,
    type: 'article',
    noindex: !post && !loading,
  });

  useEffect(() => {
    if (!post) return;
    setStructuredData('article', {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: post.title,
      description: post.meta_description,
      image: `https://tenguroastery.cl${post.cover}`,
      datePublished: post.published_at,
      author: { '@type': 'Organization', name: post.author },
      publisher: {
        '@type': 'Organization',
        name: 'Tengu Roastery',
        logo: { '@type': 'ImageObject', url: 'https://tenguroastery.cl/logo.png' },
      },
      keywords: post.tags.join(', '),
    });
  }, [post]);

  if (loading) {
    return <div className="mx-auto max-w-2xl px-6 py-24 text-center text-tengu-dark/60">Cargando…</div>;
  }

  if (!post) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-24 text-center">
        <h1 className="font-display text-3xl">Artículo no encontrado</h1>
        <p className="mt-3 text-tengu-dark/60">
          El artículo que buscas no existe o fue movido.
        </p>
        <Link to="/blog" className="mt-6 inline-block text-tengu-ink hover:underline">
          ← Ver todos los artículos
        </Link>
      </div>
    );
  }

  return (
    <article className="mx-auto max-w-3xl px-6 py-12">
      <Breadcrumbs
        items={[
          { label: 'Inicio', href: '/' },
          { label: 'Blog', href: '/blog' },
          { label: post.title },
        ]}
      />

      <header className="mt-6">
        <p className="text-xs uppercase tracking-[0.4em] text-tengu-mustard">{post.tags.join(' · ')}</p>
        <h1 className="mt-3 font-display text-4xl leading-tight md:text-5xl">{post.title}</h1>
        <p className="mt-3 text-tengu-dark/60">
          {new Date(post.published_at).toLocaleDateString('es-CL', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
          })}{' '}
          · {post.reading_minutes} min de lectura · por {post.author}
        </p>
      </header>

      <figure className="mt-8 overflow-hidden rounded-2xl">
        <SafeImg
          src={post.cover || undefined}
          alt=""
          className="aspect-[16/9] w-full object-cover"
          loading="eager"
          width={1200}
          height={675}
        />
      </figure>

      <div className="prose prose-tengu mt-10 max-w-none">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            h2: ({ children }) => (
              <h2 className="mt-10 font-display text-2xl text-tengu-dark">{children}</h2>
            ),
            h3: ({ children }) => (
              <h3 className="mt-8 font-display text-xl text-tengu-dark">{children}</h3>
            ),
            p: ({ children }) => (
              <p className="mt-4 leading-relaxed text-tengu-dark/85">{children}</p>
            ),
            ul: ({ children }) => (
              <ul className="mt-4 space-y-2 pl-5 text-tengu-dark/85 [list-style-type:disc]">
                {children}
              </ul>
            ),
            ol: ({ children }) => (
              <ol className="mt-4 space-y-2 pl-5 text-tengu-dark/85 [list-style-type:decimal]">
                {children}
              </ol>
            ),
            a: ({ children, href }) => {
              const internal = href?.startsWith('/');
              if (internal) {
                return (
                  <Link to={href!} className="text-tengu-ink underline hover:text-tengu-mustard">
                    {children}
                  </Link>
                );
              }
              return (
                <a
                  href={href}
                  target="_blank"
                  rel="noreferrer"
                  className="text-tengu-ink underline hover:text-tengu-mustard"
                >
                  {children}
                </a>
              );
            },
            strong: ({ children }) => <strong className="font-semibold text-tengu-dark">{children}</strong>,
          }}
        >
          {post.body}
        </ReactMarkdown>
      </div>

      <footer className="mt-16 rounded-2xl bg-tengu-cream/40 p-8 text-center">
        <p className="font-display text-xl">¿Pruebas un café?</p>
        <p className="mt-2 text-sm text-tengu-dark/70">
          Descubre todos los orígenes en la tienda.
        </p>
        <Link
          to="/tienda"
          className="mt-4 inline-block rounded-md bg-tengu-mustard px-6 py-3 text-sm font-semibold uppercase tracking-wider text-tengu-dark transition hover:bg-tengu-coral hover:text-white"
        >
          Ver tienda
        </Link>
      </footer>
    </article>
  );
}
