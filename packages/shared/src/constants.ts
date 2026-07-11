import type { TraceId } from "./types";

export const TRACE_FILES: Record<TraceId, string> = {
  clean: "duplicate-order-clean.json",
  detour: "duplicate-order-detour.json",
  "late-failure": "duplicate-order-late-failure.json",
};

export const TRACE_LABELS: Record<TraceId, { title: string; subtitle: string }> = {
  clean: {
    title: "Clean path",
    subtitle: "The route our architecture diagram assumes.",
  },
  detour: {
    title: "Unexpected detour",
    subtitle: "The result is correct. The route is more expensive.",
  },
  "late-failure": {
    title: "Late failure",
    subtitle: "Most of the work succeeded. What should start over?",
  },
};

export const ALLOWED_LIVE_SCENARIOS = ["duplicate-order-investigation"] as const;

export const PLAYBACK_RATES = [0.5, 1, 1.5, 2] as const;

export const EASE_OUT = [0.22, 1, 0.36, 1] as const;

export const GITHUB_REPO_URL =
  process.env.NEXT_PUBLIC_GITHUB_REPO_URL ??
  "https://github.com/ojusave/one-prompt";

export function renderSignupUrlWithUtms(
  content: string = "footer_link"
): string {
  const params = new URLSearchParams({
    utm_source: "github",
    utm_medium: "referral",
    utm_campaign: "ojus_demos",
    utm_content: content,
  });
  return `https://dashboard.render.com/register?${params.toString()}`;
}
