/* Blogs index page with card list + pagination similar to shop */
"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { BLOG_POSTS } from "../../lib/blogs-data";

const POSTS_PER_PAGE = 16;

export default function BlogsPage() {
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(BLOG_POSTS.length / POSTS_PER_PAGE)),
    []
  );

  const paginatedPosts = useMemo(() => {
    const start = (currentPage - 1) * POSTS_PER_PAGE;
    return BLOG_POSTS.slice(start, start + POSTS_PER_PAGE);
  }, [currentPage]);

  return (
    <div className="min-h-screen bg-white font-sans">
      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <h1 className="mb-8 text-2xl font-semibold tracking-tight text-zinc-900">
          Latest from the blog
        </h1>

        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {paginatedPosts.map((post) => (
            <Link key={post.id} href={`/blogs/${post.id}`} className="block h-full">
              <article className="flex h-full flex-col border border-[#e8dcd2] bg-white pb-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
                <div className="px-5 pt-5">
                  <p className="mb-1 text-xs font-semibold tracking-[0.15em] text-zinc-500">
                    {post.dateLabel}
                  </p>
                  <div className="mb-2 flex items-start gap-2">
                    <h2 className="text-base font-semibold leading-snug text-zinc-900">
                      {post.title}
                    </h2>
                  </div>
                </div>
                <div className="relative mb-4 mt-2 h-48 w-full overflow-hidden">
                  <Image
                    src={post.image}
                    alt={post.title}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    className="object-cover object-center"
                  />
                </div>
                <p className="mt-auto px-5 text-sm leading-relaxed text-zinc-600">
                  {post.excerpt}
                </p>
              </article>
            </Link>
          ))}
        </div>

        {/* Pagination similar to shop page */}
        <div className="mt-10 flex w-full flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage <= 1}
              className="rounded-lg border border-zinc-300 bg-zinc-50 px-3 py-1.5 text-sm font-medium text-zinc-700 transition hover:bg-zinc-100 disabled:opacity-40 disabled:hover:bg-zinc-50"
            >
              Previous
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
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
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage >= totalPages}
              className="rounded-lg border border-zinc-300 bg-zinc-50 px-3 py-1.5 text-sm font-medium text-zinc-700 transition hover:bg-zinc-100 disabled:opacity-40 disabled:hover:bg-zinc-50"
            >
              Next
            </button>
          </div>
          <p className="text-xs text-zinc-500">
            Showing {(currentPage - 1) * POSTS_PER_PAGE + 1}-
            {Math.min(currentPage * POSTS_PER_PAGE, BLOG_POSTS.length)} of{" "}
            {BLOG_POSTS.length} posts
          </p>
        </div>
      </main>
    </div>
  );
}

