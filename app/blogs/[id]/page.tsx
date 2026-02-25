"use client";

import Image from "next/image";
import { Heart, Share2 } from "lucide-react";
import { toast } from "sonner";

// Static blog detail page used just to check styling
export default function BlogPostPage() {
  return (
    <div className="min-h-screen bg-white font-sans">
      <main className="mx-auto flex max-w-3xl flex-col gap-8 px-4 py-10 sm:px-6 lg:px-8">
        <header>
          <p className="mb-2 text-xs font-semibold tracking-[0.15em] text-zinc-500">
            FEB 5, 2026
          </p>
          <h1 className="text-3xl font-semibold leading-tight text-zinc-900">
            Work In Progress, Part 15
          </h1>
          <p className="mt-2 text-sm text-zinc-500">
            By <span className="font-medium text-zinc-900">Studio Orbit Team</span> · 8 min read
          </p>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
            <p className="max-w-md text-xs text-zinc-500">
              Part of the ongoing <span className="font-semibold text-zinc-800">Work In Progress</span>{" "}
              series, where we share what we&apos;re building before it&apos;s finished.
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-zinc-50 px-3 py-1.5 text-xs font-medium text-zinc-700 hover:bg-zinc-100"
                onClick={() => {
                  navigator.clipboard.writeText(window.location.href);
                  toast.success("Copied to clipboard");
                }}
              >
               
                 
             
                <Share2 className="h-4 w-4" />
                <span>Share</span>
              </button>
              {/* <button
                type="button"
                className="inline-flex items-center gap-1.5 rounded-full border border-pink-100 bg-pink-50 px-3 py-1.5 text-xs font-medium text-pink-600 hover:bg-pink-100"
              >
                <Heart className="h-4 w-4 fill-pink-500 text-pink-500" />
                <span>124</span>
              </button> */}
            </div>
          </div>
        </header>

        <div className="flex w-full justify-center rounded-2xl bg-zinc-100 px-4 py-6">
          <div className="relative w-full max-w-xl">
            <Image
              src="/product_2.png"
              alt="Work In Progress, Part 15"
              width={400}
              height={200}
              className="h-auto max-h-80 w-full object-contain"
            />
          </div>
        </div>

        <section className="space-y-4 text-sm leading-relaxed text-zinc-700">
          <p>
            Learn about January’s releases, including even more features to help creators grow
            their audience and convert more leads. This release focuses on smoothing out the
            rough edges in everyday workflows so teams can spend more time designing and less
            time fighting their tools.
          </p>
          <p>
            This article walks through the thinking, sketches, and decisions behind this work.
            You&apos;ll see what we tried first, what we changed after early feedback, and the
            principles that will guide future updates. We also share a few behind‑the‑scenes
            snapshots from our design files and prototypes.
          </p>
          <p>
            Along the way we highlight a few practical takeaways you can apply to your own
            projects today: how to frame problems so the team stays aligned, how to keep UI
            explorations grounded in real content, and how to ship improvements without
            waiting for a perfect grand redesign.
          </p>
          <p>
            At the end of the article you&apos;ll find a short checklist we now run through
            before every release. It&apos;s a simple way to catch rough edges early, confirm
            that new features fit the bigger story, and make sure the experience still feels
            cohesive as the product grows.
          </p>
        </section>
      </main>
    </div>
  );
}

