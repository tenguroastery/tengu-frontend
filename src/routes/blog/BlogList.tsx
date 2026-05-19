import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import Breadcrumbs from '../../components/Breadcrumbs';
import SafeImg from '../../components/SafeImg';
import { api } from '../../lib/api';
import { useSeo } from '../../lib/seo';
import { useRevalidationTick } from '../../lib/useRevalidateOnFocus';
import type { Post } from '../../types';

export default function BlogList() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const tick = useRevalidationTick();

  useSeo({
    title: 'Blog · guías de café de especialidad',
    description:
      'Guías honestas sobre café de especialidad: cómo elegir, métodos de preparación, trazabilidad y procesos. Por Tengu Roastery.',
    canonical: '/blog',
  });

  useEffect(() => {
    api.listPosts()
      .then(setPosts)
      .catch(() => undefined)
      .finally(() => setLoading(false));
  }, [tick]);

  return (
    <section className="mx-auto max-w-5xl px-6 py-12">
      <Breadcrumbs items={[{ label: 'Inicio', href: '/' }, { label: 'Blog' }]} />
      <header className="mt-6">
        <p className="text-xs uppercase tracking-[0.4em] text-tengu-mustard">Blog</p>
        <h1 className="mt-3 font-display text-4xl">Guías honestas sobre café</h1>
        <p className="mt-3 max-w-2xl text-tengu-dark/70">
          Sin clichés ni copy-paste de internet. Lo que aprendemos tostando, catando y conversando
          con productores y baristas.
        </p>
      </header>

      {loading ? (
        <p className="mt-12 text-tengu-dark/60">Cargando…</p>
      ) : posts.length === 0 ? (
        <p className="mt-12 text-tengu-dark/60">Pronto los primeros artículos.</p>
      ) : (
        <ul className="mt-12 grid gap-8 md:grid-cols-2">
          {posts.map((post) => (
            <li key={post.slug}>
              <Link
                to={`/blog/${post.slug}`}
                className="group block overflow-hidden rounded-2xl bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
              >
                <div className="aspect-[16/9] overflow-hidden bg-tengu-cream">
                  <SafeImg
                    src={post.cover || undefined}
                    alt=""
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                    loading="lazy"
                    width={800}
                    height={450}
                  />
                </div>
                <div className="p-6">
                  <p className="text-xs uppercase tracking-wider text-tengu-mustard">
                    {post.tags.join(' · ')}
                  </p>
                  <h2 className="mt-2 font-display text-xl leading-tight">{post.title}</h2>
                  <p className="mt-2 text-sm text-tengu-dark/70">{post.excerpt}</p>
                  <p className="mt-3 text-xs text-tengu-dark/50">
                    {new Date(post.published_at).toLocaleDateString('es-CL', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}{' '}
                    · {post.reading_minutes} min de lectura
                  </p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
