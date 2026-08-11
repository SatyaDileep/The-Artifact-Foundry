"use client";

import { useState } from "react";
import type { Flashcard } from "@/lib/types";

export default function FlipCard({ card }: { card: Flashcard }) {
  const [flipped, setFlipped] = useState(false);

  return (
    <button
      type="button"
      onClick={() => setFlipped((f) => !f)}
      className="perspective-1000 h-52 w-64 shrink-0 cursor-pointer"
      aria-label="Flip flashcard"
    >
      <div
        className="relative h-full w-full transition-transform duration-500 [transform-style:preserve-3d]"
        style={{ transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)" }}
      >
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-6 text-center [backface-visibility:hidden] dark:border-amber-900 dark:bg-amber-950">
          <span className="text-xs font-semibold uppercase tracking-wider text-amber-700 dark:text-amber-400">
            Question
          </span>
          <p className="text-base font-medium text-zinc-900 dark:text-zinc-50">
            {card.front}
          </p>
          <span className="text-xs text-zinc-500 dark:text-zinc-400">
            Tap to flip
          </span>
        </div>
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 rounded-2xl border border-orange-200 bg-orange-50 p-6 text-center [transform:rotateY(180deg)] [backface-visibility:hidden] dark:border-orange-900 dark:bg-orange-950">
          <span className="text-xs font-semibold uppercase tracking-wider text-orange-700 dark:text-orange-400">
            Answer
          </span>
          <p className="text-base font-medium text-zinc-900 dark:text-zinc-50">
            {card.back}
          </p>
        </div>
      </div>
    </button>
  );
}
