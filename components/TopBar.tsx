"use client";

import { useEffect, useRef, useState } from "react";
import { Menu, Search } from "lucide-react";

export default function TopBar() {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (isSearchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isSearchOpen]);

  return (
    <header className="bg-[#08291e] text-[#f5f0e8]">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        {/* Left side: logo + main nav */}
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

        {/* Right side: Search + Menu pills */}
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
              type="text"
              placeholder="Search"
              className={`ml-1 bg-transparent text-[11px] font-normal uppercase tracking-[0.18em] text-[#f5f0e8] placeholder:text-[#cbd3cd] focus:outline-none ${
                isSearchOpen ? "w-full opacity-100" : "w-0 opacity-0"
              }`}
            />
          </button>

          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-full bg-[#f5f0e8] px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-[#1a3b2b]"
          >
            <Menu className="h-4 w-4" />
            <span>Menu</span>
          </button>
        </div>
      </div>
    </header>
  );
}

