import Link from "next/link";

export function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2 text-white">
      <span className="grid h-7 w-7 place-items-center rounded-lg bg-gradient-to-br from-indigo-400 to-emerald-400 text-[13px] font-bold text-ink">F</span>
      <span className="text-[15px] font-semibold tracking-tight">Factwright</span>
    </Link>
  );
}
