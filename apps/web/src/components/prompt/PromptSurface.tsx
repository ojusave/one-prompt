"use client";

import { motion } from "framer-motion";
import { EASE_OUT } from "@one-prompt/shared";

interface PromptSurfaceProps {
  prompt: string;
  editable?: boolean;
  compact?: boolean;
  onChange?: (value: string) => void;
  onSubmit?: () => void;
}

export function PromptSurface({
  prompt,
  editable = false,
  compact = false,
  onChange,
  onSubmit,
}: PromptSurfaceProps) {
  if (editable) {
    return (
      <motion.div layoutId="prompt-surface" className="mb-6">
        <textarea
          value={prompt}
          onChange={(e) => onChange?.(e.target.value)}
          rows={compact ? 2 : 4}
          className={`w-full resize-none rounded border border-border-default bg-surface px-4 py-4 leading-relaxed text-text-primary placeholder:text-text-tertiary focus:border-accent focus:outline-none ${
            compact ? "text-lg" : "text-xl"
          }`}
          placeholder="Enter an instruction..."
          onKeyDown={(e) => {
            if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) onSubmit?.();
          }}
        />
      </motion.div>
    );
  }

  return (
    <motion.div
      layoutId="prompt-surface"
      transition={{ duration: 0.65, ease: EASE_OUT }}
      className={compact ? "min-w-0 flex-1" : ""}
    >
      <motion.p
        layout="position"
        className={`leading-snug text-text-primary ${compact ? "text-lg" : "text-xl"}`}
      >
        {prompt}
      </motion.p>
    </motion.div>
  );
}
