import { groups, manual, nav, pages } from "../../scripts/doc-map.mjs";

/**
 * The two navigations, both built from `scripts/doc-map.mjs` so a label is
 * declared once:
 *
 * - `navGroups()` is the compact header: a few top-level entries, each with a
 *   dropdown of pages.
 * - `sidebarGroups()` is the docs menu, in the same order and wording as the
 *   sidebar, and is what the mobile drawer shows.
 */

export interface NavLink {
  label: string;
  href: string;
  description?: string;
}

export interface NavGroup {
  label: string;
  links: NavLink[];
}

const base = import.meta.env.BASE_URL;

function href(slug: string): string {
  return `${base}${slug}/`;
}

function link(slug: string): NavLink {
  const page = pages[slug];
  const manualPage = manual.find((entry) => entry.slug === slug);
  return {
    label: page?.label ?? manualPage?.label ?? slug,
    href: href(slug),
    description: page?.description,
  };
}

export function navGroups(): NavGroup[] {
  const byLabel = new Map(groups.map((group) => [group.label, group]));
  const used = new Set<string>();

  const entries: NavGroup[] = nav.map((entry) => {
    const links: NavLink[] = [];
    for (const label of entry.groups ?? []) {
      const group = byLabel.get(label);
      if (!group) continue;
      for (const slug of group.pages) {
        if (used.has(slug)) continue;
        used.add(slug);
        links.push(link(slug));
      }
    }
    for (const slug of entry.pages ?? []) {
      if (used.has(slug)) continue;
      used.add(slug);
      links.push(link(slug));
    }
    return { label: entry.label, links };
  });

  // Nothing mapped above is dropped: it lands in the last entry.
  const leftovers: NavLink[] = [];
  for (const group of groups) {
    for (const slug of group.pages) {
      if (used.has(slug)) continue;
      used.add(slug);
      leftovers.push(link(slug));
    }
  }
  for (const page of manual) {
    if (used.has(page.slug)) continue;
    used.add(page.slug);
    leftovers.push(link(page.slug));
  }

  if (leftovers.length > 0) {
    const last = entries[entries.length - 1];
    if (last) last.links.push(...leftovers);
    else entries.push({ label: "More", links: leftovers });
  }

  return entries.filter((entry) => entry.links.length > 0);
}

export function sidebarGroups(): NavGroup[] {
  const sections: NavGroup[] = groups.map((group) => ({
    label: group.label,
    links: group.pages.map((slug) => link(slug)),
  }));

  if (manual.length > 0) {
    sections.push({ label: "Elsewhere", links: manual.map((page) => link(page.slug)) });
  }

  return sections;
}
