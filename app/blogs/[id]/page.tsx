"use client";

import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowLeft, Heart, Share2, Loader2, ExternalLink } from "lucide-react";
import { toast } from "sonner";

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

export default function BlogPostPage() {
  const params = useParams();
  const id = typeof params?.id === "string" ? params.id : "";
  const [blog, setBlog] = useState<Blog | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      setError("Invalid blog ID");
      return;
    }
    async function fetchBlog() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`${API_BASE}/api/blogs/${id}`);
        const json = await res.json();
        if (!res.ok) {
          setError(json?.message || "Blog not found.");
          setBlog(null);
          return;
        }
        const data = json?.data ?? json;
        if (data && (data.id || data.title)) {
          setBlog(data);
        } else {
          setError("Blog not found.");
          setBlog(null);
        }
      } catch {
        setError("Failed to load blog.");
        setBlog(null);
      } finally {
        setLoading(false);
      }
    }
    fetchBlog();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white font-sans">
        <main className="mx-auto flex max-w-5xl flex-col items-center justify-center gap-6 px-4 py-20 sm:px-6 lg:px-8">
          <Loader2 className="h-10 w-10 animate-spin text-zinc-400" />
          <p className="text-sm text-zinc-500">Loading…</p>
        </main>
      </div>
    );
  }

  if (error || !blog) {
    return (
      <div className="min-h-screen bg-white font-sans">
        <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
          <Link
            href="/blogs"
            className="inline-flex items-center gap-2 text-sm font-medium text-zinc-600 hover:text-zinc-900"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to blogs
          </Link>
          <div className="mt-8 rounded-xl bg-red-50 px-4 py-6">
            <p className="text-sm text-red-700">{error || "Blog not found."}</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen min-w-0 bg-white font-sans overflow-x-hidden">
      <main className="mx-auto flex min-w-0 max-w-5xl flex-col gap-10 px-4 py-10 sm:px-6 lg:px-8">
        <Link
          href="/blogs"
          className="inline-flex w-fit items-center gap-2 text-sm font-medium text-zinc-600 hover:text-zinc-900"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to blogs
        </Link>

        {/* Hero: image + title/meta */}
        <section className="rounded-3xl px-4 py-8 sm:px-8 lg:px-10">
          <div className="grid items-center gap-8 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
            <div className="flex flex-col">
              <div className="relative w-full overflow-hidden rounded-3xl bg-black/5 aspect-video">
                {blog.imageUrl ? (
                  <Image
                    src={blog.imageUrl}
                    alt={blog.title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 1024px) 100vw, 60vw"
                    unoptimized
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-zinc-400 text-sm">
                    No image
                  </div>
                )}
              </div>
              {blog.artBy && (
                <p className="mt-2 text-[11px] text-zinc-500">
                  Art by{" "}
                  <span className="underline underline-offset-2">
                    {blog.artBy}
                  </span>
                </p>
              )}
            </div>

            <header>
              <h1 className="text-3xl font-semibold leading-tight text-zinc-900 sm:text-4xl">
                {blog.title}
              </h1>
              {blog.author && (
                <p className="mt-4 text-sm text-zinc-600">
                  by{" "}
                  <span className="font-medium text-zinc-900">{blog.author}</span>
                  {blog.extras?.readTime && (
                    <> · {blog.extras.readTime}</>
                  )}
                </p>
              )}
              {blog.createdAt && (
                <p className="mt-1 text-xs font-semibold tracking-[0.18em] text-zinc-500 uppercase">
                  {formatDate(blog.createdAt)}
                </p>
              )}

              <div className="mt-5 flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-3 py-1.5 text-xs font-medium text-zinc-700 hover:bg-zinc-50"
                  onClick={() => {
                    navigator.clipboard.writeText(window.location.href);
                    toast.success("Link copied");
                  }}
                >
                  <Share2 className="h-4 w-4" />
                  <span>Share</span>
                </button>
                <button
                  type="button"
                  className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-3 py-1.5 text-xs font-medium text-zinc-700 hover:bg-zinc-50"
                >
                  <Heart className="h-4 w-4" />
                  <span>Post</span>
                </button>
              </div>
            </header>
          </div>
        </section>

        {/* Article body: HTML description */}
        <article className="min-w-0 max-w-full space-y-6">
          {blog.description?.trim() ? (
            <div
              className="prose prose-zinc max-w-none text-sm leading-relaxed text-zinc-700 sm:text-[15px] prose-p:my-3 prose-headings:font-semibold prose-headings:text-zinc-900 prose-a:text-[#5b4de6] prose-a:no-underline hover:prose-a:underline prose-ul:my-3 prose-li:my-0.5"
              style={{ wordBreak: "normal", overflowWrap: "break-word", hyphens: "none" }}
              dangerouslySetInnerHTML={{ __html: blog.description }}
            />
          ) : (
            <p className="text-zinc-500">No content.</p>
          )}

          {/* Tags */}
          {blog.extras?.tags?.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-4">
              {blog.extras.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-zinc-100 px-3 py-1 text-xs font-medium text-zinc-600"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Links */}
          {blog.links && blog.links.length > 0 && (
            <div className="border-t border-zinc-200 pt-6">
              <h3 className="text-sm font-semibold text-zinc-900">Links</h3>
              <ul className="mt-3 space-y-2">
                {blog.links.map((link) => (
                  <li key={link.url + link.name}>
                    <a
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-sm text-[#5b4de6] hover:underline"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                      {link.name || link.url}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </article>
      </main>
    </div>
  );
}
