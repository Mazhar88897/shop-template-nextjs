/* Blogs index – vertical layout: featured post, scroll list, categories sidebar */
"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState, useEffect } from "react";
import { Loader2 } from "lucide-react";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE ??
  "https://shop-template-backend-nine.vercel.app";

type BlogLink = { id?: string; name: string; url: string };
type BlogExtras = { tags: string[]; readTime: string };

type Blog = {
  id: string;
  title: string;
  author: string;
  imageUrl: string;
  artBy?: string;
  description: string;
  extras: BlogExtras;
  links?: BlogLink[];
  createdAt?: string;
  updatedAt?: string;
};

function decodeHtmlEntities(str: string): string {
  return str
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&apos;/g, "'")
    .replace(/&#39;/g, "'")
    .replace(/&#x27;/g, "'");
}

function stripHtmlToText(html: string, maxLength = 120): string {
  if (!html?.trim()) return "";
  const text = html
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  const decoded = decodeHtmlEntities(text);
  if (decoded.length <= maxLength) return decoded;
  return decoded.slice(0, maxLength).trim() + "…";
}

function formatDateShort(iso?: string): string {
  if (!iso) return "";
  try {
    const d = new Date(iso);
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return "";
  }
}

const DEFAULT_CATEGORIES = [
  "Interviews",
  "Inspiration",
  "Process",
  "Updates",
  "Community",
];

export default function BlogsPage() {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  useEffect(() => {
    async function fetchBlogs() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`${API_BASE}/api/blogs`);
        const json = await res.json();
        if (!res.ok) {
          setError(json?.message || "Failed to load blogs.");
          setBlogs([]);
          return;
        }
        const list = json?.data ?? (Array.isArray(json) ? json : []);
        setBlogs(Array.isArray(list) ? list : []);
      } catch {
        setError("Failed to load blogs.");
        setBlogs([]);
      } finally {
        setLoading(false);
      }
    }
    fetchBlogs();
  }, []);

  const sortedBlogs = useMemo(() => {
    const list = [...blogs].sort((a, b) => {
      const ta = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const tb = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return tb - ta;
    });
    return list;
  }, [blogs]);

  const categories = useMemo(() => {
    const fromTags = new Set<string>();
    sortedBlogs.forEach((b) => {
      (b.extras?.tags || []).forEach((t) => fromTags.add(t.trim()));
    });
    const combined = new Set([...DEFAULT_CATEGORIES, ...fromTags]);
    return Array.from(combined).filter(Boolean).sort((a, b) => a.localeCompare(b));
  }, [sortedBlogs]);

  const filteredBlogs = useMemo(() => {
    if (!selectedCategory) return sortedBlogs;
    return sortedBlogs.filter((b) =>
      (b.extras?.tags || []).some(
        (t) => t.trim().toLowerCase() === selectedCategory.toLowerCase()
      )
    );
  }, [sortedBlogs, selectedCategory]);

  const featuredPost = filteredBlogs[0] ?? null;
  const olderPosts = filteredBlogs.slice(1);

  if (loading) {
    return (
      <div className="min-h-screen bg-white font-sans">
        <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-zinc-500" />
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white font-sans">
        <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </p>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white font-sans">
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-10 lg:flex-row lg:gap-12">
          {/* Main column: vertical feed */}
          <div className="min-w-0 flex-1">
            {blogs.length === 0 ? (
              <div className="rounded-xl border border-[#e8dcd2] bg-zinc-50/50 p-12 text-center">
                <p className="text-sm text-zinc-600">No blog posts yet.</p>
              </div>
            ) : (
              <div className="flex flex-col gap-10">
                {/* Featured: most recent post – prominent */}
                {featuredPost && (
                  <article className="border-b border-[#e8dcd2] pb-10">
                    <Link href={`/blogs/${featuredPost.id}`} className="block">
                      <p className="mb-2 text-xs font-semibold uppercase tracking-[0.15em] text-zinc-500">
                        {formatDateShort(featuredPost.createdAt) ||
                          (featuredPost.extras?.readTime
                            ? featuredPost.extras.readTime
                            : "")}
                      </p>
                      <h2 className="mb-4 text-2xl font-semibold leading-tight text-zinc-900 sm:text-3xl">
                        {featuredPost.title}
                      </h2>
                      <div className="relative aspect-[16/8] w-full overflow-hidden rounded-xl ">
                        {featuredPost.imageUrl ? (
                          <Image
                            src={featuredPost.imageUrl}
                            alt={featuredPost.title}
                            fill
                            sizes="(max-width: 824px) 30vw, 40vw"
                            className="object-contain object-center"
                            unoptimized
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center text-zinc-400 text-sm">
                            No image
                          </div>
                        )}
                      </div>
                      <p className="mt-4 max-w-2xl text-sm leading-relaxed text-zinc-600 sm:text-base">
                        {stripHtmlToText(featuredPost.description, 220)}
                      </p>
                      {featuredPost.author && (
                        <p className="mt-2 text-xs text-zinc-500">
                          By {featuredPost.author}
                        </p>
                      )}
                    </Link>
                  </article>
                )}

                {/* Older posts: scroll down – compact list */}
                <div className="flex flex-col gap-8">
                  {olderPosts.map((post) => (
                    <Link
                      key={post.id}
                      href={`/blogs/${post.id}`}
                      className="group flex gap-4 border-b border-[#e8dcd2] pb-8 last:border-0"
                    >
                      <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-lg bg-zinc-100 sm:h-28 sm:w-28">
                        {post.imageUrl ? (
                          <Image
                            src={post.imageUrl}
                            alt={post.title}
                            fill
                            sizes="112px"
                            className="object-cover object-center transition group-hover:scale-105"
                            unoptimized
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center text-zinc-400 text-xs">
                            No image
                          </div>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="mb-1 text-xs font-semibold uppercase tracking-[0.12em] text-zinc-500">
                          {formatDateShort(post.createdAt) ||
                            (post.extras?.readTime ? post.extras.readTime : "")}
                        </p>
                        <h3 className="mb-1.5 font-semibold leading-snug text-zinc-900 group-hover:text-zinc-700">
                          {post.title}
                        </h3>
                        <p className="line-clamp-2 text-sm text-zinc-600">
                          {stripHtmlToText(post.description, 100)}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right: Categories panel */}
          <aside className="w-full hidden lg:block shrink-0 lg:w-56 xl:w-64">
            <div className="sticky top-24 rounded-xl border border-[#e8dcd2] bg-zinc-50/50 p-5">
              <h3 className="mb-3 text-xs font-semibold uppercase tracking-[0.15em] text-zinc-500">
                All Categories
              </h3>
              <nav className="flex flex-col gap-1">
                <button
                  type="button"
                  onClick={() => setSelectedCategory(null)}
                  className={`text-left text-sm font-medium transition hover:text-zinc-900 ${
                    selectedCategory === null
                      ? "text-zinc-900"
                      : "text-zinc-600"
                  }`}
                >
                  All
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() =>
                      setSelectedCategory((c) => (c === cat ? null : cat))
                    }
                    className={`text-left text-sm font-medium transition hover:text-zinc-900 ${
                      selectedCategory === cat ? "text-zinc-900" : "text-zinc-600"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </nav>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}
