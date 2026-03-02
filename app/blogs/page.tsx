/* Blogs index page – fetches from API and shows card list with pagination */
"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState, useEffect } from "react";
import { Loader2 } from "lucide-react";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE ??
  "https://shop-template-backend-nine.vercel.app";

const POSTS_PER_PAGE = 16;

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

function stripHtmlToText(html: string, maxLength = 120): string {
  if (!html?.trim()) return "";
  const text = html
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trim() + "…";
}

function formatDate(iso?: string): string {
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

export default function BlogsPage() {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

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

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(blogs.length / POSTS_PER_PAGE)),
    [blogs.length]
  );

  const paginatedPosts = useMemo(() => {
    const start = (currentPage - 1) * POSTS_PER_PAGE;
    return blogs.slice(start, start + POSTS_PER_PAGE);
  }, [blogs, currentPage]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white font-sans">
        <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <h1 className="mb-8 text-2xl font-semibold tracking-tight text-zinc-900">
            Latest from the blog
          </h1>
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
          <h1 className="mb-8 text-2xl font-semibold tracking-tight text-zinc-900">
            Latest from the blog
          </h1>
          <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </p>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white font-sans">
      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <h1 className="mb-8 text-2xl font-semibold tracking-tight text-zinc-900">
          Latest from the blog
        </h1>

        {blogs.length === 0 ? (
          <div className="rounded-xl border border-[#e8dcd2] bg-zinc-50/50 p-12 text-center">
            <p className="text-sm text-zinc-600">No blog posts yet.</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
              {paginatedPosts.map((post) => (
                <Link
                  key={post.id}
                  href={`/blogs/${post.id}`}
                  className="block h-full"
                >
                  <article className="flex h-full flex-col border-b border-[#e8dcd2] bg-white pb-6  transition hover:-translate-y-1 hover:shadow-md">
                    <div className="px-5 pt-5">
                      <p className="mb-1 text-xs font-semibold tracking-[0.15em] text-zinc-500">
                        {formatDate(post.createdAt) ||
                          (post.extras?.readTime
                            ? post.extras.readTime
                            : "")}
                      </p>
                      <div className="mb-2 flex items-start gap-2">
                        <h2 className="text-base font-semibold leading-snug text-zinc-900">
                          {post.title}
                        </h2>
                      </div>
                      {post.author && (
                        <p className="text-xs text-zinc-500">
                          By {post.author}
                          {post.extras?.readTime && ` · ${post.extras.readTime}`}
                        </p>
                      )}
                    </div>
                    <div className="relative mb-4 mt-2 h-48 w-full overflow-hidden">
                      {post.imageUrl ? (
                        <Image
                          src={post.imageUrl}
                          alt={post.title}
                          fill
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                          className="object-cover object-center"
                          unoptimized
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center bg-zinc-100 text-zinc-400">
                          <span className="text-sm">No image</span>
                        </div>
                      )}
                    </div>
                    <p className="mt-auto px-5 text-sm leading-relaxed text-zinc-600 line-clamp-3">
                      {stripHtmlToText(post.description)}
                    </p>
                  </article>
                </Link>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-10 flex w-full flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() =>
                      setCurrentPage((p) => Math.max(1, p - 1))
                    }
                    disabled={currentPage <= 1}
                    className="rounded-lg border border-zinc-300 bg-zinc-50 px-3 py-1.5 text-sm font-medium text-zinc-700 transition hover:bg-zinc-100 disabled:opacity-40 disabled:hover:bg-zinc-50"
                  >
                    Previous
                  </button>
                  {Array.from(
                    { length: totalPages },
                    (_, i) => i + 1
                  ).map((page) => (
                    <button
                      key={page}
                      type="button"
                      onClick={() => setCurrentPage(page)}
                      className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${
                        currentPage === page
                          ? "bg-zinc-900 text-white shadow-sm"
                          : "border border-zinc-300 bg-zinc-50 text-zinc-700 hover:bg-zinc-100"
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() =>
                      setCurrentPage((p) => Math.min(totalPages, p + 1))
                    }
                    disabled={currentPage >= totalPages}
                    className="rounded-lg border border-zinc-300 bg-zinc-50 px-3 py-1.5 text-sm font-medium text-zinc-700 transition hover:bg-zinc-100 disabled:opacity-40 disabled:hover:bg-zinc-50"
                  >
                    Next
                  </button>
                </div>
                <p className="text-xs text-zinc-500">
                  Showing {(currentPage - 1) * POSTS_PER_PAGE + 1}–
                  {Math.min(
                    currentPage * POSTS_PER_PAGE,
                    blogs.length
                  )}{" "}
                  of {blogs.length} posts
                </p>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
