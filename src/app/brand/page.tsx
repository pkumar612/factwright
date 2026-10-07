import { Download } from "lucide-react";
import type { Metadata } from "next";
import { BrandShowcase } from "@/components/brand-showcase";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

export const metadata: Metadata = { title: "Brand · Factwright" };

const COLOURS = [
  { name: "Forest", hex: "#1f3b2d", use: "The brackets, the name and dark backgrounds" },
  { name: "Moss", hex: "#3f6b4f", use: "Hover states and accents" },
  { name: "Sky", hex: "#3876ba", use: "The block in the mark, and links" },
  { name: "Sky light", hex: "#8cbfe8", use: "The block on dark backgrounds" },
  { name: "Cream", hex: "#fbf8f2", use: "Page background, and the brackets on dark" },
];

const DOWNLOADS = [
  { label: "Logo, wide", file: "factwright-horizontal.svg" },
  { label: "Logo, wide on dark", file: "factwright-horizontal-reversed.svg" },
  { label: "Logo, stacked", file: "factwright-stacked.svg" },
  { label: "Symbol", file: "factwright-symbol.svg" },
  { label: "Symbol, black", file: "factwright-symbol-black.svg" },
  { label: "Symbol, white", file: "factwright-symbol-white.svg" },
  { label: "Wordmark", file: "factwright-wordmark.svg" },
  { label: "App icon (SVG)", file: "factwright-app-icon.svg" },
  { label: "App icon (PNG)", file: "factwright-icon-512.png" },
];

export default function BrandPage() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-14 sm:px-6">
        <h1 className="text-3xl font-semibold tracking-tight text-forest sm:text-4xl">The Factwright brand</h1>
        <p className="mt-3 max-w-2xl text-stone-600">
          The mark is called Cited: citation square brackets, like the ones around [2025] in a neutral citation, holding one solid block. It means a claim held to its source. When a page loads the fact lands first and the brackets close in around it; on hover they open a little.
        </p>

        <div className="mt-8">
          <BrandShowcase />
        </div>

        <section className="mt-12 grid gap-8 md:grid-cols-2">
          <div>
            <h2 className="text-lg font-semibold text-forest">Name and line</h2>
            <dl className="mt-3 space-y-3 text-sm">
              <div>
                <dt className="text-stone-500">Name</dt>
                <dd className="text-forest">Factwright: a maker of facts that hold, like a shipwright or a playwright.</dd>
              </div>
              <div>
                <dt className="text-stone-500">Tagline</dt>
                <dd className="text-forest">Nothing leaves your firm unverified.</dd>
              </div>
              <div>
                <dt className="text-stone-500">One-liner</dt>
                <dd className="text-forest">The evidence operating system for UK law firms and finance teams.</dd>
              </div>
            </dl>
            <h2 className="mt-8 text-lg font-semibold text-forest">Downloads</h2>
            <ul className="mt-3 flex flex-wrap gap-2">
              {DOWNLOADS.map((d) => (
                <li key={d.file}>
                  <a
                    href={`/brand/${d.file}`}
                    download
                    className="inline-flex items-center gap-1.5 rounded-full border border-line bg-white px-3 py-1.5 text-sm text-stone-700 transition hover:text-forest"
                  >
                    <Download className="h-3.5 w-3.5" /> {d.label}
                  </a>
                </li>
              ))}
            </ul>
            <p className="mt-4 text-xs text-stone-500">
              Keep clear space around the mark equal to the bracket thickness. Don&apos;t use the symbol smaller than 16 px, and use the app icon for browser tabs and avatars.
            </p>
          </div>
          <div>
            <h2 className="text-lg font-semibold text-forest">Colours</h2>
            <ul className="mt-3 space-y-2">
              {COLOURS.map((c) => (
                <li key={c.hex} className="flex items-center gap-3 text-sm">
                  <span className="h-9 w-9 shrink-0 rounded-lg ring-1 ring-line" style={{ background: c.hex }} />
                  <span className="w-24 font-medium text-forest">{c.name}</span>
                  <span className="w-20 font-mono text-xs text-stone-500">{c.hex}</span>
                  <span className="text-stone-600">{c.use}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
