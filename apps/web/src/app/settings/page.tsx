"use client";

import { useEffect } from "react";
import { useAppStore } from "@/lib/app/store";
import { GITHUB_REPO_URL, renderSignupUrlWithUtms } from "@one-prompt/shared";

export default function SettingsPage() {
  const reducedMotion = useAppStore((s) => s.reducedMotion);
  const setReducedMotion = useAppStore((s) => s.setReducedMotion);
  const setPresenterToken = useAppStore((s) => s.setPresenterToken);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mq.matches);
    const handler = () => setReducedMotion(mq.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, [setReducedMotion]);

  return (
    <div className="mx-auto max-w-2xl px-6 py-10">
      <h1 className="text-2xl font-medium">Settings</h1>

      <section className="mt-8">
        <h2 className="text-sm font-medium uppercase text-text-tertiary">
          Display
        </h2>
        <label className="mt-3 flex items-center gap-3 text-sm">
          <input
            type="checkbox"
            checked={reducedMotion}
            onChange={(e) => setReducedMotion(e.target.checked)}
          />
          Reduce motion
        </label>
      </section>

      <section className="mt-8">
        <h2 className="text-sm font-medium uppercase text-text-tertiary">
          Presenter controls
        </h2>
        <p className="mt-2 text-sm text-text-secondary">
          Enter presenter token to enable live demo triggers.
        </p>
        <input
          type="password"
          placeholder="Presenter token"
          className="mt-3 w-full rounded border border-border-default bg-surface px-3 py-2 text-sm"
          onChange={(e) => setPresenterToken(e.target.value || null)}
        />
      </section>

      <section className="mt-8 border-t border-border-subtle pt-8">
        <h2 className="text-sm font-medium uppercase text-text-tertiary">Deploy</h2>
        <div className="mt-4 flex flex-wrap gap-3">
          <a
            href="https://render.com/deploy?repo=https://github.com/render-examples/one-prompt"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center rounded border border-border-default bg-surface px-4 py-2 text-sm hover:bg-surface-hover"
          >
            Deploy to Render
          </a>
          <a
            href={renderSignupUrlWithUtms("hero_cta")}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center rounded bg-accent px-4 py-2 text-sm text-background hover:brightness-110"
          >
            Sign up on Render
          </a>
        </div>
        <p className="mt-4 text-sm">
          <a href={GITHUB_REPO_URL} className="text-text-secondary hover:text-accent">
            View on GitHub
          </a>
        </p>
      </section>
    </div>
  );
}
