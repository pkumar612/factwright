import Link from "next/link";

export function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2 text-forest">
      <span className="grid h-7 w-7 place-items-center rounded-lg bg-gradient-to-br from-sky to-moss text-[13px] font-bold text-white">F</span>
      <span className="text-[15px] font-semibold tracking-tight">Factwright</span>
    </Link>
  );
}
