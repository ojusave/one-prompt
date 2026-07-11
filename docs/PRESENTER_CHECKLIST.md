# Presenter Rehearsal Checklist

## Before the talk

- [ ] Open `/runs/demo-late-failure?present=1&autoplay=1` on the venue display
- [ ] Confirm graph, timeline, and activity feed are readable at 1920×1080
- [ ] Test keyboard shortcuts: Space, R, 1/2/3, C, ?
- [ ] Load all three traces: clean (1), detour (2), late-failure (3)
- [ ] Open comparison: `/compare?runs=demo-clean,demo-detour,demo-late-failure&present=1`
- [ ] Disable Wi-Fi after page load: replay must still work offline
- [ ] Set presenter token in Settings if using live mode

## During the talk

- [ ] Default to **RECORDED RUN** (replay mode)
- [ ] Use Space to pause at failure point; inspector shows error details
- [ ] Point out: completed nodes remain, retry creates attempt 2
- [ ] Side-effect nodes show retry safety status

## Panic fallback

- [ ] **Shift+R**: immediate switch to replay mode
- [ ] If live stalls: click example run card or press 3 for late-failure trace
- [ ] Never refresh mid-demo unless necessary: replay is deterministic

## After failure demo

- [ ] Let replay complete or press R to restart
- [ ] Completion summary appears on same page (no slide transition)
- [ ] Copy line: "The prompt was fixed. The execution path was not."
