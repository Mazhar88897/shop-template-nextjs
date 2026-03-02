"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Menu, Search, ShoppingBag, Trash, X } from "lucide-react";
import { useCart } from "@/context/CartContext";

function formatPrice(price: string | number | undefined): string {
  if (price === undefined || price === null) return "—";
  const n = typeof price === "string" ? Number(price) : price;
  if (Number.isNaN(n)) return "—";
  return "$" + n.toLocaleString();
}

export default function TopBar() {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement | null>(null);
  const [search, setSearch] = useState("");
  const { cart, totalItems, updateQuantity, removeItem } = useCart();

  const handleSearch = (value: string) => {
    setSearch(value);
    if (typeof window !== "undefined") {
      sessionStorage.setItem("search_query", value);
    }
  };
  useEffect(() => {
    if (isSearchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isSearchOpen]);

  const totalPrice = cart.items.reduce((sum, item) => {
    const p = item.price ? Number(item.price) : 0;
    return sum + (Number.isNaN(p) ? 0 : p) * item.quantity;
  }, 0);

  return (
    <>
      <header className="bg-[#08291e] text-[#f5f0e8]" suppressHydrationWarning>
        <div
          className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8"
          suppressHydrationWarning
        >
          <div className="flex items-center gap-10">
            <div className="flex h-9 w-9 items-center justify-center rounded-md bg-[#f5f0e8]">
              <span className="h-5 w-5 rounded-full border-2 border-[#08291e]" />
            </div>
            <nav className="hidden gap-10 text-xs font-semibold tracking-[0.18em] sm:flex">
              <a href="/blogs" className="uppercase hover:opacity-80">
                Blogs
              </a>
              <a href="/shop" className="uppercase hover:opacity-80">
                SHOP
              </a>
            </nav>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsSearchOpen((open) => !open)}
              className={`inline-flex items-center rounded-full bg-[#1a3b2b] px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-[#f5f0e8] transition-all duration-300 ${
                isSearchOpen ? "w-56 justify-start" : "w-[120px] justify-center"
              }`}
            >
              <Search className="mx-2 h-4 w-4 shrink-0" />
              {!isSearchOpen && <span className="">Search</span>}
              <input
                ref={searchInputRef}
                onChange={(e) => handleSearch(e.target.value)}
                value={search}
                type="text"
                placeholder="Search"
                className={`ml-1 bg-transparent text-[11px] font-normal uppercase tracking-[0.18em] text-[#f5f0e8] placeholder:text-[#cbd3cd] focus:outline-none ${
                  isSearchOpen ? "w-full opacity-100" : "w-0 opacity-0"
                }`}
              />
            </button>

            <button
              type="button"
              onClick={() => setIsCartOpen(true)}
              className="relative inline-flex items-center gap-2 rounded-full bg-[#f5f0e8] px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-[#1a3b2b] hover:opacity-90"
              aria-label={`Cart, ${totalItems} items`}
            >
              <ShoppingBag className="h-4 w-4" />
              {totalItems > 0 && (
                <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#1e4d3c] px-1 text-[10px] font-bold text-white">
                  {totalItems > 99 ? "99+" : totalItems}
                </span>
              )}
            </button>
          
          </div>
        </div>
      </header>

      {/* Cart modal */}
      {isCartOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
          onClick={() => setIsCartOpen(false)}
        >
          <div
            className="flex max-h-[85vh] w-full max-w-lg flex-col rounded-2xl border border-[#e8dcd2] bg-[#f5f0e8] shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-[#e8dcd2] px-4 py-3">
              <h2 className="text-lg font-semibold text-[#374431]">
                Your cart ({totalItems} {totalItems === 1 ? "item" : "items"})
              </h2>
              <button
                type="button"
                onClick={() => setIsCartOpen(false)}
                className="rounded-lg p-2 text-zinc-600 hover:bg-[#e1d7c4] hover:text-zinc-900"
                aria-label="Close cart"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto px-4 py-3">
              {cart.items.length === 0 ? (
                <p className="py-8 text-center text-sm text-zinc-600">
                  Your cart is empty.
                </p>
              ) : (
                <ul className="space-y-4">
                  {cart.items.map((item) => {
                    const unitPrice = item.price ? Number(item.price) : 0;
                    const lineTotal = Number.isNaN(unitPrice)
                      ? 0
                      : unitPrice * item.quantity;
                    return (
                      <li
                        key={item.productId}
                        className="flex gap-3 rounded-xl border border-[#e8dcd2] bg-white p-3"
                      >
                        <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-[#e5e2dc]">
                          {item.imageUrl ? (
                            <Image
                              src={item.imageUrl}
                              alt={item.name ?? "Product"}
                              fill
                              className="object-cover"
                              sizes="64px"
                              unoptimized
                            />
                          ) : (
                            <div className="flex h-full items-center justify-center text-zinc-400 text-xs">
                              No img
                            </div>
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate font-medium text-zinc-900">
                            {item.name ?? "Product"}
                          </p>
                          <p className="text-sm text-zinc-600">
                            {formatPrice(item.price)} × {item.quantity} ={" "}
                            {formatPrice(String(lineTotal))}
                          </p>
                          <div className="mt-1 flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() =>
                                updateQuantity(
                                  item.productId,
                                  Math.max(0, item.quantity - 1)
                                )
                              }
                              className="rounded border border-[#c4b8a8] bg-[#f0ebe3] px-2 py-0.5 text-xs font-medium text-zinc-700 hover:bg-[#e8e2d8]"
                            >
                              −
                            </button>
                            <span className="text-sm font-medium text-zinc-900">
                              {item.quantity}
                            </span>
                            <button
                              type="button"
                              onClick={() =>
                                updateQuantity(item.productId, item.quantity + 1)
                              }
                              className="rounded border border-[#c4b8a8] bg-[#f0ebe3] px-2 py-0.5 text-xs font-medium text-zinc-700 hover:bg-[#e8e2d8]"
                            >
                              +
                            </button>
                            <button
                              type="button"
                              onClick={() => removeItem(item.productId)}
                              className="ml-2 text-xs text-red-600 hover:underline "
                            >
                              <Trash className="h-4 w-4" /> 
                            </button>
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>

            {cart.items.length > 0 && (
              <div className="border-t border-[#e8dcd2] px-4 py-4">
                <div className="flex items-center justify-between text-lg font-semibold text-[#374431]">
                  <span>Total</span>
                  <span>{formatPrice(String(totalPrice))}</span>
                </div>
                <Link
                  href="/checkout"
                  onClick={() => setIsCartOpen(false)}
                  className="mt-3 flex w-full items-center justify-center rounded-lg bg-[#1e4d3c] px-4 py-3 text-sm font-medium text-white shadow-sm transition hover:bg-[#163d30]"
                >
                  Checkout
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
