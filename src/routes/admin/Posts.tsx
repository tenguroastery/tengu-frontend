import { useEffect, useState } from 'react';

import SafeImg from '../../components/SafeImg';
import { adminApi } from '../../lib/admin-api';
import PostForm from './PostForm';
import type { Post } from '../../types';

export default function AdminPosts() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<null | 'new' | Post>(null);

  const reload = () => {
    setLoading(true);
    adminApi
      .listPostsAdmin()
      .then(setPosts)
      .catch((e) => setError(String(e)))
      .finally(() => setLoading(false));
  };

  useEffect(reload, []);

  const handleDelete = async (post: Post) => {
    if (!confirm(`¿Eliminar el post "${post.title}"? Esta acción no se puede deshacer.`)) return;
    try {
      await adminApi.deletePost(post.slug);
      setPosts((prev) => prev.filter((p) => p.slug !== post.slug));
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
  };

  return (
    <div className="p-6 md:p-10">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl">Posts del blog</h1>
          <p className="mt-1 text-sm text-tengu-dark/60">{posts.length} artículos</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={reload} className="text-xs uppercase tracking-wider text-tengu-ink hover:underline">
            ↻ Recargar
          </button>
          <button
            onClick={() => setEditing('new')}
            className="rounded-md bg-tengu-mustard px-4 py-2 text-sm font-semibold uppercase tracking-wider text-tengu-dark transition hover:bg-tengu-coral hover:text-white"
          >
            + Nuevo post
          </button>
        </div>
      </header>

      {error && (
        <div className="mt-4 rounded-md border border-tengu-coral/30 bg-tengu-coral/10 p-3 text-sm text-tengu-coral">
          {error}
        </div>
      )}

      {editing && (
        <PostForm
          post={editing === 'new' ? null : editing}
          onClose={() => setEditing(null)}
          onSaved={() => { setEditing(null); reload(); }}
        />
      )}

      {loading ? (
        <p className="mt-8 text-tengu-dark/60">Cargando…</p>
      ) : posts.length === 0 ? (
        <p className="mt-8 text-tengu-dark/60">Sin posts aún. Crea el primero.</p>
      ) : (
        <ul className="mt-6 space-y-3">
          {posts.map((post) => (
            <li key={post.slug} className="flex items-start gap-4 rounded-xl bg-white p-4 shadow-sm">
              <SafeImg
                src={post.cover || undefined}
                alt=""
                className="h-20 w-32 flex-none rounded-md object-cover"
              />
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="font-display text-lg leading-tight">{post.title}</h2>
                  {!post.is_published && (
                    <span className="rounded-full bg-tengu-dark/10 px-2 py-0.5 text-[10px] uppercase tracking-wider text-tengu-dark/60">
                      Borrador
                    </span>
                  )}
                </div>
                <p className="mt-1 line-clamp-2 text-sm text-tengu-dark/70">{post.excerpt}</p>
                <p className="mt-2 text-xs text-tengu-dark/50">
                  {post.published_at} · {post.reading_minutes} min · {post.author}
                  {post.tags.length > 0 && ` · ${post.tags.join(', ')}`}
                </p>
              </div>
              <div className="flex flex-col gap-2">
                <button
                  onClick={() => setEditing(post)}
                  className="rounded-md border border-tengu-dark/15 px-3 py-1 text-xs uppercase tracking-wider hover:border-tengu-ink"
                >
                  Editar
                </button>
                <button
                  onClick={() => handleDelete(post)}
                  className="rounded-md border border-tengu-coral/40 px-3 py-1 text-xs uppercase tracking-wider text-tengu-coral hover:bg-tengu-coral/10"
                >
                  Borrar
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
