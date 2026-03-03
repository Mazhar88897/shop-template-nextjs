"use client";

import Link from "next/link";
import { Boxes, FileText } from "lucide-react";

export default function AdminPage() {
  return (
    <div className="min-h-screen bg-[#f5f0e8] font-sans">
      <div className="mx-auto flex max-w-4xl flex-col gap-8 px-4 py-16">
        <header>
          <h1 className="text-3xl font-semibold text-[#374431]">
            Admin dashboard
          </h1>
          <p className="mt-2 text-sm text-zinc-600">
            Choose what you want to manage.
          </p>
        </header>

        <div className="grid gap-6 md:grid-cols-2">
          <Link
            href="/admin/products"
            className="group flex flex-col rounded-2xl border border-[#e2d7c5] bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#1e4d3c]/10 text-[#1e4d3c]">
                  <Boxes className="h-5 w-5" />
                </span>
                <div>
                  <h2 className="text-base font-semibold text-[#374431]">
                    Products
                  </h2>
                  <p className="text-xs text-zinc-600">
                    View and manage all store products.
                  </p>
                </div>
              </div>
              <span className="text-xs font-medium text-[#1e4d3c] group-hover:underline">
                Open
              </span>
            </div>
          </Link>

          <Link
            href="/admin/blogs"
            className="group flex flex-col rounded-2xl border border-[#e2d7c5] bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#374431]/10 text-[#374431]">
                  <FileText className="h-5 w-5" />
                </span>
                <div>
                  <h2 className="text-base font-semibold text-[#374431]">
                    Blogs
                  </h2>
                  <p className="text-xs text-zinc-600">
                    Create and edit blog posts.
                  </p>
                </div>
              </div>
              <span className="text-xs font-medium text-[#374431] group-hover:underline">
                Open
              </span>
            </div>
          </Link>

          <Link
            href="/admin/orders"
            className="group flex flex-col rounded-2xl border border-[#e2d7c5] bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#374431]/10 text-[#374431]">
                  <FileText className="h-5 w-5" />
                </span>
                <div>
                  <h2 className="text-base font-semibold text-[#374431]">
                    Orders
                  </h2>
                  <p className="text-xs text-zinc-600">
                    View and manage all store orders.
                  </p>
                </div>
              </div>
              <span className="text-xs font-medium text-[#374431] group-hover:underline">
                Open
              </span>
            </div>
          </Link>

          <Link
            href="/admin/coupons"
            className="group flex flex-col rounded-2xl border border-[#e2d7c5] bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#374431]/10 text-[#374431]">
                  <FileText className="h-5 w-5" />
                </span> 
                <div>
                  <h2 className="text-base font-semibold text-[#374431]">
                    Coupons
                  </h2>
                  <p className="text-xs text-zinc-600">
                    View and manage all store coupons.
                  </p>
                </div>
              </div>
              <span className="text-xs font-medium text-[#374431] group-hover:underline">
                Open
              </span>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
