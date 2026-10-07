import { Download } from "lucide-react";
import type { Metadata } from "next";
import { BrandShowcase } from "@/components/brand-showcase";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

export const metadata: Metadata = { title: "Brand · Factwright" };

const COLOURS = [
  { name: "Forest", hex: "#1f3b2d", use: "Text and dark backgrounds" },
  { name: "Moss", hex: "#3f6b4f", use: "Second half of the name" },
  { name: "Sky", hex: "#3876ba", use: "Links and the top of the sky" },
  { name: "Sky light", hex: "#8cbfe8", use: "The bottom of the sky" },
  { name: "Cream", hex: "#fbf8f2", use: "Page background and the mark's strokes" },
];

export default function BrandPage() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-14 sm:px-6">
        <h1 className="text-3xl font-semibold tracking-tight text-forest sm:text-4xl">The Factwright brand</h1>
        <p className="mt-3 max-w-2xl text-stone-600">
          The mark is an F whose middle arm turns into a tick: a fact, checked. It draws itself in when a page loads, and a light passes over it when you hover.
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
            <a
              href="/brand/factwright-mark.svg"
              download
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-forest px-4 py-2 text-sm font-medium text-cream transition hover:bg-moss"
            >
              <Download className="h-4 w-4" /> Download the mark (SVG)
            </a>
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
