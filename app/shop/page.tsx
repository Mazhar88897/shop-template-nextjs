"use client";

import Image from "next/image";
import { useState, useMemo } from "react";
import { Info, ShoppingBag, ChevronLeft, ChevronRight, ChevronDown } from "lucide-react";

const PRODUCTS = [
  { id: 1, name: "Black T-shirt", price: 75, image: "/product_1.png", limited: true },
  { id: 2, name: "Black Cap", price: 32, image: "/product_2.png", limited: false },
  { id: 3, name: "Blue Cap", price: 42, image: "/product_3.png", limited: true },
  { id: 4, name: "Khaki Cap", price: 28, image: "/product_4.png", limited: false },
];

const SORT_OPTIONS = [
  { value: "recommended", label: "Recommended" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "newest", label: "Newest" },
];

// Repeat 4 times = 16 items
const ALL_ITEMS = [
  ...PRODUCTS,
  ...PRODUCTS,
  ...PRODUCTS,
  ...PRODUCTS,
  ...PRODUCTS,
  ...PRODUCTS,
  ...PRODUCTS,
  ...PRODUCTS,
  ...PRODUCTS,
  ...PRODUCTS,
  ...PRODUCTS,
  ...PRODUCTS,
  ...PRODUCTS,
  ...PRODUCTS,
  ...PRODUCTS,
  ...PRODUCTS,
  ...PRODUCTS,
  ...PRODUCTS,
];

const ITEMS_PER_PAGE = 16;

export default function ShopPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedSort, setSelectedSort] = useState("recommended");
  const [isSortOpen, setIsSortOpen] = useState(false);

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(ALL_ITEMS.length / ITEMS_PER_PAGE)),
    []
  );
  const paginatedItems = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return ALL_ITEMS.slice(start, start + ITEMS_PER_PAGE);
  }, [currentPage]);

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
          <p className="text-sm text-zinc-600">Total {ALL_ITEMS.length} Items</p>
        </div>

        {/* Product grid */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {paginatedItems.map((product, index) => (
            <article
              key={`${product.id}-${index}`}
              className="group flex flex-col"
            >
              {/* Card: image only, greyish bg; turns black on hover */}
              <div className="relative mx-auto w-[80%] aspect-square overflow-hidden rounded-lg border border-[#e8dcd2] bg-[#e5e2dc] shadow-sm transition-all duration-300 hover:bg-[#002A30] hover:border-black hover:shadow-lg">
                <Image
                  src={product.image}
                  alt={product.name}
                  fill
                  className="object-cover object-center transition group-hover:scale-[1.02]"
                  sizes="(max-width: 600px) 75vw, (max-width: 900px) 38vw, 18vw"
                />
                {product.limited && (
                  <span className="absolute left-2 top-2 flex items-center gap-1 rounded-full bg-white/95 px-2.5 py-1 text-xs font-medium text-zinc-700 shadow-sm group-hover:bg-white/20 group-hover:text-white">
                    Limited Items
                    <Info className="h-3.5 w-3.5 text-zinc-500 group-hover:text-white shrink-0" />
                  </span>
                )}
                <button
                  type="button"
                  className="absolute inset-x-4 bottom-4 flex items-center justify-center gap-2 rounded-md border border-white bg-transparent py-2.5 text-sm font-medium text-white opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-hover:pointer-events-auto pointer-events-none hover:bg-white hover:text-black"
                >
                  <ShoppingBag className="h-4 w-4 shrink-0" />
                  ADD TO CART
                </button>
              </div>
              {/* Heading & price outside card */}
              <div className="mt-3 flex items-start justify-between gap-2 px-1">
                <h3 className="text-sm font-medium text-zinc-900">{product.name}</h3>
                <span className="shrink-0 text-sm font-semibold text-zinc-900">${product.price}</span>
              </div>
            </article>
          ))}
        </div>

        {/* Bottom bar: pagination (sample style) + VIEW ALL */}
        <div className="sm:mt-30 mt-10 flex w-full flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage <= 1}
              className="rounded-lg border border-[#c4b8a8] bg-[#f0ebe3] px-2 py-2.5 text-sm font-medium text-zinc-700 transition hover:bg-[#e8e2d8] disabled:opacity-50 disabled:hover:bg-[#f0ebe3]"
              aria-label="Previous page"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
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
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
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
      </div>
    </div>
  );
}
