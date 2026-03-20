export default function BioPage() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4 py-16">
      <section className="w-full max-w-2xl">
        <div className="border-2 border-black bg-white p-8 sm:p-12">
          <h1
            className="mb-8 text-center text-2xl font-bold sm:text-3xl"
            style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
          >
            About Seriously Unserious
          </h1>
          <div className="space-y-6 text-zinc-700 leading-relaxed" style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}>
            <p>
              Seriously Unserious is a brand built on simplicity and intention. We believe in creating pieces that stand the test of time—products that you reach for again and again, not because they are loud, but because they are true.
            </p>
            <p>
              Founded with a focus on quality over quantity, we source materials thoughtfully and craft each item with care. Our aim is to offer a curated selection that speaks to those who refuse to blend in, who value substance over surface.
            </p>
            <p>
              Whether you are here to shop, read, or simply explore—we are glad you found us. Welcome to Seriously Unserious.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
