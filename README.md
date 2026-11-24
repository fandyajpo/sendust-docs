# sendust-docs

The user-facing documentation site for [Sendust](https://github.com/fandyajpo/sendust):
how to use `@sendust/ts`, and the story of how it got here. An
[Astro 5](https://astro.build) + [Starlight](https://starlight.astro.build) site,
static output, TypeScript, Pagefind search, no analytics.

> **NOTICE, the source of truth is [`fandyajpo/sendust/docs`](https://github.com/fandyajpo/sendust/tree/main/docs).**
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

It does six things, in this order.

1. **Finds the checkout.** `SENDUST_PATH`, else `../sendust`, else
   `~/Documents/Personal/sendust`.
2. **Pins the ref.** `SENDUST_REF`, default `v1.3.0`. If the checkout's `HEAD` is
   not that ref, it stops with instructions and writes nothing, the site only
   ever publishes a tagged tree. Uncommitted changes under `docs/` are allowed
   but warned about.
3. **Injects frontmatter.** `title` is the document's first H1, `description` is
   its first prose paragraph (a leading `**Status:**` / `**Related:**` line is
   metadata, not prose, and is skipped; where a document opens straight into a
   heading, `scripts/doc-map.mjs` supplies the description), and `sidebar.label`
   plus `sidebar.order` come from that map.
4. **Rewrites links.** A relative link whose target is published here becomes a
   route on this site. A relative link whose target is *not* published here, a
   gate record, an audit, a QA report, a source file, `docs/README.md`, becomes
   `https://github.com/fandyajpo/sendust/blob/<ref>/…` at the same ref. Absolute
   URLs, anchors and `mailto:` links are left alone.
5. **Fails loudly on anything that would dangle.** A link with no target in the
   checkout, one that resolves outside the repository, or an anchor that names a
   heading the target page does not have, is listed with file and line and the
   script exits non-zero, before writing a single file.
6. **Normalises one piece of punctuation.** The site's voice does not use em
   dashes, so a sentence's dash becomes a comma, a heading's becomes a colon, and
   a table cell holding nothing but a dash reads "None". Words, code, links and
   claims are untouched; anchors are computed after the pass, so a link and its
   heading always agree.

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

git -C ../sendust checkout v1.3.0   # if that checkout has moved past the tag
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
config resolve), `src/lib/navigation.ts`, `src/components/` (`BuiltInTheOpen`,
`LandingHero`, `LiquidBand`, `Cards`, `Glyph`, `MothMark`, `SignalMoth`,
`SiteTitle`, `PageTitle`, `Header`, `Nav`, `NavDrawer`, `Search`, `Select`,
`SelectDropdown`, `ThemeSelect`, `Input`, `UiScripts`, `FactList`, `Head`,
`Footer`), `scripts/doc-map.mjs`, `scripts/sync-docs.mjs`,
`scripts/fetch-sendust.mjs`, `astro.config.mjs`, this README, the workflow.

Generated, gitignored, rewritten on every run: `src/content/docs/guide/`,
`releases/`, and `src/synced-docs.json` (the ref, commit and time the pages were
rendered from, which the footer displays). A directory that stops being
published, `api/`, `decisions/`, is deleted on the next sync.

## Brand and the signal moth

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
2 px), the wings open when the pointer comes within ~160 px, and a tap fires an
accent ring with three signal dots. One shared set of `document` listeners is
re-attached through `astro:page-load`, so a view transition leaves nothing
behind. It is decoration, `aria-hidden`, never focusable, never announced. Its
lantern, eyes and halo all read `--sx-glow`, so in this design they are the
accent, not the old lime.

**The components**: `Cards` (data-driven link cards with a pixel glyph), `Glyph`
(ten pixel icons on a 16-unit grid), `LiquidBand` (the statement panel, the
name is historical: it is a hairline surface on the canvas now), `LandingHero`,
`SendPath` (the six-stop rail described below), `FactList`, `SiteTitle`.
`PageTitle` drops Starlight's page title where the splash hero already supplies
the `<h1>`, one page, one `<h1>`. A group with a single page in the map is still
a plain sidebar link, a collapsible menu around one item is noise.

## Custom controls and navigation

Nothing in the chrome is a browser default. Every control is a component in
`src/components/`, sharing one behaviour layer (`UiScripts.astro`) that delegates
from the document and re-resolves its elements on `astro:page-load`, so a view
transition never orphans a listener:

- **`Input`**, a hairline field with a pixel magnifier, a clear button, a hint
  slot and a focus ring drawn as a ring, not an outline. It is the search field.
- **`Select`** and **`SelectDropdown`**, a custom single-select: trigger plus
  listbox, `aria-expanded` / `aria-activedescendant`, arrow keys, Home/End,
  Enter/Space, Escape, Tab to leave, click-outside to dismiss, and a
  `select:change` event. It is the theme picker (`ThemeSelect`), in the header and
  again in the drawer.
- **Search**, a trigger that looks like the site's own input, and a dialog with
  an `Input` that queries the Pagefind index this build produced. Results are
  rendered here, matches highlighted with an accent `mark`; the excerpt is
  stripped of every tag except `<mark>`. ⌘K / Ctrl-K opens it. Search stays in
  the browser.
- **`Nav`**, the compact desktop navigation: four top-level entries, each a
  dropdown of pages, opened by click or by hover where a real pointer exists,
  and walked with the arrow keys.
- **`NavDrawer`**, the mobile menu: the sidebar's own groups and wording in a
  drawer, opened from the burger on **every** page, including the landing page,
  which has no sidebar. Focus moves to its close button, Tab is trapped, Escape
  and the scrim close it and hand focus back to the burger, the page behind it
  does not scroll, and `<main>` and the sidebar are `inert` while it is open.
  The search dialog does the same and returns focus to the search trigger.

`src/lib/navigation.ts` is the only place that decides what those three menus
contain: `navGroups()` folds the `nav` export in `scripts/doc-map.mjs` into the
header dropdowns (anything unmentioned is appended to the last one, so a page can
never become unreachable), and `sidebarGroups()` mirrors the sidebar for the
drawer. Panels, the select menu, the search dialog and the drawer all take the
same three panel tokens, `--sx-surface`, `--sx-border`, `--sx-shadow`, so they
grade together in both palettes.

The header keeps one rhythm: every control on the right (search, GitHub, the npm
package, the theme picker) is a 36px box with the same radius, and the navigation
sits at the same gap from the brand on every page.

## Theme, form and motion

One warm canvas, two palettes. The light palette is warm paper (`#FFFDF9`),
near-black ink (`#17120C`), one ember accent (`#C2410C`) with amber (`#D97706`)
and a deeper red (`#B42318`) behind it, and a soft three-stop mesh of those
colours behind the hero. The dark palette is the same system on `#0B0907` with
the accent lifted to `#FF9046`. There is no violet on the site.

**One radius.** Every box with a corner takes `--cvx-radius` (14px): cards, code
blocks, inputs, buttons, menus, dialogs, the statement panel. Inline chips take
`--cvx-radius-xs`, half the cut, so a chip does not read as a pill. The older
`--sx-radius` and `--sx-radius-sm` point at the same token, which picks up every
legacy rule that still reads them.

**No scrollbars.** The page is a surface, not a window inside a window: every
scrollbar is hidden, for the document and for any element that scrolls, while
wheel, trackpad, touch and keyboard scrolling are untouched.

Light is the default for a first visit, and the choice is stored in
`localStorage["starlight-theme"]` where `""` means "follow the system", then
re-applied on every page load, so a view transition cannot reset it.

Type is two self-hosted families from `public/fonts/` as woff2 with
`font-display: swap`: Poppins 400/500/600/700 for display, headings, prose and
interface, and Geist Mono 400/500 for code, tables and identifiers. No
third-party font requests, no font JavaScript; only the three faces the first
screen sets are preloaded.

**The opening** (`LiquidIntro.astro`) pours three blurred pools of the accent
across the landing page, then lifts the whole sheet away: one and a half seconds,
once per session, never under `prefers-reduced-motion`. The overlay takes no
pointer events, so the page scrolls from the first frame and any interaction ends
it early.

**The journey.** Every substantial block of the landing page, and every table,
figure and code block in the guides, arrives with a short zoom (`scale(0.955)`
to `1`, 620ms, once), and the hero scales down by 5% and fades as it leaves the
top of the viewport. Blocks start where JavaScript puts them, so a visitor whose
module never runs sees a finished page.

**The journey of one send** (`SendPath.astro`) is the one place a reader can
step through instead of reading: six stops from `createTransport` to the relay's
answer. The line is drawn by the stops themselves, so it needs no measuring;
each segment above a stop belongs to that stop, and choosing one fills the
segments behind it. A stop opens the stage's own text, arrow keys walk the rail,
and **Walk the run** steps through all six. Everything in it comes from the
lifecycle guide and the architecture overview: the budgets, the caps, the queue,
the crates and the SMTP sequence. The stages are buttons and panels, so the
first one is open in the markup and the section works without JavaScript.

Micro-interactions are transform, opacity and colour only, at 120–200 ms: link
underlines that saturate, cards that lift 1px, the accent hairline under the
header, the brand mark tilting, and a tap that settles a card.

Motion happens in two places, on purpose. **CSS** owns what needs no sequencing:
the liquid opening, the headline's line reveal, the rotating word with its accent
sweep (12 s), the moth's idle (3–7 s), hover and press. **Motion** owns what CSS
cannot express: the reading line under the header (`scroll()` + `clamp()`), the
hero's exit zoom, and the entry zoom of each block (`inView()` + `animate()`).

The layer is additive. Nothing is hidden unless the module has booted and put the
element in its own starting state, so a reduced-motion visitor, or anyone whose
module never loads, sees a complete static page. Under
`prefers-reduced-motion: reduce` every CSS animation and transition is off too:
the opening is skipped, the headline is simply there, and the moth is a static
drawing.

The voice on authored pages is editorial and plain, and it does not use em
dashes; the sync normalises them in the pages it copies, so the published text
reads the same way.

## Deployment

Vercel builds and serves the site at <https://sendust-docs.vercel.app>. The
project is connected to this repository, so a push to `main` builds and promotes
to production on its own; other branches get preview deployments.

`vercel.json` builds with `npm run build:vercel`, which downloads the pinned
Sendust tag into `.sendust/` before syncing: a Vercel build has no sibling
repository to read. A tarball of the tag is that ref by construction, the fetch
records which ref it was in `.sendust/source.json`, and the sync refuses a
fetched tree whose recorded ref is not `SENDUST_REF`.

The site is served at the root of its domain, so `base` is empty. `DOCS_SITE`
overrides the canonical URL and `DOCS_BASE` the base if the site ever moves under
a path.

There is no GitHub Pages workflow. The site has one deployment, and one place to
look when it is down.

## Dependencies

`astro`, `@astrojs/starlight` and `motion`, nothing else. Search is Pagefind
(built in), MDX comes with Starlight (it registers `@astrojs/mdx` itself), code
blocks are Expressive Code (bundled by Starlight: copy, line numbers, titles,
tabs, highlighting), and there is no analytics, no tracking script and no icon or
UI kit. The three typefaces are self-hosted woff2 files, not a package or a CDN.

`motion` (motion.dev, v14) is the one animation dependency, and it is imported by
the motion layer in `src/components/UiScripts.astro` only, so the bundle carries
the calls in use, `scroll`, `inView`, `stagger`, `animate`, `clamp`, not the
whole library.

`src/components/BuiltInTheOpen.astro` reads the creator's GitHub profile and the
repository's contributors from the public REST API **at build time**, with no
token; a rate limit or an outage falls back to the profile link rather than
breaking the page.

Pins: Node `22.23.5` (`.nvmrc`) and npm `12.2.2`, matching the Sendust
repository's toolchain baseline. Astro stays on the 5 line (`^5.18.2`);
`@astrojs/starlight` stays at `^0.37.7`, the last release whose peer range is
Astro 5 (`0.38` and later require Astro 6).
