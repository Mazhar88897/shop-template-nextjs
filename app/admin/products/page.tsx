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
} from "lucide-react";
import toast from "react-hot-toast";
import RichTextEditor from "@/components/RichTextEditor";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE ??
  "https://shop-template-backend-nine.vercel.app";

type Product = {
  id: string;
  name: string;
  description: string;
  price: string;
  imageUrl: string;
  createdAt: string;
  updatedAt: string;
};

function getAuthHeaders(): HeadersInit {
  if (typeof window === "undefined") return {};
  const token =  sessionStorage.getItem("adminToken");
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [productToEdit, setProductToEdit] = useState<Product | null>(null);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    imageUrl: "",
  });

  // Create modal: drag-and-drop image file and preview URL
  const [createImageFile, setCreateImageFile] = useState<File | null>(null);
  const [createImagePreviewUrl, setCreateImagePreviewUrl] = useState<string | null>(null);

  // Edit modal: new image file when user drops (null = keep current image)
  const [editImageFile, setEditImageFile] = useState<File | null>(null);
  const [editImagePreviewUrl, setEditImagePreviewUrl] = useState<string | null>(null);

  function resetForm() {
    setForm({
      name: "",
      description: "",
      price: "",
      imageUrl: "",
    });
    setProductToEdit(null);
    if (createImagePreviewUrl) URL.revokeObjectURL(createImagePreviewUrl);
    setCreateImagePreviewUrl(null);
    setCreateImageFile(null);
    if (editImagePreviewUrl) URL.revokeObjectURL(editImagePreviewUrl);
    setEditImagePreviewUrl(null);
    setEditImageFile(null);
  }

  function setCreateImage(file: File | null) {
    if (createImagePreviewUrl) URL.revokeObjectURL(createImagePreviewUrl);
    setCreateImagePreviewUrl(null);
    setCreateImageFile(file);
    if (file) setCreateImagePreviewUrl(URL.createObjectURL(file));
  }

  function setEditImage(file: File | null) {
    if (editImagePreviewUrl) URL.revokeObjectURL(editImagePreviewUrl);
    setEditImagePreviewUrl(null);
    setEditImageFile(file);
    if (file) setEditImagePreviewUrl(URL.createObjectURL(file));
  }

  function handleCreateDrop(e: React.DragEvent) {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file?.type.startsWith("image/")) setCreateImage(file);
  }

  function handleCreateDragOver(e: React.DragEvent) {
    e.preventDefault();
    e.dataTransfer.dropEffect = "copy";
  }

  function handleEditDrop(e: React.DragEvent) {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file?.type.startsWith("image/")) setEditImage(file);
  }

  function handleEditDragOver(e: React.DragEvent) {
    e.preventDefault();
    e.dataTransfer.dropEffect = "copy";
  }

  async function fetchProducts() {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/admin/products`, {
        headers: getAuthHeaders(),
      });
    
      const json = await res.json();
      if (json?.success && Array.isArray(json?.data)) {
        setProducts(json.data);
      } else {
        toast.error("Failed to load products.");
      }
    } catch {
      toast.error("Failed to load products.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchProducts();
  }, []);

  function hasDescriptionContent(html: string) {
    const plain = html.replace(/<[^>]*>/g, "").trim();
    return plain.length > 0;
  }

  function decodeHtmlEntities(text: string) {
    // Decode things like &nbsp; / &amp; that Quill may emit
    if (typeof document === "undefined") {
      return text
        .replaceAll("&nbsp;", " ")
        .replaceAll("&amp;", "&")
        .replaceAll("&lt;", "<")
        .replaceAll("&gt;", ">")
        .replaceAll("&quot;", '"')
        .replaceAll("&#39;", "'");
    }
    const textarea = document.createElement("textarea");
    textarea.innerHTML = text;
    return textarea.value;
  }

  function stripHtml(html: string) {
    const withoutTags = html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
    return decodeHtmlEntities(withoutTags).replace(/\u00A0/g, " ").trim();
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    const priceNum = Number(form.price);
    if (!form.name.trim() || !hasDescriptionContent(form.description) || isNaN(priceNum) || priceNum < 0) {
      toast.error("Please fill all fields with valid values.");
      return;
    }
    setFormLoading(true);
    try {
      let imageUrl: string | undefined = form.imageUrl.trim() || undefined;
      // If user dropped/selected an image, upload to Cloudinary first
      if (createImageFile) {
        const formData = new FormData();
        formData.append("file", createImageFile);
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
      const res = await fetch(`${API_BASE}/api/admin/products`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({
          name: form.name.trim(),
          description: form.description.trim(),
          price: priceNum,
          imageUrl,
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        toast.error(json?.message || "Failed to create product.");
        setFormLoading(false);
        return;
      }
      toast.success("Product created.");
      setCreateOpen(false);
      resetForm();
      fetchProducts();
    } catch {
      toast.error("Failed to create product.");
    } finally {
      setFormLoading(false);
    }
  }

  function openEdit(product: Product) {
    setProductToEdit(product);
    setForm({
      name: product.name,
      description: product.description,
      price: product.price,
      imageUrl: product.imageUrl || "",
    });
    if (editImagePreviewUrl) URL.revokeObjectURL(editImagePreviewUrl);
    setEditImagePreviewUrl(null);
    setEditImageFile(null);
    setEditOpen(true);
  }

  async function handleEdit(e: React.FormEvent) {
    e.preventDefault();
    if (!productToEdit) return;
    const priceNum = Number(form.price);
    if (!form.name.trim() || !hasDescriptionContent(form.description) || isNaN(priceNum) || priceNum < 0) {
      toast.error("Please fill all fields with valid values.");
      return;
    }
    setFormLoading(true);
    try {
      let imageUrl: string | undefined = form.imageUrl.trim() || undefined;
      if (editImageFile) {
        // 1. Delete previous image from Cloudinary if it was a Cloudinary URL
        const prevImgId = getImagePublicId(productToEdit.imageUrl);
        if (prevImgId) {
          await fetch("/api/cloudinary/delete", {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ public_id: prevImgId }),
          });
        }
        // 2. Upload new image to Cloudinary
        const formData = new FormData();
        formData.append("file", editImageFile);
        const cloudRes = await fetch("/api/cloudinary/create", {
          method: "POST",
          body: formData,
        });
        const cloudJson = await cloudRes.json();
        if (!cloudRes.ok) {
          toast.error(cloudJson?.error || "Failed to upload new image.");
          setFormLoading(false);
          return;
        }
        if (cloudJson?.url) imageUrl = cloudJson.url;
      }
      const res = await fetch(`${API_BASE}/api/admin/products/${productToEdit.id}`, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify({
          name: form.name.trim(),
          description: form.description.trim(),
          price: priceNum,
          imageUrl,
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        toast.error(json?.message || "Failed to update product.");
        setFormLoading(false);
        return;
      }
      toast.success("Product updated.");
      setEditOpen(false);
      resetForm();
      fetchProducts();
    } catch {
      toast.error("Failed to update product.");
    } finally {
      setFormLoading(false);
    }
  }

  /** Extract Cloudinary public_id from product image URL (like product.image.public_id) */
  function getImagePublicId(imageUrl: string | undefined): string | null {
    if (!imageUrl?.trim()) return null;
    const trimmed = imageUrl.trim();
    const match = trimmed.match(
      /cloudinary\.com\/[^/]+\/(?:image|video)\/upload\/(?:v\d+\/)?(.+?)(?:\.[a-z]+)?$/i
    );
    return match ? match[1] : null;
  }

  function openDelete(product: Product) {
    setProductToDelete(product);
    setDeleteOpen(true);
  }

  async function handleDelete() {
    if (!productToDelete) return;
    setDeleteLoading(true);
    const imgId = getImagePublicId(productToDelete.imageUrl);
    try {
      // 1. Delete product from DB first
      const res = await fetch(
        `${API_BASE}/api/admin/products/${productToDelete.id}`,
        { method: "DELETE", headers: getAuthHeaders() }
      );
      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        toast.error(json?.message || "Failed to delete product.");
        setDeleteLoading(false);
        return;
      }
      // 2. Then delete image from Cloudinary if we have a public_id
      if (imgId) {
        const cloudRes = await fetch("/api/cloudinary/delete", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ public_id: imgId }),
        });
        if (!cloudRes.ok) {
          const err = await cloudRes.json().catch(() => ({}));
          toast.error(err?.error || "Product deleted but failed to remove image from storage.");
        }
      }
      toast.success("Product deleted.");
      setDeleteOpen(false);
      setProductToDelete(null);
      fetchProducts();
    } catch {
      toast.error("Failed to delete product.");
    } finally {
      setDeleteLoading(false);
    }
  }

  const formFields = (options: { isCreate?: boolean } = {}) => (
    <>
      <div>
        <label className="block text-sm font-medium text-zinc-300 mb-1.5">
          Name
        </label>
        <input
          type="text"
          value={form.name}
          onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          placeholder="Product name"
          className="w-full rounded-lg border border-zinc-600 bg-zinc-800 px-4 py-2.5 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-500"
          disabled={formLoading}
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-zinc-300 mb-1.5">
          Description
        </label>
        <RichTextEditor
          value={form.description}
          onChange={(v) => setForm((f) => ({ ...f, description: v }))}
          placeholder="Product description"
          className="[&_.ql-editor]:min-h-[200px]"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-zinc-300 mb-1.5">
          Price
        </label>
        <input
          type="number"
          min={0}
          step={1}
          value={form.price}
          onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
          placeholder="0"
          className="w-full rounded-lg border border-zinc-600 bg-zinc-800 px-4 py-2.5 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-500"
          disabled={formLoading}
        />
      </div>
      {options.isCreate ? (
        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-1.5">
            Image
          </label>
          <div
            onDrop={handleCreateDrop}
            onDragOver={handleCreateDragOver}
            className="relative flex min-h-[180px] flex-col items-center justify-center rounded-lg border-2 border-dashed border-zinc-600 bg-zinc-800/50 transition hover:border-zinc-500"
          >
            <input
              type="file"
              accept="image/*"
              className="absolute inset-0 z-10 cursor-pointer opacity-0"
              disabled={formLoading}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) setCreateImage(file);
              }}
            />
            {createImagePreviewUrl ? (
              <div className="relative h-[200px] w-full p-2">
                <Image
                  src={createImagePreviewUrl}
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
                    setCreateImage(null);
                  }}
                  className="absolute right-3 top-3 z-20 rounded-full bg-black/60 p-1.5 text-white hover:bg-black/80"
                  disabled={formLoading}
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <div className="pointer-events-none flex flex-col items-center gap-2 py-8 text-zinc-400">
                <ImageIcon className="h-10 w-10" />
                <span className="text-sm">Drop image here or click to upload</span>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-1.5">
            Image
          </label>
          <div
            onDrop={handleEditDrop}
            onDragOver={handleEditDragOver}
            className="relative flex min-h-[180px] flex-col items-center justify-center rounded-lg border-2 border-dashed border-zinc-600 bg-zinc-800/50 transition hover:border-zinc-500"
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
              <div className="relative h-[200px] w-full p-2">
                <Image
                  src={editImagePreviewUrl}
                  alt="New preview"
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
                <span className="absolute bottom-2 left-2 rounded bg-black/60 px-2 py-0.5 text-xs text-white">
                  New image (drop to replace)
                </span>
              </div>
            ) : form.imageUrl ? (
              <div className="relative h-[200px] w-full p-2">
                <Image
                  src={form.imageUrl}
                  alt="Current"
                  fill
                  className="object-contain rounded-md"
                  unoptimized
                />
                <span className="absolute bottom-2 left-2 rounded bg-black/60 px-2 py-0.5 text-xs text-white">
                  Current image · drop new to replace
                </span>
              </div>
            ) : (
              <div className="pointer-events-none flex flex-col items-center gap-2 py-8 text-zinc-400">
                <ImageIcon className="h-10 w-10" />
                <span className="text-sm">No image · drop or click to add</span>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );

  return (
    <div className="min-h-screen bg-[#f5f0e8] font-sans">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-[#374431]">
              Admin Products
            </h1>
            <p className="mt-1 text-sm text-zinc-600">
              Manage your store products
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/admin"
              className="text-sm font-medium text-[#374431] hover:underline"
            >
              ← Dashboard
            </Link>
            <button
              type="button"
              onClick={() => {
                resetForm();
                setCreateOpen(true);
              }}
              className="inline-flex items-center gap-2 rounded-lg bg-[#1e4d3c] px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-[#163d30]"
            >
              <Plus className="h-4 w-4" />
              Add Product
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-[#374431]" />
          </div>
        ) : products.length === 0 ? (
          <div className="rounded-2xl border border-[#e8dcd2] bg-[#e1d7c4]/40 p-12 text-center">
            <ImageIcon className="mx-auto h-12 w-12 text-zinc-400" />
            <p className="mt-4 text-sm text-zinc-600">No products yet.</p>
            <button
              type="button"
              onClick={() => {
                resetForm();
                setCreateOpen(true);
              }}
              className="mt-4 inline-flex items-center gap-2 rounded-lg bg-[#1e4d3c] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#163d30]"
            >
              <Plus className="h-4 w-4" />
              Add your first product
            </button>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {products.map((product) => (
              <article
                key={product.id}
                className="flex flex-col rounded-xl border border-[#e8dcd2] bg-[#e1d7c4]/40 shadow-sm overflow-hidden"
              >
                <div className="relative aspect-square w-full bg-[#e5e2dc]">
                  {product.imageUrl ? (
                    <Image
                      src={product.imageUrl}
                      alt={product.name}
                      fill
                      className="object-cover"
                      sizes="(max-width: 640px) 100vw, 25vw"
                      unoptimized
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <ImageIcon className="h-12 w-12 text-zinc-400" />
                    </div>
                  )}
                </div>
                <div className="flex flex-1 flex-col p-4">
                  <h3 className="font-medium text-zinc-900">{product.name}</h3>
                  <p className="mt-1 line-clamp-2 text-sm text-zinc-600">
                    {stripHtml(product.description) || "No description"}
                  </p>
                  <p className="mt-2 text-sm font-semibold text-zinc-900">
                    ${Number(product.price).toLocaleString()}
                  </p>
                  <div className="mt-4 flex gap-2">
                    <button
                      type="button"
                      onClick={() => openEdit(product)}
                      className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-[#c4b8a8] bg-[#f0ebe3] px-3 py-2 text-sm font-medium text-zinc-700 hover:bg-[#e8e2d8]"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => openDelete(product)}
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

      {/* Create Modal */}
      {createOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
          onClick={() => !formLoading && setCreateOpen(false)}
        >
          <div
            className="flex h-[85vh] w-full max-w-[95vw] flex-col rounded-2xl border border-zinc-700 bg-zinc-900 p-6 shadow-xl lg:h-[80vh] lg:w-[80vw] lg:max-w-[80vw]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-6 flex shrink-0 items-center justify-between">
              <h2 className="text-lg font-semibold text-white">
                Add Product
              </h2>
              <button
                type="button"
                onClick={() => !formLoading && setCreateOpen(false)}
                className="rounded-lg p-1 text-zinc-400 hover:bg-zinc-800 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleCreate} className="flex min-h-0 flex-1 flex-col overflow-hidden">
              <div className="min-h-0 flex-1 space-y-4 overflow-y-auto pr-1">
                {formFields({ isCreate: true })}
              </div>
              <div className="mt-4 flex shrink-0 gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => !formLoading && setCreateOpen(false)}
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
                    "Create"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editOpen && productToEdit && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
          onClick={() => !formLoading && setEditOpen(false)}
        >
          <div
            className="flex h-[85vh] w-full max-w-[95vw] flex-col rounded-2xl border border-zinc-700 bg-zinc-900 p-6 shadow-xl lg:h-[80vh] lg:w-[80vw] lg:max-w-[80vw]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-6 flex shrink-0 items-center justify-between">
              <h2 className="text-lg font-semibold text-white">
                Edit Product
              </h2>
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
                {formFields({ isCreate: false })}
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

      {/* Delete Confirmation Modal */}
      {deleteOpen && productToDelete && (
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
              <h2 className="mt-4 text-lg font-semibold text-white">
                Delete product?
              </h2>
              <p className="mt-2 text-sm text-zinc-400">
                &ldquo;{productToDelete.name}&rdquo; will be permanently removed.
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
