# One Prompt video production

## Local repository

```text
ONE_PROMPT_REPO_ROOT=/Users/ojusave/Desktop/Samples/work/distribution/one-prompt
```

## Brand assets

See [brand-source.md](./brand-source.md) for source paths, selected logo/symbol/fonts/colors, and ambiguities.

Runtime copies live in `apps/video/public/brand/`.

## Remotion Studio

From the monorepo root:

```bash
pnpm video:studio
```

Or from `apps/video`:

```bash
pnpm studio
```

Open Studio and select:

- `OnePromptCleanPath` (26s, 780 frames)
- `OnePromptLateFailure` (30s, 900 frames)

## Render videos

```bash
pnpm video:render:clean   # out/one-prompt-clean-path.mp4 (--muted)
pnpm video:render:late    # out/one-prompt-late-failure.mp4 (--muted)
pnpm video:render         # both
```

Outputs are written to the repo-root `out/` directory (gitignored).

## Render QA stills

```bash
pnpm video:stills
```

Writes:

```text
out/stills/clean-opening.png      # frame 15
out/stills/clean-parallel.png     # frame 210
out/stills/clean-deploy.png       # frame 555
out/stills/clean-final.png        # frame 779
out/stills/late-opening.png       # frame 15
out/stills/late-checkpoint.png    # frame 465
out/stills/late-failure.png       # frame 600
out/stills/late-retry.png         # frame 705
out/stills/late-final.png         # frame 899
```

## Where to edit

| Concern | File |
|---|---|
| Clean timing / actions | `src/scenes/clean-path-scene.ts` |
| Late-failure timing / actions | `src/scenes/late-failure-scene.ts` |
| Camera poses | `src/layout/graph-layout.ts` + camera keyframes in scene files |
| Graph positions | `src/layout/graph-layout.ts` |
| Task labels / structure | `packages/shared/src/workflows/video-graph.ts` |
| Fixture titles (web + shared) | `packages/shared/src/traces/fixtures.ts` |
| Brand tokens | `src/brand/render-brand.ts` |
| Prompt / editable props | `src/types.ts` (`defaultVideoProps`) |
| Final hold length | Composition duration + `show-summary` beat start; `finalHoldFrames` prop reserved |

## Changing the prompt

Default prompt comes from `@one-prompt/shared` `DEFAULT_PROMPT`. Override via Remotion input props:

```ts
{ prompt: "Your prompt here", ... }
```

## Specs

- 1920 × 1080
- 30 fps
- H.264
- No audio
- No fade to black

## Verify

```bash
pnpm typecheck
pnpm test
pnpm build
pnpm video:render

ffprobe -v error \
  -show_entries stream=width,height,r_frame_rate,codec_name \
  -show_entries format=duration \
  -of default=noprint_wrappers=1 \
  out/one-prompt-clean-path.mp4
```
