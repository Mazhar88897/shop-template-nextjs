"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ImageIcon, Loader2, Link as LinkIcon, X } from "lucide-react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import RichTextEditor from "@/components/RichTextEditor";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE ??
  "https://shop-template-backend-nine.vercel.app";

type BlogLink = { name: string; url: string };

function getAuthHeaders(): HeadersInit {
  if (typeof window === "undefined") return {};
  const token = sessionStorage.getItem("adminToken");
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

function hasDescriptionContent(html: string) {
  const plain = html.replace(/<[^>]*>/g, "").trim();
  return plain.length > 0;
}

export default function AdminBlogCreatePage() {
  const router = useRouter();
  const [formLoading, setFormLoading] = useState(false);
  const [form, setForm] = useState({
    title: "",
    author: "",
    imageUrl: "",
    artBy: "",
    description: "",
    tagsStr: "",
    readTime: "",
    links: [{ name: "", url: "" }] as BlogLink[],
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);

  function setImage(file: File | null) {
    if (imagePreviewUrl) URL.revokeObjectURL(imagePreviewUrl);
    setImagePreviewUrl(null);
    setImageFile(file);
    if (file) setImagePreviewUrl(URL.createObjectURL(file));
  }

  function parseTags(s: string): string[] {
    return s
      .split(/[\s,]+/)
      .map((t) => t.trim())
      .filter(Boolean);
  }

  function addLink() {
    setForm((f) => ({ ...f, links: [...f.links, { name: "", url: "" }] }));
  }

  function updateLink(i: number, field: "name" | "url", value: string) {
    setForm((f) => ({
      ...f,
      links: f.links.map((l, j) => (j === i ? { ...l, [field]: value } : l)),
    }));
  }

  function removeLink(i: number) {
    setForm((f) => ({
      ...f,
      links: f.links.filter((_, j) => j !== i),
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title.trim()) {
      toast.error("Title is required.");
      return;
    }
    if (!hasDescriptionContent(form.description)) {
      toast.error("Description is required.");
      return;
    }
    setFormLoading(true);
    try {
      let imageUrl = form.imageUrl.trim() || undefined;
      if (imageFile) {
        const formData = new FormData();
        formData.append("file", imageFile);
        const cloudRes = await fetch("/api/cloudinary/create", {
          method: "POST",
          body: formData,
        });
        const cloudJson = await cloudRes.json();
        if (!cloudRes.ok) {
          toast.error(cloudJson?.error || "Failed to upload image.");
          setFormLoading(false);
          return;
        }
        if (cloudJson?.url) imageUrl = cloudJson.url;
      }
      const payload = {
        title: form.title.trim(),
        author: form.author.trim() || undefined,
        imageUrl,
        artBy: form.artBy.trim() || undefined,
        description: form.description.trim(),
        extras: {
          tags: parseTags(form.tagsStr),
          readTime: form.readTime.trim() || undefined,
        },
        links: form.links.filter((l) => l.name.trim() || l.url.trim()),
      };
      const res = await fetch(`${API_BASE}/api/blogs`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok) {
        toast.error(json?.message || "Failed to create blog.");
        setFormLoading(false);
        return;
      }
      toast.success("Blog created.");
      router.push("/admin/blogs");
    } catch {
      toast.error("Failed to create blog.");
    } finally {
      setFormLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#f5f0e8] font-sans">
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link
              href="/admin/blogs"
              className="rounded-lg p-2 text-[#374431] hover:bg-[#e8e2d8] transition"
              aria-label="Back to blogs"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div>
              <h1 className="text-2xl font-semibold text-[#374431]">
                New blog post
              </h1>
              <p className="mt-0.5 text-sm text-zinc-600">
                Create a new blog entry
              </p>
            </div>
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-2xl border border-[#e8dcd2] bg-white shadow-sm p-6 sm:p-8 space-y-6"
        >
          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-1.5">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              placeholder="Blog title"
              className="w-full rounded-lg border border-[#c4b8a8] bg-[#faf8f5] px-4 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-[#1e4d3c]/50 focus:border-[#1e4d3c]"
              disabled={formLoading}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1.5">
                Author
              </label>
              <input
                type="text"
                value={form.author}
                onChange={(e) =>
                  setForm((f) => ({ ...f, author: e.target.value }))
                }
                placeholder="Author name"
                className="w-full rounded-lg border border-[#c4b8a8] bg-[#faf8f5] px-4 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-[#1e4d3c]/50 focus:border-[#1e4d3c]"
                disabled={formLoading}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1.5">
                Art by
              </label>
              <input
                type="text"
                value={form.artBy}
                onChange={(e) =>
                  setForm((f) => ({ ...f, artBy: e.target.value }))
                }
                placeholder="Artist name"
                className="w-full rounded-lg border border-[#c4b8a8] bg-[#faf8f5] px-4 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-[#1e4d3c]/50 focus:border-[#1e4d3c]"
                disabled={formLoading}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-1.5">
              Description <span className="text-red-500">*</span>
            </label>
            <RichTextEditor
              value={form.description}
              onChange={(v) => setForm((f) => ({ ...f, description: v }))}
              placeholder="Write your blog description…"
              className="[&_.ql-editor]:min-h-[220px]"
              theme="light"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1.5">
                Tags (comma-separated)
              </label>
              <input
                type="text"
                value={form.tagsStr}
                onChange={(e) =>
                  setForm((f) => ({ ...f, tagsStr: e.target.value }))
                }
                placeholder="nextjs, react"
                className="w-full rounded-lg border border-[#c4b8a8] bg-[#faf8f5] px-4 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-[#1e4d3c]/50 focus:border-[#1e4d3c]"
                disabled={formLoading}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1.5">
                Read time
              </label>
              <input
                type="text"
                value={form.readTime}
                onChange={(e) =>
                  setForm((f) => ({ ...f, readTime: e.target.value }))
                }
                placeholder="5 min"
                className="w-full rounded-lg border border-[#c4b8a8] bg-[#faf8f5] px-4 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-[#1e4d3c]/50 focus:border-[#1e4d3c]"
                disabled={formLoading}
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-sm font-medium text-zinc-700">
                Links
              </label>
              <button
                type="button"
                onClick={addLink}
                className="text-sm font-medium text-[#1e4d3c] hover:text-[#163d30]"
                disabled={formLoading}
              >
                + Add link
              </button>
            </div>
            <div className="space-y-2">
              {form.links.map((link, i) => (
                <div key={i} className="flex gap-2 items-center">
                  <input
                    type="text"
                    value={link.name}
                    onChange={(e) =>
                      updateLink(i, "name", e.target.value)
                    }
                    placeholder="Name"
                    className="flex-1 rounded-lg border border-[#c4b8a8] bg-[#faf8f5] px-4 py-2 text-sm text-zinc-900 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-[#1e4d3c]/50"
                    disabled={formLoading}
                  />
                  <input
                    type="url"
                    value={link.url}
                    onChange={(e) =>
                      updateLink(i, "url", e.target.value)
                    }
                    placeholder="URL"
                    className="flex-1 rounded-lg border border-[#c4b8a8] bg-[#faf8f5] px-4 py-2 text-sm text-zinc-900 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-[#1e4d3c]/50"
                    disabled={formLoading}
                  />
                  <button
                    type="button"
                    onClick={() => removeLink(i)}
                    className="rounded-lg p-2 text-zinc-500 hover:bg-zinc-100 hover:text-zinc-700 transition"
                    disabled={formLoading}
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-1.5">
              Cover image
            </label>
            <div
              onDrop={(e) => {
                e.preventDefault();
                const file = e.dataTransfer.files[0];
                if (file?.type.startsWith("image/")) setImage(file);
              }}
              onDragOver={(e) => {
                e.preventDefault();
                e.dataTransfer.dropEffect = "copy";
              }}
              className="relative flex min-h-[160px] flex-col items-center justify-center rounded-xl border-2 border-dashed border-[#c4b8a8] bg-[#faf8f5] transition hover:border-[#1e4d3c]/50"
            >
              <input
                type="file"
                accept="image/*"
                className="absolute inset-0 z-10 cursor-pointer opacity-0"
                disabled={formLoading}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) setImage(file);
                }}
              />
              {imagePreviewUrl ? (
                <div className="relative h-[200px] w-full p-2">
                  <Image
                    src={imagePreviewUrl}
                    alt="Preview"
                    fill
                    className="object-contain rounded-lg"
                    unoptimized
                  />
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setImage(null);
                    }}
                    className="absolute right-4 top-4 z-20 rounded-full bg-black/60 p-2 text-white hover:bg-black/80 transition"
                    disabled={formLoading}
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : form.imageUrl ? (
                <div className="relative h-[200px] w-full p-2">
                  <Image
                    src={form.imageUrl}
                    alt="Current"
                    fill
                    className="object-contain rounded-lg"
                    unoptimized
                  />
                  <span className="absolute bottom-3 left-3 rounded bg-black/60 px-2 py-1 text-xs text-white">
                    Current · drop to replace
                  </span>
                </div>
              ) : (
                <div className="pointer-events-none flex flex-col items-center gap-2 py-8 text-zinc-500">
                  <ImageIcon className="h-12 w-12" />
                  <span className="text-sm">Drop image here or click to upload</span>
                </div>
              )}
            </div>
            <input
              type="url"
              value={form.imageUrl}
              onChange={(e) =>
                setForm((f) => ({ ...f, imageUrl: e.target.value }))
              }
              placeholder="Or paste image URL"
              className="mt-2 w-full rounded-lg border border-[#c4b8a8] bg-[#faf8f5] px-4 py-2 text-sm text-zinc-900 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-[#1e4d3c]/50 focus:border-[#1e4d3c]"
              disabled={formLoading}
            />
          </div>

          <div className="flex flex-col-reverse sm:flex-row gap-3 pt-4 border-t border-[#e8dcd2]">
            <Link
              href="/admin/blogs"
              className="flex-1 rounded-lg border border-[#c4b8a8] bg-[#f0ebe3] px-4 py-2.5 text-center text-sm font-medium text-zinc-700 hover:bg-[#e8e2d8] transition"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={formLoading}
              className="flex-1 rounded-lg bg-[#1e4d3c] px-4 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-[#163d30] transition disabled:opacity-60"
            >
              {formLoading ? (
                <span className="inline-flex items-center justify-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Creating…
                </span>
              ) : (
                "Create blog"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
