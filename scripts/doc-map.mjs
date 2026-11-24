// The one map this repository owns.
//
// Sendust's documentation lives in fandyajpo/sendust/docs and is edited there.
// This file says which of those documents the site publishes, where each one
// lands under src/content/docs/, and how the sidebar presents it.
//
// scripts/sync-docs.mjs copies the files and injects the frontmatter;
// astro.config.mjs builds the sidebar from the same data. Adding a document
// means adding a line here, never editing generated Markdown.

export const REPOSITORY = {
  owner: "fandyajpo",
  name: "sendust",
  // Every build publishes the documentation of a tagged Sendust checkout.
  defaultRef: "v1.2.0",
};

export const SITE = {
  // One deployment, at the root of its domain.
  url: "https://sendust-docs.vercel.app",
  base: "",
};

// Documents that exist upstream and are deliberately not published here: the
// design and evidence record, which belongs in the repository rather than in a
// developer-facing library. Links to them become GitHub permalinks at the ref.
export const unpublished = [
  "docs/architecture/decisions/ (ADR 0001–0024)",
  "docs/architecture/public-api.md, error-model.md (P02 contract baselines)",
  "docs/architecture/system-design.md, data-flow.md, approval-matrix.md",
  "docs/releases/*.md except story.md (release engineering)",
  "docs/gates/, phases/, audits/, planning/, qa/ (except the benchmark), research/, security/, discovery/, engineering/, product/",
  "docs/README.md",
];

// Sidebar groups, in order. A page's `order` is its index inside its group.
export const groups = [
  {
    label: "Start here",
    pages: ["guide/quick-start", "guide/lifecycle-limits"],
  },
  {
    label: "Guides",
    pages: ["guide/addressing-mime-attachments", "guide/errors-security-operations"],
  },
  {
    label: "Architecture",
    pages: ["architecture/overview"],
  },
  {
    label: "Performance",
    pages: ["performance/benchmark-nodemailer"],
  },
  {
    label: "Contributing",
    pages: ["contributing/maintainer"],
  },
  {
    label: "The story",
    pages: ["releases/story"],
  },
];

// The header navigation: compact top-level entries, each collecting whole
// sidebar groups or single pages. Anything a page adds to `groups` without
// being mentioned here is appended to the last entry by src/lib/navigation.ts,
// so a new page is never unreachable from the header.
export const nav = [
  { label: "Start", groups: ["Start here"] },
  { label: "Guides", groups: ["Guides"] },
  { label: "Reference", groups: ["Architecture", "Performance", "Contributing"] },
  { label: "More", groups: ["The story"], pages: ["license"] },
];

// Pages this repository writes itself, so they have no upstream source.
export const manual = [
  { slug: "license", label: "License", summary: "MIT or Apache-2.0, your choice." },
];

// source: the file in the Sendust checkout. Its name must match the slug, so
// that a route never moves behind the sidebar's back.
// description: optional; used when the document's first paragraph is metadata
// (a "Status:" or "Related:" line) rather than prose.
export const pages = {
  "guide/quick-start": {
    source: "docs/guides/quick-start.md",
    label: "Quick start",
    // Its first paragraph is a Status line, so the nav gets its own words.
    summary: "Install, send one message, read the result.",
  },
  "guide/lifecycle-limits": {
    source: "docs/guides/lifecycle-limits.md",
    label: "Lifecycle and limits",
    description:
      "Close, concurrency, timeouts and the hard caps, with the numbers the code and the facade keep in step.",
  },
  "guide/addressing-mime-attachments": {
    source: "docs/guides/addressing-mime-attachments.md",
    label: "Addresses, MIME, attachments",
    description:
      "Address rules, header and MIME shape, attachment caps, and the opt-in filesystem policy.",
  },
  "guide/errors-security-operations": {
    source: "docs/guides/errors-security-operations.md",
    label: "Errors, security, operations",
    description:
      "Results versus errors, the stable error codes, redaction, and what to do during a relay outage.",
  },
  "architecture/overview": {
    source: "docs/architecture/overview.md",
    label: "Architecture overview",
    description:
      "The two crates, the Node-API boundary, the runtime-neutral facade, and why each responsibility sits where it does.",
  },
  "performance/benchmark-nodemailer": {
    source: "docs/qa/benchmark-nodemailer.md",
    label: "Benchmark and method",
    description:
      "The recorded relay benchmark, with the harness, configuration and measurement method it was taken with.",
  },
  "contributing/maintainer": {
    source: "docs/guides/maintainer.md",
    label: "Maintainer guide",
    description:
      "Repository layout, commands, the loopback test harness, what CI proves, and the documentation rules.",
  },
  "releases/story": {
    source: "docs/releases/story.md",
    label: "The Sendust story",
    description:
      "How Sendust went from an empty folder to 1.2.0, which decisions it reversed on the way, and why.",
  },
};
