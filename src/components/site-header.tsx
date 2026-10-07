import Link from "next/link";
import { Logo } from "./logo";

export function SiteHeader() {
  return (
    <header className="no-print sticky top-0 z-40 border-b border-line bg-cream/80 backdrop-blur-xl">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Logo />
        <nav className="flex items-center gap-1 text-sm text-stone-600">
          <Link href="/features" className="rounded-full px-3 py-1.5 hover:text-forest">Features</Link>
          <Link href="/#how" className="hidden rounded-full px-3 py-1.5 hover:text-forest sm:block">How it works</Link>
          <Link href="/#why" className="hidden rounded-full px-3 py-1.5 hover:text-forest sm:block">Why now</Link>
          <Link href="/check" className="rounded-full bg-forest px-4 py-1.5 font-medium text-cream transition hover:bg-moss">Try the demo</Link>
        </nav>
      </div>
    </header>
  );
}
