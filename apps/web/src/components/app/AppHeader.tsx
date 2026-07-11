"use client";

import Link from "next/link";
import { usePlaybackStore } from "@/lib/playback/store";
import { ModeIndicator } from "./ModeIndicator";
import { RenderProvenance } from "./RenderProvenance";

interface AppHeaderProps {
  present: boolean;
  isRunPage: boolean;
}

export function AppHeader({ present, isRunPage }: AppHeaderProps) {
  const playbackState = usePlaybackStore((s) => s.state);
  const isActive = playbackState === "playing" || playbackState === "paused";

  if (present) {
    return (
      <header className="flex h-16 items-center justify-between border-b border-border-subtle px-6">
        <div className="flex items-center gap-4">
          <span className="text-lg font-medium tracking-tight">One Prompt</span>
          {isActive && (
            <span className="flex items-center gap-2 text-sm text-accent">
              <span className="h-2 w-2 rounded-full bg-accent" />
              Executing
            </span>
          )}
        </div>
        <ModeIndicator compact />
      </header>
    );
  }

  return (
    <header className="flex h-14 items-center justify-between border-b border-border-subtle px-6">
      <div className="flex items-center gap-8">
        <Link href="/" className="flex items-center gap-3 text-lg font-medium tracking-tight">
          One Prompt
          {isActive && isRunPage && (
            <span className="flex items-center gap-1.5 text-xs font-normal text-accent">
              <span className="h-1.5 w-1.5 rounded-full bg-accent" />
              Running
            </span>
          )}
        </Link>
        <nav className="flex items-center gap-1 text-sm">
          <NavLink href="/">New run</NavLink>
          <NavLink href="/runs">Runs</NavLink>
          <NavLink href="/compare">Compare</NavLink>
        </nav>
      </div>
      <div className="flex items-center gap-4">
        <ModeIndicator />
        <RenderProvenance />
        <Link
          href="/settings"
          className="text-sm text-text-secondary transition-colors hover:text-text-primary"
        >
          Settings
        </Link>
      </div>
    </header>
  );
}

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="rounded px-3 py-1.5 text-text-secondary transition-colors hover:bg-surface-hover hover:text-text-primary"
    >
      {children}
    </Link>
  );
}
