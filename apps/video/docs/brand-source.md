# Render brand source

## Local repository used

```text
ONE_PROMPT_REPO_ROOT=/Users/ojusave/Desktop/Samples/work/distribution/one-prompt
```

## Resolved brand sources

```text
RENDER_BRAND_SOURCE=/Users/ojusave/Desktop/Samples/github-repos/render-website
RENDER_LOGO_SOURCE=/Users/ojusave/Desktop/Samples/work/workshops/devrelcon-first-mile/nyc-deck/assets/brand/render-logo-white.svg
RENDER_SYMBOL_SOURCE=/Users/ojusave/Desktop/Samples/github-repos/render-website/public/brand/render_1105076560.svg
RENDER_FONT_SOURCE=/Users/ojusave/Desktop/Samples/github-repos/render-website/fonts/
RENDER_TOKEN_SOURCE=/Users/ojusave/Desktop/Samples/github-repos/render-website/styles/globals.css
```

## Selected assets

| Element | File in `public/brand/` | Source |
|---|---|---|
| Wordmark (dark bg) | `render-logo-white.svg` | Official site lockup from `render-website/components/Icons/RenderLogo.tsx` (tight `173×36` viewBox, white fill) |
| Symbol | `render-symbol.svg` | render-website favicon/brand SVG |
| Logomark | `render-logomark.svg` | nyc-deck (node accents; fill via CSS where needed) |
| Fonts | `fonts/Roobert-*.woff2`, `fonts/PPNeueMontreal-*.woff2`, `fonts/PPNeueMontrealMono-*.woff2` | render-website/fonts |

## Selected colors

From `render-website/styles/globals.css`:

| Token | Value | Use |
|---|---|---|
| Background | `#0d0d0d` | Canvas |
| Elevated | `#141414` | Prompt / panels |
| Surface | `#1a1a1a` | Nodes |
| Accent | `#d67f2e` (`--color-orange-400`) | Running borders, retry edges, deploy emphasis |
| Accent soft | `rgba(214, 127, 46, 0.18)` | Glow |
| Success | `#3d9e6f` | Completed |
| Danger | `#e05a4a` | Failed |
| Warning | `#d6a03a` | Checkpoint / attempt cues |
| Primary text | `#f5f5f5` | Titles |
| Secondary text | `#a3a3a3` | State labels |
| Tertiary text | `#737373` | Section labels |
| Border subtle | `rgba(255,255,255,0.08)` | Idle nodes |
| Border strong | `rgba(255,255,255,0.2)` | Raised edges |

## Selected type

- Display / UI: Roobert
- Body / node titles: PP Neue Montreal
- Mono labels: PP Neue Montreal Mono

## Selected spacing / radius

- Small radius: 8
- Medium radius: 14
- Large radius: 20
- Safe margins: 72 L/R, 56 T/B (video layout, not brand tokens)

## Why these files

1. `render-website` is the current marketing site and carries fonts plus orange/gray tokens.
2. The nyc-deck white wordmark is already used in Render presentation work and is dark-background ready.
3. The website brand SVG is a compact symbol suitable for Block A and deploy nodes.

## Rejected alternatives

- One Prompt app green `#5cdb95` (product chrome, not marketing brand)
- DDS purple tokens (demo UI kit, not presentation brand)
- Cascadia black PNG-only lockup (not dark-bg ready without invert)

## Ambiguity

- Older coral `#E05D2B` was not found in the local brand tree. Videos use `#d67f2e` from the current site tokens.
- Font files must stay inside this repository for Remotion runtime only. Do not publish or redistribute the source font files outside the repo.

## Missing brand elements

- No separate official "press kit" zip was present locally.
- No Joey Baker slide brand pack beyond a headshot elsewhere on disk.
