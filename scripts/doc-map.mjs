// The one map this repository owns.
//
// Sendust's documentation lives in fandyajpo/sendust/docs and is edited there.
// This file says only which of those documents the site publishes, where each
// one lands under src/content/docs/, and how the sidebar presents it.
//
// The site is for people using the package: how to send with @sendust/ts, and
// the story of how it got here. Everything else in that repository is the
// design and evidence record, and stays in the repository (see "unpublished").
//
// scripts/sync-docs.mjs copies the files and injects the frontmatter;
// astro.config.mjs builds the sidebar from the same data. Adding a document
// means adding a line here, never editing generated Markdown.

export const REPOSITORY = {
  owner: "fandyajpo",
  name: "sendust",
  // Every build publishes the documentation of a tagged Sendust checkout.
  defaultRef: "v1.0.1",
};

export const SITE = {
  url: "https://fandyajpo.github.io",
  base: "/sendust-docs",
};

// Documents that exist upstream and are deliberately not published here.
// They are linked from the published pages, and those links point at the
// source repository at the same ref.
export const unpublished = [
  "docs/architecture/decisions/ (ADR 0001–0022: the architecture record)",
  "docs/architecture/public-api.md (the P02 contract baseline)",
  "docs/architecture/error-model.md (the P02 contract baseline)",
  "docs/guides/maintainer.md (for people working on Sendust itself)",
  "docs/releases/1.0.1.md (release engineering; the story covers the releases)",
  "docs/gates/, phases/, audits/, planning/, qa/, research/, security/, discovery/, engineering/, product/",
  "docs/README.md",
];

// Sidebar groups, in order. A page's `order` is its index inside its group.
export const groups = [
  {
    label: "start here",
    pages: ["guide/quick-start", "guide/lifecycle-limits"],
  },
  {
    label: "guides",
    pages: ["guide/addressing-mime-attachments", "guide/errors-security-operations"],
  },
  {
    label: "the lore",
    pages: ["releases/story"],
  },
];

// source: the file in the Sendust checkout. Its name must match the slug, so
// that a route never moves behind the sidebar's back.
// description: optional; used when the document's first paragraph is metadata
// (a "Status:" or "Related:" line) rather than prose.
export const pages = {
  "guide/quick-start": {
    source: "docs/guides/quick-start.md",
    label: "quick start",
  },
  "guide/lifecycle-limits": {
    source: "docs/guides/lifecycle-limits.md",
    label: "lifecycle + limits",
    description:
      "Close, concurrency, timeouts and the hard caps, with the numbers the code and the facade keep in step.",
  },
  "guide/addressing-mime-attachments": {
    source: "docs/guides/addressing-mime-attachments.md",
    label: "addresses, mime, attachments",
    description:
      "Address rules, header and MIME shape, attachment caps, and the opt-in filesystem policy.",
  },
  "guide/errors-security-operations": {
    source: "docs/guides/errors-security-operations.md",
    label: "errors, security, ops",
    description:
      "Results versus errors, the stable error codes, redaction, and what to do during a relay outage.",
  },
  "releases/story": {
    source: "docs/releases/story.md",
    label: "the sendust story",
    description:
      "How Sendust went from an empty folder to 1.0.1, which decisions it reversed on the way, and why.",
  },
};
