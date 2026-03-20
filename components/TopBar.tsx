"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ShoppingBag, Trash, X, Menu, ChevronDown } from "lucide-react";
import { useCart } from "@/context/CartContext";

function formatPrice(price: string | number | undefined): string {
  if (price === undefined || price === null) return "—";
  const n = typeof price === "string" ? Number(price) : price;
  if (Number.isNaN(n)) return "—";
  return "$" + n.toLocaleString();
}

const PAGES_LINKS = [
  { href: "/shop", label: "Shop" },
  { href: "/blogs", label: "Blogs" },
] as const;

export default function TopBar() {
  const [isPagesOpen, setIsPagesOpen] = useState(false);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const pagesRef = useRef<HTMLDivElement | null>(null);

  const { cart, totalItems, isCartOpen, openCart, closeCart, updateQuantity, removeItem } = useCart();
  const totalPrice = cart.items.reduce((sum, item) => {
    const p = item.price ? Number(item.price) : 0;
    return sum + (Number.isNaN(p) ? 0 : p) * item.quantity;
  }, 0);

  useEffect(() => {
    const close = (e: MouseEvent) => {
      if (pagesRef.current && !pagesRef.current.contains(e.target as Node)) setIsPagesOpen(false);
    };
    document.addEventListener("click", close);
    return () => document.removeEventListener("click", close);
  }, []);

  const navLinkClass = "text-[#1a1a1a] tracking-wide hover:opacity-70 transition-opacity";
  const navGap = "gap-8 lg:gap-12";

  return (
    <>
      <header className="relative sticky top-0 z-40 border-b border-zinc-200 bg-white" suppressHydrationWarning>
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4 lg:px-12" suppressHydrationWarning>
          {/* Left: brand */}
          <Link
            href="/"
            className="pacifico-regular shrink-0 text-xl text-[#1a1a1a] hover:opacity-80"
          >
            Seriously Unserious
          </Link>

          {/* Center: nav (desktop) */}
          <nav className={`hidden md:flex items-center ${navGap} uppercase text-sm font-medium`} style={{ fontFamily: "system-ui, -apple-system, sans-serif" }}>
            <Link href="/bio" className={navLinkClass}>Bio</Link>
            <Link href="/join" className={navLinkClass}>Join</Link>
            <Link href="/shop" className={navLinkClass}>SHOP</Link>
            {/* <div className="relative" ref={pagesRef}>
              <button
                type="button"
                onClick={() => setIsPagesOpen((o) => !o)}
                className={`flex items-center gap-0.5 ${navLinkClass}`}
              >
                PAGES
                <ChevronDown className={`h-4 w-4 transition-transform ${isPagesOpen ? "rotate-180" : ""}`} />
              </button>
              {isPagesOpen && (
                <div className="absolute left-0 top-full z-50 mt-1 min-w-[140px] rounded border border-zinc-200 bg-white py-1 shadow-lg">
                  {PAGES_LINKS.map(({ href, label }) => (
                    <Link
                      key={href}
                      href={href}
                      onClick={() => setIsPagesOpen(false)}
                      className="block px-4 py-2.5 text-left text-sm text-[#1a1a1a] hover:bg-zinc-100"
                    >
                      {label}
                    </Link>
                  ))}
                </div>
              )}
            </div> */}
            <Link href="/contact" className={navLinkClass}>CONTACT</Link>
          </nav>

          {/* Right: email + cart */}
          <div className="flex shrink-0 items-center gap-6">
            <a
              href="mailto:hello@james.com"
              className="hidden text-sm text-[#1a1a1a] hover:opacity-70 sm:block"
              style={{ fontFamily: "ui-monospace, 'Cascadia Code', 'Fira Code', monospace" }}
            >
              hello@xyz.com
            </a>
            {/* <button
              type="button"
              onClick={openCart}
              className="relative flex h-9 w-9 items-center justify-center text-[#1a1a1a] hover:opacity-70"
              aria-label={`Cart, ${totalItems} items`}
            >
              <ShoppingBag className="h-5 w-5" />
              {totalItems > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#1a1a1a] px-1 text-[10px] font-medium text-white">
                  {totalItems > 99 ? "99+" : totalItems}
                </span>
              )}
            </button> */}
            <button
              type="button"
              onClick={() => setIsMobileNavOpen((o) => !o)}
              className="flex h-9 w-9 items-center justify-center text-[#1a1a1a] hover:opacity-70 md:hidden"
              aria-label="Menu"
            >
              <Menu className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Mobile nav dropdown */}
        {isMobileNavOpen && (
          <nav className="absolute left-0 right-0 top-full z-50 border-b border-zinc-200 bg-white shadow-lg md:hidden">
            <div className="mx-auto max-w-6xl px-6 py-4">
              <div className="flex flex-col gap-1">
                <Link href="/" className="rounded-lg px-3 py-2.5 text-sm font-medium uppercase text-[#1a1a1a] hover:bg-zinc-100" onClick={() => setIsMobileNavOpen(false)}>Home</Link>
                <Link href="/#about" className="rounded-lg px-3 py-2.5 text-sm font-medium uppercase text-[#1a1a1a] hover:bg-zinc-100" onClick={() => setIsMobileNavOpen(false)}>About</Link>
                <Link href="/shop" className="rounded-lg px-3 py-2.5 text-sm font-medium uppercase text-[#1a1a1a] hover:bg-zinc-100" onClick={() => setIsMobileNavOpen(false)}>Shop</Link>
                <Link href="/blogs" className="rounded-lg px-3 py-2.5 text-sm font-medium uppercase text-[#1a1a1a] hover:bg-zinc-100" onClick={() => setIsMobileNavOpen(false)}>Blogs</Link>
                <Link href="/contact" className="rounded-lg px-3 py-2.5 text-sm font-medium uppercase text-[#1a1a1a] hover:bg-zinc-100" onClick={() => setIsMobileNavOpen(false)}>Contact</Link>
              </div>
            </div>
          </nav>
        )}
      </header>

      {/* Cart modal */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={closeCart}>
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
                onClick={closeCart}
                className="rounded-lg p-2 text-zinc-600 hover:bg-[#e1d7c4] hover:text-zinc-900"
                aria-label="Close cart"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto px-4 py-3">
              {cart.items.length === 0 ? (
                <p className="py-8 text-center text-sm text-zinc-600">Your cart is empty.</p>
              ) : (
                <ul className="space-y-4">
                  {cart.items.map((item) => {
                    const unitPrice = item.price ? Number(item.price) : 0;
                    const lineTotal = Number.isNaN(unitPrice) ? 0 : unitPrice * item.quantity;
                    return (
                      <li key={item.productId} className="flex gap-3 rounded-xl border border-[#e8dcd2] bg-white p-3">
                        <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg">
                          {item.imageUrl ? (
                            <Image src={item.imageUrl} alt={item.name ?? "Product"} fill className="object-contain" sizes="64px" unoptimized />
                          ) : (
                            <div className="flex h-full items-center justify-center text-xs text-zinc-400">No img</div>
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate font-medium text-zinc-900">{item.name ?? "Product"}</p>
                          <p className="text-sm text-zinc-600">
                            {formatPrice(item.price)} × {item.quantity} = {formatPrice(String(lineTotal))}
                          </p>
                          <div className="mt-1 flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => updateQuantity(item.productId, Math.max(0, item.quantity - 1))}
                              className="rounded border border-[#c4b8a8] bg-[#f0ebe3] px-2 py-0.5 text-xs font-medium text-zinc-700 hover:bg-[#e8e2d8]"
                            >−</button>
                            <span className="text-sm font-medium text-zinc-900">{item.quantity}</span>
                            <button
                              type="button"
                              onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                              className="rounded border border-[#c4b8a8] bg-[#f0ebe3] px-2 py-0.5 text-xs font-medium text-zinc-700 hover:bg-[#e8e2d8]"
                            >+</button>
                            <button
                              type="button"
                              onClick={() => removeItem(item.productId)}
                              className="ml-2 text-xs text-red-600 hover:underline"
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
                  onClick={closeCart}
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
