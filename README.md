# sendust-docs

The user-facing documentation site for [Sendust](https://github.com/fandyajpo/sendust):
how to use `@sendust/ts`, and the story of how it got here. An
[Astro 5](https://astro.build) + [Starlight](https://starlight.astro.build) site,
static output, TypeScript, Pagefind search, no analytics.

> **NOTICE — the source of truth is [`fandyajpo/sendust/docs`](https://github.com/fandyajpo/sendust/tree/main/docs).**
> Nothing published here is written here. The guides, the API contract, the ADRs
> and the release notes are authored, reviewed and validated in the Sendust
> repository, whose own `scripts/check-docs.mjs` and `check-doc-claims.mjs`
> validate links, indexes and that guide numbers match code constants. This
> repository only renders them. Corrections belong upstream; anything under
> `src/content/docs/` other than `index.mdx` is generated and gitignored.

## How the sync works

`scripts/sync-docs.mjs` copies Markdown out of a Sendust checkout and into the
Starlight content collection.

| In `fandyajpo/sendust` | Lands at | Sidebar group |
| --- | --- | --- |
| `docs/guides/quick-start.md`, `lifecycle-limits.md` | `src/content/docs/guide/` | Start here |
| `docs/guides/addressing-mime-attachments.md`, `errors-security-operations.md` | `src/content/docs/guide/` | Guides |
| `docs/architecture/overview.md` | `src/content/docs/architecture/` | Architecture |
| `docs/qa/benchmark-nodemailer.md` | `src/content/docs/performance/` | Performance |
| `docs/guides/maintainer.md` | `src/content/docs/contributing/` | Contributing |
| `docs/releases/story.md` | `src/content/docs/releases/` | The story |

`src/content/docs/license.md` is authored here (it links the repository's two
license files and states the published `MIT OR Apache-2.0`), and is listed in the
map under `manual`.

It does five things, in this order.

1. **Finds the checkout.** `SENDUST_PATH`, else `../sendust`, else
   `~/Documents/Personal/sendust`.
2. **Pins the ref.** `SENDUST_REF`, default `v1.0.1`. If the checkout's `HEAD` is
   not that ref, it stops with instructions and writes nothing — the site only
   ever publishes a tagged tree. Uncommitted changes under `docs/` are allowed
   but warned about.
3. **Injects frontmatter.** `title` is the document's first H1, `description` is
   its first prose paragraph (a leading `**Status:**` / `**Related:**` line is
   metadata, not prose, and is skipped; where a document opens straight into a
   heading, `scripts/doc-map.mjs` supplies the description), and `sidebar.label`
   plus `sidebar.order` come from that map.
4. **Rewrites links.** A relative link whose target is published here becomes a
   route on this site. A relative link whose target is *not* published here — a
   gate record, an audit, a QA report, a source file, `docs/README.md` — becomes
   `https://github.com/fandyajpo/sendust/blob/<ref>/…` at the same ref. Absolute
   URLs, anchors and `mailto:` links are left alone.
5. **Fails loudly on anything that would dangle.** A link with no target in the
   checkout, one that resolves outside the repository, or an anchor that names a
   heading the target page does not have, is listed with file and line and the
   script exits non-zero — before writing a single file.

### What is deliberately not published

The site is for people using the package, so the architecture and evidence
record stays in the repository: the ADRs (`docs/architecture/decisions/`), the
contract baselines (`public-api.md`, `error-model.md`), the maintainer guide,
the release-engineering notes, and `gates/`, `phases/`, `audits/`, `planning/`,
`qa/`, `research/`, `security/`, `discovery/`, `engineering/`, `product/` and
`docs/README.md`. Links to any of them become GitHub permalinks at the same ref.
`scripts/doc-map.mjs`'s `unpublished` list is the record of that decision; move
a document into `pages` to include it.

### `scripts/doc-map.mjs`

The one map this repository owns: which documents are published, their source
path, their sidebar group, label and order, an optional description override,
and the `unpublished` list that records what exists upstream and stays there.
`astro.config.mjs` builds the sidebar from the same file, so a label is declared
exactly once. A new guide that appears upstream before the map lists it is still
copied and reachable by URL, with a warning that it is missing from the sidebar
(unless the discovery rule skips it); a mapped page that disappears upstream is
a hard error.

## Commands

```sh
npm install                     # once; commits package-lock.json

git -C ../sendust checkout v1.0.1   # if that checkout has moved past the tag
npm run sync:docs               # copy, rewrite, write src/content/docs/…
npm run build                   # sync, then build the static site into dist/
npm run preview                 # serve dist/
npm run dev                     # dev server with hot reload

npm run check:docs              # validate only: no writes, same link checks
npm run fetch:docs              # download the pinned tag into .sendust/
SENDUST_REF=v1.1.0 npm run sync:docs
SENDUST_PATH=~/work/sendust npm run sync:docs
```

`npm run build` runs the sync first, so a build can never ship documentation that
is not from the pinned ref. To render another release, set `SENDUST_REF` (and
check that checkout out at that ref).

## What is authored here, what is generated

Authored: `src/content/docs/index.mdx` (the landing page), `src/content/docs/license.md`,
`src/styles/fonts.css` and `src/styles/sendust.css`, `src/content.config.ts`
(Starlight's `docs` collection, with extension-less ids so the sidebar slugs in the
config resolve), `src/components/` (`BuiltInTheOpen`, `LandingHero`, `LiquidBand`,
`Cards`, `Glyph`, `MothMark`, `SignalMoth`, `SiteTitle`, `FactList`, `Head`,
`Footer`), `scripts/doc-map.mjs`, `scripts/sync-docs.mjs`,
`scripts/fetch-sendust.mjs`, `astro.config.mjs`, this README, the workflow.

Generated, gitignored, rewritten on every run: `src/content/docs/guide/`,
`releases/`, and `src/synced-docs.json` (the ref, commit and time the pages were
rendered from, which the footer displays). A directory that stops being
published — `api/`, `decisions/` — is deleted on the next sync.

## Brand, liquid, and the signal moth

**The mark** (`MothMark.astro`) is a signal moth drawn in pixels: the silhouette
sits on whole units and snaps to the pixel grid, the glints on its wings and
antennae are half units, so at 2x it shimmers without a single soft pixel. It is
the header mark (`SiteTitle`), the favicon, and the outline the mascot is built
from.

**The mascot** (`SignalMoth.astro`) is that moth, larger. It perches in the
landing hero and floats in the corner of every other page; the floating one
deletes itself when a perched one is on the page, and it fades in after 500 ms so
that swap is never visible. Idle it bobs, its wings flutter, its lantern pulses
and dust drifts past. It reacts: the eyes follow the pointer (clamped to about
2 px), the wings open when the pointer comes within ~160 px, and a tap fires a
lime ring with three signal dots. One shared set of `document` listeners is
re-attached through `astro:page-load`, so a view transition leaves nothing
behind. It is decoration — `aria-hidden`, never focusable, never announced.

**The water** (`LiquidBand.astro`, and the hero) is the obsidian panel: three
drifting pools of light, one static grain tile, and a two-copy SVG wave — the
page colour eating into the water — translated by -50 % on a loop. The pools are
plain radial gradients, not blurred elements, and they move on `transform` only,
so nothing on a liquid layer repaints.

**The components**: `Cards` (data-driven link cards with a pixel glyph and a pool
of light on hover), `Glyph` (ten pixel icons on a 16-unit grid), `LiquidBand`,
`LandingHero`, `FactList`, `SiteTitle`. A group with a single page in the map is
still a plain sidebar link — a collapsible menu around one item is noise.

## Theme and motion

Technical Precision: an off-white reading surface (`#F4F5F0`) with obsidian ink,
obsidian water panels, obsidian code blocks, and one electric-lime accent
(`#D5FF70`). Because lime is a light value, anything drawn *on paper* — the
header mark, a glyph accent — uses `--sx-glow`, the same accent darkened to
olive; inside the obsidian panels the variable is set back to the lime, so the
water keeps the real thing. 1px hairlines, no shadows doing a border's job.

Type is three families, self-hosted from `public/fonts/` as woff2 with
`font-display: swap`: Manrope 500/600/700/800 for display and headings, Geist Sans
400/500 for prose and interface, Geist Mono 400/500 for code, tables and
identifiers. No third-party font requests, no font JavaScript; only the three
faces the first screen sets are preloaded.

Micro-interactions are transform, opacity and colour only, at 120–200 ms: link
underlines that saturate, cards that lift 2 px with a pool of light rising in
them, glyphs that darken, facts that take a border, a nav item that nudges 2 px, a
header hairline of signal, the brand mark tilting 6°, and a tap that settles a
card by one pixel.

Motion is entrance-only: the rotating word in the hero headline with a lime rule
sweeping under it (12 s cycle), drifting pools and waves (24–42 s), the moth's
idle (3–7 s), a rise on section headings and cards as they scroll in
(`animation-timeline: view()`, where supported), and 500 ms of lean on the
floating moth. Nothing animates layout. Under `prefers-reduced-motion: reduce`
every animation and transition is off — the headline shows its first word, the
water holds still, and the moth is a static drawing.

The voice on authored pages is editorial and plain; everything the sync copies
stays verbatim.

## Deployment

`.github/workflows/pages.yml` builds and publishes to GitHub Pages through
`withastro/action` and `actions/deploy-pages`.

- On a push to `main` it renders the pinned ref (currently `v1.0.1`).
- `workflow_dispatch` takes an optional `ref` input.
- A daily scheduled run asks GitHub for the latest Sendust release and renders
  that tag, so the site follows releases without a commit here.

The site is a project page: `site` and `base` live in `scripts/doc-map.mjs`
(`https://fandyajpo.github.io` + `/sendust-docs`). Set the repository's Pages
source to **GitHub Actions** once. Internal links are written relative to the
page, so they survive the base path without a plugin.

If `package-lock.json` is missing, the workflow generates it before building;
commit one so the build is reproducible.

### Vercel

Live at <https://sendust-docs.vercel.app>. The project is connected to this
repository, so a push to `main` builds and promotes to production on its own;
other branches get preview deployments.

`vercel.json` builds with `npm run build:vercel`, which downloads the pinned
Sendust tag into `.sendust/` before syncing: a Vercel build has no sibling
repository to read. A tarball of the tag is that ref by construction, the fetch
records which ref it was in `.sendust/source.json`, and the sync refuses a
fetched tree whose recorded ref is not `SENDUST_REF`.

Vercel serves the site at the domain root, so `astro.config.mjs` drops `base`
when `VERCEL` is set and takes the canonical URL from the deployment. Override
either with `DOCS_BASE` and `DOCS_SITE`.

## Dependencies

`astro` and `@astrojs/starlight` — nothing else. Search is Starlight's built-in
Pagefind, MDX comes with Starlight (it registers `@astrojs/mdx` itself), code
blocks are Expressive Code (bundled by Starlight: copy, line numbers, titles,
tabs, highlighting), and there is no analytics, no tracking script and no
animation library. The three typefaces are self-hosted woff2 files, not a
package or a CDN.

`src/components/BuiltInTheOpen.astro` reads the creator's GitHub profile and the
repository's contributors from the public REST API **at build time**, with no
token; a rate limit or an outage falls back to the profile link rather than
breaking the page.

Pins: Node `22.23.5` (`.nvmrc`) and npm `12.2.2`, matching the Sendust
repository's toolchain baseline. Astro stays on the 5 line (`^5.18.2`);
`@astrojs/starlight` stays at `^0.37.7`, the last release whose peer range is
Astro 5 (`0.38` and later require Astro 6).
