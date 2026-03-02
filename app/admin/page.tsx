"use client";

import { useState, useCallback } from "react";
import { UploadCloud, ImageIcon } from "lucide-react";
import Link from "next/link";

export default function AdminPage() {
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [lastUrl, setLastUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const CLOUD_NAME = "dg4ciue4i";
  const API_KEY = "324783327323764";
  const UPLOAD_PRESET = "arsalan_blogs";

  const uploadFile = useCallback(async (file: File) => {
    if (!file.type.startsWith("image/")) {
      setError("Please drop an image file (e.g. JPEG, PNG).");
      return;
    }
    setUploading(true);
    setError(null);
    setLastUrl(null);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("api_key", API_KEY);
      formData.append("upload_preset", UPLOAD_PRESET);

      const uploadRes = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/auto/upload`,
        { method: "POST", body: formData }
      );

      if (!uploadRes.ok) {
        const err = await uploadRes.text();
        throw new Error(err || "Upload failed");
      }

      const data = (await uploadRes.json()) as { secure_url?: string; [key: string]: unknown };
      const url = data.secure_url;
      if (url) {
        setLastUrl(url);
        console.log("Cloudinary response:", data);
        console.log("Cloudinary image URL:", url);
      } else {
        throw new Error("No URL in response");
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Upload failed.";
      setError(message);
      console.error("Upload error:", err);
    } finally {
      setUploading(false);
    }
  }, []);

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files?.[0];
      if (file) uploadFile(file);
    },
    [uploadFile]
  );

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const onDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const onFileInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) uploadFile(file);
      e.target.value = "";
    },
    [uploadFile]
  );

  return (
    <div className="min-h-screen bg-zinc-900 font-sans">
      <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-white">Admin</h1>
            <p className="mt-1 text-sm text-zinc-400">
              Upload images to Cloudinary
            </p>
          </div>
          <div className="flex gap-3">
            <Link
              href="/admin/login"
              className="text-sm font-medium text-zinc-400 hover:text-white"
            >
              Login
            </Link>
            <Link
              href="/admin/products"
              className="text-sm font-medium text-zinc-400 hover:text-white"
            >
              Products
            </Link>
          </div>
        </div>

        <div
          onDrop={onDrop}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          className={`relative rounded-2xl border-2 border-dashed p-10 text-center transition-colors ${
            isDragging
              ? "border-emerald-500 bg-emerald-500/10"
              : "border-zinc-600 bg-zinc-800/50 hover:border-zinc-500"
          }`}
        >
          <input
            type="file"
            accept="image/*"
            onChange={onFileInputChange}
            disabled={uploading}
            className="absolute inset-0 cursor-pointer opacity-0 disabled:pointer-events-none"
            aria-label="Choose image"
          />
          {uploading ? (
            <div className="flex flex-col items-center gap-3">
              <div className="h-10 w-10 animate-spin rounded-full border-2 border-zinc-500 border-t-white" />
              <p className="text-sm text-zinc-300">Uploading…</p>
            </div>
          ) : (
            <>
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-zinc-700">
                <UploadCloud className="h-7 w-7 text-zinc-400" />
              </div>
              <p className="mt-4 text-sm font-medium text-white">
                Drag and drop an image here, or click to choose
              </p>
              <p className="mt-1 text-xs text-zinc-500">
                Images are uploaded to Cloudinary; the URL is logged to the
                console.
              </p>
            </>
          )}
        </div>

        {error && (
          <p className="mt-4 rounded-lg bg-red-900/30 px-4 py-2 text-sm text-red-400">
            {error}
          </p>
        )}

        {lastUrl && (
          <div className="mt-6 rounded-xl border border-zinc-700 bg-zinc-800/50 p-4">
            <p className="mb-2 flex items-center gap-2 text-sm font-medium text-zinc-300">
              <ImageIcon className="h-4 w-4" />
              Last uploaded URL (also in console)
            </p>
            <p className="break-all text-sm text-emerald-400">{lastUrl}</p>
          </div>
        )}
      </div>
    </div>
  );
}
