"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Plus,
  Pencil,
  Trash2,
  X,
  ImageIcon,
  Loader2,
  Link as LinkIcon,
} from "lucide-react";
import toast from "react-hot-toast";
import RichTextEditor from "@/components/RichTextEditor";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE ??
  "https://shop-template-backend-nine.vercel.app";

type BlogLink = { name: string; url: string };
type BlogExtras = { tags: string[]; readTime: string };

type Blog = {
  id: string;
  title: string;
  author: string;
  imageUrl: string;
  artBy: string;
  description: string;
  extras: BlogExtras;
  links: BlogLink[];
  createdAt?: string;
  updatedAt?: string;
};

function getAuthHeaders(): HeadersInit {
  if (typeof window === "undefined") return {};
  const token = sessionStorage.getItem("adminToken");
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

const defaultExtras: BlogExtras = { tags: [], readTime: "" };
const defaultLinks: BlogLink[] = [];

function hasDescriptionContent(html: string) {
  const plain = html.replace(/<[^>]*>/g, "").trim();
  return plain.length > 0;
}

function stripHtml(html: string) {
  return (html || "").replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim() || "No description";
}

export default function AdminBlogsPage() {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [blogToEdit, setBlogToEdit] = useState<Blog | null>(null);
  const [blogToDelete, setBlogToDelete] = useState<Blog | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const [form, setForm] = useState({
    title: "",
    author: "",
    imageUrl: "",
    artBy: "",
    description: "",
    tagsStr: "",
    readTime: "",
    links: defaultLinks,
  });

  const [editImageFile, setEditImageFile] = useState<File | null>(null);
  const [editImagePreviewUrl, setEditImagePreviewUrl] = useState<string | null>(null);

  function resetForm() {
    setForm({
      title: "",
      author: "",
      imageUrl: "",
      artBy: "",
      description: "",
      tagsStr: "",
      readTime: "",
      links: defaultLinks,
    });
    setBlogToEdit(null);
    if (editImagePreviewUrl) URL.revokeObjectURL(editImagePreviewUrl);
    setEditImagePreviewUrl(null);
    setEditImageFile(null);
  }

  function setEditImage(file: File | null) {
    if (editImagePreviewUrl) URL.revokeObjectURL(editImagePreviewUrl);
    setEditImagePreviewUrl(null);
    setEditImageFile(file);
    if (file) setEditImagePreviewUrl(URL.createObjectURL(file));
  }

  function parseTags(s: string): string[] {
    return s
      .split(/[\s,]+/)
      .map((t) => t.trim())
      .filter(Boolean);
  }

  function buildPayload() {
    return {
      title: form.title.trim(),
      author: form.author.trim(),
      imageUrl: form.imageUrl.trim() || undefined,
      artBy: form.artBy.trim() || undefined,
      description: form.description.trim(),
      extras: {
        tags: parseTags(form.tagsStr),
        readTime: form.readTime.trim() || undefined,
      },
      links: form.links.filter((l) => l.name.trim() || l.url.trim()),
    };
  }

  async function fetchBlogs() {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/blogs`, {
        headers: getAuthHeaders(),
      });
      const json = await res.json();
      if (res.ok && Array.isArray(json?.data)) {
        setBlogs(json.data);
      } else if (res.ok && Array.isArray(json)) {
        setBlogs(json);
      } else {
        toast.error(json?.message || "Failed to load blogs.");
      }
    } catch {
      toast.error("Failed to load blogs.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchBlogs();
  }, []);

  function openEdit(blog: Blog) {
    setBlogToEdit(blog);
    setForm({
      title: blog.title,
      author: blog.author || "",
      imageUrl: blog.imageUrl || "",
      artBy: blog.artBy || "",
      description: blog.description || "",
      tagsStr: (blog.extras?.tags || []).join(", "),
      readTime: blog.extras?.readTime || "",
      links: blog.links?.length ? [...blog.links] : [{ name: "", url: "" }],
    });
    if (editImagePreviewUrl) URL.revokeObjectURL(editImagePreviewUrl);
    setEditImagePreviewUrl(null);
    setEditImageFile(null);
    setEditOpen(true);
  }

  async function handleEdit(e: React.FormEvent) {
    e.preventDefault();
    if (!blogToEdit) return;
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
      let imageUrl: string | undefined = form.imageUrl.trim() || undefined;
      if (editImageFile) {
        const formData = new FormData();
        formData.append("file", editImageFile);
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
      const payload = { ...buildPayload(), imageUrl };
      const res = await fetch(`${API_BASE}/api/blogs/${blogToEdit.id}`, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok) {
        toast.error(json?.message || "Failed to update blog.");
        setFormLoading(false);
        return;
      }
      toast.success("Blog updated.");
      setEditOpen(false);
      resetForm();
      fetchBlogs();
    } catch {
      toast.error("Failed to update blog.");
    } finally {
      setFormLoading(false);
    }
  }

  function openDelete(blog: Blog) {
    setBlogToDelete(blog);
    setDeleteOpen(true);
  }

  async function handleDelete() {
    if (!blogToDelete) return;
    setDeleteLoading(true);
    try {
      const res = await fetch(
        `${API_BASE}/api/blogs/${blogToDelete.id}`,
        { method: "DELETE", headers: getAuthHeaders() }
      );
      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        toast.error(json?.message || "Failed to delete blog.");
        setDeleteLoading(false);
        return;
      }
      toast.success("Blog deleted.");
      setDeleteOpen(false);
      setBlogToDelete(null);
      fetchBlogs();
    } catch {
      toast.error("Failed to delete blog.");
    } finally {
      setDeleteLoading(false);
    }
  }

  function addLink() {
    setForm((f) => ({ ...f, links: [...f.links, { name: "", url: "" }] }));
  }

  function updateLink(i: number, field: "name" | "url", value: string) {
    setForm((f) => ({
      ...f,
      links: f.links.map((l, j) =>
        j === i ? { ...l, [field]: value } : l
      ),
    }));
  }

  function removeLink(i: number) {
    setForm((f) => ({
      ...f,
      links: f.links.filter((_, j) => j !== i),
    }));
  }

  const formFields = () => (
    <>
      <div>
        <label className="block text-sm font-medium text-zinc-300 mb-1.5">Title</label>
        <input
          type="text"
          value={form.title}
          onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
          placeholder="Blog title"
          className="w-full rounded-lg border border-zinc-600 bg-zinc-800 px-4 py-2.5 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-500"
          disabled={formLoading}
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-1.5">Author</label>
          <input
            type="text"
            value={form.author}
            onChange={(e) => setForm((f) => ({ ...f, author: e.target.value }))}
            placeholder="Author name"
            className="w-full rounded-lg border border-zinc-600 bg-zinc-800 px-4 py-2.5 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-500"
            disabled={formLoading}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-1.5">Art by</label>
          <input
            type="text"
            value={form.artBy}
            onChange={(e) => setForm((f) => ({ ...f, artBy: e.target.value }))}
            placeholder="Artist name"
            className="w-full rounded-lg border border-zinc-600 bg-zinc-800 px-4 py-2.5 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-500"
            disabled={formLoading}
          />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-zinc-300 mb-1.5">Description</label>
        <RichTextEditor
          value={form.description}
          onChange={(v) => setForm((f) => ({ ...f, description: v }))}
          placeholder="Blog description"
          className="[&_.ql-editor]:min-h-[200px]"
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-1.5">Tags (comma-separated)</label>
          <input
            type="text"
            value={form.tagsStr}
            onChange={(e) => setForm((f) => ({ ...f, tagsStr: e.target.value }))}
            placeholder="nextjs, react"
            className="w-full rounded-lg border border-zinc-600 bg-zinc-800 px-4 py-2.5 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-500"
            disabled={formLoading}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-1.5">Read time</label>
          <input
            type="text"
            value={form.readTime}
            onChange={(e) => setForm((f) => ({ ...f, readTime: e.target.value }))}
            placeholder="5 min"
            className="w-full rounded-lg border border-zinc-600 bg-zinc-800 px-4 py-2.5 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-500"
            disabled={formLoading}
          />
        </div>
      </div>
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className="block text-sm font-medium text-zinc-300">Links</label>
          <button
            type="button"
            onClick={addLink}
            className="text-sm text-emerald-400 hover:text-emerald-300"
            disabled={formLoading}
          >
            + Add link
          </button>
        </div>
        {form.links.length === 0 ? (
          <button
            type="button"
            onClick={addLink}
            className="flex items-center gap-2 rounded-lg border border-dashed border-zinc-600 bg-zinc-800/50 px-4 py-3 text-sm text-zinc-400 hover:border-zinc-500 hover:text-zinc-300"
            disabled={formLoading}
          >
            <LinkIcon className="h-4 w-4" />
            Add link
          </button>
        ) : (
          <div className="space-y-2">
            {form.links.map((link, i) => (
              <div key={i} className="flex gap-2 items-center">
                <input
                  type="text"
                  value={link.name}
                  onChange={(e) => updateLink(i, "name", e.target.value)}
                  placeholder="Name"
                  className="flex-1 rounded-lg border border-zinc-600 bg-zinc-800 px-4 py-2 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-500"
                  disabled={formLoading}
                />
                <input
                  type="url"
                  value={link.url}
                  onChange={(e) => updateLink(i, "url", e.target.value)}
                  placeholder="URL"
                  className="flex-1 rounded-lg border border-zinc-600 bg-zinc-800 px-4 py-2 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-500"
                  disabled={formLoading}
                />
                <button
                  type="button"
                  onClick={() => removeLink(i)}
                  className="rounded-lg p-2 text-zinc-400 hover:bg-zinc-700 hover:text-white"
                  disabled={formLoading}
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
      <div>
        <label className="block text-sm font-medium text-zinc-300 mb-1.5">Image</label>
        <div
          onDrop={(e) => {
            e.preventDefault();
            const file = e.dataTransfer.files[0];
            if (file?.type.startsWith("image/")) setEditImage(file);
          }}
          onDragOver={(e) => { e.preventDefault(); e.dataTransfer.dropEffect = "copy"; }}
          className="relative flex min-h-[140px] flex-col items-center justify-center rounded-lg border-2 border-dashed border-zinc-600 bg-zinc-800/50 transition hover:border-zinc-500"
        >
          <input
            type="file"
            accept="image/*"
            className="absolute inset-0 z-10 cursor-pointer opacity-0"
            disabled={formLoading}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) setEditImage(file);
            }}
          />
          {editImagePreviewUrl ? (
            <div className="relative h-[160px] w-full p-2">
              <Image
                src={editImagePreviewUrl}
                alt="Preview"
                fill
                className="object-contain rounded-md"
                unoptimized
              />
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setEditImage(null);
                }}
                className="absolute right-3 top-3 z-20 rounded-full bg-black/60 p-1.5 text-white hover:bg-black/80"
                disabled={formLoading}
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ) : form.imageUrl ? (
            <div className="relative h-[160px] w-full p-2">
              <Image
                src={form.imageUrl}
                alt="Current"
                fill
                className="object-contain rounded-md"
                unoptimized
              />
              <span className="absolute bottom-2 left-2 rounded bg-black/60 px-2 py-0.5 text-xs text-white">
                Current · drop to replace
              </span>
            </div>
          ) : (
            <div className="pointer-events-none flex flex-col items-center gap-2 py-6 text-zinc-400">
              <ImageIcon className="h-10 w-10" />
              <span className="text-sm">Drop image or paste URL below</span>
            </div>
          )}
        </div>
        <input
          type="url"
          value={form.imageUrl}
          onChange={(e) => setForm((f) => ({ ...f, imageUrl: e.target.value }))}
          placeholder="Or paste image URL"
          className="mt-2 w-full rounded-lg border border-zinc-600 bg-zinc-800 px-4 py-2 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-500"
          disabled={formLoading}
        />
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-[#f5f0e8] font-sans">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-[#374431]">Admin Blogs</h1>
            <p className="mt-1 text-sm text-zinc-600">Manage blog posts</p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/admin"
              className="text-sm font-medium text-[#374431] hover:underline"
            >
              ← Dashboard
            </Link>
            <Link
              href="/admin/blogs/create"
              className="inline-flex items-center gap-2 rounded-lg bg-[#1e4d3c] px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-[#163d30]"
            >
              <Plus className="h-4 w-4" />
              Add Blog
            </Link>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-[#374431]" />
          </div>
        ) : blogs.length === 0 ? (
          <div className="rounded-2xl border border-[#e8dcd2] bg-[#e1d7c4]/40 p-12 text-center">
            <ImageIcon className="mx-auto h-12 w-12 text-zinc-400" />
            <p className="mt-4 text-sm text-zinc-600">No blogs yet.</p>
            <Link
              href="/admin/blogs/create"
              className="mt-4 inline-flex items-center gap-2 rounded-lg bg-[#1e4d3c] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#163d30]"
            >
              <Plus className="h-4 w-4" />
              Add your first blog
            </Link>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {blogs.map((blog) => (
              <article
                key={blog.id}
                className="flex flex-col rounded-xl border border-[#e8dcd2] bg-[#e1d7c4]/40 shadow-sm overflow-hidden"
              >
                <div className="relative aspect-video w-full bg-[#e5e2dc]">
                  {blog.imageUrl ? (
                    <Image
                      src={blog.imageUrl}
                      alt={blog.title}
                      fill
                      className="object-cover"
                      sizes="(max-width: 640px) 100vw, 33vw"
                      unoptimized
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <ImageIcon className="h-12 w-12 text-zinc-400" />
                    </div>
                  )}
                </div>
                <div className="flex flex-1 flex-col p-4">
                  <h3 className="font-medium text-zinc-900">{blog.title}</h3>
                  <p className="mt-1 text-sm text-zinc-600">
                    {blog.author && `By ${blog.author}`}
                    {blog.extras?.readTime && ` · ${blog.extras.readTime}`}
                  </p>
                  <p className="mt-2 line-clamp-2 text-sm text-zinc-600">
                    {stripHtml(blog.description)}
                  </p>
                  <div className="mt-4 flex gap-2">
                    <button
                      type="button"
                      onClick={() => openEdit(blog)}
                      className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-[#c4b8a8] bg-[#f0ebe3] px-3 py-2 text-sm font-medium text-zinc-700 hover:bg-[#e8e2d8]"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => openDelete(blog)}
                      className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700 hover:bg-red-100"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Delete
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {editOpen && blogToEdit && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
          onClick={() => !formLoading && setEditOpen(false)}
        >
          <div
            className="flex h-[90vh] w-full max-w-[95vw] flex-col rounded-2xl border border-zinc-700 bg-zinc-900 p-6 shadow-xl lg:max-w-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-6 flex shrink-0 items-center justify-between">
              <h2 className="text-lg font-semibold text-white">Edit Blog</h2>
              <button
                type="button"
                onClick={() => !formLoading && setEditOpen(false)}
                className="rounded-lg p-1 text-zinc-400 hover:bg-zinc-800 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleEdit} className="flex min-h-0 flex-1 flex-col overflow-hidden">
              <div className="min-h-0 flex-1 space-y-4 overflow-y-auto pr-1">
                {formFields()}
              </div>
              <div className="mt-4 flex shrink-0 gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => !formLoading && setEditOpen(false)}
                  className="flex-1 rounded-lg border border-zinc-600 bg-zinc-800 px-4 py-2.5 text-sm font-medium text-zinc-300 hover:bg-zinc-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formLoading}
                  className="flex-1 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-emerald-500 disabled:opacity-60"
                >
                  {formLoading ? (
                    <span className="inline-flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Saving...
                    </span>
                  ) : (
                    "Save"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {deleteOpen && blogToDelete && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
          onClick={() => !deleteLoading && setDeleteOpen(false)}
        >
          <div
            className="w-full max-w-sm rounded-2xl border border-zinc-700 bg-zinc-900 p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-900/50">
                <Trash2 className="h-6 w-6 text-red-400" />
              </div>
              <h2 className="mt-4 text-lg font-semibold text-white">Delete blog?</h2>
              <p className="mt-2 text-sm text-zinc-400">
                &ldquo;{blogToDelete.title}&rdquo; will be permanently removed.
              </p>
              <div className="mt-6 flex gap-3">
                <button
                  type="button"
                  onClick={() => !deleteLoading && setDeleteOpen(false)}
                  className="flex-1 rounded-lg border border-zinc-600 bg-zinc-800 px-4 py-2.5 text-sm font-medium text-zinc-300 hover:bg-zinc-700"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={deleteLoading}
                  className="flex-1 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-red-500 disabled:opacity-60"
                >
                  {deleteLoading ? (
                    <Loader2 className="mx-auto h-4 w-4 animate-spin" />
                  ) : (
                    "Delete"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
