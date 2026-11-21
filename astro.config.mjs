import starlight from "@astrojs/starlight";
import { defineConfig } from "astro/config";

import { REPOSITORY, SITE, groups, manual, pages } from "./scripts/doc-map.mjs";

// The sidebar is built from the same map the sync script reads, so a page's
// label, group and order are declared exactly once. A group with a single page
// is rendered as a plain link: a collapsible menu around one item is noise.
const sidebar = groups.flatMap((group) =>
  group.pages.length === 1
    ? [{ label: pages[group.pages[0]].label, slug: group.pages[0] }]
    : [
        {
          label: group.label,
          items: group.pages.map((slug) => ({ label: pages[slug].label, slug })),
        },
      ],
);

// Pages this repository writes itself.
for (const page of manual) {
  sidebar.push({ label: page.label, slug: page.slug });
}

// GitHub Pages serves this repository under SITE.base; Vercel serves it at the
// domain root. Both the canonical URL and the base are overridable per host.
const vercelHost =
  process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim() || process.env.VERCEL_URL?.trim();
const site = process.env.DOCS_SITE?.trim() || (vercelHost ? `https://${vercelHost}` : SITE.url);
const configuredBase = process.env.DOCS_BASE?.trim() ?? (process.env.VERCEL ? "" : SITE.base);
const base = configuredBase === "/" ? "" : configuredBase;

export default defineConfig({
  site,
  ...(base ? { base } : {}),
  trailingSlash: "always",
  integrations: [
    starlight({
      title: "Sendust",
      description:
        "Documentation for Sendust: a Rust SMTP delivery engine with a Node-API binding and a TypeScript facade for Node.js, Bun and Deno.",
      customCss: ["./src/styles/fonts.css", "./src/styles/sendust.css"],
      components: {
        // Adds the view-transition router, font preloads and the theme meta.
        Head: "./src/components/Head.astro",
        // Brand, compact nav with dropdowns, custom search, theme select and
        // the mobile drawer.
        Header: "./src/components/Header.astro",
        // The pixel moth and the wordmark in the header.
        SiteTitle: "./src/components/SiteTitle.astro",
        // A search dialog built here, over this build's Pagefind index.
        Search: "./src/components/Search.astro",
        // The theme picker as a custom select, not a native <select>.
        ThemeSelect: "./src/components/ThemeSelect.astro",
        // No page title where the splash hero already supplies the <h1>.
        PageTitle: "./src/components/PageTitle.astro",
        // States, on every page, which Sendust ref it was rendered from.
        Footer: "./src/components/Footer.astro",
      },
      sidebar,
      social: [
        {
          icon: "github",
          label: "GitHub",
          href: `https://github.com/${REPOSITORY.owner}/${REPOSITORY.name}`,
        },
      ],
      pagination: true,
      tableOfContents: { minHeadingLevel: 2, maxHeadingLevel: 3 },
      // Dark code blocks in both themes: the code surface is obsidian on purpose.
      expressiveCode: { themes: ["github-dark", "github-dark"] },
      head: [{ tag: "meta", attrs: { name: "color-scheme", content: "dark light" } }],
    }),
  ],
});
