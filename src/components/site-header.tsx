import Link from "next/link";
import { Logo } from "./logo";

export function SiteHeader() {
  return (
    <header className="no-print sticky top-0 z-40 border-b border-line bg-ink/70 backdrop-blur-xl">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Logo />
        <nav className="flex items-center gap-1 text-sm text-slate-400">
          <Link href="/#how" className="hidden rounded-full px-3 py-1.5 hover:text-white sm:block">How it works</Link>
          <Link href="/#why" className="hidden rounded-full px-3 py-1.5 hover:text-white sm:block">Why now</Link>
          <Link href="/check" className="rounded-full bg-white px-4 py-1.5 font-medium text-ink transition hover:bg-slate-200">Try the demo</Link>
        </nav>
      </div>
    </header>
  );
}
