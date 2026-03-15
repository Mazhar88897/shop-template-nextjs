"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Search, ShoppingBag, Trash, X, Menu, ChevronDown } from "lucide-react";
import { useCart } from "@/context/CartContext";

function formatPrice(price: string | number | undefined): string {
  if (price === undefined || price === null) return "—";
  const n = typeof price === "string" ? Number(price) : price;
  if (Number.isNaN(n)) return "—";
  return "$" + n.toLocaleString();
}

const SEARCH_CATEGORIES = ["All", "Products", "Blogs"] as const;

export default function TopBar() {
  const router = useRouter();
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [searchCategory, setSearchCategory] = useState<(typeof SEARCH_CATEGORIES)[number]>("All");
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement | null>(null);
  const categoryRef = useRef<HTMLDivElement | null>(null);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (typeof window !== "undefined") sessionStorage.setItem("search_query", search);
    router.push("/shop");
  };

  const { cart, totalItems, updateQuantity, removeItem } = useCart();
  const totalPrice = cart.items.reduce((sum, item) => {
    const p = item.price ? Number(item.price) : 0;
    return sum + (Number.isNaN(p) ? 0 : p) * item.quantity;
  }, 0);

  useEffect(() => {
    const close = (e: MouseEvent) => {
      if (categoryRef.current && !categoryRef.current.contains(e.target as Node)) setIsCategoryOpen(false);
    };
    document.addEventListener("click", close);
    return () => document.removeEventListener("click", close);
  }, []);

  return (
    <>
      <header className="relative sticky top-0 z-40 border-b border-zinc-200 bg-white" suppressHydrationWarning>
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8" suppressHydrationWarning>
          {/* Left: hamburger + brand */}
          <div className="flex shrink-0 items-center gap-3 sm:gap-4">
            <button
              type="button"
              onClick={() => setIsMobileNavOpen((o) => !o)}
              className="flex h-9 w-9 items-center justify-center rounded-lg text-zinc-700 hover:bg-zinc-100"
              aria-label="Menu"
            >
              <Menu className="h-5 w-5" />
            </button>
            <Link href="/" className="hidden min-[450px]:block font-semibold text-zinc-900 hover:text-zinc-700" style={{ fontFamily: "Georgia, serif" }}>
              Dribbble 
            </Link>
        
          </div>

          {/* Center: large search bar with dropdown + pink button */}
          <form onSubmit={handleSearch} className="flex min-w-0 flex-1 justify-center px-2 sm:max-w-xl">
            <div className="flex w-full items-center gap-0 rounded-full bg-zinc-100 pl-4 pr-1 py-1 focus-within:ring-2 focus-within:ring-pink-400/40">
              <input
                ref={searchInputRef}
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search"
                className="min-w-0 flex-1 bg-transparent text-sm text-zinc-900 placeholder:text-zinc-500 focus:outline-none"
              />
              {/* <div className="relative shrink-0" ref={categoryRef}>
                <button
                  type="button"
                  onClick={() => setIsCategoryOpen((o) => !o)}
                  className="flex items-center gap-1 rounded-full px-3 py-1.5 text-sm font-medium text-zinc-600 hover:bg-zinc-200/80"
                >
                  {searchCategory}
                  <ChevronDown className="h-4 w-4" />
                </button>
                {isCategoryOpen && (
                  <div className="absolute right-0 top-full z-50 mt-1 min-w-[120px] rounded-lg border border-zinc-200 bg-white py-1 shadow-lg">
                    {SEARCH_CATEGORIES.map((cat) => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => {
                          setSearchCategory(cat);
                          setIsCategoryOpen(false);
                        }}
                        className="w-full px-3 py-2 text-left text-sm text-zinc-700 hover:bg-zinc-100"
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                )}
              </div> */}
              <button
                type="submit"
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-pink-500 text-white hover:bg-pink-600"
                aria-label="Search"
              >
                <Search className="h-4 w-4" />
              </button>
            </div>
          </form>

          {/* Right: Sign up, Log in, Cart */}
          <div className="flex shrink-0 items-center gap-2 sm:gap-4">
            {/* <Link href="/shop" className="hidden text-sm font-medium text-zinc-900 hover:text-zinc-600 sm:inline-block">
              Sign up
            </Link>
            <Link
              href="/admin/login"
              className="hidden rounded-full bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 sm:inline-block"
            >
              Log in
            </Link> */}
            <button
              type="button"
              onClick={() => setIsCartOpen(true)}
              className="relative flex h-9 w-9 items-center justify-center rounded-full text-zinc-700 hover:bg-zinc-100"
              aria-label={`Cart, ${totalItems} items`}
            >
              <ShoppingBag className="h-5 w-5" />
              {totalItems > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-pink-500 px-1 text-[10px] font-bold text-white">
                  {totalItems > 99 ? "99+" : totalItems}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Menu dropdown: Blogs & Shop (all screen sizes) */}
        {isMobileNavOpen && (
          <nav className="absolute left-0 right-0 top-full z-50 border-b border-zinc-200 bg-white shadow-lg">
            <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6 lg:px-8">
              <div className="flex flex-col gap-0.5 sm:flex-row sm:gap-6">
                <Link
                  href="/blogs"
                  className="rounded-lg px-3 py-2.5 text-sm font-medium text-zinc-700 hover:bg-zinc-100"
                  onClick={() => setIsMobileNavOpen(false)}
                >
                  Blogs
                </Link>
                <Link
                  href="/shop"
                  className="rounded-lg px-3 py-2.5 text-sm font-medium text-zinc-700 hover:bg-zinc-100"
                  onClick={() => setIsMobileNavOpen(false)}
                >
                  Shop
                </Link>
              </div>
            </div>
          </nav>
        )}
      </header>

      {/* Cart modal */}
      {isCartOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
          onClick={() => setIsCartOpen(false)}
        >
          <div
            className="flex max-h-[85vh] w-full max-w-lg flex-col rounded-2xl border border-[#e8dcd2] bg-white shadow-xl"
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
                        <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg ">
                          {item.imageUrl ? (
                            <Image
                              src={item.imageUrl}
                              alt={item.name ?? "Product"}
                              fill
                              className="object-contain"
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
