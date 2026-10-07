"use client";

import { useState } from "react";
import { RotateCcw } from "lucide-react";
import { LogoMark, Wordmark } from "./logo-mark";

/** The full logo drawn large, with a button to play the animation again. */
export function BrandShowcase() {
  const [replay, setReplay] = useState(0);

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <div className="relative grid min-h-72 place-items-center rounded-3xl border border-line bg-white p-10">
        <div className="flex items-center gap-4">
          <LogoMark className="h-16 w-16 sm:h-20 sm:w-20" replayKey={replay} />
          <Wordmark className="text-4xl sm:text-5xl" replayKey={replay} />
        </div>
        <button
          type="button"
          onClick={() => setReplay((n) => n + 1)}
          className="absolute bottom-4 right-4 inline-flex items-center gap-1.5 rounded-full border border-line px-3 py-1 text-xs text-stone-600 transition hover:text-forest"
        >
          <RotateCcw className="h-3.5 w-3.5" /> Play again
        </button>
      </div>
      <div className="grid min-h-72 place-items-center rounded-3xl bg-forest p-10">
        <div className="flex items-center gap-4">
          <LogoMark className="h-16 w-16 sm:h-20 sm:w-20" replayKey={replay} reversed />
          <Wordmark className="text-4xl sm:text-5xl" replayKey={replay} reversed />
        </div>
      </div>
    </div>
  );
}
