// Starlight's `docs` content collection.
//
// The loader is explicit because the sidebar in astro.config.mjs addresses
// pages by slug: the glob loader's own ids keep the file extension
// (`guide/quick-start.md`), and a sidebar slug of `guide/quick-start` only
// resolves once the extension is stripped here.

import { defineCollection } from "astro:content";
import { docsLoader } from "@astrojs/starlight/loaders";
import { docsSchema } from "@astrojs/starlight/schema";

export const collections = {
  docs: defineCollection({
    loader: docsLoader({
      generateId: ({ entry }) => entry.replace(/\.(md|mdx|markdown|mdown|mkdn|mkd|mdwn)$/i, ""),
    }),
    schema: docsSchema(),
  }),
};
