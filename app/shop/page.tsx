"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useMemo, useEffect } from "react";
import { ShoppingBag, ChevronLeft, ChevronRight, ChevronDown, Loader2 } from "lucide-react";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE ??
  "https://shop-template-backend-nine.vercel.app";

const SORT_OPTIONS = [
  { value: "recommended", label: "Recommended" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "newest", label: "Newest" },
];

type Product = {
  id: string;
  name: string;
  description: string;
  price: string;
  imageUrl: string;
  createdAt: string;
};

const ITEMS_PER_PAGE = 16;

function formatPrice(price: string | number): string {
  const n = typeof price === "string" ? Number(price) : price;
  if (Number.isNaN(n)) return "$0";
  return "$" + n.toLocaleString();
}

export default function ShopPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedSort, setSelectedSort] = useState("recommended");
  const [isSortOpen, setIsSortOpen] = useState(false);

  useEffect(() => {
    async function fetchProducts() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`${API_BASE}/api/products`);
        const json = await res.json();
        if (!res.ok) {
          setError(json?.message || "Failed to load products.");
          setProducts([]);
          return;
        }
        const list = json?.data ?? (Array.isArray(json) ? json : []);
        setProducts(Array.isArray(list) ? list : []);
      } catch {
        setError("Failed to load products.");
        setProducts([]);
      } finally {
        setLoading(false);
      }
    }
    fetchProducts();
  }, []);

  const sortedProducts = useMemo(() => {
    const list = [...products];
    if (selectedSort === "price-asc") {
      list.sort((a, b) => Number(a.price) - Number(b.price));
    } else if (selectedSort === "price-desc") {
      list.sort((a, b) => Number(b.price) - Number(a.price));
    } else if (selectedSort === "newest") {
      list.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    }
    return list;
  }, [products, selectedSort]);

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(sortedProducts.length / ITEMS_PER_PAGE)),
    [sortedProducts.length]
  );

  const paginatedItems = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return sortedProducts.slice(start, start + ITEMS_PER_PAGE);
  }, [sortedProducts, currentPage]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f5f0e8] font-sans">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-10 w-10 animate-spin text-[#374431]" />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#f5f0e8] font-sans">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f5f0e8] font-sans">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header: Sort + Total */}
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-[#374431]">Sort By</span>
            <div className="relative inline-block text-sm text-[#374431]">
              <button
                type="button"
                onClick={() => setIsSortOpen((open) => !open)}
                className="inline-flex items-center rounded-full bg-[#e1d7c4] px-3 py-1.5 shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-[#374431]"
                aria-haspopup="listbox"
                aria-expanded={isSortOpen}
              >
                <ChevronDown
                  className={`mr-2 h-4 w-4 text-[#374431] transition-transform ${
                    isSortOpen ? "rotate-180" : ""
                  }`}
                />
                <span className="font-medium">
                  {SORT_OPTIONS.find((o) => o.value === selectedSort)?.label}
                </span>
              </button>
              {isSortOpen && (
                <div
                  className="absolute left-0 top-full z-10 mt-1 w-full rounded-3xl bg-[#e1d7c4] py-1 shadow-lg"
                  onMouseLeave={() => setIsSortOpen(false)}
                >
                  {SORT_OPTIONS.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      className={`flex w-full items-center px-4 py-1.5 text-left text-sm ${
                        option.value === selectedSort
                          ? "font-semibold text-[#1f2a1a]"
                          : "text-[#374431] hover:bg-[#d4c9b7]"
                      }`}
                      onClick={() => {
                        setSelectedSort(option.value);
                        setIsSortOpen(false);
                      }}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
          <p className="text-sm text-zinc-600">
            Total {sortedProducts.length} Items
          </p>
        </div>

        {products.length === 0 ? (
          <div className="rounded-xl border border-[#e8dcd2] bg-[#e1d7c4]/40 p-12 text-center">
            <p className="text-sm text-zinc-600">No products yet.</p>
          </div>
        ) : (
          <>
            {/* Product grid */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {paginatedItems.map((product) => (
                <article
                  key={product.id}
                  className="group flex flex-col"
                >
                  <Link
                    href={`/shop/${product.id}`}
                    className="relative mx-auto block w-[80%] aspect-square overflow-hidden rounded-lg border border-[#e8dcd2] bg-[#e5e2dc] shadow-sm transition-all duration-300 hover:bg-[#002A30] hover:border-black hover:shadow-lg"
                  >
                    {product.imageUrl ? (
                      <Image
                        src={product.imageUrl}
                        alt={product.name}
                        fill
                        className="object-cover object-center transition group-hover:scale-[1.02]"
                        sizes="(max-width: 600px) 75vw, (max-width: 900px) 38vw, 18vw"
                        unoptimized
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-zinc-400 text-sm">
                        No image
                      </div>
                    )}
                    <span className="absolute inset-x-4 bottom-4 flex items-center justify-center gap-2 rounded-md border border-white bg-transparent py-2.5 text-sm font-medium text-white opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                      View details
                    </span>
                  </Link>
                  <div className="mt-3 flex items-start justify-between gap-2 px-1">
                    <Link
                      href={`/shop/${product.id}`}
                      className="text-sm font-medium text-zinc-900 hover:underline"
                    >
                      {product.name}
                    </Link>
                    <span className="shrink-0 text-sm font-semibold text-zinc-900">
                      {formatPrice(product.price)}
                    </span>
                  </div>
                </article>
              ))}
            </div>

            {/* Pagination + VIEW ALL */}
            {totalPages > 1 && (
              <div className="sm:mt-30 mt-10 flex w-full flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() =>
                      setCurrentPage((p) => Math.max(1, p - 1))
                    }
                    disabled={currentPage <= 1}
                    className="rounded-lg border border-[#c4b8a8] bg-[#f0ebe3] px-2 py-2.5 text-sm font-medium text-zinc-700 transition hover:bg-[#e8e2d8] disabled:opacity-50 disabled:hover:bg-[#f0ebe3]"
                    aria-label="Previous page"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  {Array.from(
                    { length: totalPages },
                    (_, i) => i + 1
                  ).map((page) => (
                    <button
                      key={page}
                      type="button"
                      onClick={() => setCurrentPage(page)}
                      className={`rounded-lg px-3 py-2 text-sm font-medium transition ${
                        currentPage === page
                          ? "bg-[#1e4d3c] text-white shadow-sm"
                          : "border border-[#c4b8a8] bg-[#f0ebe3] text-zinc-700 hover:bg-[#e8e2d8]"
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
                    className="rounded-lg border border-[#c4b8a8] bg-[#f0ebe3] px-2 py-2.5 text-sm font-medium text-zinc-700 transition hover:bg-[#e8e2d8] disabled:opacity-50 disabled:hover:bg-[#f0ebe3]"
                    aria-label="Next page"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
                <a
                  href="#"
                  className="text-sm font-medium uppercase tracking-wide text-zinc-700 hover:underline"
                >
                  VIEW ALL
                </a>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
