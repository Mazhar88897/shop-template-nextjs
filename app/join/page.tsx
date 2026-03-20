"use client";

import { useState } from "react";

export default function JoinPage() {
  const [email, setEmail] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Add newsletter subscription logic here
  };

  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4 py-16">
      <section className="w-full max-w-2xl">
        <div className="border-2 border-black bg-white p-8 text-center sm:p-12">
          <h2
            className="mb-8 text-2xl font-bold leading-tight sm:text-3xl"
            style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
          >
            Refuse to be invisible &<br />
            subscribe to our newsletter
          </h2>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4 sm:flex-row sm:items-stretch sm:justify-center">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="enter your email"
              className="min-w-0 flex-1 border border-zinc-300 bg-white px-4 py-3 text-zinc-900 placeholder:text-zinc-400 focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
              style={{ fontFamily: "system-ui, sans-serif" }}
            />
            <button
              type="submit"
              className="shrink-0 bg-black px-8 py-3 font-medium uppercase text-white transition hover:bg-zinc-800"
            >
              JOIN
            </button>
          </form>
        </div>
        {/* <div>
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, quos.
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, quos.
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, quos.    
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, quos.
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, quos.
        </div> */}
      </section>
    </div>
  );
}
