"use client";

import { useState } from "react";
import Link from "next/link";
import { Trash2, Loader2 } from "lucide-react";
import toast from "react-hot-toast";

const CLOUD_NAME = "dg4ciue4i";
const API_KEY = "324783327323764";
const UPLOAD_PRESET = "arsalan_blogs";

export default function AdminDeleteImagePage() {
  const [publicId, setPublicId] = useState("");
  const [deleting, setDeleting] = useState(false);

  /** Extract public_id from a Cloudinary URL if user pastes full URL */
  function normalizePublicId(value: string): string {
    const trimmed = value.trim();
    if (!trimmed) return "";
    // e.g. https://res.cloudinary.com/cloud/image/upload/v123/folder/abc.jpg -> folder/abc or abc
    const match = trimmed.match(
      /cloudinary\.com\/[^/]+\/(?:image|video)\/upload\/(?:v\d+\/)?(.+?)(?:\.[a-z]+)?$/i
    );
    if (match) return match[1];
    return trimmed;
  }

  async function handleDelete(e: React.FormEvent) {
    e.preventDefault();
    const id = normalizePublicId(publicId);
    if (!id) {
      toast.error("Enter a Cloudinary public ID (or paste the image URL).");
      return;
    }
    setDeleting(true);
    try {
      const res = await fetch(
        `/api/cloudinary/images/${encodeURIComponent(id)}`,
        { method: "DELETE" }
      );
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast.error(data?.error || "Failed to delete image.");
        return;
      }
      toast.success("Image deleted from Cloudinary.");
      setPublicId("");
    } catch {
      toast.error("Failed to delete image.");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="min-h-screen bg-zinc-900 font-sans">
      <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-white">
              Delete image from Cloudinary
            </h1>
            <p className="mt-1 text-sm text-zinc-400">
              Enter the image public ID to remove it from Cloudinary
            </p>
          </div>
          <div className="flex gap-3">
            <Link
              href="/admin"
              className="text-sm font-medium text-zinc-400 hover:text-white"
            >
              Admin
            </Link>
            <Link
              href="/admin/products"
              className="text-sm font-medium text-zinc-400 hover:text-white"
            >
              Products
            </Link>
          </div>
        </div>

        <form
          onSubmit={handleDelete}
          className="rounded-2xl border border-zinc-700 bg-zinc-800/50 p-6"
        >
          <label
            htmlFor="publicId"
            className="mb-2 block text-sm font-medium text-zinc-300"
          >
            Image public ID
          </label>
          <input
            id="publicId"
            type="text"
            value={publicId}
            onChange={(e) => setPublicId(e.target.value)}
            placeholder="e.g. next-crud-demo/abc123 or paste full Cloudinary URL"
            className="w-full rounded-lg border border-zinc-600 bg-zinc-900 px-4 py-3 text-white placeholder-zinc-500 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            disabled={deleting}
          />
          <p className="mt-2 text-xs text-zinc-500">
            You can paste a full Cloudinary URL; the public ID will be extracted
            automatically.
          </p>

          <button
            type="submit"
            disabled={deleting}
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-lg bg-red-600 px-4 py-3 font-medium text-white transition-colors hover:bg-red-500 disabled:opacity-50"
          >
            {deleting ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Deleting…
              </>
            ) : (
              <>
                <Trash2 className="h-5 w-5" />
                Delete image
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
