import Link from "next/link";
import { LogoMark, Wordmark } from "./logo-mark";

export function Logo() {
  return (
    <Link href="/" className="group flex items-center gap-2" aria-label="Factwright home">
      <LogoMark />
      <Wordmark className="text-[15px]" />
    </Link>
  );
}
