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
| `docs/releases/story.md` | `src/content/docs/releases/` | The story |

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

Authored: `src/content/docs/index.mdx` (the landing page), `src/styles/sendust.css`,
`src/content.config.ts` (Starlight's `docs` collection, with extension-less ids so
the sidebar slugs in the config resolve), `src/components/Head.astro` (the router
and the dark default), `src/components/Footer.astro` (the provenance line),
`scripts/doc-map.mjs`, `scripts/sync-docs.mjs`, `astro.config.mjs`, this README,
the workflow.

Generated, gitignored, rewritten on every run: `src/content/docs/guide/`,
`releases/`, and `src/synced-docs.json` (the ref, commit and time the pages were
rendered from, which the footer displays). A directory that stops being
published — `api/`, `decisions/` — is deleted on the next sync.

## Theme and motion

Dark first: a near-black page, off-white text, one sand accent, tabular numbers
in tables, generous line-height. Both palettes are defined, so the theme toggle
still works, but a first visit lands on dark.

Motion is quiet and never layout: Astro's `ClientRouter` for client-side
navigation, a 200 ms fade-and-rise when the page content mounts, and 120–200 ms
hovers on links, sidebar items and cards. Nothing runs longer than 250 ms, and
every effect is switched off under `prefers-reduced-motion: reduce`.

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
Pagefind, MDX support comes with Starlight (it registers `@astrojs/mdx` itself),
and there is no analytics, no tracking script and no web font.

Pins: Node `22.23.5` (`.nvmrc`) and npm `12.2.2`, matching the Sendust
repository's toolchain baseline. Astro stays on the 5 line (`^5.18.2`);
`@astrojs/starlight` stays at `^0.37.7`, the last release whose peer range is
Astro 5 (`0.38` and later require Astro 6).
