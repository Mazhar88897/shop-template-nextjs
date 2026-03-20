"use client";

import { useState } from "react";
import { toast } from "sonner";

export default function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [query, setQuery] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast("Query sent successfully.", {
      style: { background: "#000", color: "#fff", border: "none" },
      duration: 3000,
    });
    setName("");
    setEmail("");
    setQuery("");
  };

  const inputClass =
    "w-full border border-zinc-300 bg-white px-4 py-3 text-zinc-900 placeholder:text-zinc-400 focus:border-black focus:outline-none focus:ring-1 focus:ring-black";
  const labelClass = "mb-1.5 block text-left text-sm font-medium text-zinc-700";

  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4 py-16">
      <section className="w-full max-w-2xl">
        <div className="border-2 border-black bg-white p-8 sm:p-12">
          <h2
            className="mb-8 text-center text-2xl font-bold leading-tight sm:text-3xl"
            style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
          >
            Get in touch
          </h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="contact-name" className={labelClass}>
                Name
              </label>
              <input
                id="contact-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="your name"
                className={inputClass}
                required
              />
            </div>
            <div>
              <label htmlFor="contact-email" className={labelClass}>
                Email
              </label>
              <input
                id="contact-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your email"
                className={inputClass}
                required
              />
            </div>
            <div>
              <label htmlFor="contact-query" className={labelClass}>
                Query / Question
              </label>
              <textarea
                id="contact-query"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="your question or message"
                rows={4}
                className={`${inputClass} resize-y min-h-[100px]`}
                required
              />
            </div>
            <button
              type="submit"
              className="w-full bg-black px-8 py-3 font-medium uppercase text-white transition hover:bg-zinc-800 sm:w-auto"
            >
              Send
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}
