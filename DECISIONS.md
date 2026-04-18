# Decisions

Short log of ambiguity resolutions made while scaffolding. None of these are
load-bearing — override freely.

## Typography

- **Sans:** Inter (variable woff2 from rsms.me), two weights surfaced in CSS
  (400, 500) even though the variable file carries the full axis.
- **Mono:** JetBrains Mono (woff2 from `@fontsource/jetbrains-mono`, weights
  400 and 500).
- Both families are self-hosted at `static/fonts/`. No external font CDNs at
  runtime.

## OG image pipeline

- Chose **Hugo `images.Text`** over an SVG → PNG pipeline because SVG → PNG
  requires an external rasterizer (Chromium, resvg, ImageMagick) that the
  Hugo binary does not provide, and the spec was "no external dependencies
  outside the Hugo binary."
- The base canvas is `themes/jaime/assets/og/base.png` (1200×630, warm dark
  fill with a 2px inner border). It is checked into the repo. A tiny Go
  helper at `scripts/make-og-base.go` (kept for future regeneration only)
  was used to produce it; the Hugo build does not invoke Go.
- TTFs for text overlay (`Inter-Regular.ttf`, `JetBrainsMono-Regular.ttf`)
  live in `themes/jaime/assets/og/fonts/`. `images.Text` requires TTF, so
  these are separate files from the `woff2` browser assets.
- Title wrapping is a greedy word-wrap at 34 characters, capped at four lines
  (truncated with `…` beyond that). That keeps titles legible at 44px without
  a real shaping engine. If a future title looks cramped, nudge `maxChars`
  in `themes/jaime/layouts/partials/og-image.html`.
- The homepage emits a default card using the positioning headline as its
  title. Every `writing/…` post emits its own. Other pages (projects list,
  about, writing list) fall back to a card with their page title.

## Content + UX

- **Writing tag filter** is progressive: each pill is a real link to the
  auto-generated `/tags/<tag>/` taxonomy page, so filtering works without
  JS. With JS, a small inline handler swaps `data-scope` on the list for an
  instant in-page filter. No framework, no state library.
- **Theme toggle** lives on the `<html>` element via `data-theme` only.
  Initial value is written synchronously in the head to prevent FOUC; the
  toggle button persists to `localStorage` under `"theme"`.
- **Sentence case** everywhere including section labels — labels use
  tracked all-caps via CSS `text-transform`, not content.

## Analytics

- GoatCounter is configured with the placeholder subdomain
  `https://jaimegago.goatcounter.com/count`. The tag only renders in
  production (`hugo.Environment != "development"` AND not `hugo server`),
  so `make dev` never phones home.
- No cookie banner is shipped and none is needed — GoatCounter is
  cookie-free by design.

## Repo naming

- Remote is **`jaimegago/jaimegago.dev-web`** as specified. The `.dev`
  suffix on GitHub repo names is fine; Pages handles the CNAME.

## Things left as explicit TODOs

- GoatCounter subdomain in `hugo.toml` — register + replace.
- About page body is placeholder prose. See the TODO comment at the top
  of `content/about.md`.
- Each draft post in `content/writing/` has a `<!-- TODO -->` marker and a
  single placeholder paragraph.
- `data/projects.yaml` has a single dormant placeholder row to establish
  the pattern; replace when a real dormant project exists.
