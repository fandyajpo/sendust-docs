import starlight from "@astrojs/starlight";
import { defineConfig } from "astro/config";

import { REPOSITORY, SITE, groups, pages } from "./scripts/doc-map.mjs";

// The sidebar is built from the same map the sync script reads, so a page's
// label, group and order are declared exactly once.
const sidebar = groups.map((group) => ({
  label: group.label,
  items: group.pages.map((slug) => ({ label: pages[slug].label, slug })),
}));

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
      customCss: ["./src/styles/sendust.css"],
      components: {
        // Adds the view-transition router and defaults the theme to dark.
        Head: "./src/components/Head.astro",
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
      head: [{ tag: "meta", attrs: { name: "color-scheme", content: "dark light" } }],
    }),
  ],
});
