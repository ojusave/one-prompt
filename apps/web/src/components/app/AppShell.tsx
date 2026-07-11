"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { AppHeader } from "./AppHeader";
import { PresentationMode } from "@/components/presentation/PresentationMode";

function ShellInner({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const present = searchParams.get("present") === "1";
  const isRunPage = pathname.startsWith("/runs/");

  return (
    <div className={`flex min-h-screen flex-col ${present ? "presentation-mode" : ""}`}>
      <AppHeader present={present} isRunPage={isRunPage} />
      <main className="flex flex-1 flex-col">{children}</main>
      <PresentationMode />
    </div>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background" />}>
      <ShellInner>{children}</ShellInner>
    </Suspense>
  );
}
