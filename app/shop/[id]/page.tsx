"use client";

import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowLeft, ShoppingBag, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useCart } from "@/context/CartContext";

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
};

function formatPrice(price: string | number): string {
  const n = typeof price === "string" ? Number(price) : price;
  if (Number.isNaN(n)) return "$0";
  return "$" + n.toLocaleString();
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

export default function ProductDetailPage() {
  const params = useParams();
  const id = typeof params?.id === "string" ? params.id : "";
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { addItem, getQuantity } = useCart();
  const cartQuantity = product ? getQuantity(product.id) : 0;

  useEffect(() => {
    if (!id) {
      setLoading(false);
      setError("Invalid product ID");
      return;
    }
    async function fetchProduct() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`${API_BASE}/api/products/${id}`);
        const json = await res.json();
        if (!res.ok) {
          setError(json?.message || "Product not found.");
          setProduct(null);
          return;
        }
        const data = json?.data ?? json;
        if (data && (data.id || data.name)) {
          setProduct(data);
        } else {
          setError("Product not found.");
          setProduct(null);
        }
      } catch {
        setError("Failed to load product.");
        setProduct(null);
      } finally {
        setLoading(false);
      }
    }
    fetchProduct();
  }, [id]);

  function handleAddToCart() {
    if (!product) return;
    addItem(product.id, 1, {
      name: product.name,
      price: product.price,
      imageUrl: product.imageUrl,
    });
    toast.success(`${product.name} added to cart`);
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f5f0e8] font-sans">
        <div className="mx-auto flex max-w-5xl flex-col items-center justify-center gap-6 px-4 py-20 sm:px-6 lg:px-8">
          <Loader2 className="h-10 w-10 animate-spin text-[#374431]" />
          <p className="text-sm text-zinc-500">Loading…</p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-[#f5f0e8] font-sans">
        <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 text-sm font-medium text-[#374431] hover:underline"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to shop
          </Link>
          <div className="mt-8 rounded-xl bg-red-50 px-4 py-6">
            <p className="text-sm text-red-700">{error || "Product not found."}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen min-w-0 max-w-full overflow-x-hidden bg-[#f5f0e8] font-sans">
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        <Link
          href="/shop"
          className="inline-flex w-fit items-center gap-2 text-sm font-medium text-[#374431] hover:underline"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to shop
        </Link>

        <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_1fr] lg:gap-12">
          {/* Image */}
          <div className="relative aspect-square w-full overflow-hidden rounded-2xl border border-[#e8dcd2] bg-[#e5e2dc]">
            {product.imageUrl ? (
              <Image
                src={product.imageUrl}
                alt={product.name}
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
                unoptimized
                priority
              />
            ) : (
              <div className="flex h-full items-center justify-center text-zinc-400 text-sm">
                No image
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex min-w-0 flex-col">
            <h1 className="text-2xl font-semibold text-zinc-900 sm:text-3xl">
              {product.name}
            </h1>
            {product.createdAt && (
              <p className="mt-1 text-xs font-medium tracking-wide text-zinc-500 uppercase">
                {formatDate(product.createdAt)}
              </p>
            )}
            <p className="mt-4 text-xl font-semibold text-[#374431]">
              {formatPrice(product.price)}
            </p>

            <div className="mt-6 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={handleAddToCart}
                className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[#1e4d3c] px-6 py-3.5 text-sm font-medium text-white shadow-sm transition hover:bg-[#163d30] sm:w-auto"
              >
                <ShoppingBag className="h-5 w-5" />
                Add to cart
              </button>
              {cartQuantity > 0 && (
                <span className="text-sm text-zinc-600">
                  {cartQuantity} in cart
                </span>
              )}
            </div>

            {/* Description */}
            {product.description?.trim() && (
              <div className="mt-8 border-t border-[#e8dcd2] pt-8">
                <h2 className="text-sm font-semibold text-zinc-900">Description</h2>
                <div
                  className="prose prose-zinc mt-3 min-w-0 max-w-none break-words text-sm leading-relaxed text-zinc-700 [&_*]:break-words [&_a]:break-all"
                  style={{ overflowWrap: "anywhere", wordBreak: "break-word" }}
                  dangerouslySetInnerHTML={{ __html: product.description }}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
