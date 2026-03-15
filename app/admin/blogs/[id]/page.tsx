"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect } from "react";
import Link from "next/link";

export default function AdminBlogEditPage() {
  const params = useParams();
  const router = useRouter();
  const id = typeof params?.id === "string" ? params.id : "";

  useEffect(() => {
    if (id) router.replace("/admin/blogs");
  }, [id, router]);

  return (
    <div className="min-h-screen bg-[#f8f5f0] font-sans flex items-center justify-center px-4">
      <div className="text-center">
        <p className="text-zinc-600 mb-4">Redirecting to blogs...</p>
        <Link
          href="/admin/blogs"
          className="text-sm font-medium text-[#1e4d3c] hover:underline"
        >
          Go to Admin Blogs
        </Link>
      </div>
    </div>
  );
}
