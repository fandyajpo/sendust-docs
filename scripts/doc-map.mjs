// The one map this repository owns.
//
// Sendust's documentation lives in fandyajpo/sendust/docs and is edited there.
// This file says only which of those documents the site publishes, where each
// one lands under src/content/docs/, and how the sidebar presents it.
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

// Sidebar groups, in order. A page's `order` is its index inside its group.
export const groups = [
  {
    label: "Start here",
    pages: ["guide/quick-start", "guide/lifecycle-limits"],
  },
  {
    label: "Guides",
    pages: [
      "guide/addressing-mime-attachments",
      "guide/errors-security-operations",
      "guide/maintainer",
    ],
  },
  {
    label: "API",
    pages: ["api/public-api", "api/error-model"],
  },
  {
    label: "Decisions",
    pages: [
      "decisions/0001-two-crates",
      "decisions/0002-lettre-over-custom-smtp",
      "decisions/0003-tls-rustls-ring-webpki",
      "decisions/0004-napi-async-tokio",
      "decisions/0005-recipient-partial-failure",
      "decisions/0006-lifecycle-single-send",
      "decisions/0007-timeout-budgets",
      "decisions/0008-owned-memory",
      "decisions/0009-hard-caps",
      "decisions/0010-mime-composition",
      "decisions/0011-platform-distribution",
      "decisions/0012-module-formats",
      "decisions/0013-error-taxonomy",
      "decisions/0014-attachment-filesystem-policy",
      "decisions/0015-multi-runtime-support",
      "decisions/0016-modular-monolith",
      "decisions/0017-native-smtp-engine",
      "decisions/0018-public-trust-anchor",
      "decisions/0019-installable-typescript-package",
      "decisions/0020-per-platform-native-packages",
      "decisions/0021-autonomous-delivery-engine",
      "decisions/0022-session-reuse",
    ],
  },
  {
    label: "Releases",
    pages: ["releases/story", "releases/1.0.1"],
  },
];

// source: the file in the Sendust checkout. Its name must match the slug, so
// that a route never moves behind the sidebar's back.
// description: optional; used when the document's first paragraph is metadata
// (a "Status:" or "Related:" line) rather than prose.
export const pages = {
  "guide/quick-start": {
    source: "docs/guides/quick-start.md",
    label: "Quick start",
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
  "guide/maintainer": {
    source: "docs/guides/maintainer.md",
    label: "Maintainer guide",
    description:
      "Repository layout, commands, the loopback test harness, what CI proves, and the documentation rules.",
  },
  "api/public-api": {
    source: "docs/architecture/public-api.md",
    label: "Public API",
    description:
      "Transport options, the message shape, results, close, state, and the delivery-management defaults.",
  },
  "api/error-model": {
    source: "docs/architecture/error-model.md",
    label: "Error model",
    description:
      "The normative error model: outcome semantics, the stable code catalog, redaction and error precedence.",
  },
  "decisions/0001-two-crates": {
    source: "docs/architecture/decisions/0001-two-crates.md",
    label: "ADR 0001 · Two crates",
  },
  "decisions/0002-lettre-over-custom-smtp": {
    source: "docs/architecture/decisions/0002-lettre-over-custom-smtp.md",
    label: "ADR 0002 · lettre for SMTP",
  },
  "decisions/0003-tls-rustls-ring-webpki": {
    source: "docs/architecture/decisions/0003-tls-rustls-ring-webpki.md",
    label: "ADR 0003 · rustls, ring, webpki",
  },
  "decisions/0004-napi-async-tokio": {
    source: "docs/architecture/decisions/0004-napi-async-tokio.md",
    label: "ADR 0004 · napi-rs async on Tokio",
  },
  "decisions/0005-recipient-partial-failure": {
    source: "docs/architecture/decisions/0005-recipient-partial-failure.md",
    label: "ADR 0005 · Partial failure",
  },
  "decisions/0006-lifecycle-single-send": {
    source: "docs/architecture/decisions/0006-lifecycle-single-send.md",
    label: "ADR 0006 · One send, bounded close",
  },
  "decisions/0007-timeout-budgets": {
    source: "docs/architecture/decisions/0007-timeout-budgets.md",
    label: "ADR 0007 · Timeout budgets",
  },
  "decisions/0008-owned-memory": {
    source: "docs/architecture/decisions/0008-owned-memory.md",
    label: "ADR 0008 · Owned memory",
  },
  "decisions/0009-hard-caps": {
    source: "docs/architecture/decisions/0009-hard-caps.md",
    label: "ADR 0009 · Hard caps",
  },
  "decisions/0010-mime-composition": {
    source: "docs/architecture/decisions/0010-mime-composition.md",
    label: "ADR 0010 · MIME composition",
  },
  "decisions/0011-platform-distribution": {
    source: "docs/architecture/decisions/0011-platform-distribution.md",
    label: "ADR 0011 · Platform packages",
  },
  "decisions/0012-module-formats": {
    source: "docs/architecture/decisions/0012-module-formats.md",
    label: "ADR 0012 · ESM and CommonJS",
  },
  "decisions/0013-error-taxonomy": {
    source: "docs/architecture/decisions/0013-error-taxonomy.md",
    label: "ADR 0013 · Error taxonomy",
  },
  "decisions/0014-attachment-filesystem-policy": {
    source: "docs/architecture/decisions/0014-attachment-filesystem-policy.md",
    label: "ADR 0014 · Attachment files",
  },
  "decisions/0015-multi-runtime-support": {
    source: "docs/architecture/decisions/0015-multi-runtime-support.md",
    label: "ADR 0015 · Multi-runtime",
  },
  "decisions/0016-modular-monolith": {
    source: "docs/architecture/decisions/0016-modular-monolith.md",
    label: "ADR 0016 · Modular monolith",
  },
  "decisions/0017-native-smtp-engine": {
    source: "docs/architecture/decisions/0017-native-smtp-engine.md",
    label: "ADR 0017 · Own SMTP engine",
  },
  "decisions/0018-public-trust-anchor": {
    source: "docs/architecture/decisions/0018-public-trust-anchor.md",
    label: "ADR 0018 · Trust anchor",
  },
  "decisions/0019-installable-typescript-package": {
    source: "docs/architecture/decisions/0019-installable-typescript-package.md",
    label: "ADR 0019 · Installable package",
  },
  "decisions/0020-per-platform-native-packages": {
    source: "docs/architecture/decisions/0020-per-platform-native-packages.md",
    label: "ADR 0020 · Platform builds",
  },
  "decisions/0021-autonomous-delivery-engine": {
    source: "docs/architecture/decisions/0021-autonomous-delivery-engine.md",
    label: "ADR 0021 · Delivery engine",
  },
  "decisions/0022-session-reuse": {
    source: "docs/architecture/decisions/0022-session-reuse.md",
    label: "ADR 0022 · Session reuse",
  },
  "releases/story": {
    source: "docs/releases/story.md",
    label: "The Sendust story",
    description:
      "How Sendust went from an empty folder to 1.0.1, which decisions it reversed on the way, and why.",
  },
  "releases/1.0.1": {
    source: "docs/releases/1.0.1.md",
    label: "1.0.1 release notes",
  },
};
