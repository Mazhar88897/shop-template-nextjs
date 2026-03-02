
"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { Trash2, UploadCloud } from "lucide-react";

type CloudImage = {
  publicId: string;
  url: string;
  createdAt: string;
};

export default function CloudinaryCrudPage() {
  const [images, setImages] = useState<CloudImage[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function loadImages() {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/cloudinary/images");
      if (!res.ok) throw new Error("Failed to load images");
      const data = (await res.json()) as CloudImage[];
      setImages(data);
    } catch (err) {
      console.error(err);
      setError("Could not load images from Cloudinary.");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadImages();
  }, []);

  async function handleUpload() {
    if (!file) return;
    setIsUploading(true);
    setError(null);

    try {
      // Get signed params from our API
      const signRes = await fetch("/api/cloudinary/sign", {
        method: "POST",
      });
      if (!signRes.ok) throw new Error("Failed to get upload signature");
      const { timestamp, folder, signature, cloudName, apiKey } = await signRes.json();

      const formData = new FormData();
      formData.append("file", file);
      formData.append("api_key", apiKey as string);
      formData.append("timestamp", String(timestamp));
      formData.append("signature", signature as string);
      formData.append("folder", folder as string);

      const uploadRes = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`,
        {
          method: "POST",
          body: formData,
        }
      );

      if (!uploadRes.ok) throw new Error("Upload failed");

      setFile(null);
      await loadImages();
    } catch (err) {
      console.error(err);
      setError("Upload failed. Check your Cloudinary credentials.");
    } finally {
      setIsUploading(false);
    }
  }

  async function handleDelete(publicId: string) {
    setError(null);
    try {
      const res = await fetch(
        `/api/cloudinary/images/${encodeURIComponent(publicId)}`,
        {
          method: "DELETE",
        }
      );
      if (!res.ok) throw new Error("Delete failed");
      setImages((prev) => prev.filter((img) => img.publicId !== publicId));
    } catch (err) {
      console.error(err);
      setError("Could not delete image.");
    }
  }

  return (
    <div className="min-h-screen bg-[#f5f0e8] font-sans">
      <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <header className="mb-8">
          <h1 className="text-2xl font-semibold text-[#1b2b1f]">
            Cloudinary Image CRUD
          </h1>
          <p className="mt-2 text-sm text-zinc-600">
            Upload images to your Cloudinary account, list them, and delete them again.
            Make sure you have set{" "}
            <code className="rounded bg-black/5 px-1.5 py-0.5 text-xs">
              CLOUDINARY_CLOUD_NAME
            </code>
            ,{" "}
            <code className="rounded bg-black/5 px-1.5 py-0.5 text-xs">
              CLOUDINARY_API_KEY
            </code>{" "}
            and{" "}
            <code className="rounded bg-black/5 px-1.5 py-0.5 text-xs">
              CLOUDINARY_API_SECRET
            </code>{" "}
            in your <code>.env.local</code>.
          </p>
        </header>

        <section className="mb-10 rounded-2xl bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-sm font-semibold text-zinc-900">
                1. Upload image
              </h2>
              <p className="mt-1 text-xs text-zinc-500">
                Files are uploaded to the <span className="font-medium">next-crud-demo</span>{" "}
                folder in Cloudinary.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                className="text-xs"
              />
              <button
                type="button"
                onClick={handleUpload}
                disabled={!file || isUploading}
                className="inline-flex items-center gap-2 rounded-full bg-[#1a3b2b] px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-[#f5f0e8] disabled:opacity-60"
              >
                <UploadCloud className="h-4 w-4" />
                {isUploading ? "Uploading..." : "Upload"}
              </button>
            </div>
          </div>
          {error && (
            <p className="mt-3 text-xs text-red-600">
              {error}
            </p>
          )}
        </section>

        <section className="rounded-2xl bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-zinc-900">
              2. Images in Cloudinary
            </h2>
            <button
              type="button"
              onClick={loadImages}
              disabled={isLoading}
              className="text-xs font-medium text-[#1a3b2b] hover:underline"
            >
              {isLoading ? "Refreshing..." : "Refresh"}
            </button>
          </div>

          {images.length === 0 && !isLoading && (
            <p className="text-xs text-zinc-500">
              No images found yet. Upload one to get started.
            </p>
          )}

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {images.map((img) => (
              <article
                key={img.publicId}
                className="flex flex-col overflow-hidden rounded-xl border border-[#e8dcd2] bg-[#f7f3ec]"
              >
                <div className="relative h-40 w-full bg-black/5">
                  <Image
                    src={img.url}
                    alt={img.publicId}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    className="object-contain"
                  />
                </div>
                <div className="flex flex-1 flex-col gap-2 px-3 py-3">
                  <p className="line-clamp-2 break-all text-[10px] text-zinc-500">
                    {img.publicId}
                  </p>
                  <button
                    type="button"
                    onClick={() => handleDelete(img.publicId)}
                    className="mt-auto inline-flex items-center justify-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-[11px] font-medium text-red-600 hover:bg-red-50"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Delete
                  </button>
                </div>
              </article>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}

